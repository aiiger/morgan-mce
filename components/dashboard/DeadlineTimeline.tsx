import React, { useMemo } from 'react';
import { Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  project: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface DeadlineTimelineProps {
  deadlines: Deadline[];
}

/**
 * DeadlineTimeline - REVAMPED 2026 (GOLDEN STATE)
 * High-precision Chronology | Oswald Typography | Urgent Accents
 * Fixed Width Containment
 */
export const DeadlineTimeline: React.FC<DeadlineTimelineProps> = ({ deadlines }) => {

  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    const due = new Date(dateString);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sortedDeadlines = useMemo(() => {
    return [...deadlines].sort((a, b) =>
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [deadlines]);

  const getUrgencyStyle = (days: number) => {
    if (days < 0) return {
      bg: 'bg-[var(--bg-surface)]',
      border: 'border-[var(--mce-red)]',
      text: 'text-[var(--mce-red)]',
      label: 'OVERDUE',
      accent: 'bg-[var(--mce-red)]'
    };
    if (days <= 7) return {
      bg: 'bg-[var(--bg-surface)]',
      border: 'border-amber-500',
      text: 'text-amber-600',
      label: 'URGENT',
      accent: 'bg-amber-500'
    };
    return {
      bg: 'bg-[var(--bg-surface)]',
      border: 'border-[var(--brand-accent)]/20',
      text: 'text-[var(--brand-accent)]',
      label: 'SCHEDULED',
      accent: 'bg-[var(--brand-accent)]'
    };
  };

  if (deadlines.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-tertiary)] text-sm italic py-12">
        No upcoming critical dates recorded.
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* 1. Legend / Header */}
      <div className="flex items-center justify-between mb-6 w-full">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[var(--text-tertiary)]" />
          <span className="text-caption font-bold italic font-oswald uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
            Mission_Chronology
          </span>
        </div>
        <div className="flex items-center gap-4 text-caption font-bold italic font-oswald uppercase tracking-widest text-[var(--text-tertiary)] opacity-60">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--mce-red)]" />
            <span>CRITICAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>WARNING</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)]" />
            <span>NOMINAL</span>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Lane */}
      <div className="w-full overflow-x-auto custom-scrollbar-horizontal pb-6">
        <div className="flex gap-6 min-w-max">
          {sortedDeadlines.map((deadline) => {
            const days = getDaysRemaining(deadline.dueDate);
            const style = getUrgencyStyle(days);
            const isPast = days < 0;

            return (
              <div
                key={deadline.id}
                className={cn(
                  "relative flex flex-col w-[280px] p-6 rounded-xl border-2 transition-all duration-300 group hover:shadow-2xl hover:-translate-y-1",
                  style.bg, style.border
                )}
              >
                {/* Visual Accent Bar */}
                <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-lg", style.accent)} />

                {/* Days Display */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className={cn("text-4xl font-bold italic font-oswald tracking-tighter leading-none", style.text)}>
                      {isPast ? Math.abs(days) : days}
                      <span className="text-sm ml-1 uppercase">{isPast ? 'D_AGO' : 'DAYS'}</span>
                    </span>
                  </div>
                  <div className={cn("px-2 py-0.5 rounded-sm text-caption font-bold tracking-widest text-white", style.accent)}>
                    {style.label}
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 mb-4 min-w-0">
                  <h5 className="text-xs font-bold tracking-wide text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors line-clamp-2 font-oswald leading-snug">
                    {deadline.title}
                  </h5>
                  <p className="text-gov-label font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1 truncate">
                    {deadline.project}
                  </p>
                </div>

                {/* Technical Meta Footer */}
                <div className="pt-3 border-t border-[var(--surface-border)] flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="text-caption font-bold text-[var(--text-tertiary)] uppercase opacity-40 leading-none mb-1 text-left">Target_Date</span>
                    <span className="text-caption font-mono font-bold italic text-[var(--text-secondary)]">
                      {new Date(deadline.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-layer)] border border-[var(--surface-border)] flex items-center justify-center group-hover:bg-[var(--brand-accent)] group-hover:text-white transition-all cursor-pointer">
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
