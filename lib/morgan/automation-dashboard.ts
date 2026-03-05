import { automationRuleCatalog, evaluateRuleAtDayOffset, type AutomationRuleDomain, type EvaluatedAutomationEvent } from '@/lib/imperial/automation';
import { listProjects, listTenders, listAutomationExecutionHistory, addAutomationExecutionHistory, type MorganTenantContext } from '@/lib/morgan/persistence';

export type AutomationEntityType = 'TENDER' | 'PAYMENT' | 'LIABILITY' | 'MILESTONE';

export interface AutomationAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  entityType: AutomationEntityType;
  entityId: string;
  entityName: string;
  dueAt: string;
  daysUntilDue: number;
  severity: EvaluatedAutomationEvent['severity'];
  escalation: EvaluatedAutomationEvent['escalation'];
  channels: EvaluatedAutomationEvent['channels'];
  label: string;
  owner: string;
  ackRequired: boolean;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
}

export interface AutomationDashboardData {
  generatedAt: string;
  rules: typeof automationRuleCatalog;
  alerts: AutomationAlert[];
}

interface AutomationEntity {
  id: string;
  name: string;
  domain: AutomationRuleDomain;
  dueAt: string;
  owner: string;
}

const dayMs = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function mapEntityType(domain: AutomationRuleDomain): AutomationEntityType {
  if (domain === 'TENDER_DEADLINE') return 'TENDER';
  if (domain === 'PAYMENT_DUE') return 'PAYMENT';
  if (domain === 'LIABILITY_DLP') return 'LIABILITY';
  return 'MILESTONE';
}

function calculateDaysUntilDue(dueAt: string): number {
  const now = startOfDay(new Date());
  const due = startOfDay(new Date(dueAt));
  return Math.floor((due.getTime() - now.getTime()) / dayMs);
}

function parseAckActor(event: string): string | null {
  if (!event.startsWith('ALERT_ACKNOWLEDGED')) return null;
  const [, actor] = event.split(':');
  return actor || null;
}

async function loadAcknowledgements(tenant: MorganTenantContext): Promise<Map<string, { acknowledgedAt: string; acknowledgedBy: string | null }>> {
  const map = new Map<string, { acknowledgedAt: string; acknowledgedBy: string | null }>();

  for (const rule of automationRuleCatalog) {
    const history = await listAutomationExecutionHistory(rule.id, tenant);
    for (const entry of history) {
      const actor = parseAckActor(entry.event);
      if (!actor) continue;
      const alertId = entry.state;
      if (!map.has(alertId)) {
        map.set(alertId, {
          acknowledgedAt: entry.createdAt,
          acknowledgedBy: actor
        });
      }
    }
  }

  return map;
}

async function buildEntitySeed(tenant: MorganTenantContext): Promise<AutomationEntity[]> {
  const [projects, tenders] = await Promise.all([listProjects(tenant), listTenders(tenant)]);

  const tenderEntities: AutomationEntity[] = tenders.map((tender) => ({
    id: tender.id,
    name: tender.name,
    domain: 'TENDER_DEADLINE',
    dueAt: tender.deadlineAt,
    owner: tender.owner
  }));

  const paymentEntities: AutomationEntity[] = projects.slice(0, 6).map((project) => ({
    id: `PAY-${project.id}`,
    name: `${project.name} Payment Due`,
    domain: 'PAYMENT_DUE',
    dueAt: project.paymentDueAt,
    owner: 'Finance Lead'
  }));

  const liabilityEntities: AutomationEntity[] = projects.slice(0, 6).map((project) => ({
    id: `DLP-${project.id}`,
    name: `${project.name} DLP Window`,
    domain: 'LIABILITY_DLP',
    dueAt: project.dlpEndAt,
    owner: 'QA/QC Head'
  }));

  const milestoneEntities: AutomationEntity[] = projects.slice(0, 8).map((project) => ({
    id: `MLS-${project.id}`,
    name: `${project.name} Milestone`,
    domain: 'MILESTONE_DUE',
    dueAt: project.milestoneDueAt,
    owner: 'Project Manager'
  }));

  return [...tenderEntities, ...paymentEntities, ...liabilityEntities, ...milestoneEntities];
}

export async function getAutomationDashboardDataForTenant(tenant: MorganTenantContext): Promise<AutomationDashboardData> {
  const [entities, ackMap] = await Promise.all([buildEntitySeed(tenant), loadAcknowledgements(tenant)]);
  const alerts: AutomationAlert[] = [];

  for (const rule of automationRuleCatalog) {
    if (!rule.active) continue;

    const ruleEntities = entities.filter((entity) => entity.domain === rule.domain);

    for (const entity of ruleEntities) {
      const daysUntilDue = calculateDaysUntilDue(entity.dueAt);
      const evaluated = evaluateRuleAtDayOffset(rule, daysUntilDue);

      if (!evaluated) continue;

      const alertId = `${rule.id}:${entity.id}:${daysUntilDue}`;
      const ack = ackMap.get(alertId);

      alerts.push({
        id: alertId,
        ruleId: rule.id,
        ruleName: rule.name,
        entityType: mapEntityType(rule.domain),
        entityId: entity.id,
        entityName: entity.name,
        dueAt: entity.dueAt,
        daysUntilDue,
        severity: evaluated.severity,
        escalation: evaluated.escalation,
        channels: evaluated.channels,
        label: evaluated.label,
        owner: entity.owner,
        ackRequired: evaluated.severity === 'CRITICAL',
        acknowledgedAt: ack?.acknowledgedAt ?? null,
        acknowledgedBy: ack?.acknowledgedBy ?? null
      });
    }
  }

  const severityOrder = { CRITICAL: 0, WARN: 1, INFO: 2 } as const;
  alerts.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return a.daysUntilDue - b.daysUntilDue;
  });

  return {
    generatedAt: new Date().toISOString(),
    rules: automationRuleCatalog,
    alerts
  };
}

export async function acknowledgeAutomationAlertForTenant(alertId: string, actorId: string, tenant: MorganTenantContext): Promise<AutomationAlert | null> {
  const dashboard = await getAutomationDashboardDataForTenant(tenant);
  const target = dashboard.alerts.find((alert) => alert.id === alertId);

  if (!target) {
    return null;
  }

  await addAutomationExecutionHistory(target.ruleId, `ALERT_ACKNOWLEDGED:${actorId}`, alertId, tenant);

  const refreshed = await getAutomationDashboardDataForTenant(tenant);
  return refreshed.alerts.find((alert) => alert.id === alertId) ?? null;
}
