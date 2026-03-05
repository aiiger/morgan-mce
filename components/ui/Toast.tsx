'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}

const config = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]'
  },
  error: {
    icon: XCircle,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.1)]'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]'
  },
  info: {
    icon: Info,
    color: 'text-brand-500',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
    shadow: 'shadow-[0_0_15px_rgba(51,57,153,0.1)]'
  }
};

export const Toast: React.FC<ToastProps> = ({ type, title, message, action, onClose }) => {
  const { icon: Icon, color, bg, border, shadow } = config[type];

  return (
    <div className={cn(
      "relative overflow-hidden group flex flex-col p-4 rounded-xl border backdrop-blur-md animate-in slide-in-from-right-full duration-300",
      bg, border, shadow
    )}>
      {/* Progress Bar Background */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-gray-50 w-full" />
      <div className={cn("absolute bottom-0 left-0 h-[2px] w-full origin-left animate-toast-progress", color.replace('text', 'bg'))} />

      <div className="flex items-start gap-3">
        <div className={cn("shrink-0 mt-0.5", color)}>
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-gov-label font-bold italic tracking-widest text-gray-900 leading-tight">
            {title}
          </h4>
          {message && (
            <p className="text-caption font-mono text-gray-500 mt-1 leading-relaxed">
              {message}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-caption font-bold italic tracking-wider text-gray-900 underline decoration-white/30 hover:decoration-white/100 transition-all"
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="shrink-0 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

