import type React from 'react'

export type SectionId =
  | 'dashboard' | 'portfolios' | 'tenders' | 'projects' | 'templates'
  | 'workflows' | 'automation' | 'tasks' | 'issues' | 'risks' | 'milestones'
  | 'time-reports' | 'documents' | 'timesheets'
  | 'approval-pipeline'
  | 'resource-requests' | 'capacity-planning' | 'workload-balancing'
  | 'budgets' | 'expenses' | 'financial-reports' | 'financial-approvals' | 'financial-settings'
  | 'risk-heat-map' | 'risk-alerts' | 'alert-rules'
  | 'issue-analytics' | 'lessons-learned' | 'time-off'
  | 'settings'

export interface WorkflowStatus {
  id: string
  name: string
  color: string
  isInitial: boolean
  isFinal: boolean
}

export interface WorkflowFormData {
  name: string
  description: string
  bindProject: string
  templateType: string
  active: boolean
  isDefault: boolean
  statuses: WorkflowStatus[]
}

export interface MorganProject {
  id: string
  name: string
  code: string
  portfolio: string
  priority: string
  status: string
  value: string | number
  progress: number
}

export interface MorganTender {
  id: string
  name: string
  value: string | number
  status: string
  compliance: number
}

export interface NavItem { id: SectionId; icon: React.ComponentType<any>; label: string }
export interface NavGroup { header: string; items: NavItem[] }
