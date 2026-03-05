import React, { useState } from 'react';
import { X, CheckSquare, Calendar, Tag, AlertCircle } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { Task, Category, TaskStatus, TaskPriority } from '../../types';

interface TaskModalProps {
    onClose: () => void;
    onUpdate: () => void;
    categories: Category[];
    task?: Task;
}

export const TaskModal: React.FC<TaskModalProps> = ({ onClose, onUpdate, categories, task }) => {
    const { getClient } = useSupabase();
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [status, setStatus] = useState<TaskStatus>(task?.status || 'pending');
    const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
    const [dueDate, setDueDate] = useState(task?.due_date || '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        task?.categories?.map(c => c.id) || []
    );
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) return;
        setLoading(true);

        const taskData = {
            title: title.trim(),
            description: description.trim(),
            status,
            priority,
            due_date: dueDate || null,
            updated_at: new Date().toISOString()
        };

        let error;
        try {
            const client = await getClient();
            if (task) {
                const { error: err } = await (client.from('tasks' as any) as any).update(taskData).eq('id', task.id);
                error = err;
            } else {
                const { data, error: err } = await (client.from('tasks' as any) as any).insert([taskData]).select().single();
                error = err;

                // Handle categories for new task
                if (!error && data && selectedCategories.length > 0) {
                    await (client.from('task_categories' as any) as any).insert(
                        selectedCategories.map(catId => ({ task_id: data.id, category_id: catId }))
                    );
                }
            }
        } catch (err) {
            console.error(err);
            error = err;
        }

        if (!error) {
            onUpdate();
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
            <div className="bg-bg-base border border-gray-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold italic text-gray-900 tracking-tight flex items-center">
                        <CheckSquare className="mr-3 text-[var(--color-info)]" size={20} />
                        {task ? 'EDIT TASK' : 'NEW TASK'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-gray-900 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto overflow-auto">
                    <div className="space-y-4">
                        <div>
                            <label className="text-caption font-bold italic tracking-widest text-slate-500 block mb-2">Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[var(--color-info)]/50 transition-all font-bold italic"
                            />
                        </div>

                        <div>
                            <label className="text-caption font-bold italic tracking-widest text-slate-500 block mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Add details..."
                                rows={3}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[var(--color-info)]/50 transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-caption font-bold italic tracking-widest text-slate-500 block mb-2">Priority</label>
                                <select
                                    value={priority}
                                    onChange={e => setPriority(e.target.value as TaskPriority)}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[var(--color-info)]/50 transition-all"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-caption font-bold italic tracking-widest text-slate-500 block mb-2">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as TaskStatus)}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[var(--color-info)]/50 transition-all"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-caption font-bold italic tracking-widest text-slate-500 block mb-2">Due Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:border-[var(--color-info)]/50 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-caption font-bold italic tracking-widest text-slate-500 block mb-2">Categories</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            if (selectedCategories.includes(cat.id)) {
                                                setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                                            } else {
                                                setSelectedCategories([...selectedCategories, cat.id]);
                                            }
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold italic border transition-all flex items-center ${selectedCategories.includes(cat.id)
                                            ? 'border-[var(--color-info)] text-[var(--color-info)] bg-[var(--color-info)]/10'
                                            : 'border-gray-200 text-slate-500 hover:text-gray-900 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-50 text-slate-400 rounded-xl font-bold italic hover:bg-gray-50 hover:text-gray-900 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !title.trim()}
                        className="px-8 py-2 bg-[var(--color-info)] text-slate-900 rounded-xl font-bold italic hover:bg-teal-500 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(51,204,204,0.2)]"
                    >
                        {loading ? 'Saving...' : 'Save Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};
