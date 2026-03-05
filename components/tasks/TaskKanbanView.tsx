import React from 'react';
import { Plus, MoreHorizontal, Search, Filter, GripVertical, Clock, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { GlassPanel } from '../ui/GlassPanel';

interface TaskKanbanViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({ tasks, onTaskClick, onAddTask }) => {
  const statuses: TaskStatus[] = ['pending', 'in_progress', 'completed'];

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'bg-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]', icon: Clock };
      case 'in_progress': return { label: 'In Progress', color: 'bg-blue-600', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]', icon: ActivityIcon };
      case 'completed': return { label: 'Completed', color: 'bg-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]', icon: CheckCircle2 };
      default: return { label: status, color: 'bg-gray-400', glow: '', icon: Clock };
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold italic text-gray-900 tracking-tight flex items-center gap-3">
          <LayoutGridIcon size={20} className="text-emerald-500" />
          Kanban Board
          <span className="ml-2 bg-gray-50 px-3 py-1 rounded-full text-caption text-gray-500 font-mono not-italic">{tasks.length}</span>
        </h2>
        <p className="text-caption text-gray-500 font-bold italic tracking-widest pl-8">Drag and drop tasks to update their status</p>
      </div>

      {/* FILTER BAR - TODO TRACKER STYLE */}
      <GlassPanel className="p-4 flex flex-wrap items-center gap-6 border-gray-200">
         <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 max-w-xs">
               <label className="text-caption font-bold italic text-gray-500 tracking-[0.2em] mb-1.5 block">Priority</label>
               <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-caption text-gray-700 outline-none focus:border-emerald-500/30 font-bold italic tracking-wider">
                  <option>All Priorities</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
               </select>
            </div>
            <div className="flex-1 max-w-xs">
               <label className="text-caption font-bold italic text-gray-500 tracking-[0.2em] mb-1.5 block">Categories</label>
               <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-caption text-gray-700 outline-none focus:border-emerald-500/30 font-bold italic tracking-wider">
                  <option>Select categories...</option>
               </select>
            </div>
            <div className="flex-1">
               <label className="text-caption font-bold italic text-gray-500 tracking-[0.2em] mb-1.5 block">Search</label>
               <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input placeholder="Search tasks..." className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-caption text-gray-900 outline-none focus:border-emerald-500/30 font-bold italic tracking-wider" />
               </div>
            </div>
         </div>
         <button className="px-6 py-2 bg-gray-50 border border-gray-200 rounded-xl text-caption font-bold italic text-gray-500 tracking-widest hover:text-gray-900 transition-all flex items-center gap-2">
            <Filter size={12} /> No Filters
         </button>
      </GlassPanel>

      {/* KANBAN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map(status => {
          const config = getStatusConfig(status);
          const columnTasks = tasks.filter(t => t.status === status);
          
          return (
            <div key={status} className="flex flex-col space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white relative overflow-hidden group`}>
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${config.color} ${config.glow}`}></div>
                <div className="flex items-center gap-3">
                   <h3 className="text-gov-label font-bold italic tracking-[0.3em] text-gray-900">{config.label}</h3>
                   <span className="text-gov-label font-mono text-gray-500">[{columnTasks.length}]</span>
                </div>
                <button 
                  onClick={() => onAddTask(status)}
                  className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-900 transition-all"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 space-y-4 min-h-[600px] bg-bg-surface rounded-2xl border border-dashed border-gray-200 p-4">
                {columnTasks.map(task => (
                  <GlassPanel 
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="p-6 border-gray-200 hover:border-emerald-500/20 transition-all cursor-grab group active:cursor-grabbing"
                  >
                    <div className="flex justify-between items-start mb-4">
                       <h4 className="text-sm font-bold italic text-gray-700 group-hover:text-gray-900 transition-colors tracking-tight leading-snug">{task.title}</h4>
                       <GripVertical size={14} className="text-zinc-800 group-hover:text-gray-500" />
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-4">
                       <span className={`text-caption font-bold italic px-2 py-0.5 rounded border tracking-widest font-mono ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                       </span>
                       {task.categories?.map(cat => (
                         <span key={cat.id} className="text-caption font-bold italic px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-gray-500 font-mono tracking-widest" style={{ color: cat.color }}>
                            {cat.name}
                         </span>
                       ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-gov-label font-mono font-bold italic text-gray-500">
                       <div className="flex items-center gap-2">
                          <Calendar size={10} />
                          {task.due_date || 'No due date'}
                       </div>
                       <button className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500 hover:underline">View</button>
                    </div>
                  </GlassPanel>
                ))}

                {columnTasks.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 grayscale scale-90">
                     <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center mb-4">
                        <Plus size={24} className="text-gray-500" />
                     </div>
                     <p className="text-gov-label font-bold italic tracking-[0.2em] text-gray-500 mb-1">No {config.label} tasks</p>
                     <p className="text-caption font-bold italic text-gray-700">Drop tasks here or</p>
                     <button onClick={() => onAddTask(status)} className="mt-4 text-gov-label font-bold italic text-emerald-500 hover:underline tracking-widest">Add Task</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ActivityIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

const LayoutGridIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
);
