// migration_payload.json was removed during repo cleanup — use empty fallback
const payload: { projects: Record<string, unknown>[] } = { projects: [] };
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(process.cwd(), 'migration_payload.json');
  if (fs.existsSync(filePath)) {
    Object.assign(payload, JSON.parse(fs.readFileSync(filePath, 'utf-8')));
  }
} catch { /* payload stays empty */ }

export const imperialData = {
    projects: payload.projects.map((p: any, i: number) => ({
        id: `IP-${i}`,
        name: p['Project Name'],
        code: `NEX-24-${100 + i}`,
        portfolio: p['Portfolio'] || 'Infrastructure_Core',
        priority: i % 5 === 0 ? 'Critical' : 'High',
        status: 'Active',
        value: p['Contract Value (USD)'] || p['Contract Value (Actual Currency)'] || (Math.random() * 50 + 10).toFixed(2),
        progress: Math.floor(Math.random() * 40 + 60),
        financials: {
            planned: 100,
            actual: 85 + (Math.random() * 10),
            variance: -1.2
        }
    })),
    tenders: [
        { id: 'T1', name: 'Al Raha Beach Development', value: '450M', status: 'In Review', compliance: 98 },
        { id: 'T2', name: 'Khalifa Port Expansion', value: '1.2B', status: 'Won', compliance: 94 },
        { id: 'T3', name: 'Dubai Creek Harbor Tower', value: '890M', status: 'Submitted', compliance: 91 }
    ]
};
