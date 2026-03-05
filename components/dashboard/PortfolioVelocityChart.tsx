import React, { useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Activity, Zap } from 'lucide-react';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { Box, Text } from '../primitives';

interface PortfolioVelocityChartProps {
    data: any[];
    totalValue: number;
}

export const PortfolioVelocityChart: React.FC<PortfolioVelocityChartProps> = ({ data, totalValue }) => {
    // Generate jittered data for "live telemetry" feel
    const processedData = useMemo(() => {
        return data.map(d => ({
            ...d,
            revenue: d.revenue * (1 + (Math.random() * 0.05)), // 5% jitter
            cost: d.cost * (1 + (Math.random() * 0.02))
        }));
    }, [data]);

    return (
        <Box className="w-full h-full min-h-[220px] relative flex flex-col group overflow-hidden bg-[var(--surface-surface)] rounded-xl border border-[var(--surface-border)] backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.25)]">
            {/* 1. Value Context Overlay (Top-Left) */}
            <Box className="absolute top-4 left-4 z-20">
                <Box className="flex items-baseline gap-1">
                    <Text variant="gov-hero" className="text-4xl tracking-tight text-[color:var(--text-primary)]">
                        <AnimatedCounter value={totalValue / 1000000} format="decimal" decimals={1} />
                    </Text>
                    <Text variant="gov-label" color="secondary" className="mb-1.5 text-xs font-bold italic text-[color:var(--text-secondary)]">AED/M</Text>
                </Box>
                <Box className="flex items-center space-x-3 mt-2">
                    <Box className="flex bg-[var(--overlay-2)] border border-[var(--surface-border)] rounded overflow-hidden">
                        <button className="px-3 py-1 text-caption font-bold italic text-[color:var(--text-primary)] bg-[var(--surface-layer)] transition-all">7D</button>
                        <button className="px-3 py-1 text-caption font-bold italic text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] hover:bg-[var(--overlay-2)] transition-all">30D</button>
                    </Box>
                    <div className="flex items-center gap-1.5 text-[color:var(--chart-series-success)]">
                        <TrendingUp size={12} />
                        <Text variant="label" className="text-caption font-bold">+12.4%</Text>
                    </div>
                </Box>
            </Box>

            {/* 2. Primary Visualization Area */}
            <Box className="flex-1 w-full relative mt-0">
                {/* Horizontal Scanline */}
                <div className="absolute top-1/2 w-full h-[1px] border-t border-[var(--chart-grid)] border-dashed opacity-60 z-0" />

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevPremium" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-series-success)" stopOpacity={0.6} />
                                <stop offset="50%" stopColor="var(--chart-series-success)" stopOpacity={0.1} />
                                <stop offset="100%" stopColor="var(--chart-series-success)" stopOpacity={0} />
                            </linearGradient>
                            <filter id="premium-glow">
                                <feGaussianBlur stdDeviation="4" result="glow" />
                                <feComposite in="SourceGraphic" in2="glow" operator="over" />
                            </filter>
                        </defs>
                        {/* Grid Removed for cleaner, 'Glass' aesthetic */}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--chart-tooltip-bg)',
                                border: '1px solid var(--chart-tooltip-border)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(12px)',
                                padding: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                            }}
                            itemStyle={{
                                color: 'var(--text-primary)',
                                fontSize: '11px',
                                fontWeight: '700',
                                fontStyle: 'italic',
                                fontFamily: 'var(--font-sans)',
                                textTransform: 'uppercase',
                            }}
                            labelStyle={{ display: 'none' }}
                            cursor={{ stroke: 'var(--chart-axis)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--chart-series-success)"
                            strokeWidth={3}
                            fill="url(#colorRevPremium)"
                            animationDuration={1500}
                            filter="url(#premium-glow)"
                        />
                        <Area
                            type="monotone"
                            dataKey="cost"
                            stroke="var(--chart-series-critical)"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            fill="none"
                            animationDuration={2000}
                            className="opacity-70"
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Holographic Signal Slice - Pure CSS Animation */}
                <div className="absolute top-0 right-10 bottom-0 w-[1px] bg-[var(--surface-border-strong)] animate-pulse z-10 hidden group-hover:block" />
            </Box>

            {/* 3. Operational Legend (Bottom Strip) */}
            <Box className="absolute bottom-0 inset-x-0 h-10 bg-[var(--surface-surface)]/80 border-t border-[var(--surface-border)] flex items-end justify-between px-4 pb-3 backdrop-blur-md">
                <Box className="flex items-center space-x-4">
                    <Box className="flex items-center space-x-2">
                        <Box className="w-1.5 h-1.5 rounded-sm bg-[var(--chart-series-success)] shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
                        <Text variant="gov-label" color="secondary" className="font-bold italic text-gov-label">REVENUE_FLUX</Text>
                    </Box>
                    <Box className="flex items-center space-x-2 opacity-70">
                        <Box className="w-2 h-[2px] bg-[var(--chart-series-critical)]" />
                        <Text variant="gov-label" color="tertiary" className="font-bold italic text-gov-label">DRAIN_LIMIT</Text>
                    </Box>
                </Box>
                <div className="flex items-center gap-1.5 opacity-60">
                    <Activity size={10} className="text-[color:var(--text-tertiary)]" />
                    <Text variant="gov-label" className="text-caption font-mono text-[color:var(--text-tertiary)]">SIGNAL_LIVE</Text>
                </div>
            </Box>
        </Box>
    );
};
