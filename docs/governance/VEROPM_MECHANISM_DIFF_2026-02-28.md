# VeroPM Mechanism Diff (Observed vs Current Clone)

Source evidence run: `artifacts/veropm-governance/run-2026-02-28T02-44-58-042Z/events.jsonl`

## Observed VeroPM Backbone Mechanism

1. **Permission gate before workflow/automation operations**
   - `POST /api/v1/workspace/{workspaceId}/permissions/check` returns `200` before listing/creating workflow/automation resources.

2. **Workflow creation lifecycle is API-first and read-after-write verified**
   - Create: `POST /api/v1/workflow` -> `200`
   - Immediate verify: `GET /api/v1/workflow/workspace/{workspaceId}` -> `200`
   - Version side-channel read: `GET /api/v1/workflow/{workflowId}/versions` -> `200`

3. **Automation creation lifecycle is separate from workflow creation**
   - List current rules: `GET /api/v1/automation/workspace/{workspaceId}` -> `200`
   - Create rule: `POST /api/v1/automation` -> `200`
   - Immediate verify: `GET /api/v1/automation/workspace/{workspaceId}` -> `200`
   - Execution history availability: `GET /api/v1/automation/execution-history/rule/{ruleId}` -> `200`

4. **Project/portfolio creation semantics are explicit entity instantiation + hydration**
   - Project create: `POST /api/v1/project` -> `201`
   - Read created project: `GET /api/v1/project/{projectId}` -> `200`
   - Hydration fan-out reads: statistics, budget summary, timeline, resources, activity endpoints.
   - Portfolio create: `POST /api/v1/portfolio` -> `201`
   - Follow-up verification and recalculation calls observed (`/health/recalculate`, dashboard, KPI endpoints).

5. **Failure semantics are visible and non-silent in template search path**
   - Multiple `GET /api/v1/project-templates?...searchTerm=...` return `500`.
   - Browser console surfaces API errors with backend message and stack summary.
   - System continues operating (non-fatal to overall session), indicating scoped failure domain.

## Current Clone (as described by you)

- Visual proposal/workflow interface and navigation replicated.
- Underlying entity instantiation, initialization defaults, persistence and recovery semantics not preserved.

## Mechanism Delta (What is Missing in Current Clone)

1. **Missing explicit permission-check transition**
   - Clone must model `permission_check -> authorized/denied` before create/list actions.

2. **Missing deterministic read-after-write verification transitions**
   - After create, clone must require verification GET state before terminal success.

3. **Missing workflow/automation separation**
   - Clone must represent workflow template lifecycle and automation rule lifecycle as distinct state machines.

4. **Missing post-create hydration fan-out**
   - Clone must include deterministic downstream hydration transitions after entity create (not just success toast/UI update).

5. **Missing explicit scoped failure handling**
   - Template search `500` path indicates recoverable subsystem error; clone must map this to known non-terminal failure state with continued operation.

6. **Missing execution-history observability for automation**
   - Clone must include `execution_history_available` state after rule creation.

## Required Deterministic States to Add (Minimum)

- `S_PERMISSION_CHECK_PENDING`
- `S_PERMISSION_DENIED` (terminal failure)
- `S_WORKFLOW_CREATE_REQUESTED`
- `S_WORKFLOW_CREATED`
- `S_WORKFLOW_VERIFIED`
- `S_AUTOMATION_CREATE_REQUESTED`
- `S_AUTOMATION_CREATED`
- `S_AUTOMATION_VERIFIED`
- `S_AUTOMATION_HISTORY_VERIFIED`
- `S_TEMPLATE_QUERY_FAILED_RECOVERABLE`
- `S_ENTITY_HYDRATION_IN_PROGRESS`
- `S_ENTITY_HYDRATION_COMPLETE`

## Known Terminal States

- `TERMINAL_SUCCESS` (create + verify + hydration complete)
- `TERMINAL_PERMISSION_DENIED`
- `TERMINAL_NON_DETERMINISTIC` (if create response exists but verify transitions are absent)

## Why Ledger Script Previously Failed

- `build-veropm-ledger.ts` expects finalized `snapshots.json`.
- The active capture run had snapshots PNGs and `events.jsonl` but no finalized `snapshots.json` when invoked.
- This is a tooling finalization gap, not an absence of mechanism evidence in the events log.
