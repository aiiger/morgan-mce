import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectPulseProps {
    data: Array<{ stage: string; maturity: number }>;
    currentStage?: string;
    className?: string;
}

export const ProjectPulse: React.FC<ProjectPulseProps> = ({
    data,
    currentStage,
    className
}) => {
    return (
        <motion.div
            className={cn(
                "h-[350px] bg-gray-50 backdrop-blur-md border border-gray-200 rounded-xl p-6 relative overflow-hidden flex flex-col group",
                className
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-mono font-bold italic text-gray-700 tracking-[0.2em] uppercase">Execution Maturity Pulse</h3>
                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
                    </div>
                    <p className="text-caption font-bold text-gray-500 uppercase tracking-widest font-mono">Neural Lifecycle Tracking // {currentStage || 'Active Phase'}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/5 border border-blue-200">
                    <Activity size={12} className="text-blue-600" />
                    <span className="text-gov-label font-bold text-blue-600 uppercase tracking-widest">Live Sync</span>
                </div>
            </div>

            {/* Chart Container */}
            <div className="flex-1 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="maturityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="stage"
                            stroke="rgba(255,255,255,0.1)"
                            style={{ fill: 'rgba(255,255,255,0.3)', fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            cursor={{ stroke: 'rgba(0, 245, 255, 0.3)', strokeWidth: 1 }}
                            contentStyle={{
                                backgroundColor: 'rgba(9, 9, 11, 0.95)',
                                borderColor: 'rgba(0, 245, 255, 0.2)',
                                borderRadius: '8px',
                                padding: '12px',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
                                backdropFilter: 'blur(12px)'
                            }}
                            itemStyle={{ color: 'var(--white)', fontSize: '11px', fontFamily: 'monospace' }}
                            labelStyle={{ color: 'rgba(0, 245, 255, 0.8)', fontSize: '9px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="maturity"
                            stroke="var(--brand-accent)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#maturityGradient)"
                            animationDuration={2000}
                            dot={{ r: 3, fill: 'var(--brand-accent)', strokeWidth: 0, opacity: 0.5 }}
                            activeDot={{ r: 5, fill: 'var(--white)', stroke: 'var(--brand-accent)', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Footer Info */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="text-caption text-gray-500 uppercase tracking-widest font-mono mb-0.5">Peak_Execution</div>
                        <div className="text-xs font-bold text-gray-700">88.4% Efficiency</div>
                    </div>
                    <div className="w-px h-6 bg-gray-50" />
                    <div>
                        <div className="text-caption text-gray-500 uppercase tracking-widest font-mono mb-0.5">Velocity_Index</div>
                        <div className="text-xs font-bold text-emerald-500">+12% Optimal</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp size={12} className="text-emerald-500" />
                    <span className="text-caption font-mono text-gray-500">Targeting Q4 2026 Close</span>
                </div>
            </div>
        </motion.div>
    );
};
