'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
}

const PRIORITY_COLOUR: Record<string, string> = {
  high: 'text-red-400 bg-red-400/10',
  medium: 'text-amber-400 bg-amber-400/10',
  low: 'text-emerald-400 bg-emerald-400/10',
};

const STATUS_COLOUR: Record<string, string> = {
  pending: 'text-zinc-400 bg-zinc-800',
  in_progress: 'text-amber-400 bg-amber-400/10',
  completed: 'text-emerald-400 bg-emerald-400/10',
};

export default function TodoDashboard() {
  const { user, isLoaded } = useUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick-add form state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [qaTitle, setQaTitle] = useState('');
  const [qaPriority, setQaPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [qaDue, setQaDue] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to load tasks');
      const json = await res.json() as { tasks: Task[] };
      setTasks(json.tasks ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) void fetchTasks();
  }, [isLoaded, user, fetchTasks]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !qaTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: qaTitle.trim(),
          priority: qaPriority,
          due_date: qaDue || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      setQaTitle('');
      setQaPriority('medium');
      setQaDue('');
      setShowQuickAdd(false);
      await fetchTasks();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAdding(false);
    }
  };

  // ── Stats ────────────────────────────────────────────────
  const total      = tasks.length;
  const pending    = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const completed  = tasks.filter((t) => t.status === 'completed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const today   = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(
    (t) => t.due_date && t.due_date < today && t.status !== 'completed'
  ).length;
  const dueToday = tasks.filter((t) => t.due_date === today && t.status !== 'completed').length;

  const recent = [...tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const upcoming = tasks
    .filter((t) => t.due_date && t.due_date >= today && t.status !== 'completed')
    .sort((a, b) => (a.due_date!).localeCompare(b.due_date!))
    .slice(0, 5);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Here&apos;s what&apos;s happening with your tasks today.</p>
        </div>
        <button
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          Quick Add
        </button>
      </div>

      {/* Quick-add form */}
      {showQuickAdd && (
        <form
          onSubmit={(e) => void handleQuickAdd(e)}
          className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-48">
            <label className="text-xs text-zinc-400 mb-1 block">Task title</label>
            <input
              autoFocus
              required
              value={qaTitle}
              onChange={(e) => setQaTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Priority</label>
            <select
              value={qaPriority}
              onChange={(e) => setQaPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Due date</label>
            <input
              type="date"
              value={qaDue}
              onChange={(e) => setQaDue(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-colors"
            >
              {adding ? 'Adding…' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-red-400 text-sm">Error: {error}</p>}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(
          [
            { label: 'Total Tasks',  value: total,       icon: ListIcon,     colour: 'text-cyan-400'    },
            { label: 'In Progress',  value: inProgress,  icon: Clock,        colour: 'text-amber-400'   },
            { label: 'Completed',    value: completed,   icon: CheckCircle2, colour: 'text-emerald-400' },
            { label: 'Overdue',      value: overdue,     icon: AlertCircle,  colour: 'text-red-400'     },
          ] as const
        ).map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">{label}</span>
              <Icon size={16} className={colour} />
            </div>
            <span className={`text-3xl font-bold ${colour}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Progress + Due Today */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-cyan-400" />
            <span className="text-sm font-medium text-white">Completion Rate</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-cyan-400">{completionRate}%</span>
            <span className="text-zinc-500 text-sm mb-1">{completed} of {total} tasks</span>
          </div>
          <div className="mt-3 bg-zinc-800 rounded-full h-2">
            <div
              className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-amber-400" />
            <span className="text-sm font-medium text-white">Due Today</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-amber-400">{dueToday}</span>
            <span className="text-zinc-500 text-sm mb-1">tasks need attention</span>
          </div>
          <div className="mt-3 text-xs text-zinc-500">
            {overdue > 0 && <span className="text-red-400">{overdue} overdue · </span>}
            {pending} pending total
          </div>
        </div>
      </div>

      {/* Recent + Upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Recently Added</h2>
          {recent.length === 0 ? (
            <p className="text-zinc-500 text-sm">No tasks yet. Add one above!</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOUR[t.priority]}`}>
                    {t.priority}
                  </span>
                  <span className="text-sm text-white flex-1 truncate">{t.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOUR[t.status]}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Upcoming Deadlines</h2>
          {upcoming.length === 0 ? (
            <p className="text-zinc-500 text-sm">No upcoming deadlines.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 w-20 shrink-0">
                    {new Date(t.due_date! + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric',
                    })}
                  </span>
                  <span className="text-sm text-white flex-1 truncate">{t.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOUR[t.priority]}`}>
                    {t.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ListIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
