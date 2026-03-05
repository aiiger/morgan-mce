export interface Subcontractor {
    id: string;
    name: string;
    specialty: string;
    activePOs: number;
    totalSpent: number;
    rating: number;
}

export interface ResourceNode {
    id: string;
    name: string;
    type: 'PERSONNEL' | 'EQUIPMENT' | 'FACILITY';
    allocation: number; // Percentage
    currentProject: string;
}

export interface OperationalLog {
    id: string;
    type: 'TIMESHEET' | 'HSE' | 'QA';
    date: string;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
    summary: string;
}

export interface DMSNode {
    id: string;
    name: string;
    type: 'FOLDER' | 'PDF' | 'XLSX' | 'DOCX';
    lastModified: string;
    size: string;
    parentId?: string;
}

export const opData = {
    subcontractors: [
        { id: 'SUB-001', name: 'Atlas Concrete', specialty: 'Foundations', activePOs: 4, totalSpent: 1200000, rating: 4.8 },
        { id: 'SUB-002', name: 'Precision MEP', specialty: 'Electrical', activePOs: 2, totalSpent: 850000, rating: 4.5 }
    ],
    resources: [
        { id: 'RES-001', name: 'Tower Crane 09', type: 'EQUIPMENT', allocation: 90, currentProject: 'NEX-P001' },
        { id: 'RES-002', name: 'Site Manager: Sarah J.', type: 'PERSONNEL', allocation: 100, currentProject: 'NEX-P044' }
    ],
    logs: [
        { id: 'LOG-001', type: 'HSE', date: '2026-02-25', status: 'APPROVED', summary: 'Daily Site Safety Audit: 0 Violations' },
        { id: 'LOG-002', type: 'TIMESHEET', date: '2026-02-25', status: 'SUBMITTED', summary: 'Site 044 Labor Entry: 140 Hours' },
        { id: 'LOG-003', type: 'QA', date: '2026-02-26', status: 'DRAFT', summary: 'Concrete Pour Quality Test: Batch 882' }
    ],
    dms: [
        { id: 'DIR-001', name: 'Project Archives', type: 'FOLDER', lastModified: '2026-01-01', size: '--' },
        { id: 'FILE-001', name: 'Final_Contract_V7.pdf', type: 'PDF', lastModified: '2026-02-12', size: '2.4MB', parentId: 'DIR-001' },
        { id: 'FILE-002', name: 'Procurement_Log_2025.xlsx', type: 'XLSX', lastModified: '2026-02-20', size: '1.1MB', parentId: 'DIR-001' }
    ]
};
