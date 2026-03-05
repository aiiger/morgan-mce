
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { useLiabilityData } from '@/hooks/useLiabilityData';
import { RippleButton } from '../ui/RippleButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShieldAlert, CheckCircle2, AlertOctagon, ArrowRight, Maximize2, Minimize2, Siren, Loader2 } from 'lucide-react';

interface LiabilityTrackerProps {
    mode?: 'compact' | 'expanded';
    onToggle?: () => void;
    pinned?: boolean;
}

export const LiabilityTracker: React.FC<LiabilityTrackerProps> = ({
    mode = 'compact',
    onToggle,
    pinned
}) => {
    const { items, loading, stats } = useLiabilityData();
    const isExpanded = mode === 'expanded';

    // Prioritize: Critical & Expiring soon
    const sortedItems = [...items].sort((a, b) => {
        const da = new Date(a.expiry_date).getTime();
        const db = new Date(b.expiry_date).getTime();
        // Critical come first
        if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
        if (b.priority === 'CRITICAL' && a.priority !== 'CRITICAL') return 1;
        return da - db;
    });

    const displayItems = isExpanded ? sortedItems : sortedItems.slice(0, 3);

    const getDaysRemaining = (dateString: string) => Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    const ToggleButton = onToggle && !pinned ? (
        <RippleButton
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-colors h-auto w-auto min-h-0 bg-transparent border-transparent"
            rippleColor="rgba(255,255,255,0.2)"
        >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </RippleButton>
    ) : null;

    return (
        <Card
            className={`bg-white border-gray-200 transition-all duration-300 ${isExpanded ? 'h-[640px]' : 'h-auto'}`}
            padding="none"
        >
            <CardHeader className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        {stats.critical > 0 ? (
                            <Siren size={14} className="text-rose-500 animate-pulse" />
                        ) : (
                            <ShieldAlert size={14} className="text-gray-500" />
                        )}
                        <CardTitle className={stats.critical > 0 ? 'text-rose-500' : ''}>
                            {stats.critical > 0 ? `CRITICAL ACTION (${stats.critical})` : 'LIABILITY CONTROL'}
                        </CardTitle>
                    </div>
                    {ToggleButton}
                </div>
            </CardHeader>
            <CardContent className={`divide-y divide-gray-200 flex-col h-full overflow-y-auto custom-scrollbar ${isExpanded ? '' : 'max-h-[300px]'}`}>
                {loading ? (
                    <div className="p-8 flex justify-center text-gray-400"><Loader2 size={24} className="animate-spin" /></div>
                ) : displayItems.length === 0 ? (
                    <EmptyState
                        icon={ShieldAlert}
                        title="All Clear"
                        description="No critical liabilities found."
                        className="p-6 border-none bg-transparent"
                    />
                ) : (
                    displayItems.map((item) => {
                        const days = getDaysRemaining(item.expiry_date);
                        const isCritical = item.priority === 'CRITICAL' || days < 30;

                        return (
                            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-violet-500">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs border-0 px-1.5 py-0 rounded-sm font-mono tracking-wider ${item.category === 'Government' ? 'bg-indigo-500/10 text-indigo-400' :
                                                    item.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}
                                            >
                                                {item.priority === 'CRITICAL' ? 'CRITICAL' : item.category}
                                            </span>
                                            <span className={`text-xs font-bold italic ${days < 14 ? 'text-rose-500' : 'text-gray-500'}`}>
                                                {days < 0 ? 'EXPIRED' : `${days} days`}
                                            </span>
                                        </div>
                                        <h4 className="text-gov-body font-bold italic text-gray-900 mt-1 group-hover:text-[var(--brand-accent)] transition-colors truncate max-w-[180px]">
                                            {item.obligation_name}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 tracking-wider mb-0.5">Renew</div>
                                        <div className="font-mono font-bold italic text-gray-900 text-xs">
                                            {item.renewal_period}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
            {/* Expanded Footer Stats */}
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between text-xs text-gray-500 font-bold italic tracking-wider">
                    <span>Total: {stats.total}</span>
                    <span className="text-emerald-500">Compliant: {stats.compliant}</span>
                </div>
            )}
        </Card>
    );
};

