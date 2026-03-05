export type DocumentCategory = 'COMPLIANCE' | 'CONTRACT' | 'INVOICE' | 'SAFETY';
export type DocumentStatus = 'Review' | 'Reviewed' | 'Approved' | 'Rejected';
export type ProjectStatus = 'Active' | 'Risk' | 'Delayed' | 'Completed' | 'Paused';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Project {
  id: string;

  // Legacy fields (older schema / generic UI)
  name: string;
  status: ProjectStatus;
  location?: string;
  completion?: number;
  budget?: string;
  created_at: string;

  // VeroPM Parity Fields (Audited 2026-02-26)
  portfolio?: string;
  project_priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  project_type?: 'Agile' | 'Waterfall' | 'Hybrid';
  project_visibility?: 'Public' | 'Team' | 'Private';
  project_logo_url?: string;

  // Insurance & Compliance (New 2026-02-26)
  pi_insurance_required?: boolean;
  pi_policy_expiry_date?: string;
  pi_sum_insured?: number;
  pi_policy_number?: string;
  third_party_liability_sum?: number;
  wps_compliance_status?: string;
  qhse_incidents_count?: number;
  qhse_nonconformities_open?: number;
  hse_plan_approved_date?: string;
  site_access_permits_required?: boolean;
  site_hse_induction_required?: boolean;

  // Legacy & Compatibility
  updated_at?: string;
  completion_percent?: number;
  compliance_status?: string;
  project_location_city?: string;
  doc_control_platform?: string;

  // Database-first compatibility aliases (snake_case)
  project_name?: string;
  project_code?: string;
  project_status?: string;
  client_name?: string;
  contract_value_excl_vat?: number;
  delivery_risk_rating?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  flag_for_ceo_attention?: boolean;
  project_completion_date_planned?: string;
  dlp_end_date?: string;
  project_commencement_date?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: DocumentCategory; // Mapped to 'category' in DB
  date: string; // Display date
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  project_name?: string;
  project_code?: string;
  client_name?: string;
  client_id?: string;
  project_id?: string;
}

export interface SystemNotification {
  id: string;
  title: string; // Mapped to 'message' or 'title'
  message?: string;
  timestamp: string;
  priority: AlertSeverity; // Mapped to 'severity'
  isUnread?: boolean;
  acked_at?: string;
}

export interface KPIMetric {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  trendSentiment: 'positive' | 'negative' | 'neutral';
  description: string;
  icon?: any;
  color?: string;
  isCurrency?: boolean;
  status?: string;
  safety?: {
    value: number;
    label: string;
    trend: string;
  };
}

export interface AgentActivity {
  id: string;
  agent_name: string;
  action: 'POST' | 'PATCH';
  document_id: string;
  timestamp: string;
}

export type Alert = SystemNotification;

export interface Tender {
  id: string;
  title: string;
  client: string;
  status: string;
  value?: number;
  probability?: 'High' | 'Medium' | 'Low';
  created_at: string;
  submission_deadline?: string;

  // VeroPM Parity Fields (Audited 2026-02-26)
  lead_source?: string;
  expected_close_date?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface StatusData {
  name: string;
  value: number;
  color: string;
}

export interface ChartData {
  name: string;
  docs: number;
  review: number;
}

// TODO TRACKER TYPES
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  archived_at?: string;
  deleted_at?: string;
  categories?: Category[];
}

export interface UserPreferences {
  user_id: string;
  theme: 'light' | 'dark';
  default_view: 'dashboard' | 'tasks' | 'kanban' | 'calendar' | 'list';
  default_sort: 'due_date' | 'priority' | 'created_date' | 'title';
  tasks_per_page: number;
  date_format: string;
  time_format: '12h' | '24h';
  email_notifications: boolean;
  daily_digest: boolean;
  digest_time: string;
  due_date_reminders: boolean;
  reminder_before: string;
  auto_archive_completed: boolean;
  archive_after_days: number;
}

// ==================== RESOURCE MANAGEMENT TYPES ====================

export type ResourceStatus = 'Active' | 'On Hold' | 'Completed';
export type ManpowerImportStatus = 'Pending' | 'Processing' | 'Success' | 'Failed';

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  department?: string;
  skills: string[];
  availability_start?: string;
  availability_end?: string;
  utilization_target_percent: number;
  billable: boolean;
  cost_per_hour?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ResourcePool {
  id: string;
  pool_name: string;
  description?: string;
  required_skills: string[];
  typical_allocation_percent: number;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface ResourceAllocation {
  id: string;
  team_member_id: string;
  project_id: string;
  allocation_percent: number;
  start_date: string;
  end_date?: string;
  role_in_project?: string;
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
  team_member_name?: string;
  project_name?: string;
}

export interface UtilizationMetric {
  team_member_id: string;
  period: string;
  total_allocation_percent: number;
  projects_count: number;
  calculated_at: string;
  team_member_name?: string;
  variance_percent?: number; // target - actual
}

export interface ManpowerPlan {
  id: string;
  plan_name: string;
  file_name: string;
  row_count: number;
  import_status: ManpowerImportStatus;
  error_details?: any;
  created_at: string;
  processed_at?: string;
}

export interface ResourceFilters {
  department?: string;
  skill?: string;
  isActive?: boolean;
  poolId?: string;
}

// ==================== RFQ DELTA GATE TYPES ====================

export type DeltaChangeType = 'ADDED' | 'MODIFIED' | 'DELETED' | 'REORDERED';
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  requirements_text?: string;
  requirements_hash: string;
  requirements_json?: any;
  created_at: string;
  created_by?: string;
  change_summary?: string;
}

export interface DocumentChangeEvent {
  id: string;
  document_id: string;
  previous_version?: number;
  current_version: number;
  change_type: DeltaChangeType;
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  impact_level: ImpactLevel;
  created_at: string;
}

export interface DocumentAcknowledgment {
  id: string;
  document_id: string;
  change_event_id?: string;
  user_id: string;
  acknowledged_at: string;
  acknowledgment_notes?: string;
  created_at: string;
}

export interface DeltaGateAlert {
  document_id: string;
  changes: DocumentChangeEvent[];
  has_critical_changes: boolean;
  highest_impact: ImpactLevel;
  requires_acknowledgment: boolean;
  acknowledgment_deadline?: string;
}


