'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, Edit3, Trash2, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  task_count: number;
}

const PRESET_COLOURS = [
  'var(--brand-accent)',
  'var(--mce-teal)',
  'var(--mce-teal-soft)',
  'var(--mce-red)',
  'var(--mce-red-accent)',
  'var(--color-info)',
  'var(--color-warning)',
  'var(--color-success)',
  'var(--color-critical)',
  'var(--text-tertiary)',
];

const EMPTY_FORM = { name: '', color: 'var(--brand-accent)' };

export default function CategoriesPage() {
  const { user, isLoaded } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/categories?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json() as { categories: Category[] };
      setCategories(json.categories ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) void fetchCategories();
  }, [isLoaded, user, fetchCategories]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, color: cat.color });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await fetch(`/api/categories/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, name: form.name.trim(), color: form.color }),
        });
        if (!res.ok) throw new Error('Failed to update');
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, name: form.name.trim(), color: form.color }),
        });
        if (!res.ok) throw new Error('Failed to create');
      }
      setModalOpen(false);
      await fetchCategories();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await fetch(`/api/categories/${id}?userId=${user.id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      await fetchCategories();
    } catch {
      setError('Failed to delete category');
    }
  };

  const totalCategorized = categories.reduce((s, c) => s + c.task_count, 0);
  const mostUsed = categories.reduce<Category | null>((best, c) => (!best || c.task_count > best.task_count) ? c : best, null);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} /> New Category
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">Error: {error}</p>}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Categories', value: categories.length, colour: 'text-cyan-400' },
          { label: 'Categorized Tasks', value: totalCategorized, colour: 'text-amber-400' },
          { label: 'Most Used', value: mostUsed?.name ?? '—', colour: 'text-emerald-400' },
        ].map(({ label, value, colour }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-xl font-bold ${colour}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Category cards */}
      {categories.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-zinc-500 text-sm">No categories yet.</p>
            <button onClick={openCreate} className="text-cyan-400 text-sm mt-1 hover:text-cyan-300">Create one →</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-white font-medium flex-1 truncate">{cat.name}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-1 text-zinc-500 hover:text-cyan-400 transition-colors">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => setDeleteConfirm(cat.id)} className="p-1 text-zinc-500 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-500">{cat.task_count} task{cat.task_count !== 1 ? 's' : ''}</p>

              {/* Colour swatch preview */}
              <div
                className="mt-3 h-1 rounded-full opacity-60"
                style={{ backgroundColor: cat.color }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">{editId ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Name *</label>
                <input
                  required
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Colour</label>
                {/* Preset swatches */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_COLOURS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                        form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                {/* Custom hex */}
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full border border-zinc-600 shrink-0"
                    style={{ backgroundColor: form.color }}
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="var(--brand-accent)"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Preview badge */}
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Preview</label>
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium text-black"
                  style={{ backgroundColor: form.color }}
                >
                  {form.name || 'Category name'}
                </span>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-colors"
                >
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-80 shadow-2xl">
            <h2 className="text-white font-semibold mb-2">Delete Category?</h2>
            <p className="text-zinc-400 text-sm mb-4">
              This will remove the category. Tasks in it will not be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => void handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-white text-sm font-semibold rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
