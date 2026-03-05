import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileText,
  PieChart,
  Users,
  Settings,
  Activity,
  Bot,
  Globe,
  Zap,
  Plus,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Star,
  Folder,
  BarChart,
  Lock,
  Info,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { useUserTier } from '../hooks/useUserTier';
import { useDashboardData } from '../hooks/useDashboardData';
import { supabase } from '../lib/supabase';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  requiredTier?: string;
  subItems?: MenuItem[];
  customTab?: {
    url: string | null;
    viewId: string | null;
  };
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

/**
 * APPLE-GRADE PRODUCTION SIDEBAR (V3 FINAL)
 * Tunable Alignment | Unified Vertical Axis | Golden State DNA
 */
export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  collapsed,
  onToggle
}) => {
  const [customTabs, setCustomTabs] = useState<any[]>([]);
  const [expandedItems, setExpandedGroups] = useState<string[]>(['mesh']);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  const { hasPermission } = useUserTier();

  useEffect(() => { fetchCustomTabs(); }, []);

  const toggleSection = (title: string) => {
    setCollapsedSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const fetchCustomTabs = async () => {
    try {
      const { data } = await supabase
        .from('custom_sidebar_tabs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data) setCustomTabs(data);
    } catch (err) { console.error('Tab sync failed:', err); }
  };

  const toggleExpand = (id: string) => {
    setExpandedGroups(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  let clerk: any;
  try { clerk = useClerk(); } catch (e) { clerk = null; }
  const handleLogout = () => { if (clerk) clerk.signOut(); };

  const menuGroups: MenuGroup[] = [
    {
      title: 'PORTFOLIO',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: Building2 },
        { id: 'tenders', label: 'Tenders', icon: Briefcase },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'liability', label: 'Risk Desk', icon: ShieldAlert },
        { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
        { id: 'calendar', label: 'Calendar', icon: Icons.Calendar },
        { id: 'cockpit', label: 'Strategic', icon: Activity, requiredTier: 'L3' },
      ]
    },
    {
      title: 'FINANCIAL',
      items: [
        { id: 'financials', label: 'Financials', icon: PieChart },
        { id: 'reports', label: 'Reports', icon: FileText },
      ]
    },
    {
      title: 'TEAM & MESH',
      items: [
        {
          id: 'mesh',
          label: 'Neural', 
          icon: Globe,
          subItems: [
            { id: 'integrations', label: 'Mesh Sync', icon: Zap },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'agents', label: 'Agents', icon: Bot, requiredTier: 'L3' },
          ]
        },
      ]
    },
  ];

  const filterItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      const permitted = true; 
      if (!permitted) return false;
      if (item.subItems) {
        item.subItems = filterItems(item.subItems);
        return item.subItems.length > 0;
      }
      return true;
    });
  };

  let visibleMenuGroups = menuGroups.map(group => ({
    ...group,
    items: filterItems(group.items)
  })).filter(group => group.items.length > 0);

  const renderMenuItem = (item: MenuItem, isSubItem = false) => {
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeView === item.id || (item.subItems?.some(s => s.id === activeView));

    return (
      <React.Fragment key={item.id}>
        <button
          onClick={() => {
            if (item.subItems) {
              toggleExpand(item.id);
            } else if (item.customTab?.url) {
              window.open(item.customTab.url, '_blank');
            } else {
              onNavigate(item.id);
            }
          }}
          aria-label={item.label}
          style={{ paddingLeft: 'var(--sidebar-item-pl)' }}
          className={cn(
            "w-full flex items-center h-[36px] pr-4 rounded-lg transition-all duration-300 group relative",
            isActive && !item.subItems
              ? 'bg-[var(--bg-active)] text-[var(--text-primary)] shadow-sm border border-[var(--surface-border)]'
              : 'text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]'
          )}
        >
          {isActive && !item.subItems && (
            <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-[var(--accent-primary)] rounded-r-full shadow-glow"></div>
          )}
          <div className={cn(
            "flex items-center justify-center w-4 shrink-0 transition-colors",
            isActive ? 'text-[var(--brand-accent)]' : 'text-[var(--sidebar-text-muted)] group-hover:text-[var(--sidebar-text)]'
          )}>
            <item.icon size={isSubItem ? 12 : 14} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          {!collapsed && (
            <span
              className={cn(
                "ml-4 transition-colors whitespace-nowrap flex-1 text-left text-gov-label font-oswald font-bold tracking-[0.15em]",
                isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'
              )}
            >
              {item.label}
            </span>
          )}

          {!collapsed && item.subItems && (
            <ChevronDown size={11} className={cn("transition-transform duration-200", isExpanded ? 'rotate-180' : '')} />
          )}
        </button>
        {!collapsed && item.subItems && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.subItems.map(sub => renderMenuItem(sub, true))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <aside 
      style={{ 
        boxShadow: 'inset -1px 0 0 rgba(255, 255, 255, 0.03)',
        width: collapsed ? 'var(--sidebar-collapsed-width)' : '156px'
      }}
      className="fixed left-0 top-0 h-screen overflow-hidden bg-[var(--sidebar-bg)] backdrop-blur-2xl border-r border-[var(--sidebar-border)] transition-all duration-300 z-50 flex flex-col group/sidebar"
    >

      {/* BRAND APEX */}
      <div className="h-12 flex items-center relative bg-[var(--sidebar-bg)]">
        <div 
          style={{ paddingLeft: collapsed ? 'var(--sidebar-collapsed-logo-pl)' : 'var(--sidebar-logo-pl)' }}
          className="flex items-center transition-all duration-300"
        >
          <span className="font-oswald italic font-bold text-xl tracking-tight select-none text-[var(--sidebar-text)]">
            {collapsed ? 'M' : 'Morgan'}
          </span>
        </div>

        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="absolute right-[-10px] top-1/2 -translate-y-1/2 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] text-[var(--sidebar-text-muted)] p-0.5 rounded-full hover:text-[var(--sidebar-text)] transition-all z-50 opacity-0 group-hover/sidebar:opacity-100 shadow-lg"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* CORE NAVIGATION */}
      <nav className="flex-1 py-3 px-0 flex flex-col gap-y-8 overflow-y-auto no-scrollbar scroll-smooth justify-between">
        {visibleMenuGroups.map((group, idx) => {
          const isSectionCollapsed = collapsedSections.includes(group.title);
          return (
            <div key={idx} className="flex flex-col gap-y-0.5">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(group.title)}
                  aria-label={`${isSectionCollapsed ? 'Expand' : 'Collapse'} ${group.title} section`}
                  style={{ paddingLeft: 'var(--sidebar-item-pl)' }}
                  className="w-full flex items-center justify-between pr-4 mb-[var(--space-2)] group/section hover:bg-[var(--sidebar-hover)] rounded-md transition-all cursor-pointer"
                >
                  <h4
                    className="flex-1 text-left text-caption text-text-tertiary uppercase tracking-[0.2em] font-oswald font-bold italic group-hover/section:text-[var(--text-secondary)] transition-colors"
                  >
                    {group.title}
                  </h4>
                  <ChevronDown
                    size={10}
                    className={cn(
                      "text-[var(--text-tertiary)] group-hover/section:text-[var(--text-secondary)] transition-transform duration-300 shrink-0",
                      isSectionCollapsed ? '-rotate-90' : 'rotate-0'
                    )}
                  />
                </button>
              )}
              <div className={cn(
                "flex flex-col gap-y-0.5 overflow-hidden transition-all duration-300",
                isSectionCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
              )}>
                {group.items.map((item) => renderMenuItem(item))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* SYSTEM ANCHOR ZONE */}
      <div className="border-t border-[var(--sidebar-border)] px-0 py-3 space-y-0.5 mt-auto">
        <button
          onClick={() => onNavigate('profile')}
          style={{ paddingLeft: 'var(--sidebar-item-pl)' }}
          className="w-full flex items-center h-[36px] pr-4 rounded-md text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] transition-all group"
        >
          <div className="w-4 flex justify-center shrink-0">
            <Users size={14} strokeWidth={1.5} />
          </div>
          {!collapsed && <span className="ml-4 text-gov-label font-oswald font-bold tracking-[0.15em]">Profile</span>}
        </button>

        <button
          onClick={() => onNavigate('settings')}
          style={{ paddingLeft: 'var(--sidebar-item-pl)' }}
          className="w-full flex items-center h-[36px] pr-4 rounded-md text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] transition-all group"
        >
          <div className="w-4 flex justify-center shrink-0">
            <Settings size={14} strokeWidth={1.5} />
          </div>
          {!collapsed && <span className="ml-4 text-gov-label font-oswald font-bold tracking-[0.15em]">Settings</span>}
        </button>

        <div className="h-1" />

        <button
          onClick={handleLogout}
          style={{ paddingLeft: 'var(--sidebar-item-pl)' }}
          className="w-full flex items-center h-[36px] pr-4 rounded-md text-[var(--sidebar-text-muted)] hover:text-[var(--color-critical)] hover:bg-[var(--color-critical)]/10 transition-all group"
        >
          <div className="w-4 flex justify-center shrink-0">
            <LogOut size={14} strokeWidth={1.5} />
          </div>
          {!collapsed && <span className="ml-4 text-gov-label font-oswald font-bold tracking-[0.15em]">Terminal</span>}
        </button>
      </div>

    </aside>
  );
};