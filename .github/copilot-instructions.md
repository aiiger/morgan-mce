# MCE Command Center 2026 — Copilot Workspace Instructions

**Project:** Nexus Construct ERP / MCE Command Center
**Authority:** `CLAUDE.md` at workspace root (read it first)
**Stack:** Next.js 16.1.6 (Turbopack) · TypeScript 5.8.2 · Supabase · Clerk · Tailwind

## Quick Commands

```bash
npm install              # Install deps
npm run dev              # Dev server (localhost:3000)
npm run dev:fresh        # Clean start (kill ports, clear .next)
npm run build            # Production build
npx tsc --noEmit         # Type check (must pass before committing)
npm run morgan:cutover   # Full Morgan persistence pipeline
```

## Architecture

- `app/` — Next.js App Router pages and API routes
- `components/` — UI + business components (dashboard, forms, pages, ui)
- `hooks/` — Custom React hooks (`useDashboardData`, `useUserTier`, domain hooks)
- `lib/` — Service clients (Supabase, Clerk, AI, Morgan persistence)
- `styles/` — CSS variables and design tokens (`tokens-2026.css` is source of truth)
- `scripts/` — CLI utilities (Morgan migration, governance capture, health checks)

## Critical Rules

1. **ALL styling must use semantic tokens** from `styles/tokens-2026.css` via Tailwind. No hardcoded hex.
2. **Import alias:** `@/*` maps to project root (see `tsconfig.json`)
3. **Supabase client:** Use `lib/supabase/client.ts` (browser) or `lib/supabase/admin.ts` (server/service role)
4. **Morgan persistence:** `lib/morgan/persistence.ts` — Supabase-first with file-store fallback
5. **Auth:** Clerk integration. Tiers: L1 (viewer) → L4 (super_admin). Check `hooks/useUserTier.ts`
6. **API pattern:** `app/api/morgan/[entity]/route.ts` — Full CRUD for projects, tenders, workflows, automations
7. **Real-time:** `useDashboardData` hook composes domain hooks with Supabase real-time subscriptions
8. **Build gate:** `npx tsc --noEmit && npm run build` must both pass after any change

## Token System (Tailwind Classes)

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| Background | `bg-bg-base`, `bg-bg-surface`, `bg-bg-hover` | Surface hierarchy |
| Text | `text-text-primary`, `text-text-secondary`, `text-text-tertiary` | Type hierarchy |
| Border | `border-border-base` | Standard borders |
| Status | `text-critical`, `text-warning`, `text-success` | Semantic states |
| Glass | `bg-glass`, utility in `index.css` | Glassmorphism panels |

## Font Scale (Governance)

| Class | Size | Use |
|-------|------|-----|
| `text-gov-hero` | 32px/700 | Hero titles |
| `text-gov-title` | 18px/600 | Section titles |
| `text-gov-header` | 14px/600 | Card headers |
| `text-gov-body` | 13px/400 | Body text |
| `text-gov-label` | 11px/500 | Labels |
| `text-gov-metric` | 13px/600 | KPI values |
| `text-caption` | 10px/500 | Captions |

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Primary authority doc |
| `styles/tokens-2026.css` | Design token source of truth |
| `styles/design-tokens.css` | Extended token definitions |
| `tailwind.config.ts` | Tailwind theme extensions |
| `middleware.ts` | Auth route matching (currently no-op) |
| `lib/morgan/persistence.ts` | Morgan CRUD (935 lines, Supabase-first) |
| `hooks/useDashboardData.ts` | Dashboard data orchestrator |
| `components/dashboard/MorganCommandCenter.tsx` | Main dashboard shell |

## Supabase

- **URL:** Set in `NEXT_PUBLIC_SUPABASE_URL` (.env.local)
- **Morgan tables:** `morgan_projects`, `morgan_tenders`, `morgan_workflows`, `morgan_automations`, `morgan_automation_execution_history`
- **RLS:** Enabled on all Morgan tables; server uses service role key to bypass
- **Multi-tenant:** All queries scoped by `user_id` + `workspace_id`
