import React, { useMemo, useState } from 'react';
import {
    addMonths,
    addWeeks,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
    subMonths,
    subWeeks
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';

// Minimal types (keep page decoupled from data hooks)
export type CalendarTask = {
    id: string;
    title: string;
    due_date: string;
    status?: 'pending' | 'in_progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    project_id?: string;
    projectId?: string;
};

type CalendarPageProps = {
    tasks?: CalendarTask[];
    projects?: any[];
    onSelectProject?: (id: string) => void;
};

type CalendarEvent = {
    id: string;
    kind: 'task' | 'project';
    title: string;
    date: Date;
    priority: 'low' | 'medium' | 'high';
    status?: 'pending' | 'in_progress' | 'completed';
    projectId?: string;
};

export const CalendarPage: React.FC<CalendarPageProps> = ({
    tasks = [],
    projects = [],
    onSelectProject,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

    // Navigation
    const nextPeriod = () => {
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        else setCurrentDate(addWeeks(currentDate, 1));
    };

    const prevPeriod = () => {
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        else setCurrentDate(subWeeks(currentDate, 1));
    };

    const jumpToToday = () => setCurrentDate(new Date());

    // Week Days Header
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const events: CalendarEvent[] = useMemo(() => {
        const taskEvents: CalendarEvent[] = tasks
            .filter(t => Boolean(t.due_date))
            .map(t => {
                const priority = t.priority ?? 'medium';
                const projectId = t.projectId || t.project_id;
                return {
                    id: `task:${t.id}`,
                    kind: 'task',
                    title: t.title,
                    date: new Date(t.due_date),
                    priority,
                    status: t.status ?? 'pending',
                    projectId,
                };
            });

        const projectEvents: CalendarEvent[] = projects
            .flatMap(p => {
                const projectId = p.id;
                const projectName = p.project_name || p.name || 'Project';

                const entries: Array<{ key: string; label: string; dateValue?: string; priority?: CalendarEvent['priority'] }> = [
                    { key: 'commence', label: 'Commencement', dateValue: p.project_commencement_date, priority: 'medium' },
                    { key: 'planned_complete', label: 'Planned Completion', dateValue: p.project_completion_date_planned, priority: 'high' },
                    { key: 'dlp_end', label: 'DLP End', dateValue: p.dlp_end_date, priority: 'medium' },
                ];

                const milestoneEvents: CalendarEvent[] = Array.isArray(p.milestones)
                    ? p.milestones
                          .filter((m: any) => Boolean(m?.start_date || m?.end_date))
                          .map((m: any) => {
                              const milestoneDate = new Date(m?.end_date || m?.start_date);
                              const status = String(m?.status || 'Pending');
                              const priority: CalendarEvent['priority'] = status === 'Delayed' ? 'high' : status === 'In Progress' ? 'medium' : 'low';
                              return {
                                  id: `project:${projectId}:milestone:${m?.id || m?.title || milestoneDate.toISOString()}`,
                                  kind: 'project',
                                  title: `${projectName} — ${m?.title || 'Milestone'}`,
                                  date: milestoneDate,
                                  priority,
                                  projectId,
                              } satisfies CalendarEvent;
                          })
                    : [];

                const dateFieldEvents = entries
                    .filter(e => Boolean(e.dateValue))
                    .map(e => {
                        const d = new Date(e.dateValue as string);
                        return {
                            id: `project:${projectId}:${e.key}`,
                            kind: 'project',
                            title: `${projectName} — ${e.label}`,
                            date: d,
                            priority: e.priority ?? 'medium',
                            projectId,
                        } satisfies CalendarEvent;
                    });

                return [...dateFieldEvents, ...milestoneEvents];
            });

        return [...projectEvents, ...taskEvents].filter(e => !Number.isNaN(e.date.getTime()));
    }, [projects, tasks]);

    // Generate Calendar Grid
    const renderCalendarGrid = () => {
        let days: Date[] = [];

        if (viewMode === 'month') {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(currentDate);
            const startDate = startOfWeek(monthStart);
            const endDate = endOfWeek(monthEnd);
            days = eachDayOfInterval({ start: startDate, end: endDate });
        } else {
            const startDate = startOfWeek(currentDate);
            const endDate = endOfWeek(currentDate);
            days = eachDayOfInterval({ start: startDate, end: endDate });
        }

        return (
            <div className="grid grid-cols-7 gap-px bg-[var(--surface-border)] rounded-2xl overflow-hidden border border-[var(--surface-border)] shadow-2xl">
                {/* Header */}
                {weekDays.map((day) => (
                    <div key={day} className="bg-[var(--bg-layer)]/80 p-4 text-center text-caption font-bold italic text-[var(--text-tertiary)] uppercase tracking-[0.2em] border-b border-[var(--surface-border)]">
                        {day}
                    </div>
                ))}

                {/* Days */}
                {days.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);

                    const dayEvents = events
                        .filter(e => isSameDay(e.date, day))
                        .sort((a, b) => {
                            const priorityRank = (p: CalendarEvent['priority']) => (p === 'high' ? 0 : p === 'medium' ? 1 : 2);
                            return priorityRank(a.priority) - priorityRank(b.priority);
                        });

                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-[150px] bg-[var(--bg-surface)] p-3 transition-all duration-500 hover:bg-[var(--bg-hover)]/50 group relative flex flex-col ${!isCurrentMonth && viewMode === 'month' ? 'opacity-20 grayscale' : ''
                                }`}
                        >
                            {/* Day Number */}
                            <div className="flex justify-between items-start mb-3">
                                <span
                                    className={`text-lg font-bold italic font-oswald w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isCurrentDay
                                            ? 'bg-[var(--brand-accent)] text-white shadow-[0_0_20px_rgba(162,162,168,0.4)] scale-110'
                                            : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    {format(day, 'd')}
                                </span>
                                {dayEvents.length > 0 && (
                                    <div className="flex gap-0.5 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] animate-pulse" />
                                    </div>
                                )}
                            </div>

                            {/* Events */}
                            <div className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                                {dayEvents.map(ev => {
                                    const isProject = ev.kind === 'project';
                                    const colorClass = isProject
                                        ? 'bg-[var(--brand-accent)]/10 border-[var(--brand-accent)]/20 border-l-[var(--brand-accent)] text-[var(--brand-accent)]'
                                        : ev.priority === 'high'
                                            ? 'bg-[var(--mce-red)]/10 border-[var(--mce-red)]/20 border-l-[var(--mce-red)] text-[var(--mce-red)]'
                                            : ev.priority === 'medium'
                                                ? 'bg-amber-500/10 border-amber-500/20 border-l-amber-500 text-amber-700'
                                                : 'bg-emerald-500/10 border-emerald-500/20 border-l-emerald-500 text-emerald-700';

                                    return (
                                        <button
                                            key={ev.id}
                                            type="button"
                                            onClick={() => {
                                                if (ev.projectId) {
                                                    onSelectProject?.(ev.projectId);
                                                }
                                            }}
                                            className={`w-full text-left text-gov-label font-bold italic px-2 py-2 rounded-lg border border-l-2 transition-all hover:scale-[1.03] active:scale-95 uppercase tracking-wide font-oswald ${colorClass} ${
                                                ev.kind === 'task' && ev.status === 'completed' ? 'opacity-40 grayscale' : ''
                                            }`}
                                            title={ev.title}
                                        >
                                            {ev.title}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            <PageHeader 
                title="Portfolio Timeline"
                subtitle="Temporal Lock // Sector 05"
                actions={
                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-4 py-1.5 text-caption font-bold italic rounded-lg transition-all ${viewMode === 'month' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-4 py-1.5 text-caption font-bold italic rounded-lg transition-all ${viewMode === 'week' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Week
                            </button>
                        </div>
                        <button onClick={jumpToToday} className="px-4 py-2 text-caption font-bold italic bg-gray-50 text-gray-600 hover:text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all tracking-widest">
                            Today
                        </button>
                    </div>
                }
            />


            {/* Calendar Body */}
            <div className="flex-1 bg-[var(--surface-base)] border border-[var(--surface-border)] rounded-xl p-4 shadow-xl overflow-hidden flex flex-col">
                {renderCalendarGrid()}
            </div>
        </div>
    );
};

