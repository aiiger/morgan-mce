import React, { useState } from 'react';
import { TodoItem, Priority } from './TodoItem';
import { TodoProgress } from './TodoProgress';
import { Plus, Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    priority: Priority;
}

export const TodoList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Verify Neural Link established', completed: true, priority: 'high' },
        { id: '2', title: 'Calibrate Void Black harmonics', completed: false, priority: 'medium' },
        { id: '3', title: 'Sync Vector Vault with local drive', completed: false, priority: 'high' },
        { id: '4', title: 'Review System 2 Reasoning logs', completed: false, priority: 'low' },
    ]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');

    const completedCount = tasks.filter(t => t.completed).length;

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title: newTaskTitle,
            completed: false,
            priority
        };

        setTasks([newTask, ...tasks]);
        setNewTaskTitle('');
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <TodoProgress completed={completedCount} total={tasks.length} />

            <div className="space-y-4">
                {/* Quick Add Section */}
                <form onSubmit={addTask} className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Plus className="w-5 h-5 text-[var(--brand-accent)]/50 group-focus-within:text-[var(--brand-accent)] transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="INITIALIZE NEW TASK NODE..."
                        className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-32 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[var(--brand-accent)]/50 focus:ring-1 focus:ring-[var(--brand-accent)]/20 transition-all"
                    />
                    <div className="absolute inset-y-2 right-2 flex items-center gap-1">
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Priority)}
                            className="bg-gray-50 text-caption font-bold italic text-gray-600 border border-gray-200 rounded px-2 py-1 outline-none focus:border-[var(--brand-accent)]/30"
                        >
                            <option value="low">LOW</option>
                            <option value="medium">NOMINAL</option>
                            <option value="high">CRITICAL</option>
                        </select>
                        <button
                            type="submit"
                            className="bg-[var(--brand-accent)] text-white text-caption font-bold italic px-4 py-1.5 rounded hover:opacity-90 transition-colors"
                        >
                            EXECUTE
                        </button>
                    </div>
                </form>

                {/* Task Nodes */}
                <div className="space-y-1">
                    <AnimatePresence mode="popLayout">
                        {tasks.map(task => (
                            <TodoItem
                                key={task.id}
                                {...task}
                                onToggle={toggleTask}
                                onDelete={deleteTask}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {tasks.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-400 font-bold tracking-widest text-sm">
                            No Active Task Nodes Found
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
