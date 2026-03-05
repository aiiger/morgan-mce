import React from 'react';
import { AlertOctagon, ShieldAlert } from 'lucide-react';

interface RiskHeatmapProps {
  projects: any[];
  onSelectProject: (id: string | null) => void;
  riskDistribution?: {
    critical: number;
    high: number;
    nominal: number;
    stable: number;
  };
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ projects, onSelectProject, riskDistribution }) => {
  const calculatedDistribution = React.useMemo(() => {
    if (riskDistribution) return riskDistribution;
    return projects.reduce((acc, p) => {
      const risk = p.delivery_risk_rating?.toLowerCase() || 'nominal';
      if (risk === 'critical' || p.flag_for_ceo_attention) acc.critical++;
      else if (risk === 'high') acc.high++;
      else if (risk === 'nominal') acc.nominal++;
      else acc.stable++;
      return acc;
    }, { critical: 0, high: 0, nominal: 0, stable: 0 });
  }, [projects, riskDistribution]);

  const counts = calculatedDistribution;
  const total = counts.critical + counts.high + counts.nominal + counts.stable || 1;

  const getWidth = (val: number) => `${(val / total) * 100}%`;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <AlertOctagon size={16} className="text-gray-500 opacity-60" strokeWidth={1.5} />
        <h3 className="text-xs font-bold italic text-gray-500">Strategic Risk Heatmap</h3>
      </div>

      {/* Distribution Bars - Stacked */}
      <div className="space-y-8">
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden flex shadow-inner">
          <div className="bg-rose-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.3)] opacity-95" style={{ width: getWidth(counts.critical) }}></div>
          <div className="bg-amber-500 h-full transition-all duration-1000 opacity-80" style={{ width: getWidth(counts.high) }}></div>
          <div className="bg-gray-400 h-full transition-all duration-1000 opacity-60" style={{ width: getWidth(counts.nominal) }}></div>
          <div className="bg-[var(--color-success)] h-full transition-all duration-1000 opacity-40" style={{ width: getWidth(counts.stable) }}></div>
        </div>

        {/* Dynamic Metric Display */}
        <div className="grid grid-cols-4 gap-6 px-1">
          <div className="text-center group">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>
              <span className="text-xs font-bold italic text-gray-500 opacity-60">Critical</span>
            </div>
            <p className="text-2xl font-bold italic text-gray-900 tabular-nums tracking-tighter">{counts.critical}</p>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-xs font-bold italic text-gray-500 opacity-60">High</span>
            </div>
            <p className="text-2xl font-bold italic text-gray-900 tabular-nums tracking-tighter">{counts.high}</p>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span className="text-xs font-bold italic text-gray-500 opacity-60">Nominal</span>
            </div>
            <p className="text-2xl font-bold italic text-gray-900 tabular-nums tracking-tighter">{counts.nominal}</p>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[var(--color-success)]"></div>
              <span className="text-xs font-bold italic text-gray-500 opacity-60">Stable</span>
            </div>
            <p className="text-2xl font-bold italic text-gray-900 tabular-nums tracking-tighter">{counts.stable}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
