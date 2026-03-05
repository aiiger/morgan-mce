import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface BadgeProps {
  status?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  className?: string;
  children: React.ReactNode;
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status = '', variant, className = '', children, showIcon = false }) => {
  const getIcon = () => {
    if (variant === 'success' || status.toLowerCase().includes('success') || status.toLowerCase().includes('approv')) {
      return <CheckCircle2 size={10} />;
    }
    if (variant === 'danger' || status.toLowerCase().includes('critical') || status.toLowerCase().includes('reject')) {
      return <AlertCircle size={10} />;
    }
    if (variant === 'warning' || status.toLowerCase().includes('pending') || status.toLowerCase().includes('warning')) {
      return <AlertTriangle size={10} />;
    }
    if (variant === 'info') {
      return <Info size={10} />;
    }
    return null;
  };

  const getStyles = () => {
    // Branded Tiered States
    if (variant) {
      switch (variant) {
        case 'success': return 'border-[var(--color-success)]/20 text-[var(--color-success)]/80 bg-[var(--color-success)]/5 motion-success';
        case 'warning': return 'border-[var(--color-warning)]/20 text-[var(--color-warning)]/80 bg-[var(--color-warning)]/5 motion-warning';
        case 'danger': return 'border-[var(--color-critical)]/20 text-[var(--color-critical)]/80 bg-[var(--color-critical)]/5 motion-critical';
        case 'info': return 'border-[var(--color-info)]/20 text-[var(--color-info)]/80 bg-[var(--color-info)]/5';
        case 'outline': return 'border-[var(--surface-border)] text-[var(--text-secondary)] bg-transparent';
        default: return 'border-[var(--surface-border)] text-[var(--text-secondary)] bg-[var(--surface-base)]';
      }
    }

    // Otherwise infer from status string
    const s = status.toLowerCase();

    if (s.includes('review') || s.includes('approv') || s.includes('success') || s.includes('track') || s.includes('paid') || s.includes('active')) {
      return 'border-[var(--color-success)]/20 text-[var(--color-success)]/80 bg-[var(--color-success)]/5';
    }
    if (s.includes('pending') || s.includes('wait') || s.includes('progress') || s.includes('warning') || s.includes('delayed')) {
      return 'border-[var(--color-warning)]/20 text-[var(--color-warning)]/80 bg-[var(--color-warning)]/5 motion-warning';
    }
    if (s.includes('reject') || s.includes('fail') || s.includes('error') || s.includes('overdue') || s.includes('critical') || s.includes('risk')) {
      return 'border-[var(--color-critical)]/20 text-[var(--color-critical)]/80 bg-[var(--color-critical)]/5 motion-critical';
    }

    return 'border-[var(--surface-border)] text-[var(--text-secondary)] bg-[var(--surface-base)]';
  };

  const isCritical = variant === 'danger' || status.toLowerCase().includes('critical');

  return (
    <motion.span
      className={`px-2.5 py-1 rounded-lg text-caption uppercase tracking-[0.15em] font-bold italic border flex items-center gap-1.5 ${getStyles()} font-sans ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        ...(isCritical && showIcon && {
          boxShadow: [
            '0 0 0 0 rgba(244, 63, 94, 0.4)',
            '0 0 0 8px rgba(244, 63, 94, 0)',
          ]
        })
      }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
        boxShadow: {
          duration: 1.5,
          repeat: isCritical && showIcon ? Infinity : 0,
          ease: 'easeOut'
        }
      }}
      whileHover={{ scale: 1.05, y: -1 }}
    >
      {showIcon && getIcon()}
      {children}
    </motion.span>
  );
};
