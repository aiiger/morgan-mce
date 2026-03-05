import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Cpu, Terminal, Zap, ShieldCheck, Activity, CheckCircle2, RefreshCcw, Database, Globe, Bot, Send } from 'lucide-react';
import { agentRegistry } from '../../utils/agent';
import { useSupabase } from '../../hooks/useSupabase';
import { useToast } from '@/lib/toast-context';

interface AgentConsoleProps {
  activity: any[];
  auditLogs: any[];
}

import { PageHeader } from '../ui/PageHeader';

export const AgentConsole: React.FC<AgentConsoleProps> = ({ activity, auditLogs }) => {
  const [activeTab, setActiveTab] = useState<'mesh' | 'audit' | 'intelligence'>('mesh');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ p5: any; s1: any } | null>(null);
  const [intelInput, setIntelInput] = useState('');
  const [intelResult, setIntelResult] = useState<{ answer: string; citations: string[] } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getClient } = useSupabase();
  const toast = useToast();

  const getAgentMetrics = (agentId: string) => {
    const recent = activity.filter(a => a.agent_id.includes(agentId));
    const isProcessing = recent.some(a => a.status === 'processing');
    const load = Math.min(recent.length * 5, 100);

    return {
      status: isProcessing ? 'Active' : (recent.length > 0 ? 'Standby' : 'Standby'),
      load: `${load}%`
    };
  };

  const agents = useMemo(() => [
    { id: 'P1', name: 'Contract Extractor', model: 'Sonnet 4.5', color: 'text-emerald-500' },
    { id: 'P5', name: 'Risk Compliance', model: 'Sonnet 4.5', color: 'text-blue-500' },
    { id: 'P9', name: 'Knowledge Core', model: 'Gemini 1.5', color: 'text-[var(--color-info)]' },
    { id: 'S1', name: 'Security Guard', model: 'RLS-Engine', color: 'text-rose-500' },
  ].map(a => ({
    ...a,
    ...getAgentMetrics(a.id)
  })), [activity]);

  const handleGlobalScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const client = await getClient();
      const results = await Promise.all([
        agentRegistry.p5.run(client, 'GLOBAL_PORTFOLIO'),
        agentRegistry.s1.run(client)
      ]);
      const p5Result = results[0] as any;
      const s1Result = results[1] as any;
      setScanResult({ p5: p5Result, s1: s1Result });
      toast.success('Scan Complete', `Risk: ${p5Result.risk_level} · Integrity: ${s1Result.integrity_score}%`);
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Scan Interrupted', 'System gateway timeout — check AI service.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleP9Query = async () => {
    if (!intelInput.trim()) return;
    setIsScanning(true);
    setIntelResult(null);
    try {
      const client = await getClient();
      const result = await agentRegistry.knowledge.query(client, intelInput.trim());
      setIntelResult({ answer: result.answer, citations: result.citations || [] });
      setActiveTab('intelligence');
    } catch (error) {
      toast.error('Intelligence Core Timeout', 'Knowledge query failed — check AI service.');
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activity]);

  return (
    <div className="page-container space-y-8 animate-in fade-in duration-700 pb-32">
      <PageHeader
        title="Agent Command"
        subtitle="Mission Control"
        actions={
          <div className="flex items-center gap-4">
            <button
              onClick={handleGlobalScan}
              disabled={isScanning}
              aria-label={isScanning ? "Neural Scan in progress" : "Execute Global Compliance Neural Scan"}
              className={`bg-emerald-500 text-black px-6 py-2 rounded-xl text-caption font-bold italic tracking-widest flex items-center gap-2 transition-all ${isScanning ? 'animate-pulse opacity-50' : 'hover:bg-emerald-400'}`}
            >
              <ShieldCheck size={14} strokeWidth={3} />
              {isScanning ? 'Scanning Cluster...' : 'Execute Compliance Scan'}
            </button>
            <div className="flex items-center gap-2">
              <input
                value={intelInput}
                onChange={e => setIntelInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleP9Query()}
                placeholder="Enter intel query..."
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-caption font-mono text-gray-700 w-52 focus:outline-none focus:border-blue-400 transition-all placeholder:text-gray-400"
              />
              <button
                onClick={handleP9Query}
                disabled={isScanning || !intelInput.trim()}
                aria-label="Ask Knowledge Core"
                className={`bg-blue-500 text-white px-4 py-2 rounded-xl text-caption font-bold italic tracking-widest flex items-center gap-2 transition-all ${isScanning || !intelInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-400'}`}
              >
                <Send size={13} strokeWidth={3} />
                Query
              </button>
            </div>
            <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse [animation-delay:0.4s]"></div>
              </div>
              <span className="text-caption font-mono font-bold italic text-gray-500 tracking-widest">Neural Link: SECURE</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              aria-label="Refresh Agent Console Data"
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all text-gray-500 shadow-sm"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
        }
      />


      {/* COMMAND NAVIGATION */}
      <div className="flex space-x-2 p-1.5 bg-gray-50 rounded-xl border border-gray-200 w-fit mb-10">
        {[
          { id: 'mesh', label: 'NEURAL_MESH', icon: Bot, aria: "View Neural Agent Mesh" },
          { id: 'intelligence', label: 'INTELLIGENCE_STREAM', icon: Zap, aria: "View Intelligence Stats" },
          { id: 'audit', label: 'IMMUTABLE_LEDGER', icon: Database, aria: "View Audit Ledger" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            aria-label={tab.aria}
            className={`px-6 py-2.5 text-caption font-bold italic tracking-[0.2em] rounded-xl transition-all flex items-center gap-3 ${activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <tab.icon size={14} strokeWidth={2.5} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'mesh' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:border-emerald-500/20 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                  <Cpu size={80} />
                </div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`p-3 rounded-xl bg-gray-50 border border-gray-200 ${agent.color}`}>
                    <Cpu size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-gov-label font-bold italic text-gray-400 tracking-widest mb-1">{agent.model}</span>
                    <span className={`text-caption font-bold italic px-2 py-0.5 rounded-full border ${agent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>{agent.status}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold italic text-gray-900 tracking-tight mb-6 relative z-10">
                  <span className="text-gray-400 mr-2 font-mono">[{agent.id}]</span>
                  {agent.name}
                </h3>
                <div className="space-y-3 relative z-10">
                  <div className="flex items-end justify-between">
                    <span className="text-gov-label text-gray-500 font-bold italic tracking-widest">Cognitive Load</span>
                    <span className="text-xs font-mono font-bold italic text-emerald-500">{agent.load}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden shadow-inner">
                    <div className="bg-emerald-500 h-full transition-all duration-[2000ms] shadow-[0_0_15px_var(--color-success)]" style={{ width: agent.load }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Terminal */}
          <div className="lg:col-span-5 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Terminal size={14} className="text-emerald-500" />
                <h3 className="text-caption font-bold italic text-gray-500 tracking-[0.3em] font-mono">live_stream.sh</h3>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 font-mono text-caption leading-relaxed custom-scrollbar">
              {activity.length === 0 ? (
                <div className="h-full flex items-center justify-center opacity-20 flex-col gap-4">
                  <Activity size={40} className="animate-pulse" />
                  <p className="tracking-[0.5em] text-xs">Waiting for Neural Event...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((log, i) => (
                    <div key={i} className="flex gap-4 group border-l border-gray-200 pl-4 hover:border-emerald-500/30 transition-colors">
                      <span className="text-gray-400 whitespace-nowrap">[{new Date(log.created_at || Date.now()).toLocaleTimeString()}]</span>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-500 font-bold italic tracking-tighter">❯ {log.agent_id}</span>
                          <span className="text-gray-800 font-bold italic tracking-widest text-gov-label">{log.action_type}</span>
                        </div>
                        <div className="text-gray-500 break-all bg-gray-50 p-2 rounded border border-gray-200 group-hover:text-gray-700">
                          {JSON.stringify(log.payload || {})}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'intelligence' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
          <Zap size={48} className="text-[var(--color-info)] animate-pulse" />
          <h2 className="text-2xl font-bold italic text-gray-900 tracking-tighter">Intelligence Engine // Sonnet V4.5</h2>
          <p className="text-gray-500 text-sm max-w-xl leading-relaxed tracking-widest font-bold italic">
            Real-time reasoning over the project ledger. Every query is filtered through the RAG Hybrid pipeline and verified against the Iron Dome financial barrier.
          </p>
          {intelResult && (
            <div className="w-full max-w-2xl bg-gray-50 border border-blue-200 rounded-xl p-6 text-left space-y-3">
              <div className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">Intelligence Core Response</div>
              <p className="text-sm text-gray-700 leading-relaxed">{intelResult.answer}</p>
              {intelResult.citations.length > 0 && (
                <div className="text-caption text-gray-400 font-mono">Citations: {intelResult.citations.join(', ')}</div>
              )}
            </div>
          )}
          {scanResult && (
            <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-emerald-200 rounded-xl p-5 space-y-2">
                <div className="text-caption font-mono font-bold text-emerald-600 uppercase tracking-widest">Risk Engine [P5]</div>
                <div className="text-sm text-gray-700">Projects: <strong>{scanResult.p5?.total_projects ?? '–'}</strong></div>
                <div className="text-sm text-gray-700">Risk Level: <strong>{scanResult.p5?.risk_level ?? '–'}</strong></div>
                <div className="text-sm text-gray-700">Breaches: <strong>{scanResult.p5?.budget_breaches ?? '–'}</strong></div>
              </div>
              <div className="bg-gray-50 border border-blue-200 rounded-xl p-5 space-y-2">
                <div className="text-caption font-mono font-bold text-blue-600 uppercase tracking-widest">Security Guard [S1]</div>
                <div className="text-sm text-gray-700">Integrity: <strong>{scanResult.s1?.integrity_score ?? '–'}%</strong></div>
                <div className="text-sm text-gray-700">Violations: <strong>{scanResult.s1?.violations_detected ?? '–'}</strong></div>
                <div className="text-sm text-gray-700">Critical Alerts: <strong>{scanResult.s1?.critical_alerts ?? '–'}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500">
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-xs font-bold italic text-gray-600 tracking-[0.4em] font-mono flex items-center gap-3">
              <ShieldCheck size={16} className="text-emerald-500" /> Immutable_System_Ledger
            </h3>
            <span className="text-caption font-mono text-gray-500 tracking-widest bg-gray-100 px-3 py-1 rounded-full">{auditLogs.length} Records Identity Verified</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-gov-label font-bold italic text-gray-500 tracking-[0.2em] bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-4 font-mono">Temporal_Signature</th>
                  <th className="px-8 py-4">Actor_ID</th>
                  <th className="px-8 py-4">Action_Node</th>
                  <th className="px-8 py-4 text-right pr-8 font-mono">Ref_Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-500 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-4 text-gray-400 group-hover:text-blue-600 transition-colors">{new Date(log.created_at).toISOString()}</td>
                    <td className="px-8 py-4 font-bold italic text-gray-700 tracking-tighter">{log.actor_id || 'SYSTEM_DAEMON'}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-1 rounded text-gov-label font-bold italic border tracking-widest ${log.action === 'INSERT' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' :
                        log.action === 'UPDATE' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' :
                          'text-rose-500 border-rose-500/20 bg-rose-500/5'
                        }`}>{log.action}</span>
                    </td>
                    <td className="px-8 py-4 text-right pr-8 text-gray-400 group-hover:text-gray-600">{(log.entity_id || '0000').substring(0, 12)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-8 relative overflow-hidden">
          <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/5" />
          <p className="text-gray-500 text-caption font-bold italic tracking-[0.2em] mb-2">Total Operations</p>
          <h4 className="text-4xl font-bold italic text-gray-900 tracking-tighter font-mono">1,402</h4>
          <p className="text-emerald-500 text-caption font-bold italic mt-4 tracking-widest">↑ 12% VELOCITY INCREASE</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <p className="text-gray-500 text-caption font-bold italic tracking-[0.2em] mb-2">Success Rate</p>
          <h4 className="text-4xl font-bold italic text-gray-900 tracking-tighter font-mono">99.8%</h4>
          <div className="flex items-center space-x-2 mt-4 text-gray-500">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span className="text-gov-label font-bold italic tracking-widest">Exceeding SLA Baseline</span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <p className="text-gray-500 text-caption font-bold italic tracking-[0.2em] mb-2">Avg Latency</p>
          <h4 className="text-4xl font-bold italic text-gray-900 tracking-tighter font-mono">142ms</h4>
          <div className="flex items-center space-x-2 mt-4 text-gray-500">
            <Activity size={12} className="text-emerald-500" />
            <span className="text-gov-label font-bold italic tracking-widest">Optimal Node Response</span>
          </div>
        </div>
      </div>

    </div>
  );
};
