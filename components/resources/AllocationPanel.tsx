'use client';

import React from 'react';
import { ResourceAllocation } from '../../types';
import { Calendar, User, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { GovernanceTable } from '../governance/GovernanceTable';
import { Badge } from '../ui/Badge';

interface AllocationPanelProps {
  allocations: ResourceAllocation[];
  onRefresh: () => void;
}

export default function AllocationPanel({ allocations, onRefresh }: AllocationPanelProps) {
  const activeAllocations = allocations.filter(a => a.status === 'Active');

  const columns = [
    {
      header: 'Personnel Node',
      width: '25%',
      accessor: (alloc: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
            <User size={14} />
          </div>
          <span className="text-xs font-bold italic text-gray-900">{alloc.team_member_name || 'Unknown'}</span>
        </div>
      )
    },
    {
      header: 'Project Assignment',
      width: '25%',
      accessor: (alloc: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
            <Briefcase size={14} />
          </div>
          <span className="text-xs font-bold italic text-gray-500 truncate">{alloc.project_name || 'Unknown'}</span>
        </div>
      )
    },
    {
      header: 'Strategic Role',
      width: '20%',
      accessor: (alloc: any) => (
        <Badge variant="outline" className="text-gov-label font-bold italic tracking-widest px-2">
          {alloc.role_in_project || 'Team Member'}
        </Badge>
      )
    },
    {
      header: 'Load',
      width: '10%',
      align: 'center' as const,
      accessor: (alloc: any) => (
        <span className="font-mono font-bold italic text-emerald-500">{alloc.allocation_percent}%</span>
      )
    },
    {
      header: 'Temporal Lock',
      width: '20%',
      align: 'right' as const,
      accessor: (alloc: any) => (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-gov-label font-mono text-gray-700">
            {new Date(alloc.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            <span className="opacity-20">→</span>
            {alloc.end_date ? new Date(alloc.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'ONGOING'}
          </div>
          <span className="text-caption font-bold italic text-gray-500 tracking-widest mt-1">Assignment Window</span>
        </div>
      )
    }
  ];

  return (
    <Card variant="matte" padding="none">
      <CardHeader className="px-8 py-6 border-b border-gray-200 bg-bg-surface">
        <div className="flex flex-col gap-1">
          <CardTitle>Resource Allocation Ledger</CardTitle>
          <p className="text-caption font-mono text-gray-500 tracking-widest">
            {activeAllocations.length} Active System Bindings
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[400px]">
          <GovernanceTable 
            data={activeAllocations} 
            columns={columns} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
