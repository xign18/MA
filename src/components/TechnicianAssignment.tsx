import React, { useState, useEffect } from 'react'
import { Users, UserCheck, Phone, Mail, Wrench } from 'lucide-react'
import { getTechnicians, assignTechnician } from '../lib/supabase'
import type { Technician } from '../lib/types'

interface TechnicianAssignmentProps {
  requestId: string
  currentAssignedId?: string
  onAssignmentChange?: (technicianId: string, technicianName: string) => void
  assignedBy: string
  readOnly?: boolean
}

export function TechnicianAssignment({ 
  requestId, 
  currentAssignedId, 
  onAssignmentChange, 
  assignedBy,
  readOnly = false 
}: TechnicianAssignmentProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(currentAssignedId || '')

  useEffect(() => {
    loadTechnicians()
  }, [])

  useEffect(() => {
    setSelectedTechnicianId(currentAssignedId || '')
  }, [currentAssignedId])

  const loadTechnicians = async () => {
    try {
      const { data, error } = await getTechnicians()
      if (error) throw error
      setTechnicians(data || [])
    } catch (error) {
      console.error('Error loading technicians:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignment = async (technicianId: string) => {
    if (readOnly || assigning) return

    setAssigning(true)
    try {
      const { error } = await assignTechnician(requestId, technicianId, assignedBy)
      if (error) throw error

      setSelectedTechnicianId(technicianId)
      
      const technician = technicians.find(t => t.id === technicianId)
      if (technician && onAssignmentChange) {
        onAssignmentChange(technicianId, technician.name)
      }
    } catch (error) {
      console.error('Error assigning technician:', error)
    } finally {
      setAssigning(false)
    }
  }

  const getSpecializationBadges = (specializations: string[]) => {
    const colors = {
      electrical: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      gps: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      fuel_systems: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      calibration: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      diagnostics: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      wiring: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    }

    return specializations.map((spec, index) => (
      <span
        key={index}
        className={`px-2 py-1 text-xs rounded-full ${colors[spec as keyof typeof colors] || colors.general}`}
      >
        {spec.replace('_', ' ')}
      </span>
    ))
  }

  const currentTechnician = technicians.find(t => t.id === selectedTechnicianId)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Technician Assignment
        </h3>
      </div>

      {/* Current Assignment */}
      {currentTechnician && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Currently Assigned
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {currentTechnician.name}
              </h4>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                {currentTechnician.contact_number && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{currentTechnician.contact_number}</span>
                  </div>
                )}
                {currentTechnician.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="w-3 h-3" />
                    <span>{currentTechnician.email}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {getSpecializationBadges(currentTechnician.specialization)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technician List */}
      {!readOnly && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {currentTechnician ? 'Reassign to:' : 'Assign to:'}
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {technicians.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No technicians available</p>
              </div>
            ) : (
              technicians.map((technician) => (
                <div
                  key={technician.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    technician.id === selectedTechnicianId
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${assigning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !assigning && handleAssignment(technician.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {technician.name}
                        </h5>
                        {technician.id === selectedTechnicianId && (
                          <UserCheck className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {technician.contact_number && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{technician.contact_number}</span>
                          </div>
                        )}
                        {technician.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{technician.email}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {getSpecializationBadges(technician.specialization)}
                      </div>
                    </div>

                    {assigning && technician.id === selectedTechnicianId && (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {readOnly && !currentTechnician && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No technician assigned yet</p>
        </div>
      )}
    </div>
  )
}
