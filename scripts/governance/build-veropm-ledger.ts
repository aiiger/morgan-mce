import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

type EventRecord = {
	ts?: string;
	type?: 'request' | 'response' | string;
	data?: {
		method?: string;
		url?: string;
		status?: number;
	};
};

type ModuleStatus = {
	captured: boolean;
	detail: string;
};

type RunSummary = {
	run: string;
	workflow: ModuleStatus;
	portfolio: ModuleStatus;
	approval: ModuleStatus;
	documentsUpload: ModuleStatus;
	documentsUpdate: ModuleStatus;
};

const ARTIFACTS_ROOT = path.resolve(process.cwd(), 'artifacts', 'veropm-governance');
const OUTPUT_ROOT = path.resolve(process.cwd(), 'artifacts', 'governance-ledger');

function parseJsonl(filePath: string): EventRecord[] {
	const raw = readFileSync(filePath, 'utf8');
	return raw
		.split(/\r?\n/)
		.filter(Boolean)
		.map((line) => {
			try {
				return JSON.parse(line) as EventRecord;
			} catch {
				return null;
			}
		})
		.filter((item): item is EventRecord => item !== null);
}

function pickRunsFromArgs(): string[] {
	const args = process.argv.slice(2);
	const runsArg = args.find((arg) => arg.startsWith('--runs='));
	const latestArg = args.find((arg) => arg.startsWith('--latest='));

	if (!existsSync(ARTIFACTS_ROOT)) return [];

	const runFolders = readdirSync(ARTIFACTS_ROOT)
		.filter((name) => name.startsWith('run-'))
		.sort((a, b) => a.localeCompare(b));

	if (runsArg) {
		return runsArg
			.replace('--runs=', '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	if (latestArg) {
		const count = Number(latestArg.replace('--latest=', '')) || 1;
		return runFolders.slice(-count);
	}

	return runFolders.slice(-2);
}

function lastMatch(records: EventRecord[]): EventRecord | null {
	if (records.length === 0) return null;
	return records[records.length - 1];
}

function summarizeRun(runName: string): RunSummary {
	const runPath = path.join(ARTIFACTS_ROOT, runName, 'events.jsonl');
	if (!existsSync(runPath)) {
		return {
			run: runName,
			workflow: { captured: false, detail: 'events.jsonl missing' },
			portfolio: { captured: false, detail: 'events.jsonl missing' },
			approval: { captured: false, detail: 'events.jsonl missing' },
			documentsUpload: { captured: false, detail: 'events.jsonl missing' },
			documentsUpdate: { captured: false, detail: 'events.jsonl missing' }
		};
	}

	const events = parseJsonl(runPath);
	const requests = events.filter((e) => e.type === 'request');
	const responses = events.filter((e) => e.type === 'response');
	const mut = requests.filter((e) => /POST|PUT|PATCH|DELETE/i.test(e.data?.method ?? ''));

	const wfMut = mut.filter((e) => /\/workflow(\/|$)|workflow\/version/i.test(e.data?.url ?? ''));
	const wfCreate = wfMut.some((e) => /POST/i.test(e.data?.method ?? '') && /\/workflow(\/|$)/i.test(e.data?.url ?? ''));
	const wfUpdate = wfMut.some((e) => /PUT|PATCH/i.test(e.data?.method ?? '') && /\/workflow\//i.test(e.data?.url ?? ''));
	const workflowCaptured = wfCreate && wfUpdate;

	const portfolioMut = mut.filter((e) => /\/portfolio(\/|$)/i.test(e.data?.url ?? ''));
	const portfolioCaptured = portfolioMut.length > 0;

	const approvalMut = mut.filter((e) => /resourcerequest\/bulk-action|approve|reject/i.test(e.data?.url ?? ''));
	const approvalRes = responses.filter((e) => /resourcerequest\/bulk-action|approve|reject/i.test(e.data?.url ?? ''));
	const approvalSuccess = approvalRes.some((e) => (e.data?.status ?? 0) >= 200 && (e.data?.status ?? 0) < 300);
	const approvalFailure = approvalRes.some((e) => (e.data?.status ?? 0) >= 400);
	const approvalCaptured = approvalMut.length > 0;

	const docsUpload = mut.filter((e) => /\/documents(\?|$)|\/documents\/[^/]+\/upload/i.test(e.data?.url ?? ''));
	const docsUploadCaptured = docsUpload.some((e) => /\/documents(\?|$)/i.test(e.data?.url ?? '')) && docsUpload.some((e) => /\/upload/i.test(e.data?.url ?? ''));

	const docsUpdate = mut.filter((e) => /\/documents\//i.test(e.data?.url ?? '') && !/\/upload/i.test(e.data?.url ?? '') && /PUT|PATCH|POST/i.test(e.data?.method ?? ''));
	const docsUpdateRes = responses.filter((e) => /\/documents\//i.test(e.data?.url ?? '') && !/\/upload/i.test(e.data?.url ?? '') && /PUT|PATCH|POST/i.test(e.data?.method ?? ''));
	const docsUpdateCaptured = docsUpdate.length > 0;

	const wfLast = lastMatch(wfMut);
	const pfLast = lastMatch(portfolioMut);
	const apLast = lastMatch(approvalMut);
	const duLast = lastMatch(docsUpload);
	const dUpdateLast = lastMatch(docsUpdate);
	const dUpdateResLast = lastMatch(docsUpdateRes);

	return {
		run: runName,
		workflow: {
			captured: workflowCaptured,
			detail: workflowCaptured
				? `${wfLast?.data?.method ?? 'N/A'} ${wfLast?.data?.url ?? 'N/A'}`
				: `create=${wfCreate}, update=${wfUpdate}`
		},
		portfolio: {
			captured: portfolioCaptured,
			detail: pfLast ? `${pfLast.data?.method ?? 'N/A'} ${pfLast.data?.url ?? 'N/A'}` : 'No portfolio mutation'
		},
		approval: {
			captured: approvalCaptured,
			detail: apLast
				? `${apLast.data?.method ?? 'N/A'} ${apLast.data?.url ?? 'N/A'} | success=${approvalSuccess} failure=${approvalFailure}`
				: 'No approval mutation'
		},
		documentsUpload: {
			captured: docsUploadCaptured,
			detail: duLast ? `${duLast.data?.method ?? 'N/A'} ${duLast.data?.url ?? 'N/A'}` : 'No document upload mutation'
		},
		documentsUpdate: {
			captured: docsUpdateCaptured,
			detail: dUpdateLast
				? `${dUpdateLast.data?.method ?? 'N/A'} ${dUpdateLast.data?.url ?? 'N/A'} | status=${dUpdateResLast?.data?.status ?? 'N/A'}`
				: 'No document update mutation'
		}
	};
}

function toMarkdown(summaries: RunSummary[]): string {
	const lines: string[] = [];
	lines.push('# VeroPM Governance Ledger');
	lines.push('');

	for (const summary of summaries) {
		lines.push(`## ${summary.run}`);
		lines.push('');
		lines.push('| Module | Captured | Detail |');
		lines.push('|---|---|---|');
		lines.push(`| Workflow | ${summary.workflow.captured ? 'YES' : 'NO'} | ${summary.workflow.detail} |`);
		lines.push(`| Portfolio | ${summary.portfolio.captured ? 'YES' : 'NO'} | ${summary.portfolio.detail} |`);
		lines.push(`| Approval | ${summary.approval.captured ? 'YES' : 'NO'} | ${summary.approval.detail} |`);
		lines.push(`| Documents Upload | ${summary.documentsUpload.captured ? 'YES' : 'NO'} | ${summary.documentsUpload.detail} |`);
		lines.push(`| Documents Update | ${summary.documentsUpdate.captured ? 'YES' : 'NO'} | ${summary.documentsUpdate.detail} |`);
		lines.push('');
	}

	return lines.join('\n');
}

function main() {
	const runs = pickRunsFromArgs();

	if (runs.length === 0) {
		console.error('No governance runs found.');
		process.exit(1);
	}

	const summaries = runs.map(summarizeRun);

	if (!existsSync(OUTPUT_ROOT)) mkdirSync(OUTPUT_ROOT, { recursive: true });
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const jsonPath = path.join(OUTPUT_ROOT, `workflow-ledger-${timestamp}.json`);
	const mdPath = path.join(OUTPUT_ROOT, `workflow-ledger-${timestamp}.md`);

	writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), runs: summaries }, null, 2), 'utf8');
	writeFileSync(mdPath, toMarkdown(summaries), 'utf8');

	console.log(`Ledger generated:\n- ${jsonPath}\n- ${mdPath}`);
}

main();
