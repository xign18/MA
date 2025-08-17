import React, { useState } from 'react'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  Search,
  Calendar,
  User,
  Plus,
  X
} from 'lucide-react'
import { timelineTemplates, createTimelineFromTemplate, type TimelineTemplate } from '../lib/timelineTemplates'
import { createMilestone } from '../lib/supabase'

interface TimelineTemplateSelectorProps {
  requestId: string
  onTemplateApplied: () => void
  onClose: () => void
  userRole: 'admin' | 'supervisor' | 'technician'
  userName: string
}

export function TimelineTemplateSelector({ 
  requestId, 
  onTemplateApplied, 
  onClose, 
  userRole, 
  userName 
}: TimelineTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TimelineTemplate | null>(null)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [assignedTo, setAssignedTo] = useState(userName)
  const [applying, setApplying] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTemplates = timelineTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryIcon = (category: TimelineTemplate['category']) => {
    switch (category) {
      case 'routine': return <Clock className="w-5 h-5 text-blue-600" />
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'inspection': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'repair': return <Wrench className="w-5 h-5 text-orange-600" />
      default: return <Calendar className="w-5 h-5 text-gray-600" />
    }
  }

  const getCategoryColor = (category: TimelineTemplate['category']) => {
    switch (category) {
      case 'routine': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'emergency': return 'bg-red-50 border-red-200 text-red-800'
      case 'inspection': return 'bg-green-50 border-green-200 text-green-800'
      case 'repair': return 'bg-orange-50 border-orange-200 text-orange-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return

    setApplying(true)
    try {
      const milestones = createTimelineFromTemplate(
        selectedTemplate.id,
        requestId,
        new Date(startDate),
        assignedTo
      )

      // Create all milestones
      for (const milestone of milestones) {
        const { error } = await createMilestone(milestone)
        if (error) {
          console.error('Error creating milestone:', error)
          throw error
        }
      }

      onTemplateApplied()
      onClose()
    } catch (error) {
      console.error('Error applying template:', error)
      alert('Failed to apply timeline template')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Timeline Templates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a template to quickly set up your maintenance timeline
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Template List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Template Cards */}
              <div className="space-y-3">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(template.category)}
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{template.milestones.length} milestones</span>
                      <span>~{template.estimatedDuration} days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Template Preview */}
          <div className="w-1/2 overflow-y-auto">
            {selectedTemplate ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    {getCategoryIcon(selectedTemplate.category)}
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700">Duration</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {selectedTemplate.estimatedDuration} days
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700">Milestones</div>
                      <div className="text-lg font-semibold text-green-600">
                        {selectedTemplate.milestones.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Configuration</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign To
                      </label>
                      <input
                        type="text"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        placeholder="Technician name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Milestone Preview */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Milestones Preview</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTemplate.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.milestone_type === 'major' ? 'bg-blue-500' :
                          milestone.milestone_type === 'deadline' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{milestone.title}</div>
                          <div className="text-xs text-gray-600">{milestone.description}</div>
                        </div>
                        {milestone.is_critical && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a template to see preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedTemplate && (
              <>Templates will create {selectedTemplate.milestones.length} milestones starting from {new Date(startDate).toLocaleDateString()}</>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate || applying}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {applying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Applying...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Apply Template
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
