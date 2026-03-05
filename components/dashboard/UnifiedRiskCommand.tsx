import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { AlertOctagon, ShieldAlert, Activity, ArrowRight, ShieldCheck, Clock, Maximize2, Minimize2 } from 'lucide-react';

interface Project {
    id: string;
    delivery_risk_rating?: string;
    flag_for_ceo_attention?: boolean;
    [key: string]: any;
}

interface Alert {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    timestamp: string;
    category: string;
}

interface UnifiedRiskCommandProps {
    projects?: Project[];
    alerts?: Alert[];
    riskDistribution?: {
        critical: number;
        high: number;
        nominal: number;
        stable: number;
    };
    mode?: 'compact' | 'expanded';
    onToggle?: () => void;
    pinned?: boolean;
}

export const UnifiedRiskCommand: React.FC<UnifiedRiskCommandProps> = ({
    projects = [],
    alerts = [],
    riskDistribution,
    mode = 'compact',
    onToggle,
    pinned
}) => {

    // Calculate distribution if not provided
    const counts = React.useMemo(() => {
        if (riskDistribution) return riskDistribution;
        return projects.reduce((acc, p) => {
            const risk = p.delivery_risk_rating?.toLowerCase() || 'nominal';
            if (risk === 'critical' || p.flag_for_ceo_attention) acc.critical++;
            else if (risk === 'high') acc.high++;
            else if (risk === 'nominal') acc.nominal++;
            else acc.stable++;
            return acc;
        }, { critical: 0, high: 0, nominal: 0, stable: 0 });
    }, [projects, riskDistribution]);

    const total = counts.critical + counts.high + counts.nominal + counts.stable || 1;
    const getWidth = (val: number) => `${(val / total) * 100}%`;

    const hasCriticalRisks = counts.critical > 0 || counts.high > 0;
    const activeAlerts = alerts.length;
    const isExpanded = mode === 'expanded';

    const ToggleButton = onToggle && !pinned ? (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-colors"
        >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>
    ) : null;

    return (
        <Card
            className={`border border-border-subtle bg-bg-surface flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isExpanded ? 'h-[640px] shadow-2xl z-50' : 'h-full shadow-lg'}`}
            padding="none"
        >
            <CardHeader className="px-6 py-4 border-b border-border-subtle bg-bg-surface/50">
                <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-text-secondary" />
                    <CardTitle className="text-sm font-bold italic text-text-primary">Strategic Risk Command</CardTitle>
                </div>
                {ToggleButton}
            </CardHeader>
            <CardContent className="flex flex-col h-full overflow-hidden">
                <div className="flex flex-col h-full">

                    {/* Top Section: Heatmap Visualization */}
                    <div className="p-6 border-b border-border-subtle shrink-0">

                        {/* Status Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${hasCriticalRisks ? 'bg-[var(--color-critical)] shadow-[0_0_8px_var(--color-critical)]' : 'bg-[var(--color-success)] shadow-[0_0_8px_var(--color-success)]'
                                    }`} />
                                <span className="text-xs font-bold italic text-text-secondary">
                                    {hasCriticalRisks ? 'Elevated Risk Detected' : 'System Nominal'}
                                </span>
                            </div>
                            {activeAlerts > 0 && (
                                <Badge variant="outline" className="bg-[var(--color-critical)]/10 text-[var(--color-critical)] border-[var(--color-critical)]/20 text-xs px-1.5 py-0.5 animated-pulse">
                                    {activeAlerts} ACTIVE SIGNALS
                                </Badge>
                            )}
                        </div>

                        {/* Integrated Progress Bar */}
                        <div className="w-full h-1.5 bg-bg-base rounded-full overflow-hidden flex mb-4 border border-border-subtle">
                            <div className="bg-[var(--color-critical)] h-full transition-all duration-1000" style={{ width: getWidth(counts.critical) }} />
                            <div className="bg-[var(--color-warning)] h-full transition-all duration-1000" style={{ width: getWidth(counts.high) }} />
                            <div className="bg-[var(--morgan-teal)] h-full transition-all duration-1000" style={{ width: getWidth(counts.nominal) }} />
                            <div className="bg-[var(--color-success)] h-full transition-all duration-1000" style={{ width: getWidth(counts.stable) }} />
                        </div>

                        <div className="grid grid-cols-4 gap-3 mt-2">
                            {[
                                { label: 'CRITICAL', value: counts.critical, colorVar: '--color-critical' },
                                { label: 'HIGH', value: counts.high, colorVar: '--color-warning' },
                                { label: 'NOMINAL', value: counts.nominal, colorVar: '--morgan-teal' },
                                { label: 'STABLE', value: counts.stable, colorVar: '--color-success' }
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="text-center p-3 rounded-xl transition-all hover:scale-[1.02] relative group overflow-hidden border border-[var(--surface-border)] bg-[var(--bg-surface)]/50 hover:bg-[var(--bg-hover)]/30"
                                    style={{
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    {/* Subtle Gradient Overlay */}
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                    <div
                                        className="text-3xl font-oswald font-bold italic leading-none mb-2 group-hover:scale-110 transition-transform duration-300"
                                        style={{ color: `var(${stat.colorVar})` }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div className="text-gov-label text-[var(--text-tertiary)] font-oswald font-bold italic tracking-[0.12em] uppercase">
                                        {stat.label}
                                    </div>

                                    {/* Bottom Indicator */}
                                    <div
                                        className="absolute bottom-0 inset-x-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl"
                                        style={{ backgroundColor: `var(${stat.colorVar})` }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Section: Signal Feed - Only show full list if expanded or ample height */}
                    <div className="flex-1 bg-bg-surface flex flex-col min-h-0">
                        <div className="px-6 py-3 border-b border-border-subtle bg-bg-surface/50 flex items-center justify-between shrink-0">
                            <span className="text-xs font-bold italic text-text-secondary">Live Signals</span>
                            <Activity size={12} className="text-text-tertiary" />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                            <AnimatePresence>
                                {alerts.length > 0 ? (
                                    <motion.div
                                        className="divide-y divide-border-subtle"
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            visible: { transition: { staggerChildren: 0.1 } }
                                        }}
                                    >
                                        {(mode === 'compact' ? alerts.slice(0, 3) : alerts).map((alert, i) => (
                                            <motion.div
                                                key={i}
                                                className="px-6 py-3 border-b border-border-subtle hover:bg-bg-hover/20 transition-colors cursor-pointer group"
                                                variants={{
                                                    hidden: { opacity: 0, x: -10 },
                                                    visible: { opacity: 1, x: 0 }
                                                }}
                                                whileHover={{ x: 4 }}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <AlertOctagon size={12} className="text-[var(--color-critical)] flex-shrink-0" />
                                                        <span className="text-xs font-bold italic text-[var(--color-critical)] group-hover:text-[var(--color-critical)]/80 transition-colors line-clamp-1">{alert.title}</span>
                                                    </div>
                                                    <span className="text-xs text-text-tertiary flex-shrink-0">{alert.timestamp}</span>
                                                </div>
                                                <p className="text-xs text-text-secondary leading-relaxed font-bold italic pl-5 group-hover:text-text-primary transition-colors">
                                                    Anomaly detected. Immediate review required.
                                                </p>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-60">
                                        <ShieldCheck size={32} className="text-[var(--color-success)] mb-3" />
                                        <span className="text-sm font-bold italic text-[var(--text-secondary)]">No Active Hazards</span>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

