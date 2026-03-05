import React from 'react';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { Watermark } from '../Watermark';
import { useStyleSystem } from '../../lib/StyleSystem';
import { motion, AnimatePresence } from 'framer-motion';

interface ShellProps {
    children: React.ReactNode;
    activeView: string;
    onNavigate: (view: string) => void;
    onSearch: (query: string) => void;
    mode?: 'operational' | 'executive';
    onToggleMode?: () => void;
    onNotificationsClick?: () => void;
    unreadCount?: number;
    loading?: boolean;
}

export const Shell: React.FC<ShellProps> = ({
    children,
    activeView,
    onNavigate,
    onSearch,
    mode = 'operational',
    onToggleMode,
    onNotificationsClick,
    unreadCount = 0,
    loading = false
}) => {
    const { config, updateConfig } = useStyleSystem();

    // Sidebar collapsed state driven by global config
    const sidebarCollapsed = config.sidebarOptimized;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-700 relative">
            {/* Background Watermark */}
            <Watermark opacity={0.05} text="MORGAN" />

            <Sidebar
                activeView={activeView}
                collapsed={sidebarCollapsed}
                onToggle={() => updateConfig({ sidebarOptimized: !sidebarCollapsed })}
                onNavigate={onNavigate}
            />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-[64px]' : 'ml-[200px]'} relative z-10`}>
                <Header
                    onSearch={onSearch}
                    activeView={activeView}
                    onNavigate={onNavigate}
                    mode={mode}
                    onToggleMode={onToggleMode}
                    onNotificationsClick={onNotificationsClick}
                    unreadCount={unreadCount}
                />

                <main className={`flex-1 overflow-y-auto pb-20 custom-scrollbar bg-[var(--surface-base)] ${config.density === 'executive' ? 'p-2' : 'p-6'} pt-0 relative z-10`}>
                    <div className="text-gray-700 min-h-full transition-all duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
