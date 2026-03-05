import React, { useState, useRef } from 'react';
import { X, Loader2, Gavel } from 'lucide-react';

interface TenderFormProps {
  onClose: () => void;
  onSuccess: (tender?: any) => void;
}

/* ─── VeraPM-parity: light modal with blue accents ────────────────── */
export const TenderForm: React.FC<TenderFormProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    client: '',
    value: '',
    probability: 'Medium',
    status: 'PRE_QUAL',
    lead_source: '',
    expected_close_date: '',
    priority: 'Medium',
    description: '',
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const getIdempotencyKey = () => {
    if (!idempotencyKeyRef.current) {
      const randomUUID = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      idempotencyKeyRef.current = randomUUID;
    }
    return idempotencyKeyRef.current;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: form.title,
        value: parseFloat(form.value) || 0,
        status: form.status,
        compliance: 0,
        owner: form.client || 'Tender Owner',
      };
      const res = await fetch('/api/morgan/tenders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': getIdempotencyKey(),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create tender');
      idempotencyKeyRef.current = null;
      onSuccess(data);
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
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Gavel className="size-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">New Tender</h2>
              <p className="text-xs text-gray-500">Register a business opportunity</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <X className="size-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              {error}
            </div>
          )}

          {/* Title + Client */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tender Title {req}</label>
              <input required autoFocus placeholder="e.g. Al Reem Island Bridge Design" className={inputCls}
                value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Client {req}</label>
              <input required placeholder="e.g. Aldar Properties" className={inputCls}
                value={form.client} onChange={e => set('client', e.target.value)} />
            </div>
          </div>

          {/* Value + Lead Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Estimated Value (AED)</label>
              <input type="number" placeholder="e.g. 15000000" className={inputCls}
                value={form.value} onChange={e => set('value', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Lead Source</label>
              <input placeholder="e.g. Direct Referral" className={inputCls}
                value={form.lead_source} onChange={e => set('lead_source', e.target.value)} />
            </div>
          </div>

          {/* Close Date + Probability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Expected Close Date</label>
              <input type="date" className={inputCls}
                value={form.expected_close_date} onChange={e => set('expected_close_date', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Win Probability</label>
              <select className={selectCls} value={form.probability} onChange={e => set('probability', e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Priority</label>
              <select className={selectCls} value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={selectCls} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="PRE_QUAL">Pre-Qualification</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="WON">Won</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={3} placeholder="Brief overview of the tender scope and requirements"
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
              {loading ? 'Creating...' : 'Submit Tender'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};