import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType;
    children: React.ReactNode;
    variant?: 'base' | 'hover' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    [key: string]: any;
}

/**
 * Card Primitive
 * Surface container for grouping content.
 */
export const Card = React.forwardRef<HTMLElement, CardProps>(
    ({ as: Component = 'div', className, variant = 'base', padding = 'md', children, ...props }, ref) => {

        const variants = {
            base: "bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]",
            hover: "bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
            glass: "bg-gray-50 border border-gray-200 backdrop-blur-xl shadow-[var(--shadow-lg)]",
        };

        const paddings = {
            none: "p-0",
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
        };

        return (
            <Component
                ref={ref}
                className={cn(
                    "rounded-[var(--radius-lg)] overflow-hidden",
                    variants[variant],
                    paddings[padding],
                    className
                )}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

Card.displayName = 'Card';
