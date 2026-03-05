# VeroPM Deterministic Clone Protocol

## Objective
Produce auditable artifacts that preserve workflow behavior, rule semantics, defaults, and failure handling.

## Required Output Artifacts
Each run in `artifacts/veropm-governance/run-<timestamp>` must include:
- `trace.zip`
- `network.har`
- `events.jsonl`
- `snapshots.json`
- `workflow-ledger.json`
- `STATE_MACHINE_AUDIT.md`
- `determinism-blockers.json`
- `TRIBAL_KNOWLEDGE_MAP.json`

## Execution Steps
1. Run capture:
   - `npm run governance:capture:veropm`
2. In the opened browser session:
   - Authenticate.
   - Open the exact workflow editor instance to clone.
   - Enter checkpoint labels at each critical action.
   - Include at least one validation failure path and one successful save path.
   - Type `DONE` in terminal when complete.
3. Build deterministic ledger:
   - `npm run governance:ledger:veropm`

## Acceptance Gate
Deterministic clone is approved only if:
- `workflow-ledger.json` has `determinismAchieved: true`.
- No blockers exist in `determinism-blockers.json`.
- `STATE_MACHINE_AUDIT.md` contains explicit states, transitions, failures, recoveries, and assumptions.

## Hard Stop Rules
Stop and mark as blocked if any of these are true:
- No save API response is captured.
- Any transition lacks explicit source and target.
- Initial or final status cannot be proven from evidence.
- Failure states are observed without a recovery transition to known terminal state.

## Notes
This protocol is intentionally strict and fails closed. Missing evidence is treated as non-deterministic behavior and must not be guessed.
