import React, { useState } from 'react';
import { X, Loader2, Clock } from 'lucide-react';

interface TimesheetFormProps {
  resourceId: string;
  projects: any[];
  onClose: () => void;
  onSuccess: () => void;
}

/* ─── VeraPM-parity: light modal with blue accents ────────────────── */
export const TimesheetForm: React.FC<TimesheetFormProps> = ({ resourceId, projects, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    project_id: projects[0]?.id || '',
    hours_logged: '8',
    work_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        resource_id: resourceId,
        project_id: form.project_id,
        hours_logged: parseFloat(form.hours_logged) || 0,
        work_date: form.work_date,
        description: form.description,
      };
      const res = await fetch('/api/morgan/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to log timesheet');
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="size-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Log Hours</h2>
              <p className="text-xs text-gray-500">Record billable time entry</p>
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

          {/* Target Project */}
          <div>
            <label className={labelCls}>Target Project {req}</label>
            <select required className={selectCls} value={form.project_id} onChange={e => set('project_id', e.target.value)}>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.project_name || p.name}</option>
              ))}
            </select>
          </div>

          {/* Hours + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Hours Logged {req}</label>
              <input required type="number" step="0.5" className={`${inputCls} font-mono`}
                value={form.hours_logged} onChange={e => set('hours_logged', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Work Date</label>
              <input type="date" className={inputCls}
                value={form.work_date} onChange={e => set('work_date', e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Activity Description</label>
            <textarea rows={3} placeholder="Describe the work performed..."
              className={`${inputCls} resize-none`}
              value={form.description} onChange={e => set('description', e.target.value)} />
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
              {loading ? 'Logging...' : 'Log Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};