import React from 'react'
import { Search, X } from 'lucide-react'
import type { MorganProject } from './types'

export interface KpiCardProps {
  label: string
  value: string | number
  trend?: string
  icon: React.ComponentType<{ className?: string }>
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'red'
}

export const KpiCard = ({ label, value, trend, icon: Icon, color = 'blue' }: KpiCardProps) => {
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

export const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex justify-between items-center bg-white px-8 py-5 rounded-2xl border border-slate-100 shadow-sm">
    <div className="space-y-1">
      <h2 className="text-gov-title text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-gov-body text-slate-400">{subtitle}</p>}
    </div>
    {action}
  </div>
)

export const SearchBar = ({ placeholder = 'Search...', value = '', onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) => (
  <div className="relative flex-1 group">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
    <input type="text" placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
      className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-gov-body focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all" />
    {value && <button onClick={() => onChange?.('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors"><X className="size-3.5 text-slate-400" /></button>}
  </div>
)

export const ActionBtn = ({ children, onClick, variant = 'primary' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' }) => (
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

export const HealthRing = ({ score }: { score: number }) => {
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

export const ProjectDetail = ({ project, onClose }: { project: MorganProject; onClose: () => void }) => (
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
        <div>
          <div className="flex justify-between mb-2"><span className="text-gov-label text-slate-500">Progress</span><span className="text-gov-body font-bold text-slate-900">{project.progress}%</span></div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${project.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${project.progress}%` }} /></div>
        </div>
        <div>
          <h3 className="text-gov-header text-slate-900 mb-3">Team</h3>
          <p className="text-gov-body text-slate-400">No team members assigned yet. Assign team members from the project settings.</p>
        </div>
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

export const ProjectCard = ({ project, onClick }: { project: MorganProject; onClick?: () => void }) => (
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
