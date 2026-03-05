# VeroPM Deterministic Clone Protocol

Purpose: clone workflow/proposal backbone behavior (instantiation, initialization, persistence, failure semantics) with auditable evidence.

## Run Order

1. Capture live behavior:
   - `npm run governance:capture:veropm`
2. Build deterministic ledger:
   - `npm run governance:ledger:veropm`

## Required Capture Scope

A run is valid only if all checkpoints are captured in one session:

1. `baseline`
2. `creation-entry-opened`
3. `minimum-fields-populated`
4. `submit-invoked`
5. `persistence-verified`
6. `failure-path-observed`

If any checkpoint is missing, the run is non-deterministic.

## Required Evidence Files

- `manifest.json`
- `events.jsonl`
- `network.har`
- `trace.zip`
- `snapshots.json`
- `workflow-ledger.json`
- `ENTITY_CREATION_SEMANTICS.json`
- `STATE_MACHINE_AUDIT.md`
- `determinism-blockers.json`

## Determinism Criteria

All must be true:

1. Exactly one `instantiate` API event is observed.
2. At least one `initialize` event is observed (defaults or initial state assignment).
3. At least one `persist` event is observed.
4. At least one `verify` read-back event is observed after persistence.
5. Every observed error maps to either:
   - recovered path with successful verify, or
   - known terminal state `TERMINAL_BLOCKED_NON_DETERMINISTIC`.

## Terminal States

- `TERMINAL_SUCCESS`: cloning can proceed with deterministic semantics.
- `TERMINAL_BLOCKED_NON_DETERMINISTIC`: cloning must stop; blockers are authoritative.

## Rename Map (remove tribal knowledge)

- Bind to Project -> Workflow Scope
- Template Type -> Workflow Instantiation Mode
- Active -> Execution Enabled
- Set as Default -> Default Template Selector

## Stop Condition

If ledger generation outputs `TERMINAL_BLOCKED_NON_DETERMINISTIC`, do not implement clone behavior. Resolve blockers by collecting additional evidence and rerunning capture.
