import React from 'react';
import { Box, Text } from '../primitives';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface TabNavProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
    variant?: 'category' | 'time';
    className?: string;
}

/**
 * TabNav - Standardized tab navigation component.
 * Ensures consistent height, spacing, and active state styling.
 */
export const TabNav: React.FC<TabNavProps> = ({
    tabs,
    activeTab,
    onChange,
    variant = 'category',
    className
}) => {
    return (
        <Box className={cn("flex items-center space-x-6 overflow-x-auto no-scrollbar", className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "relative h-14 flex items-center space-x-2 px-1 transition-all duration-300 group",
                            isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        )}
                    >
                        <Text
                            className={cn(
                                "text-gov-body font-medium whitespace-nowrap transition-transform duration-300",
                                isActive ? "scale-105 italic" : "group-hover:translate-x-0.5"
                            )}
                        >
                            {tab.label}
                        </Text>

                        {tab.count !== undefined && (
                            <Box className={cn(
                                "text-gov-label font-mono font-bold italic px-1.5 py-0.5 rounded-sm border transition-all duration-300",
                                isActive
                                    ? 'bg-[var(--morgan-teal)]/10 border-[var(--morgan-teal)]/20 text-[var(--morgan-teal)]'
                                    : 'bg-[var(--bg-layer)]/40 border-[var(--surface-border)] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'
                            )}>
                                {tab.count.toString().padStart(2, '0')}
                            </Box>
                        )}

                        {/* Active Indicator - Neon Blade */}
                        {isActive && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--morgan-teal)] shadow-[0_0_12px_rgba(81,162,168,0.6)] rounded-full"
                            />
                        )}
                    </button>
                );
            })}
        </Box>
    );
};

