import React from 'react';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { Watermark } from '../Watermark';
import { useStyleSystem } from '../../lib/StyleSystem';

interface AppShellProps {
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

/**
 * AppShell (2026 AAA Grade)
 * Unified layout with fixed width containment.
 * Sidebar Spacer strategy ensures no horizontal overflow.
 */
export const AppShell: React.FC<AppShellProps> = ({
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
    const collapsed = config.sidebarOptimized;

    return (
        <div className="flex h-screen w-screen overflow-hidden font-sans text-gray-900 relative selection:bg-brand-500/30">
            {/* Background Watermark */}
            <Watermark opacity={0.03} text="MORGAN" />

            {/* Fixed Sidebar */}
            <Sidebar
                activeView={activeView}
                collapsed={collapsed}
                onToggle={() => updateConfig({ sidebarOptimized: !collapsed })}
                onNavigate={onNavigate}
            />

            {/* Layout Spacer - Matches Sidebar Width */}
            <div 
                style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : '156px' }}
                className="transition-all duration-300 shrink-0" 
            />

            {/* Content Deck - flex-1 here takes EXACT remaining width */}
            <div className="flex-1 flex flex-col h-full relative z-10 min-w-0 overflow-hidden">
                <Header
                    onSearch={onSearch}
                    activeView={activeView}
                    onNavigate={onNavigate}
                    mode={mode}
                    onToggleMode={onToggleMode}
                    onNotificationsClick={onNotificationsClick}
                    unreadCount={unreadCount}
                />

                {/* Main Viewport */}
                <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-0 w-full">
                    <div className="w-full min-h-full animate-fade-in overflow-x-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};