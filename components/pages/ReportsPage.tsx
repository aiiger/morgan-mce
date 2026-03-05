import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, Zap, TrendingUp, Calendar, ChevronDown, Database, Globe, Clock, BarChart3, CheckCircle2 } from 'lucide-react';
import { safeExportToCSV, exportToHTML } from '../../utils/exportUtils';
import { useReports, ReportProfile, ReportSource } from '../../hooks/useReports';
import { Box, Text, Card, Button } from '../../components/primitives';
import { cn } from '@/lib/utils';
import { DashboardFrame } from '../governance/DashboardFrame';
import { MetricBlock } from '../governance/MetricBlock';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';

/**
 * ReportsPage - HARMONIZED 2026 (GOLDEN STATE)
 * Intelligence Hub | High-End Visuals | Blue Frame integration
 */
export const ReportsPage: React.FC = () => {
  const [source, setSource] = useState<ReportSource>('PROJECTS');
  const [profile, setProfile] = useState<ReportProfile>('Executive');
  const [groupBy, setGroupBy] = useState<'Platform' | 'Location' | 'Day' | undefined>(undefined);

  const { data, isLoading } = useReports({ source, profile, groupBy });

  const reportProfiles: { id: ReportProfile; label: string; icon: any; desc: string; color: string }[] = [
    { id: 'Executive', label: 'Executive Summary', icon: TrendingUp, desc: 'Key performance & health vectors', color: 'from-blue-600 to-blue-500' },
    { id: 'Standard', label: 'Standard Breakdown', icon: BarChart3, desc: 'Tactical operational overview', color: 'from-emerald-600 to-emerald-500' },
    { id: 'Depth', label: 'Depth Analysis', icon: Zap, desc: 'Technical high-fidelity audit', color: 'from-violet-600 to-violet-500' },
    { id: 'Audit', label: 'Compliance Audit', icon: Calendar, desc: 'Full registry validation trail', color: 'from-amber-600 to-amber-500' },
  ];

  const chartData = useMemo(() => [
    { name: 'Node 01', value: 400, trend: 240 },
    { name: 'Node 02', value: 300, trend: 139 },
    { name: 'Node 03', value: 200, trend: 980 },
    { name: 'Node 04', value: 278, trend: 390 },
    { name: 'Node 05', value: 189, trend: 480 },
  ], []);

  const handleExport = (format: 'CSV' | 'HTML') => {
    if (!data) return;
    const exportData = Array.isArray(data) ? data : Object.values(data).flat();
    const filename = `MCE_${source}_${profile}_REPORT`;
    if (format === 'CSV') safeExportToCSV(exportData, filename);
    else exportToHTML(exportData, filename, { source, profile });
  };

  const renderRows = (items: any[]) => {
    return (
      <div className="divide-y divide-[var(--surface-border)]">
        {items.map((item, idx) => {
          const values = Object.entries(item).filter(([k]) => k !== '_audit' && k !== 'id');
          return (
            <div key={idx} className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-[var(--brand-accent)]/[0.03] group transition-all">
              {values.map(([key, val], i) => (
                <div key={key} className={cn(i === 0 ? "col-span-4" : "col-span-2", i === values.length - 1 && "text-right")}>
                  <Text className={cn(
                    "font-oswald italic uppercase",
                    i === 0 ? "text-gov-body font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-accent)]" : "text-gov-label text-[var(--text-tertiary)]"
                  )}>
                    {String(val)}
                  </Text>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardFrame
      title="Intelligence Hub"
      loading={isLoading}
      metrics={
        <>
          <MetricBlock label="Active Records" value={Array.isArray(data) ? data.length : 0} trend={{ value: 12, type: 'up' }} />
          <MetricBlock label="Health Index" value="98.2%" trend={{ value: 0.4, type: 'up' }} />
          <MetricBlock label="Registry Sync" value="Optimal" />
          <MetricBlock label="Export Density" value="High" />
        </>
      }
      tabs={
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-1 bg-[var(--bg-layer)]/40 rounded-xl border border-[var(--surface-border)]">
          <div className="flex items-center gap-2 p-1 bg-white border border-[var(--surface-border)] rounded-lg">
            {(['PROJECTS', 'TENDERS', 'FINANCIALS'] as ReportSource[]).map(s => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={cn(
                  "px-4 py-1.5 rounded text-caption font-bold tracking-widest transition-all",
                  source === s ? "bg-[var(--brand-accent)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 pr-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--brand-accent)] transition-colors" size={14} />
              <input
                type="text"
                placeholder="REPORT QUERY..."
                className="bg-white border border-[var(--surface-border)] rounded-lg pl-9 pr-4 py-2 text-caption font-bold italic font-oswald text-[var(--text-primary)] w-48 focus:outline-none focus:border-[var(--brand-accent)]/30 transition-all placeholder:text-[var(--text-tertiary)]/40"
              />
            </div>
            <button onClick={() => handleExport('HTML')} className="px-4 py-2 rounded-lg text-gov-label font-bold italic tracking-widest bg-[var(--brand-accent)] text-white uppercase shadow-lg">
              Generate Report
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-8 p-8 bg-[var(--bg-surface)]">
        
        {/* 1. Tactical Visualizations Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-8 h-[350px] bg-white border-[4px] border-[var(--brand-accent)] shadow-2xl relative overflow-hidden" padding="none">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--brand-accent)]" />
            <div className="p-6 border-b border-[var(--surface-border)] flex justify-between items-center">
              <Text className="text-caption font-bold tracking-[0.2em] text-[var(--brand-accent)]">Temporal Velocity Analytics</Text>
              <TrendingUp size={14} className="text-[var(--brand-accent)] opacity-40" />
            </div>
            <div className="p-6 h-[calc(100%-60px)]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--brand-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'var(--text-tertiary)'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'var(--text-tertiary)'}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="value" stroke="var(--brand-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-4 h-[350px] bg-white border border-[var(--surface-border)] shadow-sm relative overflow-hidden" padding="none">
            <div className="p-6 border-b border-[var(--surface-border)] flex justify-between items-center bg-[var(--bg-layer)]/30">
              <Text className="text-caption font-bold tracking-[0.2em] text-[var(--text-tertiary)]">Portfolio Distribution</Text>
              <BarChart3 size={14} className="text-[var(--text-tertiary)] opacity-40" />
            </div>
            <div className="p-6 h-[calc(100%-60px)]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--brand-accent)' : 'var(--mce-teal-soft)'} />
                    ))}
                  </Bar>
                  <Tooltip cursor={{fill: 'transparent'}} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 2. Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reportProfiles.map(p => (
            <button
              key={p.id}
              onClick={() => { setProfile(p.id); setGroupBy(undefined); }}
              className={cn(
                "relative flex flex-col p-6 rounded-xl border-2 transition-all duration-300 text-left group",
                profile === p.id 
                  ? "bg-white border-[var(--brand-accent)] shadow-xl -translate-y-1" 
                  : "bg-white border-[var(--surface-border)] hover:border-[var(--brand-accent)]/30"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center border mb-4 transition-all",
                profile === p.id ? "bg-[var(--brand-accent)] border-none text-white shadow-lg shadow-[var(--brand-accent)]/20" : "bg-[var(--bg-layer)] border-[var(--surface-border)] text-[var(--brand-accent)]"
              )}>
                <p.icon size={14} />
              </div>
              <Text className={cn(
                "text-gov-label font-bold tracking-wider mb-1",
                profile === p.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
              )}>{p.label}</Text>
              <Text className="text-gov-label text-[var(--text-tertiary)] leading-snug">{p.desc}</Text>
            </button>
          ))}
        </div>

        {/* 3. Output Table */}
        <Card className="bg-white border border-[var(--surface-border)] shadow-sm overflow-hidden" padding="none">
          <div className="px-8 py-4 bg-[var(--bg-layer)]/30 border-b border-[var(--surface-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-[var(--brand-accent)]" />
              <Text className="text-caption font-bold tracking-[0.2em] text-[var(--text-primary)]">Unified_Registry_Output</Text>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <Text className="text-gov-label font-bold text-emerald-600 uppercase">Verified Records Ready</Text>
            </div>
          </div>
          
          <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-[var(--brand-accent)] border-b border-white/10">
              <div className="col-span-4"><Text className="text-gov-label font-bold text-white opacity-60">Identity Vector</Text></div>
              <div className="col-span-2"><Text className="text-gov-label font-bold text-white opacity-60">Metric A</Text></div>
              <div className="col-span-2"><Text className="text-gov-label font-bold text-white opacity-60">Metric B</Text></div>
              <div className="col-span-2"><Text className="text-gov-label font-bold text-white opacity-60">Status</Text></div>
              <div className="col-span-2 text-right"><Text className="text-gov-label font-bold text-white opacity-60">Valuation</Text></div>
            </div>
            
            <div className="min-h-[300px]">
              {data ? renderRows(Array.isArray(data) ? data : Object.values(data).flat()) : (
                <div className="flex items-center justify-center p-20 opacity-30 italic text-sm">No registry entries detected.</div>
              )}
            </div>
          </div>
        </Card>

      </div>
    </DashboardFrame>
  );
};