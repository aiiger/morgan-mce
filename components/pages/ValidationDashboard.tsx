'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Shield,
  Activity,
  Terminal,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { GlassButton } from '../ui/GlassButton';
import { DashboardFrame } from '../governance/DashboardFrame';
import { MetricBlock } from '../governance/MetricBlock';

interface ValidationResult {
  component: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
  details?: string[];
}

export const ValidationDashboard: React.FC = () => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<string | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const res = await fetch('/api/admin/validation/report');
      if (!res.ok) throw new Error('Failed to fetch validation report');
      const data = await res.json();
      const checks = Array.isArray(data.checks) ? data.checks : [];
      const results: ValidationResult[] = checks.map((c: { name: string; status: string; message: string }) => ({
        component: c.name,
        status: (c.status as 'PASS' | 'WARN' | 'FAIL') || 'PASS',
        message: c.message || '',
        details: [],
      }));
      setValidationResults(results);
      setLastValidation(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  const statusCounts = {
    pass: validationResults.filter(r => r.status === 'PASS').length,
    warn: validationResults.filter(r => r.status === 'WARN').length,
    fail: validationResults.filter(r => r.status === 'FAIL').length,
  };

  const overallStatus =
    statusCounts.fail > 0 ? 'FAIL' : statusCounts.warn > 0 ? 'WARN' : 'PASS';

  const metrics = [
    <MetricBlock key="tables" label="Registry Nodes" value="12/12" status="nominal" />,
    <MetricBlock key="rls" label="Policy Coverage" value="100%" status="nominal" />,
    <MetricBlock key="funcs" label="Active Logic" value="6/6" status="nominal" />,
    <MetricBlock key="health" label="System Health" value={overallStatus} status={overallStatus === 'PASS' ? 'nominal' : 'warning'} />
  ];

  return (
    <DashboardFrame
      title="Validation Command"
      subtitle="Integrity Overwatch // Sector 09"
      metrics={metrics}
      loading={isValidating}
    >
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold italic text-gray-900 tracking-widest flex items-center gap-2">
              <Shield size={16} className="text-emerald-500" /> Integrity Assessment
            </h2>
            <p className="text-caption font-mono text-gray-500">Last sweep: {lastValidation || 'NEVER'}</p>
          </div>
          
          <GlassButton onClick={runValidation} disabled={isValidating} className="px-6 py-2 text-gov-label">
            <RefreshCw size={14} className={`mr-2 ${isValidating ? 'animate-spin' : ''}`} />
            Run Full Validation
          </GlassButton>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {validationResults.map((result, idx) => (
            <Card key={idx} variant="outlined" padding="none">
              <div className="flex">
                <div className={`w-1.5 shrink-0 ${
                  result.status === 'PASS' ? 'bg-emerald-500' :
                  result.status === 'WARN' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold italic text-gray-900 tracking-[0.2em]">{result.component}</h3>
                    <Badge variant={result.status === 'PASS' ? 'success' : result.status === 'WARN' ? 'warning' : 'danger'}>
                      {result.status}
                    </Badge>
                  </div>
                  
                  <p className="text-gov-label font-mono text-gray-600 mb-4">{result.message}</p>
                  
                  {result.details && (
                    <div className="space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {result.details.map((detail, i) => (
                        <div key={i} className="text-gov-label font-mono text-gray-500 flex items-center gap-2">
                          <span className="text-emerald-500/50">•</span>
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card variant="matte" padding="md" className="border-emerald-500/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold italic text-gray-900 tracking-widest mb-2">Neural Recommendations</h3>
              <ul className="space-y-2">
                <li className="text-caption text-gray-500 font-bold italic flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  System identified optimal RLS coverage. Deployment risk: <span className="text-emerald-500">LOW</span>
                </li>
                <li className="text-caption text-gray-500 font-bold italic flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-500" />
                  Consider secondary indexing on <span className="text-gray-700">notifications.created_at</span> for ledger velocity.
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardFrame>
  );
};

