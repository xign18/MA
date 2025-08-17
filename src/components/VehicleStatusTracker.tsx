import React, { useState, useEffect } from 'react'
import { Car, Satellite, Fuel, Zap, MapPin, Anchor, Battery } from 'lucide-react'
import { getVehicleStatus, createVehicleStatus, updateVehicleStatus } from '../lib/supabase'
import type { VehicleStatus } from '../lib/types'

interface VehicleStatusTrackerProps {
  requestId: string
  vehicleId: string
  vehiclePlateNumber: string
  currentUser?: {
    name: string
    type: 'admin' | 'supervisor' | 'technician'
  }
  readOnly?: boolean
}

export function VehicleStatusTracker({ 
  requestId, 
  vehicleId, 
  vehiclePlateNumber, 
  currentUser,
  readOnly = false 
}: VehicleStatusTrackerProps) {
  const [status, setStatus] = useState<VehicleStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadVehicleStatus()
  }, [requestId, vehicleId])

  const loadVehicleStatus = async () => {
    try {
      const { data, error } = await getVehicleStatus(requestId)
      if (error) throw error
      
      const vehicleStatus = data?.find(s => s.vehicle_id === vehicleId)
      setStatus(vehicleStatus || null)
    } catch (error) {
      console.error('Error loading vehicle status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (field: keyof VehicleStatus, value: string) => {
    if (readOnly || !currentUser || updating) return

    console.log('Updating vehicle status:', { field, value, requestId, vehicleId, currentUser: currentUser.name })

    setUpdating(field)
    try {
      if (!status?.id) {
        // Create new status record
        console.log('Creating new vehicle status record')
        const newStatusData = {
          request_id: requestId,
          vehicle_id: vehicleId,
          gps_tracker_status: 'unknown' as const,
          fuel_sensor_status: 'unknown' as const,
          fuel_tank_calibration: 'unknown' as const,
          gps_positioning_status: 'unknown' as const,
          grounding_status: 'unknown' as const,
          power_voltage_status: 'unknown' as const,
          last_updated_by: currentUser.name,
          [field]: value
        }

        console.log('New status data:', newStatusData)
        const { data: newStatus, error } = await createVehicleStatus(newStatusData)
        if (error) {
          console.error('Error creating vehicle status:', error)
          throw error
        }
        console.log('Vehicle status created successfully:', newStatus)
        setStatus(newStatus)
      } else {
        // Update existing status
        console.log('Updating existing vehicle status:', status.id)
        const updates = {
          [field]: value,
          last_updated_by: currentUser.name
        }

        console.log('Update data:', updates)
        const { data: updatedStatus, error } = await updateVehicleStatus(status.id, updates)
        if (error) {
          console.error('Error updating vehicle status:', error)
          throw error
        }
        console.log('Vehicle status updated successfully:', updatedStatus)
        setStatus(updatedStatus)
      }
    } catch (error) {
      console.error('Error updating vehicle status:', error)
      alert(`Failed to update vehicle status: ${error.message || 'Unknown error'}`)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
      case 'accurate':
      case 'calibrated':
      case 'proper':
      case 'normal':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300'
      case 'faulty':
      case 'inaccurate':
      case 'loose':
      case 'low':
      case 'drift_issues':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'needs_calibration':
      case 'needs_replacement':
      case 'corroded':
      case 'fluctuating':
      case 'signal_problems':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300'
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const statusFields = [
    {
      key: 'gps_tracker_status' as keyof VehicleStatus,
      label: 'GPS Tracker',
      icon: Satellite,
      options: ['working', 'faulty', 'needs_calibration', 'unknown']
    },
    {
      key: 'fuel_sensor_status' as keyof VehicleStatus,
      label: 'Fuel Level Sensor',
      icon: Fuel,
      options: ['accurate', 'inaccurate', 'needs_replacement', 'unknown']
    },
    {
      key: 'fuel_tank_calibration' as keyof VehicleStatus,
      label: 'Fuel Tank Calibration',
      icon: Fuel,
      options: ['calibrated', 'needs_calibration', 'completed', 'unknown']
    },
    {
      key: 'gps_positioning_status' as keyof VehicleStatus,
      label: 'GPS Positioning',
      icon: MapPin,
      options: ['accurate', 'drift_issues', 'signal_problems', 'unknown']
    },
    {
      key: 'grounding_status' as keyof VehicleStatus,
      label: 'Electrical Grounding',
      icon: Anchor,
      options: ['proper', 'loose', 'corroded', 'unknown']
    },
    {
      key: 'power_voltage_status' as keyof VehicleStatus,
      label: 'Power/Voltage',
      icon: Battery,
      options: ['normal', 'low', 'fluctuating', 'critical', 'unknown']
    }
  ]

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Car className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Vehicle Status - {vehiclePlateNumber}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statusFields.map((field) => {
          const Icon = field.icon
          const currentValue = status?.[field.key] as string || 'unknown'
          
          return (
            <div key={field.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {field.label}
                </span>
              </div>

              {readOnly ? (
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentValue)}`}>
                  {currentValue.replace('_', ' ')}
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={currentValue}
                    onChange={(e) => handleStatusUpdate(field.key, e.target.value)}
                    disabled={updating === field.key}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {field.options.map(option => (
                      <option key={option} value={option}>
                        {option.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  
                  {updating === field.key && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {status?.last_updated_by && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated by {status.last_updated_by} on{' '}
            {new Date(status.updated_at).toLocaleString()}
          </p>
        </div>
      )}

      {!readOnly && currentUser && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select the current status for each component. Changes are saved automatically.
          </p>
        </div>
      )}
    </div>
  )
}
