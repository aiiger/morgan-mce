import React from 'react';
import { Search, Filter, List as ListIcon, LayoutGrid, CheckSquare, Edit2, Trash2, Archive, Calendar, Database, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Task, TaskPriority } from '../../types';
import { GlassPanel } from '../ui/GlassPanel';

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks, onTaskClick, onAddTask, selectedIds, onToggleSelect }) => {
  
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
        <h2 className="text-2xl font-bold italic text-[var(--text-primary)] tracking-tighter flex items-center gap-3 font-oswald uppercase">
          <ListIcon size={24} className="text-[var(--brand-accent)]" />
          Task_Registry
          <span className="ml-2 bg-[var(--brand-accent)]/10 px-3 py-1 rounded-full text-caption text-[var(--brand-accent)] font-mono not-italic border border-[var(--brand-accent)]/20 shadow-sm">{tasks.length}</span>
        </h2>
        <p className="text-caption text-[var(--text-tertiary)] font-bold italic tracking-[0.2em] pl-9 uppercase opacity-60">Maturation Cycle // Operational Nodes</p>
      </div>

      {/* TOOLBAR - EXECUTIVE STYLE */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-2 bg-[var(--bg-layer)]/40 rounded-2xl border border-[var(--surface-border)] backdrop-blur-md">
         <div className="flex items-center bg-[var(--bg-base)] border border-[var(--surface-border)] p-1 rounded-xl shadow-inner ml-2">
            <button className="flex items-center px-6 py-2 bg-[var(--brand-accent)] text-gray-900 rounded-lg text-caption font-bold tracking-widest shadow-lg shadow-[var(--brand-accent)]/20 transition-all font-oswald">
               <ListIcon size={14} className="mr-2.5" /> List
            </button>
            <button className="flex items-center px-6 py-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg text-caption font-bold tracking-widest transition-all font-oswald">
               <LayoutGrid size={14} className="mr-2.5" /> Grid
            </button>
         </div>

         <div className="flex items-center gap-4 flex-1 max-w-xl pr-2">
            <div className="relative flex-1 group">
               <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--brand-accent)] transition-colors" />
               <input 
                  placeholder="QUERY_NODE..." 
                  className="w-full bg-[var(--bg-base)] border border-[var(--surface-border)] rounded-xl pl-12 pr-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-accent)]/30 transition-all font-bold italic tracking-wider font-oswald" 
               />
            </div>
            <button className="px-6 py-2.5 bg-[var(--bg-base)] border border-[var(--surface-border)] rounded-xl text-caption font-bold text-[var(--text-tertiary)] tracking-widest hover:text-[var(--text-primary)] transition-all flex items-center gap-2 font-oswald shadow-sm">
               <Filter size={14} /> Filters
            </button>
         </div>
      </div>

      {/* TASK LIST TABLE */}
      <GlassPanel className="p-0 overflow-hidden border-[var(--surface-border)] shadow-3xl bg-[var(--bg-surface)]/80">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="bg-[var(--bg-layer)]/50 text-caption font-bold tracking-[0.2em] text-[var(--text-tertiary)] border-b border-[var(--surface-border)] font-oswald">
                     <th className="p-6 w-16">
                        <div className="w-4 h-4 rounded border border-[var(--surface-border)] bg-[var(--bg-base)] flex items-center justify-center"></div>
                     </th>
                     <th className="p-6">Registry_Signature</th>
                     <th className="p-6">Temporal_Status</th>
                     <th className="p-6 text-center">Authorization</th>
                     <th className="p-6">Temporal_Lock</th>
                     <th className="p-6">Cluster_Node</th>
                     <th className="p-6 text-right pr-10">Protocols</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--surface-border)]">
                  {tasks.map(task => (
                     <tr key={task.id} className="hover:bg-[var(--bg-hover)]/40 transition-all duration-300 group">
                        <td className="p-6">
                           <button 
                              onClick={() => onToggleSelect(task.id)}
                              className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${
                                 selectedIds.includes(task.id) ? 'bg-[var(--brand-accent)] border-[var(--brand-accent)] text-gray-900 shadow-glow' : 'border-[var(--surface-border)] bg-[var(--bg-base)] shadow-inner'
                              }`}
                           >
                              {selectedIds.includes(task.id) && <CheckSquare size={12} />}
                           </button>
                        </td>
                        <td className="p-6" onClick={() => onTaskClick(task)}>
                           <div className="font-bold italic text-[var(--text-primary)] text-sm group-hover:text-[var(--brand-accent)] transition-colors cursor-pointer tracking-tight font-oswald uppercase">{task.title}</div>
                           <div className="text-gov-label text-[var(--text-tertiary)] mt-1 font-bold italic line-clamp-1 max-w-md opacity-0 group-hover:opacity-60 transition-opacity uppercase tracking-widest">Execute verification protocol or audit node.</div>
                        </td>
                        <td className="p-6">
                           <span className={`px-3 py-1 rounded-full text-caption font-bold tracking-widest border transition-all shadow-sm ${
                              task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'
                           }`}>
                              {task.status}
                           </span>
                        </td>
                        <td className="p-6">
                           <div className="flex justify-center">
                              <span className={`px-2.5 py-1 rounded text-caption font-bold border tracking-[0.1em] font-oswald shadow-sm ${getPriorityColor(task.priority)}`}>
                                 {task.priority}
                              </span>
                           </div>
                        </td>
                        <td className="p-6 font-mono text-gov-label font-bold italic text-[var(--text-secondary)]">
                           {task.due_date ? format(new Date(task.due_date), 'dd MMM yyyy').toUpperCase() : 'NO_LOCK_DATE'}
                        </td>
                        <td className="p-6">
                           <div className="flex flex-wrap gap-1.5">
                              {task.categories && task.categories.length > 0 ? task.categories.map(cat => (
                                 <span key={cat.id} className="bg-[var(--bg-base)] border border-[var(--surface-border)] text-gov-label font-bold px-2 py-0.5 rounded tracking-widest font-oswald shadow-sm" style={{ color: cat.color }}>
                                    {cat.name}
                                 </span>
                              )) : <span className="text-[var(--text-disabled)] font-oswald text-caption italic font-bold">NULL_CLUSTER</span>}
                           </div>
                        </td>
                        <td className="p-6 text-right pr-10">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                              <button className="p-2 bg-[var(--bg-base)] text-[var(--text-tertiary)] border border-[var(--surface-border)] rounded-lg hover:text-[var(--brand-accent)] hover:border-[var(--brand-accent)]/40 transition-all shadow-sm"><CheckSquare size={14}/></button>
                              <button className="p-2 bg-[var(--bg-base)] text-[var(--text-tertiary)] border border-[var(--surface-border)] rounded-lg hover:text-[var(--brand-accent)] hover:border-[var(--brand-accent)]/40 transition-all shadow-sm"><Edit2 size={14}/></button>
                              <button className="p-2 bg-[var(--mce-red)]/10 text-[var(--mce-red)] border border-[var(--mce-red)]/20 rounded-lg hover:bg-[var(--mce-red)] hover:text-gray-900 transition-all shadow-sm"><Trash2 size={14}/></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {tasks.length === 0 && (
               <div className="p-32 text-center flex flex-col items-center justify-center space-y-6 opacity-20 filter grayscale">
                  <Database className="text-[var(--text-tertiary)]" size={64} />
                  <p className="text-gov-label font-bold italic tracking-[0.4em] text-[var(--text-tertiary)] uppercase">Recursive Query Empty</p>
               </div>
            )}
         </div>
      </GlassPanel>
    </div>
  );
};
