# Sonnet 4.6 Handoff — VeroPM Clone Remaining Work

**From:** Opus 4.6 (session 2026-03-03)
**To:** Sonnet 4.6
**Project:** MCE Command Center / VeroPM Clone Dashboard
**File:** `app/page.tsx` (~2337 lines)
**Build status:** `npx tsc --noEmit` PASS, `npm run build` PASS
**DB status:** All 16 Morgan tables verified on Supabase `fgkqmleltfyuyigmtpqy`

---

## Authority

Read `CLAUDE.md` at workspace root first. All styling must use semantic tokens from `styles/tokens-2026.css`. Import alias `@/*`. Build gate: `npx tsc --noEmit && npm run build` must pass after every change.

---

## Context

- 16 sidebar sections total in the VeroPM clone
- 10 sections are fully API-backed with CRUD (create form, list, delete)
- 2 sections are partially API-backed
- 1 section (Chat) is deferred — leave it alone
- Persistence layer: `lib/morgan/persistence.ts` — Supabase-first with file fallback
- API pattern: `app/api/morgan/[entity]/route.ts` (GET+POST) and `[id]/route.ts` (GET+PATCH+DELETE)
- Tenant resolution: `lib/morgan/tenant-context.ts` → `resolveMorganTenantContext(request)`

---

## TODO LIST (Priority Order)

### P1 — Hardcoded Data That Should Be Live

- [ ] **1. AutomationView: Wire execution history to API**
  - Location: `app/page.tsx`, AutomationView component (~lines 927-933)
  - Problem: `executionHistory` is a hardcoded 5-item inline array
  - Fix: Add `useState` + `useCallback` + `useEffect` fetching from `GET /api/morgan/automations/[id]/history` or create a dedicated route `GET /api/morgan/automation/history` that returns all history
  - API already exists at `app/api/morgan/automations/[id]/history/route.ts`

- [ ] **2. AutomationView: Wire automation templates to API or remove**
  - Location: `app/page.tsx`, AutomationView (~lines 936-943)
  - Problem: `templates` is a hardcoded 6-item inline array (automation template suggestions)
  - Fix option A: Create `morgan_automation_templates` table + CRUD (full approach)
  - Fix option B: Keep hardcoded as "built-in suggestions" — acceptable since these are system templates, not user data
  - Recommendation: Option B is fine — these are UI suggestions, not persisted user data

- [ ] **3. Remove `defaultAutomations` fallback in main component**
  - Location: `app/page.tsx` (~line 2280)
  - Problem: `automationRules` state initializes from `defaultAutomations` import from `lib/imperial/automation`
  - Fix: Initialize as empty array `[]`, fetch from API on mount like other sections do
  - Note: The AutomationView already fetches from `/api/morgan/automation` — the parent shouldn't also seed data

### P2 — Non-Functional Buttons

- [ ] **4. MilestonesView: Wire Approve/Reject buttons**
  - Location: `app/page.tsx`, MilestonesView (~lines 2175-2177)
  - Problem: Approve/Reject buttons on pending milestones have no `onClick`
  - Fix: Add `onClick` that calls `PATCH /api/morgan/milestones/${id}` with `{ status: 'Approved' }` or `{ status: 'Rejected' }`

- [ ] **5. TendersKanbanView: Add delete button on tender cards**
  - Location: `app/page.tsx`, TendersKanbanView (~lines 454-540)
  - Problem: No delete action on tender cards
  - Fix: Add a hover-reveal Trash2 button calling `DELETE /api/morgan/tenders/${id}`, then refresh

- [ ] **6. AutomationView: Add delete button on automation rule cards**
  - Location: `app/page.tsx`, AutomationView
  - Problem: Rule cards in the rules tab have no delete action
  - Fix: Add hover-reveal Trash2 button calling `DELETE /api/morgan/automation/${id}`, then refresh

- [ ] **7. DocumentsView: Wire download button**
  - Location: `app/page.tsx`, DocumentsView (~line 1647)
  - Problem: Download button has no `onClick`
  - Fix: Since there's no real file storage, either remove the button or add a placeholder toast/alert

### P3 — Hardcoded KPI Values

- [ ] **8. DashboardView: Make "Team Members" KPI dynamic**
  - Location: ~line 327, `value="24"`, `trend="+2 new"`
  - Fix: Derive from actual team data or leave as static if no team entity exists yet

- [ ] **9. DashboardView: Make "Health Score" KPI dynamic**
  - Location: ~line 404, `value="87%"`, `trend="+5% improvement"`
  - Fix: Compute from portfolio health data or project status ratios

- [ ] **10. AutomationView: Make "Time Saved" KPI dynamic**
  - Location: ~line 976, `value="1.5h"`, `trend="This week"`
  - Fix: Derive from execution history if wired (see todo #1)

- [ ] **11. DocumentsView: Make "Total Size" KPI dynamic**
  - Location: ~line 1604, `value="20.8 MB"`
  - Fix: Compute from document metadata if available, or remove

- [ ] **12. PortfoliosView: Make health bar dynamic**
  - Location: ~line 432, `style={{ width: '85%' }}`
  - Fix: Compute from project statuses within that portfolio

### P4 — Polish / Low Priority

- [ ] **13. ProjectDetail panel: Wire team members + activity**
  - Location: ~lines 238, 247-250
  - Problem: Hardcoded `['Ahmad F.', 'Sarah K.', 'Omar H.']` and activity array
  - Fix: Fetch from API or derive from task assignees for that project

- [ ] **14. Header "Create" button: Map to section-specific forms**
  - Problem: Top-right "Create" button opens project/tender form regardless of active section
  - Fix: Switch on `activeSection` to open appropriate create form

- [ ] **15. DocumentsView: Wire file upload drop zone**
  - Location: ~lines 1574-1577
  - Problem: Drag-and-drop area is purely visual
  - Fix: Add `<input type="file">` with Supabase Storage upload, or add a toast explaining "file upload coming soon"

- [ ] **16. RisksView: Add status toggle on risk items**
  - Problem: Risk status is displayed but can't be changed inline
  - Fix: Add a dropdown or button cycling through Open → Mitigating → Monitoring → Closed via `PATCH /api/morgan/risks/${id}`

---

## DO NOT TOUCH

- **Chat section** — explicitly deferred by user
- **Supabase credentials** — already verified and correct (`fgkqmleltfyuyigmtpqy`)
- **SQL migrations** — all 16 tables confirmed present
- **Existing working CRUD** — don't refactor what's already passing

---

## Build Gate

After every change:
```bash
npx tsc --noEmit   # must pass
npm run build       # must pass
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main dashboard — all 16 section views |
| `lib/morgan/persistence.ts` | All CRUD functions + interfaces |
| `lib/morgan/tenant-context.ts` | Auth/tenant resolution |
| `app/api/morgan/[entity]/route.ts` | Collection routes (GET list + POST create) |
| `app/api/morgan/[entity]/[id]/route.ts` | Resource routes (GET + PATCH + DELETE) |
| `styles/tokens-2026.css` | Design token source of truth |
| `CLAUDE.md` | Authority doc — read first |

---

## Pattern to Follow

Every API-backed view follows this pattern (copy from TasksView or TemplatesView):

```tsx
const SomeView = () => {
  const [items, setItems] = useState<Array<{...}>>([])
  const [showForm, setShowForm] = useState(false)
  // form field states...

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch('/api/morgan/some-entity')
      if (res.ok) { const data = await res.json(); setItems(data.items || []) }
    } catch { /* no-op */ }
  }, [])
  useEffect(() => { loadItems() }, [loadItems])

  const handleCreate = async () => {
    await fetch('/api/morgan/some-entity', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ ...fields })
    })
    resetForm(); setShowForm(false); await loadItems()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/morgan/some-entity/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return ( /* JSX with SectionHeader, AnimatePresence form, list/grid */ )
}
```

Good luck, Sonnet. The foundation is solid — you're doing polish work now.
