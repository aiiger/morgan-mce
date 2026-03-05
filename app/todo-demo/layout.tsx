'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  ListTodo,
  Trello,
  Calendar,
  Tag,
  Archive,
  Trash2,
  User,
} from 'lucide-react';

const NAV = [
  { href: '/todo-demo',            icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/todo-demo/tasks',      icon: ListTodo,        label: 'All Tasks' },
  { href: '/todo-demo/kanban',     icon: Trello,          label: 'Kanban' },
  { href: '/todo-demo/calendar',   icon: Calendar,        label: 'Calendar' },
  { href: '/todo-demo/categories', icon: Tag,             label: 'Categories' },
  { href: '/todo-demo/archive',    icon: Archive,         label: 'Archive' },
  { href: '/todo-demo/trash',      icon: Trash2,          label: 'Trash' },
  { href: '/todo-demo/profile',    icon: User,            label: 'Profile' },
];

export default function TodoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-zinc-800">
          <span className="text-cyan-400 font-bold text-lg tracking-tight">TodoTracker</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active =
              href === '/todo-demo'
                ? pathname === '/todo-demo'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-cyan-400/10 text-cyan-400 font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-800 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-xs text-zinc-500">Account</span>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 shrink-0 bg-zinc-950 border-b border-zinc-800 flex items-center px-6">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">
            {NAV.find((n) =>
              n.href === '/todo-demo'
                ? pathname === '/todo-demo'
                : pathname.startsWith(n.href)
            )?.label ?? 'TodoTracker'}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
