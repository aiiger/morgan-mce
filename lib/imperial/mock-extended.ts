export interface Portfolio {
    id: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'PENDING';
    projectCount: number;
    value: string;
    updatedAt: string;
}

export interface Proposal {
    id: string;
    title: string;
    client: string;
    value: string;
    stage: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'FEASIBILITY';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    roi: string;
}

export const portfolioData: Portfolio[] = [
    {
        id: 'port-1',
        name: 'Middle East Infrastructure',
        description: 'Multi-year urban development projects across GCC regions.',
        status: 'ACTIVE',
        projectCount: 12,
        value: '$420M',
        updatedAt: '2026-02-20'
    },
    {
        id: 'port-2',
        name: 'Sustainable Energy Grid',
        description: 'Renewable energy integration and smart grid implementation.',
        status: 'ACTIVE',
        projectCount: 5,
        value: '$180M',
        updatedAt: '2026-02-24'
    }
];

export const proposalData: Proposal[] = [
    {
        id: 'prop-1',
        title: 'Middle East Smart City Integration',
        client: 'Neom Urban Auth.',
        value: '$85.5M',
        stage: 'UNDER_REVIEW',
        priority: 'HIGH',
        roi: '12.4%'
    },
    {
        id: 'prop-2',
        title: 'Solar Array V4 Expansion',
        client: 'Aramco Energy',
        value: '$22.1M',
        stage: 'DRAFT',
        priority: 'MEDIUM',
        roi: '8.2%'
    },
    {
        id: 'prop-3',
        title: 'Desalination Plant - Phase 3',
        client: 'SWCC',
        value: '$114M',
        stage: 'SUBMITTED',
        priority: 'HIGH',
        roi: '15.1%'
    },
    {
        id: 'prop-4',
        title: 'Hyperloop Transit Node',
        client: 'Virgin Hyperloop',
        value: '$340M',
        stage: 'FEASIBILITY',
        priority: 'HIGH',
        roi: '22.0%'
    }
];

export const teamData = [
    { id: '1', name: 'Dr. Sarah Connor', role: 'Chief Architect', status: 'In Mission', avatar: 'SC' },
    { id: '2', name: 'John Doe', role: 'Lead Developer', status: 'Available', avatar: 'JD' },
    { id: '3', name: 'Alex Vance', role: 'Security Ops', status: 'Offline', avatar: 'AV' },
];
