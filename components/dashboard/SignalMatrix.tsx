import React from 'react';
import { Search, Briefcase, FileText, CheckCircle2, Zap, ArrowRight, Database, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SignalMatrixProps {
    query: string;
    results: {
        projects: any[];
        tenders: any[];
        documents: any[];
        tasks: any[];
    };
    onClose: () => void;
    onNavigate: (view: string, id: string | null) => void;
}

export const SignalMatrix: React.FC<SignalMatrixProps> = ({ query, results, onClose, onNavigate }) => {
    if (!query) return null;

    const totalResults = results.projects.length + results.tenders.length + results.documents.length + results.tasks.length;

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-24 pb-20 px-4 bg-gray-900/50 backdrop-blur-xl animate-in fade-in duration-500">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-5xl bg-[var(--bg-surface)] border border-[var(--surface-border)] rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Machined Edge Highlight */}
                <div className="absolute inset-0 border border-gray-200/30 pointer-events-none z-50 rounded-2xl" />

                {/* Search Header */}
                <div className="p-8 border-b border-[var(--surface-border)] flex items-center justify-between bg-[var(--bg-hover)]/30 backdrop-blur-md">
                    <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-[var(--brand-accent)]/10 rounded-2xl border border-[var(--brand-accent)]/20 flex items-center justify-center text-[var(--brand-accent)]">
                            <Search size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold italic font-oswald uppercase tracking-tighter text-[var(--text-primary)]">
                                Signal Matrix <span className="text-caption font-mono font-bold text-[var(--brand-accent)] opacity-60 ml-2 tracking-widest">V2.4_SEARCH</span>
                            </h2>
                            <p className="text-caption font-bold text-[var(--text-tertiary)] uppercase tracking-[0.25em] mt-1">
                                Cross-Module Intel for: <span className="text-[var(--brand-accent)]">"{query.toUpperCase()}"</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-[var(--bg-hover)] hover:bg-[var(--brand-accent)] hover:text-white border border-[var(--surface-border)] rounded-2xl transition-all group"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* Results Matrix */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-gradient-to-b from-transparent to-[var(--bg-base)]/20">
                    {totalResults === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 opacity-20 text-center">
                            <Database size={80} className="mb-6" />
                            <p className="text-sm font-bold font-oswald italic uppercase tracking-[0.3em]">
                                No Cluster Matches Detected
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Projects Column */}
                            {results.projects.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold italic font-oswald uppercase tracking-[0.2em] text-[var(--brand-accent)] flex items-center gap-2 border-b border-[var(--brand-accent)]/10 pb-3">
                                        <Briefcase size={14} /> Portfolio Matches ({results.projects.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {results.projects.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => onNavigate('projects', p.id)}
                                                className="w-full text-left p-6 bg-[var(--bg-surface)] border border-[var(--surface-border)] rounded-2xl hover:border-[var(--brand-accent)]/40 hover:bg-[var(--bg-hover)] transition-all group shadow-sm"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-caption font-mono font-bold text-[var(--brand-accent)] opacity-60">{p.project_code || 'PRJ-CORE'}</span>
                                                    <ArrowRight size={14} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </div>
                                                <p className="text-sm font-bold italic font-oswald uppercase text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors truncate">{p.project_name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tenders Column */}
                            {results.tenders.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold italic font-oswald uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2 border-b border-amber-500/10 pb-3">
                                        <Zap size={14} /> Pipeline Matches ({results.tenders.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {results.tenders.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => onNavigate('tenders', t.id)}
                                                className="w-full text-left p-6 bg-[var(--bg-surface)] border border-[var(--surface-border)] rounded-2xl hover:border-amber-500/40 hover:bg-[var(--bg-hover)] transition-all group shadow-sm"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-caption font-mono font-bold text-amber-500/60 uppercase">{t.client || 'TENDER-NODE'}</span>
                                                    <ArrowRight size={14} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </div>
                                                <p className="text-sm font-bold italic font-oswald uppercase text-[var(--text-primary)] group-hover:text-amber-500 transition-colors truncate">{t.title}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Documents Column */}
                            {results.documents.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold italic font-oswald uppercase tracking-[0.2em] text-[var(--text-tertiary)] flex items-center gap-2 border-b border-[var(--surface-border)] pb-3">
                                        <FileText size={14} /> Vault Matches ({results.documents.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {results.documents.map(d => (
                                            <button
                                                key={d.id}
                                                onClick={() => onNavigate('documents', d.id)}
                                                className="w-full text-left p-6 bg-[var(--bg-surface)] border border-[var(--surface-border)] rounded-2xl hover:border-[var(--brand-accent)]/40 hover:bg-[var(--bg-hover)] transition-all group shadow-sm"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gov-label font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-tighter">{d.type || 'DOCUMENT'}</span>
                                                    <ArrowRight size={14} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </div>
                                                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors truncate">{d.title}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tasks Column */}
                            {results.tasks.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold italic font-oswald uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2 border-b border-emerald-500/10 pb-3">
                                        <CheckCircle2 size={14} /> Action Matches ({results.tasks.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {results.tasks.map((t, i) => (
                                            <button
                                                key={i}
                                                onClick={() => onNavigate('tasks', null)}
                                                className="w-full text-left p-6 bg-[var(--bg-surface)] border border-[var(--surface-border)] rounded-2xl hover:border-emerald-500/40 hover:bg-[var(--bg-hover)] transition-all group shadow-sm"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gov-label font-mono font-bold text-emerald-500/60 uppercase">{t.status || 'PENDING'}</span>
                                                    <ArrowRight size={14} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </div>
                                                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors truncate">{t.title}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Metrics */}
                <div className="p-6 bg-[var(--bg-hover)]/50 border-t border-[var(--surface-border)] flex items-center justify-between text-caption font-bold uppercase tracking-widest text-[var(--text-tertiary)] italic">
                    <div className="flex items-center space-x-8">
                        <span>Cluster Density: <span className={cn(totalResults > 10 ? "text-amber-500" : "text-emerald-500")}>{totalResults > 10 ? 'CRITICAL' : 'NOMINAL'}</span></span>
                        <span className="hidden sm:inline">Temporal_Sync: ACTIVE</span>
                    </div>
                    <div className="text-[var(--brand-accent)] drop-shadow-[0_0_8px_var(--brand-accent)]">MATRIX_NODE_ONLINE</div>
                </div>
            </motion.div>
        </div>
    );
};