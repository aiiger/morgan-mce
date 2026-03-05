import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { MetricDisplay } from '../ui/MetricDisplay';
import { StatusBadge } from '../ui/StatusBadge';
import { Box, Text } from '../../components/primitives';
import { cn } from '@/lib/utils';
import { PortfolioVelocityChart } from '../dashboard/PortfolioVelocityChart';
import { StrategicVolumeChart } from '../dashboard/StrategicVolumeChart';
import { OperationalLedger } from '../dashboard/OperationalLedger';
import { RiskHeatmapV2 } from '../dashboard/RiskHeatmapV2';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { useExecutiveData } from '@/hooks/useExecutiveData';
import type { Tender } from '@/types';
import type { Notification } from '../notifications/NotificationBell';
import { Activity, AlertTriangle, Briefcase, DollarSign } from 'lucide-react';
import { DashboardFrame } from '../governance/DashboardFrame';
import { MetricBlock } from '../governance/MetricBlock';

interface CockpitProps {
   projects?: any[];
   tenders?: Tender[];
   notifications?: Notification[];
   kpis?: any;
   onNavigate: (view: any) => void;
   onSelectProject?: (id: string) => void;
   onSelectTender?: (id: string) => void;
   onUpdateTender?: (id: string, status: string) => void;
}

export const ExecutiveCockpit: React.FC<CockpitProps> = ({ projects: propProjects, tenders: propTenders, notifications, kpis: propKpis, onNavigate, onSelectProject }) => {
   const [activeTab, setActiveTab] = useState('OVERVIEW');

   const { data: executiveData, isLoading } = useExecutiveData();

   const projects = executiveData?.projects || propProjects || [];

   // Map chart data
   const portfolioData = (executiveData?.revenueChart || []).map((item: any) => ({
      month: item.name,
      revenue: item.value,
      cost: item.value * 0.4
   }));

   const strategicData = (executiveData?.pipelineChart && executiveData.pipelineChart.length > 0)
      ? executiveData.pipelineChart.map((item: any) => ({ month: item.name, revenue: item.value }))
      : portfolioData.map((d: any) => ({ month: d.month, revenue: d.revenue * 0.8 }));

   const stats = {
      active: projects.filter((p: any) => {
         const status = p.project_status?.toLowerCase() || '';
         return status === 'active' || status === 'construction' || status === 'ongoing' || status === 'active units';
      }).length,
      bids: propTenders?.length || 0,
      value: projects.reduce((acc: number, p: any) => acc + (Number(p.contract_value_excl_vat) || 0), 0),
      critical: projects.filter((p: any) => p.delivery_risk_rating === 'Critical' || (p.project_status?.toLowerCase() || '').includes('delay')).length
   };

   const tabs = [
      { id: 'OVERVIEW', label: 'Operational Overview' },
      { id: 'LEDGER', label: 'Project Ledger' },
      { id: 'RISK', label: 'Risk Analysis' }
   ];

   const alerts = notifications?.map(n => ({
      id: n.id,
      title: n.message,
      severity: (n.severity === 'info' ? 'low' : n.severity) as 'critical' | 'high' | 'medium' | 'low',
      timestamp: n.created_at || 'Now',
   })) || [];

   return (
      <DashboardFrame
         title="Executive Cockpit"
         subtitle="Strategic Command Interface"
         metrics={
            <>
               <MetricBlock
                  label="Active Units"
                  value={stats.active}
                  trend={{ value: 4, type: 'up' }}
               />
               <MetricBlock
                  label="Contract Value"
                  value={stats.value}
                  isCurrency
                  trend={{ value: 12.5, type: 'up' }}
               />
               <MetricBlock
                  label="Active Tenders"
                  value={stats.bids}
                  trend={{ value: 2, type: 'down' }}
               />
               <MetricBlock
                  label="Risk Signals"
                  value={stats.critical}
                  trend={stats.critical > 0 ? { value: stats.critical, type: 'up' } : undefined}
                  status={stats.critical > 0 ? 'critical' : 'nominal'}
               />
            </>
         }
         tabs={
            <Box className="bg-[var(--bg-layer)]/40 p-1 rounded-xl border border-[var(--surface-border)] backdrop-blur-md flex gap-1">
               {tabs.map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={cn(
                        "px-6 py-2.5 rounded-lg transition-all duration-300 group",
                        activeTab === tab.id
                           ? 'bg-[var(--bg-active)] text-[var(--text-primary)] shadow-sm border border-[var(--surface-border-strong)]'
                           : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/40 border border-transparent'
                     )}
                  >
                     <Text variant="gov-header" className={cn(
                        "text-caption transition-all",
                        activeTab === tab.id ? "scale-105 italic text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
                     )}>
                        {tab.label}
                     </Text>
                  </button>
               ))}
            </Box>
         }
      >
         <AnimatePresence mode="wait">
            {activeTab === 'OVERVIEW' && (
               <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
               >
                  <Box className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                     <div className="lg:col-span-8">
                        <GlassCard className="h-full min-h-[400px]">
                           <Box className="mb-6 flex items-center justify-between">
                              <Text variant="gov-header">Portfolio Velocity</Text>
                              <StatusBadge status="active" size="sm" />
                           </Box>
                           <PortfolioVelocityChart data={portfolioData} totalValue={stats.value} />
                        </GlassCard>
                     </div>
                     <div className="lg:col-span-4">
                        <GlassCard className="h-full min-h-[400px]">
                           <Box className="mb-6 flex items-center justify-between">
                              <Text variant="gov-header">Pipeline Volume</Text>
                              <StatusBadge status="projected" label="Forecast" size="sm" dot={false} className="bg-brand-500/10 text-brand-400" />
                           </Box>
                           <StrategicVolumeChart
                              data={strategicData}
                              activeUnits={stats.active}
                              criticalUnits={stats.critical}
                           />
                        </GlassCard>
                     </div>
                  </Box>

                  <GlassCard>
                     <Box className="mb-6 flex items-center justify-between">
                        <Text variant="gov-header">Operational Ledger</Text>
                     </Box>
                     <OperationalLedger projects={projects} onSelectProject={onSelectProject} />
                  </GlassCard>
               </motion.div>
            )}

            {activeTab === 'LEDGER' && (
               <motion.div
                  key="ledger"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
               >
                  <GlassCard>
                     <OperationalLedger projects={projects} onSelectProject={onSelectProject} />
                  </GlassCard>
               </motion.div>
            )}

            {activeTab === 'RISK' && (
               <motion.div
                  key="risk"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
               >
                  <RiskHeatmapV2 projects={projects} alerts={alerts} />
               </motion.div>
            )}
         </AnimatePresence>
      </DashboardFrame>
   );
};
