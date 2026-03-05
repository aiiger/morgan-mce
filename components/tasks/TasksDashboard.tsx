import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Activity,
  CheckCircle2,
  Plus,
  Calendar,
  Zap,
  ArrowRight,
  LayoutGrid,
  List,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GlassPanel } from '../ui/GlassPanel';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';

interface TasksDashboardProps {
  onNavigateToAll: () => void;
  onNavigateToKanban: () => void;
}

export const TasksDashboard: React.FC<TasksDashboardProps> = ({ onNavigateToAll, onNavigateToKanban }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickTask, setQuickTask] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await (supabase
      .from('tasks' as any) as any)
      .select('*')
      .is('deleted_at', null)
      .is('archived_at', null)
      .order('created_at', { ascending: false });
    if (data) setTasks(data);
    setLoading(false);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTask.trim()) return;
    setAdding(true);
    try {
      const { error } = await (supabase.from('tasks' as any) as any).insert([{
        title: quickTask,
        status: 'pending',
        priority: 'medium'
      }]);
      if (error) throw error;
      setQuickTask('');
      await fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* 1. TOP STATS: TODO TRACKER SIGNATURE COLORS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL TASKS', val: stats.total, icon: CheckSquare, color: 'text-gray-900', bg: 'bg-blue-600', glow: 'shadow-[0_0_20px_rgba(37,99,235,0.4)]' },
          { label: 'PENDING', val: stats.pending, icon: Clock, color: 'text-gray-900', bg: 'bg-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]' },
          { label: 'IN PROGRESS', val: stats.inProgress, icon: Activity, color: 'text-gray-900', bg: 'bg-blue-600', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]' },
          { label: 'COMPLETED', val: stats.completed, icon: CheckCircle2, color: 'text-gray-900', bg: 'bg-emerald-600', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.02] ${s.glow}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-caption font-bold italic text-gray-900/70 tracking-widest">{s.label}</span>
              <s.icon size={24} className="text-gray-400" />
            </div>
            <h3 className="text-5xl font-bold italic text-gray-900 font-mono tracking-tighter">{s.val}</h3>
            {/* Minimalist Data Strip */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-white/50"></div>
              <span className="text-caption font-bold italic text-gray-400 tracking-widest">Active System Node</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-8">

          {/* OVERALL PROGRESS */}
          <GlassPanel className="p-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-emerald-500" />
                <h4 className="text-xs font-bold italic text-gray-900 tracking-widest">Overall Progress</h4>
              </div>
              <span className="text-2xl font-bold italic text-emerald-500 font-mono">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-200">
              <div className="h-full bg-emerald-500 transition-all duration-[2000ms]" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-gov-label text-gray-500 mt-4 font-bold italic">{stats.completed} of {stats.total} tasks completed</p>
          </GlassPanel>

          {/* Quick Add Task */}
          <GlassPanel className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Plus size={16} className="text-blue-500" />
              <h4 className="text-xs font-bold italic text-gray-900 tracking-widest font-sans">Quick Add Task</h4>
            </div>
            <form onSubmit={handleQuickAdd} className="flex gap-4">
              <div className="flex-1">
                <input
                  placeholder="What needs to be done?"
                  value={quickTask}
                  onChange={(e) => setQuickTask(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-sm text-gray-900 focus:border-emerald-500/50 outline-none transition-all"
                />
              </div>
              <GlassButton type="submit" isLoading={adding} disabled={!quickTask.trim()}>
                <Plus size={14} className="mr-2" strokeWidth={3} /> Add
              </GlassButton>
            </form>
          </GlassPanel>

          {/* Recent Tasks */}
          <GlassPanel className="p-0 overflow-hidden">
            <div className="px-8 py-4 border-b border-gray-200 bg-bg-surface flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Clock size={14} className="text-gray-500" />
                <h4 className="text-caption font-bold italic text-gray-500 tracking-widest font-sans">Recent Tasks</h4>
              </div>
              <button onClick={onNavigateToAll} className="bg-gray-50 px-4 py-1.5 rounded-lg text-gov-label font-bold italic text-gray-500 hover:text-gray-900 transition-all tracking-widest border border-gray-200">
                View All
              </button>
            </div>
            <div className="divide-y divide-white/5">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="px-8 py-4 flex items-center justify-between hover:bg-bg-surface transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-emerald-500 transition-all">
                      <CheckSquare size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold italic text-gray-700 group-hover:text-gray-900 transition-colors tracking-tight">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`text-caption font-bold italic px-2 py-0.5 rounded border ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>{task.status}</span>
                        <span className="text-gov-label font-mono font-bold italic text-gray-500">{new Date(task.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-black transition-all"><CheckCircle2 size={14} /></button>
                    <button className="p-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg hover:text-gray-900 transition-all"><List size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* RIGHT COLUMN: Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Upcoming Deadlines */}
          <GlassPanel className="p-8 border-gray-200">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
              <Calendar size={16} className="text-gray-500" />
              <h4 className="text-xs font-bold italic text-gray-900 tracking-widest font-sans">Upcoming Deadlines</h4>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
                <CheckCircle2 size={32} strokeWidth={1} />
              </div>
              <div>
                <p className="text-xs font-bold italic text-gray-500 tracking-widest">No critical locks</p>
                <p className="text-gov-label text-gray-500 font-bold italic tracking-tight mt-1">You're all caught up!</p>
              </div>
            </div>
          </GlassPanel>

          {/* Quick Actions */}
          <GlassPanel className="p-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
              <Zap size={16} className="text-amber-500" />
              <h4 className="text-xs font-bold italic text-gray-900 tracking-widest font-sans">Quick Actions</h4>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Add New Task', icon: Plus, onClick: () => { } },
                { label: 'View All Tasks', icon: List, onClick: onNavigateToAll },
                { label: 'Kanban Board', icon: LayoutGrid, onClick: onNavigateToKanban },
                { label: 'Manage Categories', icon: Zap, onClick: () => { } },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-bg-surface transition-all text-left group"
                >
                  <action.icon size={14} className="group-hover:text-emerald-500 transition-colors" />
                  <span className="text-caption font-bold italic tracking-widest">{action.label}</span>
                </button>
              ))}
            </div>
          </GlassPanel>

        </div>
      </div>
    </div>
  );
};