import React, { useState, useEffect } from 'react'
import { User, LogOut, Plus, FileText, Clock, CheckCircle, XCircle, MapPin, Wrench, Users, Settings, AlertTriangle, Building2 } from 'lucide-react'
import {
  getMaintenanceRequestsByCompany,
  createMaintenanceRequest,
  getCompanies,
  getSupervisorProfiles,
  getSupervisorByEmail,
  type MaintenanceRequest,
  type MaintenanceVehicle,
  type Company,
  type SupervisorProfile
} from '../lib/supabase'
import { MaintenanceRequestForm } from './MaintenanceRequestForm'
import { CommentSystem } from './CommentSystem'
import { ProgressTracker } from './ProgressTracker'
import { VehicleStatusTracker } from './VehicleStatusTracker'
import { EnhancedTimelineViewer } from './EnhancedTimelineViewer'

interface SupervisorDashboardProps {
  onSignOut: () => void
  supervisorProfile?: SupervisorProfile
  companyProfile?: Company
}

interface RequestWithVehicles extends MaintenanceRequest {
  maintenance_vehicles: MaintenanceVehicle[]
}

export function SupervisorDashboard({ onSignOut, supervisorProfile, companyProfile }: SupervisorDashboardProps) {
  const [requests, setRequests] = useState<RequestWithVehicles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RequestWithVehicles | null>(null)
  const [supervisorName, setSupervisorName] = useState(() => {
    return supervisorProfile?.name || localStorage.getItem('supervisor_name') || ''
  })
  const [supervisorEmail, setSupervisorEmail] = useState(() => {
    return supervisorProfile?.email || localStorage.getItem('supervisor_email') || ''
  })
  const [showNameInput, setShowNameInput] = useState(!supervisorProfile && !supervisorName)
  const [companies, setCompanies] = useState<Company[]>([])
  const [currentSupervisorProfile, setCurrentSupervisorProfile] = useState<SupervisorProfile | null>(supervisorProfile || null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(supervisorProfile?.company_id || companyProfile?.id || '')

  useEffect(() => {
    // If we have authenticated supervisor data, use it directly
    if (supervisorProfile && companyProfile) {
      setSupervisorName(supervisorProfile.name)
      setSupervisorEmail(supervisorProfile.email || '')
      setCurrentSupervisorProfile(supervisorProfile)
      setSelectedCompanyId(supervisorProfile.company_id)
      setCompanies([companyProfile])
      loadRequests()
    } else {
      // Fallback to old system for backward compatibility
      loadCompanies()
      if (supervisorEmail) {
        loadSupervisorProfile()
      }
    }
  }, [supervisorProfile, companyProfile])

  useEffect(() => {
    if (currentSupervisorProfile?.company_id) {
      setSelectedCompanyId(currentSupervisorProfile.company_id)
      loadRequests()
    }
  }, [currentSupervisorProfile])

  useEffect(() => {
    if (selectedCompanyId) {
      loadRequests()
    }
  }, [selectedCompanyId])

  const loadCompanies = async () => {
    try {
      const { data, error } = await getCompanies()
      if (error) throw error
      setCompanies(data || [])
    } catch (err: any) {
      setError(err.message)
    }
  }

  const loadSupervisorProfile = async () => {
    if (!supervisorEmail) return

    try {
      const { data, error } = await getSupervisorByEmail(supervisorEmail)
      if (error) throw error
      setCurrentSupervisorProfile(data)
    } catch (err: any) {
      console.log('Supervisor profile not found, will use manual company selection')
    }
  }

  const loadRequests = async () => {
    if (!selectedCompanyId) return

    setLoading(true)
    try {
      const { data, error } = await getMaintenanceRequestsByCompany(selectedCompanyId)
      if (error) throw error

      // Show all maintenance requests for this company (all statuses)
      setRequests(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    onSignOut()
  }

  const saveSupervisorInfo = (name: string, email: string, companyId: string) => {
    setSupervisorName(name)
    setSupervisorEmail(email)
    setSelectedCompanyId(companyId)
    localStorage.setItem('supervisor_name', name)
    localStorage.setItem('supervisor_email', email)
    localStorage.setItem('supervisor_company_id', companyId)
    setShowNameInput(false)

    // Try to load supervisor profile
    if (email) {
      loadSupervisorProfile()
    }
  }

  const handleCreateRequest = async (requestData: any, vehicles: any[]) => {
    try {
      const { error } = await createMaintenanceRequest(requestData, vehicles, currentSupervisorProfile || undefined)
      if (error) throw error

      setShowForm(false)
      await loadRequests()

      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Supervisor Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {supervisorName ? `Welcome back, ${supervisorName}` : 'Welcome, Supervisor'}
                  </p>
                  {(companyProfile || currentSupervisorProfile?.companies) && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {companyProfile?.name || currentSupervisorProfile?.companies?.name} ({companyProfile?.code || currentSupervisorProfile?.companies?.code})
                    </p>
                  )}
                  {supervisorProfile && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Authenticated as {supervisorProfile.email || supervisorProfile.username}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {supervisorName && (
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

          {/* Supervisor Information Input */}
          {showNameInput && (
            <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Supervisor Information:
                  </label>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.target as HTMLFormElement)
                      const name = formData.get('supervisor_name') as string
                      const email = formData.get('supervisor_email') as string
                      const companyId = formData.get('company_id') as string
                      if (name.trim() && companyId) {
                        saveSupervisorInfo(name.trim(), email.trim(), companyId)
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="supervisor_name"
                          defaultValue={supervisorName}
                          placeholder="Your full name"
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          name="supervisor_email"
                          defaultValue={supervisorEmail}
                          placeholder="your.email@company.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Company *
                      </label>
                      <select
                        name="company_id"
                        defaultValue={selectedCompanyId}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select your company</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>
                            {company.name} ({company.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Save Information
                      </button>
                      {supervisorName && (
                        <button
                          type="button"
                          onClick={() => setShowNameInput(false)}
                          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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

        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Maintenance Request
          </button>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requests List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Maintenance Requests
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {requests.length} total requests
              </p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {requests.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No maintenance requests</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Your maintenance requests will appear here once you create them.
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Click "New Maintenance Request" to create your first request.
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
                            {request.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          {request.status === 'pending' && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                              • Awaiting Admin Approval
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.owner_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.company_name || 'No company'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${request.total_cost.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {request.maintenance_vehicles?.length || 0} vehicles
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
                {/* Basic Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedRequest.owner_name} - Request Details
                    </h2>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1 capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedRequest.contact_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">${selectedRequest.total_cost.toLocaleString()}</span>
                    </div>
                    {selectedRequest.company_name && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Company:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedRequest.company_name}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Summary */}
                  {selectedRequest.maintenance_vehicles && selectedRequest.maintenance_vehicles.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Vehicles ({selectedRequest.maintenance_vehicles.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedRequest.maintenance_vehicles.map((vehicle) => (
                          <div key={vehicle.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {vehicle.plate_number}
                                </p>
                                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {vehicle.location}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {vehicle.maintenance_types.join(', ')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Tracker */}
                <ProgressTracker
                  requestId={selectedRequest.id}
                  currentUser={supervisorName ? {
                    name: supervisorName,
                    type: 'supervisor'
                  } : undefined}
                  readOnly={!supervisorName}
                />

                {/* Enhanced Timeline Viewer */}
                {supervisorName && (
                  <EnhancedTimelineViewer
                    requestId={selectedRequest.id}
                    userRole="supervisor"
                    userName={supervisorName}
                  />
                )}

                {/* Vehicle Status for each vehicle */}
                {selectedRequest.maintenance_vehicles?.map((vehicle) => (
                  <VehicleStatusTracker
                    key={vehicle.id}
                    requestId={selectedRequest.id}
                    vehicleId={vehicle.id}
                    vehiclePlateNumber={vehicle.plate_number}
                    currentUser={supervisorName ? {
                      name: supervisorName,
                      type: 'supervisor'
                    } : undefined}
                    readOnly={!supervisorName}
                  />
                ))}

                {/* Comment System */}
                {supervisorName && (
                  <CommentSystem
                    requestId={selectedRequest.id}
                    currentUser={{
                      name: supervisorName,
                      type: 'supervisor'
                    }}
                  />
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">No request selected</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Click on a request to view enhanced details, track progress, and add comments
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Request Form Modal */}
        {showForm && (
          <MaintenanceRequestForm
            onSubmit={handleCreateRequest}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  )
}
