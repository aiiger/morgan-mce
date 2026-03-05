import React from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { TiltCard } from '../ui/TiltCard';
import { Badge } from '../ui/Badge';
import { Tender } from '../../types';
import { MoreHorizontal, DollarSign, Calendar, Clock, ChevronRight } from 'lucide-react';

interface TenderKanbanProps {
    tenders: Tender[];
    onSelectTender: (id: string) => void;
    onUpdateStatus?: (id: string, newStatus: string) => void;
}

const COLUMNS = [
    { id: 'PRE_QUAL', label: 'Pre-Qual' },
    { id: 'TECHNICAL_PREP', label: 'Technical Prep' },
    { id: 'COMMERCIAL_PREP', label: 'Commercial Prep' },
    { id: 'QUALITY_GATE', label: 'Quality Gate' },
    { id: 'SUBMITTED', label: 'Submission' }
];

export const TenderKanban: React.FC<TenderKanbanProps> = ({ tenders, onSelectTender, onUpdateStatus }) => {
    const [activeOverlay, setActiveOverlay] = React.useState<string | null>(null);

    const getColumnTenders = (status: string) => {
        return tenders.filter(t => t.status === status);
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)]">
            {COLUMNS.map(col => {
                const items = getColumnTenders(col.id);
                const totalValue = items.reduce((sum, t) => sum + (Number(t.value) || 0), 0);

                return (
                    <div key={col.id} className="min-w-[320px] w-[320px] flex flex-col gap-3">
                        {/* Column Header */}
                        <GlassPanel className="p-3 flex justify-between items-center bg-[var(--bg-layer)]/60 sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold italic tracking-widest text-[var(--text-secondary)] font-brand">
                                    {col.label}
                                </span>
                                <span className="bg-[var(--bg-layer)]/80 text-[var(--text-tertiary)] text-gov-label font-bold italic px-1.5 py-0.5 rounded-full border border-[var(--surface-border)]">
                                    {items.length}
                                </span>
                            </div>
                            {totalValue > 0 && (
                                <span className="text-gov-label font-mono text-[var(--color-success)]/80">
                                    {col.id === 'AWARDED' ? 'WON' : 'EST'}: ${(totalValue / 1000000).toFixed(1)}M
                                </span>
                            )}
                        </GlassPanel>

                        {/* Draggable Area (Visual) */}
                        <div className="flex-1 space-y-3 overflow-y-auto pr-1 overflow-auto">
                            {items.map(tender => (
                                <TiltCard
                                    key={tender.id}
                                    onClick={() => onSelectTender(tender.id)}
                                    className={`relative group ${activeOverlay === tender.id ? 'z-50' : ''}`}
                                    maxRotation={3}
                                    scale={1.02}
                                >
                                    <div
                                        className="h-full bg-white border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge status={tender.status}>{tender.status}</Badge>
                                            <div className="relative">
                                                <button
                                                    className={`text-gray-500 hover:text-[var(--text-primary)] transition-colors p-1 rounded-md ${activeOverlay === tender.id ? 'bg-gray-50 text-black' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveOverlay(activeOverlay === tender.id ? null : tender.id);
                                                    }}
                                                >
                                                    <MoreHorizontal size={14} />
                                                </button>

                                                {/* Status Transition Overlay */}
                                                {activeOverlay === tender.id && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-2xl z-[100] p-1 animate-in fade-in zoom-in duration-200">
                                                        <div className="px-2 py-1.5 text-caption font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 mb-1">
                                                            Transition State
                                                        </div>
                                                        {COLUMNS.filter(c => c.id !== tender.status).map(col => (
                                                            <button
                                                                key={col.id}
                                                                className="w-full text-left px-2 py-2 text-gov-label font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all flex items-center justify-between group/item"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onUpdateStatus?.(tender.id, col.id);
                                                                    setActiveOverlay(null);
                                                                }}
                                                            >
                                                                {col.label}
                                                                <ChevronRight size={10} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-blue-600" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 line-clamp-2 leading-tight">
                                            {tender.title}
                                        </h4>
                                        <p className="text-caption text-tertiary uppercase tracking-wide mb-3">
                                            {tender.client}
                                        </p>

                                        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                                            <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                                                <DollarSign size={14} strokeWidth={2.5} />
                                                <span className="text-lg font-bold text-[var(--text-primary)]">
                                                    {(Number(tender.value) || 0).toLocaleString(undefined, { notation: 'compact' })}
                                                </span>
                                            </div>

                                            {tender.probability && (
                                                <div className={`text-xs font-medium px-2 py-1 rounded-sm text-gray-900 ${tender.probability === 'High' ? 'bg-[var(--color-success)]' :
                                                    tender.probability === 'Medium' ? 'bg-[var(--color-warning)]' :
                                                        'bg-[var(--color-critical)]'
                                                    }`}>
                                                    {tender.probability}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TiltCard>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};
