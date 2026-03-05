import React from 'react';
import { Sparkles } from 'lucide-react';

interface DailyBriefingCardProps {
    stats: {
        active: number;
        bids: number;
        value: number;
        critical: number;
    };
}

export const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({ stats }) => {
    return (
        <div className="h-[72px] matte-surface p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-[var(--color-info)]" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-section-header opacity-50">Daily Briefing</span>
                    <span className={`text-xs font-bold italic px-1.5 py-0.5 rounded border border-gray-200 tracking-wider ${stats.critical > 0 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                        {stats.critical > 0 ? 'Volatile' : 'Stable'}
                    </span>
                </div>
                <div className="flex items-baseline gap-2 truncate">
                    <span className="text-data-primary truncate">
                        Portfolio performance is <span className={stats.critical > 0 ? "text-rose-400 font-bold italic" : "text-emerald-400 font-bold italic"}>{stats.critical > 0 ? 'Degrading' : 'Stable'}</span> with high-velocity bid activity.
                    </span>
                    <span className="text-xs text-gray-500 hidden xl:inline-block">•</span>
                    <span className="text-xs text-gray-500 hidden xl:inline-block truncate">
                        {stats.active} Active • {stats.bids} Bids • AED {(stats.value / 1000000).toFixed(1)}M Val • {stats.critical} Critical
                    </span>
                </div>
            </div>
        </div>
    );
};

