import React from 'react';
import { ProgressBar } from './ProgressBar';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

interface RiskLevel {
  level: 'critical' | 'warning' | 'nominal' | 'success';
  count: number;
  percentage: number;
}

interface SystemRiskCommandProps {
  riskLevels?: RiskLevel[];
  systemStatus?: string;
  liveSignals?: string;
}

const defaultRiskLevels: RiskLevel[] = [
  { level: 'critical', count: 0, percentage: 0 },
  { level: 'warning', count: 0, percentage: 0 },
  { level: 'nominal', count: 0, percentage: 100 },
  { level: 'success', count: 0, percentage: 0 },
];

export function SystemRiskCommand({
  riskLevels = defaultRiskLevels,
  systemStatus = 'System Nominal',
  liveSignals = 'No Active Hazards',
}: SystemRiskCommandProps) {
  return (
    <Card variant="elevated" padding="md" className="w-full">
      <CardHeader>
        <CardTitle>System Risk Command</CardTitle>
        <div className="text-sm font-medium text-[var(--brand-accent)]">{systemStatus}</div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar - Primary Risk Indicator */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-text-primary">Risk Level</div>
          <ProgressBar
            percentage={
              riskLevels.find((r) => r.level === 'nominal')?.percentage || 100
            }
            status="nominal"
            size="lg"
            showLabel={true}
          />
        </div>

        {/* Risk Distribution Grid */}
        <div className="grid grid-cols-4 gap-4">
          {riskLevels.map((risk) => (
            <div
              key={risk.level}
              className="p-3 rounded-lg bg-bg-surface border border-[var(--brand-accent)]"
            >
              <div className="text-xs font-medium text-text-secondary capitalize mb-1">
                {risk.level}
              </div>
              <div className="text-lg font-bold text-text-primary">{risk.count}</div>
            </div>
          ))}
        </div>

        {/* Live Signals Status */}
        <div className="p-4 rounded-lg bg-teal-50 border border-[var(--brand-accent)]">
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
            Live Signals
          </div>
          <div className="text-sm text-text-primary">{liveSignals}</div>
        </div>
      </CardContent>
    </Card>
  );
}
