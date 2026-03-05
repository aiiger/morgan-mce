import React from 'react';
import { TrendingUp } from 'lucide-react';
import { TiltCard } from '@/components/ui/TiltCard';

interface TenderListProps {
    tenders: any[];
    limit?: number;
}

export const TenderList: React.FC<TenderListProps> = ({ tenders, limit }) => {
    if (!tenders || tenders.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 text-xs font-bold italic opacity-50">
                No Active Tenders
            </div>
        );
    }

    return (
        <div className="divide-y divide-[var(--surface-border)] flex-col h-full">
            {(limit ? tenders.slice(0, limit) : tenders).map((tender) => (
                <TiltCard
                    key={tender.id}
                    className="p-4 hover:bg-gray-50 group cursor-pointer border-l-2 border-transparent hover:border-emerald-500 relative"
                    maxRotation={2}
                    scale={1.01}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-bg-surface rounded-lg border border-border-subtle group-hover:border-border-strong transition-colors">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="text-gov-body font-oswald font-bold italic text-[var(--text-primary)] group-hover:text-[var(--morgan-teal)] transition-colors uppercase tracking-wider">{tender.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                                    <span className="tracking-wider font-bold italic">{tender.client}</span>
                                    <span className="text-gray-500 opacity-50">•</span>
                                    <span className="flex items-center gap-1.5">
                                        <div className={`w-1 h-1 rounded-full ${tender.status === 'Pre-Award' ? 'bg-[var(--morgan-teal)] shadow-[0_0_8px_var(--morgan-teal)]' :
                                            tender.status === 'Tender Stage' ? 'bg-[var(--morgan-teal-light)]' : 'bg-[var(--morgan-red-dark)] shadow-[0_0_8px_var(--morgan-red-glow)]'
                                            }`} />
                                        <span className="font-oswald font-bold italic text-caption text-text-tertiary">{tender.status ? tender.status.toUpperCase() : 'UNKNOWN'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-oswald font-bold italic text-[var(--kpi-value-color)] group-hover:scale-105 transition-transform">
                                AED {(tender.value / 1000000).toFixed(1)}M
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pl-[3.25rem]">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                <div className="w-5 h-5 rounded-full bg-bg-surface border border-bg-base flex items-center justify-center text-xs text-text-tertiary shadow-sm">AB</div>
                                <div className="w-5 h-5 rounded-full bg-bg-surface border border-bg-base flex items-center justify-center text-xs text-text-tertiary shadow-sm">MC</div>
                            </div>
                            <span className="text-xs text-text-secondary font-bold italic">+3 Team</span>
                        </div>
                        <span
                            className={`text-caption tracking-widest font-oswald font-bold italic px-2 py-0.5 rounded border uppercase transition-colors ${(tender.winProbability || tender.probability) === 'High'
                                    ? 'bg-[var(--morgan-teal)]/10 text-[var(--morgan-teal)] border-[var(--morgan-teal)]/20'
                                    : (tender.winProbability || tender.probability) === 'Medium'
                                        ? 'bg-[var(--morgan-teal-light)]/10 text-[var(--morgan-teal)] border-[var(--morgan-teal)]/10'
                                        : 'bg-[var(--morgan-red-dark)]/10 text-[var(--morgan-red-dark)] border-[var(--morgan-red-dark)]/20'
                                }`}
                        >
                            {(tender.winProbability || tender.probability || 'Medium')} Prob
                        </span>
                    </div>
                </TiltCard>
            ))}
        </div>
    );
};

