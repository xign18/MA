import React, { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  AlertTriangle,
  XCircle,
  User,
  Flag,
  Phone,
  MessageSquare,
  AlertCircle,
  FileText,
  Zap,
  Filter,
  Search,
  ChevronDown,
  GripVertical,
  Save,
  X,
  Plus,
  BarChart3,
  TrendingUp
} from 'lucide-react'
import { getTimelineData, updateMilestoneProgress, createTimelineEvent, updateMilestoneDate } from '../lib/supabase'
import type { TimelineData, MaintenanceTimeline, TimelineEvent } from '../lib/types'
import { getTimelinePermissions, canUserUpdateMilestone, getVisibleMilestones } from '../lib/permissions'
import { TimelineTemplateSelector } from './TimelineTemplateSelector'

interface EnhancedTimelineViewerProps {
  requestId: string
  userRole: 'admin' | 'supervisor' | 'technician'
  userName: string
  readOnly?: boolean
}

export function EnhancedTimelineViewer({ requestId, userRole, userName, readOnly = false }: EnhancedTimelineViewerProps) {

  const [timelineData, setTimelineData] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [draggedMilestone, setDraggedMilestone] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [tempDate, setTempDate] = useState<string>('')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [viewMode, setViewMode] = useState<'timeline' | 'gantt' | 'list'>('timeline')
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  useEffect(() => {
    loadTimelineData()
  }, [requestId])

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e: React.DragEvent, milestoneId: string) => {
    if (readOnly) return
    setDraggedMilestone(milestoneId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', milestoneId)
  }, [readOnly])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetDate: string) => {
    e.preventDefault()
    if (!draggedMilestone || readOnly) return

    // Update milestone date
    handleDateUpdate(draggedMilestone, targetDate)
    setDraggedMilestone(null)
  }, [draggedMilestone, readOnly])

  // Date editing handlers
  const handleDateUpdate = async (milestoneId: string, newDate: string) => {
    if (readOnly || updating) return

    setUpdating(milestoneId)
    try {
      const { data, error } = await updateMilestoneDate(milestoneId, newDate)
      if (error) throw error

      // Update local state
      setTimelineData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          milestones: prev.milestones.map(m =>
            m.id === milestoneId ? { ...m, planned_date: newDate, updated_at: new Date().toISOString() } : m
          )
        }
      })
    } catch (error) {
      console.error('Error updating milestone date:', error)
      alert('Failed to update milestone date')
    } finally {
      setUpdating(null)
      setEditingDate(null)
    }
  }

  const startDateEdit = (milestoneId: string, currentDate: string) => {
    setEditingDate(milestoneId)
    setTempDate(currentDate ? new Date(currentDate).toISOString().split('T')[0] : '')
  }

  const saveDateEdit = () => {
    if (editingDate && tempDate) {
      handleDateUpdate(editingDate, tempDate)
    }
  }

  const cancelDateEdit = () => {
    setEditingDate(null)
    setTempDate('')
  }

  // Analytics calculations
  const calculateAnalytics = useCallback(() => {
    if (!timelineData) return null

    const { milestones } = timelineData
    const total = milestones.length
    const completed = milestones.filter(m => m.status === 'completed').length
    const inProgress = milestones.filter(m => m.status === 'in_progress').length
    const delayed = milestones.filter(m => m.status === 'delayed').length
    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0

    // Calculate average completion time
    const completedMilestones = milestones.filter(m => m.status === 'completed' && m.planned_date && m.actual_date)
    const avgCompletionTime = completedMilestones.length > 0
      ? completedMilestones.reduce((acc, m) => {
          const planned = new Date(m.planned_date!).getTime()
          const actual = new Date(m.actual_date!).getTime()
          return acc + (actual - planned)
        }, 0) / completedMilestones.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0

    // Predict completion date
    const remainingMilestones = milestones.filter(m => m.status !== 'completed')
    const avgMilestoneDuration = 3 // Assume 3 days per milestone on average
    const predictedDays = remainingMilestones.length * avgMilestoneDuration
    const predictedCompletion = new Date()
    predictedCompletion.setDate(predictedCompletion.getDate() + predictedDays)

    return {
      total,
      completed,
      inProgress,
      delayed,
      overallProgress,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      predictedCompletion: predictedCompletion.toLocaleDateString()
    }
  }, [timelineData])

  const loadTimelineData = async () => {
    try {
      setLoading(true)
      const { milestones, events, request, vehicles, error } = await getTimelineData(requestId)

      if (error) {
        console.error('Error loading timeline data:', error)
        return
      }

      setTimelineData({
        milestones: milestones || [],
        events: events || [],
        request,
        vehicles: vehicles || []
      })
    } catch (error) {
      console.error('Error loading timeline data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProgressUpdate = async (milestoneId: string, percentage: number) => {
    if (readOnly || updating) return

    setUpdating(milestoneId)
    try {
      const { data, error } = await updateMilestoneProgress(milestoneId, percentage)
      if (error) throw error

      // Update local state
      setTimelineData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          milestones: prev.milestones.map(m => 
            m.id === milestoneId ? { ...m, ...data } : m
          )
        }
      })
    } catch (error) {
      console.error('Error updating milestone progress:', error)
      alert('Failed to update milestone progress')
    } finally {
      setUpdating(null)
    }
  }

  const getMilestoneIcon = (milestone: MaintenanceTimeline) => {
    const iconClass = "w-8 h-8"
    switch (milestone.status) {
      case 'completed':
        return <CheckCircle className={`${iconClass} text-green-500`} />
      case 'in_progress':
        return <Clock className={`${iconClass} text-blue-500`} />
      case 'delayed':
        return <AlertTriangle className={`${iconClass} text-red-500`} />
      case 'cancelled':
        return <XCircle className={`${iconClass} text-gray-500`} />
      default:
        return <Circle className={`${iconClass} text-gray-400`} />
    }
  }

  const getEventIcon = (event: TimelineEvent) => {
    const iconClass = "w-4 h-4"
    switch (event.event_type) {
      case 'call':
        return <Phone className={iconClass} />
      case 'meeting':
        return <User className={iconClass} />
      case 'issue':
        return <AlertCircle className={iconClass} />
      case 'note':
        return <FileText className={iconClass} />
      case 'delay':
        return <Clock className={iconClass} />
      case 'escalation':
        return <Zap className={iconClass} />
      default:
        return <MessageSquare className={iconClass} />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const canUpdateMilestone = (milestone: MaintenanceTimeline) => {
    if (readOnly) return false
    return canUserUpdateMilestone(userRole, userName, {
      created_by: milestone.created_by,
      assigned_to: milestone.assigned_to,
      milestone_type: milestone.milestone_type,
      status: milestone.status
    })
  }

  const getProgressColor = (percentage: number, status: string) => {
    if (status === 'completed') return 'bg-green-500'
    if (status === 'delayed') return 'bg-red-500'
    if (status === 'in_progress') return 'bg-blue-500'
    return 'bg-gray-300'
  }

  const getMilestoneCircleClass = (milestone: MaintenanceTimeline) => {
    const baseClass = "relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 bg-white transition-all duration-300 hover:scale-110 cursor-pointer"
    
    switch (milestone.status) {
      case 'completed':
        return `${baseClass} border-green-500 shadow-lg shadow-green-200`
      case 'in_progress':
        return `${baseClass} border-blue-500 shadow-lg shadow-blue-200`
      case 'delayed':
        return `${baseClass} border-red-500 shadow-lg shadow-red-200`
      case 'cancelled':
        return `${baseClass} border-gray-400 shadow-lg shadow-gray-200`
      default:
        return `${baseClass} border-gray-300 shadow-lg shadow-gray-100`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading timeline...</span>
      </div>
    )
  }

  if (!timelineData) {
    return (
      <div className="text-center p-8 text-gray-500">
        No timeline data available
      </div>
    )
  }

  const { milestones: allMilestones, events, request } = timelineData
  
  // Filter milestones based on user role and permissions
  let milestones = getVisibleMilestones(userRole, userName, allMilestones)
  
  // Apply filters
  if (filterStatus !== 'all') {
    milestones = milestones.filter(m => m.status === filterStatus)
  }
  if (filterType !== 'all') {
    milestones = milestones.filter(m => m.milestone_type === filterType)
  }
  if (searchTerm) {
    milestones = milestones.filter(m => 
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const permissions = getTimelinePermissions(userRole)
  const overallProgress = Math.round((milestones.reduce((sum, m) => sum + m.completion_percentage, 0) / milestones.length) || 0)

  // If no milestones, show template selector option
  if (milestones.length === 0) {
    return (
      <>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Timeline Milestones</h3>
            <p className="text-gray-600 mb-6">
              This maintenance request doesn't have any timeline milestones yet.
            </p>
            {permissions.canCreateMajorMilestones && (
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Timeline from Template
              </button>
            )}
          </div>
        </div>

        {/* Timeline Template Selector */}
        {showTemplateSelector && (
          <TimelineTemplateSelector
            requestId={requestId}
            userRole={userRole}
            userName={userName}
            onTemplateApplied={() => {
              setShowTemplateSelector(false)
              loadTimelineData() // Reload timeline data
            }}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
      </>
    )
  }

  return (
    <>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header with Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Timeline for {request?.owner_name || 'Maintenance Request'}
            </h3>
            <p className="text-sm text-gray-600">
              {userRole === 'technician' 
                ? 'Your assigned milestones and progress updates'
                : userRole === 'supervisor'
                ? 'Project timeline and team progress overview'
                : 'Complete project timeline with full management access'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              userRole === 'admin' ? 'bg-purple-100 text-purple-800' :
              userRole === 'supervisor' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} View
            </span>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search milestones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'timeline' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'gantt' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Gantt
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => setShowTemplateSelector(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Templates
          </button>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="major">Major Milestones</option>
                  <option value="minor">Minor Milestones</option>
                  <option value="event">Events</option>
                  <option value="deadline">Deadlines</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Panel */}
        {showAnalytics && (() => {
          const analytics = calculateAnalytics()
          if (!analytics) return null

          return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Project Analytics
                </h4>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{analytics.overallProgress}%</div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analytics.completed}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{analytics.inProgress}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{analytics.delayed}</div>
                  <div className="text-sm text-gray-600">Delayed</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="text-sm font-medium text-gray-700 mb-2">Average Completion Time</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.avgCompletionTime > 0
                      ? `${analytics.avgCompletionTime} days`
                      : 'No data yet'
                    }
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="text-sm font-medium text-gray-700 mb-2">Predicted Completion</div>
                  <div className="text-2xl font-bold text-indigo-600">{analytics.predictedCompletion}</div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Enhanced Horizontal Timeline */}
      <div className="relative overflow-x-auto">
        <div className="min-w-full">
          {/* Date Headers */}
          <div className="flex items-center justify-between mb-8 px-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="text-center min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-900">
                  {milestone.planned_date ? formatDate(milestone.planned_date) : 'TBD'}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Line and Milestones */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>

            {/* Milestone Circles */}
            <div className="flex items-center justify-between px-8">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="relative flex flex-col items-center"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, milestone.planned_date || new Date().toISOString())}
                >
                  {/* Milestone Circle */}
                  <div
                    className={`${getMilestoneCircleClass(milestone)} ${
                      canUpdateMilestone(milestone) && !readOnly ? 'cursor-move' : ''
                    } ${draggedMilestone === milestone.id ? 'opacity-50 scale-95' : ''}`}
                    onClick={() => setSelectedMilestone(selectedMilestone === milestone.id ? null : milestone.id)}
                    draggable={canUpdateMilestone(milestone) && !readOnly}
                    onDragStart={(e) => handleDragStart(e, milestone.id)}
                  >
                    {canUpdateMilestone(milestone) && !readOnly && (
                      <GripVertical className="absolute -left-2 -top-2 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    {getMilestoneIcon(milestone)}
                    {milestone.completion_percentage > 0 && milestone.status !== 'completed' && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {milestone.completion_percentage}%
                      </div>
                    )}
                  </div>

                  {/* Milestone Label */}
                  <div className="mt-4 text-center max-w-32">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {milestone.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {milestone.description}
                    </div>

                    {/* Editable Date */}
                    {editingDate === milestone.id ? (
                      <div className="mt-2 flex flex-col items-center space-y-1">
                        <input
                          type="date"
                          value={tempDate}
                          onChange={(e) => setTempDate(e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={saveDateEdit}
                            className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelDateEdit}
                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`text-xs mt-1 ${
                          canUpdateMilestone(milestone) ? 'text-blue-600 cursor-pointer hover:underline' : 'text-gray-500'
                        }`}
                        onClick={() => canUpdateMilestone(milestone) && startDateEdit(milestone.id, milestone.planned_date || '')}
                      >
                        📅 {milestone.planned_date ? formatDate(milestone.planned_date) : 'Set date'}
                      </div>
                    )}

                    {milestone.assigned_to && (
                      <div className="text-xs text-blue-600 mt-1">
                        👤 {milestone.assigned_to}
                      </div>
                    )}
                  </div>

                  {/* Progress Controls */}
                  {canUpdateMilestone(milestone) && milestone.status !== 'completed' && (
                    <div className="mt-2 flex space-x-1">
                      {[25, 50, 75, 100].map(percentage => (
                        <button
                          key={percentage}
                          onClick={() => handleProgressUpdate(milestone.id, percentage)}
                          disabled={updating === milestone.id}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
                        >
                          {percentage}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Event Flags */}
          <div className="mt-12">
            <div className="flex items-end justify-between px-8">
              {milestones.map((milestone, index) => {
                const relatedEvents = events.filter(event => {
                  if (!milestone.planned_date) return false
                  const milestoneDate = new Date(milestone.planned_date)
                  const eventDate = new Date(event.event_date)
                  const daysDiff = Math.abs((eventDate.getTime() - milestoneDate.getTime()) / (1000 * 60 * 60 * 24))
                  return daysDiff <= 3
                })

                return (
                  <div key={milestone.id} className="flex flex-col items-center space-y-2 min-w-0 flex-1">
                    {relatedEvents.map(event => (
                      <div key={event.id} className="relative">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          event.flag_color === 'red' ? 'bg-red-100 text-red-800' :
                          event.flag_color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          event.flag_color === 'green' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getEventIcon(event)}
                          <span className="ml-1">{event.title}</span>
                        </div>
                        {/* Flag Pole */}
                        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-4 ${
                          event.flag_color === 'red' ? 'bg-red-400' :
                          event.flag_color === 'yellow' ? 'bg-yellow-400' :
                          event.flag_color === 'green' ? 'bg-green-400' :
                          'bg-blue-400'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Details Panel */}
      {selectedMilestone && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {(() => {
            const milestone = milestones.find(m => m.id === selectedMilestone)
            if (!milestone) return null

            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{milestone.title}</h4>
                  <button
                    onClick={() => setSelectedMilestone(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium capitalize">{milestone.status.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Progress:</span>
                    <span className="ml-2 font-medium">{milestone.completion_percentage}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium capitalize">{milestone.milestone_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Critical:</span>
                    <span className="ml-2 font-medium">{milestone.is_critical ? 'Yes' : 'No'}</span>
                  </div>
                  {milestone.planned_date && (
                    <div>
                      <span className="text-gray-600">Planned Date:</span>
                      <span className="ml-2 font-medium">{formatFullDate(milestone.planned_date)}</span>
                    </div>
                  )}
                  {milestone.actual_date && (
                    <div>
                      <span className="text-gray-600">Completed Date:</span>
                      <span className="ml-2 font-medium">{formatFullDate(milestone.actual_date)}</span>
                    </div>
                  )}
                </div>

                {milestone.description && (
                  <div className="mt-4">
                    <span className="text-gray-600">Description:</span>
                    <p className="mt-1 text-gray-900">{milestone.description}</p>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {milestones.filter(m => m.status === 'completed').length}
          </div>
          <div className="text-xs text-green-700">Completed</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {milestones.filter(m => m.status === 'in_progress').length}
          </div>
          <div className="text-xs text-blue-700">In Progress</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-lg font-bold text-yellow-600">
            {milestones.filter(m => m.status === 'pending').length}
          </div>
          <div className="text-xs text-yellow-700">Pending</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-600">
            {milestones.filter(m => m.status === 'delayed').length}
          </div>
          <div className="text-xs text-red-700">Delayed</div>
        </div>
      </div>
    </div>

    {/* Timeline Template Selector */}
    {showTemplateSelector && (
      <TimelineTemplateSelector
        requestId={requestId}
        userRole={userRole}
        userName={userName}
        onTemplateApplied={() => {
          setShowTemplateSelector(false)
          loadTimelineData() // Reload timeline data
        }}
        onClose={() => setShowTemplateSelector(false)}
      />
    )}
  </>
  )
}
