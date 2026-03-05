import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ProjectionPulseProps {
  data: Array<{ month: string; value: number }>;
  trend?: number;
  insight?: string;
}

export const ProjectionPulse: React.FC<ProjectionPulseProps> = ({
  data,
  trend = 12.4,
  insight = 'Fiscal engine identifies maturing assets. Revenue yield projected at'
}) => {
  return (
    <motion.div
      className="h-[400px] bg-[var(--bg-surface)] backdrop-blur-md border border-[var(--border-subtle)] rounded-xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.25)] relative overflow-hidden flex flex-col group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Dynamic Background Pulse - Glass Motion Layer */}
      {/* Dynamic Background Pulse - Glass Motion Layer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-80 transition-all duration-500"
        style={{ background: 'var(--bg-glass-accent)' }}
      />

      {/* Header */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-bold italic text-[var(--text-primary)] tracking-tight uppercase">Projection Pulse</h3>
          <div className="h-1.5 w-1.5 bg-[var(--brand-accent)] rounded-full animate-pulse" />
        </div>
        <p className="text-caption font-bold italic text-[var(--text-secondary)] uppercase tracking-widest">Temporal Fiscal Clustering // AI Forecast</p>
      </div>

      {/* Chart Container */}
      <div className="flex-1 w-full relative z-10 mb-6 -mx-6 px-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity={0.35} />
                <stop offset="70%" stopColor="var(--brand-accent-2)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity={0} />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" strokeOpacity={0.5} />
            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.1)"
              style={{ fill: 'var(--text-tertiary)' }}
              className="text-caption text-[var(--text-tertiary)] tracking-wide"
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ stroke: 'var(--brand-accent)', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.4 }}
              contentStyle={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)'
              }}
              itemStyle={{ color: 'var(--text-primary)', fontSize: '12px' }}
              labelStyle={{ color: 'var(--text-secondary)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--brand-accent)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#pulseGradient)"
              animationDuration={2000}
              animationBegin={200}
              animationEasing="ease-in-out"
              dot={false}
              filter="url(#glow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insight Bar */}
      <motion.div
        className="relative z-10 bg-[var(--bg-surface)]/40 border border-[var(--brand-accent)]/20 rounded-xl p-4 flex items-center gap-4 backdrop-blur-sm"
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="bg-[var(--brand-accent)]/10 p-2 rounded-lg">
          <TrendingUp size={16} className="text-[var(--brand-accent)] flex-shrink-0" />
        </div>
        <div className="flex-1">
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            {insight} <span className="font-bold italic text-[var(--brand-accent)] text-sm ml-1">+{trend}%</span>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
