// Frontend-only types for the maintenance request system

export type MaintenanceType = 'offline' | 'fls' | 'calibration' | 'fls_calibration'

export interface Vehicle {
  id: string
  plate_number: string
  location: string
  created_at: string
}

export interface CostBreakdown {
  maintenanceFees: number
  perDiem: number
  transportation: number
  workDays: number
  crewCount: number
  total: number
}

export interface MaintenanceRequest {
  id: string
  owner_name: string
  contact_number: string
  company_name?: string
  vehicles: Vehicle[]
  maintenance_types: MaintenanceType[]
  total_cost: number
  breakdown: CostBreakdown
  status?: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category?: 'general' | 'emergency' | 'preventive' | 'repair'
  estimated_completion?: string
  notes?: string
  assigned_to?: string
  technician_notes?: string
  assigned_technician_id?: string
  completion_percentage?: number
  maintenance_history?: MaintenanceHistoryEntry[]
  progress_milestones?: ProgressMilestone[]
  created_at: string
  updated_at?: string
}

// Enhanced types for new functionality
export interface Technician {
  id: string
  name: string
  contact_number?: string
  email?: string
  specialization: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MaintenanceComment {
  id: string
  request_id: string
  author_name: string
  author_type: 'admin' | 'supervisor' | 'technician'
  comment_text: string
  is_internal: boolean
  created_at: string
  updated_at: string
}

export interface TaskProgress {
  id: string
  request_id: string
  task_name: string
  task_description?: string
  is_completed: boolean
  completed_at?: string
  completed_by?: string
  order_index: number
  created_at: string
  updated_at: string
}

// Timeline System Types
export interface MaintenanceTimeline {
  id: string
  request_id: string
  milestone_type: 'major' | 'minor' | 'event' | 'deadline'
  title: string
  description?: string
  planned_date?: string
  actual_date?: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled'
  completion_percentage: number
  assigned_to?: string
  created_by: string
  created_by_role: 'admin' | 'supervisor' | 'technician'
  order_index: number
  is_critical: boolean
  dependencies: string[] // Array of milestone IDs
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TimelineEvent {
  id: string
  request_id: string
  event_type: 'call' | 'meeting' | 'issue' | 'note' | 'delay' | 'escalation'
  title: string
  description?: string
  event_date: string
  created_by: string
  created_by_role: 'admin' | 'supervisor' | 'technician'
  is_flagged: boolean
  flag_color: 'green' | 'blue' | 'yellow' | 'red'
  metadata: Record<string, any>
  created_at: string
}

export interface TimelineData {
  milestones: MaintenanceTimeline[]
  events: TimelineEvent[]
  request: MaintenanceRequest
  vehicles: MaintenanceVehicle[]
}

export interface VehicleStatus {
  id: string
  request_id: string
  vehicle_id: string
  gps_tracker_status: 'working' | 'faulty' | 'needs_calibration' | 'unknown'
  fuel_sensor_status: 'accurate' | 'inaccurate' | 'needs_replacement' | 'unknown'
  fuel_tank_calibration: 'calibrated' | 'needs_calibration' | 'completed' | 'unknown'
  gps_positioning_status: 'accurate' | 'drift_issues' | 'signal_problems' | 'unknown'
  grounding_status: 'proper' | 'loose' | 'corroded' | 'unknown'
  power_voltage_status: 'normal' | 'low' | 'fluctuating' | 'critical' | 'unknown'
  last_updated_by?: string
  created_at: string
  updated_at: string
}

export interface MaintenanceIssue {
  id: string
  request_id: string
  issue_type: 'wiring' | 'fuse' | 'electrical' | 'resource_delay' | 'other'
  issue_title: string
  issue_description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  location?: string
  status: 'open' | 'in_progress' | 'resolved' | 'deferred'
  reported_by: string
  assigned_to?: string
  resolution_notes?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface MaintenanceAction {
  id: string
  request_id: string
  action_type: 'status_update' | 'comment_added' | 'task_completed' | 'issue_reported' | 'assignment_changed' | 'other'
  action_description: string
  performed_by: string
  performed_by_type: 'admin' | 'supervisor' | 'technician'
  metadata: Record<string, any>
  created_at: string
}

export interface MaintenanceHistoryEntry {
  date: string
  action: string
  performed_by: string
  notes?: string
}

export interface ProgressMilestone {
  name: string
  completed: boolean
  order: number
  completed_at?: string
  completed_by?: string
}

// Pricing constants
export const MAINTENANCE_PRICES: Record<MaintenanceType, number> = {
  offline: 600,
  fls: 800,
  calibration: 1200,
  fls_calibration: 1400,
}

export const PER_DIEM_RATE = 1600 // ETB per crew member per day

export const TRANSPORTATION_RATES: Record<string, number> = {
  'Addis Ababa': 0,
  'Dire Dawa': 2000,
  'Hawassa': 1500,
  'Mekelle': 2500,
  'Bahir Dar': 2000,
  'Jimma': 1800,
  'Adama': 800,
  'Gondar': 2200,
  'Awash': 1200,
}