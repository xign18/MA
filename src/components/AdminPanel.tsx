import React, { useState, useEffect } from 'react'
import { Settings, LogOut, FileText, Clock, CheckCircle, XCircle, MapPin, Wrench, Users, MessageCircle, BarChart3, UserCheck, AlertTriangle, Plus, User } from 'lucide-react'
import {
  signOut,
  getAllMaintenanceRequests,
  getPendingMaintenanceRequests,
  getAssignedMaintenanceRequests,
  getApprovedMaintenanceRequests,
  getMaintenanceRequestsByCompany,
  getCompanies,
  createMaintenanceRequest,
  updateMaintenanceRequestStatus,
  approveMaintenanceRequest,
  approveAndAssignTechnician,
  assignTechnician,
  type MaintenanceRequest,
  type MaintenanceVehicle,
  type Company
} from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { MaintenanceRequestForm } from './MaintenanceRequestForm'
import { CommentSystem } from './CommentSystem'
import { ProgressTracker } from './ProgressTracker'
import { TechnicianAssignment } from './TechnicianAssignment'
import { VehicleStatusTracker } from './VehicleStatusTracker'
import { IssueReporting } from './IssueReporting'
import { EnhancedTimelineViewer } from './EnhancedTimelineViewer'
import { SupervisorManagement } from './SupervisorManagement'

interface AdminPanelProps {
  onSignOut: () => void
}

interface RequestWithVehicles extends MaintenanceRequest {
  maintenance_vehicles: MaintenanceVehicle[]
}

export function AdminPanel({ onSignOut }: AdminPanelProps) {
  const { user } = useAuth()
  const [requests, setRequests] = useState<RequestWithVehicles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<RequestWithVehicles | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'create' | 'assigned' | 'supervisors'>('pending')
  const [technicianName, setTechnicianName] = useState('')
  const [isApproving, setIsApproving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [adminAsRole, setAdminAsRole] = useState<'admin' | 'supervisor' | 'technician'>('admin')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all')

  // Initial data load
  useEffect(() => {
    console.log('🔄 AdminPanel: Initial load')

    const loadInitialData = async () => {
      try {
        setLoading(true)
        console.log('📊 Loading companies...')
        await loadCompanies()
        console.log('📊 Loading requests...')
        await loadRequests()
        console.log('✅ Initial load complete')
      } catch (error) {
        console.error('❌ Initial load error:', error)
        setError(error.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, []) // Only run once on mount

  // Reload requests when tab or company changes
  useEffect(() => {
    if (!loading) { // Only reload if not in initial loading state
      console.log('🔄 AdminPanel: Reloading requests for tab/company change', { activeTab, selectedCompanyId })
      loadRequests()
    }
  }, [activeTab, selectedCompanyId])

  const loadCompanies = async () => {
    console.log('🏢 AdminPanel: Loading companies...')
    try {
      const { data, error } = await getCompanies()
      if (error) throw error
      console.log('✅ AdminPanel: Companies loaded:', data?.length || 0)
      setCompanies(data || [])
    } catch (err: any) {
      console.error('❌ AdminPanel: Failed to load companies:', err.message)
    }
  }

  const loadRequests = async () => {
    console.log('🔄 AdminPanel: Starting loadRequests...', { activeTab, selectedCompanyId })
    setError('') // Clear any previous errors

    try {
      let data, error

      // If a specific company is selected, filter by company
      if (selectedCompanyId !== 'all') {
        console.log('📊 Loading requests for company:', selectedCompanyId)
        ({ data, error } = await getMaintenanceRequestsByCompany(selectedCompanyId))
      } else {
        // Otherwise, load based on active tab
        console.log('📊 Loading requests for tab:', activeTab)
        switch (activeTab) {
          case 'pending':
            ({ data, error } = await getPendingMaintenanceRequests())
            break
          case 'assigned':
            // Show requests assigned to admin when acting as technician
            ({ data, error } = await getAssignedMaintenanceRequests(user?.email || 'Admin'))
            break
          case 'create':
            // For create tab, show approved requests like supervisor view
            ({ data, error } = await getApprovedMaintenanceRequests())
            break
          default:
            ({ data, error } = await getAllMaintenanceRequests())
        }
      }

      console.log('📊 Raw data loaded:', { dataCount: data?.length, error: error?.message })

      // Apply additional filtering based on tab if company is selected
      if (selectedCompanyId !== 'all' && data) {
        const originalCount = data.length
        switch (activeTab) {
          case 'pending':
            data = data.filter(req => req.status === 'pending')
            break
          case 'assigned':
            data = data.filter(req => req.assigned_to === (user?.email || 'Admin'))
            break
          case 'create':
            data = data.filter(req => ['approved', 'in_progress', 'completed'].includes(req.status))
            break
        }
        console.log('📊 Filtered data:', { originalCount, filteredCount: data.length })
      }

      if (error) {
        console.error('❌ AdminPanel: API Error:', error)
        throw error
      }

      console.log('✅ AdminPanel: Successfully loaded requests:', data?.length || 0)
      setRequests(data || [])
    } catch (err: any) {
      console.error('❌ AdminPanel: Load error:', err)
      setError(err.message || 'Failed to load requests')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    onSignOut()
  }

  const handleStatusUpdate = async (requestId: string, status: MaintenanceRequest['status']) => {
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
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    if (!user?.email) return

    setIsApproving(true)
    try {
      const { error } = await approveMaintenanceRequest(requestId, user.email)
      if (error) throw error

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: 'approved' as const } : req
      ))

      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, status: 'approved' as const } : null)
      }

      // Refresh the list to remove from pending if on pending tab
      if (activeTab === 'pending') {
        loadRequests()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsApproving(false)
    }
  }

  const handleApproveAndAssign = async (requestId: string, technicianName: string) => {
    if (!user?.email || !technicianName.trim()) return

    setIsApproving(true)
    try {
      const { error } = await approveAndAssignTechnician(requestId, technicianName.trim(), user.email)
      if (error) throw error

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: 'approved' as const, assigned_to: technicianName.trim() } : req
      ))

      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? {
          ...prev,
          status: 'approved' as const,
          assigned_to: technicianName.trim()
        } : null)
      }

      setTechnicianName('')

      // Refresh the list to remove from pending if on pending tab
      if (activeTab === 'pending') {
        loadRequests()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsApproving(false)
    }
  }

  const handleAssignTechnician = async (requestId: string, technicianName: string) => {
    if (!user?.email || !technicianName.trim()) return

    try {
      const { error } = await assignTechnician(requestId, technicianName.trim(), user.email)
      if (error) throw error

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, assigned_to: technicianName.trim() } : req
      ))

      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? {
          ...prev,
          assigned_to: technicianName.trim()
        } : null)
      }

      setTechnicianName('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCreateRequest = async (requestData: any, vehicles: any[]) => {
    try {
      const { error } = await createMaintenanceRequest(requestData, vehicles)
      if (error) throw error

      // Reload requests to show the new one
      await loadRequests()
      setShowCreateForm(false)

      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount).replace('ETB', '').trim() + ' ETB'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Wrench className="w-4 h-4 text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const maintenanceLabels = {
    offline: 'Offline Maintenance',
    fls: 'FLS Maintenance',
    calibration: 'FLS Calibration',
    fls_calibration: 'FLS Maintenance + Calibration',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage maintenance requests, users, and system settings
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Header with Tabs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Panel - Full Access
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete admin control with supervisor and technician capabilities
          </p>

          {/* Company Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Company:
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.code})
                </option>
              ))}
            </select>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Pending Approval</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>All Requests</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Request</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'assigned'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>My Assignments</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('supervisors')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'supervisors'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Supervisors</span>
              </div>
            </button>
          </div>
        </div>

        {/* Show Create Form */}
        {activeTab === 'create' && showCreateForm && (
          <MaintenanceRequestForm
            onSubmit={handleCreateRequest}
            onCancel={() => setShowCreateForm(false)}
            userProfile={{ full_name: user?.email || 'Admin', email: user?.email || '' }}
          />
        )}

        {/* Show Create Button */}
        {activeTab === 'create' && !showCreateForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Maintenance Request
            </button>
          </div>
        )}

        {/* Supervisor Management */}
        {activeTab === 'supervisors' && (
          <SupervisorManagement currentAdminId={user?.id} />
        )}

        {activeTab !== 'supervisors' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {activeTab === 'pending' ? 'Pending Requests' :
                     activeTab === 'assigned' ? 'My Assignments' :
                     activeTab === 'create' ? 'Approved Requests' : 'All Requests'}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {requests.length} {
                      activeTab === 'pending' ? 'pending' :
                      activeTab === 'assigned' ? 'assigned' :
                      activeTab === 'create' ? 'approved' : 'total'
                    } requests
                  </span>
                </div>
              </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {requests.length === 0 ? (
                    <div className="p-8 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No requests yet</h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Maintenance requests will appear here when submitted
                      </p>
                    </div>
                  ) : (
                    requests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          selectedRequest?.id === request.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {request.owner_name}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>Contact: {request.contact_number}</p>
                              {request.company_name && <p>Company: {request.company_name}</p>}
                              <p>Vehicles: {request.maintenance_vehicles?.length || 0}</p>
                              <p>Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {formatCurrency(request.total_cost)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
          </div>

          {/* Enhanced Detailed View */}
          <div className="lg:col-span-1">
            {selectedRequest ? (
              <div className="space-y-6">
                {/* Basic Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Request Details
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1 capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Owner Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Owner Information</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p><strong>Name:</strong> {selectedRequest.owner_name}</p>
                        <p><strong>Contact:</strong> {selectedRequest.contact_number}</p>
                        {selectedRequest.company_name && (
                          <p><strong>Company:</strong> {selectedRequest.company_name}</p>
                        )}
                        <p><strong>Submitted:</strong> {new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Cost Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cost Summary</h4>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(selectedRequest.total_cost)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedRequest.maintenance_vehicles?.length || 0} vehicle(s)
                        </div>
                      </div>
                    </div>

                    {/* Approval and Assignment Actions */}
                    {selectedRequest.status === 'pending' && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Approval Required</h4>

                        {/* Simple Approval */}
                        <button
                          onClick={() => handleApproveRequest(selectedRequest.id)}
                          disabled={isApproving}
                          className="w-full mb-3 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{isApproving ? 'Approving...' : 'Approve Request'}</span>
                        </button>

                        {/* Approve and Assign */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Or approve and assign technician:
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={technicianName}
                              onChange={(e) => setTechnicianName(e.target.value)}
                              placeholder="Technician name"
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleApproveAndAssign(selectedRequest.id, technicianName)}
                              disabled={isApproving || !technicianName.trim()}
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-1"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Approve & Assign</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assignment for Approved Requests */}
                    {selectedRequest.status === 'approved' && !selectedRequest.assigned_to && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Assign Technician</h4>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={technicianName}
                            onChange={(e) => setTechnicianName(e.target.value)}
                            placeholder="Technician name"
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => handleAssignTechnician(selectedRequest.id, technicianName)}
                            disabled={!technicianName.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Assign</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Current Assignment Display */}
                    {selectedRequest.assigned_to && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Assigned Technician</h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              {selectedRequest.assigned_to}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status Actions for Non-Pending Requests */}
                    {selectedRequest.status !== 'pending' && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Status Actions</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedRequest.status === 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(selectedRequest.id, 'in_progress')}
                              className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              Start Work
                            </button>
                          )}
                          {selectedRequest.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusUpdate(selectedRequest.id, 'completed')}
                              className="px-3 py-2 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusUpdate(selectedRequest.id, 'cancelled')}
                            disabled={selectedRequest.status === 'completed'}
                            className="px-3 py-2 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment handled in the approval section above */}

                {/* Progress Tracker */}
                <ProgressTracker
                  requestId={selectedRequest.id}
                  currentUser={{
                    name: user?.email || 'Admin',
                    type: 'admin'
                  }}
                />

                {/* Vehicle Status for each vehicle */}
                {selectedRequest.maintenance_vehicles?.map((vehicle) => (
                  <VehicleStatusTracker
                    key={vehicle.id}
                    requestId={selectedRequest.id}
                    vehicleId={vehicle.id}
                    vehiclePlateNumber={vehicle.plate_number}
                    currentUser={{
                      name: user?.email || 'Admin',
                      type: 'admin'
                    }}
                  />
                ))}

                {/* Issue Reporting */}
                <IssueReporting
                  requestId={selectedRequest.id}
                  currentUser={{
                    name: user?.email || 'Admin',
                    type: 'admin'
                  }}
                />

                {/* Enhanced Timeline Viewer - Admin has full access */}
                <EnhancedTimelineViewer
                  requestId={selectedRequest.id}
                  userRole="admin"
                  userName={user?.email || 'Admin'}
                  readOnly={false}
                />

                {/* Comment System */}
                <CommentSystem
                  requestId={selectedRequest.id}
                  currentUser={{
                    name: user?.email || 'Admin',
                    type: 'admin'
                  }}
                />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Select a Request</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Click on a request to view enhanced details, assign technicians, track progress, and manage issues
                </p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}