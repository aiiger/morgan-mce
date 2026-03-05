import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

type LogEvent = {
  ts: string;
  type: string;
  data: Record<string, unknown>;
};

type Snapshot = {
  ts: string;
  checkpoint: string;
  url: string;
  title: string;
  stateHash: string;
  evidence: {
    workflowName: string;
    description: string;
    bindToProject: string;
    templateType: string;
    active: boolean | null;
    isDefault: boolean | null;
    statuses: Array<{
      name: string;
      colorToken: string;
      initial: boolean | null;
      final: boolean | null;
    }>;
    transitions: Array<{
      summary: string;
      source: string;
      target: string;
      condition: string;
      action: string;
    }>;
    requiredFieldsMissing: string[];
    visibleErrors: string[];
    actionButtons: Array<{ name: string; enabled: boolean }>;
    formFields: Array<{ label: string; value: string; required: boolean }>;
    storage: {
      localStorage: Record<string, string>;
      sessionStorage: Record<string, string>;
    };
  };
};

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function appendJsonl(filePath: string, event: LogEvent) {
  fs.appendFileSync(filePath, `${JSON.stringify(event)}\n`, 'utf-8');
}

function hashSnapshotCore(value: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 20);
}

function isRelevantUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('veropm.app') || lower.includes('apis-veropm.veropm.app');
}

async function waitForPostLoginReady(page: Page, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const url = page.url().toLowerCase();
    if (!url.includes('/login')) {
      return;
    }
    await page.waitForTimeout(2000);
  }
}

async function resilientGoto(page: Page, url: string, timeoutMs: number): Promise<void> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    return;
  } catch {
    await page.goto(url, { waitUntil: 'commit', timeout: timeoutMs });
  }
}

async function extractEvidence(page: Page): Promise<Snapshot['evidence']> {
  const data = await page.evaluate(() => {
    const text = (el: Element | null | undefined) => (el?.textContent || '').trim();
    const normalize = (v: string) => v.replace(/\s+/g, ' ').trim();
    const labelFor = (field: Element): string => {
      const htmlEl = field as HTMLElement;
      const id = htmlEl.getAttribute('id');
      if (id) {
        const direct = document.querySelector(`label[for="${id}"]`);
        if (direct && text(direct)) return normalize(text(direct));
      }
      const wrapped = htmlEl.closest('label');
      if (wrapped && text(wrapped)) return normalize(text(wrapped));
      const row = htmlEl.closest('div');
      const nearLabel = row?.querySelector('label, p, span, h2, h3, h4');
      if (nearLabel && text(nearLabel)) return normalize(text(nearLabel));
      const aria = htmlEl.getAttribute('aria-label') || htmlEl.getAttribute('name') || htmlEl.getAttribute('placeholder');
      return normalize(aria || '');
    };

    const toBool = (el: Element | null): boolean | null => {
      if (!el) return null;
      const node = el as HTMLInputElement;
      if (node.tagName.toLowerCase() === 'input' && node.type === 'checkbox') return Boolean(node.checked);
      const checked = el.getAttribute('aria-checked');
      if (checked === 'true') return true;
      if (checked === 'false') return false;
      return null;
    };

    const allFields = Array.from(document.querySelectorAll('input, textarea, select'))
      .map((field) => {
        const f = field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const value = 'value' in f ? String(f.value || '') : '';
        const required = Boolean(f.getAttribute('required') !== null || f.getAttribute('aria-required') === 'true');
        return { label: labelFor(f), value: normalize(value), required };
      })
      .filter((f) => f.label || f.value);

    const findByLabel = (needle: string) => {
      const candidate = allFields.find((f) => f.label.toLowerCase().includes(needle.toLowerCase()));
      return candidate?.value || '';
    };

    const statusRows = Array.from(document.querySelectorAll('input, textarea, select')).filter((f) => {
      const l = labelFor(f).toLowerCase();
      return l.includes('status') || l.includes('to do') || l.includes('in progress') || l.includes('done');
    });

    const statuses = Array.from(document.querySelectorAll('div'))
      .map((row) => {
        const inputs = Array.from(row.querySelectorAll('input')) as HTMLInputElement[];
        if (inputs.length === 0) return null;
        const textInputs = inputs.filter((i) => i.type === 'text' || i.type === 'search' || i.type === '');
        const name = (textInputs[0]?.value || '').trim();
        if (!name) return null;
        const color = (textInputs[1]?.value || textInputs[1]?.getAttribute('style') || '').trim();
        const initialToggle = Array.from(row.querySelectorAll('input[type="checkbox"], [aria-checked]')).find((el) => {
          return (el.closest('div')?.textContent || '').toLowerCase().includes('initial');
        });
        const finalToggle = Array.from(row.querySelectorAll('input[type="checkbox"], [aria-checked]')).find((el) => {
          return (el.closest('div')?.textContent || '').toLowerCase().includes('final');
        });
        return {
          name,
          colorToken: color,
          initial: toBool(initialToggle || null),
          final: toBool(finalToggle || null)
        };
      })
      .filter(Boolean) as Array<{ name: string; colorToken: string; initial: boolean | null; final: boolean | null }>;

    const dedupStatuses = Array.from(new Map(statuses.map((s) => [s.name, s])).values());

    const transitions = Array.from(document.querySelectorAll('div'))
      .map((row) => {
        const t = normalize(text(row));
        if (!t) return null;
        const lc = t.toLowerCase();
        if (!lc.includes('transition') && !lc.includes('from') && !lc.includes('to')) return null;
        const selects = Array.from(row.querySelectorAll('select, [role="combobox"], input[type="text"]')) as Array<HTMLElement>;
        const values = selects
          .map((s) => {
            if ('value' in s) return normalize(String((s as HTMLInputElement).value || ''));
            return normalize(text(s));
          })
          .filter(Boolean);
        const source = values[0] || '';
        const target = values[1] || '';
        const condition = values[2] || '';
        const action = values[3] || '';
        return {
          summary: t,
          source,
          target,
          condition,
          action
        };
      })
      .filter(Boolean) as Array<{ summary: string; source: string; target: string; condition: string; action: string }>;

    const visibleErrors = Array.from(document.querySelectorAll('[role="alert"], [aria-invalid="true"], .error, .text-red-500, .text-destructive'))
      .map((el) => normalize(text(el)))
      .filter(Boolean);

    const requiredFieldsMissing = allFields
      .filter((f) => f.required && !f.value)
      .map((f) => f.label || 'unlabeled-required-field');

    const actionButtons = Array.from(document.querySelectorAll('button'))
      .map((b) => {
        const label = normalize(text(b));
        if (!label) return null;
        return { name: label, enabled: !(b as HTMLButtonElement).disabled && b.getAttribute('aria-disabled') !== 'true' };
      })
      .filter(Boolean) as Array<{ name: string; enabled: boolean }>;

    const localStorageDump: Record<string, string> = {};
    const sessionStorageDump: Record<string, string> = {};

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      localStorageDump[key] = localStorage.getItem(key) || '';
    }

    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      sessionStorageDump[key] = sessionStorage.getItem(key) || '';
    }

    return {
      workflowName: findByLabel('workflow name'),
      description: findByLabel('description'),
      bindToProject: findByLabel('bind to project') || findByLabel('project'),
      templateType: findByLabel('template type'),
      active: toBool(Array.from(document.querySelectorAll('input[type="checkbox"], [aria-checked]')).find((el) => (el.closest('div')?.textContent || '').toLowerCase().includes('active')) || null),
      isDefault: toBool(Array.from(document.querySelectorAll('input[type="checkbox"], [aria-checked]')).find((el) => (el.closest('div')?.textContent || '').toLowerCase().includes('default')) || null),
      statuses: dedupStatuses,
      transitions,
      requiredFieldsMissing,
      visibleErrors,
      actionButtons,
      formFields: allFields,
      storage: {
        localStorage: localStorageDump,
        sessionStorage: sessionStorageDump
      }
    };
  });

  return data;
}

async function writeCheckpointSnapshot(page: Page, checkpoint: string, snapshots: Snapshot[], outDir: string, index: number) {
  let evidence: Snapshot['evidence'];
  try {
    evidence = await extractEvidence(page);
  } catch (error) {
    evidence = {
      workflowName: '',
      description: '',
      bindToProject: '',
      templateType: '',
      active: null,
      isDefault: null,
      statuses: [],
      transitions: [],
      requiredFieldsMissing: [],
      visibleErrors: [`snapshot-extraction-failed: ${error instanceof Error ? error.message : String(error)}`],
      actionButtons: [],
      formFields: [],
      storage: {
        localStorage: {},
        sessionStorage: {}
      }
    };
  }
  const stateHash = hashSnapshotCore(evidence);
  let title = '';
  let currentUrl = '';
  try {
    title = await page.title();
  } catch {
    title = '<unavailable>';
  }
  try {
    currentUrl = page.url();
  } catch {
    currentUrl = '<unavailable>';
  }

  const snap: Snapshot = {
    ts: new Date().toISOString(),
    checkpoint,
    url: currentUrl,
    title,
    stateHash,
    evidence
  };

  snapshots.push(snap);

  const safeLabel = checkpoint.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase().slice(0, 60) || `checkpoint-${index}`;
  try {
    await page.screenshot({ path: path.join(outDir, `snapshot-${String(index).padStart(3, '0')}-${safeLabel}.png`), fullPage: true });
  } catch {
  }
}

async function main() {
  const targetUrl = process.env.VEROPM_AUTOMATION_URL || 'https://app.veropm.app/workspace/a5d2ddb4-6ae9-40d1-8f99-34fbd23fdbde/automation';
  const autoMode = process.env.GOVERNANCE_AUTO_MODE === '1';
  const autoDurationMs = Number(process.env.GOVERNANCE_AUTO_DURATION_MS || 1200000);
  const loginWaitMs = Number(process.env.GOVERNANCE_LOGIN_WAIT_MS || 300000);
  const gotoTimeoutMs = Number(process.env.GOVERNANCE_GOTO_TIMEOUT_MS || 180000);
  const cdpUrl = process.env.GOVERNANCE_CDP_URL || '';
  const runId = stamp();
  const outDir = path.resolve('artifacts', 'veropm-governance', `run-${runId}`);
  ensureDir(outDir);
  const eventLogPath = path.join(outDir, 'events.jsonl');
  const snapshots: Snapshot[] = [];

  let browser: Browser | null = null;
  let context: BrowserContext;
  const usingCdp = Boolean(cdpUrl);

  if (usingCdp) {
    browser = await chromium.connectOverCDP(cdpUrl);
    context = browser.contexts()[0] || await browser.newContext();
  } else {
    context = await chromium.launchPersistentContext(path.join(outDir, 'browser-profile'), {
      headless: false,
      viewport: { width: 1600, height: 1000 },
      recordHar: {
        path: path.join(outDir, 'network.har'),
        mode: 'full',
        content: 'embed'
      }
    });
  }

  try {
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  } catch {
  }

  const page = context.pages().find((p) => p.url().includes('app.veropm.app')) || context.pages()[0] || await context.newPage();

  context.on('request', (req) => {
    if (!isRelevantUrl(req.url())) {
      return;
    }
    appendJsonl(eventLogPath, {
      ts: new Date().toISOString(),
      type: 'request',
      data: {
        url: req.url(),
        method: req.method(),
        resourceType: req.resourceType()
      }
    });
  });

  context.on('response', async (res) => {
    if (!isRelevantUrl(res.url())) {
      return;
    }
    const status = res.status();
    const entry: LogEvent = {
      ts: new Date().toISOString(),
      type: 'response',
      data: {
        url: res.url(),
        status,
        ok: status >= 200 && status < 300,
        method: res.request().method()
      }
    };
    if (status >= 400) {
      try {
        const body = await res.text();
        entry.data.bodySample = body.slice(0, 2000);
      } catch {
        entry.data.bodySample = '<unavailable>';
      }
    }
    appendJsonl(eventLogPath, entry);
  });

  page.on('console', (msg) => {
    appendJsonl(eventLogPath, {
      ts: new Date().toISOString(),
      type: 'console',
      data: {
        level: msg.type(),
        text: msg.text()
      }
    });
  });

  page.on('pageerror', (error) => {
    appendJsonl(eventLogPath, {
      ts: new Date().toISOString(),
      type: 'pageerror',
      data: {
        message: error.message,
        stack: error.stack || ''
      }
    });
  });

  if (!usingCdp) {
    await resilientGoto(page, targetUrl, gotoTimeoutMs);
    await waitForPostLoginReady(page, loginWaitMs);
  } else {
    output.write('CDP mode: using existing browser session. Open the target VeroPM workspace tab if needed.\n');
  }

  if (autoMode) {
    output.write(`Governance auto-capture run directory: ${outDir}\n`);
    output.write(`Auto mode active for ${Math.round(autoDurationMs / 1000)} seconds.\n`);
    output.write(`Login grace wait configured: ${Math.round(loginWaitMs / 1000)} seconds.\n`);
    output.write(`Navigation timeout configured: ${Math.round(gotoTimeoutMs / 1000)} seconds.\n`);
    output.write('Perform the full flow in browser (create, save, verify, failure path).\n\n');

    await writeCheckpointSnapshot(page, 'auto-baseline', snapshots, outDir, 0);

    const start = Date.now();
    let index = 1;
    while (Date.now() - start < autoDurationMs) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
      await writeCheckpointSnapshot(page, `auto-tick-${index}`, snapshots, outDir, index);
      index += 1;
    }

    await writeCheckpointSnapshot(page, 'auto-final', snapshots, outDir, index);
  } else {
    const rl = readline.createInterface({ input, output });
    output.write(`Governance capture run directory: ${outDir}\n`);
    output.write('Required capture sequence for deterministic cloning:\n');
    output.write('1) baseline-loaded\n');
    output.write('2) creation-entry-opened\n');
    output.write('3) minimum-fields-populated\n');
    output.write('4) submit-invoked\n');
    output.write('5) persistence-verified\n');
    output.write('6) failure-path-observed\n\n');

    await rl.question('Press ENTER when target page is loaded and authenticated (baseline-loaded)... ');
    await writeCheckpointSnapshot(page, 'baseline-loaded', snapshots, outDir, 0);

    await rl.question('Open creation entry (New/Add/Create), leave it open, then press ENTER (creation-entry-opened)... ');
    await writeCheckpointSnapshot(page, 'creation-entry-opened', snapshots, outDir, 1);

    await rl.question('Populate minimal required fields without submit, then press ENTER (minimum-fields-populated)... ');
    await writeCheckpointSnapshot(page, 'minimum-fields-populated', snapshots, outDir, 2);

    await rl.question('Trigger save/create/submit and wait for completion, then press ENTER (submit-invoked)... ');
    await writeCheckpointSnapshot(page, 'submit-invoked', snapshots, outDir, 3);

    await rl.question('Confirm entity persists after refresh/list read, then press ENTER (persistence-verified)... ');
    await writeCheckpointSnapshot(page, 'persistence-verified', snapshots, outDir, 4);

    await rl.question('Execute one controlled failure path and keep final error visible, then press ENTER (failure-path-observed)... ');
    await writeCheckpointSnapshot(page, 'failure-path-observed', snapshots, outDir, 5);
    await rl.close();
  }

  fs.writeFileSync(path.join(outDir, 'snapshots.json'), JSON.stringify(snapshots, null, 2), 'utf-8');
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({
    runId,
    createdAt: new Date().toISOString(),
    targetUrl,
    snapshotCount: snapshots.length,
    requiredCheckpoints: [
      'baseline-loaded',
      'creation-entry-opened',
      'minimum-fields-populated',
      'submit-invoked',
      'persistence-verified',
      'failure-path-observed'
    ],
    files: [
      'manifest.json',
      'snapshots.json',
      'events.jsonl',
      'network.har',
      'trace.zip'
    ]
  }, null, 2), 'utf-8');

  try {
    await context.tracing.stop({ path: path.join(outDir, 'trace.zip') });
  } catch {
  }

  if (usingCdp && browser) {
    await browser.close();
  } else {
    await context.close();
  }

  output.write(`Capture complete: ${outDir}\n`);
}

main().catch((error) => {
  console.error('capture-veropm-automation failed:', error);
  process.exit(1);
});
