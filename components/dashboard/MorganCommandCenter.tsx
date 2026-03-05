'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Search, Activity, ShieldAlert, TrendingUp, 
  Clock, ArrowRight, Command, Database, Zap, Lock, 
  ChevronRight, Circle, LayoutGrid, List, DollarSign,
  AlertTriangle, Briefcase, Building2, CheckCircle2, FileText, X, Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { KPIMetric, Project, Tender, Alert } from '../../types';

import { TaskKanbanView } from '../tasks/TaskKanbanView';
import { CalendarPage } from '../pages/CalendarPage';

interface MorganCommandCenterProps {
  kpis: KPIMetric[];
  projects: Project[];
  tenders: Tender[];
  tasks: any[];
  alerts: Alert[];
  onSearch: (query: string) => void;
  onNavigate: (view: string) => void;
   onProjectUpdate?: (id: string, patch: Partial<Project>) => Promise<void>;
   onProjectDelete?: (id: string) => Promise<void>;
   onTenderUpdate?: (id: string, patch: Partial<Tender>) => Promise<void>;
   onTenderDelete?: (id: string) => Promise<void>;
   onTaskAdd?: (status: string) => void;
   onTaskClick?: (task: any) => void;
  onSelectProject?: (id: string) => void;
  user?: { name: string; role: string };
  agentActivity?: any[];
  auditLogs?: any[];
}

type ViewMode = 'command' | 'projects' | 'tenders' | 'risk' | 'financials' | 'reports' | 'tasks' | 'calendar' | 'strategic' | 'documents' | 'agents' | 'integrations';

/**
 * Component: The Morgan Whisper (Strategic Insight Bar)
 */
const MorganWhisper = ({ context }: { context: string }) => {
  const text = context === 'risk' ? "Anomaly detected in Zone B. Direct intervention required for portfolio integrity." :
    context === 'financials' ? "Cashflow velocity exceeds Q1 projections by 12%. Recommending capital reallocation." :
    context === 'agents' ? "Neural mesh performing at 99.2% precision. All agents active." :
    context === 'simulation' ? "War Game Active: Simulating 15% material cost spike. Adjusting capital reserves..." :
    "System operating within nominal parameters. 3 new opportunities detected in pipeline.";

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, filter: 'blur(10px)' }} 
      animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }} 
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-7xl mx-auto mb-6 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-2.5 bg-[var(--bg-surface)] border border-[var(--brand-accent)]/20 rounded-full w-fit shadow-[0_0_20px_rgba(81,162,168,0.15)] backdrop-blur-md">
        <div className="relative">
           <div className="w-2 h-2 rounded-full bg-[var(--brand-accent)] animate-pulse" />
           <div className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--brand-accent)] animate-ping opacity-50" />
        </div>
        <span className="text-caption font-bold tracking-widest text-[var(--brand-accent)]">Mr. Morgan:</span>
        <span className="text-gov-label font-medium text-[var(--text-primary)] tracking-wide font-mono">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, staggerChildren: 0.02 }}
          >
            {text.split('').map((char, i) => (
              <motion.span 
                key={i} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.1, delay: i * 0.01 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </span>
      </div>
    </motion.div>
  );
};

/**
 * Component: Tactical Bottom Dock (Mobile-First)
 */
const TacticalDock = ({ 
  currentMode, 
  onNavigate 
}: { 
  currentMode: ViewMode, 
  onNavigate: (v: string) => void 
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm lg:hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-[var(--bg-surface)]/80 backdrop-blur-xl border border-[var(--surface-border)] rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
        <button 
          onClick={() => onNavigate('projects')}
          className={cn("p-2 rounded-full transition-all", currentMode === 'projects' ? "text-[var(--brand-accent)] bg-[var(--brand-accent)]/10" : "text-[var(--text-tertiary)]")}
        >
          <Building2 size={20} />
        </button>
        
        <button 
          onClick={() => onNavigate('command')}
          className={cn("p-3 rounded-full transition-all scale-110", currentMode === 'command' ? "bg-[var(--brand-accent)] text-white shadow-glow" : "bg-[var(--bg-hover)] text-[var(--text-secondary)]")}
        >
          <span className="font-oswald font-bold italic text-lg">M.</span>
        </button>

        <button 
          onClick={() => onNavigate('strategic')}
          className={cn("p-2 rounded-full transition-all", currentMode === 'strategic' ? "text-[var(--brand-accent)] bg-[var(--brand-accent)]/10" : "text-[var(--text-tertiary)]")}
        >
          <Activity size={20} />
        </button>
      </div>
    </div>
  );
};

/**
 * Morgan Command Line - The conversational core
 */
const CommandLine = ({ 
  onSearch, 
  onInternalNavigate,
  currentMode 
}: { 
  onSearch: (q: string) => void, 
  onInternalNavigate: (v: string) => void,
  currentMode: ViewMode
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  const placeholders = [
    "Type 'strategic' for cockpit...",
    "Type 'tasks' for mission control...",
    "Type 'calendar' for timeline...",
    "Type 'reports' for executive briefs...",
    "Show critical project nodes..."
  ];

  const navMap: Record<string, string> = {
    'projects': 'projects',
    'project': 'projects',
    'portfolio': 'projects',
    'registry': 'projects',
    'tenders': 'tenders',
    'tender': 'tenders',
    'bids': 'tenders',
    'pipeline': 'tenders',
    'risk': 'risk',
    'hazards': 'risk',
    'hazard': 'risk',
    'governance': 'risk',
    'financials': 'financials',
    'financial': 'financials',
    'money': 'financials',
    'cashflow': 'financials',
    'ledger': 'financials',
    'revenue': 'financials',
    'reports': 'reports',
    'report': 'reports',
    'briefs': 'reports',
    'analysis': 'reports',
    'tasks': 'tasks',
    'task': 'tasks',
    'todo': 'tasks',
    'matrix': 'tasks',
    'calendar': 'calendar',
    'schedule': 'calendar',
    'timeline': 'calendar',
    'strategic': 'strategic',
    'stategic': 'strategic',
    'cockpit': 'strategic',
    'documents': 'documents',
    'document': 'documents',
    'vault': 'documents',
    'files': 'documents',
    'agents': 'agents',
    'bots': 'agents',
    'integrations': 'integrations',
    'mesh': 'integrations',
    'command': 'command',
    'home': 'command',
    'dashboard': 'command'
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const executeAction = () => {
    const q = query.toLowerCase().trim();
    if (!q) return;

    if (navMap[q]) {
      onInternalNavigate(navMap[q]);
      setQuery('');
      return;
    }

    onSearch(query);
    setQuery('');
  };

  return (
    <div className={cn(
      "relative w-full mx-auto group transition-all duration-500",
      currentMode === 'command' ? "max-w-2xl" : "max-w-4xl"
    )}>
      {/* Glow Effect */}
      <div className={cn(
        "absolute -inset-1 rounded-xl bg-gradient-to-r from-[var(--brand-accent)]/20 via-[var(--brand-accent)]/10 to-[var(--brand-accent)]/20 blur-xl transition-opacity duration-1000",
        isFocused ? "opacity-100" : "opacity-30"
      )} />

      {/* Input Surface */}
      <div className={cn(
        "relative flex items-center gap-4 px-6 py-4 rounded-xl bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--surface-border)] transition-all duration-300 shadow-lg",
        isFocused ? "border-[var(--brand-accent)]/50 shadow-[0_0_30px_-5px_rgba(81,162,168,0.2)]" : "hover:border-[var(--brand-accent)]/20"
      )}>
        <Terminal size={20} className={cn("transition-colors", isFocused ? "text-[var(--brand-accent)]" : "text-[var(--text-tertiary)]")} />
        
        <div className="flex-1 relative h-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                executeAction();
              }
            }}
            placeholder=" "
            className="absolute inset-0 w-full bg-transparent border-none outline-none text-lg font-mono text-[var(--text-primary)] placeholder-transparent z-10"
            autoFocus
          />
          
          <AnimatePresence mode="wait">
            {!query && (
              <motion.span
                key={placeholderIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.4, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center text-lg font-mono text-[var(--text-tertiary)] pointer-events-none select-none"
              >
                <span className="mr-2 text-[var(--brand-accent)] opacity-50">$_</span>
                {placeholders[placeholderIndex]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
           {query && navMap[query.toLowerCase().trim()] && (
            <Badge variant="outline" className="text-gov-label bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] border-[var(--brand-accent)]/20 animate-pulse">
              SWITCH TO {navMap[query.toLowerCase().trim()].toUpperCase()}
            </Badge>
          )}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-hover)] border border-[var(--surface-border)] text-caption font-mono text-[var(--text-tertiary)]">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Micro-View: Projects
 */
const ProjectsView = ({
   projects,
   onUpdate,
   onDelete,
}: {
   projects: Project[];
   onUpdate?: (id: string, patch: Partial<Project>) => Promise<void>;
   onDelete?: (id: string) => Promise<void>;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
    className="w-full max-w-7xl mx-auto"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <div key={p.id} className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--surface-border)] hover:border-[var(--brand-accent)]/30 transition-all group shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-[var(--brand-accent)]" />
              <span className="text-caption font-mono text-[var(--text-tertiary)] uppercase">{p.project_code || 'PRJ-000'}</span>
            </div>
            <Badge variant="outline" className={cn(
              "text-gov-label border-none",
              p.delivery_risk_rating === 'Critical' ? "text-[var(--mce-red)] bg-[var(--mce-red)]/10" : "text-emerald-600 bg-emerald-500/10"
            )}>
              {p.delivery_risk_rating || 'NOMINAL'}
            </Badge>
          </div>
          <h4 className="text-sm font-bold font-oswald text-[var(--text-primary)] mb-1 truncate">{p.project_name}</h4>
          <p className="text-xs text-[var(--text-secondary)] mb-4">{p.client_name}</p>
          
          <div className="flex items-center justify-between pt-3 border-t border-[var(--surface-border)]">
             <div className="flex flex-col">
                <span className="text-gov-label text-[var(--text-tertiary)] uppercase tracking-wider">Completion</span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">{p.project_completion_date_planned || 'TBD'}</span>
             </div>
                   <div className="flex items-center gap-2">
                        <button
                           type="button"
                           onClick={() => onUpdate?.(p.id, { delivery_risk_rating: p.delivery_risk_rating === 'Critical' ? 'Low' : 'Critical' })}
                           className="px-2 py-1 rounded bg-[var(--bg-hover)] text-caption font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                           Toggle Risk
                        </button>
                        <button
                           type="button"
                           onClick={() => onDelete?.(p.id)}
                           className="px-2 py-1 rounded bg-[var(--mce-red)]/10 text-caption font-semibold text-[var(--mce-red)]"
                        >
                           Delete
                        </button>
                        <div className="h-1.5 w-16 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                           <div className="h-full bg-[var(--brand-accent)] w-[65%]" />
                        </div>
             </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

/**
 * Micro-View: Tenders
 */
const TendersView = ({
   tenders,
   onUpdate,
   onDelete,
}: {
   tenders: Tender[];
   onUpdate?: (id: string, patch: Partial<Tender>) => Promise<void>;
   onDelete?: (id: string) => Promise<void>;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
    className="w-full max-w-7xl mx-auto"
  >
    <div className="grid grid-cols-1 gap-3">
      {tenders.map((t) => (
        <div key={t.id} className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--surface-border)] hover:bg-[var(--bg-hover)] transition-all shadow-sm">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-8 h-8 rounded bg-[var(--bg-hover)] flex items-center justify-center text-[var(--brand-accent)]">
               <Briefcase size={14} />
            </div>
            <div className="min-w-0">
               <h4 className="text-sm font-bold font-oswald text-[var(--text-primary)] truncate">{t.title}</h4>
               <p className="text-xs text-[var(--text-tertiary)]">{t.client || 'Unknown Client'} • REF_{t.id.slice(0,4)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8 shrink-0">
             <div className="text-right hidden sm:block">
                <div className="text-sm font-mono font-bold text-[var(--text-primary)]">AED {(t.value ? t.value / 1000000 : 0).toFixed(1)}M</div>
                <div className="text-gov-label text-[var(--text-tertiary)] uppercase tracking-wider">Valuation</div>
             </div>
             <button
                type="button"
                onClick={() => onUpdate?.(t.id, { probability: t.probability === 'High' ? 'Medium' : 'High' })}
                className="px-2 py-1 rounded bg-[var(--bg-hover)] text-caption font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
             >
                Boost Prob
             </button>
             <button
                type="button"
                onClick={() => onDelete?.(t.id)}
                className="px-2 py-1 rounded bg-[var(--mce-red)]/10 text-caption font-semibold text-[var(--mce-red)]"
             >
                Delete
             </button>
             <Badge variant="outline" className={cn(
                "w-24 justify-center text-gov-label py-1 border-[var(--surface-border)] bg-[var(--bg-hover)]",
                t.probability === 'High' ? "text-emerald-600" : "text-amber-600"
             )}>
                {t.probability || 'MEDIUM'} PROB
             </Badge>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

/**
 * Micro-View: Risk
 */
const RiskView = ({ projects, alerts }: { projects: Project[], alerts: Alert[] }) => {
   const critical = projects.filter(p => p.delivery_risk_rating === 'Critical');
   return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <div className="space-y-4">
         <h3 className="text-lg font-bold font-oswald text-[var(--mce-red)] flex items-center gap-2">
            <ShieldAlert size={18} /> Critical Hazards
         </h3>
         {critical.length > 0 ? critical.map(p => (
            <div key={p.id} className="p-6 rounded-lg bg-[var(--mce-red)]/5 border border-[var(--mce-red)]/20 flex justify-between items-center shadow-sm">
               <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{p.project_name}</h4>
                  <p className="text-xs text-[var(--mce-red)] mt-1 font-medium">Delivery Timeline Breach imminent.</p>
               </div>
               <Badge variant="danger">ACTION REQ</Badge>
            </div>
         )) : (
            <div className="p-8 border border-dashed border-[var(--surface-border)] rounded-lg text-center text-[var(--text-tertiary)] text-sm">
               No critical project hazards detected.
            </div>
         )}
      </div>

      <div className="space-y-4">
         <h3 className="text-lg font-bold font-oswald text-[var(--text-primary)] flex items-center gap-2">
            <Activity size={18} className="text-[var(--brand-accent)]" /> Active Signals
         </h3>
         <div className="space-y-2">
            {alerts.slice(0,5).map((a, i) => (
               <div key={i} className="flex gap-3 p-3 rounded bg-[var(--bg-surface)] border border-[var(--surface-border)] shadow-sm">
                  <div className={cn("w-1.5 rounded-full", a.priority === 'critical' ? 'bg-[var(--mce-red)]' : 'bg-amber-500')} />
                  <div>
                     <p className="text-xs font-bold text-[var(--text-primary)]">{a.title}</p>
                     <p className="text-caption text-[var(--text-tertiary)] mt-0.5">{a.timestamp}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </motion.div>
   );
};

/**
 * Micro-View: Financials (Fiscal Command)
 */
const FinancialsView = ({ kpis }: { kpis: KPIMetric[] }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
    className="w-full max-w-7xl mx-auto"
  >
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {kpis.filter(k => k.isCurrency).length > 0 ? (
           kpis.filter(k => k.isCurrency).map((k, i) => (
              <div key={i} className="p-10 rounded-2xl bg-[var(--bg-surface)] border border-[var(--surface-border)] flex flex-col relative overflow-hidden group shadow-2xl transition-all hover:border-[var(--brand-accent)]/40">
                 {/* Sparkline Momentum Mockup */}
                 <div className="absolute bottom-0 left-0 w-full h-24 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <svg className="w-full h-full" preserveAspectRatio="none">
                       <path d="M0 80 Q 50 20, 100 60 T 200 40 T 300 70 T 400 30" fill="none" stroke="var(--brand-accent)" strokeWidth="3" />
                    </svg>
                 </div>

                 <span className="text-caption font-bold uppercase tracking-[0.3em] text-[var(--text-tertiary)] mb-6 italic">Fiscal_Intelligence_Node_{i + 1}</span>
                 
                 <div className="mb-2">
                    <span className="text-xs font-bold text-[var(--brand-accent)] uppercase tracking-widest">{k.label}</span>
                 </div>

                 <span className="text-6xl font-bold italic font-oswald text-[var(--text-primary)] mb-4 tracking-tighter">
                    <span className="text-xl align-top opacity-40 font-sans mr-1 not-italic">AED</span>
                    {k.value}
                 </span>

                 <div className={cn(
                    "mt-auto inline-flex items-center w-fit gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-inner transition-all",
                    k.trendSentiment === 'positive' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-[var(--mce-red)]/10 text-[var(--mce-red)] border border-[var(--mce-red)]/20"
                 )}>
                    {k.trend} <Zap size={10} className="animate-pulse" /> MOMENTUM
                 </div>
              </div>
           ))
        ) : (
           <div className="col-span-3 p-20 text-center rounded-2xl border border-dashed border-[var(--surface-border)] bg-[var(--bg-surface)]/50 backdrop-blur-md">
              <DollarSign size={48} className="mx-auto text-[var(--text-tertiary)] mb-4 opacity-20" />
              <h3 className="text-xl font-bold italic text-[var(--text-secondary)] uppercase">Fiscal Stream Unavailable</h3>
              <p className="text-sm text-[var(--text-tertiary)] mt-2 italic">Reconnect the neural ledger to synchronize transaction nodes.</p>
           </div>
        )}
     </div>
  </motion.div>
);

/**
 * Micro-View: Agents (Neural Mesh)
 */
const AgentsView = ({ activity }: { activity?: any[] }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
    className="w-full max-w-7xl mx-auto space-y-8"
  >
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
           { id: 'P1', name: 'Contract Extractor', model: 'Sonnet 4.5', color: 'emerald' },
           { id: 'P5', name: 'Risk Compliance', model: 'Sonnet 4.5', color: 'blue' },
           { id: 'P9', name: 'Knowledge Core', model: 'Gemini 1.5', color: 'var(--brand-accent)' },
           { id: 'S1', name: 'Security Guard', model: 'RLS-Engine', color: 'rose' },
        ].map((agent, i) => (
           <div key={i} className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--surface-border)] shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Zap size={64} style={{ color: agent.color }} />
              </div>
              <div className="flex justify-between items-start mb-6">
                 <div className="w-10 h-10 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center border border-[var(--surface-border)]">
                    <Bot size={20} style={{ color: agent.color }} />
                 </div>
                 <Badge variant="outline" className="text-caption font-mono">{agent.model}</Badge>
              </div>
              <h4 className="text-lg font-bold font-oswald text-[var(--text-primary)] mb-1">[{agent.id}] {agent.name}</h4>
              <p className="text-caption font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-6 text-left">Status: Standby</p>
              
              <div className="space-y-2">
                 <div className="flex justify-between text-caption font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                    <span>Cognitive_Load</span>
                    <span>12%</span>
                 </div>
                 <div className="h-1 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[12%]" />
                 </div>
              </div>
           </div>
        ))}
     </div>
  </motion.div>
);

/**
 * Micro-View: Integrations (Mesh Sync)
 */
const IntegrationsView = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
    className="w-full max-w-7xl mx-auto"
  >
     <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--surface-border)] overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-[var(--surface-border)] bg-[var(--bg-hover)]/30 flex justify-between items-center">
           <h3 className="text-xl font-bold font-oswald text-[var(--text-primary)]">System_Integrations</h3>
           <Badge variant="outline" className="text-gov-label bg-emerald-500/10 text-emerald-500 border-none">9 Nodes Connected</Badge>
        </div>
        <div className="divide-y divide-[var(--surface-border)]">
           {[
              { name: 'Supabase Registry', type: 'Database', status: 'Linked' },
              { name: 'Clerk Identity', type: 'Auth', status: 'Linked' },
              { name: 'Gemini Neural Gateway', type: 'AI', status: 'Linked' },
              { name: 'Anthropic Reasoning', type: 'AI', status: 'Linked' }
           ].map((int, i) => (
              <div key={i} className="px-10 py-6 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors group">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center border border-[var(--surface-border)] text-[var(--brand-accent)] shadow-inner">
                       <Zap size={20} />
                    </div>
                    <div>
                       <div className="text-lg font-bold font-oswald italic text-[var(--text-primary)] uppercase">{int.name}</div>
                       <div className="text-caption font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{int.type} • 12ms Latency</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-xs font-bold text-emerald-500 tracking-widest">{int.status}</span>
                 </div>
              </div>
           ))}
        </div>
     </div>
  </motion.div>
);

/**
 * Micro-View: Strategic (Executive Cockpit)
 */
const StrategicView = ({ projects, kpis }: { projects: Project[], kpis: KPIMetric[] }) => {
  const [simIntensity, setSimIntensity] = useState(0);
  const isSimulating = simIntensity > 0;

  return (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
    className="w-full max-w-7xl mx-auto space-y-8"
  >
     {isSimulating && <MorganWhisper context="simulation" />}

     {/* Cutting Edge: Neural Strategic Map & Liquid Portfolio Gauge */}
     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Interconnected Intelligence Map */}
        <div className="lg:col-span-7 p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--surface-border)] shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
           <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-bold font-oswald text-[var(--text-primary)]">
                 {isSimulating ? <span className="text-[var(--mce-red)] animate-pulse">WAR_GAME_ACTIVE</span> : "Neural_Strategic_Mesh"}
              </h3>
              <Badge variant="outline" className={cn("text-gov-label border-none animate-pulse", isSimulating ? "bg-[var(--mce-red)]/10 text-[var(--mce-red)]" : "bg-emerald-500/10 text-emerald-500")}>
                 {isSimulating ? "SIMULATION_MODE" : "Live_Sync_Active"}
              </Badge>
           </div>
           
           {/* Mock Neural Graph Visualization */}
           <div className="flex-1 relative flex items-center justify-center">
              <div className={cn("absolute inset-0 opacity-20 blur-3xl transition-colors duration-500", isSimulating ? "bg-[radial-gradient(circle_at_center,_var(--mce-red)_0%,_transparent_70%)]" : "bg-[radial-gradient(circle_at_center,_var(--brand-accent)_0%,_transparent_70%)]")} />
              <div className="relative w-full h-full flex items-center justify-center">
                 {/* Visual Nodes */}
                 {[
                    { t: 'Portfolio', x: '50%', y: '50%', s: 80, c: isSimulating ? 'var(--mce-red)' : 'var(--brand-accent)' },
                    { t: 'Risk', x: '20%', y: '30%', s: 40, c: isSimulating ? 'var(--mce-red)' : 'var(--mce-red)' },
                    { t: 'Capital', x: '80%', y: '40%', s: 50, c: isSimulating ? 'var(--color-warning)' : 'emerald' },
                    { t: 'Velocity', x: '30%', y: '75%', s: 45, c: 'amber' },
                    { t: 'Compliance', x: '75%', y: '80%', s: 35, c: 'blue' }
                 ].map((n, i) => (
                    <motion.div
                       key={i}
                       animate={{ 
                          y: [0, -10, 0],
                          scale: isSimulating ? [1, 1.1, 1] : [1, 1.05, 1],
                          x: isSimulating ? [0, Math.random() * 5 - 2.5, 0] : 0 
                       }}
                       transition={{ 
                          duration: isSimulating ? 0.2 : 4 + i, 
                          repeat: Infinity,
                          ease: "easeInOut"
                       }}
                       className="absolute flex flex-col items-center gap-2 group cursor-pointer"
                       style={{ left: n.x, top: n.y }}
                    >
                       <div className="relative">
                          <div className="absolute -inset-2 rounded-full blur-md opacity-20 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: n.c }} />
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-xl relative z-10" style={{ backgroundColor: n.c }} />
                       </div>
                       <span className="text-gov-label font-bold uppercase tracking-widest text-[var(--text-primary)] opacity-40 group-hover:opacity-100 transition-opacity">{n.t}</span>
                    </motion.div>
                 ))}
                 
                 {/* Connection Lines (SVGs) */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                    <defs>
                       <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={isSimulating ? "var(--mce-red)" : "white"} stopOpacity="0" />
                          <stop offset="50%" stopColor={isSimulating ? "var(--mce-red)" : "white"} stopOpacity="1" />
                          <stop offset="100%" stopColor={isSimulating ? "var(--mce-red)" : "white"} stopOpacity="0" />
                       </linearGradient>
                    </defs>
                    
                    {/* Animated Lines */}
                    {[
                       { x1: "50%", y1: "50%", x2: "20%", y2: "30%" },
                       { x1: "50%", y1: "50%", x2: "80%", y2: "40%" },
                       { x1: "50%", y1: "50%", x2: "30%", y2: "75%" },
                       { x1: "50%", y1: "50%", x2: "75%", y2: "80%" }
                    ].map((line, i) => (
                       <g key={i}>
                          <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={isSimulating ? "var(--mce-red)" : "var(--surface-border)"} strokeWidth="1" />
                          {isSimulating && (
                             <circle r="2" fill="var(--mce-red)">
                                <animateMotion dur={`${1 + i * 0.5}s`} repeatCount="indefinite" path={`M${parseFloat(line.x1) * 5} ${parseFloat(line.y1) * 5} L${parseFloat(line.x2) * 5} ${parseFloat(line.y2) * 5}`} /> 
                                {/* Note: SVG path coords are tricky in relative units, simplified pulse for reliability */}
                                <animate attributeName="opacity" values="0;1;0" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                             </circle>
                          )}
                       </g>
                    ))}
                 </svg>
              </div>
           </div>
           
           {/* Simulation Control Interface */}
           <div className="pt-6 border-t border-[var(--surface-border)] relative z-10 flex items-center gap-6">
              <div className="flex-1">
                 <div className="flex justify-between text-caption font-bold uppercase tracking-widest mb-2">
                    <span className="text-[var(--text-tertiary)]">Market Shock Simulation</span>
                    <span className={isSimulating ? "text-[var(--mce-red)]" : "text-[var(--brand-accent)]"}>{simIntensity}% Stress</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" max="100" 
                    value={simIntensity} 
                    onChange={(e) => setSimIntensity(Number(e.target.value))}
                    className="w-full h-1.5 bg-[var(--bg-hover)] rounded-lg appearance-none cursor-pointer accent-[var(--brand-accent)]"
                 />
              </div>
              <div className="text-right">
                 <div className="text-gov-label font-mono text-[var(--text-tertiary)]">PREDICTIVE_IMPACT</div>
                 <div className={cn("text-xl font-bold font-oswald italic", isSimulating ? "text-[var(--mce-red)]" : "text-[var(--text-primary)]")}>
                    AED -{(simIntensity * 0.4).toFixed(1)}M
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Portfolio Saturation Gauge */}
        <div className="lg:col-span-5 flex flex-col gap-8">
           <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--surface-border)] relative overflow-hidden group shadow-2xl flex-1">
              <h3 className="text-xl font-bold font-oswald text-[var(--text-primary)] mb-8">Saturation_Engine</h3>
              
              <div className="flex flex-col items-center gap-10">
                 <div className="relative w-56 h-56 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-[var(--bg-hover)]" />
                       <circle cx="112" cy="112" r="100" stroke={isSimulating ? "var(--mce-red)" : "var(--brand-accent)"} strokeWidth="16" fill="transparent" strokeDasharray="628" strokeDashoffset={120 + (simIntensity * 2)} className={cn("drop-shadow-[0_0_12px_var(--brand-accent)] transition-all duration-500", isSimulating && "drop-shadow-[0_0_20px_var(--mce-red)]")} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className={cn("text-5xl font-bold italic font-oswald transition-colors duration-300", isSimulating ? "text-[var(--mce-red)]" : "text-[var(--text-primary)]")}>
                          {82 - Math.floor(simIntensity / 3)}%
                       </span>
                       <span className="text-caption font-bold uppercase text-[var(--text-tertiary)] tracking-widest">Efficiency</span>
                    </div>
                 </div>
                 
                 <div className="w-full space-y-5">
                    {[
                       { label: 'Resource Utilization', val: 94 - Math.floor(simIntensity / 4), c: 'var(--brand-accent)' },
                       { label: 'Capital Velocity', val: 78 - Math.floor(simIntensity / 2), c: 'emerald' },
                       { label: 'Strategic Alignment', val: 88 - Math.floor(simIntensity / 5), c: 'blue' }
                    ].map((s, i) => (
                       <div key={i}>
                          <div className="flex justify-between text-xs font-bold uppercase mb-2">
                             <span className="text-[var(--text-tertiary)]">{s.label}</span>
                             <span style={{ color: isSimulating && s.val < 70 ? 'var(--mce-red)' : s.c }}>{s.val}%</span>
                          </div>
                          <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden shadow-inner">
                             <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${s.val}%` }} 
                                transition={{ duration: 0.5 }}
                                className="h-full" 
                                style={{ backgroundColor: isSimulating && s.val < 70 ? 'var(--mce-red)' : s.c }} 
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
     </div>
  </motion.div>
  );
};

/**
 * Micro-View: Tasks (Mission Control)
 */
const TasksView = ({
   tasks,
   onAddTask,
   onTaskClick,
}: {
   tasks: any[];
   onAddTask?: (status: string) => void;
   onTaskClick?: (task: any) => void;
}) => (
  <div className="w-full max-w-7xl mx-auto">
     <TaskKanbanView 
        tasks={tasks} 
            onAddTask={(s) => onAddTask?.(s)} 
            onTaskClick={(t) => onTaskClick?.(t)} 
     />
  </div>
);

/**
 * Micro-View: Calendar (Temporal Matrix)
 */
const CalendarView = ({ tasks, projects, onSelectProject }: { tasks: any[], projects: Project[], onSelectProject?: (id: string) => void }) => (
  <div className="w-full max-w-7xl mx-auto h-full min-h-[600px]">
     <CalendarPage 
        tasks={tasks} 
        projects={projects} 
        onSelectProject={onSelectProject}
     />
  </div>
);

/**
 * Micro-View: Reports (Apple-Grade)
 */
const ReportsView = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
    className="w-full max-w-7xl mx-auto space-y-12"
  >
     {/* Cutting Edge: Profile Selectors */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
           { title: 'Executive Brief', desc: 'High-level portfolio performance and strategic risk summary.', icon: ShieldAlert, status: '98% SYNC', color: 'var(--brand-accent)' },
           { title: 'Standard Pulse', desc: 'Operational health, project velocity, and delivery metrics.', icon: Activity, status: 'NOMINAL', color: 'emerald' },
           { title: 'Depth Analysis', desc: 'Granular project-by-project financial and technical audit.', icon: Database, status: 'SECURE', color: 'amber' },
           { title: 'Audit Ledger', desc: 'Deterministic calculation logs and system integrity verification.', icon: Lock, status: 'LOCKED', color: 'rose' }
        ].map((profile, i) => (
           <div key={i} className="group relative p-10 rounded-2xl bg-[var(--bg-surface)] border border-[var(--surface-border)] hover:border-[var(--brand-accent)]/40 transition-all duration-700 shadow-2xl overflow-hidden cursor-pointer">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-accent)]/5 blur-[100px] group-hover:bg-[var(--brand-accent)]/15 transition-all duration-700" />
              
              <div className="flex items-start justify-between mb-12">
                 <div className="w-20 h-20 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center border border-[var(--surface-border)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700 shadow-inner">
                    <profile.icon size={32} className="text-[var(--brand-accent)]" />
                 </div>
                 <div className="flex flex-col items-end">
                    <Badge variant="outline" className="text-xs px-4 py-1.5 border-[var(--surface-border)] bg-[var(--bg-hover)]/50 font-mono tracking-[0.2em] mb-3">{profile.status}</Badge>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                       <span className="text-gov-label font-bold text-[var(--text-tertiary)] uppercase tracking-[0.3em]">LOCKED_ON</span>
                    </div>
                 </div>
              </div>

              <h3 className="text-4xl font-bold font-oswald text-[var(--text-primary)] mb-5 tracking-tighter">{profile.title}</h3>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-sm font-medium opacity-80">{profile.desc}</p>
              
              <div className="mt-16 flex items-center gap-8">
                 <button className="flex items-center gap-4 px-10 py-4 rounded-full bg-[var(--brand-accent)] text-white text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 hover:shadow-[0_0_30px_rgba(81,162,168,0.5)] transition-all">
                    GENERATE_INTEL <ArrowRight size={16} />
                 </button>
                 <div className="flex-1 h-px bg-[var(--surface-border)] opacity-30" />
                 <div className="text-caption font-mono text-[var(--text-tertiary)] uppercase tracking-widest">TEMPORAL_ID: 2026_04_A</div>
              </div>
           </div>
        ))}
     </div>


     {/* Cutting Edge: Ledger Health Gauge */}
     <div className="p-12 rounded-2xl bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-hover)] border border-[var(--surface-border)] shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--brand-accent)]/40 to-transparent" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
           <div className="max-w-xl">
              <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-[var(--brand-accent)]/10 border border-[var(--brand-accent)]/20 text-caption font-bold uppercase tracking-[0.3em] text-[var(--brand-accent)] mb-6">
                 <Lock size={12} /> Deterministic_Security_Core
              </div>
              <h4 className="text-3xl font-bold font-oswald text-[var(--text-primary)] mb-6 tracking-tight">Integrity_Pulse_v2.4</h4>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed font-medium opacity-90">
                 Every ledger posting is cross-verified against real-time field telemetry and contractual obligations. The Morgan neural mesh ensures 100% calculation fidelity with zero drift tolerance.
              </p>
           </div>
           <div className="flex items-center gap-20">
              {[
                 { l: 'Ledger Precision', v: '100%' },
                 { l: 'Handshake_TTL', v: '240ms' },
                 { l: 'Trust Score', v: 'AAA+' }
              ].map((m, i) => (
                 <div key={i} className="text-center group">
                    <div className="text-5xl font-bold italic font-oswald text-[var(--brand-accent)] mb-3 group-hover:scale-110 transition-transform">{m.v}</div>
                    <div className="text-caption font-bold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">{m.l}</div>
                 </div>
              ))}
           </div>
        </div>
     </div>
  </motion.div>
);

/**
 * Micro-View: Documents (Intelligence Vault)
 */
const DocumentsView = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
    className="w-full max-w-7xl mx-auto space-y-8"
  >
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
           { label: 'Contract Vault', count: '142 Files', icon: Lock },
           { label: 'Technical Spec', count: '89 Files', icon: Database },
           { label: 'Financial Record', count: '214 Files', icon: DollarSign }
        ].map((c, i) => (
           <div key={i} className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--surface-border)] shadow-xl group hover:border-[var(--brand-accent)]/30 transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center text-[var(--brand-accent)] shadow-inner">
                    <c.icon size={20} />
                 </div>
                 <div>
                    <div className="text-lg font-bold font-oswald italic text-[var(--text-primary)] uppercase">{c.label}</div>
                    <div className="text-caption font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{c.count}</div>
                 </div>
              </div>
           </div>
        ))}
     </div>

     <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--surface-border)] overflow-hidden shadow-2xl">
        <div className="px-8 py-4 border-b border-[var(--surface-border)] bg-[var(--bg-hover)]/30 flex justify-between items-center">
           <span className="text-caption font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] italic">Temporal_Registry_Sync</span>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gov-label font-bold text-[var(--text-tertiary)] uppercase">Live_Updates_Active</span>
           </div>
        </div>
        <div className="divide-y divide-[var(--surface-border)]">
           {[1,2,3,4,5,6].map(i => (
              <div key={i} className="px-8 py-4 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-bg-surface border border-gray-200 flex items-center justify-center text-[var(--text-tertiary)] group-hover:text-[var(--brand-accent)] transition-colors">
                       <FileText size={18} />
                    </div>
                    <div>
                       <div className="text-sm font-bold text-[var(--text-primary)]">MCE_Structural_Audit_v{i}.04.pdf</div>
                       <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-[var(--text-tertiary)] font-mono uppercase">2.4MB • PDF</span>
                          <span className="text-xs px-1.5 rounded bg-emerald-500/10 text-emerald-500 font-bold uppercase">Verified</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-8">
                    <div className="text-right">
                       <div className="text-caption font-bold text-[var(--text-primary)]">04 FEB 2026</div>
                       <div className="text-caption text-[var(--text-tertiary)] uppercase tracking-tighter">Last Modified</div>
                    </div>
                    <ArrowRight size={16} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                 </div>
              </div>
           ))}
        </div>
     </div>
  </motion.div>
);

class ErrorBoundary extends React.Component<{ children: React.ReactNode, onReset: () => void }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode, onReset: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--mce-red)]/20 shadow-2xl">
           <div className="w-16 h-16 rounded-full bg-[var(--mce-red)]/10 flex items-center justify-center mb-6 animate-pulse">
              <AlertTriangle size={32} className="text-[var(--mce-red)]" />
           </div>
           <h3 className="text-2xl font-bold font-oswald text-[var(--text-primary)] mb-2">System Malfunction</h3>
           <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-8 font-medium">
              The Nexus Core encountered an unrecoverable error. Diagnostics have been logged.
           </p>
           <button 
              onClick={() => {
                 this.setState({ hasError: false });
                 this.props.onReset();
              }}
              className="px-8 py-3 rounded-xl bg-[var(--brand-accent)] text-white text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-glow"
           >
              Reboot System
           </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const MorganCommandCenter: React.FC<MorganCommandCenterProps & { initialView?: ViewMode }> = ({
   kpis,
   projects,
   tenders,
   tasks,
   alerts,
   onSearch,
   onNavigate,
   onProjectUpdate,
   onProjectDelete,
   onTenderUpdate,
   onTenderDelete,
   onTaskAdd,
   onTaskClick,
   onSelectProject,
   user,
   initialView = 'command',
   agentActivity,
   auditLogs
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);

  // Sync state if initialView changes (from sidebar clicks)
  useEffect(() => {
    if (initialView) setViewMode(initialView);
  }, [initialView]);

  // Handle Internal vs External Navigation
  const handleInternalNavigate = (view: string) => {
    if (['projects', 'tenders', 'risk', 'financials', 'reports', 'tasks', 'calendar', 'strategic', 'documents', 'agents', 'integrations', 'command'].includes(view)) {
      setViewMode(view as ViewMode);
      
      // SYNC PARENT SIDEBAR (Reverse Mapping)
      const sidebarId = 
        view === 'risk' ? 'liability' : 
        view === 'command' ? 'dashboard' : 
        view === 'strategic' ? 'cockpit' : 
        view === 'agents' ? 'agents' :
        view === 'integrations' ? 'integrations' :
        view;
      
      onNavigate(sidebarId);
    } else {
      onNavigate(view); // Delegate to AppShell for other pages
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden selection:bg-[var(--brand-accent)]/30 flex flex-col font-sans">
      
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={cn(
           "absolute top-0 left-1/2 -translate-x-1/2 bg-[var(--brand-accent)]/5 rounded-full mix-blend-screen transition-all duration-1000 ease-in-out",
           viewMode === 'command' ? "w-[1000px] h-[600px] blur-[120px]" : "w-[1400px] h-[300px] blur-[80px] -top-20"
        )} />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col">
        
        {/* MOBILE DOCK */}
        <TacticalDock currentMode={viewMode} onNavigate={handleInternalNavigate} />

        {/* DYNAMIC HEADER / HERO */}
        <section className={cn(
           "flex flex-col items-center text-center relative transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
           viewMode === 'command' ? "min-h-[55vh] justify-center pt-20" : "min-h-[25vh] justify-end pb-8 pt-8"
        )}>
          
          {/* Identity Apex */}
          <motion.div 
             layout
             className={cn("flex flex-col items-center mb-10 transition-all duration-500", viewMode !== 'command' && "scale-75 origin-bottom")}
          >
            {/* The Branded Apex */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2"
            >
              <span className="text-6xl md:text-8xl font-bold font-oswald italic text-[var(--text-primary)] tracking-tighter select-none drop-shadow-[0_0_15px_rgba(81,162,168,0.25)]">
                Morgan<span className="text-[var(--mce-red)]">.</span>
              </span>
            </motion.div>

            {viewMode === 'command' && (
              <motion.h1 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-bold tracking-tighter font-oswald text-[var(--text-primary)] mb-4"
              >
                Designing Excellence
              </motion.h1>
            )}
            
            {viewMode !== 'command' && (
               <motion.h2
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-3xl font-bold tracking-tighter font-oswald text-[var(--text-primary)] mb-4"
               >
                  {viewMode === 'strategic' ? 'STRATEGIC COMMAND' : viewMode === 'integrations' ? 'MESH SYNC' : viewMode.toUpperCase() + ' COMMAND'}
               </motion.h2>
            )}

            {/* System Status Badge - Relocated Under Heading */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--surface-border)] text-caption font-mono uppercase tracking-[0.2em] text-[var(--brand-accent)] shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span onClick={() => setViewMode('command')} className="cursor-pointer hover:text-[var(--text-primary)] transition-colors font-bold italic">
                BETA RELEASE V1.0
              </span>
            </div>
          </motion.div>

          {/* THE CORE: Command Line */}
          <motion.div layout className="w-full z-20 px-6">
            <CommandLine 
               onSearch={onSearch} 
               onInternalNavigate={handleInternalNavigate} 
               currentMode={viewMode}
            />
          </motion.div>

        </section>

        {/* DYNAMIC CONTENT SURFACE */}
        <main className="flex-1 px-6 pb-20 relative min-h-[500px]">
           <ErrorBoundary onReset={() => setViewMode('command')}>
             <AnimatePresence mode="wait">
                {viewMode === 'command' && (
                   <motion.div 
                      key="command"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full max-w-7xl mx-auto space-y-12"
                   >
                      {/* Metrics Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {kpis.slice(0, 4).map((m, i) => (
                            <div key={i} className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--surface-border)] hover:border-[var(--brand-accent)]/30 transition-all text-center group shadow-sm">
                               <div className="text-caption font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">{m.label}</div>
                               <div className="text-3xl font-bold italic font-oswald text-[var(--text-primary)]">{m.value}</div>
                               {m.trend && (
                                  <div className={cn("text-gov-label font-bold mt-1", m.trendSentiment === 'positive' ? 'text-emerald-500' : 'text-amber-500')}>
                                     {m.trend}
                                  </div>
                               )}
                            </div>
                         ))}
                      </div>
                      
                      {/* Live Feed Preview */}
                      <div className="border-t border-[var(--surface-border)] pt-8 text-center">
                         <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-6">Recent Intelligence</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alerts.slice(0, 3).map((a, i) => (
                               <div key={i} className="text-left p-3 rounded border border-[var(--surface-border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] cursor-pointer shadow-sm" onClick={() => handleInternalNavigate('risk')}>
                                  <div className="flex items-center gap-2 mb-1">
                                     <div className={cn("w-1.5 h-1.5 rounded-full", a.priority === 'critical' ? "bg-[var(--mce-red)]" : "bg-[var(--brand-accent)]")} />
                                     <span className="text-gov-label font-mono text-[var(--text-tertiary)]">{a.timestamp}</span>
                                  </div>
                                  <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2">{a.title}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                   </motion.div>
                )}

                {/* Inject Whisper for operational views */}
                {viewMode !== 'command' && <MorganWhisper context={viewMode} />}

                {viewMode === 'projects' && <ProjectsView key="projects" projects={projects} onUpdate={onProjectUpdate} onDelete={onProjectDelete} />}
                {viewMode === 'tenders' && <TendersView key="tenders" tenders={tenders} onUpdate={onTenderUpdate} onDelete={onTenderDelete} />}
                {viewMode === 'risk' && <RiskView key="risk" projects={projects} alerts={alerts} />}
                {viewMode === 'financials' && <FinancialsView key="financials" kpis={kpis} />}
                {viewMode === 'reports' && <ReportsView key="reports" />}
                {viewMode === 'tasks' && <TasksView key="tasks" tasks={tasks} onAddTask={onTaskAdd} onTaskClick={onTaskClick} />}
                {viewMode === 'calendar' && <CalendarView key="calendar" tasks={tasks} projects={projects} onSelectProject={onSelectProject} />}
                {viewMode === 'strategic' && <StrategicView key="strategic" projects={projects} kpis={kpis} />}
                {viewMode === 'documents' && <DocumentsView key="documents" />}
                {viewMode === 'agents' && <AgentsView key="agents" activity={agentActivity} />}
                {viewMode === 'integrations' && <IntegrationsView key="integrations" />}

             </AnimatePresence>
           </ErrorBoundary>
        </main>

      </div>
    </div>
  );
};

export default MorganCommandCenter;