import React, { useState, useMemo } from 'react';
import { Plus, Search, Target, LayoutGrid, List, TrendingUp, Zap } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { MetricBlock } from '../governance/MetricBlock';
import { DashboardFrame } from '../governance/DashboardFrame';
import { GovernanceTable } from '../governance/GovernanceTable';
import { TenderForm } from '../forms/TenderForm';
import { TenderKanban } from '../tenders/TenderKanban';
import { TenderIntakeWizard } from '../tenders/TenderIntakeWizard';
import { GlassButton } from '../ui/GlassButton';
import { EmptyState } from '../ui/EmptyState';
import { logger } from '../../lib/logger';
import { useToast } from '@/lib/toast-context';
import { Box, Text } from '../primitives';
import { cn } from '@/lib/utils';

interface TendersPageProps {
  tenders: any[];
  onRefresh: () => void;
  onSelectTender: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: string) => void;
  onNavigate?: (view: any) => void;
  loading?: boolean;
}

/**
 * TendersPage - HARMONIZED 2026 (GOLDEN STATE)
 * Tactical Pipeline | Pantone Precision | Blue Frame Integration
 */
export const TendersPage: React.FC<TendersPageProps> = ({
  tenders,
  onRefresh,
  onSelectTender,
  onUpdateStatus,
  onNavigate,
  loading = false
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [newTender, setNewTender] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const toast = useToast();

  const totalValue = useMemo(() => tenders.reduce((sum, t) => sum + (Number(String(t.value || "0").replace(/[^0-9.-]+/g, "")) || 0), 0), [tenders]);
  const winRate = useMemo(() => tenders.length > 0 ? Math.round((tenders.filter(t => t.probability === 'High').length / tenders.length) * 100) : 0, [tenders]);

  const filteredTenders = useMemo(() => tenders.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.client.toLowerCase().includes(searchQuery.toLowerCase())
  ), [tenders, searchQuery]);

  const columns = [
    {
      header: 'OPPORTUNITY IDENTITY',
      width: '45%',
      accessor: (item: any) => (
        <Box className="flex items-center gap-4 min-w-0">
          <Box className="w-8 h-8 bg-[var(--bg-layer)] border border-[var(--surface-border)] rounded flex items-center justify-center text-[var(--brand-accent)] shrink-0">
            <Target size={14} />
          </Box>
          <Box className="min-w-0 flex flex-col">
            <Text className="truncate text-gov-body font-oswald font-bold italic text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--brand-accent)] transition-colors">
              {item.title}
            </Text>
            <Text className="text-caption font-bold text-[var(--text-tertiary)] uppercase tracking-widest opacity-60">
              {item.client || 'MCE INTERNAL'} • REF_{item.id.slice(0, 4).toUpperCase()}
            </Text>
          </Box>
        </Box>
      )
    },
    {
      header: 'PIPELINE_STATUS',
      width: '15%',
      align: 'center' as const,
      accessor: (item: any) => (
        <Badge variant={item.status === 'Active' ? 'success' : 'outline'} className="text-gov-label px-3 py-1 font-bold tracking-widest">
          {item.status}
        </Badge>
      )
    },
    {
      header: 'DEADLINE',
      width: '20%',
      align: 'center' as const,
      accessor: (item: any) => (
        <Box className="flex flex-col items-center">
          <Text className="text-xs font-bold font-oswald italic text-[var(--text-primary)] uppercase">
            {item.submissionDate || 'PENDING'}
          </Text>
          <Text className="text-caption font-bold uppercase tracking-widest text-[var(--text-tertiary)] opacity-40">Submission_Date</Text>
        </Box>
      )
    },
    {
      header: 'VALUATION',
      width: '20%',
      align: 'right' as const,
      accessor: (item: any) => (
        <Box className="flex flex-col items-end">
          <Box className="flex items-baseline gap-1">
            <Text className="text-gov-label font-bold italic text-[var(--brand-accent)] opacity-40">AED</Text>
            <Text className="text-gov-body font-bold font-oswald italic text-[var(--brand-accent)]">
              {item.value ? (Number(String(item.value).replace(/[^0-9.-]+/g, "")) / 1000000).toFixed(1) + 'M' : '0.0M'}
            </Text>
          </Box>
          <Text className={cn(
            "text-caption font-bold uppercase tracking-widest italic",
            item.probability === 'High' ? 'text-emerald-500' : 'text-amber-500'
          )}>
            {item.probability || 'MEDIUM'} PROBABILITY
          </Text>
        </Box>
      )
    }
  ];

  return (
    <DashboardFrame
      title="Tender Registry"
      loading={loading}
      metrics={
        <>
          <MetricBlock label="Active Bids" value={tenders.length} trend={{ value: 3, type: 'up' }} />
          <MetricBlock label="Pipeline Value" value={totalValue} isCurrency trend={{ value: 8, type: 'up' }} />
          <MetricBlock label="Win Saturation" value={`${winRate}%`} status={winRate > 60 ? 'nominal' : 'warning'} />
          <MetricBlock label="High Prob nodes" value={tenders.filter(t => t.probability === 'High').length} />
        </>
      }
      tabs={
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-1 bg-[var(--bg-layer)]/40 rounded-xl border border-[var(--surface-border)]">
          <div className="flex items-center gap-3 ml-2">
            <div className="flex items-center bg-white border border-[var(--surface-border)] p-1 rounded-lg">
              <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded transition-all", viewMode === 'list' ? "bg-[var(--brand-accent)] text-white" : "text-[var(--text-tertiary)] hover:bg-[var(--bg-layer)]")}>
                <List size={14} />
              </button>
              <button onClick={() => setViewMode('kanban')} className={cn("p-1.5 rounded transition-all", viewMode === 'kanban' ? "bg-[var(--brand-accent)] text-white" : "text-[var(--text-tertiary)] hover:bg-[var(--bg-layer)]")}>
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pr-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--brand-accent)] transition-colors" size={14} />
              <input
                type="text"
                placeholder="QUERY PIPELINE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-[var(--surface-border)] rounded-lg pl-9 pr-4 py-2 text-caption font-bold italic font-oswald text-[var(--text-primary)] w-48 focus:outline-none focus:border-[var(--brand-accent)]/30 transition-all placeholder:text-[var(--text-tertiary)]/40"
              />
            </div>
            <GlassButton onClick={() => setIsFormOpen(true)} className="px-4 py-2 rounded-lg text-gov-label font-bold tracking-widest bg-[var(--brand-accent)] text-white hover:opacity-90">
              <Plus size={14} className="mr-2" /> Initialize Node
            </GlassButton>
          </div>
        </div>
      }
    >
      {isFormOpen && (
        <TenderForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={(tender) => {
            logger.info('TENDER_INITIALIZED', { id: tender?.id });
            toast.success("Tender Initialized", "New opportunity node added to registry.");
            if (tender) {
              setNewTender(tender);
              setIsFormOpen(false);
              setIsWizardOpen(true);
            }
            onRefresh();
          }}
        />
      )}

      {isWizardOpen && newTender && (
        <TenderIntakeWizard
          tenderId={newTender.id}
          tenderTitle={newTender.title}
          clientName={newTender.client}
          onComplete={() => {
            logger.info('WIZARD_COMPLETE', { id: newTender.id });
            toast.success("Intelligence Mapped", "Tender documentation extracted and synced.");
            setIsWizardOpen(false);
            onSelectTender(newTender.id);
          }}
          onCancel={() => setIsWizardOpen(false)}
        />
      )}

      {viewMode === 'list' ? (
        <div className="flex flex-col h-full bg-[var(--bg-surface)]">
          <div className="px-8 py-3 border-b border-[var(--surface-border)] bg-[var(--bg-layer)]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-[var(--brand-accent)] animate-pulse" />
              <span className="text-caption font-bold italic font-oswald text-[var(--text-tertiary)] uppercase tracking-widest">{filteredTenders.length} Opportunity nodes tracked</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {filteredTenders.length > 0 ? (
              <GovernanceTable
                data={filteredTenders}
                columns={columns}
                headerClassName="bg-[var(--bg-layer)] text-[var(--text-primary)] border-b border-[var(--surface-border)] shadow-sm"
                onRowClick={(item: any) => {
                  logger.debug('TENDER_SELECTED', { id: item.id });
                  onSelectTender(item.id);
                }}
              />
            ) : (
              <div className="p-12">
                <EmptyState
                  icon={Target}
                  title="Pipeline Quiescent"
                  description="No active opportunity nodes detected in this quadrant. Initialize a new node to begin capture."
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
        <div className="p-8 bg-[var(--bg-surface)] min-h-screen">
          <TenderKanban
            tenders={filteredTenders}
            onSelectTender={onSelectTender}
            onUpdateStatus={(id, status) => {
              logger.info('TENDER_STATUS_UPDATE', { id, status });
              toast.info("Status Transition", `Tender ${id.slice(0, 4)} moved to ${status}`);
              onUpdateStatus?.(id, status);
            }}
          />
        </div>
      )}
    </DashboardFrame>
  );
};