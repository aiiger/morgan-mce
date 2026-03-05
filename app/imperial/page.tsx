"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Search,
    Bell,
    Settings,
    LayoutDashboard,
    Briefcase,
    FileText,
    Users,
    BarChart3,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Zap,
    Download,
    RefreshCw,
    MoreVertical,
    Activity,
    Workflow as WorkflowIcon,
    Terminal,
    Globe,
    Cpu,
    Fingerprint
} from 'lucide-react'

// DATA WIRING - Correct relative paths
import { defaultAutomations, type AutomationRule } from '../../lib/imperial/automation'
import { portfolioData, proposalData, teamData } from '../../lib/imperial/mock-extended'
import { type MorganProject, type MorganTender } from '../../lib/morgan/persistence'
import { ProjectForm } from '../../components/forms/ProjectForm'
import { TenderForm } from '../../components/forms/TenderForm'

// --- MORGAN ELITE DESIGN SYSTEM (LIGHT MODE) ---
// Adhering to DESIGN_GOVERNANCE.md: Inter, no uppercase, 8px grid.

const SidebarItem = ({
    icon: Icon,
    active = false,
    onClick,
    label,
    color = "var(--text-secondary)"
}: {
    icon: any,
    active?: boolean,
    onClick: () => void,
    label: string,
    color?: string
}) => (
    <button
        onClick={onClick}
        title={label}
        className={`p-2 rounded-lg cursor-pointer transition-all duration-200 relative group active:scale-95 ${active
            ? 'bg-slate-50 shadow-sm'
            : 'hover:bg-slate-50'
            }`}
    >
        <Icon
            className="size-5 transition-transform duration-200 group-hover:scale-110"
            style={{ color: active ? color : 'var(--text-tertiary)' }}
            strokeWidth={1.5}
        />
        <span className="absolute left-14 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
            {label}
        </span>
    </button>
)

const Sidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => (
    <aside className="w-[68px] border-r border-slate-100 flex flex-col items-center py-4 gap-1 bg-white shrink-0 overflow-y-auto no-scrollbar">
        {/* Top Branding */}
        <div className="mb-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="size-6 rounded flex items-center justify-center text-[10px] font-bold text-white bg-[var(--brand-accent)]">M</div>
                <ChevronRight className="size-3 text-slate-300" />
            </div>
            <div className="size-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg cursor-pointer hover:scale-105 transition-transform bg-[var(--mce-red)]">M</div>
        </div>

        <SidebarItem
            icon={LayoutDashboard}
            active={activeTab === 'dashboard'}
            onClick={() => onTabChange('dashboard')}
            label="Dashboard"
            color="var(--brand-accent)"
        />
        <SidebarItem
            icon={Briefcase}
            active={activeTab === 'portfolios'}
            onClick={() => onTabChange('portfolios')}
            label="Portfolios"
            color="var(--color-warning)"
        />
        <SidebarItem
            icon={Globe}
            active={activeTab === 'proposals'}
            onClick={() => onTabChange('proposals')}
            label="Proposals"
            color="var(--morgan-teal)"
        />
        <SidebarItem
            icon={FileText}
            active={activeTab === 'projects'}
            onClick={() => onTabChange('projects')}
            label="Projects"
            color="var(--color-success)"
        />
        <SidebarItem
            icon={CheckCircle2}
            active={activeTab === 'tasks'}
            onClick={() => onTabChange('tasks')}
            label="Tasks"
            color="var(--mce-red-accent)"
        />
        <SidebarItem
            icon={Activity}
            active={activeTab === 'activity'}
            onClick={() => onTabChange('activity')}
            label="Activity"
            color="var(--brand-accent)"
        />
        <SidebarItem
            icon={Zap}
            active={activeTab === 'automations'}
            onClick={() => onTabChange('automations')}
            label="Automations"
            color="var(--color-warning)"
        />
        <SidebarItem
            icon={Users}
            active={activeTab === 'team'}
            onClick={() => onTabChange('team')}
            label="Team"
            color="var(--color-success)"
        />

        <div className="w-8 h-[1px] bg-slate-50 my-2" />

        <SidebarItem
            icon={BarChart3}
            active={activeTab === 'reports'}
            onClick={() => onTabChange('reports')}
            label="Reports"
            color="var(--morgan-teal)"
        />
        <SidebarItem
            icon={Terminal}
            active={activeTab === 'system'}
            onClick={() => onTabChange('system')}
            label="System"
            color="var(--text-tertiary)"
        />

        <div className="mt-auto pt-4 flex flex-col gap-2 items-center">
            <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold cursor-pointer hover:ring-2 ring-blue-100 transition-all relative">
                AM
                <div className="absolute bottom-0 right-0 size-2.5 bg-[var(--brand-accent)] border-2 border-white rounded-full"></div>
            </div>
        </div>
    </aside>
)

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => {
    const colorStyles: any = {
        blue: 'bg-[var(--bg-hover)] text-[var(--brand-accent)]',
        green: 'bg-[var(--bg-hover)] text-[var(--color-success)]',
        amber: 'bg-[var(--bg-hover)] text-[var(--color-warning)]',
        purple: 'bg-[var(--bg-hover)] text-[var(--mce-red-accent)]'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-500">{label}</span>
                    <span className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</span>
                </div>
                <div className={`p-2.5 rounded-xl ${colorStyles[color] || colorStyles.blue}`}>
                    <Icon className="size-5" />
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${trend.startsWith('+') ? 'text-[var(--color-success)]' : 'text-slate-400'}`}>{trend}</span>
                    <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
                </div>
            )}
        </motion.div>
    )
}

const ProjectCard = ({ project }: { project: any }) => (
    <motion.div
        layout
        whileHover={{ y: -2 }}
        className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm group hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer"
    >
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
                <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-bold border border-slate-100 group-hover:bg-blue-50 group-hover:text-[var(--brand-accent)] transition-colors">
                    {project.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[var(--brand-accent)] transition-colors">{project.name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono tracking-tighter">{project.code}</span>
                </div>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${project.progress === 100 ? 'bg-emerald-50 text-[var(--color-success)] border-emerald-100' : 'bg-[var(--bg-hover)] text-[var(--brand-accent)] border-slate-100'}`}>
                {project.progress === 100 ? 'Completed' : 'Active'}
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex justify-between items-end text-xs mb-1">
                <span className="text-slate-400 font-medium italic">Focus maturity</span>
                <span className="text-slate-900 font-semibold">{project.progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    className={`h-full ${project.progress === 100 ? 'bg-[var(--color-success)]' : 'bg-[var(--brand-accent)]'}`}
                />
            </div>
            <div className="flex justify-between items-center pt-2">
                <div className="flex -space-x-1.5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="size-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600 shadow-sm">
                            {String.fromCharCode(64 + i)}
                        </div>
                    ))}
                    <div className="size-6 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                        +5
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-800 tracking-tight">{project.value}</span>
                    <span className="text-[10px] text-slate-400">USD</span>
                </div>
            </div>
        </div>
    </motion.div>
)

const WorkflowNode = ({ workflow }: { workflow: AutomationRule }) => (
    <div className="p-4 border border-slate-100 bg-white rounded-xl flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${workflow.active ? 'bg-blue-50 text-[var(--brand-accent)]' : 'bg-slate-50 text-slate-400'}`}>
                {workflow.domain === 'LIABILITY_DLP' ? <Fingerprint className="size-4" /> : <Zap className="size-4" />}
            </div>
            <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-slate-900 group-hover:text-[var(--brand-accent)] transition-colors">{workflow.name}</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-tighter truncate max-w-[220px]">{workflow.description}</span>
                <span className="text-[10px] text-slate-400 mt-1">{workflow.schedule.length} checkpoints • {workflow.domain.replace('_', ' ')}</span>
            </div>
        </div>
        <div className="flex flex-col items-end gap-1">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${workflow.active ? 'text-[var(--color-success)] bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}>
                <div className={`size-1.5 rounded-full ${workflow.active ? 'bg-[var(--color-success)] animate-pulse' : 'bg-slate-300'}`} />
                {workflow.active ? 'ACTIVE' : 'IDLE'}
            </div>
            <span className="text-[10px] text-slate-400">max {workflow.schedule.at(-1)?.escalation ?? 'NONE'}</span>
        </div>
    </div>
)

interface MorganAutomationAlert {
    id: string;
    ruleName: string;
    entityName: string;
    severity: 'INFO' | 'WARN' | 'CRITICAL';
    escalation: string;
    channels: string[];
    daysUntilDue: number;
    label: string;
    ackRequired: boolean;
    acknowledgedAt: string | null;
    owner: string;
}

// --- CLONE COMPONENTS (BASED ON SCREENSHOTS) ---

const PortfolioView = ({ onCreate }: { onCreate: () => void }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-white px-8 py-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portfolios</h2>
                <p className="text-xs text-slate-400">Manage and monitor your project portfolios</p>
            </div>
            <button
                onClick={onCreate}
                className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
                <Plus className="size-4" /> Create Portfolio
            </button>
        </div>

        <div className="flex gap-4 items-center">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[var(--brand-accent)] transition-colors" />
                <input
                    type="text"
                    placeholder="Search portfolios..."
                    className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-[var(--brand-accent)] transition-all"
                />
            </div>
            <div className="flex items-center gap-2">
                <button className="bg-white border border-slate-100 px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2 hover:bg-slate-50">
                    <Activity className="size-4" /> All Status
                </button>
                <button className="bg-white border border-slate-100 px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2 hover:bg-slate-50">
                    <MoreVertical className="size-4 rotate-90" /> Name (A-Z)
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioData.map(p => (
                <div key={p.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-[var(--brand-accent)] rounded-xl group-hover:bg-[var(--brand-accent)] group-hover:text-white transition-colors">
                            <Briefcase className="size-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{p.updatedAt}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-[var(--brand-accent)] transition-colors">{p.name}</h3>
                    <p className="text-xs text-slate-500 mb-6 line-clamp-2">{p.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold tracking-wider">PROJECTS</span>
                            <span className="text-sm font-bold text-slate-900">{p.projectCount}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-400 font-bold tracking-wider">VALUE</span>
                            <span className="text-sm font-bold text-[var(--color-success)]">{p.value}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const ProposalKanban = ({ onCreate }: { onCreate: () => void }) => {
    const stages = [
        { id: 'DRAFT', label: 'Draft', color: 'bg-slate-100 text-slate-600', count: proposalData.filter(p => p.stage === 'DRAFT').length },
        { id: 'SUBMITTED', label: 'Submitted', color: 'bg-blue-50 text-[var(--brand-accent)]', count: proposalData.filter(p => p.stage === 'SUBMITTED').length },
        { id: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-amber-50 text-[var(--color-warning)]', count: proposalData.filter(p => p.stage === 'UNDER_REVIEW').length },
        { id: 'FEASIBILITY', label: 'Feasibility Study', color: 'bg-purple-50 text-[var(--brand-accent)]', count: proposalData.filter(p => p.stage === 'FEASIBILITY').length }
    ]

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white px-8 py-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Proposal Pipeline</h2>
                    <p className="text-xs text-slate-400">Manage and track your proposal lifecycle</p>
                </div>
                <button
                    onClick={onCreate}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95"
                >
                    <Plus className="size-4" /> New Proposal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Proposals" value={proposalData.length} trend="Active" icon={BarChart3} color="blue" />
                <StatCard label="Approved" value="0" trend="0% conversion" icon={CheckCircle2} color="green" />
                <StatCard label="Total Budget" value="$0" trend="$0 average" icon={Zap} color="amber" />
                <StatCard label="ROI" value="0.0%" trend="Avg expected" icon={Activity} color="purple" />
            </div>

            <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col gap-6">
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input type="text" placeholder="Search proposals..." className="w-full bg-slate-50/50 border border-slate-100 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[var(--brand-accent)]" />
                    </div>
                    <button className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2">All Status <ChevronRight className="size-3 rotate-90" /></button>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold">Kanban</button>
                        <button className="px-4 py-1.5 text-slate-400 rounded-lg text-xs font-semibold">List</button>
                        <button className="px-4 py-1.5 text-slate-400 rounded-lg text-xs font-semibold">Analytics</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">
                    {stages.map(stage => (
                        <div key={stage.id} className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <div className={`size-2 rounded-full ${stage.color.split(' ')[0]}`} />
                                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{stage.label}</span>
                                </div>
                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">{stage.count}</span>
                            </div>
                            <div className={`flex-1 rounded-2xl p-4 space-y-4 border border-transparent hover:border-slate-100 transition-colors ${stage.id === 'DRAFT' ? 'bg-slate-50/50' : 'bg-blue-50/20'}`}>
                                {proposalData.filter(p => p.stage === stage.id).map(proposal => (
                                    <motion.div
                                        key={proposal.id}
                                        layoutId={proposal.id}
                                        className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-move group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[var(--brand-accent)] transition-colors">{proposal.title}</h4>
                                            <div className={`p-1 rounded-full ${proposal.priority === 'HIGH' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
                                                <AlertCircle className="size-3" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mb-4">{proposal.client}</p>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                                            <span className="text-[11px] font-bold text-slate-900">{proposal.value}</span>
                                            <div className="flex items-center gap-1">
                                                <Activity className="size-3 text-[var(--color-success)]" />
                                                <span className="text-[10px] font-bold text-[var(--color-success)]">{proposal.roi}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function MorganDashboard() {
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [showProjectForm, setShowProjectForm] = useState(false)
    const [showTenderForm, setShowTenderForm] = useState(false)
    const [automationRules, setAutomationRules] = useState<AutomationRule[]>(defaultAutomations)
    const [automationAlerts, setAutomationAlerts] = useState<MorganAutomationAlert[]>([])
    const [automationLoading, setAutomationLoading] = useState(false)
    const [morganProjects, setMorganProjects] = useState<MorganProject[]>([])
    const [morganTenders, setMorganTenders] = useState<MorganTender[]>([])

    const loadMorganBackbone = async () => {
        try {
            const [projectsResponse, tendersResponse] = await Promise.all([
                fetch('/api/morgan/projects', { cache: 'no-store' }),
                fetch('/api/morgan/tenders', { cache: 'no-store' })
            ])

            if (projectsResponse.ok) {
                const projectsPayload = await projectsResponse.json()
                if (Array.isArray(projectsPayload)) {
                    setMorganProjects(projectsPayload)
                }
            }

            if (tendersResponse.ok) {
                const tendersPayload = await tendersResponse.json()
                if (Array.isArray(tendersPayload)) {
                    setMorganTenders(tendersPayload)
                }
            }
        } catch {
            // keep current state on API failure
        }
    }

    const loadAutomationDashboard = async () => {
        try {
            setAutomationLoading(true)
            const response = await fetch('/api/morgan/automation', { cache: 'no-store' })
            if (!response.ok) {
                throw new Error('Failed to load automation dashboard')
            }

            const payload = await response.json()
            setAutomationRules(Array.isArray(payload.rules) ? payload.rules : defaultAutomations)
            setAutomationAlerts(Array.isArray(payload.alerts) ? payload.alerts : [])
        } catch {
            setAutomationRules(defaultAutomations)
        } finally {
            setAutomationLoading(false)
        }
    }

    const acknowledgeAlert = async (alertId: string) => {
        const response = await fetch(`/api/morgan/automation/alerts/${encodeURIComponent(alertId)}/ack`, {
            method: 'POST'
        })

        if (response.ok) {
            await loadAutomationDashboard()
        }
    }

    useEffect(() => {
        setMounted(true)
        void loadMorganBackbone()
        void loadAutomationDashboard()
    }, [])

    const totalSchedulePoints = automationRules.reduce((sum, rule) => sum + rule.schedule.length, 0)
    const criticalSchedulePoints = automationRules.reduce(
        (sum, rule) => sum + rule.schedule.filter((point) => point.severity === 'CRITICAL').length,
        0
    )
    const unackedCriticalAlerts = automationAlerts.filter((alert) => alert.severity === 'CRITICAL' && !alert.acknowledgedAt).length

    const automationPreview = {
        totalRules: automationRules.length,
        activeRules: automationRules.filter((rule) => rule.active).length,
        totalSchedulePoints,
        criticalSchedulePoints
    }

    if (!mounted) return <div className="min-h-screen bg-slate-50" />

    const renderContent = () => {
        switch (activeTab) {
            case 'portfolios':
                return <PortfolioView onCreate={() => setShowProjectForm(true)} />
            case 'proposals':
                return <ProposalKanban onCreate={() => setShowTenderForm(true)} />
            case 'team':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white px-8 py-4 rounded-2xl border border-slate-100 shadow-sm">
                            <h2 className="text-base font-bold text-slate-900">Neural Team Ops</h2>
                            <button className="text-xs font-semibold text-[var(--brand-accent)] hover:underline flex items-center gap-1 group">
                                <Plus className="size-3" /> Add Member
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamData.map(m => (
                                <div key={m.id} className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="size-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">{m.avatar}</div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900">{m.name}</span>
                                        <span className="text-[11px] text-slate-400">{m.role}</span>
                                    </div>
                                    <div className={`ml-auto px-2 py-0.5 rounded text-[9px] font-bold uppercase ${m.status === 'Available' ? 'bg-emerald-50 text-[var(--color-success)]' : 'bg-slate-50 text-slate-400'}`}>
                                        {m.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case 'projects':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center bg-white px-8 py-5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Projects</h2>
                                <p className="text-xs text-slate-400">{morganProjects.length} projects found.</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-white border border-slate-100 text-slate-900 px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50">
                                    <LayoutDashboard className="size-4" /> Use Template
                                </button>
                                <button onClick={() => setShowProjectForm(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                                    <Plus className="size-4" /> Create Project
                                </button>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-6">
                            <div className="flex gap-4 items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <input type="text" placeholder="Search projects..." className="w-full bg-slate-50/30 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none" />
                                </div>
                                <div className="flex gap-2">
                                    <button className="bg-white border border-slate-100 px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2">All Statuses <ChevronRight className="size-3 rotate-90" /></button>
                                    <button className="bg-white border border-slate-100 px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2">All Priorities <ChevronRight className="size-3 rotate-90" /></button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-blue-50 text-[var(--brand-accent)] rounded-lg text-xs font-bold border border-blue-100 flex items-center gap-2">
                                        <Users className="size-3" /> Unassigned <span className="bg-[var(--brand-accent)] text-white size-4 rounded-full flex items-center justify-center text-[9px]">1</span>
                                    </button>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button className="px-4 py-1.5 bg-white shadow-sm ring-1 ring-slate-100 text-slate-900 rounded-lg text-xs font-semibold flex items-center gap-2"><LayoutDashboard className="size-3" /> Grid View</button>
                                    <button className="px-4 py-1.5 text-slate-400 rounded-lg text-xs font-semibold flex items-center gap-2"><FileText className="size-3" /> List View</button>
                                    <button className="px-4 py-1.5 text-slate-400 rounded-lg text-xs font-semibold flex items-center gap-2"><Briefcase className="size-3" /> By Client</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                {morganProjects.map(p => <ProjectCard key={p.id} project={p} />)}
                            </div>
                        </div>
                    </motion.div>
                )
            case 'automations':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center bg-white px-8 py-4 rounded-2xl border border-slate-100 shadow-sm">
                            <h2 className="text-base font-bold text-slate-900">Automation Engine</h2>
                            <button onClick={() => setShowTenderForm(true)} className="text-xs font-semibold text-[var(--brand-accent)] hover:underline flex items-center gap-1">
                                <Plus className="size-3" /> Create Node
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard label="Rules" value={automationPreview.totalRules} trend="Catalog" icon={WorkflowIcon} color="blue" />
                            <StatCard label="Active Rules" value={automationPreview.activeRules} trend="Enforced" icon={CheckCircle2} color="green" />
                            <StatCard label="Checkpoints" value={automationPreview.totalSchedulePoints} trend="Deterministic" icon={Clock} color="amber" />
                            <StatCard label="Critical Paths" value={automationPreview.criticalSchedulePoints} trend="Escalating" icon={AlertCircle} color="purple" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {automationRules.map(a => <WorkflowNode key={a.id} workflow={a} />)}
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-900">Live Alerts</h3>
                                <button
                                    onClick={() => void loadAutomationDashboard()}
                                    className="text-xs font-semibold text-[var(--brand-accent)] hover:underline"
                                >
                                    Refresh
                                </button>
                            </div>
                            {automationLoading ? (
                                <p className="text-xs text-slate-400">Loading automation signals...</p>
                            ) : automationAlerts.length === 0 ? (
                                <p className="text-xs text-slate-400">No active alerts right now.</p>
                            ) : (
                                <div className="space-y-3">
                                    {automationAlerts.slice(0, 8).map((alert) => (
                                        <div key={alert.id} className="border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-slate-900">{alert.entityName}</p>
                                                <p className="text-[11px] text-slate-500">{alert.label} • {alert.ruleName}</p>
                                                <p className="text-[10px] text-slate-400">{alert.severity} • {alert.escalation} • {alert.channels.join(', ')}</p>
                                            </div>
                                            {alert.ackRequired && !alert.acknowledgedAt ? (
                                                <button
                                                    onClick={() => void acknowledgeAlert(alert.id)}
                                                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-100 bg-emerald-50 text-[var(--color-success)]"
                                                >
                                                    ACK
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400">{alert.acknowledgedAt ? 'ACKED' : 'INFO'}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )
            default:
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Live Projects" value={morganProjects.length} trend="+4.2%" icon={Briefcase} color="blue" />
                            <StatCard label="Open Tenders" value={morganTenders.length} trend="+12" icon={Globe} color="purple" />
                            <StatCard label="Automation Uptime" value="100%" trend="Optimal" icon={Activity} color="green" />
                            <StatCard label="System Alerts" value={unackedCriticalAlerts} icon={AlertCircle} color="amber" />
                        </div>

                        <div className="grid grid-cols-12 gap-10">
                            <div className="col-span-12 lg:col-span-8 space-y-6">
                                <div className="flex justify-between items-center bg-white px-8 py-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-[var(--brand-accent)] rounded-lg">
                                            <LayoutDashboard className="size-4" />
                                        </div>
                                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Active Clusters</h2>
                                    </div>
                                    <button onClick={() => setActiveTab('projects')} className="text-xs font-semibold text-[var(--brand-accent)] hover:underline flex items-center gap-1 group">
                                        View Portfolio <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {morganProjects.slice(0, 4).map(project => (
                                        <ProjectCard key={project.id} project={project} />
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-4 space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full min-h-[450px]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-sm font-bold text-slate-900">Automation Hub</h2>
                                        <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 cursor-pointer">
                                            <MoreVertical className="size-4" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                                        {automationRules.slice(0, 5).map(workflow => (
                                            <WorkflowNode key={workflow.id} workflow={workflow} />
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setActiveTab('automations')}
                                        className="mt-6 w-full border border-dashed border-slate-200 p-4 rounded-xl text-xs font-semibold text-slate-400 hover:border-blue-300 hover:text-[var(--brand-accent)] transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Plus className="size-3 group-hover:scale-125 transition-transform" />
                                        Manage All Nodes
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
                            {[
                                { label: 'Total Portfolio Value', value: '$840M', icon: BarChart3, highlight: true },
                                { label: 'Risk Indices', value: 'Low (2.4%)', icon: AlertCircle, highlight: false },
                                { label: 'System Efficiency', value: '98.8%', icon: Terminal, highlight: false },
                                { label: 'Monthly Operational Burn', value: '$142K', icon: Zap, highlight: false },
                            ].map((kpi, idx) => (
                                <div key={idx} className={`p-6 rounded-2xl shadow-sm border ${kpi.highlight ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} flex items-center justify-between group h-full`}>
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-bold mb-1 tracking-wider ${kpi.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.label}</span>
                                        <span className={`text-xl font-semibold tracking-tight ${kpi.highlight ? 'text-white' : 'text-slate-900'}`}>{kpi.value}</span>
                                    </div>
                                    <div className={`p-2.5 rounded-lg ${kpi.highlight ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                        <kpi.icon className="size-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )
        }
    }

    return (
        <div className="flex h-screen bg-[var(--bg-base)] overflow-hidden font-sans selection:bg-blue-100 text-slate-900">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shadow-sm z-10 shrink-0">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                            {activeTab === 'dashboard' ? 'Morgan Nexus' : activeTab}
                        </h1>
                        <p className="text-sm text-slate-400">Enterprise AI Orchestration active.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 mr-6 border-r border-slate-100 pr-6">
                            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                                <Search className="size-5" />
                            </button>
                            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                                <RefreshCw className="size-5" />
                            </button>
                            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors relative">
                                <Bell className="size-5" />
                                <span className="absolute top-2 right-2 size-2 bg-[var(--color-critical)] rounded-full border-2 border-white"></span>
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                if (activeTab === 'projects' || activeTab === 'portfolios') setShowProjectForm(true);
                                else if (activeTab === 'proposals') setShowTenderForm(true);
                                else setShowProjectForm(true);
                            }}
                            className="bg-[var(--brand-accent)] hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Plus className="size-4" /> Action
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    {renderContent()}
                </main>
            </div>

            {/* FORM MODALS */}
            <AnimatePresence>
                {showProjectForm && <ProjectForm onClose={() => setShowProjectForm(false)} onSuccess={() => setShowProjectForm(false)} />}
                {showTenderForm && <TenderForm onClose={() => setShowTenderForm(false)} onSuccess={() => setShowTenderForm(false)} />}
            </AnimatePresence>
        </div>
    )
}
