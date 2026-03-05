/**
 * MCE COMMAND CENTER SIDEBAR 2026
 *
 * Enterprise-grade navigation sidebar optimized for clarity and governance.
 * Based on 2026 design system principles:
 * - 180px optimized width (reduced from 240px)
 * - Clear active state indication
 * - Proper typography hierarchy
 * - Consistent spacing using 4px scale
 * - No ALL CAPS labels
 * - Semantic color usage
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  AlertTriangle,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  Users,
  Calendar,
  Search,
  Home,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: { count: number; type: 'critical' | 'warning' | 'info' };
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

interface SidebarProps {
  activeView: string;
  onNavigate: (viewId: string) => void;
}

export const SidebarEnt2026: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems: NavGroup[] = [
    {
      section: 'Core Operations',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard size={18} />,
          href: '#',
        },
        {
          id: 'projects',
          label: 'Projects',
          icon: <Briefcase size={18} />,
          href: '#',
        },
        {
          id: 'tenders',
          label: 'Tenders',
          icon: <Calendar size={18} />,
          href: '#',
        },
        {
          id: 'documents',
          label: 'Documents',
          icon: <FileText size={18} />,
          href: '#',
        },
      ],
    },
    {
      section: 'Governance',
      items: [
        {
          id: 'risk-liability',
          label: 'Risk & Liability',
          icon: <AlertTriangle size={18} />,
          href: '#',
          badge: { count: 3, type: 'critical' },
        },
        {
          id: 'financials',
          label: 'Financials',
          icon: <BarChart3 size={18} />,
          href: '#',
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: <FileText size={18} />,
          href: '#',
        },
      ],
    },
    {
      section: 'Team & Mesh',
      items: [
        {
          id: 'resources',
          label: 'Resources',
          icon: <Users size={18} />,
          href: '#',
        },
        {
          id: 'calendar',
          label: 'Calendar',
          icon: <Calendar size={18} />,
          href: '#',
        },
      ],
    },
    {
      section: 'System',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: <Settings size={18} />,
          href: '#',
        },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ width: isCollapsed ? 64 : 200 }}
      animate={{ width: isCollapsed ? 64 : 200 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-white border-r border-gray-200 flex flex-col p-4 overflow-y-auto custom-scrollbar"
    >
      {/* ===================================================================
          HEADER - Logo and Toggle
          =================================================================== */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">MCE</span>
              </div>
              <span className="text-sm font-bold text-gray-900">Morgan</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-900 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* ===================================================================
          SEARCH (Hidden when collapsed)
          =================================================================== */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, marginBottom: 0 }}
            animate={{ opacity: 1, marginBottom: 16 }}
            exit={{ opacity: 0, marginBottom: 0 }}
            className="relative mb-4"
          >
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-50 border border-gray-200 rounded-md pl-9 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================
          NAVIGATION SECTIONS
          =================================================================== */}
      <nav className="flex-1 space-y-8">
        {navigationItems.map((section, idx) => (
          <div key={idx}>
            {/* Section Label (Hidden when collapsed) */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-3">
                    {section.section}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Items */}
            <div className="space-y-1">
              {(section.items || []).map((item) => {
                const isActive = activeView === item.id;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-2 border-transparent'
                      }
                    `}
                    aria-current={isActive ? 'page' : 'false'}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>

                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="truncate text-gov-label font-medium uppercase tracking-widest"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Badge */}
                    <AnimatePresence>
                      {item.badge && !isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`
                            text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0
                            ${item.badge.type === 'critical'
                              ? 'bg-rose-500/20 text-rose-500'
                              : item.badge.type === 'warning'
                                ? 'bg-amber-500/20 text-amber-500'
                                : 'bg-gray-100 text-gray-500'
                            }
                          `}
                        >
                          {item.badge.count}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ===================================================================
          FOOTER - User and Settings
          =================================================================== */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        {/* Settings */}
        <motion.button
          whileHover={{ x: isCollapsed ? 0 : 4 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Settings size={18} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gov-label font-bold tracking-widest">
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Logout */}
        <motion.button
          whileHover={{ x: isCollapsed ? 0 : 4 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-600 hover:text-rose-500 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gov-label font-bold tracking-widest">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SidebarEnt2026;
