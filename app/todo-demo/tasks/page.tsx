'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Plus, Trash2, Edit3, CheckCircle2, Circle, Search,
  LayoutList, LayoutGrid, ChevronDown, X,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
}

const PRIORITY_COLOUR: Record<string, string> = {
  high:   'text-red-400 bg-red-400/10 border border-red-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
  low:    'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
};

const STATUS_COLOUR: Record<string, string> = {
  pending:     'text-zinc-400',
  in_progress: 'text-amber-400',
  completed:   'text-emerald-400',
};

const STATUS_OPTIONS = ['pending', 'in_progress', 'completed'] as const;
const PRIORITY_OPTIONS = ['low', 'medium', 'high'] as const;

type FormShape = {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
};

const EMPTY_FORM: FormShape = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  due_date: '',
};

export default function AllTasksPage() {
  const { user, isLoaded } = useUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormShape>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Bulk select
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let url = `/api/tasks?userId=${user.id}`;
      if (filterStatus) url += `&status=${filterStatus}`;
      if (filterPriority) url += `&priority=${filterPriority}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load tasks');
      const json = await res.json() as { tasks: Task[] };
      setTasks(json.tasks ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, filterStatus, filterPriority]);

  useEffect(() => {
    if (isLoaded && user) void fetchTasks();
  }, [isLoaded, user, fetchTasks]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditId(t.id);
    setForm({
      title: t.title,
      description: t.description ?? '',
      status: t.status,
      priority: t.priority,
      due_date: t.due_date ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await fetch(`/api/tasks/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, ...form, due_date: form.due_date || null }),
        });
        if (!res.ok) throw new Error('Failed to update');
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, ...form, due_date: form.due_date || null }),
        });
        if (!res.ok) throw new Error('Failed to create');
      }
      setModalOpen(false);
      await fetchTasks();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Move to trash?')) return;
    try {
      await fetch(`/api/tasks/${id}?userId=${user.id}`, { method: 'DELETE' });
      await fetchTasks();
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleToggleStatus = async (t: Task) => {
    if (!user) return;
    const next = t.status === 'completed' ? 'pending' : 'completed';
    await fetch(`/api/tasks/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, status: next }),
    });
    await fetchTasks();
  };

  const handleBulkDelete = async () => {
    if (!user || selected.size === 0) return;
    if (!confirm(`Move ${selected.size} task(s) to trash?`)) return;
    await Promise.all(
      [...selected].map((id) =>
        fetch(`/api/tasks/${id}?userId=${user.id}`, { method: 'DELETE' })
      )
    );
    setSelected(new Set());
    await fetchTasks();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((t) => t.id)));
  };

  // Client-side search filtering
  const filtered = tasks.filter((t) =>
    search ? t.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">All Tasks</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none bg-zinc-900 border border-zinc-800 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>

        {/* Priority filter */}
        <div className="relative">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="appearance-none bg-zinc-900 border border-zinc-800 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Priority</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>

        {/* View toggle */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-2 ${view === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <LayoutList size={16} />
          </button>
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-2 ${view === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <span className="text-cyan-400 text-sm">{selected.size} selected</span>
          <button
            onClick={() => void handleBulkDelete()}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-md transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-zinc-500 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">Error: {error}</p>}

      {/* Count */}
      <p className="text-zinc-500 text-xs">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>

      {/* ── List view ─────────────────────────────────────────── */}
      {view === 'list' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Select-all header */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-950">
            <input
              type="checkbox"
              checked={selected.size === filtered.length && filtered.length > 0}
              onChange={selectAll}
              className="accent-cyan-500"
            />
            <span className="text-xs text-zinc-500 flex-1">Title</span>
            <span className="text-xs text-zinc-500 w-20 text-center">Priority</span>
            <span className="text-xs text-zinc-500 w-24 text-center">Status</span>
            <span className="text-xs text-zinc-500 w-20 text-right">Due</span>
            <span className="w-16" />
          </div>

          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-zinc-500 text-sm">
              No tasks found.
            </div>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 group"
              >
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => toggleSelect(t.id)}
                  className="accent-cyan-500"
                />
                {/* Status toggle */}
                <button
                  onClick={() => void handleToggleStatus(t)}
                  className="shrink-0 text-zinc-600 hover:text-cyan-400 transition-colors"
                >
                  {t.status === 'completed' ? (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  ) : (
                    <Circle size={18} />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${t.status === 'completed' ? 'line-through text-zinc-600' : 'text-white'}`}
                >
                  {t.title}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full w-20 text-center ${PRIORITY_COLOUR[t.priority]}`}>
                  {t.priority}
                </span>
                <span className={`text-xs w-24 text-center capitalize ${STATUS_COLOUR[t.status]}`}>
                  {t.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-zinc-500 w-20 text-right">
                  {t.due_date
                    ? new Date(t.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'}
                </span>
                <div className="flex gap-1 w-16 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(t)}
                    className="p-1 text-zinc-500 hover:text-cyan-400 transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => void handleDelete(t.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Grid view ─────────────────────────────────────────── */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 ? (
            <p className="col-span-full text-zinc-500 text-sm">No tasks found.</p>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 group relative transition-colors"
              >
                {/* Select */}
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => toggleSelect(t.id)}
                  className="absolute top-3 left-3 accent-cyan-500"
                />
                <div className="pl-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-sm font-medium ${t.status === 'completed' ? 'line-through text-zinc-600' : 'text-white'}`}>
                      {t.title}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="text-zinc-500 hover:text-cyan-400"><Edit3 size={13} /></button>
                      <button onClick={() => void handleDelete(t.id)} className="text-zinc-500 hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  {t.description && (
                    <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{t.description}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLOUR[t.priority]}`}>{t.priority}</span>
                    <span className={`text-xs capitalize ${STATUS_COLOUR[t.status]}`}>{t.status.replace('_', ' ')}</span>
                    {t.due_date && (
                      <span className="text-xs text-zinc-500 ml-auto">
                        {new Date(t.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">{editId ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Title *</label>
                <input
                  required
                  autoFocus
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Optional description…"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as typeof form.priority })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Due Date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-colors"
                >
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
