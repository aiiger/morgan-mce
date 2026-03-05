'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { User, Shield, Settings2, Activity, Save, ChevronDown, X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────
interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  about: string | null;
  location: string | null;
  timezone: string | null;
  profile_picture_url: string | null;
  email_verified: boolean;
  created_at: string;
}

interface Preferences {
  theme: string;
  default_view: string;
  default_sort: string;
  tasks_per_page: number;
  date_format: string;
  time_format: string;
  email_notifications: boolean;
  daily_digest: boolean;
  due_date_reminders: boolean;
  auto_archive_completed: boolean;
  archive_after_days: number;
  default_task_priority: string;
  default_task_status: string;
  week_starts_on: string;
}

interface ActivityLog {
  id: string;
  action_type: string;
  description: string | null;
  ip_address: string | null;
  created_at: string;
}

type Tab = 'personal' | 'security' | 'preferences' | 'activity';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo',
  'Asia/Singapore', 'Australia/Sydney',
];

const ACTIVITY_ICONS: Record<string, string> = {
  login: '🔐',
  task_created: '✅',
  task_updated: '✏️',
  task_deleted: '🗑️',
  category_created: '🏷️',
  password_changed: '🔒',
  security_update: '🛡️',
};

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  const [tab, setTab] = useState<Tab>('personal');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [activityFilter, setActivityFilter] = useState('all');
  const [activityTotal, setActivityTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Personal form
  const [pForm, setPForm] = useState({
    first_name: '', last_name: '', phone: '',
    about: '', location: '', timezone: 'UTC',
  });

  // Preferences form — initialised from API
  const [prefForm, setPrefForm] = useState<Preferences>({
    theme: 'dark', default_view: 'dashboard', default_sort: 'due_date',
    tasks_per_page: 20, date_format: 'MM/DD/YYYY', time_format: '12h',
    email_notifications: true, daily_digest: false, due_date_reminders: true,
    auto_archive_completed: false, archive_after_days: 14,
    default_task_priority: 'medium', default_task_status: 'pending', week_starts_on: 'monday',
  });

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profRes, prefRes] = await Promise.all([
        fetch(`/api/user/profile?userId=${user.id}`),
        fetch(`/api/user/preferences?userId=${user.id}`),
      ]);
      const profJson = await profRes.json() as { profile: Profile | null };
      const prefJson = await prefRes.json() as { preferences: Preferences };

      if (profJson.profile) {
        setProfile(profJson.profile);
        setPForm({
          first_name: profJson.profile.first_name ?? '',
          last_name: profJson.profile.last_name ?? '',
          phone: profJson.profile.phone ?? '',
          about: profJson.profile.about ?? '',
          location: profJson.profile.location ?? '',
          timezone: profJson.profile.timezone ?? 'UTC',
        });
      }
      if (prefJson.preferences) {
        setPrefs(prefJson.preferences);
        setPrefForm(prefJson.preferences);
      }
    } catch {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchActivity = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user/activity?userId=${user.id}&filter=${activityFilter}`);
      const json = await res.json() as { activity: ActivityLog[]; total: number };
      setActivity(json.activity ?? []);
      setActivityTotal(json.total ?? 0);
    } catch {
      setError('Failed to load activity');
    }
  }, [user, activityFilter]);

  useEffect(() => {
    if (isLoaded && user) void fetchAll();
  }, [isLoaded, user, fetchAll]);

  useEffect(() => {
    if (isLoaded && user && tab === 'activity') void fetchActivity();
  }, [isLoaded, user, tab, fetchActivity]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...pForm }),
      });
      if (!res.ok) throw new Error('Failed to save');
      flash('Profile saved successfully');
      await fetchAll();
    } catch {
      setError('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingPrefs(true);
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...prefForm }),
      });
      if (!res.ok) throw new Error('Failed to save');
      flash('Preferences saved successfully');
    } catch {
      setError('Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials =
    ([pForm.first_name, pForm.last_name].filter(Boolean).map((s) => s[0]).join('')) ||
    (user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ?? '?');

  const TABS: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'personal',     label: 'Personal Info',   icon: User      },
    { id: 'security',     label: 'Security',         icon: Shield    },
    { id: 'preferences',  label: 'Preferences',      icon: Settings2 },
    { id: 'activity',     label: 'Activity Log',     icon: Activity  },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Manage your account settings and preferences</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <span className="text-emerald-400 text-sm">{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-600 hover:text-emerald-400"><X size={14} /></button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <span className="text-red-400 text-sm">Error: {error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-400"><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* ── Left sidebar ──────────────────────────────── */}
        <div className="col-span-12 md:col-span-4 space-y-4">
          {/* Profile card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500/40 flex items-center justify-center mx-auto mb-3">
              {profile?.profile_picture_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profile_picture_url} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-cyan-400">{initials}</span>
              )}
            </div>
            <h3 className="text-white font-semibold">
              {[pForm.first_name, pForm.last_name].filter(Boolean).join(' ') || 'Your Name'}
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
            {profile?.email_verified && (
              <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">
                ✓ Verified
              </span>
            )}
            {profile?.created_at && (
              <p className="text-xs text-zinc-600 mt-3">
                Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Tab nav */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-zinc-800 last:border-0 ${
                  tab === id
                    ? 'bg-cyan-400/10 text-cyan-400 font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main content ──────────────────────────────── */}
        <div className="col-span-12 md:col-span-8">

          {/* Personal Info */}
          {tab === 'personal' && (
            <form onSubmit={(e) => void handleSaveProfile(e)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h2 className="text-white font-semibold">Personal Information</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" value={pForm.first_name} onChange={(v) => setPForm({ ...pForm, first_name: v })} placeholder="First" />
                <Field label="Last Name"  value={pForm.last_name}  onChange={(v) => setPForm({ ...pForm, last_name: v })}  placeholder="Last"  />
              </div>
              <Field label="Phone" value={pForm.phone} onChange={(v) => setPForm({ ...pForm, phone: v })} placeholder="+1 555 000 0000" />
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">About</label>
                <textarea
                  rows={3}
                  value={pForm.about}
                  onChange={(e) => setPForm({ ...pForm, about: e.target.value })}
                  placeholder="Tell us a bit about yourself…"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
              <Field label="Location" value={pForm.location} onChange={(v) => setPForm({ ...pForm, location: v })} placeholder="City, Country" />
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Timezone</label>
                <div className="relative">
                  <select
                    value={pForm.timezone}
                    onChange={(e) => setPForm({ ...pForm, timezone: e.target.value })}
                    className="w-full appearance-none bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-colors"
              >
                <Save size={14} />
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Security (read-only / Clerk-managed) */}
          {tab === 'security' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h2 className="text-white font-semibold">Account Security</h2>
              <div className="space-y-3">
                <InfoRow label="Email" value={user?.primaryEmailAddress?.emailAddress ?? '—'} />
                <InfoRow label="Email Verified" value={profile?.email_verified ? 'Yes ✓' : 'Not verified'} />
                <InfoRow
                  label="Last Sign-In"
                  value={user?.lastSignInAt
                    ? new Date(user.lastSignInAt).toLocaleString()
                    : '—'}
                />
              </div>
              <div className="border-t border-zinc-800 pt-4">
                <p className="text-xs text-zinc-500">
                  Password changes and two-factor authentication are managed via Clerk.
                  Use the account button in the sidebar to access those settings.
                </p>
              </div>
              <div className="border-t border-zinc-800 pt-4">
                <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
                <p className="text-xs text-zinc-500 mb-3">
                  Deleting your account will permanently remove all your tasks, categories, and data.
                  This action cannot be undone.
                </p>
                <button
                  disabled
                  className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg opacity-50 cursor-not-allowed"
                >
                  Delete Account (contact support)
                </button>
              </div>
            </div>
          )}

          {/* Preferences */}
          {tab === 'preferences' && (
            <form onSubmit={(e) => void handleSavePrefs(e)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
              <h2 className="text-white font-semibold">Preferences</h2>

              {/* Display */}
              <Section title="Display">
                <ToggleRow
                  label="Theme"
                  description="Dark or light mode"
                  value={prefForm.theme === 'dark'}
                  onToggle={(v) => setPrefForm({ ...prefForm, theme: v ? 'dark' : 'light' })}
                  trueLabel="Dark"
                  falseLabel="Light"
                />
                <SelectRow
                  label="Default Sort"
                  value={prefForm.default_sort}
                  onChange={(v) => setPrefForm({ ...prefForm, default_sort: v })}
                  options={[
                    { value: 'due_date', label: 'Due Date' },
                    { value: 'priority', label: 'Priority' },
                    { value: 'created_at', label: 'Created Date' },
                    { value: 'title', label: 'Title' },
                  ]}
                />
                <SelectRow
                  label="Tasks Per Page"
                  value={String(prefForm.tasks_per_page)}
                  onChange={(v) => setPrefForm({ ...prefForm, tasks_per_page: parseInt(v, 10) })}
                  options={[10, 20, 50, 100].map((n) => ({ value: String(n), label: String(n) }))}
                />
              </Section>

              {/* Notifications */}
              <Section title="Notifications">
                <ToggleRow label="Email Notifications" value={prefForm.email_notifications} onToggle={(v) => setPrefForm({ ...prefForm, email_notifications: v })} />
                <ToggleRow label="Daily Digest" value={prefForm.daily_digest} onToggle={(v) => setPrefForm({ ...prefForm, daily_digest: v })} />
                <ToggleRow label="Due Date Reminders" value={prefForm.due_date_reminders} onToggle={(v) => setPrefForm({ ...prefForm, due_date_reminders: v })} />
              </Section>

              {/* Task defaults */}
              <Section title="Task Defaults">
                <SelectRow
                  label="Default Priority"
                  value={prefForm.default_task_priority}
                  onChange={(v) => setPrefForm({ ...prefForm, default_task_priority: v })}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                />
                <ToggleRow
                  label="Auto-Archive Completed"
                  description="Automatically archive completed tasks"
                  value={prefForm.auto_archive_completed}
                  onToggle={(v) => setPrefForm({ ...prefForm, auto_archive_completed: v })}
                />
                {prefForm.auto_archive_completed && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-zinc-300">Archive After (days)</span>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={prefForm.archive_after_days}
                      onChange={(e) => setPrefForm({ ...prefForm, archive_after_days: parseInt(e.target.value, 10) })}
                      className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white text-right focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </Section>

              <button
                type="submit"
                disabled={savingPrefs}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-colors"
              >
                <Save size={14} />
                {savingPrefs ? 'Saving…' : 'Save Preferences'}
              </button>
            </form>
          )}

          {/* Activity Log */}
          {tab === 'activity' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold">Activity Log</h2>
                <span className="text-xs text-zinc-500">{activityTotal} events</span>
              </div>

              {/* Filter buttons */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'logins', 'changes', 'security'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActivityFilter(f)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors capitalize ${
                      activityFilter === f
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {activity.length === 0 ? (
                <p className="text-zinc-500 text-sm py-4">No activity recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {activity.map((log) => (
                    <li key={log.id} className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0">
                      <span className="text-lg shrink-0 mt-0.5">{ACTIVITY_ICONS[log.action_type] ?? '📋'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white capitalize">{log.action_type.replace(/_/g, ' ')}</p>
                        {log.description && <p className="text-xs text-zinc-400 truncate">{log.description}</p>}
                        {log.ip_address && <p className="text-xs text-zinc-600">IP: {log.ip_address}</p>}
                      </div>
                      <span className="text-xs text-zinc-500 shrink-0">
                        {new Date(log.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="bg-zinc-800/50 rounded-xl divide-y divide-zinc-800 px-3">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, description, value, onToggle, trueLabel, falseLabel }: {
  label: string; description?: string;
  value: boolean; onToggle: (v: boolean) => void;
  trueLabel?: string; falseLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm text-zinc-200">{label}</p>
        {description && <p className="text-xs text-zinc-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onToggle(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-cyan-500' : 'bg-zinc-700'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
        <span className="sr-only">{value ? (trueLabel ?? 'On') : (falseLabel ?? 'Off')}</span>
      </button>
    </div>
  );
}

function SelectRow({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-zinc-200">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-zinc-700 border border-zinc-600 rounded-lg pl-3 pr-7 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      </div>
    </div>
  );
}
