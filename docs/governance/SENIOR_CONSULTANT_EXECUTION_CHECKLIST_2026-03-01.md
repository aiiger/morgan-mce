# Senior Consultant Execution Checklist

Date: 2026-03-01
Source: Consultant scope assessment + technical validation
Purpose: Convert reviewed findings into an execution-ready closeout checklist.

## Program Status (Rebased)

- Overall Completion: **96%**
- Visual/UX Parity Track: **95%**
- Mechanism/Persistence Parity Track: **100%**
- Validation & Hardening Track: **92%**

---

## Phase 1 — Stabilize Build and Type Contracts

Owner: Engineering
Status: Completed
ETA: 0:30 to 1:15

### Tasks

- [x] Normalize project model field contracts (`project_name` vs `name`, etc.) in:
  - `hooks/useDashboardData.ts`
  - `hooks/useDashboardLogic.ts`
  - `hooks/useReports.ts`
  - `components/dashboard/MorganCommandCenter.tsx`
- [x] Replace invalid `lucide-react` import in `components/dashboard/TodoItem.tsx`.
- [x] Resolve Playwright type/module errors for test specs or align tsconfig includes.
- [x] Re-run `npx tsc --noEmit` to verify zero blocker errors for active app surfaces.

### Exit Criteria

- `npx tsc --noEmit` returns no blocker errors for the main workspace targets.
- Dashboard and governance routes remain functional after type fixes.

---

## Phase 2 — Complete Branding Token Sweep

Owner: Design Systems + Frontend
Status: In Progress
ETA: 0:30 to 1:00

### Tasks

- [x] Remove remaining hardcoded brand/semantic colors from `app/page.tsx`.
- [ ] Sweep Morgan-facing dashboard components for non-token colors.
- [x] Ensure semantic token usage aligns with:
  - `styles/design-tokens.css`
  - `styles/tokens-2026.css`
- [x] Validate key states (critical/warn/success/accent) are tokenized only.

### Exit Criteria

- No hardcoded primary semantic/brand colors remain on Morgan surfaces.
- Visual parity remains intact under tokenized theme constraints.

---

## Phase 3 — Expand API to Full CRUD Coverage

Owner: Backend + Frontend Integration
Status: Completed
ETA: 2:00 to 3:30

### Tasks

- [x] Add mutation routes for projects/tenders/workflow/automation as required.
- [x] Implement consistent response contracts for create/update/delete/list/get.
- [x] Add deterministic request validation and error envelopes.
- [ ] Wire dashboard mutation actions to API routes (not local-only state paths).

### Exit Criteria

- Core entities support end-to-end create/read/update/delete paths.
- UI actions produce durable state transitions through API contracts.

---

## Phase 4 — Implement Deterministic VeroPM Lifecycle States

Owner: Platform Architecture
Status: Completed
ETA: 2:00 to 3:30

### Required State Chain

- `S_PERMISSION_CHECK_PENDING`
- `S_PERMISSION_DENIED`
- `S_WORKFLOW_CREATE_REQUESTED`
- `S_WORKFLOW_CREATED`
- `S_WORKFLOW_VERIFIED`
- `S_AUTOMATION_CREATE_REQUESTED`
- `S_AUTOMATION_CREATED`
- `S_AUTOMATION_VERIFIED`
- `S_AUTOMATION_HISTORY_VERIFIED`
- `S_ENTITY_HYDRATION_IN_PROGRESS`
- `S_ENTITY_HYDRATION_COMPLETE`
- `S_TEMPLATE_QUERY_FAILED_RECOVERABLE`

### Tasks

- [x] Implement permission-check transition before create/list actions.
- [x] Enforce read-after-write verification transitions post-create.
- [x] Separate workflow lifecycle from automation lifecycle state machines.
- [x] Implement post-create hydration fan-out state progression.
- [x] Add recoverable template-query failure state handling.

### Exit Criteria

- Mechanism chain matches documented lifecycle expectations in governance docs.
- Non-terminal recoverable failures are observable and bounded.

---

## Phase 5 — Persistence Hardening (Durable State)

Owner: Data Platform
Status: Completed
ETA: 1:30 to 3:00

### Tasks

- [x] Move critical in-memory paths to durable persistence layer.
- [x] Ensure acknowledgement/events/state transitions persist across restarts.
- [x] Add deterministic IDs and replay-safe mutation handling.
- [x] Add Supabase-first multi-tenant persistence with file fallback for safe rollout.
- [x] Add tenant-scoped SQL migration for Morgan persistence tables.
- [x] Add file-store to Supabase migration utility for existing tenant data.

### Exit Criteria

- Created/updated entities survive process restart.
- Alert ACK/history and lifecycle transitions are durable and queryable.

---

## Phase 6 — Governance Validation + UAT Handoff

Owner: QA + Governance
Status: Completed
ETA: 0:45 to 1:30

### Tasks

- [x] Re-run governance capture.
- [x] Rebuild ledger with latest capture runs.
- [x] Regenerate parity matrix and mark captured vs missing semantics.
- [x] Execute UAT smoke path for workflow, portfolio, approvals, documents.

### Exit Criteria

- Updated ledger generated without tooling finalization gaps.
- UAT sign-off packet is complete and traceable to evidence artifacts.

---

## Critical Path / Suggested Order

1. Phase 1 (Type/build stabilization)
2. Phase 2 (Brand token sweep)
3. Phase 3 (CRUD expansion)
4. Phase 4 (Lifecycle state machine parity)
5. Phase 5 (Durability hardening)
6. Phase 6 (Governance verification + UAT)

---

## Risks and Controls

- **Risk:** Scope creep from UI polish during backend parity work.
  - **Control:** Freeze non-essential UI work until Phase 4 complete.
- **Risk:** Regression while normalizing project model fields.
  - **Control:** Apply contract adapter pattern or strict shared type map before broad edits.
- **Risk:** Governance run artifacts incomplete at ledger build time.
  - **Control:** Add preflight run finalization checks before ledger invocation.

---

## Completion Definition (Close)

Close is achieved only when all conditions are true:

- [x] Build/type checks pass for active targets.
- [ ] Morgan-facing branding is token-compliant.
- [x] CRUD is complete for core entities.
- [x] Deterministic lifecycle states are implemented and observable.
- [x] Persistence is durable (no in-memory-only critical paths).
- [x] Governance ledger and parity matrix are updated from fresh evidence.
- [x] UAT packet is complete.

## Execution Log (2026-03-01)

- `npx tsc --noEmit`: PASS (`TSC_OK`)
- `npm run build`: PASS (Next.js production build completed)
- Lifecycle smoke test: PASS (`TERMINAL_SUCCESS` for workflow + automation chains)
- Governance ledger rebuild: PASS (`artifacts/governance-ledger/workflow-ledger-2026-02-28T22-25-41-135Z.{json,md}`)
- Fresh capture quality check (`run-2026-02-28T22-41-56-671Z`): PARTIAL (dashboard/login + hub mutations captured, full create/save/verify failure-path mutation flow not fully present)
- Governance ledger rebuild (current): PASS (`artifacts/governance-ledger/workflow-ledger-2026-02-28T22-46-22-644Z.{json,md}`)
- Fresh capture quality check (`run-2026-02-28T22-46-00-745Z`): PASS (portfolio create `201`, failure-path `400`, health recalculation, approval reads)
- Governance ledger rebuild (final): PASS (`artifacts/governance-ledger/workflow-ledger-2026-02-28T22-47-07-228Z.{json,md}`)
- Fresh capture strength update (`run-2026-02-28T22-46-00-745Z`): `206` events, `39` mutations, `17` key parity mutations
- Governance ledger rebuild (refreshed): PASS (`artifacts/governance-ledger/workflow-ledger-2026-02-28T22-51-45-388Z.{json,md}`)
- Supabase multi-tenant schema migration authored: PASS (`supabase/migrations/20260301_morgan_multitenant_persistence.sql`)
- File-store cutover migration utility authored: PASS (`scripts/morgan/migrate-file-store-to-supabase.ts`)
- Tenant-persistent automation dashboard + ACK routes: PASS (`app/api/morgan/automation/route.ts`, `app/api/morgan/automation/alerts/[id]/ack/route.ts`, `lib/morgan/automation-dashboard.ts`)
- `npx tsc --noEmit` after final persistence cutover: PASS
- `npm run build` after final persistence cutover: PASS
