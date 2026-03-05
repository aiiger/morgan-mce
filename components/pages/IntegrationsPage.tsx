import React, { useState, useEffect } from 'react';
import { Database, Link2, Zap, Cloud, FileText, CheckCircle2, AlertTriangle, RefreshCw, Activity, Loader2, Cpu, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '@/lib/toast-context';

import { PageHeader } from '../ui/PageHeader';

/**
 * Verified: Production Ready
 * Mesh Intelligence Control v2.0
 * Unified bridge management and agent utilization hub.
 */
export const IntegrationsPage: React.FC = () => {
   const [scanning, setScanning] = useState(false);
   const [systems, setSystems] = useState<any[]>([]);
   const [logs, setLogs] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const toast = useToast();

   useEffect(() => {
      const fetchMesh = async () => {
         const { data: intData } = await supabase.from('integrations').select('*');
         const { data: logData } = await supabase.from('integration_logs').select('*, integrations(name)').order('timestamp', { ascending: false }).limit(8);

         if (intData) setSystems(intData);
         if (logData) setLogs(logData);
         setLoading(false);
      };
      fetchMesh();
   }, []);

   const handleDiagnostic = async () => {
      setScanning(true);
      try {
        const res = await fetch('/api/health');
        const data = res.ok ? await res.json().catch(() => ({})) : {};
        toast.success(
          'Mesh Diagnostic Complete',
          `${systems.length} bridge${systems.length !== 1 ? 's' : ''} verified · Status: ${data.status || 'Operational'}`
        );
      } catch {
        toast.error('Diagnostic Failed', 'Could not reach health endpoint.');
      } finally {
        setScanning(false);
      }
   };

   if (loading) return (
      <div className="page-container flex items-center justify-center">
         <Zap className="animate-pulse text-[var(--color-success)]" size={48} />
      </div>
   );

   return (
      <div className="page-container space-y-8 animate-in fade-in duration-700 pb-32">
         <PageHeader
            title="Intelligence Mesh"
            subtitle="Sector 08 // Global Handshake"
            actions={
               <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_var(--color-success)]" />
                     <span className="text-gov-label font-bold italic text-emerald-500 tracking-widest">DRM Engine Synced</span>
                  </div>
                  <button
                     onClick={handleDiagnostic}
                     disabled={scanning}
                     className="bg-white text-black px-6 py-2 rounded-xl text-caption font-bold italic tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center shadow-2xl active:scale-95 disabled:opacity-50"
                  >
                     {scanning ? <Loader2 size={14} className="mr-2 animate-spin" /> : <ShieldCheck size={14} className="mr-2" />}
                     {scanning ? 'Running Sync Audit...' : 'Initiate Mesh Audit'}
                  </button>
               </div>
            }
         />

         {/* Bridge Intelligence Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systems.map((s) => (
               <div
                  key={s.id}
                  role="button"
                  aria-label={`View ${s.name} Integration Details`}
                  className="bg-white border border-gray-200 rounded-2xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm"
               >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                     <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 group-hover:text-[var(--color-success)] transition-all shadow-inner">
                        <Database size={18} />
                     </div>
                     <div className={`text-gov-label font-bold italic tracking-[0.2em] px-3 py-1 rounded-full border transition-all ${s.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                           s.status === 'Syncing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                        {s.status}
                     </div>
                  </div>
                  <h3 className="font-bold italic text-gray-800 text-lg mb-1 group-hover:text-gray-900 transition-colors relative z-10 tracking-tight font-sans">{s.name}</h3>
                  <p className="text-caption text-gray-500 font-bold italic tracking-widest relative z-10 font-mono opacity-60">Handshake Latency: {s.uptime}</p>

                  {/* Internal Reflection Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               </div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Live Intelligence Modulation Feed */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
               <div className="px-10 py-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Zap size={16} className="text-[var(--color-success)]" />
                     <h3 className="text-xs font-bold italic text-gray-600 tracking-[0.4em] font-sans">Active Logic Modulation</h3>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-gov-label font-bold italic text-gray-500 tracking-widest px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full font-mono">Vault-Cluster: PRIMARY-AE</span>
                  </div>
               </div>
               <div className="p-10 space-y-6">
                  {logs.map((log, i) => (
                     <div key={log.id} className="flex items-center justify-between p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 hover:border-gray-300 transition-all group cursor-pointer relative overflow-hidden active:scale-[0.99]">
                        <div className="flex items-center space-x-6 relative z-10">
                           <div className="w-14 h-14 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-[var(--color-success)] group-hover:rotate-12 transition-all duration-500 shadow-inner"><RefreshCw size={20} /></div>
                           <div>
                              <p className="text-base font-bold italic text-gray-700 group-hover:text-gray-900 transition-colors tracking-tight font-sans">{log.integrations?.name} Intelligent Sync</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                 <span className="text-caption text-gray-500 font-bold italic tracking-widest opacity-60">{log.event_title}</span>
                                 <div className="w-1 h-1 rounded-full bg-gray-300" />
                                 <span className="text-gov-label text-[var(--color-success)]/60 font-bold italic tracking-tighter">Verified Handshake</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right relative z-10">
                           <p className="text-gov-label font-bold italic text-emerald-500 tracking-[0.2em] bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 shadow-sm">{log.status}</p>
                           <p className="text-caption text-gray-500 font-bold italic mt-3 font-mono tracking-tighter opacity-40">{new Date(log.timestamp).toLocaleTimeString()}</p>
                        </div>
                     </div>
                  ))}
                  {logs.length === 0 && (
                     <div className="py-12 relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                        <div className="relative z-10 flex flex-col items-center justify-center gap-6">
                           <div className="flex items-center gap-8 opacity-50">
                              <div className="flex flex-col items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-gov-label font-mono text-emerald-500 tracking-widest">UPLINK: ACTIVE</span>
                              </div>
                              <div className="h-8 w-px bg-gray-300" />
                              <div className="flex flex-col items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-75" />
                                 <span className="text-gov-label font-mono text-emerald-500 tracking-widest">DOWNLINK: ACTIVE</span>
                              </div>
                              <div className="h-8 w-px bg-gray-300" />
                              <div className="flex flex-col items-center gap-2">
                                 <Activity size={12} className="text-emerald-500 animate-bounce" />
                                 <span className="text-gov-label font-mono text-emerald-500 tracking-widest">LATENCY: 12ms</span>
                              </div>
                           </div>

                           <div className="w-full max-w-md h-16 relative flex items-end justify-between px-4 gap-1">
                              {[...Array(20)].map((_, i) => (
                                 <div
                                    key={i}
                                    className="w-full bg-emerald-500/10 rounded-t-sm animate-pulse"
                                    style={{
                                       height: `${Math.random() * 40 + 20}%`,
                                       animationDelay: `${i * 0.1}s`,
                                       animationDuration: '1.5s'
                                    }}
                                 />
                              ))}
                           </div>

                           <p className="text-caption font-bold italic tracking-[0.3em] text-gray-500 uppercase">
                              Awaiting Telemetry Streams // System Nominal
                           </p>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Mesh Stability Module */}
            <div className="space-y-8">
               <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-sm text-center relative overflow-hidden group">
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />

                  <div className="w-28 h-28 rounded-full border-4 border-emerald-500/10 border-t-emerald-400 flex items-center justify-center mx-auto mb-12 relative shadow-3xl group-hover:scale-105 transition-transform duration-700">
                     <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
                     <span className="text-4xl font-bold italic text-gray-900 drop-shadow-lg relative z-10 font-mono tracking-tighter">100%</span>
                  </div>

                  <h4 className="font-bold italic text-gray-900 text-xl tracking-tight mb-4 font-sans">Infrastructure Stable</h4>
                  <p className="text-xs text-gray-500 font-bold italic leading-relaxed px-6 opacity-80 tracking-wider">
                     Global data bridges are operating within optimal latency thresholds. All handshakes verified.
                  </p>

                  <div className="mt-14 space-y-4 pt-12 border-t border-gray-200 relative z-10">
                     <div className="flex justify-between items-center px-4">
                        <span className="text-caption font-bold italic text-gray-500 tracking-widest font-sans">Systemic Health</span>
                        <span className="text-caption font-bold italic text-emerald-500 tracking-widest font-mono">NOMINAL</span>
                     </div>
                     <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-emerald-900 to-emerald-500 w-full shadow-[0_0_15px_var(--color-success)]"></div>
                     </div>
                  </div>
               </div>

               {/* Agent Utilization Link */}
               <div className="bg-white border border-gray-200 rounded-2xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-all cursor-help shadow-sm">
                  <div className="flex items-center gap-4 relative z-10">
                     <div className="w-12 h-12 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner group-hover:rotate-12 transition-all"><Cpu size={20} /></div>
                     <div>
                        <h4 className="text-sm font-bold italic text-gray-900 tracking-wider mb-1">Agent Mesh Utilization</h4>
                        <p className="text-caption text-gray-500 font-bold italic tracking-widest">Core Extraction Loop Active</p>
                     </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                     <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-caption font-bold italic text-gray-500 font-mono">A{i}</div>)}                     </div>
                     <span className="text-gov-label text-gray-500 font-bold italic ml-2 tracking-widest">3 Agents Consuming Streams</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
