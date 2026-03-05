'use client';

import React from 'react';
import { Activity, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskPulseProps {
  status?: 'STABLE' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  score?: number;
  className?: string;
}

export const RiskPulse: React.FC<RiskPulseProps> = ({ status = 'UNKNOWN', score = 0, className }) => {
  const getColors = () => {
    switch (status) {
      case 'CRITICAL': return 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse-fast';
      case 'WARNING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'STABLE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-gray-500 bg-bg-surface border-gray-200';
    }
  };

  const Icon = status === 'CRITICAL' ? ShieldAlert : status === 'WARNING' ? AlertCircle : CheckCircle2;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1 rounded-full border text-gov-label font-bold italic tracking-[0.15em] transition-all duration-500",
      getColors(),
      className
    )}>
      <div className="relative">
        <Icon size={12} />
        {status !== 'STABLE' && status !== 'UNKNOWN' && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-current rounded-full animate-ping opacity-75" />
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <span>Risk Profile: {status}</span>
        {score > 0 && <span className="opacity-40">({score}%)</span>}
      </div>
    </div>
  );
};
