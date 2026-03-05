import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, ChevronRight, Upload, Globe, Users, Lock, Loader2 } from 'lucide-react';

interface ProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

/* ─── VeraPM-parity: 3-step full-page wizard ──────────────────────── */
export const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    portfolio: '',
    priority: 'Medium',
    status: 'Draft',
    type: '',
    visibility: 'Public',
    logo: '',
    manager: '',
    client: '',
    start_date: '',
    end_date: '',
    location: '',
    contract_value: '',
    description: '',
  });

  const set = useCallback((k: string, v: string) => setForm(prev => ({ ...prev, [k]: v })), []);

  const getIdempotencyKey = () => {
    if (!idempotencyKeyRef.current) {
      const randomUUID = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      idempotencyKeyRef.current = randomUUID;
    }
    return idempotencyKeyRef.current;
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setLogoPreview(reader.result as string); set('logo', reader.result as string); };
    reader.readAsDataURL(file);
  };

  const submit = async (asDraft = false) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        code: form.code,
        portfolio: form.portfolio || 'General',
        priority: form.priority,
        status: asDraft ? 'Draft' : form.status,
        value: parseFloat(form.contract_value) || 0,
        progress: 0,
        description: form.description || undefined,
        manager: form.manager || undefined,
        clientName: form.client || undefined,
        startDate: form.start_date || undefined,
        endDate: form.end_date || undefined,
        location: form.location || undefined,
      };
      const res = await fetch('/api/morgan/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': getIdempotencyKey(),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Save failed (${res.status})`);
      }
      idempotencyKeyRef.current = null;
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── constants ───────────────────────────────────────────────── */
  const PORTFOLIOS = ['Healthcare', 'Residential', 'Commercial', 'Infrastructure', 'Industrial', 'Energy', 'Mixed-Use', 'Government'];
  const TYPES = [
    { value: 'Agile', icon: '🔲' },
    { value: 'Waterfall', icon: '🔷' },
    { value: 'Hybrid', icon: '🔶' },
    { value: 'Design-Build', icon: '🏗️' },
    { value: 'Design-Bid-Build', icon: '📐' },
  ];
  const STATUSES = ['Draft', 'Active', 'On Hold', 'Closed', 'Template'];
  const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
  const VIS = [
    { value: 'Public', icon: Globe, desc: 'Visible to everyone in the organization' },
    { value: 'Team', icon: Users, desc: 'Visible to workspace team members only' },
    { value: 'Private', icon: Lock, desc: 'Visible only to project members' },
  ];

  /* ── shared classes ──────────────────────────────────────────── */
  const inputCls = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all';
  const selectCls = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none cursor-pointer';
  const labelCls = 'block text-[13px] font-medium text-gray-700 mb-1.5';
  const req = <span className="text-red-500 ml-0.5">*</span>;

  /* ── Step indicator ──────────────────────────────────────────── */
  const Stepper = () => (
    <div className="flex items-center justify-center gap-0 mb-6">
      {[1, 2, 3].map((s, i) => (
        <React.Fragment key={s}>
          <button type="button" onClick={() => s < step && setStep(s)}
            className={`size-8 rounded-full text-sm font-semibold transition-all flex items-center justify-center ${
              s === step ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
              s < step ? 'bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200' :
              'bg-gray-100 text-gray-400'
            }`}>{s}</button>
          {i < 2 && <div className={`w-16 h-0.5 ${s < step ? 'bg-blue-400' : 'bg-gray-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     STEP 1 — Basic Information
     ═══════════════════════════════════════════════════════════════ */
  const Step1 = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
        <p className="text-sm text-gray-500">Enter the basic details for your project</p>
      </div>
      <Stepper />

      {/* Name + Code — two columns */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Project Name {req}</label>
          <input required autoFocus placeholder="Enter project name" className={inputCls}
            value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Project Code {req}</label>
          <input required placeholder="e.g., PRJ-2024-001" className={inputCls}
            value={form.code} onChange={e => set('code', e.target.value)} />
        </div>
      </div>

      {/* Portfolio — full width */}
      <div>
        <label className={labelCls}>Portfolio {req}</label>
        <select required className={selectCls} value={form.portfolio} onChange={e => set('portfolio', e.target.value)}>
          <option value="" disabled>Select Portfolio</option>
          {PORTFOLIOS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Priority + Status — two columns */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Project Priority</label>
          <select className={selectCls} value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Project Status {req}</label>
          <select required className={selectCls} value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Project Type */}
      <div>
        <label className={labelCls}>Project Type {req}</label>
        <select required className={selectCls} value={form.type} onChange={e => set('type', e.target.value)}>
          <option value="" disabled>Select Type</option>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.value}</option>)}
        </select>
      </div>

      {/* Project Visibility — card selector */}
      <div>
        <label className={labelCls}>Project Visibility</label>
        <div className="grid grid-cols-3 gap-3 mt-1">
          {VIS.map(v => {
            const Icon = v.icon;
            const active = form.visibility === v.value;
            return (
              <button key={v.value} type="button" onClick={() => set('visibility', v.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  active
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className={`size-5 mb-2 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className={`text-[13px] font-semibold ${active ? 'text-blue-700' : 'text-gray-700'}`}>{v.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{v.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Logo — drag & drop area */}
      <div>
        <label className={labelCls}>Project Logo</label>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
        <div
          onClick={() => fileRef.current?.click()}
          className="mt-1 border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
        >
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="size-16 rounded-xl object-cover shadow-md" />
          ) : (
            <Upload className="size-8 text-gray-300" />
          )}
          <p className="text-sm text-gray-500">{logoPreview ? 'Click to change' : 'Drag and drop your logo here, or click to browse'}</p>
          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
          <button type="button" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Upload Logo
          </button>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     STEP 2 — Team & Schedule
     ═══════════════════════════════════════════════════════════════ */
  const Step2 = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gray-900">Team &amp; Schedule</h2>
        <p className="text-sm text-gray-500">Set up the project team and timeline</p>
      </div>
      <Stepper />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Project Manager</label>
          <input placeholder="e.g. Ali Mohammadi" className={inputCls}
            value={form.manager} onChange={e => set('manager', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Client Entity</label>
          <input placeholder="e.g. Aldar Properties" className={inputCls}
            value={form.client} onChange={e => set('client', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Start Date</label>
          <input type="date" className={inputCls}
            value={form.start_date} onChange={e => set('start_date', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>End Date</label>
          <input type="date" className={inputCls}
            value={form.end_date} onChange={e => set('end_date', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Location (City)</label>
        <input placeholder="e.g. Abu Dhabi" className={inputCls}
          value={form.location} onChange={e => set('location', e.target.value)} />
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     STEP 3 — Financials & Summary
     ═══════════════════════════════════════════════════════════════ */
  const Step3 = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gray-900">Financials &amp; Summary</h2>
        <p className="text-sm text-gray-500">Review and finalize your project</p>
      </div>
      <Stepper />

      <div>
        <label className={labelCls}>Contract Value (AED)</label>
        <input type="number" placeholder="e.g. 50,000,000" className={inputCls}
          value={form.contract_value} onChange={e => set('contract_value', e.target.value)} />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea rows={4} placeholder="Brief description of the project scope and objectives" className={`${inputCls} resize-none`}
          value={form.description} onChange={e => set('description', e.target.value)} />
      </div>

      {/* Summary card */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Project Summary</h3>
        <div className="grid grid-cols-2 gap-y-2.5 text-sm">
          {([
            ['Name', form.name],
            ['Code', form.code],
            ['Portfolio', form.portfolio],
            ['Type', form.type],
            ['Priority', form.priority],
            ['Status', form.status],
            ['Visibility', form.visibility],
            ['Manager', form.manager || '—'],
            ['Client', form.client || '—'],
            ['Location', form.location || '—'],
            ['Value', form.contract_value ? `AED ${Number(form.contract_value).toLocaleString()}` : '—'],
          ] as [string, string][]).map(([k, v]) => (
            <React.Fragment key={k}>
              <span className="text-gray-500">{k}</span>
              <span className="text-gray-900 font-medium">{v || '—'}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Validation per step ─────────────────────────────── */
  const canNext = step === 1
    ? Boolean(form.name && form.code && form.portfolio && form.type)
    : true;

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
        <button type="button" onClick={onClose}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <ArrowLeft className="size-4" /> Back
        </button>
      </div>

      {/* Content area */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            {error}
          </div>
        )}

        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}

        {/* Footer actions */}
        <div className="mt-8 flex items-center justify-between">
          <button type="button" onClick={() => void submit(true)} disabled={loading || !form.name}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40">
            Save Draft
          </button>

          <div className="flex gap-3">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                Previous
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} disabled={!canNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40">
                Next <ChevronRight className="size-4" />
              </button>
            ) : (
              <button type="button" onClick={() => void submit(false)} disabled={loading || !canNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};