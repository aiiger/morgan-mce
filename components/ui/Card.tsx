import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive' | 'matte';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-50/80 border border-gray-200 shadow-sm backdrop-blur-md',
  elevated: 'bg-white shadow-lg border border-gray-200-strong backdrop-blur-xl',
  outlined: 'bg-transparent border-2 border-gray-200',
  interactive: `
    bg-gray-50/80 border border-gray-200
    transition-all duration-300 ease-out
    hover:border-brand-500/40 hover:bg-white-elevated hover:shadow-glow-strong hover:-translate-y-1 hover:scale-[1.01]
    cursor-pointer group
  `,
  matte: 'matte-surface border border-gray-200'
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, variant = 'default', padding = 'md', className }: CardProps) {
  return (
    <div className={cn('rounded-xl overflow-hidden', variantStyles[variant], paddingStyles[padding], className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-4 gap-4 min-w-0', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-sm font-bold italic text-gray-900 min-w-0 truncate flex-1', className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}
