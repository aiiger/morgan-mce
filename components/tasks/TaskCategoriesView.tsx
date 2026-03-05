import React from 'react';
import { Tag, Plus, CheckCircle2, Star, Edit2, Trash2, Database } from 'lucide-react';
import { Category, Task } from '../../types';
import { GlassPanel } from '../ui/GlassPanel';

interface TaskCategoriesViewProps {
  categories: Category[];
  tasks: Task[];
  onAddCategory: () => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
}

export const TaskCategoriesView: React.FC<TaskCategoriesViewProps> = ({ categories, tasks, onAddCategory, onEditCategory, onDeleteCategory }) => {
  
  const getTasksCount = (catId: string) => {
    return tasks.filter(t => t.categories?.some(c => c.id === catId)).length;
  };

  const categorizedTasksCount = tasks.filter(t => t.categories && t.categories.length > 0).length;
  
  const mostUsedCat = categories.length > 0 
    ? [...categories].sort((a, b) => getTasksCount(b.id) - getTasksCount(a.id))[0]
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold italic text-gray-900 tracking-tight flex items-center gap-3">
            <Tag size={20} className="text-amber-500" />
            Categories
          </h2>
          <p className="text-caption text-gray-500 font-bold italic tracking-widest pl-8">Organize your matrix nodes with custom labels</p>
        </div>
        <button
          onClick={onAddCategory}
          className="bg-blue-600 text-gray-900 px-8 py-3 rounded-xl text-caption font-bold italic tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <Plus size={14} className="mr-2 inline" strokeWidth={3} /> Add Category
        </button>
      </div>

      {/* SUMMARY CARDS - TODO TRACKER STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <GlassPanel className="p-8 relative overflow-hidden group">
            <Tag className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/5 group-hover:text-blue-500/10 transition-colors" />
            <span className="text-caption font-bold italic text-gray-500 tracking-[0.2em] mb-2 block">Total Categories</span>
            <h3 className="text-5xl font-bold italic text-gray-900 font-mono tracking-tighter">{categories.length}</h3>
         </GlassPanel>
         <GlassPanel className="p-8 relative overflow-hidden group">
            <CheckCircle2 className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors" />
            <span className="text-caption font-bold italic text-gray-500 tracking-[0.2em] mb-2 block">Categorized Tasks</span>
            <h3 className="text-5xl font-bold italic text-gray-900 font-mono tracking-tighter">{categorizedTasksCount}</h3>
         </GlassPanel>
         <GlassPanel className="p-8 relative overflow-hidden group">
            <Star className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-500/5 group-hover:text-amber-500/10 transition-colors" />
            <span className="text-caption font-bold italic text-gray-500 tracking-[0.2em] mb-2 block">Most Used</span>
            <h3 className="text-xl font-bold italic text-gray-900 tracking-tight mt-2">{mostUsedCat?.name || 'N/A'}</h3>
            <p className="text-caption font-mono font-bold italic text-gray-500 mt-1">{mostUsedCat ? getTasksCount(mostUsedCat.id) : 0} nodes linked</p>
         </GlassPanel>
      </div>

      {/* CATEGORY LIST */}
      <div className="space-y-4 pt-4">
         <div className="flex items-center gap-3 px-2">
            <LayoutGridIcon size={14} className="text-gray-500" />
            <h4 className="text-caption font-bold italic text-gray-500 tracking-widest">All Categories Registry</h4>
            <span className="bg-gray-50 px-2 py-0.5 rounded text-gov-label text-gray-700 font-mono">{categories.length}</span>
         </div>

         <GlassPanel className="p-0 overflow-hidden border-gray-200 shadow-2xl">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-bg-surface text-gov-label font-bold italic tracking-[0.2em] text-gray-500 border-b border-gray-200">
                     <th className="p-6">Category Node</th>
                     <th className="p-6 text-center">Linked Nodes</th>
                     <th className="p-6">Initialization Date</th>
                     <th className="p-6 text-right pr-10">Matrix Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {categories.map(cat => (
                     <tr key={cat.id} className="hover:bg-bg-surface transition-colors group">
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}40` }}></div>
                              </div>
                              <div>
                                 <div className="font-bold italic text-gray-700 text-sm group-hover:text-gray-900 transition-colors tracking-tight">{cat.name}</div>
                                 <span className="text-caption font-mono text-gray-700 tracking-widest font-bold italic">HEX_{cat.color.toUpperCase()}</span>
                              </div>
                           </div>
                        </td>
                        <td className="p-6 text-center">
                           <span className="text-lg font-bold italic text-gray-900 font-mono tracking-tighter">{getTasksCount(cat.id)}</span>
                        </td>
                        <td className="p-6 font-mono text-caption font-bold italic text-gray-500">
                           {new Date(cat.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-6 text-right pr-10">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => onEditCategory(cat)} className="p-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg hover:text-gray-900 transition-all"><Edit2 size={14}/></button>
                              <button onClick={() => onDeleteCategory(cat.id)} className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg hover:bg-rose-500 hover:text-black transition-all"><Trash2 size={14}/></button>
                           </div>
                        </td>
                     </tr>
                  ))}
                  {categories.length === 0 && (
                     <tr>
                        <td colSpan={4} className="p-32 text-center">
                           <div className="flex flex-col items-center justify-center space-y-6 opacity-20 filter grayscale">
                              <Database className="text-gray-500" size={64} />
                              <p className="text-gov-label font-bold italic tracking-[0.4em] text-gray-500">Registry Is Empty</p>
                           </div>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </GlassPanel>
      </div>
    </div>
  );
};

const LayoutGridIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
);
