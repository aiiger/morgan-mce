import React, { useState, useMemo } from 'react';
import { Download, Plus, Building2, List, GanttChartSquare, Zap, Search, Filter } from 'lucide-react';
import { DashboardFrame } from '../governance/DashboardFrame';

import { TabNav } from '../governance/TabNav';
import { GovernanceTable } from '../governance/GovernanceTable';
import { ProjectForm } from '../forms/ProjectForm';
import { safeExportToCSV } from '../../utils/exportUtils';
import { ProjectTimeline } from '../projects/ProjectTimeline';
import { GlassButton } from '../ui/GlassButton';
import { CommandPalette } from '../ui/CommandPalette';
import { DriftBadge } from '../projects/DriftBadge';
import { EmptyState } from '../ui/EmptyState';
import { RiskPulse } from '../projects/RiskPulse';
import { logger } from '../../lib/logger';
import { useToast } from '@/lib/toast-context';
import { cn } from '../../lib/utils';

import { Box, Text } from '../primitives';
import { StatusBadge } from '../ui/StatusBadge';

interface ProjectsPageProps {
  projects: any[];
  onSelectProject: (id: string) => void;
  onRefresh: () => void;
  searchQuery?: string;
  onNavigate?: (view: string) => void;
  loading?: boolean;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onSelectProject,
  onRefresh,
  onNavigate,
  loading = false
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const toast = useToast();

  const sortedProjects = useMemo(() => {
    const filtered = projects.filter(p => {
      const status = (p.project_status || p.PROJECT_STATUS || '').toUpperCase();
      let matchesTab = true;
      if (activeTab === 'ONGOING') matchesTab = status.includes('CONSTRUCTION') || status.includes('ONGOING') || status.includes('ACTIVE');
      if (activeTab === 'COMPLETED') matchesTab = status.includes('COMPLETED') || status.includes('DLP');
      if (activeTab === 'UPCOMING') matchesTab = status.includes('TENDER') || status.includes('PRE-AWARD') || status.includes('AWAITING') || status.includes('UPCOMING');
      if (!matchesTab) return false;

      if (localSearchQuery) {
        const query = localSearchQuery.toLowerCase();
        const matchesName = (p.project_name || p.PROJECT_NAME || '').toLowerCase().includes(query);
        const matchesClient = (p.client_name || p.CLIENT_NAME || '').toLowerCase().includes(query);
        const matchesCode = (p.project_code || p.PROJECT_CODE || '').toLowerCase().includes(query);
        if (!matchesName && !matchesClient && !matchesCode) return false;
      }
      return true;
    });

    logger.debug('PROJECTS_SORT_AND_FILTER', { count: filtered.length });

    return [...filtered].sort((a, b) => {
      const dateA_str = a.project_completion_date_planned || a.PROJECT_COMPLETION_DATE_PLANNED;
      const dateB_str = b.project_completion_date_planned || b.PROJECT_COMPLETION_DATE_PLANNED;
      const dateA = dateA_str ? new Date(dateA_str).getTime() : Infinity;
      const dateB = dateB_str ? new Date(dateB_str).getTime() : Infinity;
      return dateA - dateB;
    });
  }, [projects, activeTab, localSearchQuery]);





  const columns = [
    {
      header: 'IDENTITY',
      width: '25%',
      accessor: (p: any) => {
        const isFocus = (p.project_name || p.PROJECT_NAME || '').toUpperCase().includes('MAJALIS');
        return (
          <Box className="flex items-center gap-3">
            <div className="shrink-0">
              {p.project_logo_url ? (
                <img src={p.project_logo_url} alt="Logo" className="w-8 h-8 rounded object-cover border border-gray-200" />
              ) : (
                <Box className={cn(
                  "w-8 h-8 flex items-center justify-center rounded",
                  isFocus ? "text-[var(--color-critical)] bg-[var(--color-critical)]/10" : "text-[var(--text-tertiary)] bg-gray-50"
                )}>
                  <Building2 size={15} strokeWidth={1.5} />
                </Box>
              )}
            </div>
            <Box className="min-w-0 flex flex-col gap-0.5">
              <Text className={cn(
                "font-medium text-sm truncate tracking-tight",
                isFocus ? "text-red-500" : "text-[var(--text-primary)]"
              )}>
                {p.project_name || p.PROJECT_NAME}
              </Text>
              <Text className="text-gov-label font-normal text-[var(--text-secondary)] uppercase opacity-100 italic">
                {p.client_name || p.CLIENT_NAME || 'MCE INTERNAL'}
              </Text>
            </Box>
          </Box>
        )
      }
    },
    {
      header: 'PORTFOLIO',
      width: '12%',
      accessor: (p: any) => (
        <Text className="text-xs font-mono text-gray-500 uppercase tracking-tighter">
          {p.portfolio || 'GENERAL'}
        </Text>
      )
    },
    {
      header: 'PRIORITY',
      width: '10%',
      accessor: (p: any) => {
        const priority = p.project_priority || 'Medium';
        const colorClass =
          priority === 'Critical' ? 'text-rose-500 bg-rose-500/10' :
            priority === 'High' ? 'text-amber-500 bg-amber-500/10' :
              priority === 'Medium' ? 'text-emerald-500 bg-emerald-500/10' :
                'text-gray-500 bg-gray-100';

        return (
          <span className={cn("px-2 py-0.5 rounded text-caption font-bold uppercase tracking-widest border border-gray-100", colorClass)}>
            {priority}
          </span>
        )
      }
    },
    {
      header: 'TYPE',
      width: '10%',
      accessor: (p: any) => (
        <Text className="text-gov-label font-medium text-gray-500 uppercase">
          {p.project_type || 'AGILE'}
        </Text>
      )
    },
    {
      header: 'PULSE',
      width: '13%',
      accessor: (p: any) => (
        <Box className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
          <Text className="text-emerald-500/80 font-mono text-gov-label uppercase">
            Nodes OK
          </Text>
        </Box>
      )
    },
    {
      header: 'TEMPORAL',
      width: '15%',
      accessor: (p: any) => {
        const date = (p.project_completion_date_planned || p.PROJECT_COMPLETION_DATE_PLANNED || '').split('T')[0];
        const drift = Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const isMajorDrift = drift < -300;

        return (
          <Box className="flex flex-col items-start gap-0.5">
            <Text className="text-[var(--text-primary)] font-semibold text-gov-body">
              {date || 'UNSET'}
            </Text>
            {isMajorDrift && (
              <span className="text-gov-label font-bold text-rose-500/80 uppercase tracking-tighter">
                DRIFT_DETECTED
              </span>
            )}
          </Box>
        )
      }
    },
    {
      header: 'SATURATION',
      width: '15%',
      accessor: (p: any) => {
        const progress = p.completion_percent || p.COMPLETION_PERCENT || 0;
        const status = (p.project_status || p.PROJECT_STATUS || '').toUpperCase();
        let barColor = 'bg-emerald-500';
        if (progress <= 25) barColor = 'bg-rose-500';
        else if (progress <= 50) barColor = 'bg-amber-500';
        else if (progress <= 75) barColor = 'bg-blue-500';

        return (
          <Box className="flex flex-col gap-1 w-full pr-4">
            <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
              <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <Text className="text-caption text-gray-500 uppercase font-bold tracking-tighter">
                {status || 'ACTIVE'}
              </Text>
              <Text className="text-caption text-gray-500 font-mono">
                {progress}%
              </Text>
            </div>
          </Box>
        );
      }
    }
  ];

  return (
    <DashboardFrame
      title="Operational Workspace"
      loading={loading}
      tabs={<div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <CommandPalette
          projects={projects}
          onNavigate={onNavigate}
          onSelectProject={onSelectProject}
        />

        <TabNav
          tabs={[
            { id: 'ALL', label: 'All Records' },
            { id: 'ONGOING', label: 'Active nodes' },
            { id: 'COMPLETED', label: 'Finalized' },
            { id: 'UPCOMING', label: 'Pipeline' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="category"
          className="text-gov-body font-medium text-[var(--color-text-secondary)]"
        />

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={14} />
            <input
              type="text"
              placeholder="REGISTRY QUERY (⌘K)..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-caption font-mono text-gray-700 w-48 focus:outline-none focus:border-blue-300 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-gray-200 text-gray-900' : 'text-gray-500'}`}>
              <List size={14} />
            </button>
            <button onClick={() => setViewMode('timeline')} className={`p-1.5 rounded transition-all ${viewMode === 'timeline' ? 'bg-gray-200 text-gray-900' : 'text-gray-500'}`}>
              <GanttChartSquare size={14} />
            </button>
          </div>

          <button onClick={() => safeExportToCSV(sortedProjects, 'MCE_Ledger')} className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
            <Download size={16} />
          </button>

          <button
            onClick={async () => {
              try {
                logger.info('RAG_SYNC_TRIGGERED');
                const res = await fetch('/api/rag/ingest-all', { method: 'POST' });
                const data = await res.json().catch(() => null);

                if (res.status === 410) {
                  const readyRes = await fetch('/api/ai/ready').catch(() => null);
                  const ready = !!readyRes && readyRes.ok;
                  toast.info(
                    'RAG Indexing Managed Externally',
                    ready
                      ? 'AI Gateway is online; indexing runs via its worker.'
                      : 'AI Gateway not reachable; check AI_GATEWAY_URL.'
                  );
                  return;
                }

                if (!res.ok) {
                  const message = data?.error?.message || data?.error || 'RAG sync failed.';
                  throw new Error(message);
                }

                const synced = data?.details?.synced ?? data?.synced ?? 'unknown';
                toast.success('RAG Sync Complete', `${synced} projects indexed into vault.`);
              } catch (e) {
                logger.error('RAG_SYNC_FAILED', e as Error);
                toast.error("RAG Sync Failed", "Intelligence Core synchronization interrupted.");
              }
            }}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="Sync RAG Data"
          >
            <Zap size={16} />
          </button>

          <GlassButton onClick={() => setIsFormOpen(true)} className="px-6 py-2 rounded-lg text-gov-label font-bold tracking-widest">
            <Plus size={14} className="mr-2" /> Initialize node
          </GlassButton>
        </div>
      </div>
      }
    >
      {isFormOpen && <ProjectForm onClose={() => setIsFormOpen(false)} onSuccess={onRefresh} />}

      {viewMode === 'list' ? (
        <div className="flex flex-col h-full bg-white">

          <div className="px-6 py-3 border-b border-gray-200 !bg-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-emerald-500 animate-pulse" />
              <span className="text-caption font-mono text-gray-500">{sortedProjects.length} Verified records synced</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {sortedProjects.length > 0 ? (
              <GovernanceTable
                data={sortedProjects}
                columns={columns}
                headerClassName="bg-[var(--morgan-teal)] backdrop-blur-md shadow-sm"
                rowClassName={(p) => {
                  const baseClass = "registry-row border-b border-[var(--color-border)] bg-[var(--surface-registry)] hover:bg-[var(--bg-hover)] transition-colors";
                  const name = (p.project_name || p.PROJECT_NAME || '').toUpperCase();
                  if (name.includes('SSMC STAFF PARKING') || name.includes('AL GHURAIR')) {
                                return `${baseClass} shadow-[0_0_15px_rgba(239,81,70,0.35)] border border-[var(--color-critical)]/40 z-10 my-1 rounded-lg bg-[var(--color-critical)]/5`;
                  }
                  return baseClass;
                }}
                onRowClick={(p) => {
                  logger.debug('PROJECT_SELECTED', { id: p.id });
                  onSelectProject(p.id);
                }}
              />
            ) : (
              <div className="p-12">
                <EmptyState
                  icon={Building2}
                  title="No Nodes Detected"
                  description="The registry query returned zero active records. Adjust your filters or initialize a new node."
                  action={{
                    label: "Initialize Node",
                    onClick: () => setIsFormOpen(true)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6">
          <ProjectTimeline
            projectStartDate={projects.length > 0 ? projects.reduce((min, p) => new Date(p.project_start_date) < min ? new Date(p.project_start_date) : min, new Date()).toISOString().split('T')[0] : "2026-01-01"}
            projectEndDate={projects.length > 0 ? projects.reduce((max, p) => new Date(p.project_completion_date_planned) > max ? new Date(p.project_completion_date_planned) : max, new Date(0)).toISOString().split('T')[0] : "2026-12-31"}
            milestones={
              projects.flatMap(p => p.milestones?.map((m: any) => ({ ...m, status: m.status || 'Pending' })) || [])
            }
          />
        </div>
      )}
    </DashboardFrame>
  );
};

