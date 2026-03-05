import React, { useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';

interface ResourceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

/* ─── VeraPM-parity: light modal with blue accents ────────────────── */
export const ResourceForm: React.FC<ResourceFormProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    role: '',
    department: 'Projects',
    hourly_rate: '',
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: form.full_name,
        role: form.role,
        department: form.department,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
      };
      const res = await fetch('/api/morgan/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to add resource');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all';
  const selectCls = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none cursor-pointer';
  const labelCls = 'block text-[13px] font-medium text-gray-700 mb-1.5';
  const req = <span className="text-red-500 ml-0.5">*</span>;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <UserPlus className="size-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add Resource</h2>
              <p className="text-xs text-gray-500">Register a new team member</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <X className="size-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className={labelCls}>Full Name {req}</label>
            <input required autoFocus placeholder="e.g. Ahmed Al Mansoori" className={inputCls}
              value={form.full_name} onChange={e => set('full_name', e.target.value)} />
          </div>

          {/* Role + Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Role {req}</label>
              <input required placeholder="e.g. Senior Engineer" className={inputCls}
                value={form.role} onChange={e => set('role', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Department</label>
              <select className={selectCls} value={form.department} onChange={e => set('department', e.target.value)}>
                <option>Projects</option>
                <option>Engineering</option>
                <option>Finance</option>
                <option>HR</option>
                <option>Operations</option>
              </select>
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className={labelCls}>Hourly Rate (AED) {req}</label>
            <input required type="number" placeholder="e.g. 350" className={`${inputCls} font-mono`}
              value={form.hourly_rate} onChange={e => set('hourly_rate', e.target.value)} />
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {loading ? 'Saving...' : 'Save Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
