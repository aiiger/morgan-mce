import React, { ReactNode } from 'react';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface MetricBlockProps {
    label: string;
    value: string | number | ReactNode;
    unit?: string;
    isCurrency?: boolean;
    trend?: {
        value: number;
        type: 'up' | 'down';
    };
    status?: 'nominal' | 'warning' | 'critical' | 'inactive';
    lastAudited?: string; // e.g., "12:00 PM"
    className?: string;
}

/**
 * MetricBlock - THEME AWARE 2026 (GOLDEN STATE)
 * Protects Dark Mode (Charcoal) | Enhances Light Mode (White/Blue)
 */
export const MetricBlock: React.FC<MetricBlockProps> = ({
    label,
    value,
    unit,
    isCurrency,
    trend,
    status = 'nominal',
    lastAudited,
    className
}) => {
    const formattedValue = typeof value === 'number'
        ? (value > 1000000
            ? `${(value / 1000000).toFixed(1)}M`
            : value.toLocaleString())
        : value;

    return (
        <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            className={cn(
                "relative group flex flex-col p-6 rounded-xl border transition-all duration-300",
                "bg-[var(--kpi-bg)] border-[var(--kpi-border)] shadow-[var(--kpi-shadow)]",
                className
            )}
        >
            {/* Top Accent Bar - Theme Aware */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-[var(--kpi-accent-bar)]" />

            {/* Label Row */}
            <Box className="flex justify-between items-start mb-4">
                <Text className="text-caption font-bold tracking-[0.2em] text-[var(--kpi-text-label)]">
                    {label}
                </Text>
            </Box>

            {/* Value Row */}
            <Box className="flex items-baseline gap-1.5 mb-1">
                <Text className="text-4xl font-bold italic tracking-tighter font-oswald leading-none text-[var(--kpi-text-primary)]">
                    {isCurrency && <span className="text-sm align-top mr-0.5 opacity-60">AED</span>}
                    {formattedValue}
                </Text>
                {unit && !isCurrency && (
                    <Text className="text-caption font-bold tracking-widest text-[var(--kpi-text-label)] opacity-60">
                        {unit}
                    </Text>
                )}
            </Box>

            {/* Footer Row */}
            <Box className="mt-auto pt-3 flex items-center justify-between border-t border-[var(--surface-border)]">
                {trend ? (
                    <Box className={cn(
                        "flex items-center gap-1 text-caption font-bold italic font-oswald uppercase",
                        trend.type === 'up' ? "text-emerald-500" : "text-[var(--mce-red)]"
                    )}>
                        {trend.type === 'up' ? '↑' : '↓'} {trend.value}%
                        <span className="text-caption opacity-40 font-sans tracking-tight ml-1 font-normal not-italic">vs prev</span>
                    </Box>
                ) : (
                    <div />
                )}

                {lastAudited && (
                    <Text className="text-caption text-[var(--kpi-text-label)] font-bold uppercase tracking-widest opacity-40">
                        LOCK_{lastAudited}
                    </Text>
                )}
            </Box>

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden rounded-xl">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
            </div>
        </motion.div>
    );
};
