
import React, { useState } from 'react';
import { useLiabilityData, LiabilityItem } from '@/hooks/useLiabilityData';
import {
   ShieldAlert, Calendar, AlertTriangle, CheckCircle2,
   Siren, Building2, Zap, Users, Wallet, FileText
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
   Government: Building2,
   Insurance: ShieldAlert,
   Facilities: Zap,
   HR: Users,
   Finance: Wallet,
   Project: FileText
};

import { PageHeader } from '../ui/PageHeader';
import { GlassButton } from '../ui/GlassButton';
import { RippleButton } from '../ui/RippleButton';
import { EmptyState } from '../ui/EmptyState';

export const LiabilityDashboard: React.FC = () => {
   const { items, stats, loading, error, scan } = useLiabilityData();
   const [filter, setFilter] = useState('All');

   const getTrafficLight = (dateStr: string, priority: string) => {
      const days = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (days < 0) return 'bg-gray-100 border-gray-200 text-gray-400'; // Expired
      if (days < 30 || priority === 'CRITICAL') return 'bg-rose-500/10 border-rose-500/50 text-rose-500 animate-pulse-slow';
      if (days < 90) return 'bg-amber-500/10 border-amber-500/50 text-amber-500';
      return 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500';
   };

   const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
   const filteredItems = filter === 'All' ? items : items.filter(i => i.category === filter);

   if (loading) return <div className="p-20 text-center text-gray-400 font-mono animate-pulse">Scanning Corporate Registries...</div>;

   return (
      <div className="page-container pb-20 animate-in fade-in duration-700">
         <PageHeader
            title={
               <>LIABILITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">COMMAND</span></>
            }
            subtitle="MCE Governance System // Strategic Obligations"
            actions={
               <div className="flex gap-4">
                  <div className="bg-gray-50 border border-gray-200 px-6 py-2 rounded-xl flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-caption text-gray-500 font-bold italic">Critical</span>
                        <span className="text-xl font-bold italic text-rose-500 font-mono leading-none">{stats.critical}</span>
                     </div>
                     <div className="w-px h-6 bg-gray-200" />
                     <div className="flex flex-col">
                        <span className="text-caption text-gray-500 font-bold italic">Expiring</span>
                        <span className="text-xl font-bold italic text-amber-500 font-mono leading-none">{stats.expiring30}</span>
                     </div>
                  </div>
                  <GlassButton
                     onClick={scan}
                     disabled={loading}
                     className="px-6 py-2 rounded-xl text-caption font-bold italic tracking-widest relative overflow-hidden"
                  >
                     {loading ? (
                        <div className="flex items-center gap-2">
                           <span className="animate-spin">⟳</span> SCANNING...
                        </div>
                     ) : (
                        "INITIALIZE SCAN"
                     )}
                  </GlassButton>
               </div>
            }
         />

         {/* MAIN DASHBOARD CONTENT */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* LEFT: FILTERS & SUMMARY */}
            <div className="lg:col-span-1 space-y-4">
               <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sticky top-4">
                  <h3 className="text-xs font-bold italic text-gray-600 tracking-widest mb-4">Domains</h3>
                  <div className="space-y-1">
                     {categories.map(cat => (
                        <button
                           key={cat}
                           onClick={() => setFilter(cat)}
                           className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold italic transition-all ${filter === cat
                              ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                        >
                           <div className="flex justify-between items-center">
                              <span>{cat}</span>
                              {cat !== 'All' && <span className="text-caption bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">
                                 {items.filter(i => i.category === cat).length}
                              </span>}
                           </div>
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* RIGHT: THE REGISTRY GRID */}
            <div className="lg:col-span-3 space-y-4">
               {filteredItems.length === 0 ? (
                  <EmptyState
                     icon={FileText}
                     title="No Liabilities Found"
                     description={`No items match the '${filter}' category.`}
                     action={{
                        label: "Clear Filters",
                        onClick: () => setFilter('All')
                     }}
                     className="mt-8 border-dashed border-gray-200 bg-gray-50"
                  />
               ) : (
                  filteredItems.map((item) => {
                     const daysLeft = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                     const StatusIcon = item.priority === 'CRITICAL' ? Siren : CheckCircle2;
                     const CategoryIcon = CATEGORY_ICONS[item.category] || FileText;

                     return (
                        <div key={item.id} className="group relative bg-white border border-gray-200 hover:bg-gray-50 rounded-xl p-6 transition-all duration-300">
                           {/* TRAFFIC LIGHT INDICATOR BAR */}
                           <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${item.priority === 'CRITICAL' ? 'bg-rose-500' :
                              daysLeft < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />

                           <div className="flex flex-col md:flex-row justify-between gap-6 pl-4">
                              {/* INFO BLOCK */}
                              <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-2">
                                    <CategoryIcon size={14} className="text-gray-500" />
                                    <span className="text-caption tracking-wider text-gray-500 font-bold italic">{item.category} • {item.sub_category || 'General'}</span>
                                    {item.priority === 'CRITICAL' && (
                                       <span className="ml-2 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-gov-label text-rose-500 font-bold italic tracking-wider">Critical</span>
                                    )}
                                 </div>
                                 <h3 className="text-lg font-bold italic text-gray-900 group-hover:text-[var(--brand-accent)] transition-colors">
                                    {item.obligation_name}
                                 </h3>
                                 <div className="mt-2 text-xs text-gray-500 font-mono">
                                    REF: <span className="text-gray-500">{item.reference_number || 'N/A'}</span>
                                 </div>
                              </div>

                              {/* STATUS BLOCK */}
                              <div className="flex flex-col items-end min-w-[140px]">
                                 <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 mb-2 ${getTrafficLight(item.expiry_date, item.priority)}`}>
                                    <StatusIcon size={14} />
                                    <span className="text-xs font-bold italic font-mono">
                                       {daysLeft < 0 ? 'EXPIRED' : `${daysLeft} DAYS`}
                                    </span>
                                 </div>
                                 <div className="text-caption text-gray-500 tracking-wider font-bold italic text-right">
                                    Due: {item.expiry_date}
                                 </div>
                                 {item.annual_cost && item.annual_cost > 0 && (
                                    <div className="mt-2 text-xs font-mono text-gray-500">
                                       AED {item.annual_cost.toLocaleString()}
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* HOVER DETAILS (IMPACT) */}
                           {item.impact_description && (
                              <div className="mt-4 pt-4 border-t border-gray-100 opacity-70 group-hover:opacity-100 transition-opacity">
                                 <div className="flex gap-2 items-start">
                                    <AlertTriangle size={12} className="text-gray-500 mt-0.5" />
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                       <span className="font-bold italic text-gray-500 not-italic text-caption mr-1">Impact:</span>
                                       {item.impact_description}
                                    </p>
                                 </div>
                              </div>
                           )}
                        </div>
                     );
                  })
               )}
            </div>
         </div>
      </div>
   );
};

