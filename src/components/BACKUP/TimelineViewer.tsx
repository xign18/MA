import React, { useState, useEffect } from 'react'
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
  Zap
} from 'lucide-react'
import { getTimelineData, updateMilestoneProgress } from '../lib/supabase'
import type { TimelineData, MaintenanceTimeline, TimelineEvent } from '../lib/types'
import { getTimelinePermissions, canUserUpdateMilestone, getVisibleMilestones } from '../lib/permissions'

interface TimelineViewerProps {
  requestId: string
  userRole: 'admin' | 'supervisor' | 'technician'
  userName: string
  readOnly?: boolean
}

export function TimelineViewer({ requestId, userRole, userName, readOnly = false }: TimelineViewerProps) {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadTimelineData()
  }, [requestId])

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
    switch (milestone.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'in_progress':
        return <Clock className="w-6 h-6 text-blue-500" />
      case 'delayed':
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-gray-500" />
      default:
        return <Circle className="w-6 h-6 text-gray-400" />
    }
  }

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.event_type) {
      case 'call':
        return <Phone className="w-4 h-4" />
      case 'meeting':
        return <User className="w-4 h-4" />
      case 'issue':
        return <AlertCircle className="w-4 h-4" />
      case 'note':
        return <FileText className="w-4 h-4" />
      case 'delay':
        return <Clock className="w-4 h-4" />
      case 'escalation':
        return <Zap className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
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
  const milestones = getVisibleMilestones(userRole, userName, allMilestones)
  const permissions = getTimelinePermissions(userRole)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
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
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              userRole === 'admin' ? 'bg-purple-100 text-purple-800' :
              userRole === 'supervisor' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} View
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Milestones */}
        <div className="space-y-8">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative flex items-start">
              {/* Milestone Icon */}
              <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white border-2 border-gray-200 rounded-full">
                {getMilestoneIcon(milestone)}
              </div>

              {/* Milestone Content */}
              <div className="ml-6 flex-1">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {milestone.title}
                      </h4>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {milestone.description}
                        </p>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs text-gray-700 font-medium">
                            {milestone.completion_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${milestone.completion_percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Milestone Details */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {milestone.planned_date && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(milestone.planned_date)}
                          </div>
                        )}
                        {milestone.assigned_to && (
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {milestone.assigned_to}
                          </div>
                        )}
                        {milestone.is_critical && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            Critical
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Update Controls */}
                    {canUpdateMilestone(milestone) && milestone.status !== 'completed' && (
                      <div className="ml-4 flex space-x-2">
                        {[25, 50, 75, 100].map(percentage => (
                          <button
                            key={percentage}
                            onClick={() => handleProgressUpdate(milestone.id, percentage)}
                            disabled={updating === milestone.id}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                          >
                            {percentage}%
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Events */}
                {events
                  .filter(event => {
                    // Show events that are close to this milestone date
                    if (!milestone.planned_date) return false
                    const milestoneDate = new Date(milestone.planned_date)
                    const eventDate = new Date(event.event_date)
                    const daysDiff = Math.abs((eventDate.getTime() - milestoneDate.getTime()) / (1000 * 60 * 60 * 24))
                    return daysDiff <= 3 // Show events within 3 days of milestone
                  })
                  .map(event => (
                    <div key={event.id} className="mt-2 ml-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                        event.flag_color === 'red' ? 'bg-red-100 text-red-800' :
                        event.flag_color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        event.flag_color === 'green' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {getEventIcon(event)}
                        <span className="ml-1">{event.title}</span>
                        <span className="ml-2 text-xs opacity-75">
                          {formatDate(event.event_date)}
                        </span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>

        {/* Completion Status */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Overall Progress</h4>
              <p className="text-sm text-gray-600">
                {milestones.filter(m => m.status === 'completed').length} of {milestones.length} milestones completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((milestones.reduce((sum, m) => sum + m.completion_percentage, 0) / milestones.length) || 0)}%
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
