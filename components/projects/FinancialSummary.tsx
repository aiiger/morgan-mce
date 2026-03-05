import React from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FinancialMetric {
    label: string;
    value: number;
    subtext?: string;
    trend?: 'up' | 'down' | 'neutral';
    color: 'emerald' | 'blue' | 'amber' | 'rose' | 'zinc';
}

interface FinancialSummaryProps {
    metrics: FinancialMetric[];
    className?: string;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ metrics, className }) => {
    return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
            {metrics.map((metric, idx) => (
                <GlassPanel key={idx} variant="base" className="p-4 relative overflow-hidden group hover:bg-bg-surface transition-colors">
                    <div className={`absolute top-0 left-0 w-full h-0.5 bg-${metric.color}-500/50 opacity-50`} />

                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gov-label font-bold italic text-gray-500 tracking-widest">{metric.label}</span>
                        {metric.color === 'emerald' && <TrendingUp size={14} className="text-emerald-500" />}
                        {metric.color === 'blue' && <CheckCircle2 size={14} className="text-blue-500" />}
                        {metric.color === 'amber' && <AlertCircle size={14} className="text-amber-500" />}
                    </div>

                    <div className="flex flex-col">
                        <span className={`text-xl font-bold italic tracking-tighter text-gray-900 group-hover:text-${metric.color}-400 transition-colors`}>
                            {metric.value.toLocaleString(undefined, { style: 'currency', currency: 'AED', notation: 'compact' })}
                        </span>
                        {metric.subtext && (
                            <span className="text-gov-label font-bold italic text-gray-500 mt-1">
                                {metric.subtext}
                            </span>
                        )}
                    </div>

                    {/* Background Glow */}
                    <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-${metric.color}-500/10 rounded-full blur-2xl group-hover:bg-${metric.color}-500/20 transition-all pointer-events-none`} />
                </GlassPanel>
            ))}
        </div>
    );
};
