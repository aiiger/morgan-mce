export interface ReportTemplate {
    name: string;
    type: 'FINANCIAL' | 'OPERATIONAL' | 'SAFETY' | 'AI_INSIGHTS';
    lastGenerated: string;
}

export const reportTemplates: ReportTemplate[] = [
    { name: 'Executive Financial Summary', type: 'FINANCIAL', lastGenerated: '2026-02-20' },
    { name: 'Monthly Safety Compliance PDF', type: 'SAFETY', lastGenerated: '2026-02-01' },
    { name: 'Project Velocity Projections', type: 'AI_INSIGHTS', lastGenerated: '2026-02-25' },
    { name: 'Subcontractor Spend Audit', type: 'FINANCIAL', lastGenerated: '2026-01-15' }
];

export const reportEngine = {
    generateNarrative: (projectId: string) => {
        return `AI INSIGHT: Project ${projectId} is demonstrating 12% higher efficiency in procurement cycle times vs platform average. Recommended action: Accelerate Stage 4 concrete pour.`;
    },
    exportToCSV: (type: string) => {
        return { success: true, url: `/api/exports/${type.toLowerCase()}.csv` };
    }
};
