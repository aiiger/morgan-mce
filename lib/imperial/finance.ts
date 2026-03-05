export interface Invoice {
    id: string;
    vendor: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'REJECTED';
    dueDate: string;
    category: string;
}

export interface Budget {
    projectId: string;
    allocated: number;
    spent: number;
    committed: number;
    variance: number;
}

export const financialData = {
    invoices: [
        { id: 'INV-8821', vendor: 'Global Logistics Corp', amount: 450000, status: 'PAID', dueDate: '2026-03-15', category: 'LOGISTICS' },
        { id: 'INV-8822', vendor: 'Concrete Solutions Inc', amount: 1250000, status: 'PENDING', dueDate: '2026-03-20', category: 'MATERIALS' },
        { id: 'INV-8823', vendor: 'Precision Engineering', amount: 85000, status: 'PENDING', dueDate: '2026-04-01', category: 'CONSULTING' }
    ],
    budgets: [
        { projectId: 'NEX-P001', allocated: 50000000, spent: 42000000, committed: 48000000, variance: 2000000 },
        { projectId: 'NEX-P044', allocated: 120000000, spent: 15000000, committed: 85000000, variance: 35000000 }
    ]
};

export const financeEngine = {
    calculateBurnRate: (projectId: string) => {
        const budget = financialData.budgets.find(b => b.projectId === projectId);
        if (!budget) return 0;
        return (budget.spent / budget.allocated) * 100;
    },
    processPayment: async (invoiceId: string) => {
        // Neural Link simulation
        return { success: true, message: `Payment for ${invoiceId} initiated via Imperial Bridge.` };
    }
};
