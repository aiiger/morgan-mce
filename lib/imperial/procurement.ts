export interface PurchaseOrder {
    id: string;
    subcontractorId: string;
    projectId: string;
    value: number;
    status: 'ISSUED' | 'DRAFT' | 'CLOSED';
    date: string;
}

export const procurementData = {
    pos: [
        { id: 'PO-9901', subcontractorId: 'SUB-001', projectId: 'NEX-P001', value: 340000, status: 'ISSUED', date: '2026-02-10' },
        { id: 'PO-9902', subcontractorId: 'SUB-002', projectId: 'NEX-P044', value: 850000, status: 'ISSUED', date: '2026-02-15' },
        { id: 'PO-9903', subcontractorId: 'SUB-001', projectId: 'NEX-P044', value: 120000, status: 'DRAFT', date: '2026-02-26' }
    ]
};

export const procurementEngine = {
    generatePO: (data: any) => {
        return { success: true, id: `PO-GEN-${Math.floor(Math.random() * 1000)}`, data };
    },
    auditVendor: (vendorId: string) => {
        return { score: 98.4, status: 'COMPLIANT', lastAudit: '2026-01-15' };
    }
};
