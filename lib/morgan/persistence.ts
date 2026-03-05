import { promises as fs } from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';

export interface MorganProject {
  id: string;
  name: string;
  code: string;
  portfolio: string;
  priority: string;
  status: string;
  value: string | number;
  progress: number;
  paymentDueAt: string;
  dlpEndAt: string;
  milestoneDueAt: string;
  description?: string;
  manager?: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  idempotencyKey?: string;
}

export interface MorganTender {
  id: string;
  name: string;
  value: string | number;
  status: string;
  compliance: number;
  deadlineAt: string;
  owner: string;
  idempotencyKey?: string;
}

export interface MorganTenantContext {
  tenantId: string;
  userId: string;
  workspaceId: string;
}

export interface MorganWorkflow {
  id: string;
  name: string;
  description?: string;
  workspaceId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface MorganAutomationRule {
  id: string;
  workflowId?: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface MorganAutomationExecutionHistory {
  id: string;
  ruleId: string;
  event: string;
  state: string;
  createdAt: string;
}

export interface MorganTask {
  id: string;
  title: string;
  description?: string;
  project?: string;
  assignee?: string;
  due?: string;
  priority: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganIssue {
  id: string;
  title: string;
  severity: string;
  project?: string;
  status: string;
  assignee?: string;
  raised?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganRisk {
  id: string;
  title: string;
  project?: string;
  category: string;
  probability: string;
  impact: string;
  status: string;
  owner?: string;
  raised?: string;
  mitigation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganMilestone {
  id: string;
  name: string;
  project?: string;
  dueDate?: string;
  status: string;
  type: string;
  owner?: string;
  progress: number;
  approvalStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganDocument {
  id: string;
  name: string;
  type: string;
  size?: string;
  project?: string;
  category: string;
  author?: string;
  modified?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganPortfolio {
  id: string;
  name: string;
  description?: string;
  projectCount: number;
  totalBudget: number;
  health: string;
  color?: string;
  manager?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  type?: string;
  version?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganMeeting {
  id: string;
  title: string;
  date: string;
  time?: string;
  attendees: number;
  type: string;
  location?: string;
  status: string;
  organizer?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganTimeReport {
  id: string;
  date: string;
  project: string;
  description: string;
  hours: number;
  status: string;
  user?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganTimesheet {
  id: string;
  user: string;
  project?: string;
  period?: string;
  hours: number;
  overtime: number;
  status: string;
  notes?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MorganStore {
  projects: MorganProject[];
  tenders: MorganTender[];
  workflows: MorganWorkflow[];
  automations: MorganAutomationRule[];
  automationExecutionHistory: MorganAutomationExecutionHistory[];
}

interface MorganStoreFile {
  version: number;
  tenants: Record<string, MorganStore>;
}

const storePath = path.join(process.cwd(), 'data_exports', 'morgan-backbone-store.json');
const TABLE_MORGAN_PROJECTS = 'morgan_projects';
const TABLE_MORGAN_TENDERS = 'morgan_tenders';
const TABLE_MORGAN_WORKFLOWS = 'morgan_workflows';
const TABLE_MORGAN_AUTOMATIONS = 'morgan_automations';
const TABLE_MORGAN_AUTOMATION_HISTORY = 'morgan_automation_execution_history';
const TABLE_MORGAN_TASKS = 'morgan_tasks';
const TABLE_MORGAN_ISSUES = 'morgan_issues';
const TABLE_MORGAN_RISKS = 'morgan_risks';
const TABLE_MORGAN_MILESTONES = 'morgan_milestones';
const TABLE_MORGAN_DOCUMENTS = 'morgan_documents';
const TABLE_MORGAN_PORTFOLIOS = 'morgan_portfolios';
const TABLE_MORGAN_TIMESHEETS = 'morgan_timesheets';
const TABLE_MORGAN_TEMPLATES = 'morgan_templates';
const TABLE_MORGAN_MEETINGS = 'morgan_meetings';
const TABLE_MORGAN_TIME_REPORTS = 'morgan_time_reports';
const DEFAULT_TENANT_CONTEXT: MorganTenantContext = {
  tenantId: 'public:default',
  userId: 'public',
  workspaceId: 'default'
};

function nowIso(): string {
  return new Date().toISOString();
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasSupabasePersistence(): boolean {
  return Boolean(supabaseAdmin);
}

const ALLOW_FILE_STORE = process.env.MORGAN_ALLOW_FILE_STORE === 'true';

function requireSupabasePersistence(entity: string) {
  if (!hasSupabasePersistence() && !ALLOW_FILE_STORE) {
    throw new Error(`Supabase is not configured for ${entity}. Set MORGAN_ALLOW_FILE_STORE=true for local fallback.`);
  }
}

function asTenant(context?: MorganTenantContext): MorganTenantContext {
  return context ?? DEFAULT_TENANT_CONTEXT;
}

function projectRecordToMorgan(record: any): MorganProject {
  return {
    id: record.id,
    name: record.name,
    code: record.code,
    portfolio: record.portfolio,
    priority: record.priority,
    status: record.status,
    value: record.value,
    progress: Number(record.progress ?? 0),
    paymentDueAt: record.payment_due_at,
    dlpEndAt: record.dlp_end_at,
    milestoneDueAt: record.milestone_due_at,
    idempotencyKey: record.idempotency_key
  };
}

function tenderRecordToMorgan(record: any): MorganTender {
  return {
    id: record.id,
    name: record.name,
    value: record.value,
    status: record.status,
    compliance: Number(record.compliance ?? 0),
    deadlineAt: record.deadline_at,
    owner: record.owner,
    idempotencyKey: record.idempotency_key
  };
}

function workflowRecordToMorgan(record: any): MorganWorkflow {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? undefined,
    workspaceId: record.workspace_id,
    status: record.status,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
}

function automationRecordToMorgan(record: any): MorganAutomationRule {
  return {
    id: record.id,
    workflowId: record.workflow_id ?? undefined,
    name: record.name,
    description: record.description ?? undefined,
    status: record.status,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
}

function historyRecordToMorgan(record: any): MorganAutomationExecutionHistory {
  return {
    id: record.id,
    ruleId: record.rule_id,
    event: record.event,
    state: record.state,
    createdAt: record.created_at
  };
}

export function buildTenantContext(userId: string, workspaceId: string): MorganTenantContext {
  const safeUserId = userId || 'public';
  const safeWorkspaceId = workspaceId || 'default';
  return {
    tenantId: `${safeUserId}:${safeWorkspaceId}`,
    userId: safeUserId,
    workspaceId: safeWorkspaceId
  };
}

function getSeedStore(): MorganStore {
  return {
    projects: [],
    tenders: [],
    workflows: [],
    automations: [],
    automationExecutionHistory: []
  };
}

async function ensureStoreDir(): Promise<void> {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
}

function coerceStore(raw: any): MorganStore {
  return {
    projects: Array.isArray(raw?.projects) ? raw.projects : [],
    tenders: Array.isArray(raw?.tenders) ? raw.tenders : [],
    workflows: Array.isArray(raw?.workflows) ? raw.workflows : [],
    automations: Array.isArray(raw?.automations) ? raw.automations : [],
    automationExecutionHistory: Array.isArray(raw?.automationExecutionHistory) ? raw.automationExecutionHistory : []
  };
}

async function loadStoreFile(): Promise<MorganStoreFile> {
  await ensureStoreDir();

  try {
    const raw = await fs.readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw) as any;

    if (parsed && typeof parsed === 'object' && parsed.tenants && typeof parsed.tenants === 'object') {
      const normalizedTenants = Object.fromEntries(
        Object.entries(parsed.tenants).map(([tenantId, tenantStore]) => [tenantId, coerceStore(tenantStore)])
      );

      return {
        version: typeof parsed.version === 'number' ? parsed.version : 2,
        tenants: normalizedTenants
      };
    }

    if (parsed && typeof parsed === 'object') {
      return {
        version: 2,
        tenants: {
          [DEFAULT_TENANT_CONTEXT.tenantId]: coerceStore(parsed)
        }
      };
    }
  } catch {
    // noop
  }

  return {
    version: 2,
    tenants: {
      [DEFAULT_TENANT_CONTEXT.tenantId]: getSeedStore()
    }
  };
}

async function saveStoreFile(file: MorganStoreFile): Promise<void> {
  await ensureStoreDir();
  await fs.writeFile(storePath, `${JSON.stringify(file, null, 2)}\n`, 'utf8');
}

function normalizeTenantContext(context?: MorganTenantContext): MorganTenantContext {
  return context ?? DEFAULT_TENANT_CONTEXT;
}

async function getTenantStore(context?: MorganTenantContext): Promise<{ file: MorganStoreFile; tenant: MorganTenantContext; store: MorganStore }> {
  const file = await loadStoreFile();
  const tenant = normalizeTenantContext(context);

  if (!file.tenants[tenant.tenantId]) {
    file.tenants[tenant.tenantId] = getSeedStore();
    await saveStoreFile(file);
  }

  return {
    file,
    tenant,
    store: file.tenants[tenant.tenantId]
  };
}

export async function loadMorganStore(context?: MorganTenantContext): Promise<MorganStore> {
  const tenantStore = await getTenantStore(context);
  return tenantStore.store;
}

export async function saveMorganStore(store: MorganStore, context?: MorganTenantContext): Promise<void> {
  const tenant = normalizeTenantContext(context);
  const file = await loadStoreFile();
  file.tenants[tenant.tenantId] = store;
  await saveStoreFile(file);
}

export async function listProjects(context?: MorganTenantContext): Promise<MorganProject[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PROJECTS)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map(projectRecordToMorgan);
    }
  }

  const store = await loadMorganStore(context);
  return store.projects;
}

export async function createProject(input: Partial<MorganProject>, context?: MorganTenantContext): Promise<MorganProject> {
  requireSupabasePersistence('projects');
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload: Record<string, unknown> = {
      id: input.id || generateId('PRJ'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      name: input.name || 'Untitled Project',
      code: input.code || `MCE-${Math.floor(Math.random() * 9000 + 1000)}`,
      portfolio: input.portfolio || 'General',
      priority: input.priority || 'Medium',
      status: input.status || 'Draft',
      value: Number(input.value || 0),
      progress: typeof input.progress === 'number' ? input.progress : 0,
      payment_due_at: input.paymentDueAt || now,
      dlp_end_at: input.dlpEndAt || now,
      milestone_due_at: input.milestoneDueAt || now,
      created_at: now,
      updated_at: now
    };
    if (input.description) payload.description = input.description;
    if (input.manager) payload.manager = input.manager;
    if (input.clientName) payload.client_name = input.clientName;
    if (input.startDate) payload.start_date = input.startDate;
    if (input.endDate) payload.end_date = input.endDate;
    if (input.location) payload.location = input.location;
    if (input.idempotencyKey) payload.idempotency_key = input.idempotencyKey;

    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PROJECTS)
      .insert(payload)
      .select('*')
      .single();

    if (!error && data) {
      return projectRecordToMorgan(data);
    }
  }

  const store = await loadMorganStore(context);
  const project: MorganProject = {
    id: input.id || generateId('PRJ'),
    name: input.name || 'Untitled Project',
    code: input.code || `MCE-${Math.floor(Math.random() * 9000 + 1000)}`,
    portfolio: input.portfolio || 'General',
    priority: input.priority || 'Medium',
    status: input.status || 'Draft',
    value: input.value || 0,
    progress: typeof input.progress === 'number' ? input.progress : 0,
    paymentDueAt: input.paymentDueAt || nowIso(),
    dlpEndAt: input.dlpEndAt || nowIso(),
    milestoneDueAt: input.milestoneDueAt || nowIso(),
    description: input.description,
    manager: input.manager,
    clientName: input.clientName,
    startDate: input.startDate,
    endDate: input.endDate,
    location: input.location,
    idempotencyKey: input.idempotencyKey
  };

  store.projects.unshift(project);
  await saveMorganStore(store, context);
  return project;
}

export async function getProjectById(id: string, context?: MorganTenantContext): Promise<MorganProject | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PROJECTS)
      .select('*')
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .maybeSingle();

    if (!error && data) {
      return projectRecordToMorgan(data);
    }
  }

  const store = await loadMorganStore(context);
  return store.projects.find((project) => project.id === id) ?? null;
}

export async function updateProject(id: string, patch: Partial<MorganProject>, context?: MorganTenantContext): Promise<MorganProject | null> {
  requireSupabasePersistence('projects');
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const updatePayload: any = {
      updated_at: nowIso()
    };

    if (typeof patch.name !== 'undefined') updatePayload.name = patch.name;
    if (typeof patch.code !== 'undefined') updatePayload.code = patch.code;
    if (typeof patch.portfolio !== 'undefined') updatePayload.portfolio = patch.portfolio;
    if (typeof patch.priority !== 'undefined') updatePayload.priority = patch.priority;
    if (typeof patch.status !== 'undefined') updatePayload.status = patch.status;
    if (typeof patch.value !== 'undefined') updatePayload.value = Number(patch.value);
    if (typeof patch.progress !== 'undefined') updatePayload.progress = patch.progress;
    if (typeof patch.paymentDueAt !== 'undefined') updatePayload.payment_due_at = patch.paymentDueAt;
    if (typeof patch.dlpEndAt !== 'undefined') updatePayload.dlp_end_at = patch.dlpEndAt;
    if (typeof patch.milestoneDueAt !== 'undefined') updatePayload.milestone_due_at = patch.milestoneDueAt;

    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PROJECTS)
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .select('*')
      .maybeSingle();

    if (!error && data) {
      return projectRecordToMorgan(data);
    }
    if (!error && !data) {
      return null;
    }
  }

  const store = await loadMorganStore(context);
  const index = store.projects.findIndex((project) => project.id === id);
  if (index < 0) return null;

  const next = {
    ...store.projects[index],
    ...patch,
    id
  };

  store.projects[index] = next;
  await saveMorganStore(store, context);
  return next;
}

export async function deleteProject(id: string, context?: MorganTenantContext): Promise<boolean> {
  requireSupabasePersistence('projects');
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PROJECTS)
      .delete()
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .select('id');

    if (!error) {
      return Array.isArray(data) && data.length > 0;
    }
  }

  const store = await loadMorganStore(context);
  const next = store.projects.filter((project) => project.id !== id);
  if (next.length === store.projects.length) return false;

  store.projects = next;
  await saveMorganStore(store, context);
  return true;
}

export async function listTenders(context?: MorganTenantContext): Promise<MorganTender[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TENDERS)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map(tenderRecordToMorgan);
    }
  }

  const store = await loadMorganStore(context);
  return store.tenders;
}

export async function createTender(input: Partial<MorganTender>, context?: MorganTenantContext): Promise<MorganTender> {
  requireSupabasePersistence('tenders');
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload: Record<string, unknown> = {
      id: input.id || generateId('TDR'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      name: input.name || 'Untitled Tender',
      value: Number(input.value || 0),
      status: input.status || 'Draft',
      compliance: typeof input.compliance === 'number' ? input.compliance : 0,
      deadline_at: input.deadlineAt || now,
      owner: input.owner || 'Tender Owner',
      created_at: now,
      updated_at: now
    };
    if (input.idempotencyKey) payload.idempotency_key = input.idempotencyKey;

    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TENDERS)
      .insert(payload)
      .select('*')
      .single();

    if (!error && data) {
      return tenderRecordToMorgan(data);
    }
  }

  const store = await loadMorganStore(context);
  const tender: MorganTender = {
    id: input.id || generateId('TDR'),
    name: input.name || 'Untitled Tender',
    value: input.value || 0,
    status: input.status || 'Draft',
    compliance: typeof input.compliance === 'number' ? input.compliance : 0,
    deadlineAt: input.deadlineAt || nowIso(),
    owner: input.owner || 'Tender Owner',
    idempotencyKey: input.idempotencyKey
  };

  store.tenders.unshift(tender);
  await saveMorganStore(store, context);
  return tender;
}

export async function getTenderById(id: string, context?: MorganTenantContext): Promise<MorganTender | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TENDERS)
      .select('*')
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .maybeSingle();

    if (!error && data) {
      return tenderRecordToMorgan(data);
    }
  }

  const store = await loadMorganStore(context);
  return store.tenders.find((tender) => tender.id === id) ?? null;
}

export async function updateTender(id: string, patch: Partial<MorganTender>, context?: MorganTenantContext): Promise<MorganTender | null> {
  requireSupabasePersistence('tenders');
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const updatePayload: any = {
      updated_at: nowIso()
    };

    if (typeof patch.name !== 'undefined') updatePayload.name = patch.name;
    if (typeof patch.value !== 'undefined') updatePayload.value = Number(patch.value);
    if (typeof patch.status !== 'undefined') updatePayload.status = patch.status;
    if (typeof patch.compliance !== 'undefined') updatePayload.compliance = patch.compliance;
    if (typeof patch.deadlineAt !== 'undefined') updatePayload.deadline_at = patch.deadlineAt;
    if (typeof patch.owner !== 'undefined') updatePayload.owner = patch.owner;

    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TENDERS)
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .select('*')
      .maybeSingle();

    if (!error && data) {
      return tenderRecordToMorgan(data);
    }
    if (!error && !data) {
      return null;
    }
  }

  const store = await loadMorganStore(context);
  const index = store.tenders.findIndex((tender) => tender.id === id);
  if (index < 0) return null;

  const next = {
    ...store.tenders[index],
    ...patch,
    id
  };

  store.tenders[index] = next;
  await saveMorganStore(store, context);
  return next;
}

export async function deleteTender(id: string, context?: MorganTenantContext): Promise<boolean> {
  requireSupabasePersistence('tenders');
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TENDERS)
      .delete()
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .select('id');

    if (!error) {
      return Array.isArray(data) && data.length > 0;
    }
  }

  const store = await loadMorganStore(context);
  const next = store.tenders.filter((tender) => tender.id !== id);
  if (next.length === store.tenders.length) return false;

  store.tenders = next;
  await saveMorganStore(store, context);
  return true;
}

export async function listWorkflows(context?: MorganTenantContext): Promise<MorganWorkflow[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_WORKFLOWS)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map(workflowRecordToMorgan);
    }
  }

  const store = await loadMorganStore(context);
  return store.workflows;
}

export async function createWorkflowRecord(input: Partial<MorganWorkflow>, context?: MorganTenantContext): Promise<MorganWorkflow> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('WFL'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      name: input.name || 'Untitled Workflow',
      description: input.description || null,
      status: input.status || 'ACTIVE',
      created_at: now,
      updated_at: now
    };

    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_WORKFLOWS)
      .insert(payload)
      .select('*')
      .single();

    if (!error && data) {
      return workflowRecordToMorgan(data);
    }
  }

  const store = await loadMorganStore(context);
  const tenant = normalizeTenantContext(context);
  const workflow: MorganWorkflow = {
    id: input.id || generateId('WFL'),
    name: input.name || 'Untitled Workflow',
    description: input.description,
    workspaceId: input.workspaceId || tenant.workspaceId,
    status: input.status || 'ACTIVE',
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  store.workflows.unshift(workflow);
  await saveMorganStore(store, context);
  return workflow;
}

export async function getWorkflowById(id: string, context?: MorganTenantContext): Promise<MorganWorkflow | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_WORKFLOWS)
      .select('*')
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .maybeSingle();

    if (!error && data) {
      return workflowRecordToMorgan(data);
    }
  }

  const store = await loadMorganStore(context);
  return store.workflows.find((workflow) => workflow.id === id) ?? null;
}

export async function updateWorkflow(id: string, patch: Partial<MorganWorkflow>, context?: MorganTenantContext): Promise<MorganWorkflow | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const updatePayload: any = {
      updated_at: nowIso()
    };

    if (typeof patch.name !== 'undefined') updatePayload.name = patch.name;
    if (typeof patch.description !== 'undefined') updatePayload.description = patch.description;
    if (typeof patch.status !== 'undefined') updatePayload.status = patch.status;

    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_WORKFLOWS)
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .select('*')
      .maybeSingle();

    if (!error && data) {
      return workflowRecordToMorgan(data);
    }
    if (!error && !data) {
      return null;
    }
  }

  const store = await loadMorganStore(context);
  const index = store.workflows.findIndex((workflow) => workflow.id === id);
  if (index < 0) return null;

  const next: MorganWorkflow = {
    ...store.workflows[index],
    ...patch,
    id,
    updatedAt: nowIso()
  };

  store.workflows[index] = next;
  await saveMorganStore(store, context);
  return next;
}

export async function deleteWorkflow(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_WORKFLOWS)
      .delete()
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .select('id');

    if (!error) {
      return Array.isArray(data) && data.length > 0;
    }
  }

  const store = await loadMorganStore(context);
  const next = store.workflows.filter((workflow) => workflow.id !== id);
  if (next.length === store.workflows.length) return false;

  store.workflows = next;
  await saveMorganStore(store, context);
  return true;
}

export async function listAutomations(context?: MorganTenantContext): Promise<MorganAutomationRule[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_AUTOMATIONS)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map(automationRecordToMorgan);
    }
  }

  const store = await loadMorganStore(context);
  return store.automations;
}

export async function createAutomationRecord(input: Partial<MorganAutomationRule>, context?: MorganTenantContext): Promise<MorganAutomationRule> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('AUT'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      workflow_id: input.workflowId || null,
      name: input.name || 'Untitled Rule',
      description: input.description || null,
      status: input.status || 'ACTIVE',
      created_at: now,
      updated_at: now
    };

    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_AUTOMATIONS)
      .insert(payload)
      .select('*')
      .single();

    if (!error && data) {
      return automationRecordToMorgan(data);
    }
  }

  const store = await loadMorganStore(context);
  const automation: MorganAutomationRule = {
    id: input.id || generateId('AUT'),
    workflowId: input.workflowId,
    name: input.name || 'Untitled Rule',
    description: input.description,
    status: input.status || 'ACTIVE',
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  store.automations.unshift(automation);
  await saveMorganStore(store, context);
  return automation;
}

export async function getAutomationById(id: string, context?: MorganTenantContext): Promise<MorganAutomationRule | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_AUTOMATIONS)
      .select('*')
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .maybeSingle();

    if (!error && data) {
      return automationRecordToMorgan(data);
    }
  }

  const store = await loadMorganStore(context);
  return store.automations.find((automation) => automation.id === id) ?? null;
}

export async function updateAutomation(id: string, patch: Partial<MorganAutomationRule>, context?: MorganTenantContext): Promise<MorganAutomationRule | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const updatePayload: any = {
      updated_at: nowIso()
    };

    if (typeof patch.workflowId !== 'undefined') updatePayload.workflow_id = patch.workflowId;
    if (typeof patch.name !== 'undefined') updatePayload.name = patch.name;
    if (typeof patch.description !== 'undefined') updatePayload.description = patch.description;
    if (typeof patch.status !== 'undefined') updatePayload.status = patch.status;

    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_AUTOMATIONS)
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .select('*')
      .maybeSingle();

    if (!error && data) {
      return automationRecordToMorgan(data);
    }
    if (!error && !data) {
      return null;
    }
  }

  const store = await loadMorganStore(context);
  const index = store.automations.findIndex((automation) => automation.id === id);
  if (index < 0) return null;

  const next: MorganAutomationRule = {
    ...store.automations[index],
    ...patch,
    id,
    updatedAt: nowIso()
  };

  store.automations[index] = next;
  await saveMorganStore(store, context);
  return next;
}

export async function deleteAutomation(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_AUTOMATIONS)
      .delete()
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .select('id');

    if (!error) {
      return Array.isArray(data) && data.length > 0;
    }
  }

  const store = await loadMorganStore(context);
  const next = store.automations.filter((automation) => automation.id !== id);
  if (next.length === store.automations.length) return false;

  store.automations = next;
  store.automationExecutionHistory = store.automationExecutionHistory.filter((entry) => entry.ruleId !== id);
  await saveMorganStore(store, context);
  return true;
}

export async function addAutomationExecutionHistory(ruleId: string, event: string, state: string, context?: MorganTenantContext): Promise<MorganAutomationExecutionHistory> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const payload = {
      id: generateId('HEX'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      rule_id: ruleId,
      event,
      state,
      created_at: nowIso()
    };

    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_AUTOMATION_HISTORY)
      .insert(payload)
      .select('*')
      .single();

    if (!error && data) {
      return historyRecordToMorgan(data);
    }
  }

  const store = await loadMorganStore(context);
  const history: MorganAutomationExecutionHistory = {
    id: generateId('HEX'),
    ruleId,
    event,
    state,
    createdAt: nowIso()
  };

  store.automationExecutionHistory.unshift(history);
  await saveMorganStore(store, context);
  return history;
}

export async function listAutomationExecutionHistory(ruleId: string, context?: MorganTenantContext): Promise<MorganAutomationExecutionHistory[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_AUTOMATION_HISTORY)
      .select('*')
      .eq('rule_id', ruleId)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map(historyRecordToMorgan);
    }
  }

  const store = await loadMorganStore(context);
  return store.automationExecutionHistory.filter((entry) => entry.ruleId === ruleId);
}

export async function listAllAutomationExecutionHistory(context?: MorganTenantContext): Promise<MorganAutomationExecutionHistory[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_AUTOMATION_HISTORY)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && Array.isArray(data)) {
      return data.map(historyRecordToMorgan);
    }
  }

  const store = await loadMorganStore(context);
  return store.automationExecutionHistory;
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export async function listTasks(context?: MorganTenantContext): Promise<MorganTask[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TASKS)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(taskRecordToMorgan);
  }
  return [];
}

export async function createTask(input: Partial<MorganTask>, context?: MorganTenantContext): Promise<MorganTask> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('TSK'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      title: input.title || 'Untitled Task',
      description: input.description || null,
      project: input.project || null,
      assignee: input.assignee || null,
      due: input.due || null,
      priority: input.priority || 'Medium',
      status: input.status || 'To Do',
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TASKS).insert(payload).select('*').single();
    if (!error && data) return taskRecordToMorgan(data);
  }
  return { id: generateId('TSK'), title: input.title || 'Untitled Task', priority: input.priority || 'Medium', status: input.status || 'To Do', ...input };
}

export async function getTaskById(id: string, context?: MorganTenantContext): Promise<MorganTask | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TASKS).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).single();
    if (!error && data) return taskRecordToMorgan(data);
  }
  return null;
}

export async function updateTask(id: string, patch: Partial<MorganTask>, context?: MorganTenantContext): Promise<MorganTask | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.project !== undefined) dbPatch.project = patch.project;
    if (patch.assignee !== undefined) dbPatch.assignee = patch.assignee;
    if (patch.due !== undefined) dbPatch.due = patch.due;
    if (patch.priority !== undefined) dbPatch.priority = patch.priority;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TASKS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').single();
    if (!error && data) return taskRecordToMorgan(data);
  }
  return null;
}

export async function deleteTask(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TASKS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

function taskRecordToMorgan(r: Record<string, unknown>): MorganTask {
  return {
    id: r.id as string,
    title: r.title as string,
    description: r.description as string | undefined,
    project: r.project as string | undefined,
    assignee: r.assignee as string | undefined,
    due: r.due as string | undefined,
    priority: (r.priority as string) || 'Medium',
    status: (r.status as string) || 'To Do',
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

// ── Issues ─────────────────────────────────────────────────────────────────

export async function listIssues(context?: MorganTenantContext): Promise<MorganIssue[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_ISSUES)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(issueRecordToMorgan);
  }
  return [];
}

export async function createIssue(input: Partial<MorganIssue>, context?: MorganTenantContext): Promise<MorganIssue> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('ISS'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      title: input.title || 'Untitled Issue',
      severity: input.severity || 'Medium',
      project: input.project || null,
      status: input.status || 'Open',
      assignee: input.assignee || null,
      raised: input.raised || now.slice(0, 10),
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_ISSUES).insert(payload).select('*').single();
    if (!error && data) return issueRecordToMorgan(data);
  }
  return { id: generateId('ISS'), title: input.title || 'Untitled Issue', severity: input.severity || 'Medium', status: input.status || 'Open', ...input };
}

export async function getIssueById(id: string, context?: MorganTenantContext): Promise<MorganIssue | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_ISSUES).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).single();
    if (!error && data) return issueRecordToMorgan(data);
  }
  return null;
}

export async function updateIssue(id: string, patch: Partial<MorganIssue>, context?: MorganTenantContext): Promise<MorganIssue | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.severity !== undefined) dbPatch.severity = patch.severity;
    if (patch.project !== undefined) dbPatch.project = patch.project;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.assignee !== undefined) dbPatch.assignee = patch.assignee;
    if (patch.raised !== undefined) dbPatch.raised = patch.raised;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_ISSUES).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').single();
    if (!error && data) return issueRecordToMorgan(data);
  }
  return null;
}

export async function deleteIssue(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_ISSUES).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

function issueRecordToMorgan(r: Record<string, unknown>): MorganIssue {
  return {
    id: r.id as string,
    title: r.title as string,
    severity: (r.severity as string) || 'Medium',
    project: r.project as string | undefined,
    status: (r.status as string) || 'Open',
    assignee: r.assignee as string | undefined,
    raised: r.raised as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

// ── Risks ──────────────────────────────────────────────────────────────────

export async function listRisks(context?: MorganTenantContext): Promise<MorganRisk[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_RISKS)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(riskRecordToMorgan);
  }
  return [];
}

export async function createRisk(input: Partial<MorganRisk>, context?: MorganTenantContext): Promise<MorganRisk> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('RSK'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      title: input.title || 'Untitled Risk',
      project: input.project || null,
      category: input.category || 'Technical',
      probability: input.probability || 'Medium',
      impact: input.impact || 'Medium',
      status: input.status || 'Open',
      owner: input.owner || null,
      raised: input.raised || now.slice(0, 10),
      mitigation: input.mitigation || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_RISKS).insert(payload).select('*').single();
    if (!error && data) return riskRecordToMorgan(data);
  }
  return { id: generateId('RSK'), title: input.title || 'Untitled Risk', category: input.category || 'Technical', probability: input.probability || 'Medium', impact: input.impact || 'Medium', status: input.status || 'Open', ...input };
}

export async function getRiskById(id: string, context?: MorganTenantContext): Promise<MorganRisk | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_RISKS).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).single();
    if (!error && data) return riskRecordToMorgan(data);
  }
  return null;
}

export async function updateRisk(id: string, patch: Partial<MorganRisk>, context?: MorganTenantContext): Promise<MorganRisk | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.project !== undefined) dbPatch.project = patch.project;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.probability !== undefined) dbPatch.probability = patch.probability;
    if (patch.impact !== undefined) dbPatch.impact = patch.impact;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.owner !== undefined) dbPatch.owner = patch.owner;
    if (patch.raised !== undefined) dbPatch.raised = patch.raised;
    if (patch.mitigation !== undefined) dbPatch.mitigation = patch.mitigation;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_RISKS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').single();
    if (!error && data) return riskRecordToMorgan(data);
  }
  return null;
}

export async function deleteRisk(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_RISKS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

function riskRecordToMorgan(r: Record<string, unknown>): MorganRisk {
  return {
    id: r.id as string,
    title: r.title as string,
    project: r.project as string | undefined,
    category: (r.category as string) || 'Technical',
    probability: (r.probability as string) || 'Medium',
    impact: (r.impact as string) || 'Medium',
    status: (r.status as string) || 'Open',
    owner: r.owner as string | undefined,
    raised: r.raised as string | undefined,
    mitigation: r.mitigation as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

// ── Milestones ─────────────────────────────────────────────────────────────

export async function listMilestones(context?: MorganTenantContext): Promise<MorganMilestone[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_MILESTONES)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(milestoneRecordToMorgan);
  }
  return [];
}

export async function createMilestone(input: Partial<MorganMilestone>, context?: MorganTenantContext): Promise<MorganMilestone> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('MS'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      name: input.name || 'Untitled Milestone',
      project: input.project || null,
      due_date: input.dueDate || null,
      status: input.status || 'On Track',
      type: input.type || 'Phase Gate',
      owner: input.owner || null,
      progress: typeof input.progress === 'number' ? input.progress : 0,
      approval_status: input.approvalStatus || 'Pending',
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_MILESTONES).insert(payload).select('*').single();
    if (!error && data) return milestoneRecordToMorgan(data);
  }
  return { id: generateId('MS'), name: input.name || 'Untitled Milestone', status: input.status || 'On Track', type: input.type || 'Phase Gate', progress: 0, approvalStatus: input.approvalStatus || 'Pending', ...input };
}

export async function getMilestoneById(id: string, context?: MorganTenantContext): Promise<MorganMilestone | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_MILESTONES).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).single();
    if (!error && data) return milestoneRecordToMorgan(data);
  }
  return null;
}

export async function updateMilestone(id: string, patch: Partial<MorganMilestone>, context?: MorganTenantContext): Promise<MorganMilestone | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.project !== undefined) dbPatch.project = patch.project;
    if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.type !== undefined) dbPatch.type = patch.type;
    if (patch.owner !== undefined) dbPatch.owner = patch.owner;
    if (patch.progress !== undefined) dbPatch.progress = patch.progress;
    if (patch.approvalStatus !== undefined) dbPatch.approval_status = patch.approvalStatus;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_MILESTONES).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').single();
    if (!error && data) return milestoneRecordToMorgan(data);
  }
  return null;
}

export async function deleteMilestone(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_MILESTONES).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

function milestoneRecordToMorgan(r: Record<string, unknown>): MorganMilestone {
  return {
    id: r.id as string,
    name: r.name as string,
    project: r.project as string | undefined,
    dueDate: r.due_date as string | undefined,
    status: (r.status as string) || 'On Track',
    type: (r.type as string) || 'Phase Gate',
    owner: r.owner as string | undefined,
    progress: typeof r.progress === 'number' ? r.progress : 0,
    approvalStatus: (r.approval_status as string) || 'Pending',
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

// ── Documents ──────────────────────────────────────────────────────────────

export async function listDocuments(context?: MorganTenantContext): Promise<MorganDocument[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_DOCUMENTS)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(documentRecordToMorgan);
  }
  return [];
}

export async function createDocument(input: Partial<MorganDocument>, context?: MorganTenantContext): Promise<MorganDocument> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('DOC'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      name: input.name || 'Untitled Document',
      doc_type: input.type || 'PDF',
      size: input.size || null,
      project: input.project || null,
      category: input.category || 'General',
      author: input.author || null,
      modified: input.modified || now.slice(0, 10),
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_DOCUMENTS).insert(payload).select('*').single();
    if (!error && data) return documentRecordToMorgan(data);
  }
  return { id: generateId('DOC'), name: input.name || 'Untitled Document', type: input.type || 'PDF', category: input.category || 'General', ...input };
}

export async function getDocumentById(id: string, context?: MorganTenantContext): Promise<MorganDocument | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_DOCUMENTS).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).single();
    if (!error && data) return documentRecordToMorgan(data);
  }
  return null;
}

export async function updateDocument(id: string, patch: Partial<MorganDocument>, context?: MorganTenantContext): Promise<MorganDocument | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.type !== undefined) dbPatch.doc_type = patch.type;
    if (patch.size !== undefined) dbPatch.size = patch.size;
    if (patch.project !== undefined) dbPatch.project = patch.project;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.author !== undefined) dbPatch.author = patch.author;
    if (patch.modified !== undefined) dbPatch.modified = patch.modified;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_DOCUMENTS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').single();
    if (!error && data) return documentRecordToMorgan(data);
  }
  return null;
}

export async function deleteDocument(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_DOCUMENTS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

function documentRecordToMorgan(r: Record<string, unknown>): MorganDocument {
  return {
    id: r.id as string,
    name: r.name as string,
    type: (r.doc_type as string) || 'PDF',
    size: r.size as string | undefined,
    project: r.project as string | undefined,
    category: (r.category as string) || 'General',
    author: r.author as string | undefined,
    modified: r.modified as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

// ── Portfolios ─────────────────────────────────────────────────────────────

export async function listPortfolios(context?: MorganTenantContext): Promise<MorganPortfolio[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PORTFOLIOS)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(portfolioRecordToMorgan);
  }
  return [];
}

export async function createPortfolio(input: Partial<MorganPortfolio>, context?: MorganTenantContext): Promise<MorganPortfolio> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('PRT'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      name: input.name || 'Untitled Portfolio',
      description: input.description || null,
      project_count: typeof input.projectCount === 'number' ? input.projectCount : 0,
      total_budget: typeof input.totalBudget === 'number' ? input.totalBudget : 0,
      health: input.health || 'Good',
      color: input.color || null,
      manager: input.manager || null,
      status: input.status || 'Active',
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PORTFOLIOS).insert(payload).select('*').single();
    if (!error && data) return portfolioRecordToMorgan(data);
  }
  return { id: generateId('PRT'), name: input.name || 'Untitled Portfolio', projectCount: 0, totalBudget: 0, health: 'Good', status: 'Active', ...input };
}

export async function getPortfolioById(id: string, context?: MorganTenantContext): Promise<MorganPortfolio | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PORTFOLIOS).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).single();
    if (!error && data) return portfolioRecordToMorgan(data);
  }
  return null;
}

export async function updatePortfolio(id: string, patch: Partial<MorganPortfolio>, context?: MorganTenantContext): Promise<MorganPortfolio | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.projectCount !== undefined) dbPatch.project_count = patch.projectCount;
    if (patch.totalBudget !== undefined) dbPatch.total_budget = patch.totalBudget;
    if (patch.health !== undefined) dbPatch.health = patch.health;
    if (patch.color !== undefined) dbPatch.color = patch.color;
    if (patch.manager !== undefined) dbPatch.manager = patch.manager;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PORTFOLIOS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').single();
    if (!error && data) return portfolioRecordToMorgan(data);
  }
  return null;
}

export async function deletePortfolio(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PORTFOLIOS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

function portfolioRecordToMorgan(r: Record<string, unknown>): MorganPortfolio {
  return {
    id: r.id as string,
    name: r.name as string,
    description: r.description as string | undefined,
    projectCount: typeof r.project_count === 'number' ? r.project_count : 0,
    totalBudget: typeof r.total_budget === 'number' ? r.total_budget : 0,
    health: (r.health as string) || 'Good',
    color: r.color as string | undefined,
    manager: r.manager as string | undefined,
    status: (r.status as string) || 'Active',
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

// ── Timesheets ─────────────────────────────────────────────────────────────

export async function listTimesheets(context?: MorganTenantContext): Promise<MorganTimesheet[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIMESHEETS)
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(timesheetRecordToMorgan);
  }
  return [];
}

export async function createTimesheet(input: Partial<MorganTimesheet>, context?: MorganTenantContext): Promise<MorganTimesheet> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('TS'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      employee: input.user || 'Unknown',
      project: input.project || null,
      period: input.period || null,
      hours: typeof input.hours === 'number' ? input.hours : 0,
      overtime: typeof input.overtime === 'number' ? input.overtime : 0,
      status: input.status || 'Pending',
      notes: input.notes || null,
      approved_by: input.approvedBy || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIMESHEETS).insert(payload).select('*').single();
    if (!error && data) return timesheetRecordToMorgan(data);
  }
  return { id: generateId('TS'), user: input.user || 'Unknown', hours: 0, overtime: 0, status: 'Pending', ...input };
}

export async function getTimesheetById(id: string, context?: MorganTenantContext): Promise<MorganTimesheet | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIMESHEETS).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).single();
    if (!error && data) return timesheetRecordToMorgan(data);
  }
  return null;
}

export async function updateTimesheet(id: string, patch: Partial<MorganTimesheet>, context?: MorganTenantContext): Promise<MorganTimesheet | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.user !== undefined) dbPatch.employee = patch.user;
    if (patch.project !== undefined) dbPatch.project = patch.project;
    if (patch.period !== undefined) dbPatch.period = patch.period;
    if (patch.hours !== undefined) dbPatch.hours = patch.hours;
    if (patch.overtime !== undefined) dbPatch.overtime = patch.overtime;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    if (patch.approvedBy !== undefined) dbPatch.approved_by = patch.approvedBy;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIMESHEETS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').single();
    if (!error && data) return timesheetRecordToMorgan(data);
  }
  return null;
}

export async function deleteTimesheet(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIMESHEETS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

function timesheetRecordToMorgan(r: Record<string, unknown>): MorganTimesheet {
  return {
    id: r.id as string,
    user: (r.employee as string) || '',
    project: r.project as string | undefined,
    period: r.period as string | undefined,
    hours: typeof r.hours === 'number' ? r.hours : 0,
    overtime: typeof r.overtime === 'number' ? r.overtime : 0,
    status: (r.status as string) || 'Pending',
    notes: r.notes as string | undefined,
    approvedBy: r.approved_by as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

// ── Templates ──────────────────────────────────────────────────────────────

export async function listTemplates(context?: MorganTenantContext): Promise<MorganTemplate[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TEMPLATES).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(templateRecordToMorgan);
  }
  return [];
}

export async function createTemplate(input: Partial<MorganTemplate>, context?: MorganTenantContext): Promise<MorganTemplate> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('TPL'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      name: input.name || 'Untitled Template',
      category: input.category || 'General',
      description: input.description || null,
      type: input.type || null,
      version: input.version || '1.0',
      status: input.status || 'Active',
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TEMPLATES).insert(payload).select('*').single();
    if (!error && data) return templateRecordToMorgan(data);
  }
  return { id: generateId('TPL'), name: input.name || 'Untitled Template', category: input.category || 'General', status: input.status || 'Active', ...input };
}

export async function getTemplateById(id: string, context?: MorganTenantContext): Promise<MorganTemplate | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TEMPLATES).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).single();
    if (!error && data) return templateRecordToMorgan(data);
  }
  return null;
}

export async function updateTemplate(id: string, patch: Partial<MorganTemplate>, context?: MorganTenantContext): Promise<MorganTemplate | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.type !== undefined) dbPatch.type = patch.type;
    if (patch.version !== undefined) dbPatch.version = patch.version;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TEMPLATES).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').single();
    if (!error && data) return templateRecordToMorgan(data);
  }
  return null;
}

export async function deleteTemplate(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TEMPLATES).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

function templateRecordToMorgan(r: Record<string, unknown>): MorganTemplate {
  return {
    id: r.id as string,
    name: (r.name as string) || '',
    category: (r.category as string) || 'General',
    description: r.description as string | undefined,
    type: r.type as string | undefined,
    version: r.version as string | undefined,
    status: (r.status as string) || 'Active',
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

// ── Meetings ───────────────────────────────────────────────────────────────

export async function listMeetings(context?: MorganTenantContext): Promise<MorganMeeting[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_MEETINGS).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('date', { ascending: true });
    if (!error && Array.isArray(data)) return data.map(meetingRecordToMorgan);
  }
  return [];
}

export async function createMeeting(input: Partial<MorganMeeting>, context?: MorganTenantContext): Promise<MorganMeeting> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('MTG'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      title: input.title || 'Untitled Meeting',
      date: input.date || new Date().toISOString().slice(0, 10),
      time: input.time || null,
      attendees: input.attendees || 0,
      type: input.type || 'One-time',
      location: input.location || null,
      status: input.status || 'Scheduled',
      organizer: input.organizer || null,
      notes: input.notes || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_MEETINGS).insert(payload).select('*').single();
    if (!error && data) return meetingRecordToMorgan(data);
  }
  return { id: generateId('MTG'), title: input.title || 'Untitled Meeting', date: input.date || '', attendees: input.attendees || 0, type: input.type || 'One-time', status: input.status || 'Scheduled', ...input };
}

export async function getMeetingById(id: string, context?: MorganTenantContext): Promise<MorganMeeting | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_MEETINGS).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).single();
    if (!error && data) return meetingRecordToMorgan(data);
  }
  return null;
}

export async function updateMeeting(id: string, patch: Partial<MorganMeeting>, context?: MorganTenantContext): Promise<MorganMeeting | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.date !== undefined) dbPatch.date = patch.date;
    if (patch.time !== undefined) dbPatch.time = patch.time;
    if (patch.attendees !== undefined) dbPatch.attendees = patch.attendees;
    if (patch.type !== undefined) dbPatch.type = patch.type;
    if (patch.location !== undefined) dbPatch.location = patch.location;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.organizer !== undefined) dbPatch.organizer = patch.organizer;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_MEETINGS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').single();
    if (!error && data) return meetingRecordToMorgan(data);
  }
  return null;
}

export async function deleteMeeting(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_MEETINGS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

function meetingRecordToMorgan(r: Record<string, unknown>): MorganMeeting {
  return {
    id: r.id as string,
    title: (r.title as string) || '',
    date: (r.date as string) || '',
    time: r.time as string | undefined,
    attendees: typeof r.attendees === 'number' ? r.attendees : 0,
    type: (r.type as string) || 'One-time',
    location: r.location as string | undefined,
    status: (r.status as string) || 'Scheduled',
    organizer: r.organizer as string | undefined,
    notes: r.notes as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

// ── Time Reports ───────────────────────────────────────────────────────────

export async function listTimeReports(context?: MorganTenantContext): Promise<MorganTimeReport[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIME_REPORTS).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('date', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(timeReportRecordToMorgan);
  }
  return [];
}

export async function createTimeReport(input: Partial<MorganTimeReport>, context?: MorganTenantContext): Promise<MorganTimeReport> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('TMR'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      date: input.date || new Date().toISOString().slice(0, 10),
      project: input.project || 'Unassigned',
      description: input.description || '',
      hours: input.hours || 0,
      status: input.status || 'Pending',
      employee: input.user || null,
      category: input.category || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIME_REPORTS).insert(payload).select('*').single();
    if (!error && data) return timeReportRecordToMorgan(data);
  }
  return { id: generateId('TMR'), date: input.date || '', project: input.project || '', description: input.description || '', hours: input.hours || 0, status: input.status || 'Pending', ...input };
}

export async function getTimeReportById(id: string, context?: MorganTenantContext): Promise<MorganTimeReport | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIME_REPORTS).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).single();
    if (!error && data) return timeReportRecordToMorgan(data);
  }
  return null;
}

export async function updateTimeReport(id: string, patch: Partial<MorganTimeReport>, context?: MorganTenantContext): Promise<MorganTimeReport | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.date !== undefined) dbPatch.date = patch.date;
    if (patch.project !== undefined) dbPatch.project = patch.project;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.hours !== undefined) dbPatch.hours = patch.hours;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.user !== undefined) dbPatch.employee = patch.user;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIME_REPORTS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').single();
    if (!error && data) return timeReportRecordToMorgan(data);
  }
  return null;
}

export async function deleteTimeReport(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIME_REPORTS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

function timeReportRecordToMorgan(r: Record<string, unknown>): MorganTimeReport {
  return {
    id: r.id as string,
    date: (r.date as string) || '',
    project: (r.project as string) || '',
    description: (r.description as string) || '',
    hours: typeof r.hours === 'number' ? r.hours : 0,
    status: (r.status as string) || 'Pending',
    user: r.employee as string | undefined,
    category: r.category as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

// ── Tender Document Links ──────────────────────────────────────────────────
const TABLE_MORGAN_TENDER_DOC_LINKS = 'morgan_tender_document_links';

export interface MorganTenderDocumentLink {
  id: string;
  documentId: string;
  legacyTenderId?: string;
  morganTenderId?: string;
  linkReason: string;
  sourceTitle?: string;
  createdAt: string;
}

export async function listTenderDocumentLinks(context?: MorganTenantContext): Promise<MorganTenderDocumentLink[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TENDER_DOC_LINKS).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && data) return data.map(tenderDocLinkRecordToMorgan);
  }
  return [];
}

export async function createTenderDocumentLink(
  input: { documentId: string; morganTenderId?: string; legacyTenderId?: string; linkReason?: string; sourceTitle?: string },
  context?: MorganTenantContext
): Promise<MorganTenderDocumentLink | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TENDER_DOC_LINKS).insert({
        document_id: input.documentId,
        morgan_tender_id: input.morganTenderId || null,
        legacy_tender_id: input.legacyTenderId || null,
        link_reason: input.linkReason || 'manual',
        source_title: input.sourceTitle || null,
        user_id: tenant.userId,
        workspace_id: tenant.workspaceId,
      }).select().single();
    if (!error && data) return tenderDocLinkRecordToMorgan(data);
  }
  return null;
}

export async function deleteTenderDocumentLink(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TENDER_DOC_LINKS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

function tenderDocLinkRecordToMorgan(r: Record<string, unknown>): MorganTenderDocumentLink {
  return {
    id: r.id as string,
    documentId: (r.document_id as string) || '',
    legacyTenderId: r.legacy_tender_id as string | undefined,
    morganTenderId: r.morgan_tender_id as string | undefined,
    linkReason: (r.link_reason as string) || 'manual',
    sourceTitle: r.source_title as string | undefined,
    createdAt: (r.created_at as string) || nowIso(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TRACK C: Financial Module
// ═══════════════════════════════════════════════════════════════════════════

export interface MorganBudget {
  id: string;
  projectId?: string;
  name: string;
  totalAmount: number;
  allocated: number;
  spent: number;
  category: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganExpense {
  id: string;
  projectId?: string;
  title: string;
  amount: number;
  category: string;
  status: string;
  submittedBy?: string;
  date?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganFinancialApproval {
  id: string;
  title: string;
  type: string;
  amount: number;
  status: string;
  submittedBy?: string;
  reviewedBy?: string;
  notes?: string;
  referenceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRACK D: Resource + Settings Module
// ═══════════════════════════════════════════════════════════════════════════

export interface MorganResourceRequest {
  id: string;
  title: string;
  projectId?: string;
  resourceType: string;
  quantity: number;
  skills?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  priority: string;
  requestedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganAlertRule {
  id: string;
  name: string;
  entity: string;
  condition: string;
  threshold?: string;
  severity: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganLessonLearned {
  id: string;
  title: string;
  projectId?: string;
  category: string;
  description?: string;
  impact: string;
  recommendation?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganSettings {
  id: string;
  workspaceId: string;
  orgName: string;
  currency: string;
  timezone: string;
  fiscalYearStart: string;
  dateFormat: string;
  aiEnabled: boolean;
  notificationsEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const TABLE_MORGAN_BUDGETS = 'morgan_budgets';
const TABLE_MORGAN_EXPENSES = 'morgan_expenses';
const TABLE_MORGAN_FINANCIAL_APPROVALS = 'morgan_financial_approvals';
const TABLE_MORGAN_RESOURCE_REQUESTS = 'morgan_resource_requests';
const TABLE_MORGAN_ALERT_RULES = 'morgan_alert_rules';
const TABLE_MORGAN_LESSONS_LEARNED = 'morgan_lessons_learned';
const TABLE_MORGAN_SETTINGS = 'morgan_settings';

// ── Budgets ────────────────────────────────────────────────────────────────

function budgetRecordToMorgan(r: Record<string, unknown>): MorganBudget {
  return {
    id: r.id as string,
    projectId: r.project_id as string | undefined,
    name: (r.name as string) || '',
    totalAmount: typeof r.total_amount === 'number' ? r.total_amount : 0,
    allocated: typeof r.allocated === 'number' ? r.allocated : 0,
    spent: typeof r.spent === 'number' ? r.spent : 0,
    category: (r.category as string) || 'General',
    status: (r.status as string) || 'Active',
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

export async function listBudgets(context?: MorganTenantContext): Promise<MorganBudget[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_BUDGETS).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(budgetRecordToMorgan);
  }
  return [];
}

export async function createBudget(input: Partial<MorganBudget>, context?: MorganTenantContext): Promise<MorganBudget> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('BDG'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      project_id: input.projectId || null,
      name: input.name || 'Untitled Budget',
      total_amount: typeof input.totalAmount === 'number' ? input.totalAmount : 0,
      allocated: typeof input.allocated === 'number' ? input.allocated : 0,
      spent: typeof input.spent === 'number' ? input.spent : 0,
      category: input.category || 'General',
      status: input.status || 'Active',
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_BUDGETS).insert(payload).select('*').single();
    if (!error && data) return budgetRecordToMorgan(data);
  }
  return { id: generateId('BDG'), name: input.name || 'Untitled Budget', totalAmount: 0, allocated: 0, spent: 0, category: input.category || 'General', status: input.status || 'Active', ...input };
}

export async function getBudgetById(id: string, context?: MorganTenantContext): Promise<MorganBudget | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_BUDGETS).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).maybeSingle();
    if (!error && data) return budgetRecordToMorgan(data);
  }
  return null;
}

export async function updateBudget(id: string, patch: Partial<MorganBudget>, context?: MorganTenantContext): Promise<MorganBudget | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.projectId !== undefined) dbPatch.project_id = patch.projectId;
    if (patch.totalAmount !== undefined) dbPatch.total_amount = patch.totalAmount;
    if (patch.allocated !== undefined) dbPatch.allocated = patch.allocated;
    if (patch.spent !== undefined) dbPatch.spent = patch.spent;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_BUDGETS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').maybeSingle();
    if (!error && data) return budgetRecordToMorgan(data);
    if (!error && !data) return null;
  }
  return null;
}

export async function deleteBudget(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_BUDGETS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

// ── Expenses ───────────────────────────────────────────────────────────────

function expenseRecordToMorgan(r: Record<string, unknown>): MorganExpense {
  return {
    id: r.id as string,
    projectId: r.project_id as string | undefined,
    title: (r.title as string) || '',
    amount: typeof r.amount === 'number' ? r.amount : 0,
    category: (r.category as string) || 'General',
    status: (r.status as string) || 'Pending',
    submittedBy: r.submitted_by as string | undefined,
    date: r.date as string | undefined,
    notes: r.notes as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

export async function listExpenses(context?: MorganTenantContext): Promise<MorganExpense[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_EXPENSES).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(expenseRecordToMorgan);
  }
  return [];
}

export async function createExpense(input: Partial<MorganExpense>, context?: MorganTenantContext): Promise<MorganExpense> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('EXP'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      project_id: input.projectId || null,
      title: input.title || 'Untitled Expense',
      amount: typeof input.amount === 'number' ? input.amount : 0,
      category: input.category || 'General',
      status: input.status || 'Pending',
      submitted_by: input.submittedBy || null,
      date: input.date || now,
      notes: input.notes || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_EXPENSES).insert(payload).select('*').single();
    if (!error && data) return expenseRecordToMorgan(data);
  }
  return { id: generateId('EXP'), title: input.title || 'Untitled Expense', amount: 0, category: input.category || 'General', status: input.status || 'Pending', ...input };
}

export async function getExpenseById(id: string, context?: MorganTenantContext): Promise<MorganExpense | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_EXPENSES).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).maybeSingle();
    if (!error && data) return expenseRecordToMorgan(data);
  }
  return null;
}

export async function updateExpense(id: string, patch: Partial<MorganExpense>, context?: MorganTenantContext): Promise<MorganExpense | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.projectId !== undefined) dbPatch.project_id = patch.projectId;
    if (patch.amount !== undefined) dbPatch.amount = patch.amount;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.submittedBy !== undefined) dbPatch.submitted_by = patch.submittedBy;
    if (patch.date !== undefined) dbPatch.date = patch.date;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_EXPENSES).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').maybeSingle();
    if (!error && data) return expenseRecordToMorgan(data);
    if (!error && !data) return null;
  }
  return null;
}

export async function deleteExpense(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_EXPENSES).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

// ── Financial Approvals ────────────────────────────────────────────────────

function financialApprovalRecordToMorgan(r: Record<string, unknown>): MorganFinancialApproval {
  return {
    id: r.id as string,
    title: (r.title as string) || '',
    type: (r.type as string) || 'Expense',
    amount: typeof r.amount === 'number' ? r.amount : 0,
    status: (r.status as string) || 'Pending',
    submittedBy: r.submitted_by as string | undefined,
    reviewedBy: r.reviewed_by as string | undefined,
    notes: r.notes as string | undefined,
    referenceId: r.reference_id as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

export async function listFinancialApprovals(context?: MorganTenantContext): Promise<MorganFinancialApproval[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_FINANCIAL_APPROVALS).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(financialApprovalRecordToMorgan);
  }
  return [];
}

export async function createFinancialApproval(input: Partial<MorganFinancialApproval>, context?: MorganTenantContext): Promise<MorganFinancialApproval> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('FAP'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      title: input.title || 'Untitled Approval',
      type: input.type || 'Expense',
      amount: typeof input.amount === 'number' ? input.amount : 0,
      status: input.status || 'Pending',
      submitted_by: input.submittedBy || null,
      reviewed_by: input.reviewedBy || null,
      notes: input.notes || null,
      reference_id: input.referenceId || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_FINANCIAL_APPROVALS).insert(payload).select('*').single();
    if (!error && data) return financialApprovalRecordToMorgan(data);
  }
  return { id: generateId('FAP'), title: input.title || 'Untitled Approval', type: input.type || 'Expense', amount: 0, status: input.status || 'Pending', ...input };
}

export async function getFinancialApprovalById(id: string, context?: MorganTenantContext): Promise<MorganFinancialApproval | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_FINANCIAL_APPROVALS).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).maybeSingle();
    if (!error && data) return financialApprovalRecordToMorgan(data);
  }
  return null;
}

export async function updateFinancialApproval(id: string, patch: Partial<MorganFinancialApproval>, context?: MorganTenantContext): Promise<MorganFinancialApproval | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.type !== undefined) dbPatch.type = patch.type;
    if (patch.amount !== undefined) dbPatch.amount = patch.amount;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.submittedBy !== undefined) dbPatch.submitted_by = patch.submittedBy;
    if (patch.reviewedBy !== undefined) dbPatch.reviewed_by = patch.reviewedBy;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    if (patch.referenceId !== undefined) dbPatch.reference_id = patch.referenceId;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_FINANCIAL_APPROVALS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').maybeSingle();
    if (!error && data) return financialApprovalRecordToMorgan(data);
    if (!error && !data) return null;
  }
  return null;
}

export async function deleteFinancialApproval(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_FINANCIAL_APPROVALS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

// ── Resource Requests ──────────────────────────────────────────────────────

function resourceRequestRecordToMorgan(r: Record<string, unknown>): MorganResourceRequest {
  return {
    id: r.id as string,
    title: (r.title as string) || '',
    projectId: r.project_id as string | undefined,
    resourceType: (r.resource_type as string) || 'Human',
    quantity: typeof r.quantity === 'number' ? r.quantity : 1,
    skills: r.skills as string | undefined,
    startDate: r.start_date as string | undefined,
    endDate: r.end_date as string | undefined,
    status: (r.status as string) || 'Pending',
    priority: (r.priority as string) || 'Medium',
    requestedBy: r.requested_by as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

export async function listResourceRequests(context?: MorganTenantContext): Promise<MorganResourceRequest[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_RESOURCE_REQUESTS).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(resourceRequestRecordToMorgan);
  }
  return [];
}

export async function createResourceRequest(input: Partial<MorganResourceRequest>, context?: MorganTenantContext): Promise<MorganResourceRequest> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('RRQ'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      title: input.title || 'Untitled Request',
      project_id: input.projectId || null,
      resource_type: input.resourceType || 'Human',
      quantity: typeof input.quantity === 'number' ? input.quantity : 1,
      skills: input.skills || null,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
      status: input.status || 'Pending',
      priority: input.priority || 'Medium',
      requested_by: input.requestedBy || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_RESOURCE_REQUESTS).insert(payload).select('*').single();
    if (!error && data) return resourceRequestRecordToMorgan(data);
  }
  return { id: generateId('RRQ'), title: input.title || 'Untitled Request', resourceType: input.resourceType || 'Human', quantity: 1, status: input.status || 'Pending', priority: input.priority || 'Medium', ...input };
}

export async function getResourceRequestById(id: string, context?: MorganTenantContext): Promise<MorganResourceRequest | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_RESOURCE_REQUESTS).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).maybeSingle();
    if (!error && data) return resourceRequestRecordToMorgan(data);
  }
  return null;
}

export async function updateResourceRequest(id: string, patch: Partial<MorganResourceRequest>, context?: MorganTenantContext): Promise<MorganResourceRequest | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.projectId !== undefined) dbPatch.project_id = patch.projectId;
    if (patch.resourceType !== undefined) dbPatch.resource_type = patch.resourceType;
    if (patch.quantity !== undefined) dbPatch.quantity = patch.quantity;
    if (patch.skills !== undefined) dbPatch.skills = patch.skills;
    if (patch.startDate !== undefined) dbPatch.start_date = patch.startDate;
    if (patch.endDate !== undefined) dbPatch.end_date = patch.endDate;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.priority !== undefined) dbPatch.priority = patch.priority;
    if (patch.requestedBy !== undefined) dbPatch.requested_by = patch.requestedBy;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_RESOURCE_REQUESTS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').maybeSingle();
    if (!error && data) return resourceRequestRecordToMorgan(data);
    if (!error && !data) return null;
  }
  return null;
}

export async function deleteResourceRequest(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_RESOURCE_REQUESTS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

// ── Alert Rules ────────────────────────────────────────────────────────────

function alertRuleRecordToMorgan(r: Record<string, unknown>): MorganAlertRule {
  return {
    id: r.id as string,
    name: (r.name as string) || '',
    entity: (r.entity as string) || 'project',
    condition: (r.condition as string) || '',
    threshold: r.threshold as string | undefined,
    severity: (r.severity as string) || 'Medium',
    enabled: typeof r.enabled === 'boolean' ? r.enabled : true,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

export async function listAlertRules(context?: MorganTenantContext): Promise<MorganAlertRule[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_ALERT_RULES).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(alertRuleRecordToMorgan);
  }
  return [];
}

export async function createAlertRule(input: Partial<MorganAlertRule>, context?: MorganTenantContext): Promise<MorganAlertRule> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('ALR'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      name: input.name || 'Untitled Rule',
      entity: input.entity || 'project',
      condition: input.condition || '',
      threshold: input.threshold || null,
      severity: input.severity || 'Medium',
      enabled: typeof input.enabled === 'boolean' ? input.enabled : true,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_ALERT_RULES).insert(payload).select('*').single();
    if (!error && data) return alertRuleRecordToMorgan(data);
  }
  return { id: generateId('ALR'), name: input.name || 'Untitled Rule', entity: input.entity || 'project', condition: input.condition || '', severity: input.severity || 'Medium', enabled: true, ...input };
}

export async function getAlertRuleById(id: string, context?: MorganTenantContext): Promise<MorganAlertRule | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_ALERT_RULES).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).maybeSingle();
    if (!error && data) return alertRuleRecordToMorgan(data);
  }
  return null;
}

export async function updateAlertRule(id: string, patch: Partial<MorganAlertRule>, context?: MorganTenantContext): Promise<MorganAlertRule | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.entity !== undefined) dbPatch.entity = patch.entity;
    if (patch.condition !== undefined) dbPatch.condition = patch.condition;
    if (patch.threshold !== undefined) dbPatch.threshold = patch.threshold;
    if (patch.severity !== undefined) dbPatch.severity = patch.severity;
    if (patch.enabled !== undefined) dbPatch.enabled = patch.enabled;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_ALERT_RULES).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').maybeSingle();
    if (!error && data) return alertRuleRecordToMorgan(data);
    if (!error && !data) return null;
  }
  return null;
}

export async function deleteAlertRule(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_ALERT_RULES).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

// ── Lessons Learned ────────────────────────────────────────────────────────

function lessonLearnedRecordToMorgan(r: Record<string, unknown>): MorganLessonLearned {
  return {
    id: r.id as string,
    title: (r.title as string) || '',
    projectId: r.project_id as string | undefined,
    category: (r.category as string) || 'General',
    description: r.description as string | undefined,
    impact: (r.impact as string) || 'Medium',
    recommendation: r.recommendation as string | undefined,
    status: (r.status as string) || 'Open',
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

export async function listLessonsLearned(context?: MorganTenantContext): Promise<MorganLessonLearned[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_LESSONS_LEARNED).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(lessonLearnedRecordToMorgan);
  }
  return [];
}

export async function createLessonLearned(input: Partial<MorganLessonLearned>, context?: MorganTenantContext): Promise<MorganLessonLearned> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('LSN'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      title: input.title || 'Untitled Lesson',
      project_id: input.projectId || null,
      category: input.category || 'General',
      description: input.description || null,
      impact: input.impact || 'Medium',
      recommendation: input.recommendation || null,
      status: input.status || 'Open',
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_LESSONS_LEARNED).insert(payload).select('*').single();
    if (!error && data) return lessonLearnedRecordToMorgan(data);
  }
  return { id: generateId('LSN'), title: input.title || 'Untitled Lesson', category: input.category || 'General', impact: input.impact || 'Medium', status: input.status || 'Open', ...input };
}

export async function getLessonLearnedById(id: string, context?: MorganTenantContext): Promise<MorganLessonLearned | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_LESSONS_LEARNED).select('*').eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).maybeSingle();
    if (!error && data) return lessonLearnedRecordToMorgan(data);
  }
  return null;
}

export async function updateLessonLearned(id: string, patch: Partial<MorganLessonLearned>, context?: MorganTenantContext): Promise<MorganLessonLearned | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.projectId !== undefined) dbPatch.project_id = patch.projectId;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.impact !== undefined) dbPatch.impact = patch.impact;
    if (patch.recommendation !== undefined) dbPatch.recommendation = patch.recommendation;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_LESSONS_LEARNED).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').maybeSingle();
    if (!error && data) return lessonLearnedRecordToMorgan(data);
    if (!error && !data) return null;
  }
  return null;
}

export async function deleteLessonLearned(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_LESSONS_LEARNED).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

// ── Settings (upsert by workspace_id) ─────────────────────────────────────

function settingsRecordToMorgan(r: Record<string, unknown>): MorganSettings {
  return {
    id: r.id as string,
    workspaceId: (r.workspace_id as string) || '',
    orgName: (r.org_name as string) || 'Morgan',
    currency: (r.currency as string) || 'USD',
    timezone: (r.timezone as string) || 'UTC',
    fiscalYearStart: (r.fiscal_year_start as string) || 'January',
    dateFormat: (r.date_format as string) || 'MM/DD/YYYY',
    aiEnabled: typeof r.ai_enabled === 'boolean' ? r.ai_enabled : true,
    notificationsEnabled: typeof r.notifications_enabled === 'boolean' ? r.notifications_enabled : true,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

export async function getSettings(context?: MorganTenantContext): Promise<MorganSettings | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_SETTINGS).select('*')
      .eq('workspace_id', tenant.workspaceId).maybeSingle();
    if (!error && data) return settingsRecordToMorgan(data);
  }
  return null;
}

export async function upsertSettings(input: Partial<MorganSettings>, context?: MorganTenantContext): Promise<MorganSettings> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      workspace_id: tenant.workspaceId,
      user_id: tenant.userId,
      org_name: input.orgName ?? 'Morgan',
      currency: input.currency ?? 'USD',
      timezone: input.timezone ?? 'UTC',
      fiscal_year_start: input.fiscalYearStart ?? 'January',
      date_format: input.dateFormat ?? 'MM/DD/YYYY',
      ai_enabled: typeof input.aiEnabled === 'boolean' ? input.aiEnabled : true,
      notifications_enabled: typeof input.notificationsEnabled === 'boolean' ? input.notificationsEnabled : true,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_SETTINGS)
      .upsert(payload, { onConflict: 'workspace_id' })
      .select('*').single();
    if (!error && data) return settingsRecordToMorgan(data);
  }
  return {
    id: generateId('STG'),
    workspaceId: context?.workspaceId || 'default',
    orgName: input.orgName || 'Morgan',
    currency: input.currency || 'USD',
    timezone: input.timezone || 'UTC',
    fiscalYearStart: input.fiscalYearStart || 'January',
    dateFormat: input.dateFormat || 'MM/DD/YYYY',
    aiEnabled: typeof input.aiEnabled === 'boolean' ? input.aiEnabled : true,
    notificationsEnabled: typeof input.notificationsEnabled === 'boolean' ? input.notificationsEnabled : true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TRACK B: Proposal Pipeline + Time-Off Management
// ═══════════════════════════════════════════════════════════════════════════

export interface MorganProposal {
  id: string;
  title: string;
  client?: string;
  value: number;
  stage: string;
  probability: number;
  dueDate?: string;
  owner?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MorganTimeOff {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TABLE_MORGAN_PROPOSALS = 'morgan_proposals';
const TABLE_MORGAN_TIME_OFF = 'morgan_time_off';

// ── Proposals ─────────────────────────────────────────────────────────────

function proposalRecordToMorgan(r: Record<string, unknown>): MorganProposal {
  return {
    id: r.id as string,
    title: (r.title as string) || '',
    client: r.client as string | undefined,
    value: typeof r.value === 'number' ? r.value : 0,
    stage: (r.stage as string) || 'Draft',
    probability: typeof r.probability === 'number' ? r.probability : 0,
    dueDate: r.due_date as string | undefined,
    owner: r.owner as string | undefined,
    description: r.description as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

export async function listProposals(context?: MorganTenantContext): Promise<MorganProposal[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PROPOSALS).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(proposalRecordToMorgan);
  }
  return [];
}

export async function createProposal(input: Partial<MorganProposal>, context?: MorganTenantContext): Promise<MorganProposal> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('PRP'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      title: input.title || 'Untitled Proposal',
      client: input.client || null,
      value: typeof input.value === 'number' ? input.value : 0,
      stage: input.stage || 'Draft',
      probability: typeof input.probability === 'number' ? input.probability : 0,
      due_date: input.dueDate || null,
      owner: input.owner || null,
      description: input.description || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PROPOSALS).insert(payload).select('*').single();
    if (!error && data) return proposalRecordToMorgan(data);
  }
  return { id: generateId('PRP'), title: input.title || 'Untitled Proposal', value: 0, stage: input.stage || 'Draft', probability: 0, ...input };
}

export async function updateProposal(id: string, patch: Partial<MorganProposal>, context?: MorganTenantContext): Promise<MorganProposal | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.client !== undefined) dbPatch.client = patch.client;
    if (patch.value !== undefined) dbPatch.value = patch.value;
    if (patch.stage !== undefined) dbPatch.stage = patch.stage;
    if (patch.probability !== undefined) dbPatch.probability = patch.probability;
    if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate;
    if (patch.owner !== undefined) dbPatch.owner = patch.owner;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PROPOSALS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').maybeSingle();
    if (!error && data) return proposalRecordToMorgan(data);
    if (!error && !data) return null;
  }
  return null;
}

export async function deleteProposal(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_PROPOSALS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

// ── Time-Off ───────────────────────────────────────────────────────────────

function timeOffRecordToMorgan(r: Record<string, unknown>): MorganTimeOff {
  return {
    id: r.id as string,
    employeeName: (r.employee_name as string) || '',
    type: (r.type as string) || 'Annual Leave',
    startDate: (r.start_date as string) || '',
    endDate: (r.end_date as string) || '',
    days: typeof r.days === 'number' ? r.days : 1,
    status: (r.status as string) || 'Pending',
    notes: r.notes as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

export async function listTimeOff(context?: MorganTenantContext): Promise<MorganTimeOff[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIME_OFF).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(timeOffRecordToMorgan);
  }
  return [];
}

export async function createTimeOff(input: Partial<MorganTimeOff>, context?: MorganTenantContext): Promise<MorganTimeOff> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('TOF'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      employee_name: input.employeeName || 'Unknown',
      type: input.type || 'Annual Leave',
      start_date: input.startDate || now,
      end_date: input.endDate || now,
      days: typeof input.days === 'number' ? input.days : 1,
      status: input.status || 'Pending',
      notes: input.notes || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIME_OFF).insert(payload).select('*').single();
    if (!error && data) return timeOffRecordToMorgan(data);
  }
  return { id: generateId('TOF'), employeeName: input.employeeName || 'Unknown', type: input.type || 'Annual Leave', startDate: input.startDate || '', endDate: input.endDate || '', days: input.days || 1, status: input.status || 'Pending', ...input };
}

export async function updateTimeOff(id: string, patch: Partial<MorganTimeOff>, context?: MorganTenantContext): Promise<MorganTimeOff | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.employeeName !== undefined) dbPatch.employee_name = patch.employeeName;
    if (patch.type !== undefined) dbPatch.type = patch.type;
    if (patch.startDate !== undefined) dbPatch.start_date = patch.startDate;
    if (patch.endDate !== undefined) dbPatch.end_date = patch.endDate;
    if (patch.days !== undefined) dbPatch.days = patch.days;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIME_OFF).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').maybeSingle();
    if (!error && data) return timeOffRecordToMorgan(data);
    if (!error && !data) return null;
  }
  return null;
}

export async function deleteTimeOff(id: string, context?: MorganTenantContext): Promise<boolean> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_TIME_OFF).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT APPROVALS — Digital Signature Workflow
// Table: morgan_document_approvals
// ═══════════════════════════════════════════════════════════════════════════

export interface MorganDocumentApproval {
  id: string;
  docCode: string;
  requestorName: string;
  department: string;
  documentType: string;
  purpose: string;
  dateRequested: string;
  approvalRequiredBy: string;
  urgency: 'standard' | 'moderate' | 'critical';
  additionalInfo?: string;
  fileName?: string;
  fileUrl?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewNotes?: string;
  approvedBy?: string;
  approverName?: string;
  approverRole?: string;
  decisionTimestamp?: string;
  approvedAt?: string;
  errorFlags?: string;
  aiSummary?: string;
  idempotencyKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TABLE_MORGAN_DOCUMENT_APPROVALS = 'morgan_document_approvals';

function docApprovalRecordToMorgan(r: Record<string, unknown>): MorganDocumentApproval {
  return {
    id: r.id as string,
    docCode: (r.doc_code as string) || '',
    requestorName: (r.requestor_name as string) || '',
    department: (r.department as string) || '',
    documentType: (r.document_type as string) || '',
    purpose: (r.purpose as string) || '',
    dateRequested: (r.date_requested as string) || '',
    approvalRequiredBy: (r.approval_required_by as string) || '',
    urgency: ((r.urgency as string) || 'standard') as 'standard' | 'moderate' | 'critical',
    additionalInfo: r.additional_info as string | undefined,
    fileName: r.file_name as string | undefined,
    fileUrl: r.file_url as string | undefined,
    status: ((r.status as string) || 'pending') as 'pending' | 'under_review' | 'approved' | 'rejected',
    reviewNotes: r.review_notes as string | undefined,
    approvedBy: r.approved_by as string | undefined,
    approverName: r.approver_name as string | undefined,
    approverRole: r.approver_role as string | undefined,
    decisionTimestamp: r.decision_timestamp as string | undefined,
    approvedAt: r.approved_at as string | undefined,
    errorFlags: r.error_flags as string | undefined,
    aiSummary: r.ai_summary as string | undefined,
    idempotencyKey: r.idempotency_key as string | undefined,
    createdAt: r.created_at as string | undefined,
    updatedAt: r.updated_at as string | undefined,
  };
}

function generateDocCode(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return `DOC-${datePart}-${seq}`;
}

export async function listDocumentApprovals(context?: MorganTenantContext): Promise<MorganDocumentApproval[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_DOCUMENT_APPROVALS).select('*')
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(docApprovalRecordToMorgan);
  }
  return [];
}

export async function getDocumentApprovalById(
  id: string,
  context?: MorganTenantContext,
): Promise<MorganDocumentApproval | null> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_DOCUMENT_APPROVALS)
      .select('*')
      .eq('id', id)
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .maybeSingle();
    if (!error && data) return docApprovalRecordToMorgan(data);
  }
  return null;
}

export async function createDocumentApproval(
  input: Partial<MorganDocumentApproval>,
  context?: MorganTenantContext,
): Promise<MorganDocumentApproval> {
  requireSupabasePersistence('document approvals');
  const now = nowIso();
  const id = input.id || generateId('DAP');
  const docCode = input.docCode || generateDocCode();
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const payload = {
      id,
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      doc_code: docCode,
      requestor_name: input.requestorName || '',
      department: input.department || '',
      document_type: input.documentType || '',
      purpose: input.purpose || '',
      date_requested: input.dateRequested || now,
      approval_required_by: input.approvalRequiredBy || '',
      urgency: input.urgency || 'standard',
      additional_info: input.additionalInfo || null,
      file_name: input.fileName || null,
      file_url: input.fileUrl || null,
      status: input.status || 'pending',
      review_notes: null,
      approved_by: null,
      approver_name: null,
      approver_role: null,
      decision_timestamp: null,
      approved_at: null,
      error_flags: input.errorFlags || null,
      ai_summary: input.aiSummary || null,
      idempotency_key: input.idempotencyKey || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_DOCUMENT_APPROVALS).insert(payload).select('*').single();
    if (!error && data) return docApprovalRecordToMorgan(data);
  }
  // local fallback
  return {
    id,
    docCode,
    requestorName: input.requestorName || '',
    department: input.department || '',
    documentType: input.documentType || '',
    purpose: input.purpose || '',
    dateRequested: input.dateRequested || now,
    approvalRequiredBy: input.approvalRequiredBy || '',
    urgency: input.urgency || 'standard',
    status: 'pending',
    additionalInfo: input.additionalInfo,
    fileName: input.fileName,
    fileUrl: input.fileUrl,
    reviewNotes: input.reviewNotes,
    approvedBy: input.approvedBy,
    approverName: input.approverName,
    approverRole: input.approverRole,
    decisionTimestamp: input.decisionTimestamp,
    approvedAt: input.approvedAt,
    errorFlags: input.errorFlags,
    aiSummary: input.aiSummary,
    idempotencyKey: input.idempotencyKey,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateDocumentApproval(
  id: string,
  patch: Partial<MorganDocumentApproval>,
  context?: MorganTenantContext,
): Promise<MorganDocumentApproval | null> {
  requireSupabasePersistence('document approvals');
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const dbPatch: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.reviewNotes !== undefined) dbPatch.review_notes = patch.reviewNotes;
    if (patch.approvedBy !== undefined) dbPatch.approved_by = patch.approvedBy;
    if (patch.approverName !== undefined) dbPatch.approver_name = patch.approverName;
    if (patch.approverRole !== undefined) dbPatch.approver_role = patch.approverRole;
    if (patch.decisionTimestamp !== undefined) dbPatch.decision_timestamp = patch.decisionTimestamp;
    if (patch.approvedAt !== undefined) dbPatch.approved_at = patch.approvedAt;
    if (patch.errorFlags !== undefined) dbPatch.error_flags = patch.errorFlags;
    if (patch.aiSummary !== undefined) dbPatch.ai_summary = patch.aiSummary;
    if (patch.urgency !== undefined) dbPatch.urgency = patch.urgency;
    if (patch.fileUrl !== undefined) dbPatch.file_url = patch.fileUrl;
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_DOCUMENT_APPROVALS).update(dbPatch).eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId).select('*').maybeSingle();
    if (!error && data) return docApprovalRecordToMorgan(data);
    if (!error && !data) return null;
  }
  return null;
}

export async function deleteDocumentApproval(id: string, context?: MorganTenantContext): Promise<boolean> {
  requireSupabasePersistence('document approvals');
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_DOCUMENT_APPROVALS).delete().eq('id', id)
      .eq('user_id', tenant.userId).eq('workspace_id', tenant.workspaceId);
    return !error;
  }
  return false;
}
