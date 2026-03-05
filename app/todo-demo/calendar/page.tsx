'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
}

type ViewMode = 'month' | 'week' | 'day';

const STATUS_PILL: Record<string, string> = {
  pending:     'bg-zinc-700 text-zinc-300',
  in_progress: 'bg-amber-500/20 text-amber-300',
  completed:   'bg-emerald-500/20 text-emerald-300',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function CalendarPage() {
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [current, setCurrent] = useState(new Date());
  const [popover, setPopover] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json() as { tasks: Task[] };
      setTasks((json.tasks ?? []).filter((t) => t.due_date));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) void fetchTasks();
  }, [isLoaded, user, fetchTasks]);

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (t.due_date) {
      if (!acc[t.due_date]) acc[t.due_date] = [];
      acc[t.due_date].push(t);
    }
    return acc;
  }, {});

  // ── Month helpers ────────────────────────────────────────
  const year  = current.getFullYear();
  const month = current.getMonth();

  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toDateStr(new Date());

  // Build 6×7 grid cells
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  // ── Week helpers ─────────────────────────────────────────
  const weekStart = new Date(current);
  weekStart.setDate(current.getDate() - current.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const prevPeriod = () => {
    const d = new Date(current);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrent(d);
  };
  const nextPeriod = () => {
    const d = new Date(current);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrent(d);
  };
  const goToday = () => setCurrent(new Date());

  const periodLabel = () => {
    if (viewMode === 'month') return `${MONTHS[month]} ${year}`;
    if (viewMode === 'week') {
      const end = weekDays[6];
      return `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${year}`;
    }
    return current.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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
      {/* Header toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            {(['month','week','day'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 text-xs capitalize transition-colors ${
                  viewMode === v ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button onClick={prevPeriod} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft size={16} />
        </button>
        <button onClick={goToday} className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
          Today
        </button>
        <button onClick={nextPeriod} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
          <ChevronRight size={16} />
        </button>
        <span className="text-white font-medium">{periodLabel()}</span>
      </div>

      {error && <p className="text-red-400 text-sm">Error: {error}</p>}

      {/* ── Month view ────────────────────────────────────── */}
      {viewMode === 'month' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-zinc-800">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-zinc-500 uppercase">
                {d}
              </div>
            ))}
          </div>
          {/* Day grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const dateStr = day ? toDateStr(day) : '';
              const dayTasks = dateStr ? (tasksByDate[dateStr] ?? []) : [];
              const isToday = dateStr === today;
              return (
                <div
                  key={i}
                  className={`min-h-[90px] p-1.5 border-r border-b border-zinc-800 last:border-r-0 ${
                    !day ? 'bg-zinc-950/50' : 'hover:bg-zinc-800/30'
                  }`}
                >
                  {day && (
                    <>
                      <span className={`inline-flex w-6 h-6 items-center justify-center text-xs rounded-full mb-1 ${
                        isToday ? 'bg-cyan-500 text-black font-bold' : 'text-zinc-400'
                      }`}>
                        {day.getDate()}
                      </span>
                      <div className="space-y-0.5">
                        {dayTasks.slice(0, 3).map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setPopover(t)}
                            className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate ${STATUS_PILL[t.status]}`}
                          >
                            {t.title}
                          </button>
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-xs text-zinc-500 px-1">+{dayTasks.length - 3} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Week view ──────────────────────────────────────── */}
      {viewMode === 'week' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-7">
            {weekDays.map((day) => {
              const dateStr = toDateStr(day);
              const dayTasks = tasksByDate[dateStr] ?? [];
              const isToday = dateStr === today;
              return (
                <div key={dateStr} className="border-r border-zinc-800 last:border-r-0 min-h-[200px]">
                  <div className={`py-2 text-center border-b border-zinc-800 ${isToday ? 'bg-cyan-500/10' : ''}`}>
                    <p className="text-xs text-zinc-500">{WEEKDAYS[day.getDay()]}</p>
                    <p className={`text-lg font-bold ${isToday ? 'text-cyan-400' : 'text-white'}`}>{day.getDate()}</p>
                  </div>
                  <div className="p-1.5 space-y-1">
                    {dayTasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setPopover(t)}
                        className={`w-full text-left text-xs px-2 py-1 rounded ${STATUS_PILL[t.status]}`}
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Day view ───────────────────────────────────────── */}
      {viewMode === 'day' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">
            {current.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          {(() => {
            const dayTasks = tasksByDate[toDateStr(current)] ?? [];
            return dayTasks.length === 0 ? (
              <p className="text-zinc-500 text-sm">No tasks due this day.</p>
            ) : (
              <ul className="space-y-2">
                {dayTasks.map((t) => (
                  <li
                    key={t.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${STATUS_PILL[t.status]}`}
                    onClick={() => setPopover(t)}
                    role="button"
                  >
                    <span className="flex-1 text-sm">{t.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      t.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      t.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>{t.priority}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      )}

      {/* Task detail popover */}
      {popover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPopover(null)}>
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 w-80 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white font-semibold">{popover.title}</h3>
              <button onClick={() => setPopover(null)} className="text-zinc-500 hover:text-white"><span>×</span></button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_PILL[popover.status]}`}>
                  {popover.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Priority</span>
                <span className="text-white capitalize">{popover.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Due date</span>
                <span className="text-white">
                  {popover.due_date
                    ? new Date(popover.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
