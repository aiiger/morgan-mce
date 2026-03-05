import {
  addAutomationExecutionHistory,
  createAutomationRecord,
  createWorkflowRecord,
  getAutomationById,
  getWorkflowById,
  type MorganTenantContext,
  type MorganAutomationRule,
  type MorganWorkflow
} from './persistence';

export type MorganLifecycleState =
  | 'S_PERMISSION_CHECK_PENDING'
  | 'S_PERMISSION_DENIED'
  | 'S_WORKFLOW_CREATE_REQUESTED'
  | 'S_WORKFLOW_CREATED'
  | 'S_WORKFLOW_VERIFIED'
  | 'S_AUTOMATION_CREATE_REQUESTED'
  | 'S_AUTOMATION_CREATED'
  | 'S_AUTOMATION_VERIFIED'
  | 'S_AUTOMATION_HISTORY_VERIFIED'
  | 'S_TEMPLATE_QUERY_FAILED_RECOVERABLE'
  | 'S_ENTITY_HYDRATION_IN_PROGRESS'
  | 'S_ENTITY_HYDRATION_COMPLETE'
  | 'TERMINAL_SUCCESS'
  | 'TERMINAL_PERMISSION_DENIED'
  | 'TERMINAL_NON_DETERMINISTIC';

interface LifecycleResult<T> {
  ok: boolean;
  states: MorganLifecycleState[];
  terminalState: MorganLifecycleState;
  entity: T | null;
  reason?: string;
}

function isPermissionAllowed(): boolean {
  return process.env.MORGAN_PERMISSION_ALLOW !== '0';
}

export function permissionCheckState(): { authorized: boolean; state: MorganLifecycleState } {
  if (!isPermissionAllowed()) {
    return { authorized: false, state: 'S_PERMISSION_DENIED' };
  }

  return { authorized: true, state: 'S_PERMISSION_CHECK_PENDING' };
}

export async function createWorkflowWithLifecycle(
  input: Partial<MorganWorkflow>,
  tenantContext?: MorganTenantContext
): Promise<LifecycleResult<MorganWorkflow>> {
  const states: MorganLifecycleState[] = [];

  states.push('S_PERMISSION_CHECK_PENDING');
  if (!isPermissionAllowed()) {
    states.push('S_PERMISSION_DENIED', 'TERMINAL_PERMISSION_DENIED');
    return {
      ok: false,
      states,
      terminalState: 'TERMINAL_PERMISSION_DENIED',
      entity: null,
      reason: 'Permission check denied workflow creation.'
    };
  }

  states.push('S_WORKFLOW_CREATE_REQUESTED');
  const created = await createWorkflowRecord(input, tenantContext);
  states.push('S_WORKFLOW_CREATED');

  const verified = await getWorkflowById(created.id, tenantContext);
  if (!verified) {
    states.push('TERMINAL_NON_DETERMINISTIC');
    return {
      ok: false,
      states,
      terminalState: 'TERMINAL_NON_DETERMINISTIC',
      entity: null,
      reason: 'Workflow create succeeded but verification failed.'
    };
  }

  states.push('S_WORKFLOW_VERIFIED');
  states.push('S_ENTITY_HYDRATION_IN_PROGRESS');
  states.push('S_ENTITY_HYDRATION_COMPLETE');
  states.push('TERMINAL_SUCCESS');

  return {
    ok: true,
    states,
    terminalState: 'TERMINAL_SUCCESS',
    entity: verified
  };
}

export async function createAutomationWithLifecycle(
  input: Partial<MorganAutomationRule>,
  tenantContext?: MorganTenantContext
): Promise<LifecycleResult<MorganAutomationRule>> {
  const states: MorganLifecycleState[] = [];

  states.push('S_PERMISSION_CHECK_PENDING');
  if (!isPermissionAllowed()) {
    states.push('S_PERMISSION_DENIED', 'TERMINAL_PERMISSION_DENIED');
    return {
      ok: false,
      states,
      terminalState: 'TERMINAL_PERMISSION_DENIED',
      entity: null,
      reason: 'Permission check denied automation creation.'
    };
  }

  states.push('S_AUTOMATION_CREATE_REQUESTED');
  const created = await createAutomationRecord(input, tenantContext);
  states.push('S_AUTOMATION_CREATED');

  const verified = await getAutomationById(created.id, tenantContext);
  if (!verified) {
    states.push('TERMINAL_NON_DETERMINISTIC');
    return {
      ok: false,
      states,
      terminalState: 'TERMINAL_NON_DETERMINISTIC',
      entity: null,
      reason: 'Automation create succeeded but verification failed.'
    };
  }

  states.push('S_AUTOMATION_VERIFIED');
  await addAutomationExecutionHistory(verified.id, 'RULE_CREATED', 'S_AUTOMATION_HISTORY_VERIFIED', tenantContext);
  states.push('S_AUTOMATION_HISTORY_VERIFIED');
  states.push('S_ENTITY_HYDRATION_IN_PROGRESS');
  states.push('S_ENTITY_HYDRATION_COMPLETE');
  states.push('TERMINAL_SUCCESS');

  return {
    ok: true,
    states,
    terminalState: 'TERMINAL_SUCCESS',
    entity: verified
  };
}

export function templateQueryRecoverableFailure(reason: string) {
  return {
    ok: false,
    state: 'S_TEMPLATE_QUERY_FAILED_RECOVERABLE' as MorganLifecycleState,
    terminalState: null,
    reason
  };
}
