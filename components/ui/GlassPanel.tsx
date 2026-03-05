import React from 'react';
import { cn } from '../../lib/utils';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'base' | 'elevated' | 'bordered';
    intensity?: 'low' | 'medium' | 'high';
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
    ({ className, variant = 'base', intensity = 'medium', children, ...props }, ref) => {

        const baseStyles = "rounded-xl border transition-all duration-300 backdrop-blur-xl relative overflow-hidden";

        const variants = {
            base: "bg-white/60 border-[var(--surface-border)]",
            elevated: "bg-[var(--surface-elevated)]/80 border-gray-200 shadow-2xl",
            bordered: "bg-transparent border-gray-200"
        };

        const intensities = {
            low: "backdrop-blur-sm",
            medium: "backdrop-blur-md",
            high: "backdrop-blur-xl"
        };

        return (
            <div
                ref={ref}
                className={cn(baseStyles, variants[variant], intensities[intensity], className)}
                {...props}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        );
    }
);
GlassPanel.displayName = "GlassPanel";

