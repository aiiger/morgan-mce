import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from '../primitives';

interface DashboardFrameProps {
    title: string;
    subtitle?: string;
    metrics?: React.ReactNode;
    tabs?: React.ReactNode;
    children: React.ReactNode;
    loading?: boolean;
}

/**
 * DashboardFrame - 2026 ARCHITECTURAL STABILITY
 * Relies on AppShell container logic for perfect width containment.
 */
export const DashboardFrame: React.FC<DashboardFrameProps> = ({
    title,
    subtitle,
    metrics,
    tabs,
    children,
    loading = false
}) => {
    return (
        <div className="flex flex-col w-full min-w-0 space-y-[var(--space-4)] p-[var(--gov-s3)] relative box-border">
            {/* Neural Top-Bar */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "circIn" }}
                        className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--brand-accent)] origin-left z-50 shadow-[0_0_10px_rgba(81,162,168,0.5)]"
                    />
                )}
            </AnimatePresence>

            {/* 1. Header Section (Restored) */}
            <header className="mb-6 shrink-0 w-full min-w-0">
                <h1 className="text-3xl font-bold tracking-tighter font-oswald text-[var(--text-primary)]">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">
                        {subtitle}
                    </p>
                )}
            </header>

            {/* 2. Metric Summary Row */}
            {metrics && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-6)] mb-[var(--space-8)] shrink-0 w-full min-w-0">
                    {metrics}
                </section>
            )}

            {/* 3. Navigation Tabs */}
            {tabs && (
                <nav className="mb-4 shrink-0 w-full min-w-0">
                    {tabs}
                </nav>
            )}

            {/* 4. Primary Data Surface */}
            <main className={cn(
                "relative rounded-[var(--gov-radius)] transition-all duration-500 w-full min-w-0 overflow-hidden",
                "bg-[var(--frame-bg)] border-[4px] border-[var(--frame-border)] shadow-[var(--frame-shadow)]",
                "before:absolute before:inset-0 before:border before:border-gray-200 before:pointer-events-none before:z-50"
            )}>
                <div className={cn(
                    "w-full transition-all duration-700 ease-in-out",
                    loading ? "opacity-20 blur-md grayscale pointer-events-none scale-[0.99]" : "opacity-100 blur-0 grayscale-0 scale-100"
                )}>
                    {children}
                </div>

                {/* Loading Overlay */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center pointer-events-none z-[60]"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-8 h-8 border-2 border-[var(--brand-accent)]/20 border-t-[var(--brand-accent)] rounded-full"
                                />
                                <span className="text-caption font-bold italic text-[var(--brand-accent)]/60 tracking-[0.3em] font-oswald uppercase">Neural_Syncing...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            
            {/* Structural Bottom Buffer */}
            <div className="h-12 shrink-0" />
        </div>
    );
};
