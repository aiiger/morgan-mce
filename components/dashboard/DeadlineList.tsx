import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Clock, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    dueDate: string;
    priority: 'High' | 'Medium' | 'Low';
    assignedTo: string;
    project: string;
}

interface DeadlineListProps {
    tasks?: Task[];
}

export const DeadlineList: React.FC<DeadlineListProps> = ({ tasks = [] }) => {

    // Sort tasks by due date (closest first)
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [tasks]);

    const getDaysRemaining = (dateString: string) => {
        const today = new Date();
        const due = new Date(dateString);
        const setHours = (d: Date) => d.setHours(0, 0, 0, 0);
        const diffTime = setHours(due) - setHours(today);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return (
        <Card className="h-full bg-[var(--bg-surface)]/80 backdrop-blur-md border-[var(--surface-border)]" padding="none">
            <CardHeader className="px-6 py-3 border-b border-[var(--surface-border)] bg-[var(--bg-surface)]/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[var(--text-secondary)]" />
                        <CardTitle className="text-sm font-bold italic text-[var(--text-primary)]">UPCOMING DEADLINES</CardTitle>
                    </div>
                    {tasks.length > 0 && (
                        <Badge variant="outline" className="bg-[var(--morgan-teal)]/10 text-[var(--morgan-teal)] border-[var(--morgan-teal)]/20 text-xs px-1.5 py-0.5">
                            {tasks.length}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="divide-y divide-[var(--surface-border)] flex-col h-full overflow-y-auto custom-scrollbar">
                {sortedTasks.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-tertiary)] text-xs font-bold italic opacity-50">No Pending Tasks</div>
                ) : (
                    sortedTasks.map((task) => {
                        const days = getDaysRemaining(task.dueDate);
                        const isUrgent = days <= 3;

                        return (
                            <div key={task.id} className="p-3 hover:bg-[var(--bg-hover)]/30 transition-colors group cursor-pointer relative overflow-hidden border-l-2 border-transparent hover:border-[var(--morgan-teal)]">
                                {isUrgent && (
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-critical)] opacity-100" />
                                )}

                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                                        <h4 className="text-xs font-bold italic text-[var(--text-primary)] group-hover:text-[var(--morgan-teal)] transition-colors line-clamp-2">
                                            {task.title}
                                        </h4>
                                        <span className="text-gov-label text-[var(--text-tertiary)] uppercase tracking-wider font-oswald">
                                            {task.project}
                                        </span>
                                    </div>
                                    <div className={`flex flex-col items-end shrink-0 ml-3 ${isUrgent ? 'animate-pulse' : ''}`}>
                                        <span className={`text-2xl font-mono font-bold italic leading-none ${days < 0 ? 'text-[var(--color-critical)]' :
                                            isUrgent ? 'text-[var(--color-critical)]' :
                                            days <= 7 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'
                                            }`}>
                                            {days < 0 ? 'OD' : `${days}D`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <div className="opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-[var(--morgan-teal)] font-bold italic tracking-wider">
                                        <span>Action</span>
                                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
};

