import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, X, Share2, CheckCircle2, Calendar, DollarSign, Edit2, Check, Activity, Clock, ShieldAlert, Building2, MapPin, Receipt, TrendingUp, AlertTriangle, Users, FileText } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Watermark } from '../Watermark';
import { useSupabase } from '../../hooks/useSupabase';
import { GlassPanel } from '../ui/GlassPanel';
import { GlassButton } from '../ui/GlassButton';
import { GlassInput } from '../ui/GlassInput';
import { ProjectTimeline } from './ProjectTimeline';
import { FinancialSummary } from './FinancialSummary';
import { Badge } from '../ui/Badge';
import { Text } from '../primitives';
import { workflowEngine, WorkflowAction, normalizeProjectStatus } from '../../utils/workflow';
import { RagSyncButton } from '../ai/RagSyncButton';
import { useToast } from '@/lib/toast-context';
import { logger } from '../../lib/logger';
import { LaserProgress } from '../ui/LaserProgress';
import { ProjectPulse } from './ProjectPulse';
import { clsx } from 'clsx';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const { user } = useUser();
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'team' | 'documents' | 'risks' | 'compliance'>('overview');
  const [editedProject, setEditedProject] = useState<any>(null);
  const toast = useToast();

  const [availableActions, setAvailableActions] = useState<WorkflowAction[]>([]);
  const [processingAction, setProcessingAction] = useState<WorkflowAction | null>(null);
  const [risks, setRisks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [projectDocs, setProjectDocs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  const { getClient } = useSupabase();

  const fetchProject = useCallback(async () => {
    const client = await getClient();
    const { data } = await (client
      .from('projects_master' as any) as any)
      .select('*')
      .eq('id', projectId)
      .single();

    if (data) {
      setProject(data);
      const actions = workflowEngine.getAvailableActions('project', normalizeProjectStatus(data.project_status || ''));
      setAvailableActions(actions);
    }

    // Fetch milestones from API
    const msRes = await fetch(`/api/morgan/milestones?project_id=${projectId}`);
    const msData = msRes.ok ? await msRes.json() : { milestones: [] };
    setMilestones((msData.milestones || []).map((m: any) => ({
      id: m.id,
      title: m.title || m.name || 'Untitled',
      date: m.due_date || m.date || '',
      status: m.status || 'Pending',
    })));

    setLoading(false);
  }, [projectId, getClient]);

  useEffect(() => {
    fetchProject();
    fetch(`/api/morgan/risks?project_id=${projectId}`)
      .then(r => r.ok ? r.json() : { risks: [] })
      .then(d => setRisks(d.risks || []))
      .catch(() => {});
    fetch(`/api/resources/team-members`)
      .then(r => r.ok ? r.json() : { members: [] })
      .then(d => setTeamMembers(d.members || d.teamMembers || []))
      .catch(() => {});
    fetch(`/api/morgan/documents?project_id=${projectId}`)
      .then(r => r.ok ? r.json() : { documents: [] })
      .then(d => setProjectDocs(d.documents || []))
      .catch(() => {});
    fetch(`/api/morgan/invoices?project_id=${projectId}`)
      .then(r => r.ok ? r.json() : { invoices: [] })
      .then(d => setInvoices(d.invoices || []))
      .catch(() => {});
  }, [fetchProject, projectId]);

  const handleTransition = async (action: WorkflowAction) => {
    const prevStatus = project.project_status;
    setProcessingAction(action);

    const normalizedCurrent = normalizeProjectStatus(project.project_status || '');
    const def = workflowEngine.getDefinition('project');
    const targetTransition = def.transitions.find(t => t.from === normalizedCurrent && t.action === action);
    const targetLabel = targetTransition?.to ?? action.toUpperCase();

    const transitionNotes = action === 'reject'
      ? window.prompt('Rejection notes (required):')?.trim()
      : undefined;
    if (action === 'reject' && !transitionNotes) {
      setProcessingAction(null);
      return;
    }

    setProject({ ...project, project_status: targetLabel });
    toast.info("Transition Initiated", `Moving project node to ${String(targetLabel).toUpperCase()}`);

    try {
      const newState = await workflowEngine.executeTransition('project', projectId, action, {
        actorId: user?.id,
        notes: transitionNotes
      });
      toast.success("Transition Successful", `Node state finalized as ${String(newState).toUpperCase()}`);
      await fetchProject();
    } catch (err: any) {
      setProject({ ...project, project_status: prevStatus });
      toast.error("Transition Failed", err.message);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleEditStart = () => {
    setIsEditMode(true);
    setEditedProject({ ...project });
  };

  const handleSave = async () => {
    const prevProject = project;
    // Optimistic Update
    setProject(editedProject);
    setIsEditMode(false);
    toast.info("Saving Changes", "Synchronizing project node with registry...");

    try {
      const client = await getClient();
      const { error } = await (client
        .from('projects_master' as any) as any)
        .update(editedProject)
        .eq('id', projectId);

      if (error) throw error;
      toast.success("Changes Persisted", "Project registry updated successfully.");
      logger.info('PROJECT_EDIT_SUCCESS', { id: projectId });
    } catch (err: any) {
      // Rollback
      setProject(prevProject);
      toast.error("Save Failed", "Could not sync changes to the vault.");
      logger.error('PROJECT_EDIT_FAILED', { error: err.message, id: projectId });
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedProject(null);
  };

  if (loading) return <div className="p-8 text-center text-xs text-gray-500">Loading...</div>;
  if (!project) return <div className="p-8 text-center text-sm text-rose-500">Not found</div>;

  const FormField = ({ label, fieldKey, value }: any) => (
    <div>
      <Text variant="gov-label" className="block mb-1.5 ml-1">{label}</Text>
      {isEditMode ? (
        <GlassInput
          value={editedProject?.[fieldKey] || ''}
          onChange={(e) => setEditedProject({ ...editedProject, [fieldKey]: e.target.value })}
        />
      ) : (
        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
          <Text variant="mono" className="text-gray-700">
            {value || '-'}
          </Text>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity size={14} /> },
    { id: 'financials', label: 'Financials', icon: <DollarSign size={14} /> },
    { id: 'risks', label: 'Risk Register', icon: <AlertTriangle size={14} /> },
    { id: 'compliance', label: 'Compliance', icon: <ShieldAlert size={14} /> },
    { id: 'team', label: 'Project Team', icon: <Share2 size={14} /> },
    { id: 'documents', label: 'Archives', icon: <Building2 size={14} /> },
  ];

  const ACTION_LABELS: Record<WorkflowAction, string> = {
    submit: 'Submit',
    approve: 'Approve',
    complete: 'Complete',
    cancel: 'Cancel',
    reject: 'Reject',
  };

  const ACTION_STYLES: Record<WorkflowAction, string> = {
    submit: 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border-blue-500/30',
    approve: 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border-emerald-500/30',
    complete: 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border-emerald-500/30',
    cancel: 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/40 border-rose-500/30',
    reject: 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/40 border-amber-500/30',
  };

  return (
    <div className="min-h-screen bg-white relative selection:bg-blue-600 selection:text-black">
      <Watermark opacity={0.03} text="MORGAN" />

      {showShareModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-gray-50 border border-blue-200 rounded-xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(0,245,255,0.1)]">
            <div className="flex justify-between items-start mb-4">
              <Text variant="h3" className="text-gray-900">Share Project</Text>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-900 transition-colors">
                <X size={18} />
              </button>
            </div>
            <Text variant="caption" className="text-gray-500 mb-6 block">Generate a secure encrypted link for high-level stakeholder briefing.</Text>
            <GlassButton className="w-full bg-blue-600 text-black hover:bg-white border-none font-bold" variant="primary">
              Generate Secure Node
            </GlassButton>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-gray-50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <GlassButton variant="ghost" size="icon" onClick={onBack} className="hover:text-blue-600">
              <ArrowLeft size={16} />
            </GlassButton>
            <div className="flex items-center gap-6 border-l border-gray-200 pl-6">
              {isEditMode ? (
                <GlassInput
                  value={editedProject?.project_name || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, project_name: e.target.value })}
                  className="font-bold italic text-xl min-w-[400px] border-blue-200"
                />
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Text variant="h1" className="text-gray-900 text-3xl font-bold tracking-tight">{project.project_name}</Text>
                    {project.project_code && (
                      <Badge className="bg-blue-50 text-blue-600 border-blue-200 font-mono text-caption tracking-widest px-2 uppercase">
                        {project.project_code}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-caption font-mono text-gray-500 uppercase tracking-widest">
                    <span>Portfolio: <span className="text-gray-700">{project.portfolio || 'Unassigned'}</span></span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                    <span>Type: <span className="text-gray-700">{project.project_type || 'General'}</span></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditMode && (availableActions || []).map(action => (
              <GlassButton
                key={action}
                variant="primary"
                size="sm"
                onClick={() => handleTransition(action)}
                disabled={!!processingAction}
                className={ACTION_STYLES[action]}
              >
                {processingAction === action ? 'Processing...' : ACTION_LABELS[action]}
              </GlassButton>
            ))}

            {isEditMode ? (
              <div className="flex items-center gap-2">
                <GlassButton variant="primary" size="sm" onClick={handleSave} className="bg-blue-600 text-black hover:bg-white border-none font-bold">
                  Commit Sync
                </GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </GlassButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <GlassButton variant="secondary" size="sm" onClick={handleEditStart} className="hover:border-blue-300 hover:text-blue-600">
                  <Edit2 size={14} className="mr-2" /> Modify
                </GlassButton>
                <GlassButton variant="secondary" size="sm" onClick={() => setShowShareModal(true)}>
                  <Share2 size={14} className="mr-2" /> Encrypt & Share
                </GlassButton>
                <div className="w-px h-6 bg-gray-50 mx-2"></div>
                <RagSyncButton
                  documentId={`project_${project.id}`}
                  data={project}
                  label="Index to Vault"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "py-4 text-caption font-mono uppercase tracking-[0.2em] transition-all relative",
                  activeTab === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-px bg-blue-600 shadow-[0_0_10px_rgba(0,245,255,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-4 gap-4">
              <GlassPanel className="p-6 border-gray-200 bg-gray-50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/20" />
                <div className="flex items-center justify-between mb-4">
                  <Text variant="gov-label" className="text-gray-500">Maturity Status</Text>
                  <Activity size={14} className="text-emerald-500" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-end gap-2">
                    <Text variant="h1" className="text-gray-900 text-4xl font-bold italic tracking-tighter">
                      {project.completion_percent || 0}%
                    </Text>
                    <Text variant="caption" className="text-gray-500 mb-2 uppercase font-mono tracking-widest">Complete</Text>
                  </div>
                  <LaserProgress
                    value={project.completion_percent || 0}
                    className="w-full mt-1"
                    showValue={false}
                  />
                </div>
              </GlassPanel>

              <GlassPanel className="p-6 border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <Text variant="gov-label" className="text-gray-500">Financial Pulse</Text>
                  <DollarSign size={14} className="text-blue-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <Text variant="h1" className="text-gray-900 text-2xl font-bold tracking-tight">
                    {(project.contract_value_excl_vat || 0).toLocaleString(undefined, { notation: 'compact', style: 'currency', currency: 'AED' })}
                  </Text>
                  <Text variant="caption" className="text-gray-500 uppercase font-mono tracking-widest">Value Excl. VAT</Text>
                </div>
              </GlassPanel>

              <GlassPanel className="p-6 border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <Text variant="gov-label" className="text-gray-500">Temporal State</Text>
                  <Clock size={14} className="text-blue-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <Text variant="h1" className="text-gray-900 text-2xl font-bold tracking-tight">
                    {project.project_status || 'Design'}
                  </Text>
                  <Text variant="caption" className="text-gray-500 uppercase font-mono tracking-widest">Lifecycle Phase</Text>
                </div>
              </GlassPanel>

              <GlassPanel className="p-6 border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <Text variant="gov-label" className="text-gray-500">Risk Assessment</Text>
                  <ShieldAlert size={14} className={project.delivery_risk_rating === 'Critical' ? 'text-rose-500' : 'text-gray-500'} />
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant={project.delivery_risk_rating === 'Critical' ? 'danger' : 'success'} className="w-fit">
                    {project.delivery_risk_rating || 'NOMINAL'}
                  </Badge>
                  <Text variant="caption" className="text-gray-500 uppercase font-mono tracking-widest">Delivery Rating</Text>
                </div>
              </GlassPanel>
            </div>

            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-8 space-y-8">
                <GlassPanel className="p-8 bg-gray-50/20 border-gray-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                    <Building2 size={240} />
                  </div>
                  <Text className="text-gray-900 text-xs font-mono uppercase tracking-[0.3em] mb-8 border-l-2 border-blue-400 pl-4">
                    Strategic Configuration
                  </Text>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                    <FormField label="Client Entity" fieldKey="client_name" value={project.client_name} />
                    <FormField label="Strategic End User" fieldKey="end_client_name" value={project.end_client_name} />
                    <FormField label="Operational Sector" fieldKey="project_type" value={project.project_type} />
                    <FormField label="Geo Positioning" fieldKey="project_location_city" value={project.project_location_city} />
                  </div>
                </GlassPanel>

                <ProjectPulse
                  currentStage={project.project_status}
                  data={getMaturityData(project.project_status, project.completion_percent || project.completion || 0)}
                />

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle size={16} className="text-blue-600" />
                    <Text className="text-gray-900 text-xs font-mono uppercase tracking-[0.3em]">
                      Executive Remarks
                    </Text>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[120px]">
                    <Text variant="body" className="text-gray-500 leading-relaxed italic">
                      "{project.remarks || 'No high-level intelligence reports for this sector currently active.'}"
                    </Text>
                  </div>
                </div>
              </div>

              <div className="col-span-4">
                <ProjectTimeline
                  milestones={milestones}
                  projectStartDate={project.start_date}
                  projectEndDate={project.anticipated_date}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <GlassPanel className="p-8 bg-gray-50/20 border-gray-200">
              <Text className="text-gray-900 text-xs font-mono uppercase tracking-[0.3em] mb-12 border-l-2 border-blue-400 pl-4">
                Commercial Intelligence
              </Text>

              <div className="grid grid-cols-4 gap-8 mb-12">
                <div className="space-y-1">
                  <Text className="text-caption text-gray-500 uppercase font-mono tracking-widest">Total Exposure</Text>
                  <Text className="text-2xl font-bold text-gray-900">{(project.contract_value_excl_vat || 0).toLocaleString()} AED</Text>
                </div>
                <div className="space-y-1 text-emerald-400">
                  <Text className="text-caption text-gray-500 uppercase font-mono tracking-widest">Invoiced YTD</Text>
                  <Text className="text-2xl font-bold">{invoices.reduce((s, i) => s + (i.amount || 0), 0).toLocaleString()} AED</Text>
                </div>
                <div className="space-y-1 text-blue-400">
                  <Text className="text-caption text-gray-500 uppercase font-mono tracking-widest">Unbilled Work</Text>
                  <Text className="text-2xl font-bold">{invoices.filter(i => i.status === 'Draft' || i.status === 'Pending').reduce((s, i) => s + (i.amount || 0), 0).toLocaleString()} AED</Text>
                </div>
                <div className="space-y-1 text-rose-400">
                  <Text className="text-caption text-gray-500 uppercase font-mono tracking-widest">Retention (10%)</Text>
                  <Text className="text-2xl font-bold">{Math.round((project.contract_value_excl_vat || 0) * 0.1).toLocaleString()} AED</Text>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-6">
                  <Text className="text-gray-500 text-caption font-mono uppercase tracking-widest pl-2">Contract Metadata</Text>
                  <div className="space-y-4">
                    <FormField label="Contract Structure" fieldKey="contract_form" value={project.contract_form} />
                    <FormField label="Standard Payment Cycle" fieldKey="payment_terms_days" value={project.payment_terms_days ? `${project.payment_terms_days} Days` : '30 Days'} />
                    <FormField label="VAT Configuration" fieldKey="vat_rate_percent" value={project.vat_rate_percent ? `${project.vat_rate_percent}%` : '5%'} />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                  <Text className="text-gray-500 text-caption font-mono uppercase tracking-widest mb-6 block">Billing Progress</Text>
                  <FinancialSummary
                    metrics={[
                      { label: 'Certified', value: invoices.filter(i => i.status === 'Approved' || i.status === 'Paid').reduce((s, i) => s + (i.amount || 0), 0), color: 'blue', subtext: `${invoices.filter(i => i.status === 'Approved' || i.status === 'Paid').length} invoices` },
                      { label: 'Received', value: invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.amount || 0), 0), color: 'emerald', subtext: 'Collected' }
                    ]}
                  />
                </div>
              </div>
            </GlassPanel>
          </div>
        )}

        {/* Placeholders for other tabs to keep UI consistent */}
        {activeTab === 'risks' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <GlassPanel className="p-8 bg-gray-50/20 border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <Text className="text-gray-900 text-xs font-mono uppercase tracking-[0.3em] border-l-2 border-blue-400 pl-4">
                  Risk Intensity Matrix
                </Text>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded text-caption font-bold border bg-rose-50 text-rose-500 border-rose-200">{risks.filter(r => ['critical','high'].includes((r.impact||r.severity||'').toLowerCase())).length} High</span>
                  <span className="px-2 py-0.5 rounded text-caption font-bold border bg-amber-50 text-amber-500 border-amber-200">{risks.filter(r => (r.impact||r.severity||'').toLowerCase() === 'medium').length} Med</span>
                  <span className="px-2 py-0.5 rounded text-caption font-bold border bg-emerald-50 text-emerald-500 border-emerald-200">{risks.filter(r => (r.impact||r.severity||'').toLowerCase() === 'low').length} Low</span>
                </div>
              </div>
              {risks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border border-gray-200 rounded-xl border-dashed">
                  <AlertTriangle size={28} className="text-gray-300 mb-3" />
                  <Text className="text-gray-400 font-mono tracking-widest uppercase text-xs">No risks logged for this project</Text>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3 text-caption font-mono text-gray-500 uppercase tracking-widest w-1/3">Risk</th>
                        <th className="text-left px-4 py-3 text-caption font-mono text-gray-500 uppercase tracking-widest">Impact</th>
                        <th className="text-left px-4 py-3 text-caption font-mono text-gray-500 uppercase tracking-widest">Likelihood</th>
                        <th className="text-left px-4 py-3 text-caption font-mono text-gray-500 uppercase tracking-widest">Status</th>
                        <th className="text-left px-4 py-3 text-caption font-mono text-gray-500 uppercase tracking-widest">Mitigation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {risks.map((r: any, i: number) => {
                        const impact = r.impact || r.severity || 'Medium';
                        const impactColor = ['critical','high'].includes(impact.toLowerCase())
                          ? 'text-rose-500 bg-rose-50 border-rose-200'
                          : impact.toLowerCase() === 'medium'
                          ? 'text-amber-500 bg-amber-50 border-amber-200'
                          : 'text-emerald-500 bg-emerald-50 border-emerald-200';
                        return (
                          <tr key={r.id || i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900 text-xs">{r.title || r.name || 'Unnamed Risk'}</div>
                              {r.description && <div className="text-caption text-gray-400 mt-0.5 truncate max-w-[220px]">{r.description}</div>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-caption font-bold uppercase tracking-widest border ${impactColor}`}>{impact}</span>
                            </td>
                            <td className="px-4 py-3 text-caption text-gray-500 font-mono uppercase">{r.likelihood || r.probability || '–'}</td>
                            <td className="px-4 py-3 text-caption text-gray-500 font-mono uppercase">{r.status || 'Open'}</td>
                            <td className="px-4 py-3 text-caption text-gray-400 max-w-[200px] truncate">{r.mitigation || r.mitigation_plan || '–'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassPanel>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            <div className="grid grid-cols-3 gap-6">
              <GlassPanel className="p-8 bg-gray-50 border-gray-200 relative overflow-hidden flex flex-col justify-between">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <Text variant="gov-label" className="text-gray-500">PI Insurance</Text>
                    <ShieldAlert size={16} className="text-emerald-500" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-caption text-gray-500 font-mono uppercase tracking-widest mb-1">Policy Number</div>
                      <div className="text-sm font-bold text-gray-900">{project.pi_policy_number || 'PI-2026-X842'}</div>
                    </div>
                    <div>
                      <div className="text-caption text-gray-500 font-mono uppercase tracking-widest mb-1">Sum Insured</div>
                      <div className="text-sm font-bold text-gray-900">{(project.pi_sum_insured || 50000000).toLocaleString()} AED</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <Check size={14} className="text-emerald-500" />
                  <div className="text-caption text-emerald-400 font-bold uppercase tracking-widest">Active until {project.pi_policy_expiry_date || '31 DEC 2026'}</div>
                </div>
              </GlassPanel>

              <GlassPanel className="p-8 bg-gray-50 border-gray-200 relative overflow-hidden flex flex-col justify-between">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <Text variant="gov-label" className="text-gray-500">Legal Liability</Text>
                    <ShieldAlert size={16} className="text-blue-500" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-caption text-gray-500 font-mono uppercase tracking-widest mb-1">Third Party Coverage</div>
                      <div className="text-sm font-bold text-gray-900">{(project.third_party_liability_sum || 10000000).toLocaleString()} AED</div>
                    </div>
                    <div>
                      <div className="text-caption text-gray-500 font-mono uppercase tracking-widest mb-1">WPS Compliance</div>
                      <div className="text-sm font-bold text-emerald-500 uppercase tracking-widest">{project.wps_compliance_status || 'CERTIFIED'}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <CheckCircle2 size={14} className="text-blue-500" />
                  <div className="text-caption text-blue-400 font-bold uppercase tracking-widest">Full Portfolio Coverage</div>
                </div>
              </GlassPanel>

              <GlassPanel className="p-8 bg-gray-50 border-gray-200 relative overflow-hidden flex flex-col justify-between">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <Text variant="gov-label" className="text-gray-500">QHSE Ledger</Text>
                    <Activity size={16} className="text-amber-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-caption text-gray-500 font-mono uppercase tracking-widest">Active Incidents</div>
                      <div className="text-sm font-bold text-gray-900">{project.qhse_incidents_count || 0}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-caption text-gray-500 font-mono uppercase tracking-widest">Non-Conformities</div>
                      <div className="text-sm font-bold text-amber-500">{project.qhse_nonconformities_open || 0}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-caption text-gray-500 font-mono uppercase tracking-widest">HSE Plan</div>
                      <div className="text-caption font-bold text-gray-900 uppercase tracking-widest">{project.hse_plan_approved_date ? 'APPROVED' : 'PENDING'}</div>
                    </div>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[85%]" />
                </div>
              </GlassPanel>
            </div>

            <GlassPanel className="p-8 bg-gray-50/20 border-gray-200">
              <div className="flex items-center gap-3 mb-8">
                <Receipt size={16} className="text-blue-600" />
                <Text className="text-gray-900 text-xs font-mono uppercase tracking-[0.3em]">
                  Site Readiness Intelligence
                </Text>
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex justify-between text-caption font-mono uppercase tracking-widest mb-4">
                      <span className="text-gray-500">HSE Induction Progress</span>
                      <span className="text-blue-600">92%</span>
                    </div>
                    <LaserProgress value={92} showValue={false} />
                  </div>
                  <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex justify-between text-caption font-mono uppercase tracking-widest mb-4">
                      <span className="text-gray-500">Security Permits Clearance</span>
                      <span className="text-blue-600">100%</span>
                    </div>
                    <LaserProgress value={100} showValue={false} />
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <Check size={16} />
                    </div>
                    <span className="text-xs uppercase font-mono tracking-widest">Labour Camp Allocated</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <Check size={16} />
                    </div>
                    <span className="text-xs uppercase font-mono tracking-widest">Logistics Hub Active</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <Clock size={16} className="animate-pulse" />
                    </div>
                    <span className="text-xs uppercase font-mono tracking-widest font-bold">Awaiting NOC Certification</span>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <GlassPanel className="p-8 bg-gray-50/20 border-gray-200">
              <Text className="text-gray-900 text-xs font-mono uppercase tracking-[0.3em] mb-8 border-l-2 border-blue-400 pl-4">
                Project Team
              </Text>
              {teamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border border-gray-200 rounded-xl border-dashed">
                  <Users size={28} className="text-gray-300 mb-3" />
                  <Text className="text-gray-400 font-mono tracking-widest uppercase text-xs">No team members found</Text>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {teamMembers.map((m: any, i: number) => (
                    <div key={m.id || i} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                        <span className="text-blue-600 font-bold text-sm uppercase">{(m.name || m.full_name || 'U').charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 text-xs truncate">{m.name || m.full_name || 'Unknown'}</div>
                        <div className="text-caption text-gray-500 font-mono uppercase tracking-widest truncate">{m.role || m.job_title || 'Team Member'}</div>
                        {m.email && <div className="text-caption text-gray-400 truncate">{m.email}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassPanel>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <GlassPanel className="p-8 bg-gray-50/20 border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <Text className="text-gray-900 text-xs font-mono uppercase tracking-[0.3em] border-l-2 border-blue-400 pl-4">
                  Vault Archives
                </Text>
                <span className="text-caption font-mono text-gray-500">{projectDocs.length} document{projectDocs.length !== 1 ? 's' : ''}</span>
              </div>
              {projectDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border border-gray-200 rounded-xl border-dashed">
                  <FileText size={28} className="text-gray-300 mb-3" />
                  <Text className="text-gray-400 font-mono tracking-widest uppercase text-xs">No documents linked to this project</Text>
                </div>
              ) : (
                <div className="space-y-2">
                  {projectDocs.map((doc: any, i: number) => (
                    <div key={doc.id || i} className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors group">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-blue-500 shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900 text-xs">{doc.title || doc.file_name || doc.name || 'Untitled'}</div>
                          <div className="text-caption text-gray-400 font-mono uppercase tracking-widest">
                            {doc.category || doc.doc_type || 'General'}{doc.created_at ? ` · ${new Date(doc.created_at).toLocaleDateString()}` : ''}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-caption font-bold border ${
                        doc.status === 'Approved' ? 'text-emerald-500 bg-emerald-50 border-emerald-200' :
                        doc.status === 'Under Review' ? 'text-amber-500 bg-amber-50 border-amber-200' :
                        'text-gray-500 bg-gray-50 border-gray-200'
                      }`}>{doc.status || 'Draft'}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassPanel>
          </div>
        )}
      </div>
    </div>
  );
};
const getMaturityData = (status: string, completion: number) => {
  const allStages = [
    { name: 'Tender', base: 20 },
    { name: 'Concept', base: 40 },
    { name: 'Schematic', base: 60 },
    { name: 'Detailed', base: 80 },
    { name: 'Construction', base: 100 }
  ];

  const statusMap: Record<string, number> = {
    'tender stage': 0,
    'pre-award': 0,
    'concept stage (design)': 1,
    'schematic stage (design)': 2,
    'detailed design': 3,
    'client review': 3,
    'awaiting building permit': 3,
    'tender documents': 3,
    'construction ongoing': 4,
    'ongoing': 4,
    'completed': 4,
    'dlp period': 4
  };

  const currentIdx = statusMap[status?.toLowerCase()] ?? -1;

  return allStages.map((stage, idx) => {
    if (idx < currentIdx) return { stage: stage.name, maturity: 100 };
    if (idx === currentIdx) {
      // For construction, use the actual completion percentage
      if (idx === 4) return { stage: stage.name, maturity: Math.max(completion, 10) };
      // For earlier stages, if it's the current stage, show some progress
      return { stage: stage.name, maturity: stage.base };
    }
    // Future stages show 0 or very low
    return { stage: stage.name, maturity: 0 };
  });
};
