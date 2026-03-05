import React from 'react';
import { Bell, Clock, CheckCircle2, List, Plus, RotateCw, Trash2, Edit2, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';

interface NotificationsModuleProps {
   alerts: any[];
}

export const NotificationsModule: React.FC<NotificationsModuleProps> = ({ alerts }) => {
   const stats = [
      { label: 'TOTAL TASKS', val: '12', color: 'text-gray-900' },
      { label: 'PENDING', val: '4', color: 'text-[var(--color-warning)]' },
      { label: 'IN PROGRESS', val: '3', color: 'text-gray-500' },
      { label: 'COMPLETED', val: '5', color: 'text-[var(--color-success)]' },
   ];

   return (
      <div className="space-y-6 motion-entry">
         {/* 1. Clinical KPI Tiles */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
               <div key={stat.label} className="bg-[var(--surface-layer)] border border-[var(--surface-border)] rounded p-6 group transition-colors hover:border-gray-300">
                  <p className="text-xs font-bold italic text-gray-500 font-sans">{stat.label}</p>
                  <h3 className={`text-2xl font-bold italic mt-1 font-mono ${stat.color}`}>{stat.val}</h3>
               </div>
            ))}
         </div>

         {/* 2. Quick Add & Task List - Semantic Compression */}
         <div className="grid grid-cols-1 gap-6">
            <div className="bg-[var(--surface-layer)] border border-[var(--surface-border)] rounded-lg overflow-hidden transition-all">
               <div className="px-6 py-4 bg-[var(--surface-base)] border-b border-[var(--surface-border)] flex justify-between items-center">
                  <h4 className="font-extrabold text-gray-500 text-xs flex items-center font-sans">
                     <Clock size={14} className="mr-2 text-gray-400" /> Executive Workflow
                  </h4>
                  <div className="flex space-x-2">
                     <button className="text-xs text-[var(--color-critical)] font-bold italic hover:text-gray-900 transition-colors px-2 py-0.5 border border-gray-200 rounded font-sans">Add Signal</button>
                     <button className="text-xs text-gray-500 font-bold italic hover:text-gray-700 transition-colors font-sans">Archive Done</button>
                  </div>
               </div>


               <div className="divide-y divide-[var(--surface-border)]">
                  {alerts.length === 0 ? (
                     <div className="p-8 text-center text-gray-400 font-bold italic text-xs bg-[var(--surface-base)]">
                        [ZERO-STATE] / NO DISRUPTIONS DETECTED
                     </div>
                  ) : (
                     alerts.slice(0, 3).map((alert, i) => (
                        <div key={i} className="p-6 hover:bg-gray-50 transition-colors flex items-start justify-between group cursor-pointer border-l-2 border-l-transparent hover:border-l-[var(--brand-accent)]">
                           <div className="flex items-start space-x-5">
                              <button className="mt-1 text-gray-400 hover:text-emerald-500 transition-colors">
                                 <CheckCircle2 size={18} />
                              </button>
                              <div>
                                 <p className="text-sm font-bold italic text-gray-900 tracking-tight group-hover:text-gray-700 transition-colors font-sans">{alert.title}</p>
                                 <div className="flex items-center space-x-4 mt-2">
                                    <span className={`text-xs font-bold italic font-sans ${alert.priority === 'critical' ? 'text-[var(--color-critical)] motion-critical' : 'text-gray-500'
                                       }`}>{alert.priority} • SIGNAL</span>
                                    <span className="text-xs text-gray-400 flex items-center font-mono">
                                       <Calendar size={10} className="mr-1 opacity-50" /> 0.4s AGO
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded transition-colors"><Edit2 size={14} /></button>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

