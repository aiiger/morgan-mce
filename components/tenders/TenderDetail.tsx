
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, Loader2, Lock, CheckCircle2, Layers, FileText, Sparkles, Brain } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Watermark } from '../Watermark';
import { TenderIntakeWizard } from './TenderIntakeWizard';
import { TenderChecklistTracker } from './TenderChecklistTracker';
import { CommsLog } from './CommsLog';
import { RequirementsChecklist } from './RequirementsChecklist';
import { supabase } from '../../lib/supabase';
import { useUserTier } from '../../hooks/useUserTier';
import { GlassButton } from '../ui/GlassButton';
import { useToast } from '@/lib/toast-context';

interface TenderDetailProps {
   tender: any;
   onBack: () => void;
}

export const TenderDetail: React.FC<TenderDetailProps> = ({ tender, onBack }) => {
   const [showWizard, setShowWizard] = useState(false);
   const [hasChecklist, setHasChecklist] = useState(false);
   const [checking, setChecking] = useState(true);
   const [resetting, setResetting] = useState(false);
   const [showMatrix, setShowMatrix] = useState(false);
   const [initialTemplate, setInitialTemplate] = useState<string | undefined>(undefined);
   const [commsEvents, setCommsEvents] = useState<any[]>([]);
   const [requirements, setRequirements] = useState<any[]>([]);
   const [isExtracting, setIsExtracting] = useState(false);
   const [progress, setProgress] = useState(0);

   const { hasPermission } = useUserTier();
   const toast = useToast();
   const { user } = useUser();
   const isManager = hasPermission('L3');

   useEffect(() => {
      if (!tender?.id) return;
      const checkRequirementsAndFetchComms = async () => {
         setChecking(true);
         try {
            const { count: totalCount } = await (supabase.from('tasks' as any) as any).select('*', { count: 'exact', head: true }).eq('tender_id', tender.id);
            const { count: completedCount } = await (supabase.from('tasks' as any) as any).select('*', { count: 'exact', head: true }).eq('tender_id', tender.id).eq('status', 'completed');

            setHasChecklist(totalCount && totalCount > 0);
            if (totalCount && totalCount > 0) {
               setShowMatrix(true);
               setProgress(Math.round(((completedCount || 0) / (totalCount || 1)) * 100));
            }

            const { data: commsData, error: commsError } = await (supabase.from('tender_comms_events' as any) as any).select('*').eq('tender_id', tender.id).order('event_at', { ascending: false });
            if (commsError) throw commsError;
            setCommsEvents(commsData || []);
         } catch (err) {
            console.error('Failed to fetch tender details:', err);
         } finally {
            setChecking(false);
         }
      };
      checkRequirementsAndFetchComms();
   }, [tender?.id]);

   const handleAddComms = async (newEvent: any) => {
      const userId = user?.id ?? 'unknown';
      const payload = { tender_id: tender.id, logged_by_user_id: userId, event_at: new Date().toISOString(), ...newEvent };
      // Optimistic update
      const optimistic = { id: new Date().toISOString(), ...payload };
      setCommsEvents(prev => [optimistic, ...prev]);
      // Persist to Supabase
      const { error } = await (supabase.from('tender_comms_events' as any) as any).insert(payload);
      if (error) {
         console.error('Failed to save comms event:', error);
         toast.error('Comms Save Failed', error.message);
         // Roll back
         setCommsEvents(prev => prev.filter(e => e.id !== optimistic.id));
      }
   };

   const handleExtractRequirements = async () => {
      if (!tender?.id) return;
      setIsExtracting(true);
      try {
         const res = await fetch(`/api/documents/${tender.id}/extract-requirements`, { method: 'POST' });
         if (!res.ok) throw new Error('Extraction failed');
         const data = await res.json();
         setRequirements(data.requirements ?? []);
      } catch (error) {
         console.error('Extraction failed', error);
         toast.error('Extraction Failed', 'Could not extract requirements from document.');
      } finally {
         setIsExtracting(false);
      }
   };

   const handleSyncToRegistry = async () => {
      if (requirements.length === 0) return;
      setResetting(true);
      try {
         for (const req of requirements) {
            await (supabase.from('tasks' as any) as any).insert({
               tender_id: tender.id,
               title: req.text,
               section_name: req.area,
               is_mandatory: req.is_mandatory,
               status: 'pending'
            });
         }
         toast.success('Registry Synced', 'Requirements synchronized with Project Registry.');
         setHasChecklist(true);
         setShowMatrix(true);
         // Refresh progress
         const { count: totalCount } = await (supabase.from('tasks' as any) as any).select('*', { count: 'exact', head: true }).eq('tender_id', tender.id);
         const { count: completedCount } = await (supabase.from('tasks' as any) as any).select('*', { count: 'exact', head: true }).eq('tender_id', tender.id).eq('status', 'completed');
         setProgress(Math.round(((completedCount || 0) / (totalCount || 1)) * 100));
      } catch (err) {
         console.error('Sync failed:', err);
      } finally {
         setResetting(false);
      }
   };

   const handleReset = async () => {
      if (!window.confirm('Reset checklist?')) return;
      setResetting(true);
      try {
         await (supabase as any).rpc('reset_tender_checklist', { target_tender_id: tender.id });
         setHasChecklist(false);
         setShowMatrix(false);
      } catch (err: any) {
         toast.error('Reset Failed', err.message);
      } finally {
         setResetting(false);
      }
   };

   const handleStartWizard = (templateId?: string) => {
      setInitialTemplate(templateId);
      setShowWizard(true);
   };

   if (!tender) return <div>Tender not found.</div>;
   if (checking) return <Loader2 className="animate-spin" />;

   return (
      <div className="space-y-8 animate-fade-in pb-10 font-sans relative min-h-screen">
         <Watermark />
         <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-6">
               <button onClick={onBack} className="p-2 bg-gray-50 border border-gray-200 rounded-xl"><ArrowLeft size={18} /></button>
               <div>
                  <h1 className="text-2xl font-bold italic text-gray-900 tracking-widest uppercase">{tender.title}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                     <span className="text-caption font-bold text-gray-500 uppercase tracking-widest">{tender.client}</span>
                     <span className="w-1 h-1 bg-white/20 rounded-full" />
                     <span className="text-caption font-bold text-blue-600 uppercase tracking-widest">{tender.status}</span>
                     {tender.priority && (
                        <>
                           <span className="w-1 h-1 bg-white/20 rounded-full" />
                           <span className={`text-caption font-bold uppercase tracking-widest ${tender.priority === 'Critical' ? 'text-critical' : 'text-gray-500'}`}>
                              Priority: {tender.priority}
                           </span>
                        </>
                     )}
                  </div>
               </div>
            </div>
            {/* Neural RAG Status Indicator */}
            <div className="flex items-center gap-4 bg-gray-50 border border-blue-100 rounded-2xl px-6 py-3 backdrop-blur-xl">
               <div className="relative">
                  <Brain size={20} className="text-blue-600 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full " />
               </div>
               <div>
                  <div className="text-caption font-bold text-gray-500 uppercase tracking-[0.2em] mb-0.5">Neural Registry</div>
                  <div className="flex items-center gap-1.5">
                     <span className="text-caption font-bold text-gray-900 uppercase tracking-wider">RAG_HEALTH_OPTIMAL</span>
                     <span className="w-1 h-1 bg-white/20 rounded-full" />
                     <span className="text-caption font-mono text-emerald-400">98.2%</span>
                  </div>
               </div>
            </div>
            <div className="flex-1 max-w-md px-10">
               <div className="flex justify-between items-center mb-1">
                  <span className="text-caption font-bold text-gray-500 uppercase tracking-[0.2em]">Laser Progress</span>
                  <span className="text-caption font-mono text-blue-600 font-bold">{progress}%</span>
               </div>
               <div className="h-[2px] w-full bg-gray-50 rounded-full overflow-hidden relative ">
                  <div
                     className="absolute top-0 left-0 h-full bg-blue-600  transition-all duration-1000 ease-out"
                     style={{ width: `${progress}%` }}
                  >
                     <div className="absolute top-0 right-0 w-[20px] h-full bg-white shadow-[0_0_15px_var(--white)] blur-[1px]" />
                  </div>
               </div>
            </div>
            <div className="flex items-center space-x-4">
               {tender.lead_source && (
                  <div className="text-right">
                     <div className="text-gov-label font-bold text-gray-500 uppercase tracking-widest">Source</div>
                     <div className="text-gov-label font-bold text-gray-900 italic">{tender.lead_source}</div>
                  </div>
               )}
               {tender.expected_close_date && (
                  <div className="text-right">
                     <div className="text-gov-label font-bold text-gray-500 uppercase tracking-widest">Expected Close</div>
                     <div className="text-gov-label font-bold text-blue-600 italic">{tender.expected_close_date}</div>
                  </div>
               )}
               {showMatrix && <GlassButton variant="secondary" onClick={() => setShowMatrix(false)}>Return to Setup</GlassButton>}
            </div>
         </div>

         {!showMatrix ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                     {!hasChecklist ? (
                        <div className="text-center space-y-6 relative z-10">
                           <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                              <Wand2 size={32} className="text-blue-600" />
                           </div>
                           <h2 className="text-3xl font-bold italic text-gray-900 tracking-widest font-brand">INTAKE CALIBRATION REQUIRED</h2>
                           <p className="text-gray-500 text-sm max-w-md mx-auto">This opportunity has not yet been initialized within the VeroPM framework. Run the calibration wizard to establish deterministic milestones.</p>
                           <GlassButton onClick={() => handleStartWizard()} variant="primary" className="px-8 py-6 shadow-sm hover:shadow-sm border-blue-200">
                              Initialize Calibration
                           </GlassButton>
                        </div>
                     ) : (
                        <div className="text-center space-y-6 relative z-10">
                           <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 size={32} className="text-blue-600" />
                           </div>
                           <h2 className="text-3xl font-bold italic text-gray-900 tracking-widest font-brand">PROJECT REGISTRY SYNCHRONIZED</h2>
                           <p className="text-gray-500 text-sm max-w-md mx-auto">VeroPM data structures are active. All tender requirements and compliance checks are ready for verification.</p>
                           <GlassButton onClick={() => setShowMatrix(true)} variant="primary" className="px-8 py-6">
                              Open Requirement Matrix
                           </GlassButton>
                        </div>
                     )}
                  </div>
                  <div className="space-y-4">
                     <div className="p-1 bg-gradient-to-r from-transparent via-blue-50 to-transparent rounded-lg mb-4">
                        <GlassButton onClick={handleExtractRequirements} disabled={isExtracting} className="w-full justify-center py-4 bg-gray-50 border-blue-200 hover:border-blue-300">
                           {isExtracting ? (
                              <div className="flex items-center space-x-3">
                                 <Loader2 className="animate-spin text-blue-600" size={18} />
                                 <span className="text-caption font-bold italic tracking-[0.3em] text-blue-600">NEURAL_VAULT_ANALYSIS_IN_PROGRESS...</span>
                              </div>
                           ) : (
                              <div className="flex items-center space-x-3">
                                 <Sparkles size={18} className="text-blue-600" />
                                 <span className="text-caption font-bold italic tracking-[0.3em]">INITIATE_RAG_EXTRACTION</span>
                              </div>
                           )}
                        </GlassButton>
                     </div>

                     {requirements.length > 0 && (
                        <div className="animate-fade-in space-y-4">
                           <RequirementsChecklist requirements={requirements} />
                           <GlassButton onClick={handleSyncToRegistry} variant="primary" className="w-full py-4 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                              <Layers size={18} className="mr-3" />
                              <span className="text-caption font-bold italic tracking-[0.3em]">SYNCHRONIZE_TO_PROJECT_REGISTRY</span>
                           </GlassButton>
                        </div>
                     )}
                  </div>
               </div>
               <div className="lg:col-span-1">
                  <CommsLog tenderId={tender.id} commsEvents={commsEvents} onAddComms={handleAddComms} />
               </div>
            </div>
         ) : (
            <TenderChecklistTracker tenderId={tender.id} />
         )}

         {showWizard && (
            <TenderIntakeWizard
               tenderId={tender.id}
               initialTemplate={initialTemplate}
               onComplete={() => { setShowWizard(false); setHasChecklist(true); setShowMatrix(true); }}
               onCancel={() => setShowWizard(false)}
            />
         )}
      </div>
   );
};
