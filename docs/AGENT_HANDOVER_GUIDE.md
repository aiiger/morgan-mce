# MCE Command Center 2026 — Full Agent Handover Guide

**Date:** 2026-03-01
**From:** Outgoing Senior Consultant (Claude Opus 4)
**To:** Incoming AI Agent
**Project:** Nexus Construct ERP / MCE Command Center
**Completion:** ~96% — remaining work is detailed in Section 6

---

## 1. PROJECT IDENTITY

**What is this?** A construction-industry ERP command center for Morgan Construction & Engineering (MCE). It manages projects, tenders, documents, financials, workflows, and automations with a premium dark-glass UI.

**Live URL:** `https://mce-command-center-tau.vercel.app`
**Dev URL:** `http://localhost:3000`

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| Language | TypeScript | 5.8.2 |
| Database | Supabase (PostgreSQL) | Hosted |
| Auth | Clerk | 6.36.10 |
| Styling | Tailwind CSS | 4.1.18 |
| State | React Query + Supabase real-time | 5.90.20 |
| AI | Google Gemini (chat assistant) | @google/genai 1.38.0 |
| Storybook | Storybook 10 + nextjs-vite | 10.2.4 |
| Testing | Vitest + Playwright | 4.0.18 / 1.58.1 |
| React | React 19 | 19.2.3 |

### Authority Files (Read These First)

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `CLAUDE.md` | Primary project authority — architecture, commands, patterns |
| 2 | `.github/copilot-instructions.md` | Workspace-level Copilot rules, token system, key files |
| 3 | `styles/tokens-2026.css` | Design token source of truth (all colors, spacing) |
| 4 | `tailwind.config.ts` | Tailwind theme extensions (gov-* scale, glass tokens) |

---

## 2. QUICK START

```powershell
cd "c:\Users\t1glish\Downloads\nexus-construct-erp (2)"
npm install
npm run dev          # localhost:3000
npx tsc --noEmit     # Must pass — zero errors
npm run build        # Must pass — production build
```

### All npm Scripts

| Script | Purpose |
|--------|---------|
| `dev` | Next.js dev server (Turbopack) |
| `dev:fresh` | Kill ports, clear .next, restart |
| `build` | Production build (required gate) |
| `lint` | `tsc --noEmit` type check |
| `storybook` | Storybook dev on port 6006 |
| `build-storybook` | Static Storybook build |
| `test:design` | Storybook accessibility tests |
| `health` | Unified health check |
| `diagnose` / `diagnose:gate` / `diagnose:full` | Deployment diagnostics |
| `audit:styles` | Style audit |
| `validate:schema` | Schema drift check |
| `validate:rls` | RLS coverage check |
| `morgan:cutover` | Full Morgan persistence pipeline (4 steps) |
| `morgan:check-schema` | Supabase schema preflight |
| `morgan:migrate:file-to-supabase` | File store → Supabase migration |
| `morgan:migrate:legacy:tenders-docs` | Legacy tender/doc consolidation |
| `morgan:verify` | `tsc --noEmit && build` |
| `governance:capture:veropm` | VeroEPM governance capture |
| `governance:ledger:veropm` | Build governance ledger |
| `governance:clone:veropm` | Capture + ledger combined |

---

## 3. ARCHITECTURE DEEP DIVE

### Directory Structure

```
app/                          # Next.js App Router
  ├── page.tsx                # Landing page
  ├── layout.tsx              # Root layout (Clerk, React Query, Theme providers)
  ├── admin/health/           # System health dashboard (L4 only)
  ├── api/
  │   ├── ai/                 # Gemini chat endpoints
  │   ├── health/             # Health probe API
  │   ├── morgan/             # Full CRUD routes (see below)
  │   ├── resources/          # Resource management API
  │   └── webhooks/           # Clerk webhooks
  └── ...

components/
  ├── dashboard/              # MorganCommandCenter + subviews
  │   ├── MorganCommandCenter.tsx   # Main dashboard shell (1000+ lines)
  │   ├── ProjectsView, TendersView, RiskView, FinancialsView, TasksView
  │   ├── CalendarView, StrategicView, DocumentsView, AgentsView
  │   ├── IntegrationsView, ReportsView
  │   └── SystemStatusConsole, RiskHeatmap, etc.
  ├── forms/                  # ProjectForm, TenderForm (POST to Morgan API)
  ├── pages/                  # FinancialsPage, ResourcesPage, DocumentsPage
  ├── projects/               # ProjectPulse, ProjectTimeline
  ├── tenders/                # TenderDetail, TenderKanban, TenderIntakeWizard
  ├── tasks/                  # CategoryModal, etc.
  ├── ui/                     # GlassPanel, GlassCard, Button, Badge, StatusBadge, etc.
  ├── governance/             # GovernanceTable, TabNav
  └── ChatAssistant.tsx       # Floating AI chat widget (Mr. Morgan)

hooks/
  ├── useDashboardData.ts     # Orchestrates all domain hooks
  ├── useUserTier.ts          # Clerk → Supabase profile → L1-L4 tier
  ├── domain/
  │   ├── useProjects.ts      # projects_master table + real-time
  │   ├── useTenders.ts       # tenders table + real-time
  │   ├── useDocuments.ts     # documents table + real-time
  │   └── useProcurement.ts   # purchase_orders + real-time
  ├── useSystemHealth.ts      # System alerts
  └── useResourceData.ts      # Resource management data

lib/
  ├── morgan/
  │   ├── persistence.ts      # 935-line CRUD (Supabase-first + file fallback)
  │   ├── automation-dashboard.ts  # Tenant-scoped automation data
  │   └── ...
  ├── supabase/
  │   ├── client.ts           # Browser client
  │   └── admin.ts            # Service-role client (server only)
  ├── ai/
  │   ├── assistant-context.ts # System prompt builder
  │   └── gemini.ts           # Gemini API wrapper
  └── ...

styles/
  ├── tokens-2026.css         # PRIMARY design tokens (dark + light mode)
  ├── design-tokens.css       # Extended tokens (734 lines)
  └── ...

scripts/
  ├── morgan/                 # Migration & validation scripts
  ├── governance/             # VeroEPM capture & ledger
  ├── health/                 # Health checks
  └── diagnostic/             # Deployment gates
```

### Morgan API Route Tree

```
app/api/morgan/
├── projects/          GET (list) · POST (create)
│   └── [id]/          GET · PATCH · DELETE
├── tenders/           GET (list) · POST (create)
│   └── [id]/          GET · PATCH · DELETE
├── workflows/         GET (list) · POST (create)
│   └── [id]/          GET · PATCH · DELETE
├── automations/       GET (list) · POST (create)
│   └── [id]/          GET · PATCH · DELETE
│       └── history/   GET (execution history)
├── automation/        GET (dashboard data)
│   └── alerts/[id]/ack/  POST (acknowledge alert)
├── permissions/check/ POST (tier check)
└── project-templates/ GET (templates)
```

### Data Flow

```
                    ┌──────────────────────┐
                    │  useDashboardData()  │  ← Composes all hooks
                    └──────────┬───────────┘
          ┌────────────────────┼────────────────────┐
          │                    │                     │
  useProjects()        useTenders()          useDocuments()
  (projects_master)    (tenders)             (documents)
          │                    │                     │
          └────────────────────┼────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Supabase Real-Time   │  ← Auto-refresh on changes
                    └──────────────────────┘

  Form submits → fetch('/api/morgan/X', { method: 'POST' }) → persistence.ts → Supabase
```

### Authentication & Tiers

```
hooks/useUserTier.ts

Clerk user → Supabase profiles table → role + tier
  L1 = viewer (read-only)
  L2 = agent  (read + create)
  L3 = manager (+ executive cockpit)
  L4 = super_admin (full access)

Executive overrides hardcoded for:
  mkhalil024@gmail.com → L4 super_admin
  3ali.mohammadi@gmail.com → L3
```

**IMPORTANT:** `middleware.ts` is currently a no-op (`return;`). It defines route matchers but does NOT enforce tier-based blocking. This is a known gap — see Section 6.

### Multi-Tenant Persistence (Morgan Module)

All Morgan tables are scoped by `(user_id, workspace_id)`:

| Table | Purpose |
|-------|---------|
| `morgan_projects` | Projects with status, value, progress |
| `morgan_tenders` | Tenders with compliance, win probability |
| `morgan_workflows` | Workflow definitions |
| `morgan_automations` | Automation rules |
| `morgan_automation_execution_history` | Execution audit trail |
| `morgan_tender_document_links` | Bridge: legacy docs ↔ Morgan tenders |

SQL migrations: `supabase/migrations/20260301_morgan_multitenant_persistence.sql` (applied)
Legacy consolidation: `supabase/migrations/20260301_morgan_legacy_consolidation.sql` (not yet applied)

---

## 4. DESIGN SYSTEM

### Source of Truth

`styles/tokens-2026.css` defines ALL design variables. Dark mode is default; light mode via `[data-theme="light"]`.

### Token Quick Reference

**Backgrounds:**
```
--bg-base: #050505       → bg-bg-base
--bg-surface: #050505    → bg-bg-surface
--bg-layer: #0e0e0e      → bg-bg-layer (alias: bg-glass in index.css)
--bg-hover: #121212      → bg-bg-hover
--bg-active: #18181b     → bg-bg-active
--bg-input: #080808      → bg-bg-input
```

**Text:**
```
--text-primary: #f5f5f7   → text-text-primary
--text-secondary: #a1a1aa → text-text-secondary
--text-tertiary: #71717a  → text-text-tertiary
--text-disabled: #52525b  → text-text-disabled
```

**Borders:**
```
--surface-border: rgba(255,255,255,0.05) → border-border-base
```

**Status Colors:**
```
--color-critical → text-critical (rose-700 / #be185d)
--color-warning  → text-warning  (amber-600 / #b45309)
--color-success  → text-success  (emerald-600 / #059669)
```

**Brand:**
```
--mce-teal: #51a2a8       → MCE brand teal
--mce-red: #c21719        → MCE brand red
--mce-teal-soft: #a0d0d7  → Soft teal (light mode sidebar)
```

### Font Scale (Governance)

These are the ONLY font sizes allowed. Defined in `tailwind.config.ts`:

| Tailwind Class | Size | Weight | Use |
|---------------|------|--------|-----|
| `text-gov-hero` | 32px | 700 | Hero page titles |
| `text-gov-title` | 18px | 600 | Section headings |
| `text-gov-header` | 14px | 600 | Card headers |
| `text-gov-body` | 13px | 400 | Body text, data rows |
| `text-gov-label` | 11px | 500 | Labels, chips |
| `text-gov-metric` | 13px | 600 | KPI values |
| `text-caption` | 10px | 500 | Captions (uppercase) |

Standard Tailwind also allowed: `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-lg` (18px), `text-xl`–`text-5xl`.

### What Is Forbidden

- `font-black` (weight 900) — use `font-bold` (700) or `font-semibold` (600)
- `text-[Npx]` arbitrary values — use gov scale or standard Tailwind
- `white/[0.XX]` arbitrary opacity — use `bg-glass` utility or token vars
- Hardcoded hex colors (`#XXXXXX`) — use semantic tokens
- `tracking-[0.XXem]` — use `tracking-tight`, `tracking-normal`, or `tracking-wide`
- ALL CAPS headings — use Title Case (exception: `text-caption` has built-in uppercase)

### Glass Effect System

```css
/* In index.css @layer utilities */
.bg-glass {
  backdrop-filter: blur(12px);
  border: 1px solid white/5%;
  background-color: var(--bg-surface);
}
```

Use `bg-glass` for glassmorphism panels instead of manual `white/[0.XX]` hacks.

---

## 5. SUPABASE CONFIGURATION

### Connection

```
URL:  https://fgkqmleltfyuyigmtpqy.supabase.co
Keys: Set in .env.local (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
```

### Key Tables

| Category | Tables |
|----------|--------|
| Morgan | `morgan_projects`, `morgan_tenders`, `morgan_workflows`, `morgan_automations`, `morgan_automation_execution_history` |
| Legacy | `projects_master`, `tenders`, `documents`, `invoices`, `tasks` |
| Auth | `profiles` (synced from Clerk) |
| Resources | `team_members`, `resource_pools`, `resource_allocations`, `utilization_metrics`, `manpower_plans` |
| Alarms | `alarm_rules`, `notification_preferences`, `notification_snoozes` |
| Comms | `tender_comms_events` |

### RLS

Row Level Security is enabled on all Morgan tables. No permissive RLS policies exist — all server-side queries use the service role key which bypasses RLS. Browser-side queries to legacy tables use the anon key with RLS policies.

### Applied Migrations

| File | Status |
|------|--------|
| `supabase/migrations/20260301_morgan_multitenant_persistence.sql` | APPLIED — 5 tables, triggers, indexes |
| `supabase/migrations/20260301_morgan_legacy_consolidation.sql` | NOT YET APPLIED — `morgan_tender_document_links` table |

DBA runbook: `docs/governance/MORGAN_SUPABASE_DBA_RUNBOOK_2026-03-01.md`

---

## 6. REMAINING WORK (The Todo List)

Current project completion: **~96%**. Below is every remaining task, prioritized and with exact instructions.

### TASK 1: Wire Dashboard Inline Mutations
**Severity:** Medium | **Scope:** ~4 components | **Effort:** 2-3 hours

**Problem:** `MorganCommandCenter.tsx` is display-only. `ProjectsView` and `TendersView` receive data as props but have zero edit/delete callbacks. The form components (`ProjectForm`, `TenderForm`) can create via POST, but the dashboard views don't offer inline edit or delete.

**What to do:**
1. Add `onEdit` and `onDelete` callback props to `ProjectsView` and `TendersView`
2. Wire those to `fetch('/api/morgan/projects/{id}', { method: 'PATCH'|'DELETE' })`
3. After mutation, call `refetch()` from `useDashboardData` to refresh real-time data
4. Wire `TasksView` stubs (currently `console.log`) to actual API calls

**Pattern to follow (from ProjectForm.tsx):**
```typescript
const response = await fetch('/api/morgan/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, value, status, ... })
});
if (!response.ok) { /* handle error */ }
onSuccess(); // triggers refetch
```

**API routes already exist:**
- `PATCH /api/morgan/projects/[id]` — update project
- `DELETE /api/morgan/projects/[id]` — delete project
- `PATCH /api/morgan/tenders/[id]` — update tender
- `DELETE /api/morgan/tenders/[id]` — delete tender

---

### TASK 2: Activate Middleware Tier Blocking
**Severity:** High | **Scope:** 1 file | **Effort:** 30 minutes

**Problem:** `middleware.ts` currently returns immediately (`return;`). Any user can URL-hack to any page regardless of tier.

**What to do:**
1. Uncomment/restore the Clerk middleware when `isClerkConfigured` is true
2. Add tier-based route blocking:
   - `/admin/*` → L4 only
   - Executive routes → L3+
   - API mutation routes → L2+
3. Use `auth()` from Clerk to get user, then fetch tier from Supabase profiles

**Current file (`middleware.ts`):**
```typescript
export default function middleware() {
  // Clerk disabled for testing: let all requests through.
  return;
};
```

**Target pattern:**
```typescript
export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  const { userId } = await auth.protect(); // Throws 401 if not authenticated
  // Optional: fetch tier from Supabase and block routes
});
```

---

### TASK 3: Purge `font-black` (34 files)
**Severity:** High | **Scope:** 34 component files | **Effort:** 1-2 hours

**Rule:** `font-black` (weight 900) is forbidden by the 2026 design governance. Replace with:

| Current | Replacement |
|---------|-------------|
| `font-black` on headings | `font-bold` (700) |
| `font-black` on labels | `font-semibold` (600) |
| `font-black` on KPI values | `font-bold` (700) |

**Approach:** Global find-and-replace in `components/` directory:
```
Search: font-black
Replace: font-bold
```
Then manually review ~5 label cases that should be `font-semibold` instead.

**Also remove from `index.css`** — the `h1-h6` base layer:
```css
/* CURRENT (line ~92): */
h1, h2, h3, h4, h5, h6 {
  @apply font-black italic tracking-tighter uppercase;
}

/* REPLACE WITH: */
h1, h2, h3, h4, h5, h6 {
  @apply font-bold tracking-tight;
}
```
This removes `font-black`, `italic`, and `uppercase` from all headings globally.

---

### TASK 4: Replace Arbitrary `text-[Npx]` Sizes (103 files)
**Severity:** High | **Scope:** 103 files | **Effort:** 3-5 hours (largest task)

**Rule:** All font sizes must use the governance scale or standard Tailwind classes. No `text-[Xpx]`.

**Replacement Map:**

| Arbitrary | Standard Replacement |
|-----------|---------------------|
| `text-[8px]` | `text-caption` (10px) or `text-gov-label` (11px) |
| `text-[9px]` | `text-gov-label` (11px) |
| `text-[10px]` | `text-caption` (10px) or `text-xs` (12px) |
| `text-[11px]` | `text-gov-label` (11px) or `text-xs` (12px) |
| `text-[12px]` | `text-xs` (12px) |
| `text-[13px]` | `text-gov-body` (13px) or `text-sm` (14px) |
| `text-[14px]` | `text-sm` (14px) |
| `text-[15px]` | `text-sm` (14px) |
| `text-[16px]` | `text-base` (16px) |
| `text-[18px]` | `text-lg` (18px) or `text-gov-title` (18px) |
| `text-[20px]` | `text-xl` (20px) |
| `text-[24px]` | `text-2xl` (24px) |
| `text-[28px]` | `text-3xl` (30px) |
| `text-[32px]` | `text-gov-hero` (32px) |
| `text-[36px]+` | `text-4xl` (36px) or `text-5xl` (48px) for KPI values |

**Approach:**
1. Search `text-\[` in components/ to find all instances
2. Replace each with the closest governance/Tailwind class from the map above
3. Visual spot-check after bulk replacement — some KPI metric tiles intentionally use large sizes for value density

---

### TASK 5: Replace `white/[0.XX]` Opacity Hacks (24 files)
**Severity:** High | **Scope:** 24 files | **Effort:** 1-2 hours

**Rule:** Arbitrary opacity values are forbidden. Use the glass token system.

**Replacement Map:**

| Current | Replacement |
|---------|-------------|
| `bg-white/[0.01]` | `bg-bg-surface` or remove (barely visible) |
| `bg-white/[0.02]` to `bg-white/[0.03]` | `bg-bg-surface` |
| `bg-white/[0.05]` | `bg-bg-hover` |
| `bg-white/[0.08]` to `bg-white/[0.1]` | `bg-bg-active` |
| `border-white/[0.03]` to `border-white/[0.05]` | `border-border-base` |
| `border-white/[0.08]` to `border-white/[0.1]` | `border-white/10` (Tailwind standard) |
| `hover:bg-white/[0.03]` | `hover:bg-bg-hover` |
| `hover:bg-white/[0.05]` | `hover:bg-bg-hover` |
| `hover:border-white/[0.08]` | `hover:border-white/10` |

**Also available:** `bg-glass` utility class in `index.css` for full glassmorphism panels.

---

### TASK 6: Replace Hardcoded Hex Colors (21 files)
**Severity:** High | **Scope:** 21 files | **Effort:** 1-2 hours

**Rule:** No hardcoded hex values in component JSX/TSX. Use token-backed Tailwind classes.

**Common Violations & Fixes:**

| Hardcoded | Replacement |
|-----------|-------------|
| `#00ffff` / `#00f5ff` (neon cyan) | `text-neon-cyan` (class in index.css) |
| `#0071e3` (Apple blue) | `text-text-link` or `text-info` |
| `#ffffff` | `text-text-primary` (dark mode) |
| `#000000` | `bg-bg-base` or `text-text-primary` (light mode via token) |
| Status color swatches in modals | Use `text-critical`, `text-warning`, `text-success` |
| Chart/graph hardcoded colors | These are acceptable in Recharts `<Line stroke="#xxx">` — SVG needs literal values |

**Exception:** Recharts, SVG fills, and `tailwind.config.ts` definitions can use hex. Only component className strings must use tokens.

---

### TASK 7: Fix Storybook Stories Glob
**Severity:** Medium | **Scope:** 1 file | **Effort:** 5 minutes

**Problem:** `.storybook/main.ts` only scans `stories/` but component stories live in `components/`.

**Fix in `.storybook/main.ts`:**
```typescript
stories: [
  "../stories/**/*.mdx",
  "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"  // ADD THIS LINE
],
```

---

### TASK 8: Add Vitest Unit Test Script
**Severity:** Medium | **Scope:** 2 files | **Effort:** 15 minutes

**Problem:** `vitest` is installed, config exists, but no `npm test` script. The vitest config also has a duplicated project block.

**Fix 1 — Add to `package.json` scripts:**
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Fix 2 — Clean `vitest.config.ts`:** Remove the duplicate project block (the storybook project is defined twice).

**Fix 3 — (Optional) Add a unit test project** alongside the storybook project:
```typescript
{
  test: {
    name: 'unit',
    include: ['**/*.test.{ts,tsx}'],
    environment: 'node'
  }
}
```

---

### TASK 9: Apply Legacy Consolidation SQL
**Severity:** Low | **Scope:** User action in Supabase | **Effort:** 2 minutes

**File:** `supabase/migrations/20260301_morgan_legacy_consolidation.sql`

**Action:** Open Supabase SQL Editor → paste file contents → run. Creates `morgan_tender_document_links` table which bridges legacy documents to Morgan tenders.

Currently the migration script (`morgan:cutover`) gracefully skips this when the table doesn't exist.

---

### TASK 10: Standardize Spacing to 8px Grid
**Severity:** Medium | **Scope:** ~30 files | **Effort:** 2-3 hours

**Rule:** All spacing should use multiples of 4px, preferring 8px grid (Tailwind `p-2` = 8px, `p-4` = 16px, `p-6` = 24px).

**Common Violations:**
- Mixed `p-4`/`p-5`/`p-6` within the same component
- `px-7`, `py-9` arbitrary spacing
- Inconsistent `gap-3`/`gap-4`/`gap-5` in dashboard grids

**Gov spacing tokens (in tailwind.config.ts):**
```
gov-1: 4px, gov-2: 8px, gov-3: 12px, gov-4: 16px
gov-5: 20px, gov-6: 24px, gov-8: 32px, gov-10: 40px
```

**Standard Tailwind equivalents also acceptable:** `p-1`=4px, `p-2`=8px, `p-3`=12px, `p-4`=16px, `p-6`=24px, `p-8`=32px.

---

### TASK 11: Unify Border Radius
**Severity:** Low | **Scope:** ~15 files | **Effort:** 1 hour

**Allowed values:**
- `rounded-lg` (8px) — form inputs, small elements
- `rounded-xl` (12px) — cards, panels
- `rounded-2xl` (16px) — modals, large containers (sparingly)
- `rounded-full` — avatars, pills

**Remove:** `rounded-3xl`, custom `rounded-[Xpx]`.

---

### TASK 12: Remove ALL CAPS from Dashboard Headers
**Severity:** Low | **Scope:** ~6 files | **Effort:** 30 minutes

QueueCard titles and section headers use `uppercase`. Convert to Title Case.

Also remove from `index.css` heading base (covered in Task 3).

---

### TASK 13: AI Chatbot Production Check
**Severity:** Low | **Scope:** 1 component | **Effort:** 30 minutes

**File:** `components/ChatAssistant.tsx`

**Check:**
- System prompt tone is professional (no disclaimers)
- Error handling for `AI_GATEWAY_UNREACHABLE`, `AI_GATEWAY_TIMEOUT`, `AI_GATEWAY_MISCONFIGURED`
- Rate limiting works (Upstash integration in API route)
- Tactical presets (`BID_INTEL`, `OPS_AUDIT`, `RED_FLAGS`) produce useful responses

---

### TASK 14: Final Build + Type Verification
**Severity:** Blocker | **Scope:** Full project | **Effort:** 5 minutes

**After all changes, run:**
```bash
npx tsc --noEmit     # Must produce zero errors
npm run build        # Must complete successfully
```

Both must pass. This is the non-negotiable exit gate.

---

## 7. ENVIRONMENT VARIABLES

All secrets are in `.env.local` (never committed to git):

| Variable | Status | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Set | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set | Browser-side Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | Set | Server-side (bypasses RLS) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Set | Clerk auth (client) |
| `CLERK_SECRET_KEY` | Set | Clerk auth (server) |
| `GEMINI_API_KEY` | Set | Google Gemini AI |
| `GEMINI_MODEL` | Set | Model selection |
| `GEMINI_EMBEDDING_MODEL` | Set | Embedding model |
| `AI_GATEWAY_URL` | Set | AI proxy URL |
| `VERCEL_OIDC_TOKEN` | Set | Vercel deployment |
| `UPSTASH_REDIS_REST_URL` | MISSING | Optional — rate limiting |

---

## 8. KNOWN GOTCHAS

1. **Module-level Supabase import in scripts:** Migration scripts create their own Supabase client AFTER `dotenv.config()`. Don't import `lib/supabase/admin.ts` directly in scripts — it initializes before env vars load.

2. **`toNumber()` coercion:** Legacy data has null/undefined numeric fields. The migration scripts use a `toNumber()` helper to prevent NOT NULL violations. Keep this pattern for any new migrations.

3. **Executive email overrides:** `useUserTier.ts` has hardcoded email → tier overrides at lines 101-106 and 148-149. These are intentional for the two founder accounts.

4. **Storybook vitest addon disabled:** Commented out in `.storybook/main.ts` due to a project name conflict. Leave it disabled unless resolved.

5. **Dashboard reads bypass Morgan API:** `useDashboardData` reads directly from Supabase tables (`projects_master`, `tenders`) via domain hooks, NOT from Morgan API routes. Morgan API is used only for writes and for the automation dashboard. This is intentional — real-time subscriptions work at the Supabase level.

6. **`index.css` heading reset:** The global `h1-h6` style applies `font-black italic tracking-tighter uppercase` to ALL headings. This must be fixed as part of Task 3 — it overrides component-level typography.

7. **File store fallback:** `lib/morgan/persistence.ts` writes to `data_exports/morgan-backbone-store.json` when Supabase is unavailable. This is a safety net, not primary storage.

---

## 9. VALIDATION CHECKLIST

After completing all tasks, verify:

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — production build passes
- [ ] `npm run dev` — localhost:3000 loads without console errors
- [ ] Dashboard views render projects, tenders, and KPIs
- [ ] No `font-black` in components/ (grep check)
- [ ] No `text-[` arbitrary sizes in components/ (grep check)
- [ ] No `white/[0.` in components/ (grep check)
- [ ] No hardcoded `#XXXXXX` in component classNames (grep check)
- [ ] Storybook picks up component stories (`npm run storybook`)
- [ ] `npm test` runs vitest successfully
- [ ] ChatAssistant responds to queries without errors
- [ ] Middleware blocks unauthenticated access to protected routes (when Clerk configured)

---

## 10. CONTACT & RESOURCES

| Resource | Location |
|----------|----------|
| Supabase Dashboard | `https://supabase.com/dashboard/project/fgkqmleltfyuyigmtpqy` |
| Vercel Dashboard | `https://vercel.com/` (MCE deployment) |
| DBA Runbook | `docs/governance/MORGAN_SUPABASE_DBA_RUNBOOK_2026-03-01.md` |
| Execution Checklist | `docs/governance/SENIOR_CONSULTANT_EXECUTION_CHECKLIST_2026-03-01.md` |
| Design Governance Audit | `DESIGN_GOVERNANCE_AUDIT_2026.md` |
| Governance Implementation Status | `GOVERNANCE_IMPLEMENTATION_STATUS.md` |

---

**End of Handover. Good luck.**
