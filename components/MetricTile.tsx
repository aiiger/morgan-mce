import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { KPIMetric } from '../types';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricTileProps {
  metric: KPIMetric;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'rose' | 'orange' | 'cyan';
  variant?: 'default' | 'filled';
  index?: number;
  onClick?: () => void;
}

const AnimatedCounter: React.FC<{ value: string | number; isNumber?: boolean }> = ({ value, isNumber = true }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isNumber) return;

    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : Number(value);
    if (isNaN(numValue)) {
      setDisplayValue(0);
      return;
    }

    if (numValue === 0) {
      setDisplayValue(0);
      return;
    }

    let startValue = displayValue;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const nextValue = startValue + (numValue - startValue) * easeProgress;
      setDisplayValue(nextValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, isNumber]);

  if (!isNumber) return <>{value}</>;

  if (typeof value === 'string' && value.includes('M')) {
    return <>{displayValue.toFixed(1)}M</>;
  }
  if (typeof value === 'string' && value.includes('%')) {
    return <>{Math.round(displayValue)}%</>;
  }
  return <>{Math.round(displayValue)}</>;
};

/**
 * MetricTile - THEME AWARE 2026 (GOLDEN STATE)
 * Protects Dark Mode (Charcoal) | Enhances Light Mode (White/Blue)
 */
export const MetricTile: React.FC<MetricTileProps> = ({ metric, icon: Icon, color, variant = 'default', index = 0, onClick }) => {
  const formattedValue = typeof metric.value === 'number' && metric.value < 10 && metric.value > 0
    ? `0${metric.value}`
    : metric.value;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col p-6 rounded-xl border transition-all duration-300 h-full overflow-hidden",
        "bg-[var(--kpi-bg)] border-[var(--kpi-border)] shadow-[var(--kpi-shadow)]",
        onClick ? "cursor-pointer" : ""
      )}
    >
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-[var(--kpi-accent-bar)]" />

      {/* Label Row */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-caption font-bold tracking-[0.2em] text-[var(--kpi-text-label)]">
          {metric.label}
        </span>
        <Icon size={14} className="text-[var(--kpi-text-primary)] opacity-40" strokeWidth={2.5} />
      </div>

      {/* Value Row */}
      <div className="flex flex-col items-start gap-1 relative z-10 mb-2">
        <span className="text-4xl font-bold italic tracking-tighter font-oswald leading-none text-[var(--kpi-text-primary)]">
          <AnimatedCounter value={formattedValue} isNumber={typeof metric.value === 'number'} />
          {metric.isCurrency && <span className="text-sm align-top ml-1 opacity-60">AED</span>}
        </span>
      </div>

      {/* Footer / Trend Pill */}
      {(metric.status || metric.trend) && (
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--surface-border)] relative z-10">
          {metric.status && (
            <span className="text-gov-label font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border bg-[var(--brand-accent)]/5 text-[var(--brand-accent)] border-[var(--brand-accent)]/20">
              {metric.status}
            </span>
          )}
          {metric.trend && (
            <span className={cn(
              "text-caption font-bold italic font-oswald uppercase flex items-center gap-1",
              metric.trendSentiment === 'positive' ? "text-emerald-600" : "text-[var(--mce-red)]"
            )}>
              {metric.trendSentiment === 'positive' ? '↑' : '↓'} {metric.trend}
            </span>
          )}
        </div>
      )}

      {/* Subtle Blueprint Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden rounded-xl">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      </div>
    </motion.div>
  );
};