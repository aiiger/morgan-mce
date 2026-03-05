"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
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
import { StyleProvider } from '@/lib/StyleSystem'
import { type AutomationRule } from '@/lib/imperial/automation'
import { useUser } from '@clerk/nextjs'
// mock-extended imports removed — all 7 entities now use live API
// backbone mock imports removed — data comes from API only
import { ProjectForm } from '@/components/forms/ProjectForm'
import { TenderForm } from '@/components/forms/TenderForm'
import { ActionBtn, ProjectDetail } from '@/components/views/shared'

/* ═══════════════════════════════════════════════════════════════════════════
   VEROPM CLONE — FULL SIDEBAR + SECTION VIEWS
   Light mode, full text labels, functional forms for every section.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────────────────────────
type SectionId =
  | 'dashboard' | 'portfolios' | 'tenders' | 'projects' | 'templates'
  | 'workflows' | 'automation' | 'tasks' | 'issues' | 'risks' | 'milestones'
  | 'time-reports' | 'documents' | 'timesheets'
  | 'approval-pipeline'
  | 'resource-requests' | 'capacity-planning' | 'workload-balancing'
  | 'budgets' | 'expenses' | 'financial-reports' | 'financial-approvals' | 'financial-settings'
  | 'risk-heat-map' | 'risk-alerts' | 'alert-rules'
  | 'issue-analytics' | 'lessons-learned' | 'time-off'
  | 'settings'

interface NavItem { id: SectionId; icon: any; label: string }
interface NavGroup { header: string; items: NavItem[] }

interface WorkflowStatus {
  id: string; name: string; color: string; isInitial: boolean; isFinal: boolean
}

interface WorkflowFormData {
  name: string; description: string; bindProject: string; templateType: string
  active: boolean; isDefault: boolean; statuses: WorkflowStatus[]
}

interface MorganProject {
  id: string; name: string; code: string; portfolio: string
  priority: string; status: string; value: string | number; progress: number
}
interface MorganTender {
  id: string; name: string; value: string | number; status: string; compliance: number
}

// ── Navigation (matches VeroPM sidebar groups) ─────────────────────────────
const MAIN_NAV: NavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'portfolios', icon: Briefcase, label: 'Tender Management' },
  { id: 'approval-pipeline', icon: ClipboardCheck, label: 'Approval Pipeline' },
  { id: 'projects', icon: FileText, label: 'Projects' },
  { id: 'templates', icon: Layers, label: 'Templates' },
  { id: 'automation', icon: Zap, label: 'Contracts Management' },
  { id: 'tasks', icon: CheckCircle2, label: 'To Do Tracker' },
  { id: 'issues', icon: AlertCircle, label: 'IT Help Desk' },
  { id: 'time-reports', icon: Clock, label: 'Time Reports' },
  { id: 'documents', icon: FolderOpen, label: 'CRM' },
]

const NAV_GROUPS: NavGroup[] = [
  {
    header: 'Resources',
    items: [
      { id: 'resource-requests', icon: UserCheck, label: 'Pending Approvals' },
      { id: 'capacity-planning', icon: BarChart3, label: 'Capacity Planning' },
      { id: 'workload-balancing', icon: Activity, label: 'Workload Balancing' },
      { id: 'time-off', icon: Calendar, label: 'Time-Off Management' },
    ],
  },
  {
    header: 'Financial',
    items: [
      { id: 'budgets', icon: DollarSign, label: 'Budgets' },
      { id: 'expenses', icon: DollarSign, label: 'Expenses' },
      { id: 'financial-reports', icon: BarChart3, label: 'Reports' },
      { id: 'financial-approvals', icon: CheckCircle2, label: 'Approvals' },
      { id: 'financial-settings', icon: Settings, label: 'Settings' },
    ],
  },
  {
    header: 'Risk Management',
    items: [
      { id: 'risks', icon: Shield, label: 'Risk Register' },
      { id: 'risk-heat-map', icon: ThermometerSun, label: 'Heat Map' },
      { id: 'risk-alerts', icon: Bell, label: 'Risk Alerts' },
      { id: 'alert-rules', icon: Shield, label: 'Alert Rules' },
    ],
  },
]

// ── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = ({ active, onChange, userName, userRole }: { active: SectionId; onChange: (s: SectionId) => void; userName?: string; userRole?: string }) => {
  const NavButton = ({ item }: { item: NavItem }) => {
    const isActive = active === item.id
    return (
      <button
        key={item.id}
        onClick={() => onChange(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gov-body transition-all ${
          isActive
            ? 'bg-slate-50 text-slate-900 font-semibold shadow-sm'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
        }`}
      >
        <item.icon className="size-[18px] shrink-0" strokeWidth={1.6} />
        <span className="truncate">{item.label}</span>
      </button>
    )
  }

  return (
    <aside className="w-[220px] bg-white border-r border-slate-100 flex flex-col shrink-0 h-full overflow-hidden">
      {/* Workspace header — Morgan branding */}
      <div className="px-4 py-5 border-b border-slate-100">
        <img src="/morgan-logo.svg" alt="Morgan Consulting Engineers" className="h-9 w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {MAIN_NAV.map(item => <NavButton key={item.id} item={item} />)}

        {NAV_GROUPS.map(group => (
          <div key={group.header} className="pt-4">
            <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{group.header}</div>
            {group.items.map(item => <NavButton key={item.id} item={item} />)}
          </div>
        ))}

        {/* Additional analytics links */}
        <div className="pt-4">
          <button onClick={() => onChange('issue-analytics')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gov-body transition-all ${active === 'issue-analytics' ? 'bg-slate-50 text-slate-900 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
            <BarChart3 className="size-[18px] shrink-0" strokeWidth={1.6} />
            <span className="truncate">Issue Analytics</span>
          </button>
          <button onClick={() => onChange('lessons-learned')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gov-body transition-all ${active === 'lessons-learned' ? 'bg-slate-50 text-slate-900 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
            <Eye className="size-[18px] shrink-0" strokeWidth={1.6} />
            <span className="truncate">Lessons Learned</span>
          </button>
          <button onClick={() => onChange('settings')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gov-body transition-all ${active === 'settings' ? 'bg-slate-50 text-slate-900 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
            <Settings className="size-[18px] shrink-0" strokeWidth={1.6} />
            <span className="truncate">Settings</span>
          </button>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-slate-100 flex items-center gap-3">
        <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold relative">
          {(userName ?? 'MC').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-gov-label text-slate-900 truncate">{userName ?? 'MCE Admin'}</span>
          <span className="text-caption text-slate-400">{userRole ?? 'Admin'}</span>
        </div>
      </div>
    </aside>
  )
}

// ── View Components (lazy) ──────────────────────────────────────────────
const DashboardView = dynamic(() => import('@/components/views/DashboardView'), { ssr: false })
const PortfoliosView = dynamic(() => import('@/components/views/PortfoliosView'), { ssr: false })
const TendersKanbanView = dynamic(() => import('@/components/views/TendersKanbanView'), { ssr: false })
const ProjectsView = dynamic(() => import('@/components/views/ProjectsView'), { ssr: false })
const TemplatesView = dynamic(() => import('@/components/views/TemplatesView'), { ssr: false })
const WorkflowsView = dynamic(() => import('@/components/views/WorkflowsView'), { ssr: false })
const AutomationView = dynamic(() => import('@/components/views/AutomationView'), { ssr: false })
const TasksView = dynamic(() => import('@/components/views/TasksView'), { ssr: false })
const IssuesView = dynamic(() => import('@/components/views/IssuesView'), { ssr: false })
const TimeReportsView = dynamic(() => import('@/components/views/TimeReportsView'), { ssr: false })
const DocumentsView = dynamic(() => import('@/components/views/DocumentsView'), { ssr: false })
const TimesheetsView = dynamic(() => import('@/components/views/TimesheetsView'), { ssr: false })
const RisksView = dynamic(() => import('@/components/views/RisksView'), { ssr: false })
const MilestonesView = dynamic(() => import('@/components/views/MilestonesView'), { ssr: false })
const DocumentApprovalView = dynamic(() => import('@/components/views/DocumentApprovalView'), { ssr: false })
const ResourceRequestsView = dynamic(() => import('@/components/views/ResourceRequestsView'), { ssr: false })
const CapacityPlanningView = dynamic(() => import('@/components/views/CapacityPlanningView'), { ssr: false })
const WorkloadBalancingView = dynamic(() => import('@/components/views/WorkloadBalancingView'), { ssr: false })
const BudgetsView = dynamic(() => import('@/components/views/BudgetsView'), { ssr: false })
const ExpensesView = dynamic(() => import('@/components/views/ExpensesView'), { ssr: false })
const FinancialReportsView = dynamic(() => import('@/components/views/FinancialReportsView'), { ssr: false })
const FinancialApprovalsView = dynamic(() => import('@/components/views/FinancialApprovalsView'), { ssr: false })
const FinancialSettingsView = dynamic(() => import('@/components/views/FinancialSettingsView'), { ssr: false })
const RiskHeatMapView = dynamic(() => import('@/components/views/RiskHeatMapView'), { ssr: false })
const RiskAlertsView = dynamic(() => import('@/components/views/RiskAlertsView'), { ssr: false })
const AlertRulesView = dynamic(() => import('@/components/views/AlertRulesView'), { ssr: false })
const IssueAnalyticsView = dynamic(() => import('@/components/views/IssueAnalyticsView'), { ssr: false })
const LessonsLearnedView = dynamic(() => import('@/components/views/LessonsLearnedView'), { ssr: false })
const SettingsView = dynamic(() => import('@/components/views/SettingsView'), { ssr: false })
const TimeOffView = dynamic(() => import('@/components/views/TimeOffView'), { ssr: false })
// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
function VeroPMDashboard() {
  const { user } = useUser()
  const clerkUserName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'MCE User' : undefined
  const clerkUserRole = (user?.publicMetadata?.role as string) ?? undefined
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showTenderForm, setShowTenderForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<MorganProject | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null)
  const showToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // Data — start empty, load from API (no stale backbone mock fallback)
  const [projects, setProjects] = useState<MorganProject[]>([])
  const [tenders, setTenders] = useState<MorganTender[]>([])
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [automationAlerts, setAutomationAlerts] = useState<any[]>([])
  const [automationLoading, setAutomationLoading] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        fetch('/api/morgan/projects', { cache: 'no-store' }),
        fetch('/api/morgan/tenders', { cache: 'no-store' }),
      ])
      if (pRes.ok) { const d = await pRes.json(); if (Array.isArray(d)) setProjects(d) }
      else showToast('Failed to load projects')
      if (tRes.ok) { const d = await tRes.json(); if (Array.isArray(d)) setTenders(d) }
      else showToast('Failed to load tenders')
    } catch {
      showToast('Network error — could not reach server')
    }
  }, [showToast])

  const loadAutomation = useCallback(async () => {
    try {
      setAutomationLoading(true)
      const res = await fetch('/api/morgan/automation', { cache: 'no-store' })
      if (!res.ok) throw new Error('fail')
      const payload = await res.json()
      setAutomationRules(Array.isArray(payload.rules) ? payload.rules : [])
      setAutomationAlerts(Array.isArray(payload.alerts) ? payload.alerts : [])
    } catch {
      setAutomationRules([])
    } finally {
      setAutomationLoading(false)
    }
  }, [])

  const ackAlert = useCallback(async (alertId: string) => {
    await fetch(`/api/morgan/automation/alerts/${encodeURIComponent(alertId)}/ack`, { method: 'POST' })
    void loadAutomation()
  }, [loadAutomation])

  useEffect(() => {
    setMounted(true)
    void loadData()
    void loadAutomation()
  }, [loadData, loadAutomation])

  if (!mounted) return <div className="min-h-screen bg-bg-layer" />

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardView projects={projects} tenders={tenders} onNavigate={setActiveSection} />
      case 'portfolios': return <PortfoliosView projects={projects} />
      case 'tenders': return <TendersKanbanView tenders={tenders} onCreate={() => setShowTenderForm(true)} onDelete={async (id) => { await fetch(`/api/morgan/tenders/${id}`, {method:'DELETE'}); setTenders(prev => prev.filter(t => t.id !== id)) }} />
      case 'projects': return <ProjectsView projects={projects} onCreate={() => setShowProjectForm(true)} onSelect={p => setSelectedProject(p)} onNavigateTemplates={() => setActiveSection('templates')} />
      case 'templates': return <TemplatesView />
      case 'workflows': return <WorkflowsView projects={projects} />
      case 'automation': return <AutomationView rules={automationRules} alerts={automationAlerts} loading={automationLoading} onRefresh={() => void loadAutomation()} onAck={id => void ackAlert(id)} />
      case 'tasks': return <TasksView />
      case 'issues': return <IssuesView />
      case 'risks': return <RisksView projects={projects} />
      case 'milestones': return <MilestonesView projects={projects} />
      case 'time-reports': return <TimeReportsView />
      case 'documents': return <DocumentsView />
      case 'timesheets': return <TimesheetsView />
      case 'approval-pipeline': return <DocumentApprovalView />
      case 'resource-requests': return <ResourceRequestsView />
      case 'capacity-planning': return <CapacityPlanningView />
      case 'workload-balancing': return <WorkloadBalancingView />
      case 'budgets': return <BudgetsView />
      case 'expenses': return <ExpensesView />
      case 'financial-reports': return <FinancialReportsView />
      case 'financial-approvals': return <FinancialApprovalsView />
      case 'financial-settings': return <FinancialSettingsView />
      case 'risk-heat-map': return <RiskHeatMapView />
      case 'risk-alerts': return <RiskAlertsView />
      case 'alert-rules': return <AlertRulesView />
      case 'issue-analytics': return <IssueAnalyticsView />
      case 'lessons-learned': return <LessonsLearnedView />
      case 'time-off': return <TimeOffView />
      case 'settings': return <SettingsView />
      default: return <DashboardView projects={projects} tenders={tenders} onNavigate={setActiveSection} />
    }
  }

  return (
    <div className="flex h-screen bg-bg-layer overflow-hidden font-sans text-slate-900 selection:bg-blue-100">
      <Sidebar active={activeSection} onChange={setActiveSection} userName={clerkUserName} userRole={clerkUserRole} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-2 text-gov-body text-slate-400">
            <span>Morgan</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-900 font-semibold capitalize">{activeSection.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { const el = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]'); if (el) { el.scrollIntoView({behavior:'smooth',block:'center'}); el.focus() } }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors" title="Focus search"><Search className="size-5" /></button>
            <button onClick={() => setActiveSection('automation')} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors relative" title="Notifications">
              <Bell className="size-5" />
              {automationAlerts.length > 0 && <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white" />}
            </button>
            <button onClick={() => setActiveSection('workflows')} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors" title="Settings & Workflows"><Settings className="size-5" /></button>
            <div className="w-px h-6 bg-slate-100 mx-1" />
            {(['tenders', 'projects', 'dashboard', 'portfolios'] as const).includes(activeSection as any) && (
              <ActionBtn onClick={() => {
                switch (activeSection) {
                  case 'tenders': setShowTenderForm(true); break
                  default: setShowProjectForm(true)
                }
              }}>
                <Plus className="size-4" /> {activeSection === 'tenders' ? 'New Tender' : 'New Project'}
              </ActionBtn>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Form Modals */}
      <AnimatePresence>
        {showProjectForm && <ProjectForm onClose={() => setShowProjectForm(false)} onSuccess={() => { setShowProjectForm(false); void loadData() }} />}
        {showTenderForm && <TenderForm onClose={() => setShowTenderForm(false)} onSuccess={() => { setShowTenderForm(false); void loadData() }} />}
      </AnimatePresence>

      {/* Project Detail Slide-over */}
      <AnimatePresence>
        {selectedProject && <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-gov-body font-semibold flex items-center gap-2 ${
              toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-2 p-0.5 hover:bg-white/50 rounded"><X className="size-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function RootPage() {
  return (
    <StyleProvider>
      <VeroPMDashboard />
    </StyleProvider>
  )
}
