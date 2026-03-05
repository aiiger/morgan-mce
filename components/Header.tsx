'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Search, User, SlidersHorizontal, HelpCircle, Layout, Activity, Sun, Moon } from 'lucide-react';
import { GlassButton } from '@/components/ui/GlassButton';
import { useTheme } from '@/hooks/useTheme';

import { NotificationBell } from '@/components/notifications/NotificationBell';
import type { Notification } from '@/components/notifications/NotificationBell';

interface HeaderProps {
  onSearch: (query: string) => void;
  activeView?: string;
  onNavigate?: (view: string) => void;
  mode?: 'operational' | 'executive';
  onToggleMode?: () => void;
  onNotificationsClick?: () => void;
  unreadCount?: number;
}

// Sample notifications data - this should be fetched from your data layer

export const Header: React.FC<HeaderProps> = ({ onSearch, activeView, onNavigate, mode = 'operational', onToggleMode, onNotificationsClick, unreadCount = 2 }) => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : [])
      .then((data: Notification[]) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Dynamic page title based on activeView
  const getPageTitle = () => {
    switch (activeView) {
      case 'projects': return 'Projects';
      case 'financials': return 'Financials';
      case 'tenders': return 'Tenders';
      case 'documents': return 'Documents';
      case 'tasks': return 'Tasks';
      case 'calendar': return 'Calendar';
      case 'reports': return 'Reports';
      case 'field': return 'Field Operations';
      case 'intelligence': return 'Intelligence';
      case 'settings': return 'Settings';
      case 'profile': return 'Profile';
      default: return 'Operational Workspace';
    }
  };

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-gray-200 px-8 py-3 flex items-center justify-between transition-all duration-300">

      {/* Dynamic Branding with Glow */}
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 rounded-full bg-[var(--brand-accent)] shadow-[0_0_12px_var(--brand-accent)]" />
        <div className="flex flex-col">
          <span 
            className="text-sm font-oswald font-bold italic tracking-wider select-none text-gray-900 uppercase transition-all duration-500"
            style={{ textShadow: 'var(--header-title-glow)' }}
          >
            {getPageTitle()}
          </span>
          <span className="text-caption font-bold text-blue-600 uppercase tracking-[0.3em] -mt-0.5">Beta Release V1.0</span>
        </div>
      </div>

      {/* High-Fidelity Actions */}
      <div className="flex items-center space-x-4">

        {/* Global Control Group */}
        <div className="flex items-center space-x-2">
          {onToggleMode && (
            <GlassButton
              variant="ghost"
              size="icon"
              onClick={onToggleMode}
              aria-label={`Switch to ${mode === 'operational' ? 'Executive' : 'Operational'} Mode`}
              className={`transition-all duration-300 ${mode === 'executive'
                ? 'text-blue-600 bg-blue-50 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
                }`}
              title="Toggle Executive Mode"
            >
              {mode === 'executive' ? <Activity size={14} /> : <Layout size={14} />}
            </GlassButton>
          )}
          <GlassButton
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle Light Mode"
            className="transition-colors text-gray-500 hover:text-gray-900"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </GlassButton>
          <GlassButton
            variant="ghost"
            size="icon"
            onClick={() => onNavigate && onNavigate('settings')}
            aria-label="System Settings"
            className={`transition-colors ${activeView === 'settings' ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900'}`}
            title="Settings"
          >
            <SlidersHorizontal size={14} />
          </GlassButton>

          <NotificationBell
            notifications={notifications}
            unreadCount={notifications.filter(n => !n.read_at).length || unreadCount}
            onNavigateToNotifications={() => onNavigate && onNavigate('notifications')}
            onMarkAllRead={() => { }}
          />

          <button
            onClick={() => onNavigate && onNavigate('profile')}
            aria-label="User Profile"
            className="flex items-center group ml-4"
          >
            <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200 text-caption flex items-center justify-center font-bold italic text-gray-700 group-hover:bg-gray-200 transition-colors font-mono">MC</div>
          </button>
        </div>
      </div>
    </header>
  );
};
