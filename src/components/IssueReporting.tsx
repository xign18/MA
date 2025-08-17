import React, { useState, useEffect } from 'react'
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle, Pause } from 'lucide-react'
import { getRequestIssues, createIssue, updateIssue } from '../lib/supabase'
import type { MaintenanceIssue } from '../lib/types'

interface IssueReportingProps {
  requestId: string
  currentUser?: {
    name: string
    type: 'admin' | 'supervisor' | 'technician'
  }
  readOnly?: boolean
}

export function IssueReporting({ requestId, currentUser, readOnly = false }: IssueReportingProps) {
  const [issues, setIssues] = useState<MaintenanceIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    issue_type: 'wiring' as MaintenanceIssue['issue_type'],
    issue_title: '',
    issue_description: '',
    severity: 'medium' as MaintenanceIssue['severity'],
    location: ''
  })

  useEffect(() => {
    loadIssues()
  }, [requestId])

  const loadIssues = async () => {
    try {
      const { data, error } = await getRequestIssues(requestId)
      if (error) throw error
      setIssues(data || [])
    } catch (error) {
      console.error('Error loading issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || submitting) return

    setSubmitting(true)
    try {
      const { data, error } = await createIssue({
        request_id: requestId,
        reported_by: currentUser.name,
        ...formData
      })

      if (error) throw error

      if (data) {
        setIssues(prev => [data, ...prev])
        setFormData({
          issue_type: 'wiring',
          issue_title: '',
          issue_description: '',
          severity: 'medium',
          location: ''
        })
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error creating issue:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (issueId: string, status: MaintenanceIssue['status']) => {
    try {
      const updates: Partial<MaintenanceIssue> = { 
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : undefined
      }

      const { data, error } = await updateIssue(issueId, updates)
      if (error) throw error

      if (data) {
        setIssues(prev => prev.map(issue => issue.id === issueId ? data : issue))
      }
    } catch (error) {
      console.error('Error updating issue status:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300'
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'in_progress': return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'deferred': return <Pause className="w-4 h-4 text-gray-600" />
      default: return <XCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300'
      case 'resolved': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300'
      case 'deferred': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Issues & Problems ({issues.length})
          </h3>
        </div>
        
        {!readOnly && currentUser && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Report Issue</span>
          </button>
        )}
      </div>

      {/* Issue Form */}
      {showForm && !readOnly && currentUser && (
        <form onSubmit={handleSubmitIssue} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issue Type
              </label>
              <select
                value={formData.issue_type}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="wiring">Wiring Problem</option>
                <option value="fuse">Fuse Issue</option>
                <option value="electrical">Electrical System</option>
                <option value="resource_delay">Resource Delay</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Issue Title
            </label>
            <input
              type="text"
              value={formData.issue_title}
              onChange={(e) => setFormData(prev => ({ ...prev, issue_title: e.target.value }))}
              placeholder="Brief description of the issue"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Where is the issue located?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detailed Description
            </label>
            <textarea
              value={formData.issue_description}
              onChange={(e) => setFormData(prev => ({ ...prev, issue_description: e.target.value }))}
              placeholder="Provide detailed information about the issue, what you observed, and any steps taken..."
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{submitting ? 'Reporting...' : 'Report Issue'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Issues List */}
      <div className="space-y-4">
        {issues.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No issues reported yet.</p>
          </div>
        ) : (
          issues.map((issue) => (
            <div key={issue.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {issue.issue_title}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {issue.issue_description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Type: {issue.issue_type.replace('_', ' ')}</span>
                    {issue.location && <span>Location: {issue.location}</span>}
                    <span>Reported by: {issue.reported_by}</span>
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusIcon(issue.status)}
                  {!readOnly && currentUser && issue.status !== 'resolved' && (
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusUpdate(issue.id, e.target.value as any)}
                      className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="deferred">Deferred</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
