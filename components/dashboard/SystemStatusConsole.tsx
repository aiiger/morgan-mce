import React, { useState, useEffect } from 'react';

import { Activity, Database, Server, Wifi, Cpu, ShieldCheck } from 'lucide-react';

export const SystemStatusConsole = () => {
    const [heartbeat, setHeartbeat] = useState(true);
    const [latency, setLatency] = useState(12);
    const [sessions, setSessions] = useState(4);
    const [logs, setLogs] = useState<string[]>([
        "SYSTEM_INIT: CORE_SERVICES_ONLINE",
        "SYNC_NODE_01: STABLE",
        "DB_SHARD_A: REBALANCED"
    ]);

    // Simulated Heartbeat (UI animation)
    useEffect(() => {
        const interval = setInterval(() => {
            setHeartbeat(prev => !prev);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Live Telemetry (UI animation - replace with /api/metrics when telemetry endpoint is available)
    useEffect(() => {
        const interval = setInterval(() => {
            setLatency(prev => Math.max(8, Math.min(24, prev + (Math.random() > 0.5 ? 2 : -2))));
            setSessions(prev => Math.max(2, Math.min(10, prev + (Math.random() > 0.8 ? 1 : 0))));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Live Log Stream from audit_logs
    useEffect(() => {
      const fetchLogs = () => {
        fetch('/api/admin/logs')
          .then(r => r.ok ? r.json() : [])
          .then((data: Array<{ action?: string; created_at?: string }>) => {
            if (Array.isArray(data) && data.length > 0) {
              setLogs(data.slice(0, 5).map(l => `${l.action || 'SYSTEM_EVENT'}: ${new Date(l.created_at || '').toLocaleTimeString()}`));
            }
          })
          .catch(() => {});
      };
      fetchLogs();
      const interval = setInterval(fetchLogs, 30000);
      return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full bg-white border border-gray-200 overflow-hidden flex flex-col group hover:border-emerald-500/30 transition-all duration-500">
            {/* Header / Top Bar */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity size={14} className={`text-emerald-500 ${heartbeat ? 'opacity-100' : 'opacity-50'} transition-opacity duration-300`} />
                    <span className="text-xs font-mono font-bold italic text-emerald-500 tracking-wider">SYSTEM_ONLINE</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${heartbeat ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-300'} transition-all duration-300`} />
                        <span className="text-xs font-mono text-gray-500">LIVE</span>
                    </div>
                </div>
            </div>

            {/* Main Console Content */}
            <div className="flex-1 p-4 flex flex-col gap-4 font-mono">

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Latency Metric */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative overflow-hidden group/item hover:bg-bg-hover transition-colors">
                        <div className="absolute top-0 right-0 p-1 opacity-20 group-hover/item:opacity-40 transition-opacity">
                            <Wifi size={24} />
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Latency</div>
                        <div className="text-lg font-bold italic text-gray-900 flex items-baseline gap-1">
                            {latency} <span className="text-xs text-gray-500 font-bold italic">ms</span>
                        </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative overflow-hidden group/item hover:bg-bg-hover transition-colors">
                        <div className="absolute top-0 right-0 p-1 opacity-20 group-hover/item:opacity-40 transition-opacity">
                            <Server size={24} />
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Sessions</div>
                        <div className="text-lg font-bold italic text-gray-900 flex items-baseline gap-1">
                            {sessions} <span className="text-xs text-gray-500 font-bold italic">Active</span>
                        </div>
                    </div>
                </div>

                {/* System Terminal Log */}
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-50"></div>
                    <div className="text-xs text-emerald-500/50 mb-2 flex items-center gap-1.5">
                        <Cpu size={10} />
                        <span>EVENT_STREAM</span>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <div className="space-y-1.5 absolute bottom-0 w-full transition-all duration-300">
                            {logs.map((log, i) => (
                                <div key={i} className={`text-xs font-mono truncate ${i === 0 ? 'text-emerald-400' : 'text-gray-500'} ${i > 2 ? 'opacity-40' : 'opacity-100'} transition-all duration-300`}>
                                    <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit" })}]</span>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorator Footer */}
            <div className="px-4 py-2 bg-bg-surface border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>VER: 4.2.0-ALPHA</span>
                <span className="flex items-center gap-1 text-emerald-500/60"><ShieldCheck size={8} /> SECURED</span>
            </div>
        </div>
    );
};

