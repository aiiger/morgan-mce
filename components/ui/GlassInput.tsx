import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';
import { Text as UIText } from '../primitives/Text';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    error?: string;
    label?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, icon: Icon, error, label, ...props }, ref) => {
        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <UIText variant="gov-label" color="secondary" className="ml-1 block">
                        {label}
                    </UIText>
                )}
                <div className="relative group">
                    {Icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-gray-900">
                            <Icon size={14} />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "flex h-10 w-full rounded-lg border bg-[var(--surface-layer)] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-bold italic placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--mce-primary)] focus-visible:border-[var(--mce-primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 font-sans text-gray-700 border-[var(--surface-border)] hover:bg-gray-50/80",
                            Icon && "pl-9",
                            error && "border-rose-500 focus-visible:ring-rose-500",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <UIText variant="caption" color="critical" className="ml-1 flex items-center animate-in slide-in-from-left-1 fade-in !text-caption">
                        <span className="w-1 h-1 bg-rose-500 rounded-full mr-1.5" />
                        {error}
                    </UIText>
                )}
            </div>
        );
    }
);
