export type AutomationSeverity = 'INFO' | 'WARN' | 'CRITICAL';
export type AutomationChannel = 'IN_APP' | 'EMAIL' | 'SOUND' | 'SMS';
export type EscalationLevel = 'NONE' | 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
export type AutomationRuleDomain = 'TENDER_DEADLINE' | 'PAYMENT_DUE' | 'LIABILITY_DLP' | 'MILESTONE_DUE';

export interface RuleSchedulePoint {
    dayOffset: number;
    severity: AutomationSeverity;
    channels: AutomationChannel[];
    escalation: EscalationLevel;
    label: string;
}

export interface AutomationRule {
    id: string;
    name: string;
    description: string;
    domain: AutomationRuleDomain;
    active: boolean;
    targetField: string;
    schedule: RuleSchedulePoint[];
}

export interface EvaluatedAutomationEvent {
    ruleId: string;
    ruleName: string;
    severity: AutomationSeverity;
    escalation: EscalationLevel;
    channels: AutomationChannel[];
    label: string;
    dayOffset: number;
}

export interface AutomationPreview {
    totalRules: number;
    activeRules: number;
    totalSchedulePoints: number;
    criticalSchedulePoints: number;
}

export const automationRuleCatalog: AutomationRule[] = [
    {
        id: 'AUTO-TENDER-DEADLINE',
        name: 'Tender Deadline Escalation',
        description: 'Escalates deadline alerts at T-14/T-7/T-5/T-3/T-2/T-1/day-of/overdue with deterministic channels.',
        domain: 'TENDER_DEADLINE',
        active: true,
        targetField: 'deadline_at',
        schedule: [
            { dayOffset: 14, severity: 'INFO', channels: ['IN_APP'], escalation: 'NONE', label: 'T-14 early awareness' },
            { dayOffset: 7, severity: 'WARN', channels: ['IN_APP', 'EMAIL'], escalation: 'NONE', label: 'T-7 warning' },
            { dayOffset: 5, severity: 'WARN', channels: ['IN_APP', 'EMAIL'], escalation: 'NONE', label: 'T-5 warning' },
            { dayOffset: 3, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L0', label: 'T-3 owner escalation' },
            { dayOffset: 2, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L1', label: 'T-2 PM escalation' },
            { dayOffset: 1, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L2', label: 'T-1 department escalation' },
            { dayOffset: 0, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L3', label: 'Due date executive escalation' },
            { dayOffset: -1, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND', 'SMS'], escalation: 'L4', label: 'Overdue super-admin escalation' }
        ]
    },
    {
        id: 'AUTO-PAYMENT-DUE',
        name: 'Payment Due Escalation',
        description: 'Tracks payment due and overdue states with finance escalation until legal review threshold.',
        domain: 'PAYMENT_DUE',
        active: true,
        targetField: 'due_date',
        schedule: [
            { dayOffset: 14, severity: 'INFO', channels: ['IN_APP'], escalation: 'NONE', label: 'Prepare invoice' },
            { dayOffset: 7, severity: 'WARN', channels: ['IN_APP', 'EMAIL'], escalation: 'L0', label: 'Client reminder window' },
            { dayOffset: 0, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L1', label: 'Payment due today' },
            { dayOffset: -7, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L2', label: '7 days overdue finance escalation' },
            { dayOffset: -30, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L3', label: '30 days overdue management escalation' },
            { dayOffset: -60, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND', 'SMS'], escalation: 'L4', label: '60 days overdue legal review trigger' }
        ]
    },
    {
        id: 'AUTO-LIABILITY-DLP',
        name: 'Liability/DLP Expiry Guardrail',
        description: 'Monitors DLP expiry windows and escalates closure, inspection, and certificate release requirements.',
        domain: 'LIABILITY_DLP',
        active: true,
        targetField: 'dlp_end_date',
        schedule: [
            { dayOffset: 90, severity: 'INFO', channels: ['IN_APP'], escalation: 'NONE', label: 'DLP review preparation' },
            { dayOffset: 60, severity: 'WARN', channels: ['IN_APP', 'EMAIL'], escalation: 'L0', label: 'Inspection scheduling window' },
            { dayOffset: 30, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L1', label: 'Final inspection prep' },
            { dayOffset: 14, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L2', label: 'Documentation review' },
            { dayOffset: 7, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L3', label: 'Closure preparation' },
            { dayOffset: 0, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND', 'SMS'], escalation: 'L4', label: 'Certificate release deadline' }
        ]
    },
    {
        id: 'AUTO-MILESTONE-DUE',
        name: 'Milestone Due Controller',
        description: 'Runs milestone countdown and escalates if owners do not complete required submissions.',
        domain: 'MILESTONE_DUE',
        active: true,
        targetField: 'milestone_due_date',
        schedule: [
            { dayOffset: 7, severity: 'INFO', channels: ['IN_APP'], escalation: 'NONE', label: '7-day progress check' },
            { dayOffset: 3, severity: 'WARN', channels: ['IN_APP', 'EMAIL'], escalation: 'L0', label: '3-day status update required' },
            { dayOffset: 1, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L1', label: '1-day completion required' },
            { dayOffset: -1, severity: 'CRITICAL', channels: ['IN_APP', 'EMAIL', 'SOUND'], escalation: 'L2', label: 'Overdue milestone escalation' }
        ]
    }
];

export function evaluateRuleAtDayOffset(rule: AutomationRule, daysUntilDue: number): EvaluatedAutomationEvent | null {
    const schedulePoint = rule.schedule.find((point) => point.dayOffset === daysUntilDue);
    if (!rule.active || !schedulePoint) {
        return null;
    }

    return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: schedulePoint.severity,
        escalation: schedulePoint.escalation,
        channels: schedulePoint.channels,
        label: schedulePoint.label,
        dayOffset: schedulePoint.dayOffset
    };
}

export function buildAutomationPreview(): AutomationPreview {
    const activeRules = automationRuleCatalog.filter((rule) => rule.active);
    const totalSchedulePoints = automationRuleCatalog.reduce((sum, rule) => sum + rule.schedule.length, 0);
    const criticalSchedulePoints = automationRuleCatalog.reduce(
        (sum, rule) => sum + rule.schedule.filter((point) => point.severity === 'CRITICAL').length,
        0
    );

    return {
        totalRules: automationRuleCatalog.length,
        activeRules: activeRules.length,
        totalSchedulePoints,
        criticalSchedulePoints
    };
}

export const defaultAutomations = automationRuleCatalog;
