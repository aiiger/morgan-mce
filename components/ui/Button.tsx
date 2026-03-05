'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xs';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles = {
  primary: `
    bg-brand-500 text-gray-900 border border-brand-600
    hover:bg-brand-600 hover:shadow-lg
    active:bg-brand-700
    disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200
    focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-black
  `,
  secondary: `
    bg-white text-gray-700 border border-gray-200-strong
    hover:bg-white-elevated hover:border-gray-200
    active:bg-bg-active
    disabled:opacity-50
    focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black
  `,
  tertiary: `
    bg-gray-100 text-gray-500 border border-transparent
    hover:bg-gray-100 hover:text-gray-900
    active:bg-gray-200
  `,
  danger: `
    bg-rose-500/10 text-rose-500 border border-rose-500/20
    hover:bg-rose-500 hover:text-gray-900
    active:bg-rose-600
  `,
  ghost: `
    bg-transparent text-gray-500 border border-transparent
    hover:bg-white hover:text-gray-700
    active:bg-gray-100
  `,
  glass: `
    bg-white backdrop-blur-md text-gray-900 border border-gray-200-strong
    hover:bg-white-elevated hover:border-gray-200 hover:shadow-lg
    active:bg-white-elevated
  `
};

const sizeStyles = {
  xs: 'px-2.5 py-1 text-xs font-bold italic',
  sm: 'px-3 py-1.5 text-sm font-bold italic',
  md: 'px-4 py-2 text-sm font-bold italic',
  lg: 'px-6 py-3 text-base font-bold italic',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-lg transition-all duration-200',
        'hover:scale-[1.02] active:scale-[0.98]',
        'focus:outline-none',
        'disabled:cursor-not-allowed disabled:hover:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={14} />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
});

Button.displayName = 'Button';

