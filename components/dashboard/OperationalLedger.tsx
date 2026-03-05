import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { GovernanceTable } from '../governance/GovernanceTable';
import { TabNav } from '../governance/TabNav';
import { Box, Text } from '../primitives';

interface Project {
    id: string;
    project_name: string;
    project_code?: string;
    client_name?: string;
    delivery_risk_rating?: string;
    contract_value_excl_vat?: number;
    project_completion_date_planned?: string;
}

interface OperationalLedgerProps {
    projects: Project[];
    onSelectProject?: (id: string) => void;
}

export const OperationalLedger: React.FC<OperationalLedgerProps> = ({ projects, onSelectProject }) => {
    const [activeTab, setActiveTab] = useState('ONGOING');

    const filteredProjects = React.useMemo(() => {
        return projects.filter(p => {
            const status = (p as any).project_status?.toUpperCase() || '';
            if (activeTab === 'ONGOING') return status.includes('CONSTRUCTION') || status.includes('ONGOING') || status.includes('ACTIVE');
            if (activeTab === 'COMPLETED') return status.includes('COMPLETED') || status.includes('DLP');
            if (activeTab === 'UPCOMING') return status.includes('TENDER') || status.includes('PRE-AWARD') || status.includes('AWAITING') || status.includes('UPCOMING');
            return true;
        });
    }, [projects, activeTab]);

    const tabs = [
        { id: 'ONGOING', label: 'Ongoing', count: projects.filter(p => ((p as any).project_status?.toUpperCase() || '').match(/CONSTRUCTION|ONGOING|ACTIVE/)).length },
        { id: 'COMPLETED', label: 'Completed', count: projects.filter(p => ((p as any).project_status?.toUpperCase() || '').match(/COMPLETED|DLP/)).length },
        { id: 'UPCOMING', label: 'Upcoming', count: projects.filter(p => ((p as any).project_status?.toUpperCase() || '').match(/TENDER|PRE-AWARD|AWAITING|UPCOMING/)).length }
    ];

    const columns = [
        {
            header: 'Artifact Focus',
            width: '45%',
            accessor: (p: Project) => (
                <Box className="flex items-center gap-4 min-w-0">
                    <Box className="w-8 shrink-0 flex items-center justify-center">
                        <Box className="w-7 h-7 bg-[var(--bg-layer)]/30 border border-[var(--surface-border)] rounded flex items-center justify-center text-[var(--morgan-teal)]">
                            <Building2 size={12} strokeWidth={2} />
                        </Box>
                    </Box>
                    <Box className="min-w-0 flex flex-col">
                        <Text variant="gov-metric" className="text-[var(--text-primary)] truncate group-hover:text-[var(--morgan-teal)] transition-colors">
                            {p.project_name}
                        </Text>
                        <Text variant="gov-label" color="tertiary" className="text-gov-label tracking-widest uppercase">
                            {p.client_name || 'Internal Protocol'} • {p.project_code || 'PRJ-SPEC'}
                        </Text>
                    </Box>
                </Box>
            )
        },
        {
            header: 'Timeline',
            width: '25%',
            align: 'center' as const,
            accessor: (p: Project) => {
                const daysRemaining = p.project_completion_date_planned
                    ? Math.ceil((new Date(p.project_completion_date_planned).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                if (daysRemaining === null) return <Text color="tertiary" className="opacity-30">--</Text>;

                return (
                    <Box className="flex flex-col items-center">
                        <Text
                            variant="gov-metric"
                            className={`${daysRemaining < 0 ? 'text-[var(--color-critical)] animate-pulse' : 'text-[var(--text-secondary)]'}`}
                        >
                            {daysRemaining < 0 ? `-${Math.abs(daysRemaining)}D` : `${daysRemaining}D`}
                        </Text>
                        <Text variant="gov-label" color="tertiary" className="text-gov-label">Countdown</Text>
                    </Box>
                );
            }
        },
        {
            header: 'Status',
            width: '30%',
            align: 'right' as const,
            accessor: (p: Project) => (
                <Box className="flex flex-col items-end">
                    <Text
                        variant="gov-label"
                        className={`px-3 py-1 rounded-sm ${p.delivery_risk_rating === 'Critical' ? 'bg-[var(--color-critical)]/10 text-[var(--color-critical)]' :
                            p.delivery_risk_rating === 'High' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' :
                                'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                            }`}
                    >
                        {p.delivery_risk_rating || 'NOMINAL'}
                    </Text>
                </Box>
            )
        }
    ];

    return (
        <Box className="flex flex-col h-full bg-transparent">
            {/* Standardized Tab Nav Section */}
            <Box className="px-4 border-b border-[var(--surface-border)] bg-[var(--bg-layer)]/20">
                <TabNav
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    variant="category"
                />
            </Box>

            {/* Canonical Table implementation */}
            <Box className="flex-1 overflow-hidden">
                <GovernanceTable
                    data={filteredProjects}
                    columns={columns}
                    onRowClick={(p) => onSelectProject?.(p.id)}
                />
            </Box>
        </Box>
    );
};

