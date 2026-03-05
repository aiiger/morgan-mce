import React from 'react';
import { cn } from '@/lib/utils';

type TextVariant =
    | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'label' | 'caption' | 'mono'
    | 'gov-hero' | 'gov-title' | 'gov-header' | 'gov-body' | 'gov-label' | 'gov-metric' | 'gov-table';

type TextColor =
    | 'primary' | 'secondary' | 'tertiary' | 'disabled'
    | 'critical' | 'warning' | 'success' | 'info'
    | 'white' | 'brand';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    as?: React.ElementType;
    variant?: TextVariant;
    color?: TextColor;
    className?: string;
    children: React.ReactNode;
    [key: string]: any;
}

/**
 * Text Primitive
 * Enforces typography scale and color system.
 * 
 * Variants:
 * - h1: Page Title (32px, bold)
 * - h2: Section Title (20px, semibold)
 * - h3: Subsection Title (16px, semibold)
 * - h4: Group Title (14px, medium)
 * - body: Standard text (13px, normal)
 * - label: UI Labels (12px, medium, uppercased sometimes)
 * - caption: Helper text (10px/11px)
 * - mono: Monospace data
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(
    ({ as, variant = 'body', color = 'primary', className, children, ...props }, ref) => {

        // Default element mapping based on variant
        const Component = as || (
            variant === 'h1' ? 'h1' :
                variant === 'h2' ? 'h2' :
                    variant === 'h3' ? 'h3' :
                        variant === 'h4' ? 'h4' :
                            variant === 'label' ? 'span' :
                                variant === 'caption' ? 'span' :
                                    variant === 'mono' ? 'code' :
                                        'p'
        );

        const variantStyles: Record<TextVariant, string> = {
            // Default variants now map to governance scale (tailwind.config.ts)
            // and apply the “strong cockpit” typographic character.
            h1: "font-sans text-gov-hero font-bold tracking-[-0.01em]",
            h2: "font-sans text-gov-title font-bold tracking-[-0.01em]",
            h3: "font-sans text-gov-title font-bold tracking-[-0.01em]",
            h4: "font-sans text-gov-header font-bold tracking-[-0.01em]",
            body: "font-sans text-gov-body font-bold italic leading-relaxed tracking-tight",
            label: "font-sans text-gov-label font-bold tracking-[0.15em]",
            caption: "font-sans text-gov-table font-bold italic tracking-tight",
            mono: "font-mono text-gov-body font-bold italic tracking-tight",

            'gov-hero': "text-gov-hero font-bold tracking-[-0.01em]",
            'gov-title': "text-gov-title font-bold tracking-[-0.01em]",
            'gov-header': "text-gov-header font-bold tracking-[0.15em]",
            'gov-label': "text-gov-label font-bold tracking-[0.2em] opacity-70",
            'gov-body': "text-gov-body font-bold italic leading-relaxed tracking-tight",
            'gov-metric': "text-gov-metric font-mono font-bold italic tracking-tight",
            'gov-table': "text-gov-table font-bold italic tracking-tight",
        };

        const colorStyles = {
            primary: "text-[var(--text-primary)]",
            secondary: "text-[var(--text-secondary)]",
            tertiary: "text-[var(--text-tertiary)]",
            disabled: "text-[var(--text-disabled)]",
            critical: "text-[var(--color-critical)]",
            warning: "text-[var(--color-warning)]",
            success: "text-[var(--color-success)]",
            info: "text-[var(--color-info)]",
            white: "text-white",
            brand: "text-[var(--color-brand)]",
        };

        return (
            <Component
                ref={ref}
                className={cn(variantStyles[variant], colorStyles[color], className)}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

Text.displayName = 'Text';
