import React, { useMemo } from 'react';
import { Badge } from "../ui/Badge";
import { ArrowRight } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    dueDate: string;
    priority: 'High' | 'Medium' | 'Low';
    assignedTo: string;
    project: string;
}

interface DeadlineQueueListProps {
    tasks?: Task[];
    limit?: number;
}

export const DeadlineQueueList: React.FC<DeadlineQueueListProps> = ({ tasks = [], limit }) => {

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
        <div className="divide-y divide-border-base flex-col h-full">
            {sortedTasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs font-bold italic opacity-50">No Pending Tasks</div>
            ) : (
                (limit ? sortedTasks.slice(0, limit) : sortedTasks).map((task) => {
                    const days = getDaysRemaining(task.dueDate);
                    const isUrgent = days <= 3;

                    return (
                        <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors group cursor-pointer relative overflow-hidden">
                            {isUrgent && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-amber-600 opacity-80" />
                            )}

                            <div className="flex items-start justify-between mb-1.5 pl-2">
                                <div className="flex flex-col gap-0.5">
                                    <Badge>{task.project}</Badge>
                                    <h4 className="text-gov-body font-bold italic text-text-primary group-hover:text-text-primary transition-colors line-clamp-1">
                                        {task.title}
                                    </h4>
                                </div>
                                <div className={`flex flex-col items-end shrink-0 ${isUrgent ? 'animate-pulse' : ''}`}>
                                    <span className={`text-xl font-mono font-bold italic leading-none ${isUrgent ? 'text-rose-600' :
                                        days <= 7 ? 'text-amber-600' : 'text-emerald-600'
                                        }`}>
                                        {days < 0 ? 'OD' : days}
                                    </span>
                                    <span className="text-xs font-bold italic text-text-tertiary">
                                        {days < 0 ? 'Overdue' : 'Days Left'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pl-2">
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                    <div className="w-5 h-5 rounded-full bg-bg-surface border border-border-subtle flex items-center justify-center text-xs font-bold italic text-text-tertiary">
                                        {task.assignedTo.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span>Assigned to <span className="text-text-secondary font-bold italic">{task.assignedTo}</span></span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-emerald-500 font-bold italic tracking-wider">
                                    <span>Action</span>
                                    <ArrowRight size={12} />
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

