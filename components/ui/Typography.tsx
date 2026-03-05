import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'code' | 'meta';
  children: React.ReactNode;
  className?: string;
  component?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

const variantStyles = {
  h1: 'text-3xl font-bold italic text-gray-900 tracking-tighter',
  h2: 'text-2xl font-bold italic text-gray-900 tracking-tight',
  h3: 'text-xl font-bold italic text-gray-900 tracking-tight',
  h4: 'text-lg font-bold italic text-gray-900 tracking-normal',
  body: 'text-sm text-gray-700 leading-relaxed',
  caption: 'text-xs text-gray-500 leading-normal',
  code: 'text-gov-label font-mono bg-white text-emerald-500 px-1.5 py-0.5 rounded border border-gray-200',
  meta: 'text-caption font-mono text-gray-500 tracking-widest',
};

export function Typography({ 
  variant = 'body', 
  children, 
  className,
  component
}: TypographyProps) {
  const Component = component || (variant.startsWith('h') ? (variant as any) : 'div');
  
  return (
    <Component className={cn(variantStyles[variant], className)}>
      {children}
    </Component>
  );
}

