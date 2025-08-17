import type { MaintenanceTimeline } from './types'

export interface TimelineTemplate {
  id: string
  name: string
  description: string
  category: 'routine' | 'emergency' | 'inspection' | 'repair' | 'custom'
  estimatedDuration: number // in days
  milestones: Omit<MaintenanceTimeline, 'id' | 'request_id' | 'created_at' | 'updated_at'>[]
}

export const timelineTemplates: TimelineTemplate[] = [
  {
    id: 'routine-maintenance',
    name: 'Routine Maintenance',
    description: 'Standard routine maintenance workflow for regular vehicle servicing',
    category: 'routine',
    estimatedDuration: 5,
    milestones: [
      {
        milestone_type: 'major',
        title: 'Initial Inspection',
        description: 'Comprehensive vehicle assessment and diagnostic check',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 1,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 2, requiredTools: ['diagnostic scanner', 'basic tools'] }
      },
      {
        milestone_type: 'minor',
        title: 'Fluid Checks',
        description: 'Check and replace engine oil, brake fluid, coolant',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 2,
        is_critical: false,
        dependencies: [],
        metadata: { estimatedHours: 1, requiredParts: ['engine oil', 'oil filter'] }
      },
      {
        milestone_type: 'minor',
        title: 'Filter Replacement',
        description: 'Replace air filter, cabin filter, and fuel filter',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 3,
        is_critical: false,
        dependencies: [],
        metadata: { estimatedHours: 0.5, requiredParts: ['air filter', 'cabin filter'] }
      },
      {
        milestone_type: 'major',
        title: 'Testing & Calibration',
        description: 'System verification and performance testing',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 4,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 1, requiredTools: ['diagnostic scanner'] }
      },
      {
        milestone_type: 'major',
        title: 'Quality Assurance',
        description: 'Final inspection and quality check',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 5,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 0.5, requiredChecklist: true }
      },
      {
        milestone_type: 'deadline',
        title: 'Delivery Preparation',
        description: 'Customer handover preparation and documentation',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 6,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 0.5, requiresCustomerContact: true }
      }
    ]
  },
  {
    id: 'emergency-repair',
    name: 'Emergency Repair',
    description: 'Fast-track workflow for urgent vehicle repairs',
    category: 'emergency',
    estimatedDuration: 2,
    milestones: [
      {
        milestone_type: 'major',
        title: 'Emergency Assessment',
        description: 'Rapid diagnostic and safety evaluation',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 1,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 0.5, priority: 'urgent' }
      },
      {
        milestone_type: 'major',
        title: 'Emergency Repair',
        description: 'Execute critical repairs to restore functionality',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 2,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 4, priority: 'urgent' }
      },
      {
        milestone_type: 'major',
        title: 'Safety Verification',
        description: 'Verify repair safety and basic functionality',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 3,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 0.5, priority: 'urgent' }
      },
      {
        milestone_type: 'deadline',
        title: 'Emergency Handover',
        description: 'Quick handover with follow-up recommendations',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 4,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 0.25, requiresFollowUp: true }
      }
    ]
  },
  {
    id: 'annual-inspection',
    name: 'Annual Inspection',
    description: 'Comprehensive annual vehicle inspection and certification',
    category: 'inspection',
    estimatedDuration: 7,
    milestones: [
      {
        milestone_type: 'major',
        title: 'Pre-Inspection Review',
        description: 'Review vehicle history and prepare inspection checklist',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 1,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 1, requiresDocumentation: true }
      },
      {
        milestone_type: 'major',
        title: 'Mechanical Inspection',
        description: 'Comprehensive mechanical systems inspection',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 2,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 3, requiresCertification: true }
      },
      {
        milestone_type: 'major',
        title: 'Safety Systems Check',
        description: 'Inspect brakes, lights, signals, and safety equipment',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 3,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 2, requiresCertification: true }
      },
      {
        milestone_type: 'minor',
        title: 'Emissions Testing',
        description: 'Environmental compliance and emissions testing',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 4,
        is_critical: false,
        dependencies: [],
        metadata: { estimatedHours: 1, requiresEquipment: 'emissions tester' }
      },
      {
        milestone_type: 'major',
        title: 'Documentation & Certification',
        description: 'Complete inspection documentation and issue certificates',
        planned_date: null,
        actual_date: null,
        status: 'pending',
        completion_percentage: 0,
        assigned_to: null,
        created_by: 'system',
        created_by_role: 'admin',
        order_index: 5,
        is_critical: true,
        dependencies: [],
        metadata: { estimatedHours: 1, requiresSignature: true }
      }
    ]
  }
]

export const getTemplateByCategory = (category: TimelineTemplate['category']) => {
  return timelineTemplates.filter(template => template.category === category)
}

export const getTemplateById = (id: string) => {
  return timelineTemplates.find(template => template.id === id)
}

export const createTimelineFromTemplate = (
  templateId: string,
  requestId: string,
  startDate: Date,
  assignedTo?: string
): Omit<MaintenanceTimeline, 'id' | 'created_at' | 'updated_at'>[] => {
  const template = getTemplateById(templateId)
  if (!template) return []

  return template.milestones.map((milestone, index) => {
    const plannedDate = new Date(startDate)
    plannedDate.setDate(plannedDate.getDate() + index) // Space milestones 1 day apart

    return {
      ...milestone,
      request_id: requestId,
      planned_date: plannedDate.toISOString(),
      assigned_to: assignedTo || milestone.assigned_to,
      created_by: assignedTo || 'system'
    }
  })
}
