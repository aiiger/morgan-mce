import React, { useState, useMemo, useEffect } from 'react';
import { Bell, ShieldAlert, Clock, CheckCircle2, MoreVertical, Filter, Zap, Search } from 'lucide-react';
import { Notification } from '@/components/notifications/NotificationBell';

interface NotificationsPageProps {
   notifications?: Notification[];
   onAcknowledge?: (id: string) => void;
}

import { PageHeader } from '../ui/PageHeader';

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications: initialNotifications, onAcknowledge }) => {
   const [notifications, setNotifications] = useState<Notification[]>(initialNotifications ?? []);
   const [loading, setLoading] = useState(!initialNotifications);

   useEffect(() => {
      if (initialNotifications) return;
      fetch('/api/notifications')
         .then(r => r.json())
         .then((data: Notification[]) => setNotifications(Array.isArray(data) ? data : []))
         .catch(() => setNotifications([]))
         .finally(() => setLoading(false));
   }, [initialNotifications]);
   const [filters, setFilters] = useState({ search: '', severity: 'all', status: 'all' });

   const handleAcknowledge = (id: string) => {
       setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
       onAcknowledge?.(id);
   }

   const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const searchMatch = filters.search === '' || n.message.toLowerCase().includes(filters.search.toLowerCase());
      const severityMatch = filters.severity === 'all' || n.severity === filters.severity;
      const statusMatch = filters.status === 'all' 
          || (filters.status === 'unread' && !n.read_at) 
          || (filters.status === 'acknowledged' && !!n.read_at) 
          || (filters.status === 'action_required' && !!n.ack_required && !n.read_at);
      return searchMatch && severityMatch && statusMatch;
    });
   }, [notifications, filters]);

   const getSeverityColor = (severity: 'info' | 'warning' | 'critical') => {
      switch (severity) {
         case 'critical': return 'bg-rose-500 animate-pulse shadow-[0_0_10px_var(--color-critical)]';
         case 'warning': return 'bg-amber-500';
         default: return 'bg-sky-500';
      }
   };
   
   const getSeverityBadge = (severity: 'info' | 'warning' | 'critical') => {
      switch (severity) {
         case 'critical': return 'text-rose-600 bg-rose-50 border-rose-200';
         case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
         default: return 'text-sky-600 bg-sky-50 border-sky-200';
      }
   }

   const criticalCount = notifications.filter(n => n.severity === 'critical' && !n.read_at).length;
   const warningCount = notifications.filter(n => n.severity === 'warning' && !n.read_at).length;

    return (
      <div className="page-container space-y-8 pb-32 animate-fade-in">
         <PageHeader 
            title="Signal Center"
            subtitle="Global Alert Stream // Acknowledgments"
            actions={
               <button className="px-6 py-2 text-caption font-bold italic tracking-widest text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all">
                  Flush All Signals
               </button>
            }
         />


         {/* Stats Summary */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-gray-50 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                   <p className="text-caption font-bold italic text-rose-400 tracking-widest">Unresolved Critical</p>
                   <h3 className="text-2xl font-bold italic text-gray-900 mt-1">{criticalCount.toString().padStart(2, '0')}</h3>
                </div>
                <ShieldAlert size={24} className="text-rose-500 opacity-50" />
             </div>
             <div className="bg-gray-50 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                   <p className="text-caption font-bold italic text-amber-400 tracking-widest">Active Warnings</p>
                   <h3 className="text-2xl font-bold italic text-gray-900 mt-1">{warningCount.toString().padStart(2, '0')}</h3>
                </div>
                <Clock size={24} className="text-amber-400 opacity-50" />
             </div>
             <div className="bg-gray-50 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                   <p className="text-caption font-bold italic text-emerald-400 tracking-widest">System Health</p>
                   <h3 className="text-2xl font-bold italic text-gray-900 mt-1">98%</h3>
                </div>
                <CheckCircle2 size={24} className="text-emerald-500 opacity-50" />
             </div>
         </div>

         {/* Filter and Search Controls */}
         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center space-x-4">
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3">
                <Search size={16} className="text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search notifications by message..." 
                    className="w-full bg-transparent p-2 text-sm text-gray-900 outline-none placeholder-gray-400"
                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                />
            </div>
            <select onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-sky-500 outline-none">
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
            </select>
            <select onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-sky-500 outline-none">
                <option value="all">All Statuses</option>
                <option value="unread">Unread</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="action_required">Action Required</option>
            </select>
         </div>

         {/* Inbox List */}
         <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
               <h4 className="text-xs font-bold italic text-gray-700 tracking-widest flex items-center">
                  <Zap size={14} className="mr-2 text-amber-400" /> Inbox
               </h4>
               <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><Filter size={16} /></button>
                  <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><MoreVertical size={16} /></button>
               </div>
            </div>

            <div className="divide-y divide-gray-100">
               {filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                     <p>No notifications match the current filters.</p>
                  </div>
               ) : filteredNotifications.map((n) => (
                  <div key={n.id} className="p-6 hover:bg-gray-50 transition-all group flex items-start justify-between">
                     <div className="flex items-start space-x-5">
                        <div className={`mt-1 w-2 h-2 rounded-full ${getSeverityColor(n.severity)}`}></div>
                        <div>
                           <div className="flex items-center space-x-3">
                              <span className={`text-gov-label px-2 py-0.5 rounded border font-bold italic tracking-tighter ${getSeverityBadge(n.severity)}`}>
                                 {n.severity}
                              </span>
                              <h4 className="text-base font-bold italic text-gray-900">{n.message}</h4>
                           </div>
                           <p className="text-sm text-gray-500 mt-2 max-w-2xl">This is a placeholder for additional details about the notification, such as the related project or tender.</p>
<div className="flex items-center space-x-4 mt-3">
                               <span className="text-caption text-gray-400 font-mono">{new Date(n.created_at).toLocaleString()}</span>
                               {n.ack_required && !n.read_at && (
                                 <>
                                   <span className="text-caption text-slate-600">•</span>
                                   <button
                                      onClick={(e) => { e.stopPropagation(); handleAcknowledge(n.id); }}
                                      className="text-caption font-bold italic text-emerald-500 hover:text-emerald-400 tracking-wider flex items-center transition-colors hover:underline"
                                   >
                                      ACKNOWLEDGE
                                   </button>
                                   <span className="text-caption text-slate-600">•</span>
                                    <button className="text-caption font-bold italic text-sky-500 hover:text-sky-400 tracking-wider">SNOOZE</button>
                                 </>
                               )}
                           </div>
                        </div>
                     </div>
                     <button className="text-gray-400 hover:text-gray-900 p-2 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={18} />
                     </button>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};


