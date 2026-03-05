'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, X, GripVertical } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
}

const COLUMNS: { id: Task['status']; label: string; colour: string; accent: string }[] = [
  { id: 'pending',     label: 'Pending',     colour: 'border-zinc-700',    accent: 'bg-zinc-700'    },
  { id: 'in_progress', label: 'In Progress', colour: 'border-amber-500/40', accent: 'bg-amber-500'   },
  { id: 'completed',   label: 'Completed',   colour: 'border-emerald-500/40', accent: 'bg-emerald-500' },
];

const PRIORITY_COLOUR: Record<string, string> = {
  high:   'text-red-400 bg-red-400/10',
  medium: 'text-amber-400 bg-amber-400/10',
  low:    'text-emerald-400 bg-emerald-400/10',
};

export default function KanbanPage() {
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New task quick-add per column
  const [addingCol, setAddingCol] = useState<Task['status'] | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  // Drag state
  const dragId = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<Task['status'] | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?userId=${user.id}`);
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
    if (isLoaded && user) void fetchTasks();
  }, [isLoaded, user, fetchTasks]);

  const handleAddTask = async (status: Task['status']) => {
    if (!user || !newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title: newTitle.trim(), status }),
      });
      if (!res.ok) throw new Error('Failed to create');
      setNewTitle('');
      setAddingCol(null);
      await fetchTasks();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const moveTask = async (id: string, newStatus: Task['status']) => {
    if (!user) return;
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status: newStatus }),
      });
    } catch {
      await fetchTasks(); // revert on error
    }
  };

  const handleDragStart = (id: string) => { dragId.current = id; };
  const handleDragOver = (e: React.DragEvent, col: Task['status']) => {
    e.preventDefault();
    setDragOver(col);
  };
  const handleDrop = async (e: React.DragEvent, col: Task['status']) => {
    e.preventDefault();
    setDragOver(null);
    if (dragId.current) {
      await moveTask(dragId.current, col);
      dragId.current = null;
    }
  };
  const handleDeleteTask = async (id: string) => {
    if (!user) return;
    await fetch(`/api/tasks/${id}?userId=${user.id}`, { method: 'DELETE' });
    await fetchTasks();
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
      {error && <p className="text-red-400 text-sm">Error: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOver === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => void handleDrop(e, col.id)}
              onDragLeave={() => setDragOver(null)}
              className={`flex flex-col bg-zinc-900 border rounded-xl transition-colors ${col.colour} ${
                isOver ? 'bg-zinc-800' : ''
              }`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.accent}`} />
                  <span className="text-sm font-semibold text-white">{col.label}</span>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => { setAddingCol(col.id); setNewTitle(''); }}
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Quick-add form */}
              {addingCol === col.id && (
                <div className="px-3 py-2 border-b border-zinc-800">
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleAddTask(col.id);
                      if (e.key === 'Escape') setAddingCol(null);
                    }}
                    placeholder="Task title… (Enter to add)"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => void handleAddTask(col.id)}
                      disabled={adding}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-semibold rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingCol(null)}
                      className="px-3 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Cards */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[200px]">
                {colTasks.length === 0 && !isOver && (
                  <p className="text-zinc-600 text-xs text-center pt-6">Drop tasks here</p>
                )}
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="group bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg p-3 cursor-grab active:cursor-grabbing select-none"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={14} className="text-zinc-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white leading-tight">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${PRIORITY_COLOUR[task.priority]}`}>
                            {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="text-xs text-zinc-500">
                              {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => void handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    {/* Move to other columns */}
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {COLUMNS.filter((c) => c.id !== col.id).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => void moveTask(task.id, c.id)}
                          className="text-xs px-2 py-0.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-md transition-colors"
                        >
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
