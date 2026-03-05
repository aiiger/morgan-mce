'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { RotateCcw, Trash2, AlertTriangle, X } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deleted_at: string;
}

const PRIORITY_COLOUR: Record<string, string> = {
  high:   'text-red-400',
  medium: 'text-amber-400',
  low:    'text-emerald-400',
};

export default function TrashPage() {
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Empty trash confirm modal
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [emptyConfirmText, setEmptyConfirmText] = useState('');
  const [emptying, setEmptying] = useState(false);

  const fetchDeleted = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?userId=${user.id}&deleted=true`);
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
    if (isLoaded && user) void fetchDeleted();
  }, [isLoaded, user, fetchDeleted]);

  const handleRestore = async (id: string) => {
    if (!user) return;
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, deleted_at: null }),
      });
      await fetchDeleted();
    } catch {
      setError('Failed to restore task');
    }
  };

  const handleDeletePermanent = async (id: string) => {
    if (!user || !confirm('Permanently delete this task? This cannot be undone.')) return;
    try {
      await fetch(`/api/tasks/${id}?userId=${user.id}&permanent=true`, { method: 'DELETE' });
      await fetchDeleted();
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleEmptyTrash = async () => {
    if (!user || emptyConfirmText !== 'EMPTY_TRASH') return;
    setEmptying(true);
    try {
      await Promise.all(
        tasks.map((t) =>
          fetch(`/api/tasks/${t.id}?userId=${user.id}&permanent=true`, { method: 'DELETE' })
        )
      );
      setShowEmptyModal(false);
      setEmptyConfirmText('');
      await fetchDeleted();
    } catch {
      setError('Failed to empty trash');
    } finally {
      setEmptying(false);
    }
  };

  // Days since deletion helper
  const daysSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trash</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{tasks.length} deleted task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        {tasks.length > 0 && (
          <button
            onClick={() => { setShowEmptyModal(true); setEmptyConfirmText(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors"
          >
            <Trash2 size={15} /> Empty Trash
          </button>
        )}
      </div>

      {/* 30-day warning */}
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-amber-300 text-sm">
          Deleted tasks are kept for 30 days. After that they may be permanently removed. Restore items you still need.
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">Error: {error}</p>}

      {tasks.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center h-48">
          <div className="text-center">
            <Trash2 size={32} className="text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">Trash is empty.</p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 border-b border-zinc-800 bg-zinc-950 text-xs text-zinc-500 uppercase tracking-wide">
            <span>Title</span>
            <span className="w-20 text-center">Priority</span>
            <span className="w-24 text-center">Status</span>
            <span className="w-24 text-right">Days in trash</span>
            <span className="w-20 text-right">Actions</span>
          </div>

          {tasks.map((t) => {
            const days = daysSince(t.deleted_at);
            return (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40"
              >
                <span className="text-sm text-zinc-400 line-through truncate">{t.title}</span>
                <span className={`text-xs w-20 text-center capitalize ${PRIORITY_COLOUR[t.priority]}`}>
                  {t.priority}
                </span>
                <span className="text-xs text-zinc-600 w-24 text-center capitalize">
                  {t.status.replace('_', ' ')}
                </span>
                <span className={`text-xs w-24 text-right ${days >= 25 ? 'text-red-400' : 'text-zinc-500'}`}>
                  {days}d ago
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
            );
          })}
        </div>
      )}

      {/* Empty Trash confirmation modal */}
      {showEmptyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-white font-semibold text-lg">Empty Trash</h2>
              <button onClick={() => setShowEmptyModal(false)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium text-sm">This action is irreversible</p>
                <p className="text-red-300/70 text-xs mt-0.5">
                  {tasks.length} task{tasks.length !== 1 ? 's' : ''} will be permanently deleted. This data cannot be recovered.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-2">
                Type <span className="font-mono text-red-400">EMPTY_TRASH</span> to confirm
              </label>
              <input
                value={emptyConfirmText}
                onChange={(e) => setEmptyConfirmText(e.target.value)}
                placeholder="EMPTY_TRASH"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => void handleEmptyTrash()}
                disabled={emptyConfirmText !== 'EMPTY_TRASH' || emptying}
                className="flex-1 py-2 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {emptying ? 'Deleting…' : 'Empty Trash'}
              </button>
              <button
                onClick={() => setShowEmptyModal(false)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
