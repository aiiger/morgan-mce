import { supabase } from '../lib/supabase';

export type EntityType = 'project' | 'tender';
export type WorkflowAction = 'approve' | 'reject' | 'submit' | 'complete' | 'cancel';

export type ProjectStatus = 'Draft' | 'Submitted' | 'Approved' | 'In Progress' | 'Completed' | 'Cancelled';

interface Transition {
  from: string;
  to: string;
  action: WorkflowAction;
  guard?: (entityId: string) => Promise<boolean>;
}

interface WorkflowDefinition {
  initial: string;
  transitions: Transition[];
}

const PROJECT_HISTORY_TABLE = 'project_status_history';

const ProjectWorkflow: WorkflowDefinition = {
  initial: 'Draft',
  transitions: [
    { from: 'Draft', to: 'Submitted', action: 'submit' },
    { from: 'Submitted', to: 'Approved', action: 'approve' },
    { from: 'Approved', to: 'In Progress', action: 'approve' },
    { from: 'In Progress', to: 'Completed', action: 'complete' },
    { from: 'Draft', to: 'Cancelled', action: 'cancel' },
    { from: 'Submitted', to: 'Cancelled', action: 'cancel' },
    { from: 'Approved', to: 'Cancelled', action: 'cancel' },
    { from: 'In Progress', to: 'Cancelled', action: 'cancel' },
    { from: 'Approved', to: 'Draft', action: 'reject' },
  ]
};

const TenderWorkflow: WorkflowDefinition = {
  initial: 'draft',
  transitions: [
    { from: 'draft', to: 'review', action: 'submit' },
    { from: 'review', to: 'submitted', action: 'approve' },
    { from: 'submitted', to: 'awarded', action: 'complete' },
    { from: 'submitted', to: 'lost', action: 'reject' },
    { from: 'review', to: 'draft', action: 'reject' }
  ]
};

// --- State Normalizer ---

export function normalizeProjectStatus(status: string): ProjectStatus {
  const s = (status || '').toLowerCase().trim();
  if (s.includes('submit')) return 'Submitted';
  if (s.includes('approve')) return 'Approved';
  if (s.includes('progress') || s.includes('active') || s.includes('construct') || s.includes('ongoing')) return 'In Progress';
  if (s.includes('complete')) return 'Completed';
  if (s.includes('cancel')) return 'Cancelled';
  if (s.includes('draft') || s.includes('plan')) return 'Draft';
  return 'Draft';
}

// --- Engine ---

export const workflowEngine = {
  getDefinition(type: EntityType) {
    return type === 'project' ? ProjectWorkflow : TenderWorkflow;
  },

  getAvailableActions(type: EntityType, currentState: string): WorkflowAction[] {
    const def = this.getDefinition(type);
    return def.transitions
      .filter(t => t.from === currentState)
      .map(t => t.action);
  },

  async canTransition(type: EntityType, currentState: string, action: WorkflowAction, entityId: string): Promise<{ allowed: boolean; reason?: string }> {
    const def = this.getDefinition(type);
    const transition = def.transitions.find(t => t.from === currentState && t.action === action);

    if (!transition) {
      return { allowed: false, reason: 'Invalid action for current state.' };
    }

    if (transition.guard) {
      const passed = await transition.guard(entityId);
      if (!passed) {
        return { allowed: false, reason: `Guard failed: Missing required documents or approvals.` };
      }
    }

    return { allowed: true };
  },

  async executeTransition(
    type: EntityType,
    entityId: string,
    action: WorkflowAction,
    options?: { actorId?: string; notes?: string }
  ) {
    const table = type === 'project' ? 'projects_master' : 'tenders';
    const stateField = type === 'project' ? 'project_status' : 'status';

    const { data: entity } = await (supabase.from(table as any) as any)
      .select(stateField)
      .eq('id', entityId)
      .single();
    if (!entity) throw new Error('Entity not found');

    const currentState = type === 'project'
      ? normalizeProjectStatus(entity[stateField] || '')
      : (entity[stateField]?.toLowerCase() || 'draft');

    const check = await this.canTransition(type, currentState, action, entityId);
    if (!check.allowed) throw new Error(check.reason);

    const def = this.getDefinition(type);
    const transition = def.transitions.find(t => t.from === currentState && t.action === action);
    if (!transition) throw new Error('Transition logic error');

    const { error } = await (supabase.from(table as any) as any)
      .update({ [stateField]: transition.to })
      .eq('id', entityId);

    if (error) throw error;

    if (type === 'project') {
      const changedAt = new Date().toISOString();
      const { error: historyError } = await (supabase.from(PROJECT_HISTORY_TABLE as any) as any)
        .insert({
          project_id: entityId,
          from_status: currentState,
          to_status: transition.to,
          changed_by: options?.actorId || null,
          changed_at: changedAt,
          notes: options?.notes || null,
        });

      if (historyError) throw historyError;
    }

    return transition.to;
  }
};
