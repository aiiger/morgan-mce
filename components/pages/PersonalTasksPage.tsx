
import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { EmptyState } from '../ui/EmptyState';

interface Task {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
}

const KanbanColumn = ({ title, tasks }: { title: string, tasks: Task[] }) => (
    <div className="flex-1">
        <h3 className="text-sm font-bold italic text-gray-900 tracking-wider mb-4 px-2">{title} ({tasks.length})</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-2 h-full">
            {tasks.map(task => (
                <div key={task.id} className="bg-white border border-gray-100 p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-700">{task.title}</p>
                </div>
            ))}
        </div>
    </div>
);


import { PageHeader } from '../ui/PageHeader';

export const PersonalTasksPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/morgan/tasks')
            .then(r => r.json())
            .then(data => setTasks(Array.isArray(data.tasks) ? data.tasks : []))
            .catch(() => setTasks([]))
            .finally(() => setLoading(false));
    }, []);

    const tasksByStatus = {
        pending: tasks.filter(t => t.status === 'pending'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        completed: tasks.filter(t => t.status === 'completed'),
    };

    return (
        <div className="page-container space-y-8 pb-32">
            <PageHeader
                title="Personal Tasks"
                subtitle="Individual Action Cluster"
                actions={
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-inner">
                            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-gray-200' : ''}`}><LayoutGrid size={16} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-200' : ''}`}><List size={16} /></button>
                        </div>
                        <GlassButton className="italic px-6 py-2 rounded-xl text-caption font-bold italic tracking-widest shadow-glow-blue"><Plus size={16} className="mr-2" /> New Task</GlassButton>
                    </div>
                }
            />

            {viewMode === 'kanban' ? (
                <div className="flex space-x-4">
                    <KanbanColumn title="To Do" tasks={tasksByStatus.pending} />
                    <KanbanColumn title="In Progress" tasks={tasksByStatus.in_progress} />
                    <KanbanColumn title="Completed" tasks={tasksByStatus.completed} />
                </div>
            ) : (
                <EmptyState
                    icon={List}
                    title="List View Unavailable"
                    description="This view mode is currently under construction."
                    className="mt-8 border-dashed border-gray-200 bg-gray-50"
                />
            )}
        </div>
    );
};

