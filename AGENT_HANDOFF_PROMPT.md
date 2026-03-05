# MCE Command Center — Agent Handoff Prompt (Claude Sonnet 4.6)

**Date:** 2026-03-02
**Purpose:** Complete handoff prompt for a Claude Sonnet 4.6 agent to continue building the MCE Command Center (VeroPM clone). Copy this entire file as your system/user prompt.

---

## PROMPT START

You are continuing work on the **MCE Command Center**, a VeroPM clone built with Next.js 16.1.6, TypeScript 5.8.2, Supabase, Clerk auth, and Tailwind CSS.

### WHERE WE ARE

The app has a **single-page dashboard** at `app/page.tsx` (1,982 lines) with 16 sidebar sections. The **UI is ~80% complete** — all 16 sections render with light-mode styling, functional search bars, status toggle buttons, and delete buttons. However, **only 4 of 16 sections are actually wired to the backend** (Supabase persistence via API routes). The other 12 use hardcoded `useState` arrays — data disappears on refresh.

### WHAT'S DONE (do NOT touch these)

| Module | DB Table | API Routes | UI | Status |
|--------|----------|------------|-----|--------|
| **Projects** | `morgan_projects` | `app/api/morgan/projects/route.ts` (GET, POST) + `[id]/route.ts` (GET, PATCH, DELETE) | `ProjectsView` — fetches from API via parent `loadData` | **COMPLETE** |
| **Tenders** | `morgan_tenders` | `app/api/morgan/tenders/route.ts` + `[id]/route.ts` | `TendersKanbanView` — fetches from API | **COMPLETE** |
| **Workflows** | `morgan_workflows` | `app/api/morgan/workflows/route.ts` + `[id]/route.ts` | `WorkflowsView` — *partial* (save hits API, list uses local mock) | **MOSTLY DONE** |
| **Automations** | `morgan_automations` + `morgan_automation_execution_history` | `app/api/morgan/automations/route.ts` + `[id]/route.ts` + `[id]/history/route.ts` + `automation/route.ts` + `automation/alerts/[id]/ack/route.ts` | `AutomationView` — fully API-backed | **COMPLETE** |

### WHAT NEEDS TO BE BUILT (your TODO list)

These 7 sections have UI but NO backend persistence. Each needs: DB table → persistence functions → API routes → UI wiring.

| # | Entity | UI Component | Current Data Shape (hardcoded in page.tsx) |
|---|--------|--------------|--------------------------------------------|
| 1 | **Tasks** | `TasksView` (line ~1073) | `{ id, title, project, due, priority, status }` |
| 2 | **Issues** | `IssuesView` (line ~1131) | `{ id, title, severity, project, status, raised }` |
| 3 | **Risks** | `RisksView` (line ~1468) | `{ id, title, project, category, probability, impact, status, owner, raised, mitigation }` |
| 4 | **Milestones** | `MilestonesView` (line ~1657) | `{ id, name, project, dueDate, status, type, owner, progress, approvalStatus }` |
| 5 | **Documents** | `DocumentsView` (line ~1217) | `{ id, name, type, size, project, category, author, modified }` |
| 6 | **Portfolios** | `PortfoliosView` (line ~357) | Uses `portfolioData` from `lib/imperial/mock-extended` with `{ id, name, projectCount, totalBudget, health, color }` |
| 7 | **Timesheets** | `TimesheetsView` (line ~1339) | `{ id, user, period, hours, overtime, status }` |

### ARCHITECTURE PATTERNS (follow these EXACTLY)

#### Pattern 1: DB Migration
File location: `supabase/migrations/`
Reference: `supabase/migrations/20260301_morgan_multitenant_persistence.sql`

Every table MUST have:
```sql
CREATE TABLE IF NOT EXISTS morgan_{{entity}} (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  -- entity-specific columns here --
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_{{entity}}_tenant ON morgan_{{entity}}(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_{{entity}}_workspace ON morgan_{{entity}}(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_{{entity}}_tenant_created_at ON morgan_{{entity}}(user_id, workspace_id, created_at DESC);

-- updated_at trigger (reuses existing function set_morgan_updated_at from first migration)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_morgan_{{entity}}_updated_at') THEN
    CREATE TRIGGER trg_morgan_{{entity}}_updated_at
      BEFORE UPDATE ON morgan_{{entity}}
      FOR EACH ROW EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_{{entity}} ENABLE ROW LEVEL SECURITY;
```

#### Pattern 2: Persistence Functions
File: `lib/morgan/persistence.ts` (~935 lines currently)

Types are defined in `lib/morgan/backbone.ts` (for MorganProject/MorganTender) or in `lib/morgan/persistence.ts` itself (for MorganWorkflow, MorganAutomationRule, etc).

For new entities, add a type interface and 5 CRUD functions following this exact pattern:

```typescript
// In persistence.ts — add near the top with other interfaces
export interface Morgan{{Entity}} {
  id: string;
  // entity fields using camelCase
  createdAt?: string;
  updatedAt?: string;
}

// Add table constant near other TABLE_ constants (around line 58)
const TABLE_MORGAN_{{ENTITY}} = 'morgan_{{entity}}';

// Add 5 CRUD functions following listProjects/createProject pattern:
export async function list{{Entity}}s(context?: MorganTenantContext): Promise<Morgan{{Entity}}[]> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_{{ENTITY}})
      .select('*')
      .eq('user_id', tenant.userId)
      .eq('workspace_id', tenant.workspaceId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data;  // or map through a converter
  }
  return [];  // fallback
}

export async function create{{Entity}}(input: Partial<Morgan{{Entity}}>, context?: MorganTenantContext): Promise<Morgan{{Entity}}> {
  if (hasSupabasePersistence()) {
    const tenant = asTenant(context);
    const now = nowIso();
    const payload = {
      id: input.id || generateId('{{PREFIX}}'),
      user_id: tenant.userId,
      workspace_id: tenant.workspaceId,
      // map fields: camelCase → snake_case for DB
      created_at: now,
      updated_at: now
    };
    const { data, error } = await (supabaseAdmin as any)
      .from(TABLE_MORGAN_{{ENTITY}})
      .insert(payload)
      .select('*')
      .single();
    if (!error && data) return data;  // or map through converter
  }
  throw new Error('Failed to create {{entity}}');
}

// get{{Entity}}ById, update{{Entity}}, delete{{Entity}} follow identical patterns
// to getProjectById, updateProject, deleteProject
```

Key helpers already available in persistence.ts:
- `hasSupabasePersistence()` — returns true if Supabase URL is configured
- `asTenant(context)` — normalizes tenant context
- `nowIso()` — returns current ISO timestamp
- `generateId(prefix)` — generates random ID like `PRJ-abc123`
- `supabaseAdmin` — imported from `@/lib/supabase`

#### Pattern 3: API Routes
Reference files:
- `app/api/morgan/projects/route.ts` (GET + POST, 35 lines)
- `app/api/morgan/projects/[id]/route.ts` (GET + PATCH + DELETE, 78 lines)

Create two files per entity:

**`app/api/morgan/{{entity}}/route.ts`**:
```typescript
import { NextResponse } from 'next/server';
import { create{{Entity}}, list{{Entity}}s } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const items = await list{{Entity}}s(tenant.context);
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to load.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const created = await create{{Entity}}(body ?? {}, tenant.context);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to create.' }, { status: 500 });
  }
}
```

**`app/api/morgan/{{entity}}/[id]/route.ts`**:
```typescript
import { NextResponse } from 'next/server';
import { delete{{Entity}}, get{{Entity}}ById, update{{Entity}} } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const item = await get{{Entity}}ById(id, tenant.context);
    if (!item) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const updated = await update{{Entity}}(id, body ?? {}, tenant.context);
    if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const deleted = await delete{{Entity}}(id, tenant.context);
    if (!deleted) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**CRITICAL:** Next.js 16 uses `params: Promise<{ id: string }>` — you MUST `await params` before accessing `.id`. This is NOT optional.

#### Pattern 4: UI Wiring
In `app/page.tsx`, update each view component to:
1. Replace `useState([...hardcoded...])` with `useState<Morgan{{Entity}}[]>([])`
2. Add a `useEffect` that fetches from the API
3. Update create/delete handlers to hit the API then refresh

Example (Tasks):
```tsx
const TasksView = () => {
  const [search, setSearch] = useState('')
  const [tasks, setTasks] = useState<MorganTask[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/tasks', { cache: 'no-store' })
      if (res.ok) { const d = await res.json(); if (Array.isArray(d)) setTasks(d) }
    } catch { /* keep existing state */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  const deleteTask = async (id: string) => {
    await fetch(`/api/morgan/tasks/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const toggleStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const next = task.status === 'To Do' ? 'In Progress' : task.status === 'In Progress' ? 'Done' : 'To Do'
    await fetch(`/api/morgan/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: next } : t))
  }
  // ... rest of render unchanged
}
```

### IMPORTANT CONSTRAINTS

1. **Import alias:** `@/*` maps to project root (configured in `tsconfig.json`)
2. **All DB queries scoped by tenant:** Every SELECT/INSERT must filter by `user_id` + `workspace_id`
3. **`{ params }` is a Promise in Next.js 16:** Use `const { id } = await params;` in `[id]/route.ts` files
4. **Supabase admin client:** Import from `@/lib/supabase` — uses service role key, bypasses RLS
5. **Tenant context:** Use `resolveMorganTenantContext` from `@/lib/morgan/tenant-context` — extracts user_id via Clerk, workspace_id from headers/body/query
6. **No hardcoded hex colors:** All Tailwind classes use semantic tokens (bg-bg-base, text-text-primary, etc.) — see `styles/tokens-2026.css`
7. **No new npm deps:** Everything needed is already installed
8. **Build gate:** After all changes, run `npx tsc --noEmit` — must pass with zero errors

### ENTITY-SPECIFIC COLUMN DEFINITIONS

**1. Tasks (`morgan_tasks`)**
```sql
title text NOT NULL,
description text,
project text,
assignee text,
due text,          -- date string like '2026-03-05'
priority text NOT NULL DEFAULT 'Medium',  -- Critical|High|Medium|Low
status text NOT NULL DEFAULT 'To Do'      -- To Do|In Progress|Done
```
ID prefix: `TSK`

**2. Issues (`morgan_issues`)**
```sql
title text NOT NULL,
severity text NOT NULL DEFAULT 'Medium',  -- Critical|High|Medium|Low
project text,
status text NOT NULL DEFAULT 'Open',      -- Open|In Progress|Resolved
assignee text,
raised text          -- date string
```
ID prefix: `ISS`

**3. Risks (`morgan_risks`)**
```sql
title text NOT NULL,
project text,
category text NOT NULL DEFAULT 'Technical',   -- Technical|Financial|Supply Chain|Regulatory|Resource|Environmental|Safety
probability text NOT NULL DEFAULT 'Medium',   -- Low|Medium|High
impact text NOT NULL DEFAULT 'Medium',        -- Low|Medium|High|Critical
status text NOT NULL DEFAULT 'Open',          -- Open|Mitigating|Monitoring|Closed
owner text,
raised text,
mitigation text
```
ID prefix: `RSK`

**4. Milestones (`morgan_milestones`)**
```sql
name text NOT NULL,
project text,
due_date text,
status text NOT NULL DEFAULT 'On Track',      -- On Track|At Risk|Overdue|Completed
type text NOT NULL DEFAULT 'Phase Gate',       -- Phase Gate|Delivery|Regulatory|Approval|Payment
owner text,
progress integer NOT NULL DEFAULT 0,
approval_status text NOT NULL DEFAULT 'Pending'  -- Approved|Pending|Rejected|Not Required
```
ID prefix: `MS`

**5. Documents (`morgan_documents`)**
```sql
name text NOT NULL,
doc_type text NOT NULL DEFAULT 'PDF',  -- PDF|DOCX|XLSX|ZIP|Folder
size text,
project text,
category text NOT NULL DEFAULT 'General',  -- General|Charter|Contract|Tender|Financial|Compliance|Media
author text,
modified text
```
ID prefix: `DOC`

**6. Portfolios (`morgan_portfolios`)**
```sql
name text NOT NULL,
description text,
project_count integer NOT NULL DEFAULT 0,
total_budget numeric NOT NULL DEFAULT 0,
health text NOT NULL DEFAULT 'Good',  -- Excellent|Good|At Risk|Critical
color text,
manager text,
status text NOT NULL DEFAULT 'Active'
```
ID prefix: `PRT`

**7. Timesheets (`morgan_timesheets`)**
```sql
employee text NOT NULL,
project text,
period text,           -- e.g. '2026-W09'
hours numeric NOT NULL DEFAULT 0,
overtime numeric NOT NULL DEFAULT 0,
status text NOT NULL DEFAULT 'Pending',  -- Pending|Approved|Rejected
notes text,
approved_by text
```
ID prefix: `TS`

### EXECUTION ORDER

**Step 1:** Create the single migration file `supabase/migrations/20260302_morgan_entity_tables.sql` with ALL 7 tables.

**Step 2:** Add ALL 7 type interfaces and 35 CRUD functions (5 per entity) to `lib/morgan/persistence.ts`.

**Step 3:** Create ALL 14 API route files (2 per entity: `route.ts` + `[id]/route.ts`).

**Step 4:** Wire ALL 7 UI components in `app/page.tsx` to fetch from their APIs.

**Step 5:** Add the new type imports to the top of `app/page.tsx`.

**Step 6:** Run `npx tsc --noEmit` and fix any errors until it passes clean.

### FILE INVENTORY (what already exists)

```
lib/morgan/persistence.ts     — 935 lines, append to this
lib/morgan/backbone.ts         — MorganProject + MorganTender types + fallback data
lib/morgan/tenant-context.ts   — resolveMorganTenantContext()
lib/morgan/lifecycle.ts        — workflow/automation lifecycle wrappers
lib/morgan/automation-dashboard.ts — automation aggregation
lib/supabase/index.ts          — supabaseAdmin export
app/page.tsx                   — 1,982 lines, THE main UI file
types.ts                       — Project, DocumentItem, SystemNotification types
tailwind.config.ts             — Tailwind theme extensions
supabase/migrations/20260301_morgan_multitenant_persistence.sql — existing 5 tables
```

### DO NOT

- Modify existing morgan_projects, morgan_tenders, morgan_workflows, or morgan_automations tables, routes, or persistence functions
- Change the SearchBar, KpiCard, SectionHeader, ActionBtn, or ProjectDetail components
- Add new npm dependencies
- Change any Tailwind config or CSS files
- Modify middleware.ts or auth files
- Create markdown documentation files

### FIELD NAME MAPPING CONVENTION

- DB columns: `snake_case` (e.g. `due_date`, `approval_status`)
- TypeScript interfaces: `camelCase` (e.g. `dueDate`, `approvalStatus`)
- You MAY need record-to-interface mapper functions (like `projectRecordToMorgan` in persistence.ts) — or you can keep fields as snake_case in the interface if the UI already renders them that way. Check how the hardcoded data in page.tsx names the fields and match that.

### CURRENT HARDCODED DATA TO MATCH

The UI currently uses these exact field names in its hardcoded arrays. Your DB columns should store these values and your API should return objects with these exact keys so the UI works without changes to the render logic:

**Tasks:** `{ id, title, project, due, priority, status }`
**Issues:** `{ id, title, severity, project, status, raised }`
**Risks:** `{ id, title, project, category, probability, impact, status, owner, raised, mitigation }`
**Milestones:** `{ id, name, project, dueDate, status, type, owner, progress, approvalStatus }`
**Documents:** `{ id, name, type, size, project, category, author, modified }`
**Portfolios:** `{ id, name, projectCount, totalBudget, health, color }` (from mock-extended)
**Timesheets:** `{ id, user, period, hours, overtime, status }`

## PROMPT END
