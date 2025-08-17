// Role-based permissions for timeline functionality
export type UserRole = 'admin' | 'supervisor' | 'technician'
export type MilestoneType = 'major' | 'minor' | 'event' | 'deadline'
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled'

export interface TimelinePermissions {
  // View permissions
  canViewFullTimeline: boolean
  canViewAllMilestones: boolean
  canViewCriticalPath: boolean
  canViewResourceAllocation: boolean
  canViewAnalytics: boolean
  
  // Create permissions
  canCreateMajorMilestones: boolean
  canCreateMinorMilestones: boolean
  canCreateEvents: boolean
  canCreateDeadlines: boolean
  
  // Edit permissions
  canEditOwnMilestones: boolean
  canEditAllMilestones: boolean
  canEditAssignedMilestones: boolean
  canRescheduleMilestones: boolean
  canUpdateProgress: boolean
  
  // Delete permissions
  canDeleteOwnMilestones: boolean
  canDeleteAllMilestones: boolean
  
  // Assignment permissions
  canAssignTechnicians: boolean
  canReassignWork: boolean
  
  // Advanced permissions
  canCreateTemplates: boolean
  canManageEscalations: boolean
  canGenerateReports: boolean
  canBulkUpdate: boolean
}

export const getTimelinePermissions = (userRole: UserRole): TimelinePermissions => {
  switch (userRole) {
    case 'admin':
      return {
        // View permissions - Admin can see everything
        canViewFullTimeline: true,
        canViewAllMilestones: true,
        canViewCriticalPath: true,
        canViewResourceAllocation: true,
        canViewAnalytics: true,
        
        // Create permissions - Admin can create anything
        canCreateMajorMilestones: true,
        canCreateMinorMilestones: true,
        canCreateEvents: true,
        canCreateDeadlines: true,
        
        // Edit permissions - Admin can edit everything
        canEditOwnMilestones: true,
        canEditAllMilestones: true,
        canEditAssignedMilestones: true,
        canRescheduleMilestones: true,
        canUpdateProgress: true,
        
        // Delete permissions - Admin can delete anything
        canDeleteOwnMilestones: true,
        canDeleteAllMilestones: true,
        
        // Assignment permissions - Admin can assign anyone
        canAssignTechnicians: true,
        canReassignWork: true,
        
        // Advanced permissions - Admin has all advanced features
        canCreateTemplates: true,
        canManageEscalations: true,
        canGenerateReports: true,
        canBulkUpdate: true
      }
      
    case 'supervisor':
      return {
        // View permissions - Supervisor can see project-level info
        canViewFullTimeline: true,
        canViewAllMilestones: true,
        canViewCriticalPath: true,
        canViewResourceAllocation: true,
        canViewAnalytics: true,
        
        // Create permissions - Supervisor can create most things
        canCreateMajorMilestones: false, // Only admin can create major milestones
        canCreateMinorMilestones: true,
        canCreateEvents: true,
        canCreateDeadlines: true,
        
        // Edit permissions - Supervisor can edit own and assigned work
        canEditOwnMilestones: true,
        canEditAllMilestones: false,
        canEditAssignedMilestones: true,
        canRescheduleMilestones: true,
        canUpdateProgress: true,
        
        // Delete permissions - Supervisor can delete own work
        canDeleteOwnMilestones: true,
        canDeleteAllMilestones: false,
        
        // Assignment permissions - Supervisor can assign technicians
        canAssignTechnicians: true,
        canReassignWork: true,
        
        // Advanced permissions - Limited advanced features
        canCreateTemplates: false,
        canManageEscalations: true,
        canGenerateReports: true,
        canBulkUpdate: false
      }
      
    case 'technician':
      return {
        // View permissions - Technician sees assigned work only
        canViewFullTimeline: false,
        canViewAllMilestones: false,
        canViewCriticalPath: false,
        canViewResourceAllocation: false,
        canViewAnalytics: false,
        
        // Create permissions - Technician can create events and notes
        canCreateMajorMilestones: false,
        canCreateMinorMilestones: false,
        canCreateEvents: true,
        canCreateDeadlines: false,
        
        // Edit permissions - Technician can only update assigned work
        canEditOwnMilestones: false,
        canEditAllMilestones: false,
        canEditAssignedMilestones: true,
        canRescheduleMilestones: false,
        canUpdateProgress: true,
        
        // Delete permissions - Technician can delete own events
        canDeleteOwnMilestones: false,
        canDeleteAllMilestones: false,
        
        // Assignment permissions - No assignment permissions
        canAssignTechnicians: false,
        canReassignWork: false,
        
        // Advanced permissions - No advanced features
        canCreateTemplates: false,
        canManageEscalations: false,
        canGenerateReports: false,
        canBulkUpdate: false
      }
      
    default:
      // Default to most restrictive permissions
      return {
        canViewFullTimeline: false,
        canViewAllMilestones: false,
        canViewCriticalPath: false,
        canViewResourceAllocation: false,
        canViewAnalytics: false,
        canCreateMajorMilestones: false,
        canCreateMinorMilestones: false,
        canCreateEvents: false,
        canCreateDeadlines: false,
        canEditOwnMilestones: false,
        canEditAllMilestones: false,
        canEditAssignedMilestones: false,
        canRescheduleMilestones: false,
        canUpdateProgress: false,
        canDeleteOwnMilestones: false,
        canDeleteAllMilestones: false,
        canAssignTechnicians: false,
        canReassignWork: false,
        canCreateTemplates: false,
        canManageEscalations: false,
        canGenerateReports: false,
        canBulkUpdate: false
      }
  }
}

export const canUserUpdateMilestone = (
  userRole: UserRole,
  userName: string,
  milestone: {
    created_by: string
    assigned_to?: string
    milestone_type: MilestoneType
    status: MilestoneStatus
  }
): boolean => {
  const permissions = getTimelinePermissions(userRole)
  
  // Can't update completed or cancelled milestones
  if (milestone.status === 'completed' || milestone.status === 'cancelled') {
    return false
  }
  
  // Admin can update everything
  if (userRole === 'admin') {
    return permissions.canEditAllMilestones
  }
  
  // Check if user created the milestone
  if (milestone.created_by === userName && permissions.canEditOwnMilestones) {
    return true
  }
  
  // Check if user is assigned to the milestone
  if (milestone.assigned_to === userName && permissions.canEditAssignedMilestones) {
    return true
  }
  
  // Supervisor can edit non-major milestones
  if (userRole === 'supervisor' && milestone.milestone_type !== 'major') {
    return permissions.canEditAllMilestones
  }
  
  return false
}

export const canUserCreateMilestone = (
  userRole: UserRole,
  milestoneType: MilestoneType
): boolean => {
  const permissions = getTimelinePermissions(userRole)
  
  switch (milestoneType) {
    case 'major':
      return permissions.canCreateMajorMilestones
    case 'minor':
      return permissions.canCreateMinorMilestones
    case 'event':
      return permissions.canCreateEvents
    case 'deadline':
      return permissions.canCreateDeadlines
    default:
      return false
  }
}

export const canUserDeleteMilestone = (
  userRole: UserRole,
  userName: string,
  milestone: {
    created_by: string
    milestone_type: MilestoneType
  }
): boolean => {
  const permissions = getTimelinePermissions(userRole)
  
  // Admin can delete everything
  if (permissions.canDeleteAllMilestones) {
    return true
  }
  
  // User can delete own milestones if they have permission
  if (milestone.created_by === userName && permissions.canDeleteOwnMilestones) {
    return true
  }
  
  return false
}

export const getVisibleMilestones = (
  userRole: UserRole,
  userName: string,
  milestones: Array<{
    id: string
    created_by: string
    assigned_to?: string
    milestone_type: MilestoneType
  }>
) => {
  const permissions = getTimelinePermissions(userRole)

  // Admin and supervisor can see all milestones
  if (permissions.canViewAllMilestones) {
    return milestones
  }

  // Technician can see:
  // 1. Milestones assigned to them
  // 2. Milestones they created
  // 3. Unassigned milestones (so they can see the overall timeline)
  return milestones.filter(milestone =>
    milestone.assigned_to === userName ||
    milestone.created_by === userName ||
    !milestone.assigned_to // Show unassigned milestones
  )
}
