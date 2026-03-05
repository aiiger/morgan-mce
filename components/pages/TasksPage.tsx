import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, Plus, Search, LayoutGrid, List as ListIcon, Tag, Zap, Trash2, Archive, Activity, Database, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Task, Category } from '../../types';
import { CategoryModal } from '../tasks/CategoryModal';
import { TaskModal } from '../tasks/TaskModal';
import { TasksDashboard } from '../tasks/TasksDashboard';
import { TaskKanbanView } from '../tasks/TaskKanbanView';
import { TaskListView } from '../tasks/TaskListView';
import { TaskCategoriesView } from '../tasks/TaskCategoriesView';
import { CalendarPage } from './CalendarPage';
import { usePreferences } from '../../hooks/usePreferences';

type TasksPageProps = {
  projects?: any[];
  onSelectProject?: (id: string) => void;
  initialView?: 'list' | 'kanban' | 'dashboard' | 'categories' | 'calendar';
};

import { PageHeader } from '../ui/PageHeader';
import { GlassButton } from '../ui/GlassButton';

export const TasksPage: React.FC<TasksPageProps> = ({ projects = [], onSelectProject, initialView }) => {
  const { preferences } = usePreferences();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [view, setView] = useState<'list' | 'kanban' | 'dashboard' | 'categories' | 'calendar'>(initialView ?? 'dashboard');
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'all' | 'archived' | 'trash'>('all');
  const [showCatModal, setShowCatModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  useEffect(() => {
    if (initialView) {
      setView(initialView);
      return;
    }

    if (preferences?.default_view && ['kanban', 'list', 'dashboard', 'calendar', 'categories'].includes(preferences.default_view)) {
      setView(preferences.default_view as any);
    }
  }, [preferences, initialView]);

  useEffect(() => {
    fetchData();
  }, [currentTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: tasksData } = await supabase.from('tasks').select('*, task_categories(categories(*))').order('created_at', { ascending: false });
      const { data: catsData } = await supabase.from('categories').select('*').order('created_at', { ascending: false });

      if (tasksData) {
        setTasks((tasksData as any[]).map(task => ({
          ...task,
          categories: task.task_categories?.map((tc: any) => tc.categories).filter(Boolean) || []
        })));
      }
      if (catsData) setCategories(catsData);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD_HUD', icon: Activity },
    { id: 'list', label: 'TASK_MATRIX', icon: ListIcon },
    { id: 'kanban', label: 'KANBAN_BOARD', icon: LayoutGrid },
    { id: 'calendar', label: 'CALENDAR', icon: Calendar },
    { id: 'categories', label: 'NODE_LABELS', icon: Tag },
  ];

  return (
    <div className="flex h-screen overflow-hidden -mx-8 -mt-2 bg-gray-50 animate-fade-in relative">
      {/* Overlay Header when in specialized views */}



      {/* INTERNAL TODOTRACKER SIDEBAR */}
      <aside className="w-56 border-r border-gray-200 bg-white flex flex-col p-8 shadow-sm">
        <div className="mb-12 px-2">
          <h2 className="text-2xl font-bold italic text-gray-900 tracking-tighter flex items-center gap-3">
            <CheckSquare className="text-emerald-500" size={24} /> Matrix
          </h2>
          <p className="text-caption font-mono font-bold italic text-gray-400 tracking-[0.5em] mt-2">Core_Protocol_v2.0</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all group ${view === item.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={16} strokeWidth={view === item.id ? 3 : 2} />
                <span className="text-caption font-bold italic tracking-widest">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

          <div className="pt-8 border-t border-gray-200 space-y-2">
          <button onClick={() => setCurrentTab('archived')} className="w-full flex items-center gap-4 px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors">
            <Archive size={14} />
            <span className="text-gov-label font-bold italic tracking-widest">Archive_Vault</span>
          </button>
          <button onClick={() => setCurrentTab('trash')} className="w-full flex items-center gap-4 px-6 py-3 text-gray-500 hover:text-rose-500 transition-colors">
            <Trash2 size={14} />
            <span className="text-gov-label font-bold italic tracking-widest">Deleted_Nodes</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-12 relative">
        <PageHeader
          title="TASK_MATRIX"
          subtitle="Sector 04 // Project nodes"
          actions={
            <GlassButton
              onClick={() => {
                setEditingTask(undefined);
                setShowTaskModal(true);
              }}
              className="px-6 py-2 rounded-xl text-caption font-bold italic tracking-widest shadow-glow-emerald"
            >
              Initialize Node
            </GlassButton>
          }
          className="mb-8"
        />
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
              <Zap className="animate-pulse text-emerald-500" size={48} />
              <p className="text-caption font-bold italic tracking-[0.4em] text-gray-700 font-mono">Syncing_Clusters...</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700">
              {view === 'dashboard' && <TasksDashboard onNavigateToAll={() => setView('list')} onNavigateToKanban={() => setView('kanban')} />}
              {view === 'kanban' && <TaskKanbanView tasks={tasks} onTaskClick={(t) => { setEditingTask(t); setShowTaskModal(true); }} onAddTask={(s) => { setEditingTask({ status: s } as any); setShowTaskModal(true); }} />}
              {view === 'list' && <TaskListView tasks={tasks} onTaskClick={(t) => { setEditingTask(t); setShowTaskModal(true); }} onAddTask={() => { setEditingTask(undefined); setShowTaskModal(true); }} selectedIds={[]} onToggleSelect={() => { }} />}
              {view === 'categories' && <TaskCategoriesView categories={categories} tasks={tasks} onAddCategory={() => { setEditingCategory(undefined); setShowCatModal(true); }} onEditCategory={(c) => { setEditingCategory(c); setShowCatModal(true); }} onDeleteCategory={() => { }} />}
              {view === 'calendar' && (
                <CalendarPage
                  tasks={tasks as any}
                  projects={projects}
                  onSelectProject={onSelectProject}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {showCatModal && <CategoryModal onClose={() => setShowCatModal(false)} categories={categories} onUpdate={fetchData} category={editingCategory} />}
      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} onUpdate={fetchData} categories={categories} task={editingTask} />}
    </div>
  );
};

