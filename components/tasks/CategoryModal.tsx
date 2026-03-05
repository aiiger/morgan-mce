import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag, Save } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';

interface CategoryModalProps {
    onClose: () => void;
    categories: Category[];
    onUpdate: () => void;
    category?: Category;
}

const colors = [
    'var(--color-critical)',
    'var(--color-warning)',
    'var(--color-success)',
    'var(--brand-accent)',
    'var(--mce-red)',
    'var(--mce-red-accent)',
    'var(--mce-teal)',
    'var(--mce-teal-soft)',
    'var(--text-secondary)',
    'var(--text-tertiary)'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({ onClose, categories, onUpdate, category }) => {
    const { getClient } = useSupabase();
    const [newName, setNewName] = useState(category?.name || '');
    const [newColor, setNewColor] = useState(category?.color || 'var(--brand-accent)');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setNewName(category.name);
            setNewColor(category.color);
        }
    }, [category]);

    const handleSave = async () => {
        if (!newName.trim()) return;
        setLoading(true);

        let error;
        try {
            const client = await getClient();
            if (category) {
                // Update
                const { error: err } = await (client
                    .from('categories' as any) as any)
                    .update({ name: newName.trim(), color: newColor })
                    .eq('id', category.id);
                error = err;
            } else {
                // Create
                const { error: err } = await (client
                    .from('categories' as any) as any)
                    .insert([{ name: newName.trim(), color: newColor }]);
                error = err;
            }
        } catch (err) {
            console.error(err);
            error = err;
        }

        if (!error) {
            setNewName('');
            onUpdate();
            onClose();
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        const client = await getClient();
        const { error } = await (client.from('categories' as any) as any).delete().eq('id', id);
        if (!error) onUpdate();
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
            <div className="bg-bg-base border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold italic text-gray-900 tracking-tight flex items-center">
                        <Tag className="mr-3 text-[var(--color-info)]" size={20} />
                        MANAGE CATEGORIES
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-gray-900 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Create/Edit */}
                    <div className="space-y-4">
                        <label className="text-caption font-bold italic tracking-widest text-slate-500">{category ? 'Update' : 'Create New'} Category</label>
                        <div className="flex gap-2">
                            <input
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Category name..."
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[var(--color-info)]/50 transition-all"
                            />
                            <button
                                onClick={handleSave}
                                disabled={loading || !newName.trim()}
                                className="bg-[var(--color-info)] text-slate-900 px-4 py-2 rounded-xl font-bold italic hover:bg-teal-500 transition-all disabled:opacity-50"
                            >
                                {category ? <Save size={20} /> : <Plus size={20} />}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setNewColor(c)}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${newColor === c ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <label className="text-caption font-bold italic tracking-widest text-slate-500 block mb-4">Existing Categories</label>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto overflow-auto pr-2">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 group">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: cat.color }} />
                                        <span className="text-sm font-bold italic text-gray-900 tracking-wide">{cat.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="text-rose-500/50 hover:text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <div className="text-center py-4 text-slate-500 text-xs">No categories created yet</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-50 text-gray-900 rounded-xl font-bold italic hover:bg-gray-50 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
