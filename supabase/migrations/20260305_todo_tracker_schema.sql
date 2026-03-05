-- TodoTracker standalone app schema
-- Run in Supabase SQL editor

-- Enable UUID extension (may already exist)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ──────────────────────────────────────────────────────────────────
-- Synced from Clerk via webhook

CREATE TABLE IF NOT EXISTS public.todo_users (
  id TEXT PRIMARY KEY,                -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  about TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',
  profile_picture_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USER PREFERENCES ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.todo_user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES public.todo_users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  default_view TEXT DEFAULT 'dashboard',
  default_sort TEXT DEFAULT 'due_date',
  tasks_per_page INTEGER DEFAULT 20,
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h',
  email_notifications BOOLEAN DEFAULT TRUE,
  daily_digest BOOLEAN DEFAULT FALSE,
  digest_time TIME DEFAULT '09:00',
  due_date_reminders BOOLEAN DEFAULT TRUE,
  reminder_before TEXT DEFAULT '24h',
  auto_archive_completed BOOLEAN DEFAULT FALSE,
  archive_after_days INTEGER DEFAULT 14,
  default_task_priority TEXT DEFAULT 'medium',
  default_task_status TEXT DEFAULT 'pending',
  week_starts_on TEXT DEFAULT 'monday',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CATEGORIES ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.todo_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.todo_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#22d3ee',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- ─── TASKS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.todo_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.todo_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ            -- Soft delete (trash)
);

-- ─── TASK-CATEGORY JUNCTION ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.todo_task_categories (
  task_id UUID REFERENCES public.todo_tasks(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.todo_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, category_id)
);

-- ─── ACTIVITY LOGS ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.todo_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.todo_users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,           -- 'login', 'task_created', 'task_updated', etc.
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_todo_tasks_user_id   ON public.todo_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_status    ON public.todo_tasks(status);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_due_date  ON public.todo_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_deleted   ON public.todo_tasks(deleted_at);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_archived  ON public.todo_tasks(archived_at);
CREATE INDEX IF NOT EXISTS idx_todo_cats_user_id    ON public.todo_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_logs_user_id    ON public.todo_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_logs_created    ON public.todo_activity_logs(created_at);

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE public.todo_users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_user_preferences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_task_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_activity_logs     ENABLE ROW LEVEL SECURITY;

-- API routes use the service role key → bypasses RLS.
-- These policies cover direct Supabase JS client access from the browser if ever needed.

CREATE POLICY "todo_users_own"        ON public.todo_users            FOR ALL USING (auth.uid()::TEXT = id);
CREATE POLICY "todo_prefs_own"        ON public.todo_user_preferences FOR ALL USING (auth.uid()::TEXT = user_id);
CREATE POLICY "todo_tasks_own"        ON public.todo_tasks            FOR ALL USING (auth.uid()::TEXT = user_id);
CREATE POLICY "todo_cats_own"         ON public.todo_categories       FOR ALL USING (auth.uid()::TEXT = user_id);
CREATE POLICY "todo_activity_read"    ON public.todo_activity_logs    FOR SELECT USING (auth.uid()::TEXT = user_id);

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_todo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_todo_users_updated
  BEFORE UPDATE ON public.todo_users
  FOR EACH ROW EXECUTE FUNCTION update_todo_updated_at();

CREATE TRIGGER trg_todo_prefs_updated
  BEFORE UPDATE ON public.todo_user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_todo_updated_at();

CREATE TRIGGER trg_todo_tasks_updated
  BEFORE UPDATE ON public.todo_tasks
  FOR EACH ROW EXECUTE FUNCTION update_todo_updated_at();

CREATE TRIGGER trg_todo_cats_updated
  BEFORE UPDATE ON public.todo_categories
  FOR EACH ROW EXECUTE FUNCTION update_todo_updated_at();
