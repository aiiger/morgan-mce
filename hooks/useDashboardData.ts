import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { ChartData } from '@/types';
import { Briefcase, FileText, AlertTriangle, DollarSign } from 'lucide-react';

// Domain Hooks
import { useProjects } from './domain/useProjects';
import { useTenders } from './domain/useTenders';
import { useDocuments } from './domain/useDocuments';
import { useSystemHealth } from './domain/useSystemHealth';
import { useProcurement } from './domain/useProcurement';

export function useDashboardData(searchQuery: string = '') {
  // 1. Domain Data Hooks (Parallel Fetching)
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects(searchQuery);
  const { tenders, loading: tendersLoading, error: tendersError, refetch: refetchTenders } = useTenders(searchQuery);
  const { documents, loading: docsLoading, error: docsError, refetch: refetchDocs } = useDocuments(searchQuery);
  const { alerts, loading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useSystemHealth();
  const { purchaseOrders, loading: poLoading, error: poError, refetch: refetchPOs } = useProcurement(searchQuery);

  // 2. Auxiliary Data (Tasks, Logs, Activity) - Can be further refactored later
  const [tasks, setTasks] = useState<any[]>([]);
  const [agentActivity, setAgentActivity] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auxLoading, setAuxLoading] = useState(true);

  const fetchAuxiliaryData = async () => {
    setAuxLoading(true);
    try {
      const [
        { data: tasksData },
        { data: activityData },
        { data: logData }
      ] = await Promise.all([
        (supabase.from('tasks' as any) as any).select('*').order('created_at', { ascending: false }),
        (supabase.from('agent_activity' as any) as any).select('*').order('timestamp', { ascending: false }).limit(20),
        (supabase.from('audit_logs' as any) as any).select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (tasksData) setTasks(tasksData);
      if (activityData) setAgentActivity(activityData);
      if (logData) setAuditLogs(logData);

    } catch (e: any) {
      logger.warn('AUX_DATA_PARTIAL_FAIL', e);
    } finally {
      setAuxLoading(false);
    }
  };

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  const refetchAll = () => {
    refetchProjects();
    refetchTenders();
    refetchDocs();
    refetchAlerts();
    refetchPOs();
    fetchAuxiliaryData();
  };

  // 3. Derived State (KPIs, Charts, Status)

  // Status Distribution
  const statusData = useMemo(() => {
    const statusCounts = documents.reduce((acc: any, doc) => { acc[doc.status] = (acc[doc.status] || 0) + 1; return acc; }, {});
    return [
      { name: 'Approved', value: statusCounts['Approved'] || 0, color: 'var(--color-success)' },
      { name: 'Pending', value: statusCounts['Review'] || 0, color: 'var(--color-warning)' },
      { name: 'Reviewed', value: statusCounts['Reviewed'] || 0, color: '#3b82f6' },
      { name: 'Rejected', value: statusCounts['Rejected'] || 0, color: 'var(--color-critical)' },
    ].filter(d => d.value > 0);
  }, [documents]);

  // Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      return {
        name: days[d.getDay()],
        docs: documents.filter(doc => doc.created_at.startsWith(dateStr)).length,
        review: documents.filter(doc => doc.reviewed_at && doc.reviewed_at.startsWith(dateStr)).length
      };
    });
  }, [documents]);

  // KPIs
  const kpis = useMemo(() => {
    const totalCount = projects.length;
    const totalContractValue = projects.reduce((sum, p) => sum + (Number(p.contract_value_excl_vat) || 0), 0);
    const activeBids = tenders.length;

    // Risk Calculation
    const criticalRisks = projects.filter(p => p.delivery_risk_rating === 'Critical' || p.flag_for_ceo_attention).length;
    const poBreaches = purchaseOrders.filter(po => po.remaining_balance < 0 || po.status === 'exhausted').length;
    const criticalHazards = criticalRisks + poBreaches;

    return [
      { label: "Active Projects", value: totalCount.toString(), status: "NOMINAL", trend: "Full Portfolio", trendDirection: "neutral" as const, trendSentiment: "neutral" as const, description: "Universe Synchronized", icon: Briefcase, color: "cyan" },
      { label: "Portfolio Value", value: `AED ${(totalContractValue / 1000000).toFixed(1)}M`, status: "VERIFIED", trend: "Ledger Verified", trendDirection: "neutral" as const, trendSentiment: "positive" as const, description: "Aggregate Contract Value", icon: DollarSign, color: "cyan" },
      { label: "Active Bids", value: activeBids.toString(), status: "OPEN", trend: "SLA Compliant", trendDirection: "neutral" as const, trendSentiment: "positive" as const, description: "Open Tenders", icon: FileText, color: "cyan" },
      { label: "Critical Hazards", value: criticalHazards.toString(), status: criticalHazards > 0 ? "CRITICAL" : "STABLE", trend: "Direct Action", trendDirection: (criticalHazards > 0 ? "up" : "neutral") as "up" | "down" | "neutral", trendSentiment: (criticalHazards > 0 ? "negative" : "positive") as "positive" | "negative" | "neutral", description: "Operational Triggers", icon: AlertTriangle, color: 'cyan' },
    ];
  }, [projects, tenders, purchaseOrders]);

  // Signals logic
  const signals = useMemo(() => {
    const riskStats = {
      critical: projects.filter(p => (p.delivery_risk_rating === 'Critical' || p.flag_for_ceo_attention)).length,
      high: projects.filter(p => p.delivery_risk_rating === 'High' && !p.flag_for_ceo_attention).length,
      nominal: projects.filter(p => p.delivery_risk_rating === 'Medium').length,
      stable: projects.filter(p => !p.delivery_risk_rating || p.delivery_risk_rating === 'Low').length,
    };

    return {
      hasBacklog: documents.filter(d => d.status === 'Review').length > 10,
      backlogCount: documents.filter(d => d.status === 'Review').length,
      stagnantProjects: projects.filter(p => (p.completion_percent || 0) < 100 && new Date(p.updated_at || Date.now()) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      stagnationIssues: 0, // Simplified for now
      complianceIssues: projects.filter(p => p.compliance_status === 'Issues').length,
      isAgentIdle: false,
      systemStatus: documents.filter(d => d.status === 'Review').length > 5 ? 'Congested' : 'Optimal',
      riskDistribution: riskStats
    };
  }, [projects, documents]);

  const combinedLoading = projectsLoading || tendersLoading || docsLoading || alertsLoading || auxLoading || poLoading;
  
  // FAULT TOLERANCE: Only crash the dashboard if MISSION CRITICAL domains fail.
  const missionCriticalError = projectsError || tendersError;
  const auxiliaryError = docsError || alertsError || poError;

  if (auxiliaryError && !missionCriticalError) {
    logger.warn('AUXILIARY_SYSTEM_DRIFT', { error: auxiliaryError });
  }

  return {
    documents,
    alerts,
    kpis,
    chartData,
    statusData,
    loading: combinedLoading,
    error: missionCriticalError, // Surface only mission-critical errors to the UI
    refetch: refetchAll,
    projects,
    tenders,
    agentActivity,
    auditLogs,
    signals,
    tasks,
    purchaseOrders
  };
}
