'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { RotateCcw, Trash2, Archive } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  archived_at: string;
}

const PRIORITY_COLOUR: Record<string, string> = {
  high:   'text-red-400',
  medium: 'text-amber-400',
  low:    'text-emerald-400',
};

export default function ArchivePage() {
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArchived = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?userId=${user.id}&archived=true`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json() as { tasks: Task[] };
      setTasks(json.tasks ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) void fetchArchived();
  }, [isLoaded, user, fetchArchived]);

  const handleRestore = async (id: string) => {
    if (!user) return;
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, archived_at: null }),
      });
      await fetchArchived();
    } catch {
      setError('Failed to restore task');
    }
  };

  const handleDeletePermanent = async (id: string) => {
    if (!user || !confirm('Permanently delete this task? This cannot be undone.')) return;
    try {
      await fetch(`/api/tasks/${id}?userId=${user.id}&permanent=true`, { method: 'DELETE' });
      await fetchArchived();
    } catch {
      setError('Failed to delete task');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Archive</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{tasks.length} archived task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Archive size={16} />
          <span>Archived tasks are hidden from active views</span>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">Error: {error}</p>}

      {tasks.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center h-48">
          <div className="text-center">
            <Archive size={32} className="text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No archived tasks.</p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 border-b border-zinc-800 bg-zinc-950 text-xs text-zinc-500 uppercase tracking-wide">
            <span>Title</span>
            <span className="w-20 text-center">Priority</span>
            <span className="w-24 text-center">Status</span>
            <span className="w-28 text-right">Archived</span>
            <span className="w-20 text-right">Actions</span>
          </div>

          {tasks.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40 group"
            >
              <span className="text-sm text-zinc-300 truncate">{t.title}</span>
              <span className={`text-xs w-20 text-center capitalize ${PRIORITY_COLOUR[t.priority]}`}>
                {t.priority}
              </span>
              <span className="text-xs text-zinc-500 w-24 text-center capitalize">
                {t.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-zinc-600 w-28 text-right">
                {new Date(t.archived_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <div className="flex items-center gap-2 w-20 justify-end">
                <button
                  onClick={() => void handleRestore(t.id)}
                  title="Restore"
                  className="p-1 text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => void handleDeletePermanent(t.id)}
                  title="Delete permanently"
                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
