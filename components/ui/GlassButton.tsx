import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'critical';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        const baseStyles = "group inline-flex items-center justify-center rounded-lg font-bold italic transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[var(--mce-primary)]/50 border font-brand tracking-[0.15em] uppercase";

        const variants = {
            primary: "bg-[var(--mce-primary)] border-[var(--mce-primary)] text-gray-900 hover:bg-[var(--mce-primary)]/90 shadow-[0_0_15px_rgba(194,23,25,0.4)] hover:shadow-[0_0_25px_rgba(194,23,25,0.6)]",
            secondary: "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200 backdrop-blur-md",
            ghost: "bg-transparent border-transparent text-gray-500 hover:text-gray-900 hover:bg-white",
            critical: "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20 hover:border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10 p-0"
        };

        const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

        const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
            const button = e.currentTarget;
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const newRipple = { x, y, id: Date.now() };
            setRipples((prev) => [...prev, newRipple]);

            if (props.onClick) props.onClick(e);
        };

        React.useEffect(() => {
            if (ripples.length > 0) {
                const timeout = setTimeout(() => setRipples((prev) => prev.slice(1)), 600);
                return () => clearTimeout(timeout);
            }
        }, [ripples]);

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], "relative overflow-hidden", className)}
                disabled={isLoading || props.disabled}
                {...props}
                onClick={createRipple}
            >
                {ripples.map((ripple) => (
                    <span
                        key={ripple.id}
                        className="absolute rounded-full pointer-events-none animate-ripple"
                        style={{
                            top: ripple.y,
                            left: ripple.x,
                            width: Math.max(100, (props.style?.width as number) || 100) * 2,
                            height: Math.max(100, (props.style?.height as number) || 100) * 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            transform: 'scale(0)',
                            animationDuration: '600ms',
                        }}
                    />
                ))}
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin relative z-10" />}
                {!isLoading && <span className="relative z-10 flex items-center gap-2">{children}</span>}
                {variant === 'primary' && !isLoading && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                )}

                {/* High-Tech Hover Sheen */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-sheen-slide bg-gradient-to-r from-transparent via-white/20 to-transparent z-20 skew-x-[-15deg] pointer-events-none" />
            </button>
        );
    }
);
GlassButton.displayName = "GlassButton";

