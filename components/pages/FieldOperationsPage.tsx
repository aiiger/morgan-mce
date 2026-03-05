import React, { useState } from 'react';
import {
    Wind, CloudRain, Sun, Users, Hammer, HardHat, ShieldCheck,
    Activity, AlertTriangle, CheckCircle2, MoreVertical,
    Thermometer, Droplets, ArrowUpRight, Zap, Info, Plus, Loader2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { useFieldData } from '../../hooks/useFieldData';

interface FieldOperationsPageProps {
    projects: any[];
    onNavigate?: (view: string) => void;
}

import { PageHeader } from '../ui/PageHeader';

export const FieldOperationsPage: React.FC<FieldOperationsPageProps> = ({ projects, onNavigate }) => {

    const [selectedSite, setSelectedSite] = useState<string>('all');
    const { weather, manpower, activities, observations, ltiHours, loading } = useFieldData(null);

    if (loading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
                <p className="text-caption font-bold italic text-gray-500 tracking-widest">Syncing Field Intelligence...</p>
            </div>
        );
    }

    // Fallback defaults if DB is empty
    const temp = weather?.temp ?? '--';
    const wind = weather?.wind ?? '--';
    const humid = weather?.humidity ?? '--';
    const mpTotal = manpower?.total ?? 0;

    return (
        <div className="page-container space-y-8 pb-32">
            <PageHeader 
                title="Site Command Center"
                subtitle="Field Intelligence // Operational Recon"
                actions={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-caption font-mono font-bold italic text-gray-500 tracking-widest">Live Feed Active</span>
                        </div>
                        <button className="bg-white text-black px-6 py-2 rounded-xl text-caption font-bold italic tracking-wider hover:bg-zinc-200 transition-all flex items-center shadow-lg active:scale-95">
                            <Plus size={14} className="mr-2" strokeWidth={3} />
                            Log Site Event
                        </button>
                    </div>
                }
            />


            {/* 2. Field Intelligence Strip */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-8 py-6 flex flex-wrap items-center justify-between gap-8">
                <div className="flex items-center gap-16 w-full justify-between">
                    {[
                        { label: 'Active Personnel', val: mpTotal.toString(), unit: 'Operatives', icon: Users, color: 'text-blue-400' },
                        { label: 'Site Conditions', val: `${temp}°C`, unit: weather?.summary || 'N/A', icon: Sun, color: 'text-amber-400' },
                        { label: 'Safety Index', val: '99.8', unit: 'LTI Free', icon: ShieldCheck, color: 'text-emerald-400' },
                        { label: 'Productivity', val: '92%', unit: 'Efficiency', icon: Zap, color: 'text-purple-400' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 group cursor-help">
                            <div className={`w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon size={18} strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-gov-label font-bold italic text-gray-500 tracking-[0.2em] mb-1">{item.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold italic text-gray-900 font-mono tracking-tighter">{item.val}</span>
                                    <span className="text-caption font-bold italic text-gray-500 tracking-wider">{item.unit}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Main Bento Grid */}
            <div className="grid grid-cols-12 gap-6">

                {/* A. Weather Command (Col 4) */}
                <div className="col-span-12 md:col-span-4 bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between group hover:border-gray-300 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                        <CloudRain size={80} />
                    </div>
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-caption font-bold italic text-gray-500 tracking-[0.2em] opacity-80">Environmental Recon</span>
                            <div className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-gov-label font-bold italic text-amber-500 tracking-wider">Warning</div>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-5xl font-bold italic text-gray-900 tracking-tighter">{temp}°</span>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold italic text-gray-600 tracking-widest">Abu Dhabi</span>
                                <span className="text-caption text-gray-400 font-mono">Real-time Telemetry</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {[
                            { l: 'Wind', v: `${wind}km/h`, i: Wind },
                            { l: 'Humid', v: `${humid}%`, i: Droplets },
                            { l: 'UV', v: 'High', i: Sun }
                        ].map((w, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
                                <w.i size={12} className="mx-auto mb-1 text-gray-500" />
                                <div className="text-gov-label font-bold italic text-gray-500">{w.l}</div>
                                <div className="text-caption font-bold italic text-gray-900 font-mono">{w.v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* B. Safety Command (Col 4) */}
                <div className="col-span-12 md:col-span-4 bg-emerald-50 border border-emerald-200 rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <span className="text-caption font-bold italic text-emerald-500 tracking-[0.2em]">Safety Command</span>
                            <ShieldCheck size={16} className="text-emerald-500 animate-pulse" />
                        </div>

                        <div className="text-center py-4">
                            <div className="text-caption font-bold italic text-gray-500 tracking-[0.3em] mb-2">LTI Free Manhours</div>
                            <div className="text-5xl font-bold italic text-emerald-600 tracking-tight font-mono">
                                {ltiHours.toLocaleString()}
                            </div>
                            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-gov-label font-bold italic text-emerald-400 tracking-widest">Target: 150,000</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* C. Manpower Grid (Col 4) */}
                <div className="col-span-12 md:col-span-4 bg-white border border-gray-200 rounded-xl p-6 flex flex-col relative">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-caption font-bold italic text-gray-500 tracking-[0.2em] opacity-80">Resource Deployment</span>
                        <MoreVertical size={14} className="text-gray-400 hover:text-gray-900 cursor-pointer" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {[
                            { l: 'Civil Works', v: manpower?.civil.present || 0, t: manpower?.civil.planned || 0, c: 'bg-blue-500' },
                            { l: 'MEP Services', v: manpower?.mep.present || 0, t: manpower?.mep.planned || 0, c: 'bg-purple-500' },
                            { l: 'Management', v: manpower?.management.present || 0, t: manpower?.management.planned || 0, c: 'bg-gray-400' }
                        ].map((r, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-caption font-bold italic text-gray-500 tracking-wider">{r.l}</span>
                                    <span className="text-gov-label font-mono font-bold italic text-gray-900">{r.v}<span className="text-gray-400">/{r.t}</span></span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div style={{ width: `${r.t ? (r.v / r.t) * 100 : 0}%` }} className={`h-full ${r.c} rounded-full opacity-80 group-hover:opacity-100 transition-opacity relative`}>
                                        <div className="absolute inset-0 bg-white/20"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-gov-label font-bold italic text-gray-500 tracking-widest">Total Deployment</span>
                        <span className="text-lg font-bold italic text-gray-900 font-mono">{mpTotal}</span>
                    </div>
                </div>

                {/* D. Activity Feed (Col 8) */}
                <div className="col-span-12 md:col-span-8 bg-white border border-gray-200 rounded-xl p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-caption font-bold italic text-gray-500 tracking-[0.2em] opacity-80">Site Activity Log</h3>
                        <div className="flex gap-2">
                            {['Logs', 'Incidents', 'Deliveries'].map(t => (
                                <button key={t} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-gov-label font-bold italic text-gray-500 hover:text-gray-900 tracking-wider transition-all">
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-[19px] before:w-px before:bg-gray-200">
                        {activities.map((item, i) => (
                            <div key={i} className="flex gap-6 relative group">
                                <div className={`w-10 h-10 rounded-full border border-gray-200 bg-white z-10 flex items-center justify-center shrink-0 text-gray-500 group-hover:scale-110 transition-transform`}>
                                    <Activity size={16} />
                                </div>
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-gov-label font-bold italic tracking-widest text-blue-600`}>{item.activity_type}</span>
                                            <span className="text-gov-label font-bold italic text-gray-400 tracking-wider">• {item.user_name}</span>
                                        </div>
                                        <span className="text-caption font-mono font-bold italic text-gray-400">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <h4 className="text-sm font-bold italic text-gray-700 mb-1">{item.title}</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* E. Observations Feed (Col 4) */}
                <div className="col-span-12 md:col-span-4 bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-caption font-bold italic text-gray-500 tracking-[0.2em] opacity-80">HSE Observations</span>
                        <span className="bg-emerald-500/10 text-emerald-500 text-gov-label font-bold italic px-2 py-0.5 rounded border border-emerald-500/20 tracking-wider">+{observations.length} Today</span>
                    </div>

                    <div className="space-y-3">
                        {observations.map((obs, i) => {
                            const isPos = obs.incident_type === 'POSITIVE';
                            return (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        {isPos ?
                                            <CheckCircle2 size={14} className="text-emerald-500" /> :
                                            <AlertTriangle size={14} className="text-rose-500" />
                                        }
                                        <div>
                                            <p className="text-caption font-bold italic text-gray-700 leading-tight truncate max-w-[150px]">{obs.description}</p>
                                            <p className="text-gov-label font-bold italic text-gray-400 tracking-wider mt-0.5">{new Date(obs.reported_at).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                </div>
                            );
                        })}
                    </div>

                    <button className="w-full mt-6 py-3 border border-gray-200 rounded-lg text-caption font-bold italic text-gray-500 tracking-[0.2em] hover:bg-gray-50 transition-all hover:text-gray-900">
                        View All Observations
                    </button>
                </div>

            </div>
        </div>
    );
};

