import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Target, Activity, Crosshair, Network, AlertTriangle, Share2 } from 'lucide-react';
import { Text } from '../primitives';
import { cn } from '@/lib/utils';

interface Project {
    id: string;
    project_name: string;
    client_name?: string;
    delivery_risk_rating?: string; // Critical, High, Moderate, Nominal
    [key: string]: any;
}

interface Alert {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    timestamp: string;
}

interface RiskHeatmapV2Props {
    projects: Project[];
    alerts: Alert[];
}

export const RiskHeatmapV2: React.FC<RiskHeatmapV2Props> = ({ projects = [], alerts = [] }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // 1. Calculate Risk Statistics
    const stats = useMemo(() => {
        return projects.reduce((acc, p) => {
            const risk = p.delivery_risk_rating?.toLowerCase() || 'nominal';
            if (risk === 'critical') acc.critical++;
            else if (risk === 'high') acc.high++;
            else if (risk === 'moderate') acc.moderate++;
            else acc.nominal++;
            return acc;
        }, { critical: 0, high: 0, moderate: 0, nominal: 0 });
    }, [projects]);

    const total = projects.length || 1;
    const exposureRate = (stats.critical / total) * 100;

    // 2. Correlation Matrix Positioning (Clustered by Risk Intensity)
    const nodes = useMemo(() => {
        return projects.map((p, i) => {
            const riskValue = p.delivery_risk_rating === 'Critical' ? 3 :
                p.delivery_risk_rating === 'High' ? 2 :
                    p.delivery_risk_rating === 'Moderate' ? 1 : 0;

            // Grid-based clustering with organic offset
            // Criticals (Top Right), High (Top Left), Mod (Bottom Right), Low (Bottom Left)
            // We use a normalized 0-100 coordinate space for the matrix container
            let baseX = 0, baseY = 0;

            // Positioning Logic:
            // Critical -> Top Right (Danger Zone)
            // High -> Top Left (Warning Zone)
            // Moderate -> Bottom Right (Watch Zone)
            // Nominal -> Bottom Left (Safe Zone)

            if (riskValue === 3) { baseX = 75; baseY = 25; }
            else if (riskValue === 2) { baseX = 25; baseY = 25; }
            else if (riskValue === 1) { baseX = 75; baseY = 75; }
            else { baseX = 25; baseY = 75; }

            // Deterministic jitter based on ID char codes to spread them out naturally
            const salt = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const jitterX = ((salt % 40) - 20); // +/- 20%
            const jitterY = (((salt * 13) % 40) - 20);

            return {
                ...p,
                x: Math.max(10, Math.min(90, baseX + jitterX)), // Clamp to 10-90%
                y: Math.max(10, Math.min(90, baseY + jitterY)),
                riskValue,
                color: p.delivery_risk_rating === 'Critical' ? 'var(--chart-series-critical)' :
                    p.delivery_risk_rating === 'High' ? 'var(--chart-series-warning)' :
                        p.delivery_risk_rating === 'Moderate' ? 'var(--chart-series-1)' :
                            'var(--chart-series-success)'
            };
        });
    }, [projects]);

    const selectedProject = nodes.find(n => n.id === selectedId);

    // 3. Generate Neural Paths (Virtual Connections between high-risk nodes)
    const connections = useMemo(() => {
        // Only connect nodes with risk >= High to show "Contagion"
        const highRiskNodes = nodes.filter(n => n.riskValue >= 2);
        const links: any[] = [];

        highRiskNodes.forEach((start, i) => {
            highRiskNodes.slice(i + 1).forEach(end => {
                // Link if close enough (simulating shared risk factors)
                const dist = Math.hypot(start.x - end.x, start.y - end.y);
                if (dist < 40) { // Threshold for connection
                    links.push({
                        x1: start.x, y1: start.y,
                        x2: end.x, y2: end.y,
                        intensity: (start.riskValue + end.riskValue) / 6
                    });
                }
            });
        });
        return links;
    }, [nodes]);

    return (
        <div className="relative h-full w-full bg-[var(--surface-base)] overflow-hidden flex flex-col lg:flex-row border border-[var(--surface-border)] rounded-2xl group/hud shadow-[0_0_40px_rgba(0,0,0,0.15)]">
            {/* BACKGROUND MATRIX */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.25]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, var(--chart-grid) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--chart-grid) 1px, transparent 1px)
                     `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* HOLOGRAPHIC SCANLINE */}
            <motion.div
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[20px] bg-gradient-to-b from-transparent via-[var(--mce-primary)]/10 to-transparent z-0 pointer-events-none"
            />

            {/* LEFT HUD: CORRELATION MATRIX */}
            <div className="relative flex-1 min-h-[400px] flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-hidden">

                {/* INTERACTIVE LAYER */}
                <div className="relative w-full h-full max-w-[600px] max-h-[600px] aspect-square">

                    {/* SVG CONNECTIONS */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                        <defs>
                            <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(239, 68, 68, 0)" />
                                <stop offset="50%" stopColor="rgba(239, 68, 68, 0.4)" />
                                <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                            </linearGradient>
                        </defs>
                        {connections.map((link, i) => (
                            <motion.line
                                key={`link-${i}`}
                                x1={`${link.x1}%`} y1={`${link.y1}%`}
                                x2={`${link.x2}%`} y2={`${link.y2}%`}
                                stroke="url(#linkGradient)"
                                strokeWidth={1}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, delay: i * 0.1 }}
                            />
                        ))}
                    </svg>

                    {/* NODES */}
                    <AnimatePresence>
                        {nodes.map((node) => (
                            <motion.button
                                key={node.id}
                                onClick={() => setSelectedId(node.id)}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.2, zIndex: 40 }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group focus:outline-none"
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            >
                                {/* CRITICAL PULSE */}
                                {node.delivery_risk_rating === 'Critical' && (
                                    <motion.div
                                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-red-500 blur-[2px]"
                                    />
                                )}

                                <div className={cn(
                                    "w-3 h-3 rounded-sm border transform rotate-45 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.8)]",
                                    selectedId === node.id ? "scale-150 border-white bg-white" : "border-gray-300 bg-white/80"
                                )}
                                    style={{ borderColor: selectedId === node.id ? 'var(--white)' : node.color }}>
                                    <div className="w-full h-full opacity-50" style={{ backgroundColor: node.color }} />
                                </div>

                                {/* LABEL ON HOVER/SELECT */}
                                {(selectedId === node.id || node.riskValue >= 2) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-gray-200 shadow-lg backdrop-blur-md rounded pointer-events-none whitespace-nowrap z-50",
                                            selectedId === node.id ? "border-brand-500/50" : ""
                                        )}
                                    >
                                        <Text variant="label" className="text-gov-label text-gray-900 tracking-widest leading-none font-bold italic">
                                            {node.project_name}
                                        </Text>
                                        {selectedId === node.id && (
                                            <div className="mt-1 h-[1px] w-full bg-brand-500/50" />
                                        )}
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {/* QUADRANT LABELS */}
                <div className="absolute top-4 left-4 text-xs font-bold italic text-gray-300">HIGH_VELOCITY</div>
                <div className="absolute top-4 right-4 text-xs font-bold italic text-red-500/40">CRITICAL_MASS</div>
                <div className="absolute bottom-4 left-4 text-xs font-bold italic text-gray-300">STABLE_CORE</div>
                <div className="absolute bottom-4 right-4 text-xs font-bold italic text-blue-500/40">MODERATE_FLUX</div>
            </div>

            {/* RIGHT SIDEBAR: INTELLIGENCE PANEL */}
            <div className="w-full lg:w-[350px] bg-[var(--bg-surface)]/80 backdrop-blur-xl p-6 flex flex-col gap-6 z-40 relative border-l border-[var(--border-subtle)]">
                {/* HEADER METRICS */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <Text variant="label" color="tertiary" className="text-caption">Hazard Correlation</Text>
                            <div className="flex items-baseline gap-1">
                                <Text variant="h2" className="text-3xl leading-none text-gray-900">{exposureRate.toFixed(1)}</Text>
                                <Text variant="label" className="text-gray-500">%</Text>
                            </div>
                        </div>
                        <div className="text-right">
                            <Text variant="label" color="tertiary" className="text-caption">Active Nodes</Text>
                            <Text variant="h2" className="text-2xl leading-none text-red-500">{stats.critical}</Text>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 h-1 w-full bg-gray-200 rounded-sm overflow-hidden p-[1px]">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className={cn(
                                "h-full rounded-sm",
                                i < (exposureRate / 5) ? "bg-red-500" : "bg-gray-300"
                            )} />
                        ))}
                    </div>
                </div>

                {/* SELECTED PROJECT INTEL */}
                <div className="flex-1 min-h-0 flex flex-col bg-bg-surface -mx-6 px-6 py-4 border-y border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <Text variant="label" color="tertiary" className="text-caption">Target Analysis</Text>
                        {selectedId && <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />}
                    </div>

                    <div className="flex-1 relative">
                        <AnimatePresence mode="wait">
                            {selectedProject ? (
                                <motion.div
                                    key={selectedProject.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4 h-full overflow-y-auto custom-scrollbar pr-2"
                                >
                                    <div className="relative group p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg backdrop-blur-sm shadow-sm">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <Text variant="h4" className="text-gray-900 text-sm mb-1">{selectedProject.project_name}</Text>
                                                <Text variant="label" className="text-caption text-gray-500 italic block">{selectedProject.client_name}</Text>
                                            </div>
                                            <div className="p-1.5 bg-gray-100 rounded border border-gray-200">
                                                <Target size={14} className="text-gray-500" />
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <div className="bg-gray-50 p-2 rounded">
                                                <Text variant="label" className="text-caption text-gray-500 block mb-1">RISK_RATING</Text>
                                                <Text variant="label" className="text-caption font-bold" style={{ color: selectedProject.color }}>
                                                    {selectedProject.delivery_risk_rating?.toUpperCase()}
                                                </Text>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <Text variant="label" className="text-caption text-gray-500 block mb-1">CONTAGION</Text>
                                                <Text variant="label" className="text-caption text-gray-900 font-bold">HIGH</Text>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ALERTS FOR SELECTED */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-red-400">
                                            <AlertTriangle size={12} />
                                            <Text variant="label" className="text-gov-label">Live Signals</Text>
                                        </div>
                                        {alerts.slice(0, 2).map((alert, idx) => (
                                            <div key={idx} className="flex gap-3 p-2 border-l-2 border-red-500/50 bg-red-500/5">
                                                <Text variant="label" className="text-gov-label text-gray-800 leading-tight">{alert.title}</Text>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="w-full py-2 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 rounded text-caption font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider"
                                    >
                                        <Crosshair size={12} />
                                        Disengage Target
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-3">
                                    <Network size={32} className="text-gray-500" />
                                    <div className="space-y-1">
                                        <Text variant="label" className="text-gov-label text-gray-900">No Target Locked</Text>
                                        <Text variant="label" className="text-gov-label text-gray-500 block max-w-[180px]">Select a node from the correlation matrix to view detailed hazard intelligence.</Text>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="pt-2 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <Text variant="label" className="text-gov-label text-gray-500">LIVE_FEED_01</Text>
                    </div>
                    <Share2 size={12} className="text-gray-400" />
                </div>
            </div>
        </div>
    );
};
