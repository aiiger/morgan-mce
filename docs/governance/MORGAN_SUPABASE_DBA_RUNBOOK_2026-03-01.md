# Morgan Supabase DBA Runbook (Production)

Date: 2026-03-01
Scope: Multi-tenant Morgan persistence cutover (Vercel + Supabase)

## 1) Apply migration

Run SQL from:
- `supabase/migrations/20260301_morgan_multitenant_persistence.sql`

This migration now includes:
- Core Morgan tables
- Tenant indexes
- Composite tenant/time indexes for list workloads
- `updated_at` trigger function and per-table triggers
- RLS enabled (no permissive policies)

## 2) Verify schema objects

```sql
select schemaname, tablename
from pg_catalog.pg_tables
where schemaname = 'public'
  and tablename like 'morgan_%'
order by tablename;
```

```sql
select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and tablename like 'morgan_%'
order by tablename, indexname;
```

```sql
select tgname as trigger_name, c.relname as table_name
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('morgan_projects','morgan_tenders','morgan_workflows','morgan_automations')
  and not t.tgisinternal
order by c.relname, t.tgname;
```

## 3) Run application cutover

```bash
npm run morgan:cutover
```

This executes:
1. `npm run morgan:check-schema`
2. `npm run morgan:migrate:file-to-supabase`
3. `npm run morgan:verify`

## 4) Post-cutover validation

```sql
select
  (select count(*) from morgan_projects) as projects,
  (select count(*) from morgan_tenders) as tenders,
  (select count(*) from morgan_workflows) as workflows,
  (select count(*) from morgan_automations) as automations,
  (select count(*) from morgan_automation_execution_history) as history;
```

```sql
select user_id, workspace_id, count(*)
from morgan_projects
group by user_id, workspace_id
order by count(*) desc
limit 20;
```

## 5) Rollout notes

- Service role key is required for migration script.
- API layer enforces tenant scoping (`user_id`, `workspace_id`).
- Keep direct client writes disabled; route all writes through server APIs.
- Re-run migration safely; SQL objects are idempotent and data migration uses upsert-by-id.
