'use client';

import React, { useState } from 'react';
import { Users, BarChart3, FileUp, Plus, LayoutDashboard, GanttChart, Activity, Zap } from 'lucide-react';
import { useResourceData } from '../../hooks/useResourceData';
import ResourceGrid from '../resources/ResourceGrid';
import UtilizationChart from '../resources/UtilizationChart';
import AllocationPanel from '../resources/AllocationPanel';
import ManpowerImporter from '../resources/ManpowerImporter';
import { ResourceForm } from '../forms/ResourceForm';
import { DashboardFrame } from '../governance/DashboardFrame';
import { MetricBlock } from '../governance/MetricBlock';
import { GlassButton } from '../ui/GlassButton';
import { EmptyState } from '../ui/EmptyState';

interface ResourcesPageProps {
  projects: any[];
  onRefresh: () => void;
  loading?: boolean;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  projects,
  onRefresh,
  loading: globalLoading = false
}) => {
  const {
    teamMembers,
    allocations,
    utilizationMetrics,
    loading: localLoading,
    error,
    fetchTeamMembers,
    fetchAllocations,
  } = useResourceData();

  const [activeTab, setActiveTab] = useState<'team' | 'allocations' | 'utilization' | 'import'>('team');
  const [showAddTeam, setShowAddTeam] = useState(false);

  const isLoading = globalLoading || localLoading;

  if (error) {
    return (
      <div className="p-12 text-center">
        <EmptyState
          icon={Activity}
          title="Data Synchronization Fault"
          description={error}
          action={{
            label: "Retry Connection",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    );
  }

  const metrics = [
    <MetricBlock key="total" label="Personnel Nodes" value={teamMembers.length} />,
    <MetricBlock key="alloc" label="Active Assignments" value={allocations.length} />,
    <MetricBlock key="util" label="Avg Utilization" value="78.2%" trend={{ value: 4, type: 'up' }} />,
    <MetricBlock key="forecast" label="Demand Forecast" value="+12%" status="nominal" />,
    <MetricBlock key="capacity" label="Headroom" value="21.8%" status="nominal" />
  ];

  const tabs = (
    <div className="flex flex-col md:flex-row items-center justify-between p-[var(--gov-s2)] gap-4">
      <div className="flex space-x-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
        {[
          { id: 'team', label: 'Team Registry', icon: Users },
          { id: 'allocations', label: 'Allocations', icon: GanttChart },
          { id: 'utilization', label: 'Capacity Pulse', icon: Activity },
          { id: 'import', label: 'Neural Ingest', icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-caption font-bold italic tracking-widest rounded-lg transition-all flex items-center gap-2 ${activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'team' && (
        <GlassButton
          onClick={() => setShowAddTeam(true)}
          className="px-6 py-2.5 text-gov-label"
        >
          <Plus size={14} className="mr-2" />
          Initialize Personnel Node
        </GlassButton>
      )}
    </div>
  );

  return (
    <DashboardFrame
      title="Global Resource Command"
      subtitle="Personnel Capacity & Allocation Overwatch"
      metrics={metrics}
      tabs={tabs}
      loading={isLoading}
    >
      <div className="p-8">
        {activeTab === 'team' && (
          <ResourceGrid
            members={teamMembers}
            onRefresh={() => fetchTeamMembers()}
            onAdd={() => setShowAddTeam(true)}
          />
        )}
        {activeTab === 'allocations' && (
          <AllocationPanel
            allocations={allocations}
            onRefresh={() => fetchAllocations()}
          />
        )}
        {activeTab === 'utilization' && (
          <UtilizationChart metrics={utilizationMetrics} />
        )}
        {activeTab === 'import' && <ManpowerImporter />}
      </div>

      {showAddTeam && (
        <ResourceForm
          onClose={() => setShowAddTeam(false)}
          onSuccess={() => {
            fetchTeamMembers();
            setShowAddTeam(false);
          }}
        />
      )}
    </DashboardFrame>
  );
};
