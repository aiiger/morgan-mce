export type ImperialProjectStatus = 'Draft' | 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
export type ImperialProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ImperialVisibility = 'Public' | 'Team' | 'Private';

export interface ImperialProject {
    id: string;
    name: string;
    code: string;
    portfolio: string;
    priority: ImperialProjectPriority;
    status: ImperialProjectStatus;
    type: string;
    visibility: ImperialVisibility;
    budget?: number;
    spent?: number;
    progress: number; // 0-100
    startDate?: string;
    endDate?: string;
    description?: string;
    financials?: {
        plannedValue: number;
        actualCost: number;
        earnedValue: number;
    };
    riskLevel: 'Low' | 'Medium' | 'High';
    createdAt: string;
    updatedAt: string;
}

export interface ImperialTender {
    id: string;
    title: string;
    client: string;
    submissionDate: string;
    status: 'Draft' | 'Submitted' | 'Won' | 'Lost';
    complianceScore: number;
    estimatedValue: number;
    rfqAnalysis?: string;
}
