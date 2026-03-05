import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  ShieldAlert,
  User,
  Calendar,
  Loader2,
  Link as LinkIcon,
  FileText,
  X,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TenderChecklistTrackerProps {
  tenderId: string;
}

interface Requirement {
  id: string;
  section_name: string;
  title: string;
  status: string;
  is_mandatory: boolean;
  assigned_to?: string;
  due_date?: string;
  evidence_doc_id?: string;
}

interface Doc {
  id: string;
  title: string;
  category: string;
}

export const TenderChecklistTracker: React.FC<TenderChecklistTrackerProps> = ({ tenderId }) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingReqId, setLinkingReqId] = useState<string | null>(null);
  const [availableDocs, setAvailableDocs] = useState<Doc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const handleAutoSuggest = async (_req: Requirement) => {
    // Auto-suggest not yet implemented — button is disabled in UI
  };

  useEffect(() => {
    fetchRequirements();
  }, [tenderId]);

  const fetchRequirements = async () => {
    try {
      const { data, error } = await (supabase
        .from('tasks' as any) as any)
        .select('*')
        .eq('tender_id', tenderId)
        .order('section_name', { ascending: true });

      if (error) throw error;
      setRequirements(data || []);
    } catch (err) {
      console.error('Failed to fetch checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkDocument = async (docId: string) => {
    if (!linkingReqId) return;
    try {
      const { error } = await (supabase.from('tasks' as any) as any).update({ evidence_doc_id: docId, status: 'completed' }).eq('id', linkingReqId);
      if (error) throw error;
      await fetchRequirements();
      setLinkingReqId(null);
    } catch (err) {
      console.error('Link failed:', err);
    }
  };

  const openLinkModal = async (reqId: string) => {
    setLinkingReqId(reqId);
    setDocsLoading(true);
    const { data } = await (supabase.from('documents' as any) as any).select('id, title, category');
    setAvailableDocs(data || []);
    setDocsLoading(false);
  };

  const sections: Record<string, Requirement[]> = {};
  requirements.forEach(r => {
    if (!sections[r.section_name]) sections[r.section_name] = [];
    sections[r.section_name].push(r);
  });

  const total = requirements.length;
  const completed = requirements.filter(i => i.status === 'completed').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse font-mono tracking-[0.3em]">Syncing Requirements Matrix...</div>;

  return (
    <div className="space-y-8 font-sans w-full max-w-7xl mx-auto">

      {/* 1. Readiness Telemetry - REVERTED TO NON-SPINNING VERSION */}
      <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-success)]/5 blur-3xl pointer-events-none group-hover:bg-[var(--color-success)]/10 transition-colors"></div>

        <div className="flex items-center space-x-8 w-full md:w-auto relative z-10">
          <div className={`relative w-24 h-24 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-inner`}>
            <span className={`text-3xl font-bold italic tracking-tighter ${progress === 100 ? 'text-[var(--color-success)]' : 'text-blue-400'}`}>{progress}%</span>
            {/* STATIC CIRCLE - NO ANIMATION PER USER HINT */}
            <div className={`absolute inset-0 rounded-full border-2 ${progress === 100 ? 'border-[var(--color-success)]/40 shadow-[0_0_15px_rgba(0,220,130,0.3)]' : 'border-gray-200'}`}></div>
          </div>
          <div>
            <h3 className="text-xl font-bold italic text-gray-900 tracking-tighter leading-none">Submission Saturation</h3>
            <div className="flex items-center space-x-2 mt-3">
              <span className={`text-gov-label font-bold italic tracking-widest px-3 py-1 rounded-sm border ${progress === 100 ? 'border-[var(--color-success)]/30 text-[var(--color-success)] bg-[var(--color-success)]/5' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
                {progress === 100 ? 'OPTIMAL_CALIBRATION' : 'NODE_INIT_IN_PROGRESS'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-16 mt-8 md:mt-0 relative z-10 border-l border-gray-200 pl-16">
          <div className="text-center">
            <p className="text-3xl font-bold italic text-gray-900 font-mono tracking-tighter">{completed}</p>
            <p className="text-caption text-gray-500 font-bold italic tracking-widest mt-1">Verified</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold italic text-gray-500 font-mono tracking-tighter">{total - completed}</p>
            <p className="text-caption text-gray-500 font-bold italic tracking-widest mt-1">Pending</p>
          </div>
        </div>
      </div>

      {/* 2. Cluster Grid */}
      <div className="space-y-8">
        {Object.entries(sections).map(([title, items]) => (
          <div key={title} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:border-gray-200 transition-colors">
            <div className="px-8 py-4 bg-gray-50 flex justify-between items-center border-b border-gray-200">
              <h4 className="font-bold italic text-gray-500 text-xs tracking-[0.3em]">{title}</h4>
              <span className="text-caption font-mono text-gray-500 tracking-widest font-bold italic">
                SYNC_COEFFICIENT: {items.filter(i => i.status === 'completed').length} / {items.length}
              </span>
            </div>

            <div className="divide-y divide-gray-100 bg-white">
              {items.map((item) => (
                <div key={item.id} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-all group/row">
                  <div className="flex items-center space-x-8">
                    <div className="shrink-0">
                      {item.status === 'completed' ? <CheckCircle2 className="text-[var(--color-success)]" size={22} /> : <Circle className="text-zinc-800 group-hover/row:text-gray-500 transition-colors" size={22} />}
                    </div>
                    <div>
                      <p className={`text-base font-bold italic tracking-tight ${item.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-700 group-hover/row:text-gray-900'}`}>
                        {item.title}
                        {item.is_mandatory && <span className="ml-4 text-gov-label text-rose-500 bg-rose-950/20 px-2 py-0.5 rounded-sm font-bold italic border border-rose-900/20 tracking-widest">Mandatory</span>}
                      </p>
                      {item.evidence_doc_id && (
                        <div className="flex items-center gap-2 text-caption text-[var(--color-success)] mt-2 font-mono font-bold italic bg-[var(--color-success)]/5 px-2 py-0.5 rounded-sm w-fit border border-[var(--color-success)]/10">
                          <LinkIcon size={10} /> Artifact_Secure
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-8 text-caption font-mono tracking-widest">
                    {item.status !== 'completed' && (
                      <div className="flex gap-3">
                        <button
                          disabled
                          title="Auto-Map coming soon"
                          className="px-4 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-400 font-bold italic cursor-not-allowed flex items-center gap-2 opacity-50"
                        >
                          <Sparkles size={12} /> Auto-Map
                        </button>
                        <button
                          onClick={() => openLinkModal(item.id)}
                          className="px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 font-bold italic transition-all flex items-center gap-2"
                        >
                          <LinkIcon size={12} /> Link Manual
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Aligned Typography */}
      {linkingReqId && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 w-full max-w-lg rounded-2xl shadow-5xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold italic text-gray-900 tracking-widest">Vault_Artifact_Sync</h3>
              <button onClick={() => setLinkingReqId(null)}><X size={20} className="text-gray-500 hover:text-gray-900" /></button>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2 overflow-auto">
              {docsLoading ? (
                <div className="p-12 text-center text-gray-500 font-mono text-caption tracking-[0.3em]">Scanning_Vault...</div>
              ) : (
                <div className="space-y-1">
                  {availableDocs.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => handleLinkDocument(doc.id)}
                      className="w-full text-left p-4 hover:bg-bg-surface rounded-xl flex items-center gap-4 transition-all group border border-transparent hover:border-gray-200"
                    >
                      <FileText size={18} className="text-gray-500 group-hover:text-[var(--color-success)]" />
                      <div>
                        <p className="text-xs font-bold italic text-gray-700 group-hover:text-gray-900">{doc.title}</p>
                        <p className="text-gov-label text-gray-500 tracking-widest mt-1 font-bold italic">{doc.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};