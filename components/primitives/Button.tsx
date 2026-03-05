import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'critical';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    as?: React.ElementType;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    [key: string]: any;
}

/**
 * Button Primitive
 * Standardized interaction element.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'md',
        isLoading = false,
        leftIcon,
        rightIcon,
        children,
        disabled,
        ...props
    }, ref) => {

        const variants = {
            primary: "bg-[var(--color-brand)] text-white hover:bg-opacity-90 shadow-md",
            secondary: "bg-[var(--bg-active)] text-white hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]",
            outline: "bg-transparent border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--text-secondary)]",
            ghost: "bg-transparent text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]",
            critical: "bg-[var(--color-critical)] text-white hover:bg-opacity-90 shadow-md",
        };

        const sizes = {
            sm: "h-[32px] px-3 text-xs rounded-[var(--radius-sm)]",
            md: "h-[40px] px-4 text-gov-body rounded-[var(--radius-md)]",
            lg: "h-[44px] px-6 text-sm rounded-[var(--radius-md)]",
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center justify-center font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';
