import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, FileText, Users, BarChart3, Clock, CheckCircle2,
  AlertCircle, ChevronRight, Zap, Plus, Search, Bell, Settings,
  Activity, Workflow as WorkflowIcon, Globe, FolderOpen, MessageSquare, Video,
  ClipboardCheck, Calendar, Layers, MoreVertical, RefreshCw, X, ToggleLeft,
  ToggleRight, Palette, ArrowRight, Upload, Trash2, Edit3,
  Shield, Flag, Target, TrendingUp, DollarSign, MapPin, Download,
  ThermometerSun, UserCheck, Flame, Eye, Filter
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { type AutomationRule } from '@/lib/imperial/automation'
import type { SectionId, WorkflowStatus, WorkflowFormData, MorganProject, MorganTender } from './types'

// ── Reusable Components ────────────────────────────────────────────────────
interface KpiCardProps {
  label: string
  value: string | number
  trend?: string
  icon: React.ComponentType<{ className?: string }>
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'red'
}

const KpiCard = ({ label, value, trend, icon: Icon, color = 'blue' }: KpiCardProps) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gov-label text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${colors[color] || colors.blue}`}><Icon className="size-5" /></div>
      </div>
      {trend && (
        <p className={`text-gov-label ${String(trend).startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>{trend}</p>
      )}
    </div>
  )
}

const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex justify-between items-center bg-white px-8 py-5 rounded-2xl border border-slate-100 shadow-sm">
    <div className="space-y-1">
      <h2 className="text-gov-title text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-gov-body text-slate-400">{subtitle}</p>}
    </div>
    {action}
  </div>
)

const SearchBar = ({ placeholder = 'Search...', value = '', onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) => (
  <div className="relative flex-1 group">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
    <input type="text" placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
      className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all" />
    {value && <button onClick={() => onChange?.('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors"><X className="size-3.5 text-slate-400" /></button>}
  </div>
)

const ActionBtn = ({ children, onClick, variant = 'primary' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-lg text-gov-body font-semibold flex items-center gap-2 transition-all active:scale-95 ${
      variant === 'primary'
        ? 'bg-slate-900 hover:bg-black text-white shadow-lg'
        : 'bg-white border border-slate-100 text-slate-700 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
)

// ── Health Ring (SVG) ──────────────────────────────────────────────────────
const HealthRing = ({ score }: { score: number }) => {
  const r = 54; const c = 2 * Math.PI * r; const offset = c - (score / 100) * c
  return (
    <div className="relative size-36 mx-auto">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--surface-border)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--mce-teal)" strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{score}</span>
        <span className="text-caption text-slate-400">Health</span>
      </div>
    </div>
  )
}

// ── Project Detail Panel ───────────────────────────────────────────────────
const ProjectDetail = ({ project, onClose }: { project: MorganProject; onClose: () => void }) => (
  <div className="fixed inset-0 z-[90] flex justify-end bg-black/30 backdrop-blur-sm" onClick={onClose}>
    <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold border border-blue-100">{project.name.charAt(0)}</div>
          <div>
            <h2 className="text-[18px] font-semibold text-slate-900">{project.name}</h2>
            <span className="text-caption text-slate-400 font-mono">{project.code}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><X className="size-5 text-slate-400" /></button>
      </div>
      <div className="p-8 space-y-8">
        {/* Overview KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-gov-label text-slate-400 mb-1">Status</p>
            <p className="text-gov-body font-semibold text-slate-900">{project.status}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-gov-label text-slate-400 mb-1">Priority</p>
            <p className={`text-gov-body font-semibold ${project.priority === 'Critical' ? 'text-red-600' : project.priority === 'High' ? 'text-amber-600' : 'text-slate-900'}`}>{project.priority}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-gov-label text-slate-400 mb-1">Portfolio</p>
            <p className="text-gov-body font-semibold text-slate-900">{project.portfolio || 'General'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-gov-label text-slate-400 mb-1">Contract Value</p>
            <p className="text-gov-body font-semibold text-slate-900">{typeof project.value === 'number' ? `AED ${(project.value/1000).toFixed(0)}K` : project.value}</p>
          </div>
        </div>
        {/* Progress */}
        <div>
          <div className="flex justify-between mb-2"><span className="text-gov-label text-slate-500">Progress</span><span className="text-gov-body font-bold text-slate-900">{project.progress}%</span></div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${project.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${project.progress}%` }} /></div>
        </div>
        {/* Team */}
        <div>
          <h3 className="text-gov-header text-slate-900 mb-3">Team</h3>
          <p className="text-gov-body text-slate-400">No team members assigned yet. Assign team members from the project settings.</p>
        </div>
        {/* Recent Activity */}
        <div>
          <h3 className="text-gov-header text-slate-900 mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: `Current status: ${project.status}`, time: 'Now' },
              { action: `Progress: ${project.progress}%`, time: 'Current' },
              { action: `Priority: ${project.priority}`, time: 'Current' },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-gov-body">
                <div className="size-1.5 rounded-full bg-blue-400" />
                <span className="text-slate-700 flex-1">{a.action}</span>
                <span className="text-caption text-slate-400">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

// ── Project Card ───────────────────────────────────────────────────────────
const ProjectCard = ({ project, onClick }: { project: MorganProject; onClick?: () => void }) => (
  <div onClick={onClick} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-3">
        <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-bold border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{project.name.charAt(0)}</div>
        <div>
          <h3 className="text-gov-body font-semibold text-slate-900 group-hover:text-[var(--brand-accent)] transition-colors">{project.name}</h3>
          <span className="text-caption text-slate-400 font-mono">{project.code}</span>
        </div>
      </div>
      <span className={`px-2.5 py-1 rounded-lg text-caption font-bold border ${project.progress === 100 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
        {project.progress === 100 ? 'Completed' : 'Active'}
      </span>
    </div>
    <div className="space-y-3">
      <div className="flex justify-between text-gov-label"><span className="text-slate-400">Progress</span><span className="text-slate-900 font-semibold">{project.progress}%</span></div>
      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-50">
        <div className={`h-full rounded-full ${project.progress === 100 ? 'bg-emerald-500' : 'bg-[var(--brand-accent)]'}`} style={{ width: `${project.progress}%` }} />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex -space-x-1.5">
          {project.code.slice(0, 3).split('').map((c, i) => <div key={i} className="size-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600 shadow-sm">{c.toUpperCase()}</div>)}
        </div>
        <span className="text-gov-label font-semibold text-slate-800">{project.value} <span className="text-slate-400">USD</span></span>
      </div>
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VIEWS
// ═══════════════════════════════════════════════════════════════════════════

// ── Dashboard ──────────────────────────────────────────────────────────────
const DashboardView = ({ projects, tenders, onNavigate }: { projects: MorganProject[]; tenders: MorganTender[]; onNavigate?: (s: SectionId) => void }) => {
  const totalValue = projects.reduce((sum, p) => sum + (typeof p.value === 'number' ? p.value : parseFloat(String(p.value)) || 0), 0)
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length) : 0
  const criticalProjects = projects.filter(p => p.priority === 'Critical' || p.priority === 'High').length
  const healthScore = Math.min(100, Math.max(0, 100 - criticalProjects * 5 - (100 - avgProgress) / 2))
  return (
  <div className="space-y-8">
    <div className="grid grid-cols-12 gap-8">
      {/* Health ring + alerts */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <h3 className="text-gov-header text-slate-900 mb-6">Workspace Health</h3>
          <HealthRing score={Math.round(healthScore)} />
          <p className="text-center text-gov-body text-slate-400 mt-4">Overall workspace health score</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-gov-header text-slate-900 mb-4">Critical Alerts</h3>
          <div className="space-y-3">
            {[
              ...(criticalProjects > 0 ? [{ msg: `${criticalProjects} high-priority project${criticalProjects > 1 ? 's' : ''} need attention`, sev: 'critical' as const }] : []),
              ...(tenders.length > 0 ? [{ msg: `${tenders.length} active tender${tenders.length > 1 ? 's' : ''} in pipeline`, sev: 'warning' as const }] : []),
              { msg: `Portfolio average progress at ${avgProgress}%`, sev: 'info' as const },
            ].map((alert, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                alert.sev === 'critical' ? 'border-red-100 bg-red-50/50' : alert.sev === 'warning' ? 'border-amber-100 bg-amber-50/50' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <AlertCircle className={`size-4 mt-0.5 shrink-0 ${alert.sev === 'critical' ? 'text-red-500' : alert.sev === 'warning' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="text-gov-body text-slate-700">{alert.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* KPIs + Recent */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Active Projects" value={projects.length} trend={`${avgProgress}% avg progress`} icon={Briefcase} color="blue" />
          <KpiCard label="Pipeline Value" value={`${(totalValue / 1_000_000).toFixed(1)}M`} trend={`${tenders.length} tenders`} icon={DollarSign} color="green" />
          <KpiCard label="High Priority" value={criticalProjects} trend={criticalProjects > 0 ? 'Needs attention' : 'All clear'} icon={AlertCircle} color={criticalProjects > 0 ? 'amber' : 'green'} />
          <KpiCard label="Team Members" value={new Set(projects.map(p => p.portfolio).filter(Boolean)).size || projects.length} trend={`${projects.length} projects`} icon={Users} color="purple" />
        </div>
        <SectionHeader title="Recent Projects" subtitle={`${projects.length} active projects`} action={<ActionBtn variant="secondary" onClick={() => onNavigate?.('projects')}><ArrowRight className="size-4" /> View All</ActionBtn>} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.slice(0, 4).map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>
    </div>
  </div>
  )
}

// ── Portfolios ─────────────────────────────────────────────────────────────
const PortfoliosView = ({ projects }: { projects: MorganProject[] }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pSearch, setPSearch] = useState('')
  const [pName, setPName] = useState('')
  const [pDesc, setPDesc] = useState('')
  const [pBudget, setPBudget] = useState('')
  const [pManager, setPManager] = useState('')
  const [pType, setPType] = useState('Enterprise PMO')
  const [pStatus, setPStatus] = useState<'ACTIVE' | 'ARCHIVED' | 'PENDING'>('ACTIVE')
  const [pStrategy, setPStrategy] = useState('')
  const [portfolios, setPortfolios] = useState<Array<{id:string;name:string;description?:string;projectCount:number;totalBudget:number;health:string;color?:string;manager?:string;status:string;updatedAt?:string}>>([])
  const loadPortfolios = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/portfolios')
      if (res.ok) { const data = await res.json(); setPortfolios(data.portfolios || []) }
    } catch { /* no-op */ }
  }, [])
  useEffect(() => { loadPortfolios() }, [loadPortfolios])

  const resetPortfolioForm = () => { setPName(''); setPDesc(''); setPBudget(''); setPManager(''); setPStrategy(''); setPStatus('ACTIVE'); setEditingId(null); setShowForm(false) }
  const startEditPortfolio = (p: typeof portfolios[0]) => { setPName(p.name); setPDesc(p.description || ''); setPBudget(p.totalBudget ? String(p.totalBudget) : ''); setPManager(p.manager || ''); setPStatus((p.status === 'Active' ? 'ACTIVE' : p.status === 'Pending' ? 'PENDING' : p.status) as any); setEditingId(p.id); setShowForm(true) }
  const handleSavePortfolio = async () => {
    if (!pName.trim()) return
    const body = { name: pName, description: pDesc || 'New portfolio', status: pStatus === 'ACTIVE' ? 'Active' : pStatus === 'PENDING' ? 'Pending' : 'Archived', projectCount: 0, totalBudget: pBudget ? parseFloat(pBudget.replace(/[^0-9.]/g, '')) || 0 : 0, manager: pManager || undefined }
    if (editingId) {
      await fetch(`/api/morgan/portfolios/${editingId}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    } else {
      await fetch('/api/morgan/portfolios', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    }
    resetPortfolioForm()
    await loadPortfolios()
  }

  return (
  <div className="space-y-6">
    <SectionHeader title="Portfolios" subtitle="Manage and monitor your project portfolios" action={<ActionBtn onClick={() => { resetPortfolioForm(); setShowForm(true) }}><Plus className="size-4" /> Create Portfolio</ActionBtn>} />

    {/* Create Portfolio Form — VeroPM aligned */}
    <AnimatePresence>
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white border border-slate-100 rounded-2xl shadow-lg p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-gov-title text-slate-900">{editingId ? 'Edit Portfolio' : 'Create Portfolio'}</h3>
            <button onClick={resetPortfolioForm} className="p-2 hover:bg-slate-50 rounded-lg"><X className="size-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Portfolio Name *</label>
              <input type="text" value={pName} onChange={e => setPName(e.target.value)} placeholder="e.g. Digital Transformation" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </div>
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Portfolio Type</label>
              <select value={pType} onChange={e => setPType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                <option value="Enterprise PMO">Enterprise PMO</option>
                <option value="Product Development">Product Development</option>
                <option value="IT Services">IT Services</option>
                <option value="Digital Transformation">Digital Transformation</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-gov-label text-slate-500">Description</label>
            <textarea value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Describe the strategic purpose of this portfolio" rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Budget (AED)</label>
              <input type="text" value={pBudget} onChange={e => setPBudget(e.target.value)} placeholder="e.g. 50,000,000" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </div>
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Portfolio Manager</label>
              <input type="text" value={pManager} onChange={e => setPManager(e.target.value)} placeholder="Select manager" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </div>
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Status</label>
              <select value={pStatus} onChange={e => setPStatus(e.target.value as any)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-gov-label text-slate-500">Strategic Alignment (OKR)</label>
            <input type="text" value={pStrategy} onChange={e => setPStrategy(e.target.value)} placeholder="e.g. Q2 2026 — Reduce project delivery time by 30%" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
          </div>
          <div className="flex justify-end gap-3">
            <ActionBtn variant="secondary" onClick={resetPortfolioForm}>Cancel</ActionBtn>
            <ActionBtn onClick={handleSavePortfolio}><CheckCircle2 className="size-4" /> {editingId ? 'Save Changes' : 'Create Portfolio'}</ActionBtn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Portfolio KPIs */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KpiCard label="Total Portfolios" value={portfolios.length} icon={Briefcase} color="blue" />
      <KpiCard label="Active Projects" value={portfolios.reduce((s, p) => s + (p.projectCount || 0), 0)} trend={`${portfolios.filter(p => p.status === 'Active' || p.status === 'ACTIVE').length} active`} icon={FileText} color="green" />
      <KpiCard label="Total Value" value={`AED ${(portfolios.reduce((s, p) => s + (p.totalBudget || 0), 0) / 1000000).toFixed(0)}M`} icon={DollarSign} color="purple" />
      <KpiCard label="Health Score" value={(() => { const h = portfolios.filter(p => p.health); const good = h.filter(p => p.health === 'Good' || p.health === 'Excellent').length; return h.length > 0 ? `${Math.round((good / h.length) * 100)}%` : '—' })()} trend={`${portfolios.length} portfolios`} icon={Activity} color="green" />
    </div>

    <div className="flex gap-4 items-center">
      <SearchBar placeholder="Search portfolios..." value={pSearch} onChange={setPSearch} />
      <ActionBtn variant="secondary" onClick={() => setPSearch(pSearch === '__active' ? '' : '__active')}><Activity className="size-4" /> {pSearch === '__active' ? 'Clear Filter' : 'Active Only'}</ActionBtn>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolios.filter(p => pSearch === '__active' ? (p.status === 'Active' || p.status === 'ACTIVE') : (!pSearch || p.name.toLowerCase().includes(pSearch.toLowerCase()))).map(p => (
        <div key={p.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Briefcase className="size-5" /></div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-lg text-caption font-bold ${p.status === 'ACTIVE' || p.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : p.status === 'PENDING' || p.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>{p.status}</span>
              <span className="text-caption text-slate-400">{p.updatedAt ? p.updatedAt.slice(0, 10) : ''}</span>
              <button className="p-1 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Edit" onClick={(e) => { e.stopPropagation(); startEditPortfolio(p) }}><Edit3 className="size-3.5 text-blue-400" /></button>
              <button className="p-1 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Delete" onClick={async (e) => { e.stopPropagation(); await fetch(`/api/morgan/portfolios/${p.id}`, {method:'DELETE'}); setPortfolios(prev => prev.filter(x => x.id !== p.id)) }}><Trash2 className="size-3.5 text-red-400" /></button>
            </div>
          </div>
          <h3 className="text-gov-header text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{p.name}</h3>
          <p className="text-gov-body text-slate-500 mb-4 line-clamp-2">{p.description}</p>
          {/* Mini health bar */}
          <div className="mb-4">
            <div className="flex justify-between text-caption mb-1"><span className="text-slate-400">Health</span><span className="text-emerald-600 font-bold">{p.health || 'Good'}</span></div>
            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden"><div className={`h-full rounded-full ${p.health === 'Critical' ? 'bg-red-500' : p.health === 'At Risk' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${p.health === 'Excellent' ? 95 : p.health === 'Good' ? 80 : p.health === 'At Risk' ? 55 : p.health === 'Critical' ? 25 : 75}%` }} /></div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-50">
            <div><span className="text-caption text-slate-400">Projects</span><br /><span className="text-gov-body font-bold text-slate-900">{p.projectCount}</span></div>
            <div className="text-right"><span className="text-caption text-slate-400">Value</span><br /><span className="text-gov-body font-bold text-emerald-600">{p.totalBudget ? `AED ${(p.totalBudget / 1000000).toFixed(1)}M` : 'AED 0'}</span></div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

// ── Tenders (Kanban) ───────────────────────────────────────────────────────
const TendersKanbanView = ({ tenders, onCreate, onDelete }: { tenders: MorganTender[]; onCreate: () => void; onDelete?: (id: string) => void }) => {
  const [search, setSearch] = useState('')
  const stages = [
    { id: 'Draft', label: 'Draft', color: 'bg-slate-400' },
    { id: 'Published', label: 'Published', color: 'bg-blue-500' },
    { id: 'Under Review', label: 'Under Review', color: 'bg-amber-500' },
    { id: 'Awarded', label: 'Awarded', color: 'bg-emerald-500' },
    { id: 'Closed', label: 'Closed', color: 'bg-purple-500' },
  ]
  const [stageFilter, setStageFilter] = useState('')
  const filtered = tenders.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    if (stageFilter && (t.status || 'Draft').toLowerCase() !== stageFilter.toLowerCase()) return false
    return true
  })
  const tendersByStage = (stageId: string) => filtered.filter(t => {
    const s = (t.status || 'Draft').toLowerCase()
    return s === stageId.toLowerCase()
  })
  return (
    <div className="space-y-6">
      <SectionHeader title="Tenders" subtitle={`${filtered.length} business opportunities`} action={<ActionBtn onClick={onCreate}><Plus className="size-4" /> New Tender</ActionBtn>} />
      <div className="flex gap-4 items-center">
        <SearchBar placeholder="Search tenders..." value={search} onChange={setSearch} />
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="border border-slate-100 rounded-lg px-3 py-2.5 text-gov-body bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-50">
          <option value="">All Stages</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 min-h-[500px]">
        {stages.map(stage => {
          const items = tendersByStage(stage.id)
          return (
            <div key={stage.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1 mb-1">
                <div className={`size-2 rounded-full ${stage.color}`} />
                <span className="text-gov-label font-semibold text-slate-900">{stage.label}</span>
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-caption ml-auto">{items.length}</span>
              </div>
              <div className="flex-1 rounded-2xl bg-slate-50/50 p-3 space-y-3 border border-transparent hover:border-slate-100 transition-colors">
                {items.length === 0 && <p className="text-caption text-slate-300 text-center py-8">No tenders</p>}
                {items.map(t => (
                  <div key={t.id} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-gov-body font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex-1">{t.name}</h4>
                      {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(t.id) }} className="p-1 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0" title="Delete tender"><Trash2 className="size-3.5 text-red-400" /></button>}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                      <span className="text-gov-label font-bold text-slate-900">{typeof t.value === 'number' ? `AED ${(t.value/1000).toFixed(0)}K` : t.value}</span>
                      <span className="text-gov-label font-bold text-emerald-500">{t.compliance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Projects ───────────────────────────────────────────────────────────────
const ProjectsView = ({ projects, onCreate, onSelect, onNavigateTemplates }: { projects: MorganProject[]; onCreate: () => void; onSelect: (p: MorganProject) => void; onNavigateTemplates?: () => void }) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const filtered = projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.code.toLowerCase().includes(search.toLowerCase()) && !(p.portfolio || '').toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && p.status !== statusFilter) return false
    if (priorityFilter && p.priority !== priorityFilter) return false
    return true
  })
  return (
    <div className="space-y-6">
      <SectionHeader title="Projects" subtitle={`${filtered.length} projects found`} action={
        <div className="flex gap-2">
          <ActionBtn variant="secondary" onClick={onNavigateTemplates}><Layers className="size-4" /> Use Template</ActionBtn>
          <ActionBtn onClick={onCreate}><Plus className="size-4" /> Create Project</ActionBtn>
        </div>
      } />
      <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-6">
        <div className="flex gap-4 items-center flex-wrap">
          <SearchBar placeholder="Search projects..." value={search} onChange={setSearch} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-slate-100 rounded-lg px-3 py-2.5 text-gov-body bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-50">
            <option value="">All Statuses</option>
            {[...new Set(projects.map(p => p.status))].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="border border-slate-100 rounded-lg px-3 py-2.5 text-gov-body bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-50">
            <option value="">All Priorities</option>
            {[...new Set(projects.map(p => p.priority))].map(pr => <option key={pr} value={pr}>{pr}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => <ProjectCard key={p.id} project={p} onClick={() => onSelect(p)} />)}
        </div>
      </div>
    </div>
  )
}

// ── Templates ──────────────────────────────────────────────────────────────
const TemplatesView = () => {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tplName, setTplName] = useState('')
  const [tplCategory, setTplCategory] = useState('Project')
  const [tplDescription, setTplDescription] = useState('')
  const [templates, setTemplates] = useState<Array<{id:string;name:string;category:string;description?:string;status:string;version?:string;createdAt?:string}>>([])

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/templates')
      if (res.ok) { const data = await res.json(); setTemplates(data.templates || []) }
    } catch { /* no-op */ }
  }, [])
  useEffect(() => { loadTemplates() }, [loadTemplates])

  const resetTplForm = () => { setTplName(''); setTplDescription(''); setTplCategory('Project'); setEditingId(null); setShowForm(false) }
  const startEditTemplate = (t: typeof templates[0]) => { setTplName(t.name); setTplCategory(t.category); setTplDescription(t.description || ''); setEditingId(t.id); setShowForm(true) }
  const handleSaveTemplate = async () => {
    if (!tplName.trim()) return
    const body = { name: tplName, category: tplCategory, description: tplDescription || 'New template', status: 'Active', version: '1.0' }
    if (editingId) {
      await fetch(`/api/morgan/templates/${editingId}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    } else {
      await fetch('/api/morgan/templates', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    }
    resetTplForm()
    await loadTemplates()
  }

  const deleteTemplate = async (id: string) => {
    await fetch(`/api/morgan/templates/${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const [categoryFilter, setCategoryFilter] = useState('')
  const filtered = templates.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter && t.category !== categoryFilter) return false
    return true
  })
  return (
    <div className="space-y-6">
      <SectionHeader title="Templates" subtitle={`${templates.length} reusable templates`} action={<ActionBtn onClick={() => { resetTplForm(); setShowForm(true) }}><Plus className="size-4" /> Create Template</ActionBtn>} />

      {/* Create Template Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white border border-slate-100 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-gov-title text-slate-900">{editingId ? 'Edit Template' : 'Create Template'}</h3>
              <button onClick={resetTplForm} className="p-2 hover:bg-slate-50 rounded-lg"><X className="size-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Template Name *</label>
                <input type="text" value={tplName} onChange={e => setTplName(e.target.value)} placeholder="e.g. Construction Phase" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Category</label>
                <select value={tplCategory} onChange={e => setTplCategory(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="Project">Project</option>
                  <option value="Tender">Tender</option>
                  <option value="Audit">Audit</option>
                  <option value="Risk">Risk</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Description</label>
              <textarea value={tplDescription} onChange={e => setTplDescription(e.target.value)} placeholder="Describe the template purpose" rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
            </div>
            <div className="flex justify-end gap-3">
              <ActionBtn variant="secondary" onClick={resetTplForm}>Cancel</ActionBtn>
              <ActionBtn onClick={handleSaveTemplate}><Layers className="size-4" /> {editingId ? 'Save Changes' : 'Create Template'}</ActionBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4 items-center">
        <SearchBar placeholder="Search templates..." value={search} onChange={setSearch} />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border border-slate-100 rounded-lg px-3 py-2.5 text-gov-body bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-50">
          <option value="">All Categories</option>
          {[...new Set(templates.map(t => t.category))].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(t => (
          <div key={t.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors"><Layers className="size-5" /></div>
              <div className="flex items-center gap-2">
                <span className="text-caption bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">{t.category}</span>
                <button className="p-1 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Edit" onClick={(e) => { e.stopPropagation(); startEditTemplate(t) }}><Edit3 className="size-3.5 text-blue-400" /></button>
                <button className="p-1 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Delete" onClick={async (e) => { e.stopPropagation(); await deleteTemplate(t.id) }}><Trash2 className="size-3.5 text-red-400" /></button>
              </div>
            </div>
            <h3 className="text-gov-header text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">{t.name}</h3>
            <p className="text-gov-body text-slate-500">{t.description}</p>
            {t.version && <span className="text-caption text-slate-400 mt-2 inline-block">v{t.version}</span>}
          </div>
        ))}
        {templates.length === 0 && <p className="text-gov-body text-slate-400 col-span-3 text-center py-8">No templates yet. Create one to get started.</p>}
      </div>
    </div>
  )
}

// ── Workflows (with Create Form) ───────────────────────────────────────────
const BLANK_STATUS: WorkflowStatus = { id: '', name: '', color: 'var(--brand-accent)', isInitial: false, isFinal: false }

const WorkflowsView = ({ projects }: { projects: MorganProject[] }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [workflows, setWorkflows] = useState<Array<{id:string;name:string;description?:string;status:string;createdAt?:string;updatedAt?:string}>>([])
  const [form, setForm] = useState<WorkflowFormData>({
    name: '', description: '', bindProject: '', templateType: '',
    active: true, isDefault: false,
    statuses: [
      { id: 's1', name: 'To Do', color: 'var(--text-tertiary)', isInitial: true, isFinal: false },
      { id: 's2', name: 'In Progress', color: 'var(--brand-accent)', isInitial: false, isFinal: false },
    ]
  })
  const [formTab, setFormTab] = useState<'editor' | 'canvas'>('editor')

  const loadWorkflows = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/workflows')
      if (res.ok) { const data = await res.json(); setWorkflows(Array.isArray(data) ? data : data.workflows || []) }
    } catch { /* no-op */ }
  }, [])
  useEffect(() => { loadWorkflows() }, [loadWorkflows])

  const addStatus = () => {
    setForm(prev => ({
      ...prev,
      statuses: [...prev.statuses, { ...BLANK_STATUS, id: `s${Date.now()}` }]
    }))
  }

  const updateStatus = (id: string, patch: Partial<WorkflowStatus>) => {
    setForm(prev => ({
      ...prev,
      statuses: prev.statuses.map(s => s.id === id ? { ...s, ...patch } : s)
    }))
  }

  const removeStatus = (id: string) => {
    setForm(prev => ({ ...prev, statuses: prev.statuses.filter(s => s.id !== id) }))
  }

  const defaultStatuses = [{ id: 's1', name: 'To Do', color: 'var(--text-tertiary)', isInitial: true, isFinal: false }, { id: 's2', name: 'In Progress', color: 'var(--brand-accent)', isInitial: false, isFinal: false }]
  const resetWfForm = () => { setForm({ name: '', description: '', bindProject: '', templateType: '', active: true, isDefault: false, statuses: defaultStatuses }); setEditingId(null); setShowForm(false) }
  const startEditWorkflow = (wf: typeof workflows[0]) => { setForm(prev => ({ ...prev, name: wf.name, description: wf.description || '', active: wf.status === 'ACTIVE' })); setEditingId(wf.id); setShowForm(true) }
  const handleSave = async () => {
    if (!form.name.trim()) return
    const body = { name: form.name, description: form.description, status: form.active ? 'ACTIVE' : 'INACTIVE' }
    try {
      if (editingId) {
        await fetch(`/api/morgan/workflows/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      } else {
        await fetch('/api/morgan/workflows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }
    } catch { /* silent */ }
    resetWfForm()
    await loadWorkflows()
  }

  const deleteWorkflow = async (id: string) => {
    await fetch(`/api/morgan/workflows/${id}`, { method: 'DELETE' })
    setWorkflows(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Workflows" subtitle={`${workflows.length} workflow definitions`}
        action={<ActionBtn onClick={() => { resetWfForm(); setShowForm(true) }}><Plus className="size-4" /> Create Workflow</ActionBtn>}
      />

      {/* Workflow list */}
      {!showForm && (
        <div className="space-y-4">
          {workflows.map(wf => (
            <div key={wf.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><WorkflowIcon className="size-5" /></div>
                <div>
                  <h3 className="text-gov-body font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{wf.name}</h3>
                  <p className="text-caption text-slate-400 max-w-sm truncate">{wf.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-caption text-slate-400">{wf.createdAt ? wf.createdAt.slice(0, 10) : ''}</span>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-bold ${wf.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}>
                  <div className={`size-1.5 rounded-full ${wf.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  {wf.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => startEditWorkflow(wf)} className="p-1.5 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Edit"><Edit3 className="size-4 text-blue-400" /></button>
                <button onClick={() => deleteWorkflow(wf.id)} className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Delete"><Trash2 className="size-4 text-red-400" /></button>
              </div>
            </div>
          ))}
          {workflows.length === 0 && <p className="text-gov-body text-slate-400 text-center py-8">No workflows yet. Create one to get started.</p>}
        </div>
      )}

      {/* Create Workflow Form — VeroPM Clone */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white border border-slate-100 rounded-2xl shadow-lg overflow-hidden">
            {/* Form header */}
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-gov-title text-slate-900">{editingId ? 'Edit Workflow' : 'Create Workflow'}</h3>
              <button onClick={resetWfForm} className="p-2 hover:bg-slate-50 rounded-lg"><X className="size-5 text-slate-400" /></button>
            </div>

            <div className="p-8 space-y-8">
              {/* Name + Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-gov-label text-slate-500">Workflow Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Construction Phase Workflow"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gov-label text-slate-500">Description</label>
                  <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of this workflow"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Bind to Project + Template Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-gov-label text-slate-500">Bind to Project</label>
                  <select value={form.bindProject} onChange={e => setForm(p => ({ ...p, bindProject: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white"
                  >
                    <option value="">Select a project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-gov-label text-slate-500">Template Type</label>
                  <select value={form.templateType} onChange={e => setForm(p => ({ ...p, templateType: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white"
                  >
                    <option value="">Select template...</option>
                    <option value="construction">Construction Phase</option>
                    <option value="tender">Tender Response</option>
                    <option value="compliance">Compliance Review</option>
                    <option value="procurement">Procurement Cycle</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-8">
                <button type="button" onClick={() => setForm(p => ({ ...p, active: !p.active }))} className="flex items-center gap-3">
                  {form.active ? <ToggleRight className="size-6 text-emerald-500" /> : <ToggleLeft className="size-6 text-slate-300" />}
                  <span className="text-gov-body text-slate-700">Active</span>
                </button>
                <button type="button" onClick={() => setForm(p => ({ ...p, isDefault: !p.isDefault }))} className="flex items-center gap-3">
                  {form.isDefault ? <ToggleRight className="size-6 text-blue-500" /> : <ToggleLeft className="size-6 text-slate-300" />}
                  <span className="text-gov-body text-slate-700">Set as Default</span>
                </button>
              </div>

              {/* Form Editor / Visual Canvas tabs */}
              <div className="border-b border-slate-100">
                <div className="flex gap-0">
                  <button onClick={() => setFormTab('editor')}
                    className={`px-6 py-3 text-gov-body font-semibold border-b-2 transition-colors ${formTab === 'editor' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >Form Editor</button>
                  <button onClick={() => setFormTab('canvas')}
                    className={`px-6 py-3 text-gov-body font-semibold border-b-2 transition-colors ${formTab === 'canvas' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >Visual Canvas</button>
                </div>
              </div>

              {formTab === 'editor' ? (
                <div className="space-y-4">
                  <h4 className="text-gov-header text-slate-900">Statuses</h4>
                  <div className="space-y-3">
                    {form.statuses.map(status => (
                      <div key={status.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        {/* Color picker */}
                        <input type="color" value={status.color} onChange={e => updateStatus(status.id, { color: e.target.value })}
                          className="size-8 rounded-lg border border-slate-200 cursor-pointer p-0"
                        />
                        {/* Name */}
                        <input type="text" value={status.name} onChange={e => updateStatus(status.id, { name: e.target.value })}
                          placeholder="Status name"
                          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                        />
                        {/* Initial toggle */}
                        <button type="button" onClick={() => updateStatus(status.id, { isInitial: !status.isInitial })}
                          className={`px-3 py-1.5 rounded-lg text-caption font-bold border transition-colors ${status.isInitial ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-400'}`}
                        >Initial</button>
                        {/* Final toggle */}
                        <button type="button" onClick={() => updateStatus(status.id, { isFinal: !status.isFinal })}
                          className={`px-3 py-1.5 rounded-lg text-caption font-bold border transition-colors ${status.isFinal ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400'}`}
                        >Final</button>
                        {/* Remove */}
                        <button type="button" onClick={() => removeStatus(status.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="size-4 text-slate-400 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addStatus}
                    className="w-full border border-dashed border-slate-200 py-3 rounded-xl text-gov-body font-semibold text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                  ><Plus className="size-4" /> Add Status</button>
                </div>
              ) : (
                <div className="h-64 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <WorkflowIcon className="size-10 mx-auto mb-3 opacity-50" />
                    <p className="text-gov-body">Visual canvas editor</p>
                    <p className="text-caption">Drag and drop workflow nodes here</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <ActionBtn variant="secondary" onClick={resetWfForm}>Cancel</ActionBtn>
                <ActionBtn onClick={handleSave}><CheckCircle2 className="size-4" /> {editingId ? 'Save Changes' : 'Save Workflow'}</ActionBtn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Automation ─────────────────────────────────────────────────────────────
const AutomationView = ({ rules, alerts, loading, onRefresh, onAck }: {
  rules: AutomationRule[]; alerts: any[]; loading: boolean
  onRefresh: () => void; onAck: (id: string) => void
}) => {
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'rules' | 'history' | 'templates'>('rules')
  const [ruleName, setRuleName] = useState('')
  const [ruleDesc, setRuleDesc] = useState('')
  const [ruleDomain, setRuleDomain] = useState('CONSTRUCTION')
  const [ruleActive, setRuleActive] = useState(true)
  const [triggerType, setTriggerType] = useState('status_change')
  const [triggerEvent, setTriggerEvent] = useState('')
  const [actionType, setActionType] = useState('notification')
  const [actionTarget, setActionTarget] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [executionHistory, setExecutionHistory] = useState<Array<{id:string;rule:string;trigger:string;status:string;executedAt:string;duration:string;timeSaved:string}>>([])
  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/automation/history')
      if (res.ok) {
        const data = await res.json()
        setExecutionHistory((data.history || []).map((h: any) => ({
          id: h.id,
          rule: h.ruleId || 'Rule',
          trigger: h.event || '—',
          status: h.state === 'ok' ? 'Success' : h.state === 'error' ? 'Failed' : (h.state || 'Success'),
          executedAt: h.createdAt ? h.createdAt.slice(0, 16).replace('T', ' ') : '—',
          duration: '—',
          timeSaved: '—',
        })))
      }
    } catch { /* no-op */ }
  }, [])
  useEffect(() => { loadHistory() }, [loadHistory])

  // Pre-built automation templates
  const templates = [
    { id: 't-1', name: 'Budget Overrun Alert', description: 'Notify when project budget exceeds threshold', trigger: 'Budget > X%', actions: 2, category: 'Financial' },
    { id: 't-2', name: 'Task Auto-Assign', description: 'Auto-assign tasks based on skill and availability', trigger: 'Task Created', actions: 3, category: 'Tasks' },
    { id: 't-3', name: 'Milestone Reminder', description: 'Send reminders before milestone due dates', trigger: 'Due Date -3d', actions: 1, category: 'Schedule' },
    { id: 't-4', name: 'Safety Compliance', description: 'Weekly safety compliance check across all sites', trigger: 'Weekly', actions: 4, category: 'Compliance' },
    { id: 't-5', name: 'Resource Conflict Alert', description: 'Detect and resolve resource double-bookings', trigger: 'Allocation Overlap', actions: 2, category: 'Resources' },
    { id: 't-6', name: 'Status Report Generator', description: 'Auto-generate weekly status reports for stakeholders', trigger: 'Friday 5PM', actions: 3, category: 'Reporting' },
  ]

  const resetRuleForm = () => { setRuleName(''); setRuleDesc(''); setRuleDomain('CONSTRUCTION'); setRuleActive(true); setTriggerType('status_change'); setTriggerEvent(''); setActionType('notification'); setActionTarget(''); setEditingId(null); setShowForm(false) }
  const startEditRule = (r: AutomationRule) => { setRuleName(r.name); setRuleDesc(r.description); setRuleDomain(r.domain); setRuleActive(r.active); setTriggerType((r as any).triggerType || 'status_change'); setTriggerEvent((r as any).triggerEvent || ''); setActionType((r as any).actionType || 'notification'); setActionTarget((r as any).actionTarget || ''); setEditingId(r.id); setShowForm(true) }
  const handleSaveRule = async () => {
    if (!ruleName.trim()) return
    try {
      if (editingId) {
        await fetch(`/api/morgan/automation/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: ruleName, description: ruleDesc, domain: ruleDomain, active: ruleActive, triggerType, triggerEvent, actionType, actionTarget })
        })
      } else {
        await fetch('/api/morgan/automation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: ruleName, description: ruleDesc, domain: ruleDomain, active: ruleActive, triggerType, triggerEvent, actionType, actionTarget, schedule: [] })
        })
      }
    } catch { /* silent */ }
    resetRuleForm()
    onRefresh()
  }

  return (
  <div className="space-y-6">
    <SectionHeader title="Automation Engine" subtitle="Manage automation rules, triggers, and execution history"
      action={<ActionBtn onClick={() => { resetRuleForm(); setShowForm(true) }}><Plus className="size-4" /> Create Rule</ActionBtn>}
    />

    {/* Create Rule Form — VeroPM aligned with trigger system */}
    <AnimatePresence>
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white border border-slate-100 rounded-2xl shadow-lg p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-gov-title text-slate-900">{editingId ? 'Edit Automation Rule' : 'Create Automation Rule'}</h3>
            <button onClick={resetRuleForm} className="p-2 hover:bg-slate-50 rounded-lg"><X className="size-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Rule Name *</label>
              <input type="text" value={ruleName} onChange={e => setRuleName(e.target.value)} placeholder="e.g. Budget Overrun Alert" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </div>
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Domain</label>
              <select value={ruleDomain} onChange={e => setRuleDomain(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                <option value="CONSTRUCTION">Construction</option>
                <option value="PROCUREMENT">Procurement</option>
                <option value="TENDER_MANAGEMENT">Tender Management</option>
                <option value="COMPLIANCE">Compliance</option>
                <option value="SAFETY">Safety</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-gov-label text-slate-500">Description</label>
            <textarea value={ruleDesc} onChange={e => setRuleDesc(e.target.value)} placeholder="What does this rule automate?" rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
          </div>

          {/* Trigger Configuration */}
          <div className="border border-slate-100 rounded-xl p-5 space-y-4 bg-slate-50/50">
            <h4 className="text-gov-header text-slate-900 flex items-center gap-2"><Zap className="size-4 text-amber-500" /> Trigger Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Trigger Type</label>
                <select value={triggerType} onChange={e => setTriggerType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="status_change">Status Change</option>
                  <option value="date_based">Date-Based Event</option>
                  <option value="field_update">Field Update</option>
                  <option value="threshold">Threshold Exceeded</option>
                  <option value="schedule">Recurring Schedule</option>
                  <option value="webhook">External Webhook</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Trigger Event</label>
                <input type="text" value={triggerEvent} onChange={e => setTriggerEvent(e.target.value)} placeholder="e.g. When status changes to Completed" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
            </div>
          </div>

          {/* Action Configuration */}
          <div className="border border-slate-100 rounded-xl p-5 space-y-4 bg-slate-50/50">
            <h4 className="text-gov-header text-slate-900 flex items-center gap-2"><ArrowRight className="size-4 text-blue-500" /> Action Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Action Type</label>
                <select value={actionType} onChange={e => setActionType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="notification">Send Notification</option>
                  <option value="create_task">Create Task</option>
                  <option value="assign_resource">Assign Resource</option>
                  <option value="update_field">Update Field</option>
                  <option value="approval_request">Request Approval</option>
                  <option value="generate_report">Generate Report</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Target</label>
                <input type="text" value={actionTarget} onChange={e => setActionTarget(e.target.value)} placeholder="e.g. VP of Engineering, #safety-alerts" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setRuleActive(!ruleActive)} className="flex items-center gap-2">
              {ruleActive ? <ToggleRight className="size-6 text-emerald-500" /> : <ToggleLeft className="size-6 text-slate-300" />}
              <span className="text-gov-body text-slate-700">Active</span>
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <ActionBtn variant="secondary" onClick={resetRuleForm}>Cancel</ActionBtn>
            <ActionBtn onClick={handleSaveRule}><CheckCircle2 className="size-4" /> {editingId ? 'Save Changes' : 'Save Rule'}</ActionBtn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KpiCard label="Total Rules" value={rules.length} icon={WorkflowIcon} color="blue" />
      <KpiCard label="Active" value={rules.filter(r => r.active).length} icon={CheckCircle2} color="green" />
      <KpiCard label="Executions Today" value={executionHistory.filter(e => e.status === 'Success').length} icon={Zap} color="amber" />
      <KpiCard label="Time Saved" value={executionHistory.length > 0 ? `${Math.round(executionHistory.filter(e => e.status === 'Success').length * 0.3 * 10) / 10}h` : '0h'} trend={`${executionHistory.length} executions`} icon={Clock} color="purple" />
    </div>

    {/* Tabs: Rules | Execution History | Templates */}
    <div className="border-b border-slate-100">
      <div className="flex gap-0">
        {(['rules', 'history', 'templates'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-gov-body font-semibold border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >{tab === 'history' ? 'Execution History' : tab}</button>
        ))}
      </div>
    </div>

    {activeTab === 'rules' && (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${rule.active ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}><Zap className="size-4" /></div>
                <div>
                  <h4 className="text-gov-body font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{rule.name}</h4>
                  <p className="text-caption text-slate-400">{rule.domain.replace('_', ' ')}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); startEditRule(rule) }} className="ml-auto p-1 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Edit rule"><Edit3 className="size-3.5 text-blue-500" /></button>
                <button onClick={async (e) => { e.stopPropagation(); await fetch(`/api/morgan/automation/${rule.id}`, {method:'DELETE'}); onRefresh() }} className="p-1 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Delete rule"><Trash2 className="size-3.5 text-red-400" /></button>
              </div>
              <p className="text-gov-body text-slate-500 line-clamp-2 mb-3">{rule.description}</p>
              <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                <span className="text-caption text-slate-400">{rule.schedule.length} checkpoints</span>
                <span className={`flex items-center gap-1.5 text-caption font-bold ${rule.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <div className={`size-1.5 rounded-full ${rule.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  {rule.active ? 'Active' : 'Idle'}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Alerts */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gov-header text-slate-900">Live Alerts</h3>
            <button onClick={onRefresh} className="text-gov-label font-semibold text-blue-600 hover:underline">Refresh</button>
          </div>
          {loading ? (
            <p className="text-gov-body text-slate-400">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p className="text-gov-body text-slate-400">No active alerts right now.</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 8).map((alert: any) => (
                <div key={alert.id} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-gov-body font-semibold text-slate-900">{alert.entityName}</p>
                    <p className="text-gov-label text-slate-500">{alert.label} &bull; {alert.ruleName}</p>
                  </div>
                  {alert.ackRequired && !alert.acknowledgedAt ? (
                    <button onClick={() => onAck(alert.id)} className="px-3 py-1.5 rounded-lg text-caption font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">ACK</button>
                  ) : (
                    <span className="text-caption text-slate-400">{alert.acknowledgedAt ? 'Acked' : 'Info'}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )}

    {activeTab === 'history' && (
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Rule</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Trigger</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Status</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Executed At</th>
              <th className="text-right px-6 py-3 text-gov-label text-slate-500">Duration</th>
              <th className="text-right px-6 py-3 text-gov-label text-slate-500">Time Saved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {executionHistory.map(ex => (
              <tr key={ex.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-gov-body text-slate-900 font-medium">{ex.rule}</td>
                <td className="px-6 py-4 text-gov-body text-slate-500">{ex.trigger}</td>
                <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-caption font-bold border ${ex.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{ex.status}</span></td>
                <td className="px-6 py-4 text-gov-body text-slate-500">{ex.executedAt}</td>
                <td className="px-6 py-4 text-gov-body text-slate-500 text-right">{ex.duration}</td>
                <td className="px-6 py-4 text-gov-body text-right font-semibold text-emerald-600">{ex.timeSaved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {activeTab === 'templates' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600"><Layers className="size-5" /></div>
              <span className="text-caption bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">{t.category}</span>
            </div>
            <h4 className="text-gov-body font-semibold text-slate-900 group-hover:text-purple-600 transition-colors mb-1">{t.name}</h4>
            <p className="text-gov-body text-slate-500 mb-3 line-clamp-2">{t.description}</p>
            <div className="flex justify-between items-center pt-3 border-t border-slate-50">
              <span className="text-caption text-slate-400">Trigger: {t.trigger}</span>
              <span className="text-caption text-slate-400">{t.actions} actions</span>
            </div>
            <button onClick={() => { setRuleName(t.name); setRuleDesc(t.description); setShowForm(true); setActiveTab('rules') }} className="w-full mt-3 px-4 py-2 rounded-lg text-gov-body font-semibold bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-100 transition-colors">
              Use Template
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
)}

// ── My Tasks ───────────────────────────────────────────────────────────────
const TasksView = () => {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskProject, setTaskProject] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [taskPriority, setTaskPriority] = useState('Medium')
  const [tasks, setTasks] = useState<Array<{id:string;title:string;project?:string;due?:string;priority:string;status:string}>>([])
  const [loading, setLoading] = useState(true)
  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/tasks')
      if (res.ok) { const data = await res.json(); setTasks(data.tasks || []) }
    } catch { /* no-op */ } finally { setLoading(false) }
  }, [])
  useEffect(() => { loadTasks() }, [loadTasks])
  const filtered = tasks.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.project || '').toLowerCase().includes(search.toLowerCase()))
  const toggleStatus = async (id: string) => {
    const t = tasks.find(x => x.id === id)
    if (!t) return
    const next = t.status === 'To Do' ? 'In Progress' : t.status === 'In Progress' ? 'Done' : 'To Do'
    await fetch(`/api/morgan/tasks/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status: next}) })
    await loadTasks()
  }
  const deleteTask = async (id: string) => {
    await fetch(`/api/morgan/tasks/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }
  const resetTaskForm = () => { setTaskTitle(''); setTaskProject(''); setTaskDue(''); setTaskPriority('Medium'); setEditingId(null); setShowForm(false) }
  const startEditTask = (t: typeof tasks[0]) => { setTaskTitle(t.title); setTaskProject(t.project || ''); setTaskDue(t.due || ''); setTaskPriority(t.priority); setEditingId(t.id); setShowForm(true) }
  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return
    const body = { title: taskTitle, project: taskProject || 'Unassigned', due: taskDue || 'TBD', priority: taskPriority, status: editingId ? undefined : 'To Do' }
    if (editingId) {
      await fetch(`/api/morgan/tasks/${editingId}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    } else {
      await fetch('/api/morgan/tasks', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ...body, status: 'To Do' }) })
    }
    resetTaskForm()
    await loadTasks()
  }
  const priorityColors: Record<string, string> = {
    Critical: 'bg-red-50 text-red-600 border-red-100',
    High: 'bg-amber-50 text-amber-600 border-amber-100',
    Medium: 'bg-blue-50 text-blue-600 border-blue-100',
    Low: 'bg-slate-50 text-slate-500 border-slate-100',
  }
  return (
    <div className="space-y-6">
      <SectionHeader title="My Tasks" subtitle={`${filtered.length} tasks assigned to you`} action={<ActionBtn onClick={() => { resetTaskForm(); setShowForm(true) }}><Plus className="size-4" /> New Task</ActionBtn>} />

      {/* Create Task Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white border border-slate-100 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-gov-title text-slate-900">{editingId ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={resetTaskForm} className="p-2 hover:bg-slate-50 rounded-lg"><X className="size-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Task Title *</label>
                <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Review tender documents" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Project</label>
                <input type="text" value={taskProject} onChange={e => setTaskProject(e.target.value)} placeholder="Link to a project" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Due Date</label>
                <input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Priority</label>
                <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <ActionBtn variant="secondary" onClick={resetTaskForm}>Cancel</ActionBtn>
              <ActionBtn onClick={handleCreateTask}><CheckCircle2 className="size-4" /> {editingId ? 'Save Changes' : 'Create Task'}</ActionBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && tasks.length === 0 && <p className="text-gov-body text-slate-400 text-center py-8">Loading tasks...</p>}
      <SearchBar placeholder="Search tasks..." value={search} onChange={setSearch} />
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Task</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Project</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Due Date</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Priority</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Status</th>
              <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 text-gov-body text-slate-900 font-medium">{t.title}</td>
                <td className="px-6 py-4 text-gov-body text-slate-500">{t.project}</td>
                <td className="px-6 py-4 text-gov-body text-slate-500">{t.due}</td>
                <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-caption font-bold border ${priorityColors[t.priority] || ''}`}>{t.priority}</span></td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(t.id)} className={`px-2.5 py-1 rounded-lg text-caption font-bold border cursor-pointer transition-colors hover:opacity-80 ${t.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : t.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{t.status}</button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    <button onClick={() => startEditTask(t)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Edit3 className="size-4 text-blue-400" /></button>
                    <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 className="size-4 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Issues ─────────────────────────────────────────────────────────────────
const IssuesView = () => {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [issueTitle, setIssueTitle] = useState('')
  const [issueProject, setIssueProject] = useState('')
  const [issueSeverity, setIssueSeverity] = useState('Medium')
  const [issues, setIssues] = useState<Array<{id:string;title:string;severity:string;project?:string;status:string;raised?:string}>>([])
  const [loadingIssues, setLoadingIssues] = useState(true)
  const loadIssues = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/issues')
      if (res.ok) { const data = await res.json(); setIssues(data.issues || []) }
    } catch { /* no-op */ } finally { setLoadingIssues(false) }
  }, [])
  useEffect(() => { loadIssues() }, [loadIssues])
  const filtered = issues.filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || (i.project || '').toLowerCase().includes(search.toLowerCase()))
  const toggleStatus = async (id: string) => {
    const iss = issues.find(x => x.id === id)
    if (!iss) return
    const next = iss.status === 'Open' ? 'In Progress' : iss.status === 'In Progress' ? 'Resolved' : 'Open'
    await fetch(`/api/morgan/issues/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status: next}) })
    await loadIssues()
  }
  const deleteIssue = async (id: string) => {
    await fetch(`/api/morgan/issues/${id}`, { method: 'DELETE' })
    setIssues(prev => prev.filter(i => i.id !== id))
  }
  const resetIssueForm = () => { setIssueTitle(''); setIssueProject(''); setIssueSeverity('Medium'); setEditingId(null); setShowForm(false) }
  const startEditIssue = (iss: typeof issues[0]) => { setIssueTitle(iss.title); setIssueProject(iss.project || ''); setIssueSeverity(iss.severity); setEditingId(iss.id); setShowForm(true) }
  const handleCreateIssue = async () => {
    if (!issueTitle.trim()) return
    if (editingId) {
      await fetch(`/api/morgan/issues/${editingId}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title: issueTitle, project: issueProject || 'Unassigned', severity: issueSeverity }) })
    } else {
      await fetch('/api/morgan/issues', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title: issueTitle, project: issueProject || 'Unassigned', severity: issueSeverity, status: 'Open', raised: new Date().toISOString().slice(0, 10) }) })
    }
    resetIssueForm()
    await loadIssues()
  }
  return (
    <div className="space-y-6">
      <SectionHeader title="Issues" subtitle={`${filtered.length} open issues`} action={<ActionBtn onClick={() => { resetIssueForm(); setShowForm(true) }}><Plus className="size-4" /> Report Issue</ActionBtn>} />

      {/* Report Issue Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white border border-slate-100 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-gov-title text-slate-900">{editingId ? 'Edit Issue' : 'Report Issue'}</h3>
              <button onClick={resetIssueForm} className="p-2 hover:bg-slate-50 rounded-lg"><X className="size-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Issue Title *</label>
                <input type="text" value={issueTitle} onChange={e => setIssueTitle(e.target.value)} placeholder="e.g. Concrete curing delay" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Project</label>
                <input type="text" value={issueProject} onChange={e => setIssueProject(e.target.value)} placeholder="Link to a project" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Severity</label>
                <select value={issueSeverity} onChange={e => setIssueSeverity(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <ActionBtn variant="secondary" onClick={resetIssueForm}>Cancel</ActionBtn>
              <ActionBtn onClick={handleCreateIssue}><AlertCircle className="size-4" /> {editingId ? 'Save Changes' : 'Report Issue'}</ActionBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loadingIssues && issues.length === 0 && <p className="text-gov-body text-slate-400 text-center py-8">Loading issues...</p>}
      <SearchBar placeholder="Search issues..." value={search} onChange={setSearch} />
      <div className="space-y-4">
        {filtered.map(issue => (
          <div key={issue.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${issue.severity === 'Critical' ? 'bg-red-50 text-red-600' : issue.severity === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                <AlertCircle className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-caption text-slate-400 font-mono">{issue.id}</span>
                  <span className={`px-2 py-0.5 rounded text-caption font-bold ${issue.severity === 'Critical' ? 'bg-red-50 text-red-600' : issue.severity === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{issue.severity}</span>
                </div>
                <h4 className="text-gov-body font-semibold text-slate-900">{issue.title}</h4>
                <p className="text-caption text-slate-400">{issue.project} &bull; Raised {issue.raised}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startEditIssue(issue)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Edit3 className="size-4 text-blue-400" /></button>
              <button onClick={() => toggleStatus(issue.id)} className={`px-3 py-1.5 rounded-lg text-caption font-bold border cursor-pointer hover:opacity-80 transition-colors ${issue.status === 'Open' ? 'bg-red-50 text-red-600 border-red-100' : issue.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{issue.status}</button>
              <button onClick={() => deleteIssue(issue.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 className="size-4 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Time Reports ───────────────────────────────────────────────────────────
const TimeReportsView = () => {
  const [entries, setEntries] = useState<Array<{id:string;date:string;project:string;description:string;hours:number;status:string}>>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [trDate, setTrDate] = useState('')
  const [trProject, setTrProject] = useState('')
  const [trDesc, setTrDesc] = useState('')
  const [trHours, setTrHours] = useState('')

  const loadEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/time-reports')
      if (res.ok) { const data = await res.json(); setEntries(data.entries || []) }
    } catch { /* no-op */ }
  }, [])
  useEffect(() => { loadEntries() }, [loadEntries])

  const resetTrForm = () => { setTrDate(''); setTrProject(''); setTrDesc(''); setTrHours(''); setEditingId(null); setShowForm(false) }
  const startEditEntry = (e: typeof entries[0]) => { setTrDate(e.date); setTrProject(e.project); setTrDesc(e.description); setTrHours(String(e.hours)); setEditingId(e.id); setShowForm(true) }
  const handleCreateEntry = async () => {
    if (!trProject.trim() || !trDesc.trim()) return
    const body = { date: trDate || new Date().toISOString().slice(0, 10), project: trProject, description: trDesc, hours: parseFloat(trHours) || 0 }
    if (editingId) {
      await fetch(`/api/morgan/time-reports/${editingId}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    } else {
      await fetch('/api/morgan/time-reports', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ...body, status: 'Pending' }) })
    }
    resetTrForm()
    await loadEntries()
  }

  const deleteEntry = async (id: string) => {
    await fetch(`/api/morgan/time-reports/${id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const totalHours = entries.reduce((s, e) => s + e.hours, 0)
  const pendingHours = entries.filter(e => e.status === 'Pending').reduce((s, e) => s + e.hours, 0)
  const approvedHours = entries.filter(e => e.status === 'Approved').reduce((s, e) => s + e.hours, 0)

  return (
  <div className="space-y-6">
    <SectionHeader title="Time Reports" subtitle={`${entries.length} time entries`} action={<ActionBtn onClick={() => { resetTrForm(); setShowForm(true) }}><Plus className="size-4" /> Log Time</ActionBtn>} />

    {/* Log Time Form */}
    <AnimatePresence>
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white border border-slate-100 rounded-2xl shadow-lg p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-gov-title text-slate-900">{editingId ? 'Edit Time Entry' : 'Log Time Entry'}</h3>
            <button onClick={resetTrForm} className="p-2 hover:bg-slate-50 rounded-lg"><X className="size-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Date</label>
              <input type="date" value={trDate} onChange={e => setTrDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </div>
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Project *</label>
              <input type="text" value={trProject} onChange={e => setTrProject(e.target.value)} placeholder="e.g. Nexus HQ" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </div>
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Description *</label>
              <input type="text" value={trDesc} onChange={e => setTrDesc(e.target.value)} placeholder="What did you work on?" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </div>
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Hours</label>
              <input type="number" step="0.5" value={trHours} onChange={e => setTrHours(e.target.value)} placeholder="e.g. 4" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <ActionBtn variant="secondary" onClick={resetTrForm}>Cancel</ActionBtn>
            <ActionBtn onClick={handleCreateEntry}><Clock className="size-4" /> {editingId ? 'Save Changes' : 'Log Entry'}</ActionBtn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KpiCard label="Total Hours" value={`${totalHours}h`} icon={Clock} color="blue" />
      <KpiCard label="Approved" value={`${approvedHours}h`} icon={CheckCircle2} color="green" />
      <KpiCard label="Pending" value={`${pendingHours}h`} trend={`${entries.filter(e => e.status === 'Pending').length} entries`} icon={ClipboardCheck} color="amber" />
      <KpiCard label="Entries" value={entries.length} icon={BarChart3} color="purple" />
    </div>
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="text-left px-6 py-3 text-gov-label text-slate-500">Date</th>
            <th className="text-left px-6 py-3 text-gov-label text-slate-500">Project</th>
            <th className="text-left px-6 py-3 text-gov-label text-slate-500">Description</th>
            <th className="text-right px-6 py-3 text-gov-label text-slate-500">Hours</th>
            <th className="text-left px-6 py-3 text-gov-label text-slate-500">Status</th>
            <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {entries.map(entry => (
            <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4 text-gov-body text-slate-500">{entry.date}</td>
              <td className="px-6 py-4 text-gov-body text-slate-900 font-medium">{entry.project}</td>
              <td className="px-6 py-4 text-gov-body text-slate-500">{entry.description}</td>
              <td className="px-6 py-4 text-gov-body text-slate-900 font-semibold text-right">{entry.hours}h</td>
              <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-caption font-bold border ${entry.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{entry.status}</span></td>
              <td className="px-6 py-4">
                <div className="flex gap-1">
                  <button onClick={() => startEditEntry(entry)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Edit3 className="size-4 text-blue-400" /></button>
                  <button onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 className="size-4 text-red-400" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {entries.length === 0 && <p className="text-gov-body text-slate-400 text-center py-8">No time entries yet. Log your first entry.</p>}
    </div>
  </div>
  )
}

// ── Documents ──────────────────────────────────────────────────────────────
const DocumentsView = () => {
  const [showUpload, setShowUpload] = useState(false)
  const [docSearch, setDocSearch] = useState('')
  const [docCategoryFilter, setDocCategoryFilter] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState('')
  const [docName, setDocName] = useState('')
  const [docProject, setDocProject] = useState('')
  const [docCategory, setDocCategory] = useState('General')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [docs, setDocs] = useState<Array<{id:string;name:string;type:string;size?:string;modified?:string;author?:string;project?:string;category:string}>>([])

  const loadDocs = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/documents')
      if (res.ok) { const data = await res.json(); setDocs(data.documents || []) }
    } catch { /* no-op */ }
  }, [])
  useEffect(() => { loadDocs() }, [loadDocs])

  const resetDocForm = () => { setDocName(''); setDocProject(''); setDocCategory('General'); setEditingId(null); setShowUpload(false) }
  const startEditDoc = (doc: typeof docs[0]) => { setDocName(doc.name); setDocProject(doc.project || ''); setDocCategory(doc.category); setEditingId(doc.id); setShowUpload(true) }
  const handleUpload = async () => {
    if (!docName.trim()) return
    if (editingId) {
      await fetch(`/api/morgan/documents/${editingId}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: docName, project: docProject || 'Unassigned', category: docCategory }) })
    } else {
      await fetch('/api/morgan/documents', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: docName, type: 'PDF', size: '0 KB', modified: new Date().toISOString().slice(0, 10), author: 'You', project: docProject || 'Unassigned', category: docCategory }) })
    }
    resetDocForm()
    await loadDocs()
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Documents" subtitle={`${docs.length} documents and files`} action={<ActionBtn onClick={() => { resetDocForm(); setShowUpload(true) }}><Upload className="size-4" /> Upload</ActionBtn>} />

      {/* Upload Form */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white border border-slate-100 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-gov-title text-slate-900">{editingId ? 'Edit Document' : 'Upload Document'}</h3>
              <button onClick={resetDocForm} className="p-2 hover:bg-slate-50 rounded-lg"><X className="size-5 text-slate-400" /></button>
            </div>
            {/* Drop zone */}
            <input type="file" id="doc-file-input" className="hidden" accept=".pdf,.docx,.xlsx,.zip,.png,.jpg,.jpeg" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setDocName(prev => prev || f.name) } }} />
            <div onClick={() => document.getElementById('doc-file-input')?.click()} className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-300 transition-colors cursor-pointer">
              <Upload className="size-10 text-slate-300 mx-auto mb-3" />
              <p className="text-gov-body text-slate-500">Drag and drop files here, or click to browse</p>
              <p className="text-caption text-slate-400 mt-1">PDF, DOCX, XLSX, ZIP, images (max 50MB)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Document Name *</label>
                <input type="text" value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. Site Inspection Report" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Project</label>
                <input type="text" value={docProject} onChange={e => setDocProject(e.target.value)} placeholder="Link to a project" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Category</label>
                <select value={docCategory} onChange={e => setDocCategory(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="General">General</option>
                  <option value="Charter">Charter</option>
                  <option value="Contract">Contract</option>
                  <option value="Tender">Tender</option>
                  <option value="Financial">Financial</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Media">Media</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <ActionBtn variant="secondary" onClick={resetDocForm}>Cancel</ActionBtn>
              <ActionBtn onClick={handleUpload}><Upload className="size-4" /> {editingId ? 'Save Changes' : 'Upload Document'}</ActionBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Total Documents" value={docs.length} icon={FolderOpen} color="blue" />
        <KpiCard label="This Week" value={(() => { const now = new Date(); const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()); return docs.filter(d => d.modified && new Date(d.modified) >= weekStart).length })() } trend="New uploads" icon={Upload} color="green" />
        <KpiCard label="Total Size" value={(() => { const sizes = docs.map(d => { const s = d.size || '0'; const num = parseFloat(s); if (s.includes('MB')) return num * 1024; if (s.includes('GB')) return num * 1024 * 1024; return num }); const totalKB = sizes.reduce((a, b) => a + b, 0); return totalKB >= 1024 ? `${(totalKB / 1024).toFixed(1)} MB` : `${Math.round(totalKB)} KB` })()} icon={FileText} color="amber" />
        <KpiCard label="Shared" value={docs.length} trend="With team" icon={Users} color="purple" />
      </div>

      <div className="flex gap-4 items-center">
        <SearchBar placeholder="Search documents..." value={docSearch} onChange={setDocSearch} />
        <select value={docTypeFilter} onChange={e => setDocTypeFilter(e.target.value)} className="border border-slate-100 rounded-lg px-3 py-2.5 text-gov-body bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-50">
          <option value="">All Types</option>
          {[...new Set(docs.map(d => d.type))].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={docCategoryFilter} onChange={e => setDocCategoryFilter(e.target.value)} className="border border-slate-100 rounded-lg px-3 py-2.5 text-gov-body bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-50">
          <option value="">All Categories</option>
          {[...new Set(docs.map(d => d.category))].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Name</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Type</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Size</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Project</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Modified</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Author</th>
              <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {docs.filter(doc => {
              if (docSearch && !doc.name.toLowerCase().includes(docSearch.toLowerCase()) && !(doc.project||'').toLowerCase().includes(docSearch.toLowerCase()) && !doc.category.toLowerCase().includes(docSearch.toLowerCase())) return false
              if (docCategoryFilter && doc.category !== docCategoryFilter) return false
              if (docTypeFilter && doc.type !== docTypeFilter) return false
              return true
            }).map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                <td className="px-6 py-4 flex items-center gap-3">
                  {doc.type === 'Folder' ? <FolderOpen className="size-4 text-amber-500" /> : <FileText className="size-4 text-blue-500" />}
                  <span className="text-gov-body text-slate-900 font-medium group-hover:text-blue-600 transition-colors">{doc.name}</span>
                </td>
                <td className="px-6 py-4"><span className="text-caption bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{doc.type}</span></td>
                <td className="px-6 py-4 text-gov-body text-slate-500">{doc.size}</td>
                <td className="px-6 py-4 text-gov-body text-slate-500">{doc.project}</td>
                <td className="px-6 py-4 text-gov-body text-slate-500">{doc.modified}</td>
                <td className="px-6 py-4 text-gov-body text-slate-500">{doc.author}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditDoc(doc)} className="p-1.5 hover:bg-blue-50 rounded-lg" title="Edit"><Edit3 className="size-4 text-blue-500" /></button>
                    <button onClick={() => { const blob = new Blob([`Document: ${doc.name}\nProject: ${doc.project}\nCategory: ${doc.category}\nSize: ${doc.size}`], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${doc.name}.txt`; a.click(); URL.revokeObjectURL(url) }} className="p-1.5 hover:bg-blue-50 rounded-lg" title="Download"><Download className="size-4 text-blue-500" /></button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete" onClick={async () => { await fetch(`/api/morgan/documents/${doc.id}`, {method:'DELETE'}); setDocs(prev => prev.filter(d => d.id !== doc.id)) }}><Trash2 className="size-4 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Approve Timesheets ─────────────────────────────────────────────────────
const TimesheetsView = () => {
  const [sheets, setSheets] = useState<Array<{id:string;user:string;period?:string;hours:number;overtime:number;status:string}>>([])
  const loadSheets = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/timesheets')
      if (res.ok) { const data = await res.json(); setSheets(data.timesheets || []) }
    } catch { /* no-op */ }
  }, [])
  useEffect(() => { loadSheets() }, [loadSheets])
  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/morgan/timesheets/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status: newStatus}) })
    await loadSheets()
  }
  return (
    <div className="space-y-6">
      <SectionHeader title="Approve Timesheets" subtitle="Review and approve team timesheets" />
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Team Member</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Period</th>
              <th className="text-right px-6 py-3 text-gov-label text-slate-500">Hours</th>
              <th className="text-right px-6 py-3 text-gov-label text-slate-500">Overtime</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Status</th>
              <th className="px-6 py-3 text-gov-label text-slate-500"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sheets.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-gov-body text-slate-900 font-medium">{s.user}</td>
                <td className="px-6 py-4 text-gov-body text-slate-500">{s.period}</td>
                <td className="px-6 py-4 text-gov-body text-slate-900 font-semibold text-right">{s.hours}h</td>
                <td className="px-6 py-4 text-gov-body text-right"><span className={s.overtime > 0 ? 'text-amber-600 font-semibold' : 'text-slate-400'}>{s.overtime}h</span></td>
                <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-caption font-bold border ${s.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : s.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{s.status}</span></td>
                <td className="px-6 py-4">
                  {s.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(s.id, 'Approved')} className="px-3 py-1.5 rounded-lg text-caption font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">Approve</button>
                      <button onClick={() => updateStatus(s.id, 'Rejected')} className="px-3 py-1.5 rounded-lg text-caption font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Risk Register (VeroPM: /risks CRUD, heatmap, summary) ─────────────────
const RisksView = ({ projects }: { projects: MorganProject[] }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [riskSearch, setRiskSearch] = useState('')
  const [riskTitle, setRiskTitle] = useState('')
  const [riskDesc, setRiskDesc] = useState('')
  const [riskProject, setRiskProject] = useState('')
  const [riskCategory, setRiskCategory] = useState('Technical')
  const [riskProbability, setRiskProbability] = useState('Medium')
  const [riskImpact, setRiskImpact] = useState('Medium')
  const [riskOwner, setRiskOwner] = useState('')
  const [riskMitigation, setRiskMitigation] = useState('')

  const [risks, setRisks] = useState<Array<{id:string;title:string;project?:string;category:string;probability:string;impact:string;status:string;owner?:string;raised?:string;mitigation?:string}>>([])

  const loadRisks = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/risks')
      if (res.ok) { const data = await res.json(); setRisks(data.risks || []) }
    } catch { /* no-op */ }
  }, [])
  useEffect(() => { loadRisks() }, [loadRisks])

  const resetRiskForm = () => { setRiskTitle(''); setRiskDesc(''); setRiskProject(''); setRiskCategory('Technical'); setRiskProbability('Medium'); setRiskImpact('Medium'); setRiskOwner(''); setRiskMitigation(''); setEditingId(null); setShowForm(false) }
  const startEditRisk = (r: typeof risks[0]) => { setRiskTitle(r.title); setRiskProject(r.project || ''); setRiskCategory(r.category); setRiskProbability(r.probability); setRiskImpact(r.impact); setRiskOwner(r.owner || ''); setRiskMitigation(r.mitigation || ''); setEditingId(r.id); setShowForm(true) }
  const handleSaveRisk = async () => {
    if (!riskTitle.trim()) return
    const body = { title: riskTitle, project: riskProject || 'Unassigned', category: riskCategory, probability: riskProbability, impact: riskImpact, status: editingId ? undefined : 'Open', owner: riskOwner || 'Unassigned', raised: editingId ? undefined : new Date().toISOString().slice(0, 10), mitigation: riskMitigation }
    if (editingId) {
      await fetch(`/api/morgan/risks/${editingId}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    } else {
      await fetch('/api/morgan/risks', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ...body, status: 'Open', raised: new Date().toISOString().slice(0, 10) }) })
    }
    resetRiskForm()
    await loadRisks()
  }

  // Heatmap data
  const impactLevels = ['Low', 'Medium', 'High', 'Critical']
  const probLevels = ['Low', 'Medium', 'High']
  const heatmapColor = (p: string, i: string) => {
    const score = (probLevels.indexOf(p) + 1) * (impactLevels.indexOf(i) + 1)
    if (score >= 9) return 'bg-red-500 text-white'
    if (score >= 6) return 'bg-red-300 text-red-900'
    if (score >= 4) return 'bg-amber-300 text-amber-900'
    if (score >= 2) return 'bg-amber-100 text-amber-700'
    return 'bg-emerald-100 text-emerald-700'
  }
  const riskCount = (p: string, i: string) => risks.filter(r => r.probability === p && r.impact === i).length

  const statusColors: Record<string, string> = {
    Open: 'bg-red-50 text-red-600 border-red-100',
    Mitigating: 'bg-blue-50 text-blue-600 border-blue-100',
    Monitoring: 'bg-amber-50 text-amber-600 border-amber-100',
    Closed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Risk Register" subtitle={`${risks.length} risks tracked across projects`} action={<ActionBtn onClick={() => { resetRiskForm(); setShowForm(true) }}><Plus className="size-4" /> Register Risk</ActionBtn>} />

      {/* Create Risk Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white border border-slate-100 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-gov-title text-slate-900">{editingId ? 'Edit Risk' : 'Register New Risk'}</h3>
              <button onClick={resetRiskForm} className="p-2 hover:bg-slate-50 rounded-lg"><X className="size-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Risk Title *</label>
                <input type="text" value={riskTitle} onChange={e => setRiskTitle(e.target.value)} placeholder="e.g. Supply chain disruption" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Project</label>
                <select value={riskProject} onChange={e => setRiskProject(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="">Select project...</option>
                  {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Description</label>
              <textarea value={riskDesc} onChange={e => setRiskDesc(e.target.value)} placeholder="Describe the risk in detail" rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Category</label>
                <select value={riskCategory} onChange={e => setRiskCategory(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="Technical">Technical</option>
                  <option value="Financial">Financial</option>
                  <option value="Supply Chain">Supply Chain</option>
                  <option value="Regulatory">Regulatory</option>
                  <option value="Resource">Resource</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Probability</label>
                <select value={riskProbability} onChange={e => setRiskProbability(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Impact</label>
                <select value={riskImpact} onChange={e => setRiskImpact(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Risk Owner</label>
                <input type="text" value={riskOwner} onChange={e => setRiskOwner(e.target.value)} placeholder="Assigned to" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Mitigation Strategy</label>
              <textarea value={riskMitigation} onChange={e => setRiskMitigation(e.target.value)} placeholder="How will this risk be mitigated?" rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
            </div>
            <div className="flex justify-end gap-3">
              <ActionBtn variant="secondary" onClick={resetRiskForm}>Cancel</ActionBtn>
              <ActionBtn onClick={handleSaveRisk}><Shield className="size-4" /> {editingId ? 'Save Changes' : 'Register Risk'}</ActionBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Risk KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Total Risks" value={risks.length} icon={Shield} color="blue" />
        <KpiCard label="Critical Impact" value={risks.filter(r => r.impact === 'Critical').length} trend="Needs attention" icon={AlertCircle} color="red" />
        <KpiCard label="Being Mitigated" value={risks.filter(r => r.status === 'Mitigating').length} icon={Activity} color="green" />
        <KpiCard label="Open" value={risks.filter(r => r.status === 'Open').length} icon={Eye} color="amber" />
      </div>

      <SearchBar placeholder="Search risks by title, project, category..." value={riskSearch} onChange={setRiskSearch} />

      {/* Risk Heatmap */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-gov-header text-slate-900 mb-4">Risk Heatmap</h3>
        <div className="grid grid-cols-5 gap-1 max-w-lg">
          <div />
          {impactLevels.map(i => <div key={i} className="text-center text-caption text-slate-500 font-semibold py-1">{i}</div>)}
          {probLevels.slice().reverse().map(p => (
            <React.Fragment key={p}>
              <div className="text-caption text-slate-500 font-semibold flex items-center justify-end pr-2">{p}</div>
              {impactLevels.map(i => (
                <div key={`${p}-${i}`} className={`aspect-square rounded-lg flex items-center justify-center text-gov-body font-bold ${heatmapColor(p, i)}`}>
                  {riskCount(p, i) || ''}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-3 text-caption text-slate-400">
          <span>Impact →</span>
          <span className="ml-auto">Probability ↑</span>
        </div>
      </div>

      {/* Risk List */}
      <div className="space-y-3">
        {risks.filter(r => !riskSearch || r.title.toLowerCase().includes(riskSearch.toLowerCase()) || r.project.toLowerCase().includes(riskSearch.toLowerCase()) || r.category.toLowerCase().includes(riskSearch.toLowerCase())).map(risk => (
          <div key={risk.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-2.5 rounded-xl shrink-0 ${risk.impact === 'Critical' ? 'bg-red-50 text-red-600' : risk.impact === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Shield className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-caption text-slate-400 font-mono">{risk.id}</span>
                    <span className={`px-2 py-0.5 rounded text-caption font-bold ${risk.impact === 'Critical' ? 'bg-red-50 text-red-600' : risk.impact === 'High' ? 'bg-amber-50 text-amber-600' : risk.impact === 'Medium' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>{risk.impact}</span>
                    <span className="text-caption bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{risk.category}</span>
                  </div>
                  <h4 className="text-gov-body font-semibold text-slate-900 mb-1">{risk.title}</h4>
                  <p className="text-caption text-slate-400">{risk.project} &bull; Owner: {risk.owner} &bull; Raised {risk.raised}</p>
                  {risk.mitigation && <p className="text-gov-body text-slate-500 mt-2 border-l-2 border-blue-200 pl-3">{risk.mitigation}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startEditRisk(risk)} className="p-1.5 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Edit"><Edit3 className="size-4 text-blue-400" /></button>
                <span className={`px-3 py-1.5 rounded-lg text-caption font-bold border ${statusColors[risk.status] || ''}`}>{risk.status}</span>
                <button className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Delete" onClick={async () => { await fetch(`/api/morgan/risks/${risk.id}`, {method:'DELETE'}); setRisks(prev => prev.filter(r => r.id !== risk.id)) }}><Trash2 className="size-4 text-red-400" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Milestones (VeroPM: /Milestone CRUD, approval, statistics) ─────────────
const MilestonesView = ({ projects }: { projects: MorganProject[] }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [msSearch, setMsSearch] = useState('')
  const [msName, setMsName] = useState('')
  const [msProject, setMsProject] = useState('')
  const [msDueDate, setMsDueDate] = useState('')
  const [msType, setMsType] = useState('Phase Gate')
  const [msOwner, setMsOwner] = useState('')
  const [msDesc, setMsDesc] = useState('')

  const [milestones, setMilestones] = useState<Array<{id:string;name:string;project?:string;dueDate?:string;status:string;type:string;owner?:string;progress:number;approvalStatus:string}>>([])

  const loadMilestones = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/milestones')
      if (res.ok) { const data = await res.json(); setMilestones(data.milestones || []) }
    } catch { /* no-op */ }
  }, [])
  useEffect(() => { loadMilestones() }, [loadMilestones])

  const resetMsForm = () => { setMsName(''); setMsDesc(''); setMsDueDate(''); setMsProject(''); setMsType('Phase Gate'); setMsOwner(''); setEditingId(null); setShowForm(false) }
  const startEditMilestone = (m: typeof milestones[0]) => { setMsName(m.name); setMsProject(m.project || ''); setMsDueDate(m.dueDate || ''); setMsType(m.type); setMsOwner(m.owner || ''); setEditingId(m.id); setShowForm(true) }
  const handleSaveMilestone = async () => {
    if (!msName.trim()) return
    const body = { name: msName, project: msProject || 'Unassigned', dueDate: msDueDate || 'TBD', type: msType, owner: msOwner || 'Unassigned' }
    if (editingId) {
      await fetch(`/api/morgan/milestones/${editingId}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    } else {
      await fetch('/api/morgan/milestones', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ...body, status: 'On Track', progress: 0, approvalStatus: 'Pending' }) })
    }
    resetMsForm()
    await loadMilestones()
  }

  const statusColors: Record<string, string> = {
    'On Track': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'At Risk': 'bg-amber-50 text-amber-600 border-amber-100',
    'Overdue': 'bg-red-50 text-red-600 border-red-100',
    'Completed': 'bg-blue-50 text-blue-600 border-blue-100',
  }

  const approvalColors: Record<string, string> = {
    Approved: 'text-emerald-600',
    Pending: 'text-amber-600',
    Rejected: 'text-red-600',
    'Not Required': 'text-slate-400',
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Milestones" subtitle={`${milestones.length} milestones across ${new Set(milestones.map(m => m.project)).size} projects`} action={<ActionBtn onClick={() => { resetMsForm(); setShowForm(true) }}><Plus className="size-4" /> Create Milestone</ActionBtn>} />

      {/* Create Milestone Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white border border-slate-100 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-gov-title text-slate-900">{editingId ? 'Edit Milestone' : 'Create Milestone'}</h3>
              <button onClick={resetMsForm} className="p-2 hover:bg-slate-50 rounded-lg"><X className="size-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Milestone Name *</label>
                <input type="text" value={msName} onChange={e => setMsName(e.target.value)} placeholder="e.g. Design Review Complete" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Project</label>
                <select value={msProject} onChange={e => setMsProject(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="">Select project...</option>
                  {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Due Date</label>
                <input type="date" value={msDueDate} onChange={e => setMsDueDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Type</label>
                <select value={msType} onChange={e => setMsType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                  <option value="Phase Gate">Phase Gate</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Regulatory">Regulatory</option>
                  <option value="Approval">Approval</option>
                  <option value="Payment">Payment</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-gov-label text-slate-500">Owner</label>
                <input type="text" value={msOwner} onChange={e => setMsOwner(e.target.value)} placeholder="Responsible person" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-gov-label text-slate-500">Description</label>
              <textarea value={msDesc} onChange={e => setMsDesc(e.target.value)} placeholder="Describe the milestone deliverables and acceptance criteria" rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
            </div>
            <div className="flex justify-end gap-3">
              <ActionBtn variant="secondary" onClick={resetMsForm}>Cancel</ActionBtn>
              <ActionBtn onClick={handleSaveMilestone}><Flag className="size-4" /> {editingId ? 'Save Changes' : 'Create Milestone'}</ActionBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Total Milestones" value={milestones.length} icon={Flag} color="blue" />
        <KpiCard label="On Track" value={milestones.filter(m => m.status === 'On Track').length} icon={CheckCircle2} color="green" />
        <KpiCard label="At Risk" value={milestones.filter(m => m.status === 'At Risk').length} icon={AlertCircle} color="amber" />
        <KpiCard label="Overdue" value={milestones.filter(m => m.status === 'Overdue').length} trend="Needs attention" icon={Clock} color="red" />
      </div>

      <SearchBar placeholder="Search milestones by name, project, type..." value={msSearch} onChange={setMsSearch} />

      {/* Pending Approvals */}
      {milestones.some(m => m.approvalStatus === 'Pending') && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <h3 className="text-gov-header text-amber-800 mb-3 flex items-center gap-2"><UserCheck className="size-4" /> Pending Approvals</h3>
          <div className="space-y-2">
            {milestones.filter(m => m.approvalStatus === 'Pending').map(m => (
              <div key={m.id} className="bg-white border border-amber-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-gov-body font-semibold text-slate-900">{m.name}</span>
                  <span className="text-caption text-slate-400 ml-2">{m.project} &bull; Due {m.dueDate}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={async () => { await fetch(`/api/morgan/milestones/${m.id}`, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({approvalStatus:'Approved'})}); await loadMilestones() }} className="px-3 py-1.5 rounded-lg text-caption font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">Approve</button>
                  <button onClick={async () => { await fetch(`/api/morgan/milestones/${m.id}`, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({approvalStatus:'Rejected'})}); await loadMilestones() }} className="px-3 py-1.5 rounded-lg text-caption font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline View */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Milestone</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Project</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Type</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Due Date</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Progress</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Status</th>
              <th className="text-left px-6 py-3 text-gov-label text-slate-500">Approval</th>
              <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {milestones.filter(m => !msSearch || m.name.toLowerCase().includes(msSearch.toLowerCase()) || m.project.toLowerCase().includes(msSearch.toLowerCase()) || m.type.toLowerCase().includes(msSearch.toLowerCase())).map(m => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Flag className="size-4 text-blue-500 shrink-0" />
                    <div>
                      <span className="text-gov-body text-slate-900 font-medium">{m.name}</span>
                      <span className="text-caption text-slate-400 ml-2">{m.owner}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gov-body text-slate-500">{m.project}</td>
                <td className="px-6 py-4"><span className="text-caption bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{m.type}</span></td>
                <td className="px-6 py-4 text-gov-body text-slate-500">{m.dueDate}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                      <div className={`h-full rounded-full ${m.status === 'Overdue' ? 'bg-red-500' : m.status === 'At Risk' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${m.progress}%` }} />
                    </div>
                    <span className="text-caption text-slate-500 font-semibold">{m.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-caption font-bold border ${statusColors[m.status] || ''}`}>{m.status}</span></td>
                <td className="px-6 py-4"><span className={`text-caption font-bold ${approvalColors[m.approvalStatus] || ''}`}>{m.approvalStatus}</span></td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditMilestone(m)} className="p-1.5 hover:bg-blue-50 rounded-lg" title="Edit"><Edit3 className="size-4 text-blue-500" /></button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete" onClick={async () => { await fetch(`/api/morgan/milestones/${m.id}`, {method:'DELETE'}); setMilestones(prev => prev.filter(ms => ms.id !== m.id)) }}><Trash2 className="size-4 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT APPROVAL PIPELINE — Digital Signature Workflow
// Users submit documents → auto-code + urgency → Jonny reviews in full
// ═══════════════════════════════════════════════════════════════════════════
const DEPARTMENTS = ['Executive', 'Finance', 'Operations', 'Engineering', 'Legal', 'Procurement', 'HR', 'IT', 'Marketing', 'Quality'] as const
const DOC_TYPES = [
  { value: 'contract', label: 'Contract' },
  { value: 'archive', label: 'Archive' },
  { value: 'crm_client', label: 'CRM – Client Filing' },
  { value: 'finance', label: 'Finance – Release Payment' },
  { value: 'other', label: 'Other (SuperAdmin sets workflow)' },
] as const

type DocApproval = {
  id:string; docCode:string; requestorName:string; department:string; documentType:string; purpose:string
  dateRequested:string; approvalRequiredBy:string; urgency:'standard'|'moderate'|'critical'
  additionalInfo?:string; fileName?:string; fileUrl?:string
  status:'pending'|'under_review'|'approved'|'rejected'
  reviewNotes?:string; approvedBy?:string; approverName?:string; approverRole?:string; decisionTimestamp?:string; approvedAt?:string; errorFlags?:string; aiSummary?:string
  createdAt?:string; updatedAt?:string
}

function computeUrgency(requiredBy: string): 'standard' | 'moderate' | 'critical' {
  if (!requiredBy) return 'standard'
  const diff = Math.ceil((new Date(requiredBy).getTime() - Date.now()) / 86400000)
  if (diff <= 2) return 'critical'
  if (diff <= 7) return 'moderate'
  return 'standard'
}

const URGENCY_STYLES: Record<string, { bg:string; text:string; dot:string; label:string }> = {
  critical: { bg:'bg-red-50', text:'text-red-700', dot:'bg-red-500', label:'Critical' },
  moderate: { bg:'bg-amber-50', text:'text-amber-700', dot:'bg-amber-500', label:'Moderate' },
  standard: { bg:'bg-emerald-50', text:'text-emerald-700', dot:'bg-emerald-500', label:'Standard' },
}

const DOC_STATUS_BADGES: Record<string, { bg:string; text:string; label:string }> = {
  pending:      { bg:'bg-slate-100', text:'text-slate-600', label:'Pending' },
  under_review: { bg:'bg-blue-50', text:'text-blue-600', label:'Under Review' },
  approved:     { bg:'bg-emerald-50', text:'text-emerald-700', label:'Approved' },
  rejected:     { bg:'bg-red-50', text:'text-red-700', label:'Rejected' },
}

const DocumentApprovalView = () => {
  const { user } = useUser()
  const [docs, setDocs] = useState<DocApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<DocApproval | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [tab, setTab] = useState<'all'|'pending'|'approved'|'rejected'>('all')

  // Form state
  const [daf, setDaf] = useState({ requestorName:'', department:'', documentType:'contract', purpose:'', approvalRequiredBy:'', additionalInfo:'' })
  const [docFile, setDocFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [decisionLoading, setDecisionLoading] = useState<'approved' | 'rejected' | null>(null)
  const [docError, setDocError] = useState<string | null>(null)
  const [docSuccess, setDocSuccess] = useState<string | null>(null)
  const idempotencyKeyRef = useRef<string | null>(null)

  const loadDocs = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/document-approvals')
      if (res.ok) { const d = await res.json(); setDocs(Array.isArray(d) ? d : []) }
    } catch { /* */ }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { loadDocs() }, [loadDocs])

  const resetDocForm = () => { setDaf({ requestorName:'', department:'', documentType:'contract', purpose:'', approvalRequiredBy:'', additionalInfo:'' }); setDocFile(null); setShowUpload(false); idempotencyKeyRef.current = null }

  const clearDocAlerts = () => {
    setDocError(null)
    setDocSuccess(null)
  }

  const getIdempotencyKey = () => {
    if (!idempotencyKeyRef.current) {
      const randomUUID = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      idempotencyKeyRef.current = randomUUID
    }
    return idempotencyKeyRef.current
  }

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearDocAlerts()
    if (!daf.requestorName.trim() || !daf.department || !daf.purpose.trim() || !docFile) {
      setDocError('Please complete all required fields and attach a document.')
      return
    }
    setSubmitting(true)
    try {
      const urgency = computeUrgency(daf.approvalRequiredBy)
      const body: Record<string, unknown> = {
        requestorName: daf.requestorName,
        department: daf.department,
        documentType: daf.documentType,
        purpose: daf.purpose,
        dateRequested: new Date().toISOString().slice(0,10),
        approvalRequiredBy: daf.approvalRequiredBy || new Date(Date.now() + 7*86400000).toISOString().slice(0,10),
        urgency,
        additionalInfo: daf.additionalInfo || undefined,
        status: 'pending',
      }
      const formData = new FormData()
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, String(value))
      })
      formData.append('file', docFile)
      const idempotencyKey = getIdempotencyKey()
      const res = await fetch('/api/morgan/document-approvals', {
        method:'POST',
        headers: { 'X-Idempotency-Key': idempotencyKey },
        body: formData
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || 'Submission failed. Please try again.')
      }
      await loadDocs()
      resetDocForm()
      setDocSuccess('Document submitted successfully.')
      setTimeout(() => setDocSuccess(null), 2500)
    } catch (error: any) {
      setDocError(error?.message || 'Submission failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  const handleDecision = async (id: string, status: 'approved' | 'rejected') => {
    clearDocAlerts()
    setDecisionLoading(status)
    const decisionTimestamp = new Date().toISOString()
    const approverName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.primaryEmailAddress?.emailAddress || 'Unknown'
    const approverRole = (typeof user?.publicMetadata?.role === 'string'
      ? user?.publicMetadata?.role
      : typeof user?.unsafeMetadata?.role === 'string'
        ? user?.unsafeMetadata?.role
        : 'User') as string

    try {
      const res = await fetch(`/api/morgan/document-approvals/${id}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          status,
          reviewNotes: reviewNote || undefined,
          approvedAt: decisionTimestamp,
          decisionTimestamp,
          approvedBy: user?.id || undefined,
          approverName,
          approverRole,
        })
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || 'Decision failed. Please retry.')
      }
      setDocSuccess(`Document ${status === 'approved' ? 'approved' : 'rejected'} successfully.`)
      setTimeout(() => setDocSuccess(null), 2500)
      setSelectedDoc(null)
      setReviewNote('')
      await loadDocs()
    } catch (error: any) {
      setDocError(error?.message || 'Decision failed. Please retry.')
    } finally {
      setDecisionLoading(null)
    }
  }

  const filtered = docs.filter(d => tab === 'all' || d.status === tab)

  // === DETAIL / REVIEW PANEL ===
  if (selectedDoc) {
    const u = URGENCY_STYLES[selectedDoc.urgency] || URGENCY_STYLES.standard
    const s = DOC_STATUS_BADGES[selectedDoc.status] || DOC_STATUS_BADGES.pending
    return (
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <button onClick={() => setSelectedDoc(null)} className="flex items-center gap-2 text-gov-body text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronRight className="size-4 rotate-180" /> Back to Pipeline
        </button>

        {/* Header */}
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-caption font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{selectedDoc.docCode}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-caption font-semibold ${s.bg} ${s.text}`}>{s.label}</span>
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-caption font-semibold ${u.bg} ${u.text}`}>
                  <span className={`size-2 rounded-full ${u.dot}`} />{u.label}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{selectedDoc.purpose}</h1>
              <p className="text-gov-body text-slate-500 mt-1">Submitted by <span className="font-semibold text-slate-700">{selectedDoc.requestorName}</span> — {selectedDoc.department}</p>
              {(selectedDoc.status === 'pending' || selectedDoc.status === 'under_review') && (
                <p className="text-caption text-blue-600 font-semibold mt-1 flex items-center gap-1.5"><Shield className="size-3.5" /> Routed to CEO — Jonny for approval</p>
              )}
            </div>
            {selectedDoc.fileName && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-gov-body font-semibold">
                <FileText className="size-4" />
                {selectedDoc.fileUrl ? (
                  <a href={selectedDoc.fileUrl} target="_blank" rel="noreferrer" className="hover:underline">
                    {selectedDoc.fileName}
                  </a>
                ) : (
                  <span>{selectedDoc.fileName}</span>
                )}
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-gov-label text-slate-400 mb-1">Document Type</p>
              <p className="text-gov-body font-semibold text-slate-900 capitalize">{(DOC_TYPES.find(t => t.value === selectedDoc.documentType)?.label) || selectedDoc.documentType}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-gov-label text-slate-400 mb-1">Date Requested</p>
              <p className="text-gov-body font-semibold text-slate-900">{selectedDoc.dateRequested}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-gov-label text-slate-400 mb-1">Required By</p>
              <p className="text-gov-body font-semibold text-slate-900">{selectedDoc.approvalRequiredBy}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-gov-label text-slate-400 mb-1">Urgency</p>
              <p className={`text-gov-body font-semibold ${u.text}`}>{u.label}</p>
            </div>
          </div>

          {selectedDoc.additionalInfo && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-gov-label text-slate-400 mb-1">Additional Information</p>
              <p className="text-gov-body text-slate-700">{selectedDoc.additionalInfo}</p>
            </div>
          )}

          {/* AI Summary card */}
          {selectedDoc.aiSummary && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-gov-label text-blue-600 font-semibold mb-1 flex items-center gap-2"><Eye className="size-4" /> AI Document Brief</p>
              <p className="text-gov-body text-blue-900">{selectedDoc.aiSummary}</p>
            </div>
          )}

          {/* Error flags */}
          {selectedDoc.errorFlags && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-gov-label text-red-600 font-semibold mb-1 flex items-center gap-2"><AlertCircle className="size-4" /> Issues Detected</p>
              <p className="text-gov-body text-red-800">{selectedDoc.errorFlags}</p>
            </div>
          )}
        </div>

        {/* Approve / Reject Panel (only when pending or under_review) */}
        {(selectedDoc.status === 'pending' || selectedDoc.status === 'under_review') && (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-gov-title text-slate-900 font-bold">CEO Review Decision</h3>
              <span className="text-caption bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full flex items-center gap-1.5"><Shield className="size-3" /> Signing as Jonny — CEO</span>
            </div>
            <textarea
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
              placeholder="Add review notes, comments, or reason for rejection…"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => void handleDecision(selectedDoc.id, 'rejected')}
                disabled={decisionLoading !== null}
                className="px-6 py-2.5 rounded-xl bg-red-50 text-red-700 text-gov-body font-semibold hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {decisionLoading === 'rejected' ? <RefreshCw className="size-4 animate-spin" /> : <X className="size-4" />}
                {decisionLoading === 'rejected' ? 'Rejecting…' : 'Reject'}
              </button>
              <button
                onClick={() => void handleDecision(selectedDoc.id, 'approved')}
                disabled={decisionLoading !== null}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-gov-body font-semibold hover:bg-emerald-500 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {decisionLoading === 'approved' ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                {decisionLoading === 'approved' ? 'Approving…' : 'Approve &amp; Sign'}
              </button>
            </div>
          </div>
        )}

        {/* Show decision if already made */}
        {(selectedDoc.status === 'approved' || selectedDoc.status === 'rejected') && (
          <div className={`rounded-2xl p-6 border ${selectedDoc.status === 'approved' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-gov-body font-semibold ${selectedDoc.status === 'approved' ? 'text-emerald-700' : 'text-red-700'}`}>
              {selectedDoc.status === 'approved' ? '✓ Approved' : '✕ Rejected'} by {selectedDoc.approverName || 'Unknown'} ({selectedDoc.approverRole || 'User'})
              {(selectedDoc.decisionTimestamp || selectedDoc.approvedAt) ? ` on ${new Date(selectedDoc.decisionTimestamp || selectedDoc.approvedAt || '').toLocaleDateString()}` : ''}
            </p>
            {selectedDoc.reviewNotes && <p className="text-gov-body text-slate-600 mt-2">{selectedDoc.reviewNotes}</p>}
          </div>
        )}
      </div>
    )
  }

  // === MAIN LIST + UPLOAD FORM ===
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Approval Pipeline</h1>
          <p className="text-gov-body text-slate-500 mt-1">Upload documents for CEO digital signature &amp; approval workflow</p>
        </div>
        <button onClick={() => { resetDocForm(); clearDocAlerts(); setShowUpload(true) }} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
          <Upload className="size-4" /> Submit Document
        </button>
      </div>

      {(docError || docSuccess) && (
        <div className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 ${docError ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`size-4 mt-0.5 ${docError ? 'text-red-500' : 'text-emerald-600'}`} />
            <div>
              <p className={`text-gov-body font-semibold ${docError ? 'text-red-700' : 'text-emerald-700'}`}>
                {docError ? 'Action failed' : 'Action completed'}
              </p>
              <p className={`text-caption ${docError ? 'text-red-600' : 'text-emerald-600'}`}>
                {docError || docSuccess}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {docError && (
              <button onClick={() => setDocError(null)} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-caption font-semibold hover:bg-red-100">
                Dismiss
              </button>
            )}
            {docSuccess && (
              <button onClick={() => setDocSuccess(null)} className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 text-caption font-semibold hover:bg-emerald-100">
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Upload / Request Form ─────────────────────────────────── */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }} className="bg-white border border-slate-100 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-gov-title text-slate-900 font-bold">Request Approval</h2>
              <button onClick={resetDocForm} className="p-2 hover:bg-slate-50 rounded-lg"><X className="size-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleDocSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Requestor */}
                <div className="space-y-1.5">
                  <label className="text-gov-label text-slate-500">Requestor Name *</label>
                  <input required type="text" value={daf.requestorName} onChange={e => setDaf(prev => ({...prev, requestorName:e.target.value}))} placeholder="Full name" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-gov-label text-slate-500">Department *</label>
                  <select required value={daf.department} onChange={e => setDaf(prev => ({...prev, department:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                    <option value="" disabled>Select department…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {/* Doc Type */}
                <div className="space-y-1.5">
                  <label className="text-gov-label text-slate-500">Document Type *</label>
                  <select required value={daf.documentType} onChange={e => setDaf(prev => ({...prev, documentType:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                    {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                {/* Approval Required By */}
                <div className="space-y-1.5">
                  <label className="text-gov-label text-slate-500">Approval Required By *</label>
                  <input required type="date" value={daf.approvalRequiredBy} onChange={e => setDaf(prev => ({...prev, approvalRequiredBy:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                  {daf.approvalRequiredBy && (
                    <span className={`text-caption font-semibold ${URGENCY_STYLES[computeUrgency(daf.approvalRequiredBy)].text}`}>
                      Urgency: {URGENCY_STYLES[computeUrgency(daf.approvalRequiredBy)].label}
                    </span>
                  )}
                </div>
              </div>
              {/* Purpose */}
              <div className="space-y-1.5">
                <label className="text-gov-label text-slate-500">Purpose of Approval Request *</label>
                <textarea required value={daf.purpose} onChange={e => setDaf(prev => ({...prev, purpose:e.target.value}))} placeholder="Briefly describe why this document needs approval…" rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              {/* Date Requested (auto) + Additional Info */}
              <div className="flex gap-5">
                <div className="space-y-1.5 flex-1">
                  <label className="text-gov-label text-slate-500">Date Requested</label>
                  <input disabled value={new Date().toISOString().slice(0,10)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body bg-slate-50 text-slate-400" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-gov-label text-slate-500">Additional Info <span className="text-slate-400">(optional)</span></label>
                  <input type="text" value={daf.additionalInfo} onChange={e => setDaf(prev => ({...prev, additionalInfo:e.target.value}))} placeholder="Reference numbers, notes…" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
              </div>
              {/* File Upload */}
              <div className="space-y-1.5">
                <label className="text-gov-label text-slate-500">Upload Document *</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer" onClick={() => document.getElementById('doc-approval-upload')?.click()}>
                  <input id="doc-approval-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={e => { const picked = e.target.files?.[0]; if (picked) setDocFile(picked) }} />
                  {docFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="size-8 text-blue-500" />
                      <div className="text-left">
                        <p className="text-gov-body font-semibold text-slate-900">{docFile.name}</p>
                        <p className="text-caption text-slate-400">{(docFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button type="button" onClick={ev => { ev.stopPropagation(); setDocFile(null) }} className="p-1 hover:bg-red-50 rounded-lg"><X className="size-4 text-red-400" /></button>
                    </div>
                  ) : (
                    <>
                      <Upload className="size-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-gov-body text-slate-500">Click to upload or drag &amp; drop</p>
                      <p className="text-caption text-slate-400 mt-1">PDF, Word, Excel, or images (max 25 MB)</p>
                    </>
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetDocForm} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-500 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting || !daf.requestorName.trim() || !daf.department || !daf.purpose.trim() || !docFile} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {submitting ? <><RefreshCw className="size-4 animate-spin" /> Submitting…</> : <><Upload className="size-4" /> Submit for Approval</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-2">
        {(['all','pending','approved','rejected'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-gov-body font-semibold transition-colors capitalize ${tab === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{t === 'all' ? `All (${docs.length})` : `${DOC_STATUS_BADGES[t].label} (${docs.filter(d => d.status === t).length})`}</button>
        ))}
      </div>

      {/* ── Document Cards ─────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gov-body text-slate-400">Loading approvals…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl">
          <ClipboardCheck className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-gov-header text-slate-700">No documents{tab !== 'all' ? ` with status "${DOC_STATUS_BADGES[tab]?.label}"` : ''}</h3>
          <p className="text-gov-body text-slate-400 mt-1">Submit a document to begin the approval workflow.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => {
            const u = URGENCY_STYLES[doc.urgency] || URGENCY_STYLES.standard
            const s = DOC_STATUS_BADGES[doc.status] || DOC_STATUS_BADGES.pending
            return (
              <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group flex items-center gap-5">
                {/* Urgency bar */}
                <div className={`w-1.5 self-stretch rounded-full ${u.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-caption font-mono font-bold text-slate-400">{doc.docCode}</span>
                    <span className={`px-2 py-0.5 rounded-full text-caption font-semibold ${s.bg} ${s.text}`}>{s.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-caption font-semibold ${u.bg} ${u.text}`}>{u.label}</span>
                  </div>
                  <h4 className="text-gov-body font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{doc.purpose}</h4>
                  <p className="text-caption text-slate-400 mt-0.5">{doc.requestorName} — {doc.department} · {(DOC_TYPES.find(t => t.value === doc.documentType)?.label) || doc.documentType}</p>
                  {(doc.status === 'pending' || doc.status === 'under_review') && <p className="text-caption text-blue-500 mt-0.5">Awaiting CEO — Jonny</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-caption text-slate-400">Requested {doc.dateRequested}</p>
                  <p className="text-caption text-slate-500 font-semibold">Due {doc.approvalRequiredBy}</p>
                </div>
                <ChevronRight className="size-5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// RESOURCE REQUESTS VIEW (VeroPM: /resources/requests)
// ═══════════════════════════════════════════════════════════════════════════
const ResourceRequestsView = () => {
  type RR = {id:string;title:string;resourceType:string;quantity:number;skills?:string;startDate?:string;endDate?:string;status:string;priority:string;requestedBy?:string}
  const [requests, setRequests] = useState<RR[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all'|'pending'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState<RR | null>(null)
  const [form, setForm] = useState({title:'',resourceType:'Human',quantity:1,skills:'',startDate:'',endDate:'',status:'Pending',priority:'Medium',requestedBy:''})

  useEffect(() => {
    setLoading(true)
    fetch('/api/morgan/resource-requests').then(r => r.json()).then(d => { setRequests(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    const res = await fetch('/api/morgan/resource-requests', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setRequests(p => [d,...p]); setShowCreate(false); setForm({title:'',resourceType:'Human',quantity:1,skills:'',startDate:'',endDate:'',status:'Pending',priority:'Medium',requestedBy:''}) }
  }
  const handleUpdate = async () => {
    if (!editItem) return
    const res = await fetch(`/api/morgan/resource-requests/${editItem.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setRequests(p => p.map(r => r.id === d.id ? d : r)); setEditItem(null) }
  }
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource request?')) return
    const res = await fetch(`/api/morgan/resource-requests/${id}`, { method:'DELETE' })
    if (res.ok) setRequests(p => p.filter(r => r.id !== id))
  }
  const openEdit = (r: RR) => { setEditItem(r); setForm({title:r.title,resourceType:r.resourceType,quantity:r.quantity,skills:r.skills||'',startDate:r.startDate||'',endDate:r.endDate||'',status:r.status,priority:r.priority,requestedBy:r.requestedBy||''}); setShowCreate(false) }

  const RRForm = () => (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
      <h3 className="text-gov-header text-slate-700">{editItem ? 'Edit Request' : 'Request Resource'}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="text-caption text-slate-500 block mb-1">Title *</label><input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="Resource name or role" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Type</label><select value={form.resourceType} onChange={e => setForm(p=>({...p,resourceType:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>Human</option><option>Equipment</option><option>Material</option><option>Budget</option></select></div>
        <div><label className="text-caption text-slate-500 block mb-1">Quantity</label><input type="number" min={1} value={form.quantity} onChange={e => setForm(p=>({...p,quantity:Number(e.target.value)}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Skills</label><input value={form.skills} onChange={e => setForm(p=>({...p,skills:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="Required skills" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Priority</label><select value={form.priority} onChange={e => setForm(p=>({...p,priority:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
        <div><label className="text-caption text-slate-500 block mb-1">Status</label><select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>Pending</option><option>Approved</option><option>Rejected</option><option>Fulfilled</option></select></div>
        <div><label className="text-caption text-slate-500 block mb-1">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm(p=>({...p,startDate:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">End Date</label><input type="date" value={form.endDate} onChange={e => setForm(p=>({...p,endDate:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Requested By</label><input value={form.requestedBy} onChange={e => setForm(p=>({...p,requestedBy:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="Name" /></div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => { setShowCreate(false); setEditItem(null) }} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600">Cancel</button>
        <button onClick={editItem ? handleUpdate : handleCreate} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold">{editItem ? 'Save Changes' : 'Submit Request'}</button>
      </div>
    </div>
  )

  const displayed = tab === 'pending' ? requests.filter(r => r.status === 'Pending') : requests
  const cols = ['Title','Type','Qty','Skills','Period','Priority','Status','Requested By','']
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Resource Requests</h1><p className="text-gov-body text-slate-500 mt-1">Manage and track resource allocation requests across your workspace</p></div>
        <button onClick={() => { setShowCreate(true); setEditItem(null); setForm({title:'',resourceType:'Human',quantity:1,skills:'',startDate:'',endDate:'',status:'Pending',priority:'Medium',requestedBy:''}) }} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800 flex items-center gap-2"><Plus className="size-4" /> Request Resource</button>
      </div>
      <div className="flex gap-2">
        {(['all','pending'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-gov-body font-semibold transition-colors ${tab === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {t === 'all' ? 'All Requests' : 'Pending Approvals'}
          </button>
        ))}
      </div>
      {(showCreate || editItem) && <RRForm />}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-gov-body text-slate-500">Resource Requests &bull; {displayed.length}</span>
          <button className="text-gov-body text-slate-500 flex items-center gap-1"><Filter className="size-4" /> Filters</button>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>{cols.map(c => <th key={c} className="text-left px-4 py-3 text-caption text-slate-500 font-semibold uppercase tracking-wider">{c}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={cols.length} className="text-center py-16 text-gov-body text-slate-400">Loading…</td></tr>}
            {!loading && displayed.length === 0 && (
              <tr><td colSpan={cols.length} className="text-center py-16 text-gov-body text-slate-400">No resource requests found. Click &quot;Request Resource&quot; to create one.</td></tr>
            )}
            {displayed.map(r => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 text-gov-body font-semibold text-slate-900">{r.title}</td>
                <td className="px-4 py-3 text-gov-body text-slate-700">{r.resourceType}</td>
                <td className="px-4 py-3 text-gov-body text-slate-700">{r.quantity}</td>
                <td className="px-4 py-3 text-caption text-slate-500">{r.skills || '—'}</td>
                <td className="px-4 py-3 text-caption text-slate-500">{r.startDate ? `${r.startDate.slice(0,10)} – ${r.endDate?.slice(0,10)||'?'}` : '—'}</td>
                <td className="px-4 py-3 text-caption text-slate-500">{r.priority}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-caption font-bold ${r.status === 'Pending' ? 'bg-amber-50 text-amber-600' : r.status === 'Approved' || r.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{r.status}</span></td>
                <td className="px-4 py-3 text-gov-body text-slate-700">{r.requestedBy || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(r)} className="p-1 rounded hover:bg-slate-100"><Edit3 className="size-4 text-slate-400" /></button>
                    <button onClick={() => handleDelete(r.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="size-4 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CAPACITY PLANNING VIEW (VeroPM: /resources/capacity)
// ═══════════════════════════════════════════════════════════════════════════
const CapacityPlanningView = () => {
  type RR = {id:string;title:string;resourceType:string;quantity:number;status:string;priority:string;requestedBy?:string;startDate?:string;endDate?:string}
  const [requests, setRequests] = useState<RR[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview'|'utilization'|'demand'|'alerts'>('overview')

  useEffect(() => {
    setLoading(true)
    fetch('/api/morgan/resource-requests').then(r => r.json()).then(d => { setRequests(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const total = requests.length
  const pending = requests.filter(r => r.status === 'Pending').length
  const approved = requests.filter(r => r.status === 'Approved' || r.status === 'Fulfilled').length
  const humanReqs = requests.filter(r => r.resourceType === 'Human').length
  const totalQty = requests.reduce((s,r) => s + (r.quantity||0), 0)

  const stats = [
    { label: 'Total Requests', value: String(total), sub: 'All resource requests' },
    { label: 'Pending', value: String(pending), sub: 'Awaiting approval' },
    { label: 'Approved', value: String(approved), sub: 'Fulfilled or approved' },
    { label: 'Total Units', value: String(totalQty), sub: 'Across all request types' },
  ]
  const forecast = [
    { label: 'Human Resources', value: String(humanReqs), sub: 'Human resource requests' },
    { label: 'Equipment', value: String(requests.filter(r=>r.resourceType==='Equipment').length), sub: 'Equipment requests' },
    { label: 'High Priority', value: String(requests.filter(r=>r.priority==='High'||r.priority==='Critical').length), sub: 'High/Critical priority' },
    { label: 'Risk Level', value: pending > 5 ? 'High' : pending > 2 ? 'Medium' : 'Low', sub: 'Based on pending requests' },
  ]

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-slate-900">Capacity Planning Dashboard</h2><p className="text-gov-body text-slate-500 mt-1">Enterprise resource capacity planning and demand analysis</p></div>
        <button onClick={() => fetch('/api/morgan/resource-requests').then(r=>r.json()).then(d=>setRequests(Array.isArray(d)?d:[]))} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600 flex items-center gap-2"><RefreshCw className="size-4" /> Refresh</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-caption text-slate-400">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '…' : s.value}</p>
            <p className="text-caption text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <h3 className="text-gov-header text-slate-700 mb-4">Capacity Forecast</h3>
        <div className="grid grid-cols-4 gap-4">
          {forecast.map(f => (
            <div key={f.label} className="bg-slate-50 rounded-xl p-4">
              <p className="text-caption text-slate-400">{f.label}</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{loading ? '…' : f.value}</p>
              <p className="text-caption text-slate-400">{f.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        {(['overview','utilization','demand','alerts'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-gov-body font-semibold capitalize transition-colors ${tab === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t === 'utilization' ? 'By Type' : t === 'demand' ? 'Demand List' : t}</button>
        ))}
      </div>
      {tab === 'overview' && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100"><h3 className="text-gov-header text-slate-700">Resource Request Overview</h3><p className="text-caption text-slate-400">All pending and active resource requests</p></div>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{['Title','Type','Qty','Priority','Status','Requested By'].map(h => <th key={h} className="text-left px-4 py-3 text-caption text-slate-500 font-semibold uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="text-center py-10 text-gov-body text-slate-400">Loading…</td></tr>}
              {!loading && requests.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gov-body text-slate-400">No resource requests yet. Go to Resource Requests to create one.</td></tr>}
              {requests.slice(0,10).map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 text-gov-body font-semibold text-slate-900">{r.title}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700">{r.resourceType}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700">{r.quantity}</td>
                  <td className="px-4 py-3 text-caption text-slate-500">{r.priority}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-caption font-bold ${r.status === 'Pending' ? 'bg-amber-50 text-amber-600' : r.status === 'Approved' || r.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-gov-body text-slate-400">{r.requestedBy || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab !== 'overview' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
          <Activity className="size-12 text-slate-300 mx-auto mb-4" />
          <p className="text-gov-body text-slate-500">Advanced {tab} analytics coming soon.</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKLOAD BALANCING VIEW (VeroPM: /resources/balancing — 6-step wizard)
// ═══════════════════════════════════════════════════════════════════════════
const WorkloadBalancingView = () => {
  const [step, setStep] = useState(1)
  const [scope, setScope] = useState<'workspace'|'portfolio'|'projects'>('workspace')
  const steps = [
    { n: 1, label: 'Scope', desc: 'Select balancing scope' },
    { n: 2, label: 'Strategy', desc: 'Choose balancing strategy' },
    { n: 3, label: 'Options', desc: 'Configure balancing options' },
    { n: 4, label: 'Constraints', desc: 'Set constraints and limits' },
    { n: 5, label: 'Preview', desc: 'Review balancing impact' },
    { n: 6, label: 'Apply', desc: 'Apply balancing changes' },
  ]

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Workload Balancing Wizard</h2>
        {/* Step indicator */}
        <div className="flex gap-4 mb-8">
          {steps.map(s => (
            <div key={s.n} className={`flex-1 text-center ${step >= s.n ? 'text-slate-900' : 'text-slate-400'}`}>
              <div className={`size-8 rounded-full mx-auto flex items-center justify-center text-caption font-bold border-2 ${step >= s.n ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-400'}`}>{s.n}</div>
              <div className="text-caption font-semibold mt-1">{s.label}</div>
              <div className="text-[10px] text-slate-400">{s.desc}</div>
            </div>
          ))}
        </div>
        {/* Step 1: Scope */}
        {step === 1 && (
          <div>
            <h3 className="text-gov-header text-slate-700 mb-2">Select Balancing Scope</h3>
            <p className="text-gov-body text-slate-500 mb-4">Choose the scope of projects and resources to balance</p>
            <p className="text-caption text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">Important: Workload balancing will only consider users who are already project members.</p>
            <div className="space-y-3">
              {([['workspace','Entire Workspace','Balance across all projects and users',true],['portfolio','Portfolio','Balance within a specific portfolio',false],['projects','Selected Projects','Balance across specific projects',false]] as const).map(([val, label, desc, rec]) => (
                <button key={val} onClick={() => setScope(val)} className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${scope === val ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <div className="flex items-center justify-between"><span className="text-gov-body font-semibold text-slate-900">{label}</span>{rec && <span className="text-caption bg-slate-900 text-white px-2 py-0.5 rounded-full">Recommended</span>}</div>
                  <p className="text-caption text-slate-400 mt-1">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        {step > 1 && step < 6 && (
          <div className="text-center py-12">
            <Activity className="size-12 text-slate-300 mx-auto mb-4" />
            <p className="text-gov-body text-slate-500">Step {step}: {steps[step-1].desc}</p>
          </div>
        )}
        {step === 6 && (
          <div className="text-center py-12">
            <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-4" />
            <p className="text-gov-body text-slate-700 font-semibold">Ready to apply workload balancing</p>
          </div>
        )}
        <div className="flex justify-between mt-8">
          <button disabled={step <= 1} onClick={() => setStep(s => s - 1)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600 disabled:opacity-30">Previous</button>
          <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600">Reset</button>
          <button disabled={step >= 6} onClick={() => setStep(s => s + 1)} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold disabled:opacity-30">Next</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// BUDGETS VIEW (VeroPM: /financial/budgets)
// ═══════════════════════════════════════════════════════════════════════════
const BudgetsView = () => {
  type Budget = {id:string;name:string;totalAmount:number;allocated:number;spent:number;category:string;status:string}
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState<Budget | null>(null)
  const [form, setForm] = useState({name:'',totalAmount:0,allocated:0,spent:0,category:'General',status:'Active'})

  useEffect(() => {
    setLoading(true)
    fetch('/api/morgan/budgets').then(r => r.json()).then(d => { setBudgets(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const totalBudget = budgets.reduce((s,b) => s + (b.totalAmount||0), 0)
  const totalAllocated = budgets.reduce((s,b) => s + (b.allocated||0), 0)
  const totalSpent = budgets.reduce((s,b) => s + (b.spent||0), 0)

  const handleCreate = async () => {
    const res = await fetch('/api/morgan/budgets', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setBudgets(p => [d,...p]); setShowCreate(false); setForm({name:'',totalAmount:0,allocated:0,spent:0,category:'General',status:'Active'}) }
  }
  const handleUpdate = async () => {
    if (!editItem) return
    const res = await fetch(`/api/morgan/budgets/${editItem.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setBudgets(p => p.map(b => b.id === d.id ? d : b)); setEditItem(null) }
  }
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return
    const res = await fetch(`/api/morgan/budgets/${id}`, { method:'DELETE' })
    if (res.ok) setBudgets(p => p.filter(b => b.id !== id))
  }
  const openEdit = (b: Budget) => { setEditItem(b); setForm({name:b.name,totalAmount:b.totalAmount,allocated:b.allocated,spent:b.spent,category:b.category,status:b.status}); setShowCreate(false) }

  const BudgetForm = () => (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
      <h3 className="text-gov-header text-slate-700">{editItem ? 'Edit Budget' : 'Create Budget'}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="text-caption text-slate-500 block mb-1">Name *</label><input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="Budget name" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Category</label><input value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="General" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Status</label><select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>Active</option><option>Closed</option><option>On Hold</option></select></div>
        <div><label className="text-caption text-slate-500 block mb-1">Total Amount</label><input type="number" value={form.totalAmount} onChange={e => setForm(p=>({...p,totalAmount:Number(e.target.value)}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Allocated</label><input type="number" value={form.allocated} onChange={e => setForm(p=>({...p,allocated:Number(e.target.value)}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Spent</label><input type="number" value={form.spent} onChange={e => setForm(p=>({...p,spent:Number(e.target.value)}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" /></div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => { setShowCreate(false); setEditItem(null) }} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600">Cancel</button>
        <button onClick={editItem ? handleUpdate : handleCreate} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold">{editItem ? 'Save Changes' : 'Create Budget'}</button>
      </div>
    </div>
  )

  const fmt = (n: number) => `$${n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Budgets</h1><p className="text-gov-body text-slate-500 mt-1">Manage project budgets and allocations</p></div>
        <button onClick={() => { setShowCreate(true); setEditItem(null); setForm({name:'',totalAmount:0,allocated:0,spent:0,category:'General',status:'Active'}) }} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800 flex items-center gap-2"><Plus className="size-4" /> Create Budget</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Budget',v:fmt(totalBudget)},{l:'Allocated',v:fmt(totalAllocated)},{l:'Spent',v:fmt(totalSpent)},{l:'Remaining',v:fmt(totalBudget-totalSpent)}].map(s => (
          <div key={s.l} className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-caption text-slate-400">{s.l}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.v}</p>
          </div>
        ))}
      </div>
      {(showCreate || editItem) && <BudgetForm />}
      {loading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-gov-body text-slate-400">Loading…</div>
      ) : budgets.length === 0 && !showCreate ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
          <DollarSign className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-gov-header text-slate-700">No budgets configured</h3>
          <p className="text-gov-body text-slate-400 mt-2">Create budgets for your projects to track financial performance.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{['Name','Category','Total','Allocated','Spent','Remaining','Status',''].map(h => <th key={h} className="text-left px-4 py-3 text-caption text-slate-500 font-semibold uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {budgets.map(b => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 text-gov-body font-semibold text-slate-900">{b.name}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700">{b.category}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700">{fmt(b.totalAmount)}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700">{fmt(b.allocated)}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700">{fmt(b.spent)}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700">{fmt(b.totalAmount - b.spent)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-caption font-bold ${b.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : b.status === 'Closed' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'}`}>{b.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(b)} className="p-1 rounded hover:bg-slate-100"><Edit3 className="size-4 text-slate-400" /></button>
                      <button onClick={() => handleDelete(b.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="size-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPENSES VIEW (VeroPM: /financial/expenses)
// ═══════════════════════════════════════════════════════════════════════════
const ExpensesView = () => {
  type Expense = {id:string;title:string;amount:number;category:string;status:string;submittedBy?:string;date?:string;notes?:string}
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState<Expense | null>(null)
  const [form, setForm] = useState({title:'',amount:0,category:'General',status:'Pending',submittedBy:'',notes:''})
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    setLoading(true)
    fetch('/api/morgan/expenses').then(r => r.json()).then(d => { setExpenses(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = expenses.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || e.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleCreate = async () => {
    const res = await fetch('/api/morgan/expenses', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setExpenses(p => [d,...p]); setShowCreate(false); setForm({title:'',amount:0,category:'General',status:'Pending',submittedBy:'',notes:''}) }
  }
  const handleUpdate = async () => {
    if (!editItem) return
    const res = await fetch(`/api/morgan/expenses/${editItem.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setExpenses(p => p.map(e => e.id === d.id ? d : e)); setEditItem(null) }
  }
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    const res = await fetch(`/api/morgan/expenses/${id}`, { method:'DELETE' })
    if (res.ok) setExpenses(p => p.filter(e => e.id !== id))
  }
  const openEdit = (e: Expense) => { setEditItem(e); setForm({title:e.title,amount:e.amount,category:e.category,status:e.status,submittedBy:e.submittedBy||'',notes:e.notes||''}); setShowCreate(false) }

  const ExpenseForm = () => (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
      <h3 className="text-gov-header text-slate-700">{editItem ? 'Edit Expense' : 'Add Expense'}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="text-caption text-slate-500 block mb-1">Title *</label><input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="Expense title" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Amount</label><input type="number" value={form.amount} onChange={e => setForm(p=>({...p,amount:Number(e.target.value)}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Category</label><input value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="General" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Status</label><select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>Pending</option><option>Approved</option><option>Rejected</option></select></div>
        <div><label className="text-caption text-slate-500 block mb-1">Submitted By</label><input value={form.submittedBy} onChange={e => setForm(p=>({...p,submittedBy:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="Name" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Notes</label><input value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="Optional notes" /></div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => { setShowCreate(false); setEditItem(null) }} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600">Cancel</button>
        <button onClick={editItem ? handleUpdate : handleCreate} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold">{editItem ? 'Save Changes' : 'Add Expense'}</button>
      </div>
    </div>
  )

  const cols = ['Title','Category','Amount','Status','Submitted By','Notes','']
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Expense Management</h1><p className="text-gov-body text-slate-500 mt-1">Manage and track project expenses, approvals, and financial workflows</p></div>
        <div className="flex gap-2">
          <button onClick={() => fetch('/api/morgan/expenses').then(r=>r.json()).then(d=>setExpenses(Array.isArray(d)?d:[]))} className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600 flex items-center gap-1"><RefreshCw className="size-4" /> Refresh</button>
          <button onClick={() => { setShowCreate(true); setEditItem(null); setForm({title:'',amount:0,category:'General',status:'Pending',submittedBy:'',notes:''}) }} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800 flex items-center gap-2"><Plus className="size-4" /> Add Expense</button>
        </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <h3 className="text-gov-header text-slate-700">Filters</h3>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="text-caption text-slate-500 block mb-1">Search</label><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" /></div>
          <div><label className="text-caption text-slate-500 block mb-1">Status</label><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option value="All">All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></div>
          <div className="flex items-end"><button onClick={() => { setSearch(''); setFilterStatus('All') }} className="px-3 py-2 rounded-lg text-caption text-slate-500 hover:text-slate-700 border border-slate-200">Clear</button></div>
        </div>
      </div>
      {(showCreate || editItem) && <ExpenseForm />}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>{cols.map(c => <th key={c} className="text-left px-4 py-3 text-caption text-slate-500 font-semibold uppercase tracking-wider">{c}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={cols.length} className="text-center py-16 text-gov-body text-slate-400">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={cols.length} className="text-center py-16 text-gov-body text-slate-400">No expenses found</td></tr>}
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 text-gov-body font-semibold text-slate-900">{e.title}</td>
                <td className="px-4 py-3 text-gov-body text-slate-700">{e.category}</td>
                <td className="px-4 py-3 text-gov-body text-slate-700">${e.amount.toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-caption font-bold ${e.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : e.status === 'Rejected' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>{e.status}</span></td>
                <td className="px-4 py-3 text-gov-body text-slate-700">{e.submittedBy || '—'}</td>
                <td className="px-4 py-3 text-caption text-slate-400">{e.notes || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(e)} className="p-1 rounded hover:bg-slate-100"><Edit3 className="size-4 text-slate-400" /></button>
                    <button onClick={() => handleDelete(e.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="size-4 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-caption text-slate-400">
          <span>Showing {filtered.length} of {expenses.length} results</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL REPORTS VIEW (VeroPM: /financial/reports)
// ═══════════════════════════════════════════════════════════════════════════
const FinancialReportsView = () => {
  const [budgets, setBudgets] = useState<Array<{totalAmount:number;spent:number;allocated:number}>>([])
  const [expenses, setExpenses] = useState<Array<{amount:number;status:string}>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/morgan/budgets').then(r => r.json()),
      fetch('/api/morgan/expenses').then(r => r.json()),
    ]).then(([b, e]) => {
      setBudgets(Array.isArray(b) ? b : [])
      setExpenses(Array.isArray(e) ? e : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalBudget = budgets.reduce((s,b) => s + (b.totalAmount||0), 0)
  const totalExpenses = expenses.reduce((s,e) => s + (e.amount||0), 0)
  const approvedExpenses = expenses.filter(e => e.status === 'Approved').reduce((s,e) => s + (e.amount||0), 0)
  const netProfit = totalBudget - approvedExpenses
  const profitMargin = totalBudget > 0 ? ((netProfit / totalBudget) * 100).toFixed(1) : '0.0'
  const fmt = (n: number) => `$${n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1><p className="text-gov-body text-slate-500 mt-1">Generate and view financial summaries across projects</p></div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-xl text-caption font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">PDF</button>
          <button className="px-3 py-2 rounded-xl text-caption font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Excel</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Budget',v:loading?'Loading…':fmt(totalBudget)},{l:'Total Expenses',v:loading?'Loading…':fmt(totalExpenses)},{l:'Approved Spend',v:loading?'Loading…':fmt(approvedExpenses)},{l:'Profit Margin',v:loading?'Loading…':`${profitMargin}%`}].map(s => (
          <div key={s.l} className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-caption text-slate-400">{s.l}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.v}</p>
          </div>
        ))}
      </div>
      {!loading && budgets.length === 0 && expenses.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
          <BarChart3 className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-gov-header text-slate-700">No financial data yet</h3>
          <p className="text-gov-body text-slate-400 mt-2">Financial reports will appear once expenses and budgets are tracked.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h3 className="text-gov-header text-slate-700 mb-4">Budget Summary ({budgets.length} budgets)</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gov-body"><span className="text-slate-500">Total Budget</span><span className="font-semibold text-slate-900">{fmt(totalBudget)}</span></div>
              <div className="flex justify-between text-gov-body"><span className="text-slate-500">Total Allocated</span><span className="font-semibold text-slate-900">{fmt(budgets.reduce((s,b)=>s+(b.allocated||0),0))}</span></div>
              <div className="flex justify-between text-gov-body"><span className="text-slate-500">Total Spent (budgets)</span><span className="font-semibold text-slate-900">{fmt(budgets.reduce((s,b)=>s+(b.spent||0),0))}</span></div>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h3 className="text-gov-header text-slate-700 mb-4">Expense Summary ({expenses.length} expenses)</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gov-body"><span className="text-slate-500">Total Submitted</span><span className="font-semibold text-slate-900">{fmt(totalExpenses)}</span></div>
              <div className="flex justify-between text-gov-body"><span className="text-slate-500">Approved</span><span className="font-semibold text-emerald-600">{fmt(approvedExpenses)}</span></div>
              <div className="flex justify-between text-gov-body"><span className="text-slate-500">Pending</span><span className="font-semibold text-amber-600">{fmt(expenses.filter(e=>e.status==='Pending').reduce((s,e)=>s+(e.amount||0),0))}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL APPROVALS VIEW (VeroPM: /financial/approvals)
// ═══════════════════════════════════════════════════════════════════════════
const FinancialApprovalsView = () => {
  type Approval = {id:string;title:string;type:string;amount:number;status:string;submittedBy?:string;reviewedBy?:string;notes?:string}
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending'|'approved'|'rejected'>('pending')
  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState<Approval | null>(null)
  const [form, setForm] = useState({title:'',type:'Expense',amount:0,status:'Pending',submittedBy:'',reviewedBy:'',notes:''})

  useEffect(() => {
    setLoading(true)
    fetch('/api/morgan/financial-approvals').then(r => r.json()).then(d => { setApprovals(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    const res = await fetch('/api/morgan/financial-approvals', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setApprovals(p => [d,...p]); setShowCreate(false); setForm({title:'',type:'Expense',amount:0,status:'Pending',submittedBy:'',reviewedBy:'',notes:''}) }
  }
  const handleUpdate = async () => {
    if (!editItem) return
    const res = await fetch(`/api/morgan/financial-approvals/${editItem.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setApprovals(p => p.map(a => a.id === d.id ? d : a)); setEditItem(null) }
  }
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this approval?')) return
    const res = await fetch(`/api/morgan/financial-approvals/${id}`, { method:'DELETE' })
    if (res.ok) setApprovals(p => p.filter(a => a.id !== id))
  }
  const openEdit = (a: Approval) => { setEditItem(a); setForm({title:a.title,type:a.type,amount:a.amount,status:a.status,submittedBy:a.submittedBy||'',reviewedBy:a.reviewedBy||'',notes:a.notes||''}); setShowCreate(false) }

  const ApprovalForm = () => (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
      <h3 className="text-gov-header text-slate-700">{editItem ? 'Edit Approval' : 'Create Approval'}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="text-caption text-slate-500 block mb-1">Title *</label><input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="Approval title" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Type</label><select value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>Expense</option><option>Budget</option><option>Purchase</option></select></div>
        <div><label className="text-caption text-slate-500 block mb-1">Amount</label><input type="number" value={form.amount} onChange={e => setForm(p=>({...p,amount:Number(e.target.value)}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Status</label><select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>Pending</option><option>Approved</option><option>Rejected</option></select></div>
        <div><label className="text-caption text-slate-500 block mb-1">Submitted By</label><input value={form.submittedBy} onChange={e => setForm(p=>({...p,submittedBy:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Reviewed By</label><input value={form.reviewedBy} onChange={e => setForm(p=>({...p,reviewedBy:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" /></div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => { setShowCreate(false); setEditItem(null) }} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600">Cancel</button>
        <button onClick={editItem ? handleUpdate : handleCreate} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold">{editItem ? 'Save Changes' : 'Create Approval'}</button>
      </div>
    </div>
  )

  const tabItems = approvals.filter(a => a.status.toLowerCase() === tab)
  const pending = approvals.filter(a => a.status === 'Pending').length
  const approved = approvals.filter(a => a.status === 'Approved').length
  const rejected = approvals.filter(a => a.status === 'Rejected').length
  const rate = approvals.length > 0 ? Math.round((approved / approvals.length) * 100) : 100

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Financial Approvals</h1><p className="text-gov-body text-slate-500 mt-1">Review and approve expenses and budgets</p></div>
        <div className="flex gap-2">
          <button onClick={() => fetch('/api/morgan/financial-approvals').then(r=>r.json()).then(d=>setApprovals(Array.isArray(d)?d:[]))} className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600 flex items-center gap-1"><RefreshCw className="size-4" /> Refresh</button>
          <button onClick={() => { setShowCreate(true); setEditItem(null) }} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800 flex items-center gap-2"><Plus className="size-4" /> Create</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{label:'Pending',value:String(pending),color:'text-amber-600'},{label:'Approved',value:String(approved),color:'text-emerald-600'},{label:'Rejected',value:String(rejected),color:'text-red-500'},{label:'Approval Rate',value:`${rate}%`,color:'text-blue-600'}].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-caption text-slate-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {(['pending','approved','rejected'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-gov-body font-semibold capitalize transition-colors ${tab === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {t}{t === 'pending' ? ` (${pending})` : ''}
          </button>
        ))}
      </div>
      {(showCreate || editItem) && <ApprovalForm />}
      {!loading && tabItems.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
          <CheckCircle2 className="size-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-gov-header text-slate-700">All caught up!</h3>
          <p className="text-gov-body text-slate-400 mt-2">No {tab} approvals at this time.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{['Title','Type','Amount','Submitted By','Reviewed By','Notes',''].map(h => <th key={h} className="text-left px-4 py-3 text-caption text-slate-500 font-semibold uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-10 text-gov-body text-slate-400">Loading…</td></tr>}
              {tabItems.map(a => (
                <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 text-gov-body font-semibold text-slate-900">{a.title}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700">{a.type}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700">${a.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700">{a.submittedBy || '—'}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700">{a.reviewedBy || '—'}</td>
                  <td className="px-4 py-3 text-caption text-slate-400">{a.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(a)} className="p-1 rounded hover:bg-slate-100"><Edit3 className="size-4 text-slate-400" /></button>
                      <button onClick={() => handleDelete(a.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="size-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL SETTINGS VIEW (VeroPM: /financial/settings)
// ═══════════════════════════════════════════════════════════════════════════
const FinancialSettingsView = () => {
  const [tab, setTab] = useState<'general'|'currency'|'categories'|'approvals'>('general')

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Financial Settings</h1><p className="text-gov-body text-slate-500 mt-1">Configure financial preferences, currencies, and approval workflows</p></div>
        <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800">Save Settings</button>
      </div>
      <div className="flex gap-2">
        {(['general','currency','categories','approvals'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-gov-body font-semibold capitalize transition-colors ${tab === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t}</button>
        ))}
      </div>
      {tab === 'general' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
          <div><h3 className="text-gov-header text-slate-700">General Financial Settings</h3><p className="text-caption text-slate-400 mt-1">Basic configuration for financial operations</p></div>
          <div><label className="text-gov-body text-slate-700 font-semibold block mb-1">Default Currency</label><select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>🇺🇸 USD - US Dollar</option><option>🇪🇺 EUR - Euro</option><option>🇬🇧 GBP - British Pound</option><option>🇸🇦 SAR - Saudi Riyal</option></select><p className="text-caption text-slate-400 mt-1">The default currency for new budgets and expenses</p></div>
          <div><label className="text-gov-body text-slate-700 font-semibold block mb-1">Auto-Approval Limit</label><div className="flex items-center gap-2"><span className="text-gov-body text-slate-500">$</span><input type="number" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="0" /></div><p className="text-caption text-slate-400 mt-1">Expenses below this amount are automatically approved</p></div>
          <div className="flex items-center justify-between"><div><label className="text-gov-body text-slate-700 font-semibold">Require Receipts for Expenses</label><p className="text-caption text-slate-400">All expenses must include a receipt or supporting document</p></div><button className="text-slate-400"><ToggleLeft className="size-6" /></button></div>
          <div className="flex items-center justify-between"><div><label className="text-gov-body text-slate-700 font-semibold">Allow Expense Edits After Submission</label><p className="text-caption text-slate-400">Users can edit expenses until they are approved</p></div><button className="text-slate-400"><ToggleLeft className="size-6" /></button></div>
          <div className="flex items-center justify-between"><div><label className="text-gov-body text-slate-700 font-semibold">Budget Alerts</label><p className="text-caption text-slate-400">Send notifications when budgets reach threshold</p></div><button className="text-slate-400"><ToggleLeft className="size-6" /></button></div>
          <div><label className="text-gov-body text-slate-700 font-semibold block mb-1">Alert Threshold (%)</label><input type="number" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="80" /></div>
        </div>
      )}
      {tab !== 'general' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
          <Settings className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-gov-header text-slate-700 capitalize">{tab} Settings</h3>
          <p className="text-gov-body text-slate-400 mt-2">Configure {tab} preferences for your financial module.</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// RISK HEAT MAP VIEW (VeroPM: /risks/heat-map — 5x5 matrix)
// ═══════════════════════════════════════════════════════════════════════════
const RiskHeatMapView = () => {
  type RiskRow = { id:string; category:string; probability:string; impact:string; status:string; title:string }
  const [risks, setRisks] = useState<RiskRow[]>([])
  const probabilities = [5,4,3,2,1]
  const impacts = [1,2,3,4,5]
  const levelMap: Record<string,number> = { Low:1, Medium:3, High:5, 'Very Low':1, 'Very High':5, Critical:5 }
  const pNum = (s:string) => levelMap[s] ?? (parseInt(s) || 1)
  const iNum = (s:string) => levelMap[s] ?? (parseInt(s) || 1)
  const cellCount = (p:number, i:number) => risks.filter(r => pNum(r.probability) === p && iNum(r.impact) === i).length

  useEffect(() => {
    fetch('/api/morgan/risks', { cache:'no-store' }).then(r => r.json()).then(d => { const arr = d?.risks ?? d; if (Array.isArray(arr)) setRisks(arr) }).catch(() => {})
  }, [])

  const getCellColor = (p: number, i: number) => {
    const score = p * i
    if (score >= 20) return 'bg-red-500 text-white'
    if (score >= 12) return 'bg-orange-400 text-white'
    if (score >= 6) return 'bg-amber-300 text-amber-900'
    return 'bg-emerald-200 text-emerald-900'
  }

  const byCategory = risks.reduce<Record<string,number>>((acc, r) => { acc[r.category] = (acc[r.category]||0)+1; return acc }, {})
  const byStatus = risks.reduce<Record<string,number>>((acc, r) => { acc[r.status] = (acc[r.status]||0)+1; return acc }, {})

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-slate-900">Risk Heat Map</h2><p className="text-gov-body text-slate-500 mt-1">Interactive risk matrix visualization</p></div>
        <button className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600"><Download className="size-4 inline mr-1" />Export</button>
      </div>
      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex gap-4 items-end">
        <div><label className="text-caption text-slate-500 block mb-1">Project</label><select className="px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>All Projects</option></select></div>
        <div><label className="text-caption text-slate-500 block mb-1">Status</label><select className="px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>All Statuses</option></select></div>
        <div><label className="text-caption text-slate-500 block mb-1">Category</label><select className="px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>All Categories</option></select></div>
        <button className="px-3 py-2 rounded-lg text-caption text-slate-500 hover:text-slate-700">Clear Filters</button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {/* Matrix */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h3 className="text-gov-header text-slate-700 mb-4">Impact vs Probability Matrix</h3>
          <div className="grid grid-cols-6 gap-1">
            <div /> {/* empty corner */}
            {impacts.map(i => <div key={i} className="text-center text-caption text-slate-500 font-semibold py-2">{i}</div>)}
            {probabilities.map(p => (
              <React.Fragment key={p}>
                <div className="text-right text-caption text-slate-500 font-semibold pr-2 py-3">{p}</div>
                {impacts.map(i => {
                  const count = cellCount(p, i)
                  return (
                    <div key={`${p}-${i}`} className={`rounded-lg py-3 text-caption font-bold flex flex-col items-center justify-center gap-0.5 ${getCellColor(p, i)}`}>
                      <span className="opacity-60">{p * i}</span>
                      {count > 0 && <span className="bg-white/80 text-slate-800 rounded-full px-1.5 text-[9px] font-bold leading-4">{count}</span>}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
            <span>← Low Impact</span><span>High Impact →</span>
          </div>
        </div>
        {/* Statistics */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
          <h3 className="text-gov-header text-slate-700">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gov-body text-slate-500">Total Risks</span><span className="font-bold text-slate-900">{risks.length}</span></div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-caption text-slate-500 font-semibold mb-2">By Category</p>
              {Object.keys(byCategory).length === 0
                ? <p className="text-caption text-slate-400">No risks recorded</p>
                : Object.entries(byCategory).map(([cat, cnt]) => (
                  <div key={cat} className="flex justify-between text-caption"><span className="text-slate-500">{cat}</span><span className="text-slate-900 font-semibold">{cnt}</span></div>
                ))}
            </div>
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-caption text-slate-500 font-semibold mb-2">By Status</h4>
              {Object.keys(byStatus).length === 0
                ? <p className="text-caption text-slate-400">No risks recorded</p>
                : Object.entries(byStatus).map(([s, cnt]) => (
                  <div key={s} className="flex justify-between text-caption"><span className="text-slate-500">{s}</span><span className="text-slate-900 font-semibold">{cnt}</span></div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// RISK ALERTS VIEW (VeroPM: /risks/alerts)
// ═══════════════════════════════════════════════════════════════════════════
const RiskAlertsView = () => {
  return (
    <div className="p-8 space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900">Risk Alerts</h2><p className="text-gov-body text-slate-500 mt-1">Active risk notifications and alerts</p></div>
      <div className="flex items-center gap-2"><span className="text-caption font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">0 Active</span></div>
      <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
        <CheckCircle2 className="size-12 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-gov-header text-slate-700">No Active Alerts</h3>
        <p className="text-gov-body text-slate-400 mt-2">All risks are currently under control</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT RULES VIEW (VeroPM: /risks/alert-rules)
// ═══════════════════════════════════════════════════════════════════════════
const AlertRulesView = () => {
  type AlertRule = {id:string;name:string;entity:string;condition:string;threshold?:string;severity:string;enabled:boolean}
  const [rules, setRules] = useState<AlertRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState<AlertRule | null>(null)
  const [form, setForm] = useState({name:'',entity:'project',condition:'',threshold:'',severity:'Medium',enabled:true})

  useEffect(() => {
    setLoading(true)
    fetch('/api/morgan/alert-rules').then(r => r.json()).then(d => { setRules(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    const res = await fetch('/api/morgan/alert-rules', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setRules(p => [d,...p]); setShowCreate(false); setForm({name:'',entity:'project',condition:'',threshold:'',severity:'Medium',enabled:true}) }
  }
  const handleUpdate = async () => {
    if (!editItem) return
    const res = await fetch(`/api/morgan/alert-rules/${editItem.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setRules(p => p.map(r => r.id === d.id ? d : r)); setEditItem(null) }
  }
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rule?')) return
    const res = await fetch(`/api/morgan/alert-rules/${id}`, { method:'DELETE' })
    if (res.ok) setRules(p => p.filter(r => r.id !== id))
  }
  const handleToggle = async (r: AlertRule) => {
    const res = await fetch(`/api/morgan/alert-rules/${r.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({enabled:!r.enabled}) })
    if (res.ok) { const d = await res.json(); setRules(p => p.map(x => x.id === d.id ? d : x)) }
  }
  const openEdit = (r: AlertRule) => { setEditItem(r); setForm({name:r.name,entity:r.entity,condition:r.condition,threshold:r.threshold||'',severity:r.severity,enabled:r.enabled}); setShowCreate(false) }

  const RuleForm = () => (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
      <h3 className="text-gov-header text-slate-700">{editItem ? 'Edit Rule' : 'Create Alert Rule'}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="text-caption text-slate-500 block mb-1">Rule Name *</label><input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="Rule name" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Entity</label><select value={form.entity} onChange={e => setForm(p=>({...p,entity:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option value="project">Project</option><option value="risk">Risk</option><option value="budget">Budget</option><option value="task">Task</option></select></div>
        <div><label className="text-caption text-slate-500 block mb-1">Severity</label><select value={form.severity} onChange={e => setForm(p=>({...p,severity:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
        <div className="col-span-2"><label className="text-caption text-slate-500 block mb-1">Condition *</label><input value={form.condition} onChange={e => setForm(p=>({...p,condition:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="e.g. status = Overdue" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Threshold</label><input value={form.threshold} onChange={e => setForm(p=>({...p,threshold:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="e.g. 80%" /></div>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-gov-body text-slate-700 font-semibold">Enabled</label>
        <button type="button" onClick={() => setForm(p=>({...p,enabled:!p.enabled}))} className="text-slate-500">{form.enabled ? <ToggleRight className="size-6 text-emerald-600" /> : <ToggleLeft className="size-6" />}</button>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => { setShowCreate(false); setEditItem(null) }} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600">Cancel</button>
        <button onClick={editItem ? handleUpdate : handleCreate} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold">{editItem ? 'Save Changes' : 'Create Rule'}</button>
      </div>
    </div>
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-slate-900">Risk Alert Rules</h2><p className="text-gov-body text-slate-500 mt-1">Configure rules to automatically generate alerts when risks meet certain conditions</p></div>
        <div className="flex gap-2">
          <button onClick={() => fetch('/api/morgan/alert-rules').then(r=>r.json()).then(d=>setRules(Array.isArray(d)?d:[]))} className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600"><RefreshCw className="size-4 inline mr-1" />Refresh</button>
          <button onClick={() => { setShowCreate(true); setEditItem(null); setForm({name:'',entity:'project',condition:'',threshold:'',severity:'Medium',enabled:true}) }} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800"><Plus className="size-4 inline mr-1" />Create Rule</button>
        </div>
      </div>
      {(showCreate || editItem) && <RuleForm />}
      {loading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-gov-body text-slate-400">Loading…</div>
      ) : rules.length === 0 && !showCreate ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
          <Shield className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-gov-header text-slate-700">No Alert Rules</h3>
          <p className="text-gov-body text-slate-400 mt-2">Create alert rules to automatically generate alerts for risks that meet specific conditions</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800">Create Your First Rule</button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{['Name','Entity','Condition','Threshold','Severity','Enabled',''].map(h => <th key={h} className="text-left px-4 py-3 text-caption text-slate-500 font-semibold uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 text-gov-body font-semibold text-slate-900">{r.name}</td>
                  <td className="px-4 py-3 text-gov-body text-slate-700 capitalize">{r.entity}</td>
                  <td className="px-4 py-3 text-caption text-slate-500">{r.condition}</td>
                  <td className="px-4 py-3 text-caption text-slate-500">{r.threshold || '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-caption font-bold ${r.severity === 'Critical' ? 'bg-red-50 text-red-600' : r.severity === 'High' ? 'bg-orange-50 text-orange-600' : r.severity === 'Low' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{r.severity}</span></td>
                  <td className="px-4 py-3"><button onClick={() => handleToggle(r)}>{r.enabled ? <ToggleRight className="size-5 text-emerald-600" /> : <ToggleLeft className="size-5 text-slate-400" />}</button></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(r)} className="p-1 rounded hover:bg-slate-100"><Edit3 className="size-4 text-slate-400" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="size-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE ANALYTICS VIEW (VeroPM: /issues/analytics)
// ═══════════════════════════════════════════════════════════════════════════
const IssueAnalyticsView = () => {
  type IssueRow = { id:string; title:string; severity:string; status:string; createdAt?:string; updatedAt?:string }
  const [tab, setTab] = useState<'overview'|'trends'|'distribution'|'team'>('overview')
  const [issues, setIssues] = useState<IssueRow[]>([])

  useEffect(() => {
    fetch('/api/morgan/issues', { cache:'no-store' }).then(r => r.json()).then(d => { const arr = d?.issues ?? d; if (Array.isArray(arr)) setIssues(arr) }).catch(() => {})
  }, [])

  const total = issues.length
  const closed = issues.filter(i => i.status === 'Closed' || i.status === 'Resolved').length
  const open = total - closed
  const avgResolution = closed > 0
    ? (issues.filter(i => i.status === 'Closed' || i.status === 'Resolved').reduce((sum, i) => {
        const created = i.createdAt ? new Date(i.createdAt).getTime() : 0
        const updated = i.updatedAt ? new Date(i.updatedAt).getTime() : Date.now()
        return sum + (updated - created) / 86400000
      }, 0) / closed)
    : 0

  const kpis = [
    { label: 'Total Issues', value: String(total) },
    { label: 'Open Issues', value: String(open) },
    { label: 'Closed Issues', value: String(closed) },
    { label: 'Avg Resolution Time', value: avgResolution.toFixed(1), sub: 'days' },
  ]

  const byStatus = issues.reduce<Record<string,number>>((acc, i) => { acc[i.status] = (acc[i.status]||0)+1; return acc }, {})
  const bySeverity = issues.reduce<Record<string,number>>((acc, i) => { acc[i.severity] = (acc[i.severity]||0)+1; return acc }, {})

  const BarRow = ({ label, count, total: t }: { label:string; count:number; total:number }) => (
    <div className="flex items-center gap-3">
      <span className="text-caption text-slate-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className="bg-slate-700 h-2 rounded-full transition-all" style={{ width: t > 0 ? `${(count/t)*100}%` : '0%' }} />
      </div>
      <span className="text-caption font-semibold text-slate-700 w-6 text-right">{count}</span>
    </div>
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-slate-900">Issue Analytics</h2><p className="text-gov-body text-slate-500 mt-1">Comprehensive insights into issue management</p></div>
        <button className="px-3 py-2 rounded-lg text-gov-body text-slate-600 bg-white border border-slate-200">Last 30 Days</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-caption text-slate-400">{k.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{k.value}</p>
            {k.sub && <p className="text-caption text-slate-400">{k.sub}</p>}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {(['overview','trends','distribution','team'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-gov-body font-semibold transition-colors ${tab === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t === 'team' ? 'Team Performance' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h3 className="text-gov-header text-slate-700 mb-4">Issues by Status</h3>
          {Object.keys(byStatus).length === 0
            ? <div className="h-48 flex items-center justify-center text-caption text-slate-400">No data to display</div>
            : <div className="space-y-3 pt-2">{Object.entries(byStatus).map(([s, cnt]) => <BarRow key={s} label={s} count={cnt} total={total} />)}</div>}
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h3 className="text-gov-header text-slate-700 mb-4">Issues by Severity</h3>
          {Object.keys(bySeverity).length === 0
            ? <div className="h-48 flex items-center justify-center text-caption text-slate-400">No data to display</div>
            : <div className="space-y-3 pt-2">{Object.entries(bySeverity).map(([s, cnt]) => <BarRow key={s} label={s} count={cnt} total={total} />)}</div>}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// LESSONS LEARNED ANALYTICS VIEW (VeroPM: /lessonlearned/analytics)
// ═══════════════════════════════════════════════════════════════════════════
const LessonsLearnedView = () => {
  type Lesson = {id:string;title:string;category:string;description?:string;impact:string;recommendation?:string;status:string}
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview'|'list'|'distribution'|'category'>('overview')
  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState<Lesson | null>(null)
  const [form, setForm] = useState({title:'',category:'General',description:'',impact:'Medium',recommendation:'',status:'Open'})

  useEffect(() => {
    setLoading(true)
    fetch('/api/morgan/lessons-learned').then(r => r.json()).then(d => { setLessons(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    const res = await fetch('/api/morgan/lessons-learned', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setLessons(p => [d,...p]); setShowCreate(false); setForm({title:'',category:'General',description:'',impact:'Medium',recommendation:'',status:'Open'}) }
  }
  const handleUpdate = async () => {
    if (!editItem) return
    const res = await fetch(`/api/morgan/lessons-learned/${editItem.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setLessons(p => p.map(l => l.id === d.id ? d : l)); setEditItem(null) }
  }
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lesson?')) return
    const res = await fetch(`/api/morgan/lessons-learned/${id}`, { method:'DELETE' })
    if (res.ok) setLessons(p => p.filter(l => l.id !== id))
  }
  const openEdit = (l: Lesson) => { setEditItem(l); setForm({title:l.title,category:l.category,description:l.description||'',impact:l.impact,recommendation:l.recommendation||'',status:l.status}); setShowCreate(false) }

  const LessonForm = () => (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
      <h3 className="text-gov-header text-slate-700">{editItem ? 'Edit Lesson' : 'Add Lesson Learned'}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2"><label className="text-caption text-slate-500 block mb-1">Title *</label><input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="Lesson title" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Category</label><input value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="General" /></div>
        <div><label className="text-caption text-slate-500 block mb-1">Impact</label><select value={form.impact} onChange={e => setForm(p=>({...p,impact:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
        <div><label className="text-caption text-slate-500 block mb-1">Status</label><select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>Open</option><option>In Progress</option><option>Closed</option></select></div>
        <div className="col-span-3"><label className="text-caption text-slate-500 block mb-1">Description</label><textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="What happened and what was learned?" /></div>
        <div className="col-span-3"><label className="text-caption text-slate-500 block mb-1">Recommendation</label><textarea value={form.recommendation} onChange={e => setForm(p=>({...p,recommendation:e.target.value}))} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="What should be done differently?" /></div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => { setShowCreate(false); setEditItem(null) }} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600">Cancel</button>
        <button onClick={editItem ? handleUpdate : handleCreate} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold">{editItem ? 'Save Changes' : 'Add Lesson'}</button>
      </div>
    </div>
  )

  const open = lessons.filter(l => l.status === 'Open').length
  const closed = lessons.filter(l => l.status === 'Closed').length
  const highImpact = lessons.filter(l => l.impact === 'High' || l.impact === 'Critical').length
  const kpis = [
    { label: 'Total Lessons', value: String(lessons.length) },
    { label: 'Open', value: String(open) },
    { label: 'Closed', value: String(closed) },
    { label: 'High Impact', value: String(highImpact) },
  ]

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-slate-900">Lessons Learned</h2><p className="text-gov-body text-slate-500 mt-1">Capture and share project learnings across your organization</p></div>
        <button onClick={() => { setShowCreate(true); setEditItem(null); setForm({title:'',category:'General',description:'',impact:'Medium',recommendation:'',status:'Open'}) }} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800 flex items-center gap-2"><Plus className="size-4" /> Add Lesson</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-caption text-slate-400">{k.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '…' : k.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {(['overview','list','distribution','category'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-gov-body font-semibold transition-colors ${tab === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t === 'category' ? 'Category Impact' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {(showCreate || editItem) && <LessonForm />}
      {tab === 'list' || tab === 'overview' ? (
        lessons.length === 0 && !showCreate && !loading ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
            <ClipboardCheck className="size-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-gov-header text-slate-700">No lessons recorded yet</h3>
            <p className="text-gov-body text-slate-400 mt-2">Add lessons learned from your projects to build organizational knowledge.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Title','Category','Impact','Status','Recommendation',''].map(h => <th key={h} className="text-left px-4 py-3 text-caption text-slate-500 font-semibold uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} className="text-center py-10 text-gov-body text-slate-400">Loading…</td></tr>}
                {lessons.map(l => (
                  <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 text-gov-body font-semibold text-slate-900">{l.title}</td>
                    <td className="px-4 py-3 text-gov-body text-slate-700">{l.category}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-caption font-bold ${l.impact === 'Critical' ? 'bg-red-50 text-red-600' : l.impact === 'High' ? 'bg-orange-50 text-orange-600' : l.impact === 'Low' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{l.impact}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-caption font-bold ${l.status === 'Closed' ? 'bg-slate-100 text-slate-500' : l.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{l.status}</span></td>
                    <td className="px-4 py-3 text-caption text-slate-400 max-w-xs truncate">{l.recommendation || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(l)} className="p-1 rounded hover:bg-slate-100"><Edit3 className="size-4 text-slate-400" /></button>
                        <button onClick={() => handleDelete(l.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="size-4 text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h3 className="text-gov-header text-slate-700 mb-4">Lessons by Category</h3>
            {loading ? <div className="h-48 flex items-center justify-center text-caption text-slate-400">Loading…</div> : lessons.length === 0 ? <div className="h-48 flex items-center justify-center text-caption text-slate-400">No data to display</div> : (
              <div className="space-y-2">{Array.from(new Set(lessons.map(l=>l.category))).map(cat => <div key={cat} className="flex justify-between text-gov-body"><span className="text-slate-500">{cat}</span><span className="font-semibold text-slate-900">{lessons.filter(l=>l.category===cat).length}</span></div>)}</div>
            )}
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h3 className="text-gov-header text-slate-700 mb-4">Lessons by Impact</h3>
            {loading ? <div className="h-48 flex items-center justify-center text-caption text-slate-400">Loading…</div> : lessons.length === 0 ? <div className="h-48 flex items-center justify-center text-caption text-slate-400">No data to display</div> : (
              <div className="space-y-2">{['Critical','High','Medium','Low'].map(imp => <div key={imp} className="flex justify-between text-gov-body"><span className="text-slate-500">{imp}</span><span className="font-semibold text-slate-900">{lessons.filter(l=>l.impact===imp).length}</span></div>)}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKSPACE SETTINGS VIEW (VeroPM: /settings — 9 sidebar tabs)
// ═══════════════════════════════════════════════════════════════════════════
const SettingsView = () => {
  const [tab, setTab] = useState('organization')
  const tabs = ['Organization','General','Members & Permissions','Clients','Team Capacity','Security','Audit & Compliance','Approval Workflows','AI Usage']
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [orgForm, setOrgForm] = useState({ orgName:'', currency:'USD', timezone:'UTC', fiscalYearStart:'January', dateFormat:'DD/MM/YYYY', aiEnabled:true, notificationsEnabled:true })

  useEffect(() => {
    fetch('/api/morgan/settings').then(r => r.ok ? r.json() : null).then(d => {
      if (d) setOrgForm(f => ({
        orgName: d.orgName ?? f.orgName,
        currency: d.currency ?? f.currency,
        timezone: d.timezone ?? f.timezone,
        fiscalYearStart: d.fiscalYearStart ?? f.fiscalYearStart,
        dateFormat: d.dateFormat ?? f.dateFormat,
        aiEnabled: d.aiEnabled ?? f.aiEnabled,
        notificationsEnabled: d.notificationsEnabled ?? f.notificationsEnabled,
      }))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/morgan/settings', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(orgForm) })
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  return (
    <div className="flex h-full">
      {/* Settings sidebar */}
      <div className="w-[200px] border-r border-slate-100 bg-white py-4 px-2 space-y-1 shrink-0">
        <h1 className="px-3 pb-3 text-gov-title font-bold text-slate-900">Workspace Settings</h1>
        {tabs.map(t => {
          const key = t.toLowerCase().replace(/[^a-z]/g,'-')
          return (
            <button key={key} onClick={() => setTab(key)} className={`w-full text-left px-3 py-2 rounded-lg text-gov-body transition-colors ${tab === key ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>{t}</button>
          )
        })}
      </div>
      {/* Settings content */}
      <div className="flex-1 p-8 overflow-auto">
        {tab === 'organization' && (
          <div className="max-w-xl space-y-6">
            <div><h2 className="text-xl font-bold text-slate-900">Organization Settings</h2><p className="text-gov-body text-slate-500 mt-1">Manage your organization&apos;s information and preferences</p><p className="text-caption text-blue-500 mt-1">Your role: Owner</p></div>
            {loading ? <div className="text-gov-body text-slate-400">Loading…</div> : (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
                <h3 className="text-gov-header text-slate-700">Organization Information</h3>
                <div><label className="text-gov-body text-slate-700 font-semibold block mb-1">Organization Name</label><input value={orgForm.orgName} onChange={e => setOrgForm(f=>({...f,orgName:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body" placeholder="Morgan Consulting Engineers" /></div>
                <div><label className="text-gov-body text-slate-700 font-semibold block mb-1">Currency</label><select value={orgForm.currency} onChange={e => setOrgForm(f=>({...f,currency:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>USD</option><option>EUR</option><option>GBP</option><option>AUD</option><option>CAD</option><option>ZAR</option></select></div>
                <div><label className="text-gov-body text-slate-700 font-semibold block mb-1">Timezone</label><select value={orgForm.timezone} onChange={e => setOrgForm(f=>({...f,timezone:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>UTC</option><option>America/New_York</option><option>America/Chicago</option><option>America/Los_Angeles</option><option>Europe/London</option><option>Europe/Paris</option><option>Africa/Johannesburg</option><option>Asia/Dubai</option><option>Australia/Sydney</option></select></div>
                <div><label className="text-gov-body text-slate-700 font-semibold block mb-1">Fiscal Year Start</label><select value={orgForm.fiscalYearStart} onChange={e => setOrgForm(f=>({...f,fiscalYearStart:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body">{['January','February','March','April','May','June','July','August','September','October','November','December'].map(m=><option key={m}>{m}</option>)}</select></div>
                <div><label className="text-gov-body text-slate-700 font-semibold block mb-1">Date Format</label><select value={orgForm.dateFormat} onChange={e => setOrgForm(f=>({...f,dateFormat:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-gov-body"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></div>
                <div>
                  <label className="text-gov-body text-slate-700 font-semibold block mb-1">Organization Logo</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-slate-300 cursor-pointer transition-colors">
                    <Upload className="size-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-caption text-slate-500">Click to upload logo</p>
                  </div>
                </div>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800 disabled:opacity-60">{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}</button>
              </div>
            )}
          </div>
        )}
        {tab === 'general' && (
          <div className="max-w-xl space-y-6">
            <div><h2 className="text-xl font-bold text-slate-900">General Settings</h2><p className="text-gov-body text-slate-500 mt-1">Configure general workspace preferences</p></div>
            {loading ? <div className="text-gov-body text-slate-400">Loading…</div> : (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div><p className="text-gov-body font-semibold text-slate-900">AI Features</p><p className="text-caption text-slate-400">Enable AI-powered suggestions and automation</p></div>
                  <button onClick={() => setOrgForm(f=>({...f,aiEnabled:!f.aiEnabled}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${orgForm.aiEnabled ? 'bg-slate-900' : 'bg-slate-200'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${orgForm.aiEnabled ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div><p className="text-gov-body font-semibold text-slate-900">Notifications</p><p className="text-caption text-slate-400">Email and in-app notifications</p></div>
                  <button onClick={() => setOrgForm(f=>({...f,notificationsEnabled:!f.notificationsEnabled}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${orgForm.notificationsEnabled ? 'bg-slate-900' : 'bg-slate-200'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${orgForm.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                </div>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800 disabled:opacity-60">{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}</button>
              </div>
            )}
          </div>
        )}
        {tab !== 'organization' && tab !== 'general' && (
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-slate-900 capitalize">{tab.replace(/-/g, ' ')}</h2>
            <p className="text-gov-body text-slate-500 mt-1">Configure {tab.replace(/-/g, ' ')} settings for your workspace.</p>
            <div className="bg-white border border-slate-100 rounded-2xl p-8 mt-6 text-center">
              <Settings className="size-12 text-slate-300 mx-auto mb-4" />
              <p className="text-gov-body text-slate-400">Settings content will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TIME-OFF MANAGEMENT VIEW (VeroPM: /resources/time-off)
// ═══════════════════════════════════════════════════════════════════════════
const TimeOffView = () => {
  type TimeOffRow = { id:string; employeeName:string; type:string; startDate:string; endDate:string; days:number; status:string; notes?:string }
  const LEAVE_TYPES = ['Annual Leave','Sick Leave','Emergency Leave','Unpaid Leave','Maternity/Paternity','Public Holiday']
  const STATUSES = ['Pending','Approved','Rejected']
  const [records, setRecords] = useState<TimeOffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [form, setForm] = useState({ employeeName:'', type:'Annual Leave', startDate:'', endDate:'', days:'1', status:'Pending', notes:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/morgan/time-off', { cache:'no-store' })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setRecords(d) }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const openCreate = () => { setEditId(null); setForm({ employeeName:'', type:'Annual Leave', startDate:'', endDate:'', days:'1', status:'Pending', notes:'' }); setShowForm(true) }
  const openEdit = (r: TimeOffRow) => { setEditId(r.id); setForm({ employeeName:r.employeeName, type:r.type, startDate:r.startDate?.slice(0,10)||'', endDate:r.endDate?.slice(0,10)||'', days:String(r.days), status:r.status, notes:r.notes||'' }); setShowForm(true) }

  const handleSave = async () => {
    if (!form.employeeName.trim() || !form.startDate || !form.endDate) return
    setSaving(true)
    try {
      const body = { employeeName:form.employeeName, type:form.type, startDate:form.startDate, endDate:form.endDate, days:parseInt(form.days)||1, status:form.status, notes:form.notes||undefined }
      if (editId) {
        const res = await fetch(`/api/morgan/time-off/${editId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
        if (res.ok) { const updated = await res.json(); setRecords(prev => prev.map(r => r.id === editId ? updated : r)); setShowForm(false) }
      } else {
        const res = await fetch('/api/morgan/time-off', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
        if (res.ok) { const created = await res.json(); setRecords(prev => [created, ...prev]); setShowForm(false) }
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/morgan/time-off/${id}`, { method:'DELETE' })
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  const handleStatusChange = async (id: string, status: string) => {
    setRecords(prev => prev.map(r => r.id === id ? {...r, status} : r))
    await fetch(`/api/morgan/time-off/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) })
  }

  const statusBadge = (s: string) => {
    if (s === 'Approved') return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    if (s === 'Rejected') return 'bg-red-50 text-red-600 border-red-100'
    return 'bg-amber-50 text-amber-600 border-amber-100'
  }

  const stats = [
    { label:'Total Requests', value: records.length },
    { label:'Pending', value: records.filter(r => r.status === 'Pending').length },
    { label:'Approved', value: records.filter(r => r.status === 'Approved').length },
    { label:'Total Days Off', value: records.filter(r => r.status === 'Approved').reduce((s, r) => s + r.days, 0) },
  ]

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Time-Off Management</h1><p className="text-gov-body text-slate-500 mt-1">Manage employee leave requests and approvals</p></div>
        <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800 flex items-center gap-2"><Plus className="size-4" /> New Request</button>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-caption text-slate-400">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-gov-title text-slate-900 font-bold">{editId ? 'Edit Request' : 'New Time-Off Request'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-gov-label text-slate-500 block mb-1">Employee Name *</label><input value={form.employeeName} onChange={e => setForm(f => ({...f, employeeName:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" placeholder="Employee name" /></div>
            <div><label className="text-gov-label text-slate-500 block mb-1">Leave Type</label><select value={form.type} onChange={e => setForm(f => ({...f, type:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">{LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="text-gov-label text-slate-500 block mb-1">Start Date *</label><input type="date" value={form.startDate} onChange={e => setForm(f => ({...f, startDate:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" /></div>
            <div><label className="text-gov-label text-slate-500 block mb-1">End Date *</label><input type="date" value={form.endDate} onChange={e => setForm(f => ({...f, endDate:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" /></div>
            <div><label className="text-gov-label text-slate-500 block mb-1">Number of Days</label><input type="number" min="1" value={form.days} onChange={e => setForm(f => ({...f, days:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" /></div>
            <div><label className="text-gov-label text-slate-500 block mb-1">Status</label><select value={form.status} onChange={e => setForm(f => ({...f, status:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="col-span-2"><label className="text-gov-label text-slate-500 block mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" placeholder="Optional notes" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-gov-body text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.employeeName.trim() || !form.startDate || !form.endDate} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-gov-body font-semibold hover:bg-slate-800 disabled:opacity-50">{saving ? 'Saving…' : editId ? 'Update' : 'Create Request'}</button>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-gov-body text-slate-500">Leave Requests &bull; {records.length}</span>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>{['Employee','Type','Start','End','Days','Status','Notes',''].map(h => <th key={h} className="text-left px-4 py-3 text-caption text-slate-500 font-semibold uppercase tracking-wider">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="text-center py-12 text-gov-body text-slate-400">Loading…</td></tr>}
            {!loading && records.length === 0 && <tr><td colSpan={8} className="text-center py-16 text-gov-body text-slate-400">No leave requests yet. Click &quot;New Request&quot; to add one.</td></tr>}
            {records.map(r => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 text-gov-body font-semibold text-slate-900">{r.employeeName}</td>
                <td className="px-4 py-3 text-gov-body text-slate-700">{r.type}</td>
                <td className="px-4 py-3 text-caption text-slate-500">{r.startDate?.slice(0,10)}</td>
                <td className="px-4 py-3 text-caption text-slate-500">{r.endDate?.slice(0,10)}</td>
                <td className="px-4 py-3 text-gov-body text-slate-700">{r.days}</td>
                <td className="px-4 py-3">
                  <select value={r.status} onChange={e => void handleStatusChange(r.id, e.target.value)} className={`text-caption font-bold border rounded-lg px-2 py-1 focus:outline-none cursor-pointer ${statusBadge(r.status)}`}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-caption text-slate-400 max-w-[160px] truncate">{r.notes}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(r)} className="p-1 text-slate-400 hover:text-slate-700 rounded"><Edit3 className="size-3.5" /></button>
                    <button onClick={() => void handleDelete(r.id)} className="p-1 text-slate-400 hover:text-red-500 rounded"><Trash2 className="size-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export {
  DashboardView,
  PortfoliosView,
  TendersKanbanView,
  ProjectsView,
  TemplatesView,
  WorkflowsView,
  AutomationView,
  TasksView,
  IssuesView,
  TimeReportsView,
  DocumentsView,
  TimesheetsView,
  RisksView,
  MilestonesView,
  DocumentApprovalView,
  ResourceRequestsView,
  CapacityPlanningView,
  WorkloadBalancingView,
  BudgetsView,
  ExpensesView,
  FinancialReportsView,
  FinancialApprovalsView,
  FinancialSettingsView,
  RiskHeatMapView,
  RiskAlertsView,
  AlertRulesView,
  IssueAnalyticsView,
  LessonsLearnedView,
  SettingsView,
  TimeOffView,
}
