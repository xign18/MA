import React, { useState, useEffect } from 'react'
import { Wrench, LogOut, FileText, Clock, CheckCircle, XCircle, MapPin, User, Calendar, Settings, AlertTriangle } from 'lucide-react'
import { getAssignedMaintenanceRequests, updateMaintenanceRequestStatus, type MaintenanceRequest, type MaintenanceVehicle } from '../lib/supabase'
import { CommentSystem } from './CommentSystem'
import { ProgressTracker } from './ProgressTracker'
import { VehicleStatusTracker } from './VehicleStatusTracker'
import { IssueReporting } from './IssueReporting'
import { EnhancedTimelineViewer } from './EnhancedTimelineViewer'

interface TechnicianDashboardProps {
  onSignOut: () => void
}

interface RequestWithVehicles extends MaintenanceRequest {
  maintenance_vehicles: MaintenanceVehicle[]
}

export function TechnicianDashboard({ onSignOut }: TechnicianDashboardProps) {
  const [requests, setRequests] = useState<RequestWithVehicles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<RequestWithVehicles | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [technicianName, setTechnicianName] = useState(() => {
    return localStorage.getItem('technician_name') || ''
  })
  const [showNameInput, setShowNameInput] = useState(!technicianName)

  // Emergency timeout to prevent infinite loading
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.warn('🚨 EMERGENCY: TechnicianDashboard force loading to false after 3 seconds')
      setLoading(false)
    }, 3000)

    return () => clearTimeout(emergencyTimeout)
  }, [])

  // Initial data load
  useEffect(() => {
    console.log('🔄 TechnicianDashboard: Initial load', { technicianName })

    const loadInitialData = async () => {
      if (!technicianName) {
        console.log('⚠️ No technician name, stopping load')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('📊 Loading assigned requests for:', technicianName)

        // Direct API call instead of using loadRequests to avoid dependency issues
        const { data, error } = await getAssignedMaintenanceRequests(technicianName)
        if (error) throw error

        console.log('✅ TechnicianDashboard: Requests loaded:', data?.length || 0)
        setRequests(data || [])
        console.log('✅ Initial load complete')
      } catch (error) {
        console.error('❌ Initial load error:', error)
        setError(error.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [technicianName])

  const loadRequests = async () => {
    if (!technicianName) return

    console.log('🔄 TechnicianDashboard: Loading requests for:', technicianName)
    setError('') // Clear any previous errors

    try {
      const { data, error } = await getAssignedMaintenanceRequests(technicianName)
      if (error) throw error

      console.log('✅ TechnicianDashboard: Requests loaded:', data?.length || 0)
      setRequests(data || [])
    } catch (err: any) {
      console.error('❌ TechnicianDashboard: Load error:', err)
      setError(err.message)
    }
  }

  const handleSignOut = () => {
    onSignOut()
  }

  const saveTechnicianName = (name: string) => {
    setTechnicianName(name)
    localStorage.setItem('technician_name', name)
    setShowNameInput(false)
    // Requests will be loaded automatically via useEffect when technicianName changes
  }

  const handleStatusUpdate = async (requestId: string, status: string) => {
    setUpdatingStatus(true)
    try {
      const { error } = await updateMaintenanceRequestStatus(requestId, status)
      if (error) throw error
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status } : req
      ))
      
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, status } : null)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'approved': return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'in_progress': return <Wrench className="w-4 h-4 text-orange-600" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      case 'in_progress': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const getAvailableStatusUpdates = (currentStatus: string) => {
    switch (currentStatus) {
      case 'approved':
        return [
          { value: 'in_progress', label: 'Start Work', color: 'bg-orange-600 hover:bg-orange-700' }
        ]
      case 'in_progress':
        return [
          { value: 'completed', label: 'Mark Complete', color: 'bg-green-600 hover:bg-green-700' }
        ]
      default:
        return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading technician dashboard...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">Error: {error}</p>
              <button
                onClick={() => {
                  setError('')
                  setLoading(false)
                }}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
              >
                Continue Anyway
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Technician Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {technicianName ? `Welcome back, ${technicianName}` : 'Welcome, Technician'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {technicianName && (
                  <button
                    onClick={() => setShowNameInput(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Change Name</span>
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Technician Name Input */}
          {showNameInput && (
            <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter your name for tracking purposes:
                  </label>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.target as HTMLFormElement)
                      const name = formData.get('technician_name') as string
                      if (name.trim()) {
                        saveTechnicianName(name.trim())
                      }
                    }}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="text"
                      name="technician_name"
                      defaultValue={technicianName}
                      placeholder="Your full name"
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    {technicianName && (
                      <button
                        type="button"
                        onClick={() => setShowNameInput(false)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        Cancel
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assigned</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{requests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Wrench className="w-4 h-4 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {requests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {requests.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {requests.filter(r => r.priority === 'urgent').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Requests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assigned Requests
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {requests.length} requests assigned to you
              </p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {requests.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No approved assignments</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    You'll see approved maintenance requests assigned to you by the admin here.
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Requests must be approved and assigned before they appear in your dashboard.
                  </p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(request.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.owner_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.company_name || 'No company'}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {request.maintenance_vehicles?.length || 0} vehicles
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Priority: {request.priority}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enhanced Request Details */}
          <div className="space-y-6">
            {selectedRequest ? (
              <>
                {/* Basic Info & Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedRequest.owner_name} - {selectedRequest.maintenance_vehicles?.[0]?.plate_number}
                    </h2>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1 capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  {/* Quick Status Actions */}
                  {getAvailableStatusUpdates(selectedRequest.status).length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-3">
                        Update Status
                      </h3>
                      <div className="flex space-x-2">
                        {getAvailableStatusUpdates(selectedRequest.status).map((update) => (
                          <button
                            key={update.value}
                            onClick={() => handleStatusUpdate(selectedRequest.id, update.value)}
                            disabled={updatingStatus}
                            className={`px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${update.color}`}
                          >
                            {updatingStatus ? 'Updating...' : update.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Basic Request Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedRequest.contact_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">{selectedRequest.priority}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">{selectedRequest.category}</span>
                    </div>
                    {selectedRequest.company_name && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Company:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedRequest.company_name}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Vehicles:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedRequest.maintenance_vehicles?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Tracker */}
                {technicianName && (
                  <ProgressTracker
                    requestId={selectedRequest.id}
                    currentUser={{
                      name: technicianName,
                      type: 'technician'
                    }}
                  />
                )}

                {/* Enhanced Timeline Viewer */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  {!technicianName && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Timeline View (Read-Only)
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Enter your name above to interact with milestones and track progress
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <EnhancedTimelineViewer
                    requestId={selectedRequest.id}
                    userRole="technician"
                    userName={technicianName || 'Anonymous Technician'}
                    readOnly={!technicianName}
                  />
                </div>

                {/* Vehicle Status for each vehicle */}
                {selectedRequest.maintenance_vehicles?.map((vehicle) => (
                  <VehicleStatusTracker
                    key={vehicle.id}
                    requestId={selectedRequest.id}
                    vehicleId={vehicle.id}
                    vehiclePlateNumber={vehicle.plate_number}
                    currentUser={technicianName ? {
                      name: technicianName,
                      type: 'technician'
                    } : undefined}
                    readOnly={!technicianName}
                  />
                ))}

                {/* Issue Reporting */}
                {technicianName && (
                  <IssueReporting
                    requestId={selectedRequest.id}
                    currentUser={{
                      name: technicianName,
                      type: 'technician'
                    }}
                  />
                )}

                {/* Comment System */}
                {technicianName && (
                  <CommentSystem
                    requestId={selectedRequest.id}
                    currentUser={{
                      name: technicianName,
                      type: 'technician'
                    }}
                  />
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">No request selected</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Click on a request to view enhanced details, track progress, and manage vehicle status
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
