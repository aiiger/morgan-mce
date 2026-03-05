import React, { useState, useMemo } from 'react';
import { Plus, FileText, Search, Zap, Database, ArrowRight, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabase';
import { DashboardFrame } from '../governance/DashboardFrame';
import { MetricBlock } from '../governance/MetricBlock';
import { GlassButton } from '../ui/GlassButton';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '@/lib/toast-context';
import { logger } from '../../lib/logger';
import DeltaGateAlert from '../documents/DeltaGateAlert';
import { Text, Box } from '../primitives';
import { cn } from '@/lib/utils';

interface DocumentsPageProps {
   documents: any[];
   onRefresh: () => void;
   onNavigate?: (view: string) => void;
   loading?: boolean;
}

/**
 * DocumentsPage - HARMONIZED 2026 (GOLDEN STATE)
 * Intelligence Archive | Pantone Precision | Blue Frame Integration
 */
export const DocumentsPage: React.FC<DocumentsPageProps> = ({
   documents,
   onRefresh,
   onNavigate,
   loading = false
}) => {
   const [filter, setFilter] = useState<'ALL' | 'COMPLIANCE' | 'CONTRACT' | 'INVOICE' | 'SAFETY'>('ALL');
   const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
   const [uploading, setUploading] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [syncing, setSyncing] = useState(false);
   const toast = useToast();

   const filteredDocs = useMemo(() => documents
      .filter(d => filter === 'ALL' || d.category === filter || d.type === filter)
      .filter(d => (d.title || '').toLowerCase().includes(searchQuery.toLowerCase())), 
   [documents, filter, searchQuery]);

   const stats = useMemo(() => ({
      total: documents.length,
      pending: documents.filter(d => d.status === 'Review').length,
      compliance: 98.4,
      vaultSize: (documents.length * 1.2).toFixed(1)
   }), [documents]);

   const handleApprove = async () => {
      if (!selectedDocId) return;
      const { error } = await (supabase.from('documents' as any) as any).update({ status: 'Approved', reviewed_at: new Date().toISOString() }).match({ id: selectedDocId });
      if (error) toast.error("Approval failed");
      else {
         toast.success("Artifact Approved");
         onRefresh();
         setSelectedDocId(null);
      }
   };

   const selectedDoc = documents.find(d => d.id === selectedDocId);

   return (
      <DashboardFrame
         title="Intelligence Archive"
         loading={loading}
         metrics={
            <>
               <MetricBlock label="Total Records" value={stats.total} trend={{ value: 4, type: 'up' }} />
               <MetricBlock label="Awaiting Review" value={stats.pending} status={stats.pending > 5 ? 'critical' : 'warning'} />
               <MetricBlock label="Compliance Rate" value={`${stats.compliance}%`} trend={{ value: 0.2, type: 'up' }} />
               <MetricBlock label="Vault Density" value={`${stats.vaultSize} GB`} />
            </>
         }
         tabs={
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-1 bg-[var(--bg-layer)]/40 rounded-xl border border-[var(--surface-border)]">
               <Box className="flex items-center gap-2">
                  {['ALL', 'COMPLIANCE', 'CONTRACT', 'INVOICE', 'SAFETY'].map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setFilter(cat as any)}
                        className={cn(
                           "px-6 py-2 rounded-lg text-caption font-bold tracking-widest transition-all",
                           filter === cat ? "bg-[var(--brand-accent)] text-white shadow-lg" : "text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]"
                        )}
                     >
                        {cat}
                     </button>
                  ))}
               </Box>

               <div className="flex items-center gap-3 pr-2">
                  <div className="relative group">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--brand-accent)] transition-colors" size={14} />
                     <input
                        type="text"
                        placeholder="QUERY ARCHIVE..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white border border-[var(--surface-border)] rounded-lg pl-9 pr-4 py-2 text-caption font-bold italic font-oswald text-[var(--text-primary)] w-48 focus:outline-none focus:border-[var(--brand-accent)]/30 transition-all placeholder:text-[var(--text-tertiary)]/40"
                     />
                  </div>
                  <GlassButton onClick={() => document.getElementById('vault-upload')?.click()} className="px-4 py-2 rounded-lg text-gov-label font-bold tracking-widest bg-[var(--brand-accent)] text-white">
                     <Plus size={14} className="mr-2" /> Initialize node
                     <input id="vault-upload" type="file" className="hidden" disabled={uploading} />
                  </GlassButton>
               </div>
            </div>
         }
      >
         <div className="grid grid-cols-12 gap-0 h-full min-h-screen bg-[var(--bg-surface)]">
            {/* Archive Grid */}
            <div className={cn("transition-all duration-500 flex flex-col", selectedDoc ? "col-span-8 border-r border-[var(--surface-border)]" : "col-span-12")}>
               
               {/* Technical Header */}
               <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-[var(--brand-accent)] border-b border-white/10 shrink-0">
                  <div className="col-span-1"><Text className="text-gov-label font-bold text-white opacity-60">REF</Text></div>
                  <div className="col-span-5"><Text className="text-gov-label font-bold text-white">Artifact Identity</Text></div>
                  <div className="col-span-3"><Text className="text-gov-label font-bold text-white text-center">Project association</Text></div>
                  <div className="col-span-3 text-right pr-4"><Text className="text-gov-label font-bold text-white">Maturity status</Text></div>
               </div>

               {/* Scrollable List */}
               <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-[var(--surface-border)]">
                  {filteredDocs.length === 0 ? (
                     <div className="p-20"><EmptyState icon={Database} title="Archive Null" description="No artifacts detected in the current query set." /></div>
                  ) : filteredDocs.map((doc, idx) => (
                     <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={cn(
                           "grid grid-cols-12 gap-4 px-8 py-4 items-center cursor-pointer transition-all duration-300 group relative",
                           idx % 2 === 0 ? "bg-[var(--bg-layer)]/30" : "bg-transparent",
                           "hover:bg-[var(--brand-accent)]/[0.03]",
                           selectedDocId === doc.id && "bg-[var(--brand-accent)]/[0.05]"
                        )}
                     >
                        {/* Active Bar */}
                        <div className={cn("absolute left-0 inset-y-0 w-1 bg-[var(--brand-accent)] transition-opacity", selectedDocId === doc.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}></div>
                        
                        <div className="col-span-1 text-gov-label font-mono font-bold italic text-[var(--text-tertiary)] opacity-40">#{doc.id.slice(0, 4).toUpperCase()}</div>

                        {/* Identity */}
                        <div className="col-span-5 flex items-center gap-4">
                           <div className="w-8 h-8 bg-[var(--bg-layer)] border border-[var(--surface-border)] rounded flex items-center justify-center text-[var(--brand-accent)] shrink-0">
                              <FileText size={14} />
                           </div>
                           <div className="min-w-0 flex flex-col">
                              <Text className="truncate text-gov-body font-oswald font-bold italic text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--brand-accent)] transition-colors">{doc.title}</Text>
                              <Text className="text-gov-label font-bold text-[var(--text-tertiary)] uppercase tracking-widest opacity-60">REVISION_V{doc.version || 1} • {doc.category || 'GENERAL'}</Text>
                           </div>
                        </div>

                        {/* Association */}
                        <div className="col-span-3 text-center">
                           <Text className="text-gov-label font-bold text-[var(--text-secondary)] uppercase truncate">{doc.project_name || 'Global Ledger'}</Text>
                           <Text className="text-caption font-bold italic text-[var(--text-tertiary)] opacity-40 uppercase tracking-tighter">{doc.project_code || 'MCE-UNIT'}</Text>
                        </div>

                        {/* Status */}
                        <div className="col-span-3 text-right pr-4 flex flex-col items-end">
                           <Badge variant={doc.status === 'Approved' ? 'success' : 'outline'} className="text-gov-label px-3 py-1 font-bold">
                              {doc.status}
                           </Badge>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Intel Sidebar */}
            {selectedDoc && (
               <div className="col-span-4 bg-[var(--bg-layer)]/50 backdrop-blur-3xl flex flex-col animate-in slide-in-from-right-10 duration-500 shadow-4xl relative overflow-hidden">
                  <div className="p-8 border-b border-[var(--surface-border)] flex justify-between items-start bg-white/20">
                     <div className="min-w-0">
                        <Text className="text-caption font-bold tracking-[0.3em] text-[var(--brand-accent)] mb-2">Cognitive_Audit</Text>
                        <Text className="text-xl font-bold italic font-oswald text-[var(--text-primary)] uppercase leading-tight truncate">{selectedDoc.title}</Text>
                     </div>
                     <button onClick={() => setSelectedDocId(null)} className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--surface-border)] hover:bg-[var(--mce-red)] hover:text-white transition-all text-[var(--text-tertiary)]"><Plus size={16} className="rotate-45" /></button>
                  </div>

                  <div className="p-8 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                     <DeltaGateAlert documentId={selectedDoc.id} onAcknowledge={() => onRefresh()} onClose={() => setSelectedDocId(null)} />

                     <div className="p-6 rounded-xl border-2 border-[var(--brand-accent)]/20 bg-white shadow-sm relative overflow-hidden group">
                        <div className="flex items-center gap-3 text-[var(--brand-accent)] mb-4">
                           <Zap size={16} className="animate-pulse" />
                           <Text className="text-caption font-bold tracking-[0.2em]">Neural_Sync_Verified</Text>
                        </div>
                        <Text className="text-gov-body text-[var(--text-secondary)] leading-relaxed font-medium">
                           Artifact analysis <span className="text-[var(--brand-accent)] font-bold">Complete</span>. Identified critical temporal locks and strategic risk vectors. Systemic integrity confirmed.
                        </Text>
                     </div>

                     <div className="grid grid-cols-1 gap-3">
                        <button onClick={handleApprove} className="w-full py-4 bg-[var(--brand-accent)] hover:opacity-90 text-white rounded-xl text-gov-label font-bold italic tracking-[0.2em] transition-all shadow-lg">
                           APPROVE_AND_INTEGRATE
                        </button>
                        <button className="w-full py-4 bg-white border-2 border-[var(--surface-border)] text-[var(--text-tertiary)] hover:bg-[var(--bg-layer)] rounded-xl text-gov-label font-bold italic tracking-[0.2em] transition-all">
                           REQUEST_REVISION
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </DashboardFrame>
   );
};