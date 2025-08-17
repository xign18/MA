import { createClient } from '@supabase/supabase-js'
import type {
  Technician,
  MaintenanceComment,
  TaskProgress,
  VehicleStatus,
  MaintenanceIssue,
  MaintenanceAction,
  MaintenanceTimeline,
  TimelineEvent,
  TimelineData
} from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Company {
  id: string
  name: string
  code: string
  contact_email?: string
  contact_phone?: string
  address?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupervisorProfile {
  id: string
  name: string
  email?: string
  phone?: string
  username?: string
  company_id: string
  is_active: boolean
  role: string
  auth_user_id?: string
  last_login?: string
  login_attempts?: number
  locked_until?: string
  created_by_admin_id?: string
  created_at: string
  updated_at: string
  companies?: Company
}

export interface SupervisorAuthResult {
  success: boolean
  error?: string
  supervisor?: SupervisorProfile
  company?: Company
  message?: string
}

export interface MaintenanceRequest {
  id: string
  owner_name: string
  contact_number: string
  company_name?: string
  company_id?: string
  supervisor_id?: string
  supervisor_name?: string
  total_cost: number
  breakdown: {
    maintenanceFees: number
    perDiem: number
    transportation: number
    workDays: number
    crewCount: number
    total: number
  }
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'general' | 'emergency' | 'preventive' | 'repair'
  estimated_completion?: string
  notes?: string
  technician_notes?: string
  created_at: string
  updated_at: string
  companies?: Company
  supervisor_profiles?: SupervisorProfile
}

export interface MaintenanceVehicle {
  id: string
  request_id: string
  plate_number: string
  location: string
  maintenance_types: string[]
  created_at: string
}

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'user' // Default role
      }
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Database helper functions
export const createMaintenanceRequest = async (
  requestData: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at' | 'status'>,
  vehicles: Omit<MaintenanceVehicle, 'id' | 'request_id' | 'created_at'>[],
  supervisorProfile?: SupervisorProfile
) => {
  try {
    console.log('Creating maintenance request with data:', requestData)
    console.log('Creating vehicles with data:', vehicles)
    console.log('Supervisor profile:', supervisorProfile)

    // Prepare request data with company association
    const finalRequestData = {
      ...requestData,
      company_id: supervisorProfile?.company_id || requestData.company_id,
      supervisor_id: supervisorProfile?.id || requestData.supervisor_id,
      supervisor_name: supervisorProfile?.name || requestData.supervisor_name
    }

    // Insert maintenance request with company association
    const { data: request, error: requestError } = await supabase
      .from('maintenance_requests')
      .insert([finalRequestData])
      .select()
      .single()

    if (requestError) {
      console.error('Request creation error:', requestError)
      console.error('Request error details:', {
        code: requestError.code,
        message: requestError.message,
        details: requestError.details,
        hint: requestError.hint
      })
      throw requestError
    }

    console.log('Request created successfully:', request)

    // Insert vehicles
    const vehiclesWithRequestId = vehicles.map(vehicle => ({
      ...vehicle,
      request_id: request.id
    }))

    console.log('Inserting vehicles with request_id:', vehiclesWithRequestId)

    const { data: vehicleData, error: vehicleError } = await supabase
      .from('maintenance_vehicles')
      .insert(vehiclesWithRequestId)
      .select()

    if (vehicleError) {
      console.error('Vehicle creation error:', vehicleError)
      console.error('Vehicle error details:', {
        code: vehicleError.code,
        message: vehicleError.message,
        details: vehicleError.details,
        hint: vehicleError.hint
      })
      throw vehicleError
    }

    console.log('Vehicles created successfully:', vehicleData)

    // Initialize task progress for the new request
    try {
      await initializeTaskProgress(request.id)
      console.log('Task progress initialized for request:', request.id)
    } catch (taskError) {
      console.warn('Failed to initialize task progress:', taskError)
      // Don't fail the entire request creation for this
    }

    return { request, vehicles: vehicleData, error: null }
  } catch (error) {
    console.error('Error creating maintenance request:', error)
    return { request: null, vehicles: null, error }
  }
}

// Company management functions
export const getCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return { data, error }
}

export const getSupervisorProfiles = async () => {
  const { data, error } = await supabase
    .from('supervisor_profiles')
    .select(`
      *,
      companies (*)
    `)
    .eq('is_active', true)
    .order('name')

  return { data, error }
}

export const getSupervisorByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('supervisor_profiles')
    .select(`
      *,
      companies (*)
    `)
    .eq('email', email)
    .eq('is_active', true)
    .single()

  return { data, error }
}

// Supervisor Authentication Functions
export const authenticateSupervisor = async (login: string, password: string): Promise<SupervisorAuthResult> => {
  try {
    const { data, error } = await supabase.rpc('authenticate_supervisor', {
      p_login: login,
      p_password: password
    })

    if (error) {
      console.error('Authentication error:', error)
      return { success: false, error: 'Authentication failed' }
    }

    return data as SupervisorAuthResult
  } catch (err: any) {
    console.error('Authentication exception:', err)
    return { success: false, error: 'Authentication failed' }
  }
}

export const createSupervisorAccount = async (
  name: string,
  email: string,
  phone: string | null,
  username: string | null,
  password: string,
  companyId: string,
  createdByAdminId?: string
) => {
  try {
    const { data, error } = await supabase.rpc('create_supervisor_account', {
      p_name: name,
      p_email: email,
      p_phone: phone || '',
      p_username: username || '',
      p_password: password,
      p_company_id: companyId,
      p_created_by_admin_id: createdByAdminId || ''
    })

    if (error) {
      console.error('Create supervisor error:', error)
      return { success: false, error: 'Failed to create supervisor account' }
    }

    return data
  } catch (err: any) {
    console.error('Create supervisor exception:', err)
    return { success: false, error: 'Failed to create supervisor account' }
  }
}

export const resetSupervisorPassword = async (
  supervisorId: string,
  newPassword: string,
  adminId?: string
) => {
  try {
    const { data, error } = await supabase.rpc('reset_supervisor_password', {
      p_supervisor_id: supervisorId,
      p_new_password: newPassword,
      p_admin_id: adminId || ''
    })

    if (error) {
      console.error('Reset password error:', error)
      return { success: false, error: 'Failed to reset password' }
    }

    return data
  } catch (err: any) {
    console.error('Reset password exception:', err)
    return { success: false, error: 'Failed to reset password' }
  }
}

export const updateSupervisorProfile = async (
  supervisorId: string,
  updates: Partial<SupervisorProfile>
) => {
  const { data, error } = await supabase
    .from('supervisor_profiles')
    .update(updates)
    .eq('id', supervisorId)
    .select()
    .single()

  return { data, error }
}

export const deleteSupervisorAccount = async (supervisorId: string) => {
  const { data, error } = await supabase
    .from('supervisor_profiles')
    .update({ is_active: false })
    .eq('id', supervisorId)
    .select()
    .single()

  return { data, error }
}

export const getMaintenanceRequests = async () => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      maintenance_vehicles (*),
      companies (*),
      supervisor_profiles (*)
    `)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Admin: Get all requests (including pending ones)
export const getAllMaintenanceRequests = async () => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      maintenance_vehicles (*),
      companies (*),
      supervisor_profiles (*)
    `)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Admin: Get pending requests that need approval
export const getPendingMaintenanceRequests = async () => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      maintenance_vehicles (*),
      companies (*),
      supervisor_profiles (*)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return { data, error }
}

// Admin: Get requests by company
export const getMaintenanceRequestsByCompany = async (companyId: string) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      maintenance_vehicles (*),
      companies (*),
      supervisor_profiles (*)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Technician: Get only approved requests assigned to them
export const getAssignedMaintenanceRequests = async (technicianName: string) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      maintenance_vehicles (*),
      companies (*),
      supervisor_profiles (*)
    `)
    .eq('assigned_to', technicianName)
    .in('status', ['approved', 'in_progress', 'completed'])
    .order('created_at', { ascending: false })

  return { data, error }
}

// Supervisor: Get all non-pending requests (approved, in_progress, completed)
export const getApprovedMaintenanceRequests = async () => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      maintenance_vehicles (*),
      companies (*),
      supervisor_profiles (*)
    `)
    .in('status', ['approved', 'in_progress', 'completed'])
    .order('created_at', { ascending: false })

  return { data, error }
}

// Supervisor: Get requests for specific company
export const getApprovedMaintenanceRequestsByCompany = async (companyId: string) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      maintenance_vehicles (*),
      companies (*),
      supervisor_profiles (*)
    `)
    .eq('company_id', companyId)
    .in('status', ['approved', 'in_progress', 'completed'])
    .order('created_at', { ascending: false })

  return { data, error }
}

export const updateMaintenanceRequestStatus = async (id: string, status: MaintenanceRequest['status']) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Enhanced operations for new functionality

// Technician operations
export const getTechnicians = async () => {
  const { data, error } = await supabase
    .from('technicians')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return { data, error }
}

export const createTechnician = async (technician: Omit<Technician, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('technicians')
    .insert([technician])
    .select()
    .single()

  return { data, error }
}

// Comment operations
export const getRequestComments = async (requestId: string) => {
  const { data, error } = await supabase
    .from('maintenance_comments')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })

  return { data, error }
}

export const addComment = async (comment: Omit<MaintenanceComment, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('maintenance_comments')
    .insert([comment])
    .select()
    .single()

  // Log the action
  if (!error && data) {
    await logMaintenanceAction({
      request_id: comment.request_id,
      action_type: 'comment_added',
      action_description: `Comment added by ${comment.author_name}`,
      performed_by: comment.author_name,
      performed_by_type: comment.author_type,
      metadata: { comment_id: data.id }
    })
  }

  return { data, error }
}

// Task progress operations
export const getTaskProgress = async (requestId: string) => {
  const { data, error } = await supabase
    .from('task_progress')
    .select('*')
    .eq('request_id', requestId)
    .order('order_index')

  return { data, error }
}

export const initializeTaskProgress = async (requestId: string) => {
  const defaultTasks = [
    { name: 'Initial Inspection', description: 'Perform initial vehicle inspection', order: 1 },
    { name: 'Diagnostic Check', description: 'Run diagnostic tests on vehicle systems', order: 2 },
    { name: 'Parts Procurement', description: 'Order and receive necessary parts', order: 3 },
    { name: 'Repair/Maintenance', description: 'Perform required maintenance work', order: 4 },
    { name: 'Testing & Calibration', description: 'Test systems and calibrate as needed', order: 5 },
    { name: 'Final Inspection', description: 'Final quality check and documentation', order: 6 }
  ]

  const taskData = defaultTasks.map(task => ({
    request_id: requestId,
    task_name: task.name,
    task_description: task.description,
    order_index: task.order,
    is_completed: false
  }))

  const { data, error } = await supabase
    .from('task_progress')
    .insert(taskData)
    .select()

  return { data, error }
}

export const updateTaskProgress = async (taskId: string, updates: Partial<TaskProgress>) => {
  const { data, error } = await supabase
    .from('task_progress')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  // Log the action if task was completed
  if (!error && data && updates.is_completed) {
    await logMaintenanceAction({
      request_id: data.request_id,
      action_type: 'task_completed',
      action_description: `Task "${data.task_name}" completed`,
      performed_by: updates.completed_by || 'Unknown',
      performed_by_type: 'technician',
      metadata: { task_id: taskId }
    })
  }

  return { data, error }
}

// Vehicle status operations
export const getVehicleStatus = async (requestId: string) => {
  const { data, error } = await supabase
    .from('vehicle_status')
    .select('*')
    .eq('request_id', requestId)

  return { data, error }
}

export const createVehicleStatus = async (statusData: Omit<VehicleStatus, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('vehicle_status')
    .insert([statusData])
    .select()
    .single()

  return { data, error }
}

export const updateVehicleStatus = async (statusId: string, updates: Partial<VehicleStatus>) => {
  const { data, error } = await supabase
    .from('vehicle_status')
    .update(updates)
    .eq('id', statusId)
    .select()
    .single()

  return { data, error }
}

// Issue operations
export const getRequestIssues = async (requestId: string) => {
  const { data, error } = await supabase
    .from('maintenance_issues')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const createIssue = async (issue: Omit<MaintenanceIssue, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('maintenance_issues')
    .insert([issue])
    .select()
    .single()

  // Log the action
  if (!error && data) {
    await logMaintenanceAction({
      request_id: issue.request_id,
      action_type: 'issue_reported',
      action_description: `Issue reported: ${issue.issue_title}`,
      performed_by: issue.reported_by,
      performed_by_type: 'technician',
      metadata: { issue_id: data.id, severity: issue.severity }
    })
  }

  return { data, error }
}

export const updateIssue = async (issueId: string, updates: Partial<MaintenanceIssue>) => {
  const { data, error } = await supabase
    .from('maintenance_issues')
    .update(updates)
    .eq('id', issueId)
    .select()
    .single()

  return { data, error }
}

// Action log operations
export const getMaintenanceActions = async (requestId: string) => {
  const { data, error } = await supabase
    .from('maintenance_actions')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const logMaintenanceAction = async (action: Omit<MaintenanceAction, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('maintenance_actions')
    .insert([action])
    .select()
    .single()

  return { data, error }
}

// Enhanced maintenance request operations

// Admin-only: Approve a maintenance request
export const approveMaintenanceRequest = async (requestId: string, approvedBy: string) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update({
      status: 'approved',
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .eq('status', 'pending') // Only allow approval of pending requests
    .select()
    .single()

  // Log the approval
  if (!error && data) {
    await logMaintenanceAction({
      request_id: requestId,
      action_type: 'status_changed',
      action_description: `Request approved by admin`,
      performed_by: approvedBy,
      performed_by_type: 'admin',
      metadata: { previous_status: 'pending', new_status: 'approved' }
    })
  }

  return { data, error }
}

// Admin-only: Approve and assign technician in one action
export const approveAndAssignTechnician = async (requestId: string, technicianName: string, approvedBy: string) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update({
      status: 'approved',
      assigned_to: technicianName,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .eq('status', 'pending') // Only allow approval of pending requests
    .select()
    .single()

  // Log the approval and assignment
  if (!error && data) {
    await logMaintenanceAction({
      request_id: requestId,
      action_type: 'approved_and_assigned',
      action_description: `Request approved and assigned to technician: ${technicianName}`,
      performed_by: approvedBy,
      performed_by_type: 'admin',
      metadata: { technician_name: technicianName, previous_status: 'pending' }
    })
  }

  return { data, error }
}

// Admin-only: Assign technician to already approved request
export const assignTechnician = async (requestId: string, technicianName: string, assignedBy: string) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update({
      assigned_to: technicianName,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .in('status', ['approved', 'in_progress']) // Only allow assignment to approved or in-progress requests
    .select()
    .single()

  // Log the assignment
  if (!error && data) {
    await logMaintenanceAction({
      request_id: requestId,
      action_type: 'assignment_changed',
      action_description: `Assigned to technician: ${technicianName}`,
      performed_by: assignedBy,
      performed_by_type: 'admin',
      metadata: { technician_name: technicianName }
    })
  }

  return { data, error }
}

export const updateRequestProgress = async (requestId: string, percentage: number, updatedBy: string) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update({ completion_percentage: percentage })
    .eq('id', requestId)
    .select()
    .single()

  // Log the progress update
  if (!error && data) {
    await logMaintenanceAction({
      request_id: requestId,
      action_type: 'status_update',
      action_description: `Progress updated to ${percentage}%`,
      performed_by: updatedBy,
      performed_by_type: 'technician',
      metadata: { completion_percentage: percentage }
    })
  }

  return { data, error }
}

// Timeline operations
export const getTimeline = async (requestId: string) => {
  const [milestonesResult, eventsResult] = await Promise.all([
    supabase
      .from('maintenance_timeline')
      .select('*')
      .eq('request_id', requestId)
      .order('order_index'),
    supabase
      .from('timeline_events')
      .select('*')
      .eq('request_id', requestId)
      .order('event_date')
  ])

  return {
    milestones: milestonesResult.data || [],
    events: eventsResult.data || [],
    error: milestonesResult.error || eventsResult.error
  }
}

export const createMilestone = async (milestoneData: Omit<MaintenanceTimeline, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('maintenance_timeline')
    .insert([milestoneData])
    .select()
    .single()

  return { data, error }
}

export const updateMilestone = async (milestoneId: string, updates: Partial<MaintenanceTimeline>) => {
  const { data, error } = await supabase
    .from('maintenance_timeline')
    .update(updates)
    .eq('id', milestoneId)
    .select()
    .single()

  return { data, error }
}

export const deleteMilestone = async (milestoneId: string) => {
  const { data, error } = await supabase
    .from('maintenance_timeline')
    .delete()
    .eq('id', milestoneId)

  return { data, error }
}

export const updateMilestoneProgress = async (milestoneId: string, percentage: number, status?: string) => {
  const updates: any = {
    completion_percentage: percentage
  }

  if (status) {
    updates.status = status
  }

  if (percentage === 100) {
    updates.status = 'completed'
    updates.actual_date = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('maintenance_timeline')
    .update(updates)
    .eq('id', milestoneId)
    .select()
    .single()

  return { data, error }
}

export const updateMilestoneDate = async (milestoneId: string, newDate: string) => {
  const { data, error } = await supabase
    .from('maintenance_timeline')
    .update({
      planned_date: newDate,
      updated_at: new Date().toISOString()
    })
    .eq('id', milestoneId)
    .select()
    .single()

  return { data, error }
}

export const createTimelineEvent = async (eventData: Omit<TimelineEvent, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('timeline_events')
    .insert([eventData])
    .select()
    .single()

  return { data, error }
}

export const updateTimelineEvent = async (eventId: string, updates: Partial<TimelineEvent>) => {
  const { data, error } = await supabase
    .from('timeline_events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()

  return { data, error }
}

export const deleteTimelineEvent = async (eventId: string) => {
  const { data, error } = await supabase
    .from('timeline_events')
    .delete()
    .eq('id', eventId)

  return { data, error }
}

export const getTimelineData = async (requestId: string) => {
  const [timelineResult, requestResult, vehiclesResult] = await Promise.all([
    getTimeline(requestId),
    supabase
      .from('maintenance_requests')
      .select('*')
      .eq('id', requestId)
      .single(),
    supabase
      .from('maintenance_vehicles')
      .select('*')
      .eq('request_id', requestId)
  ])

  return {
    milestones: timelineResult.milestones,
    events: timelineResult.events,
    request: requestResult.data,
    vehicles: vehiclesResult.data || [],
    error: timelineResult.error || requestResult.error || vehiclesResult.error
  }
}