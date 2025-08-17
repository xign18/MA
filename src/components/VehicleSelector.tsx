import React, { useState } from 'react'
import { Plus, Truck, MapPin, X, Save } from 'lucide-react'
import { type Vehicle, type MaintenanceType } from '../lib/types'
import { type VehicleSelection } from '../hooks/useMaintenanceCalculator'

interface VehicleSelectorProps {
  selectedVehicles: VehicleSelection[]
  onAddVehicle: (vehicle: Vehicle) => void
  onRemoveVehicle: (vehicleId: string) => void
  onUpdateMaintenanceTypes: (vehicleId: string, types: MaintenanceType[]) => void
}

const maintenanceOptions = [
  { key: 'offline' as const, label: 'Offline Maintenance', price: 600 },
  { key: 'fls' as const, label: 'FLS Maintenance', price: 800 },
  { key: 'calibration' as const, label: 'FLS Calibration', price: 1200 },
  { key: 'fls_calibration' as const, label: 'FLS Maintenance + Calibration', price: 1400 },
]

const vehicleTypes = [
  'Truck',
  'Bus',
  'Van',
  'Pickup',
  'Sedan',
  'SUV',
  'Motorcycle',
  'Heavy Machinery',
  'Other'
]

export function VehicleSelector({
  selectedVehicles,
  onAddVehicle,
  onRemoveVehicle,
  onUpdateMaintenanceTypes,
}: VehicleSelectorProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    plateNumber: '',
    location: '',
    vehicleType: ''
  })
  const [showCustomLocation, setShowCustomLocation] = useState(false)
  const [formErrors, setFormErrors] = useState<{
    plateNumber?: string
    location?: string
    vehicleType?: string
  }>({})

  const predefinedLocations = [
    'Addis Ababa',
    'Dire Dawa',
    'Hawassa',
    'Mekelle',
    'Bahir Dar',
    'Jimma',
    'Adama',
    'Gondar',
    'Awash'
  ]

  const validateForm = () => {
    const errors: typeof formErrors = {}
    
    if (!formData.plateNumber.trim()) {
      errors.plateNumber = 'Plate number is required'
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required'
    }
    
    if (!formData.vehicleType.trim()) {
      errors.vehicleType = 'Vehicle type is required'
    }

    // Check if plate number already exists
    const plateExists = selectedVehicles.some(
      v => v.vehicle.plate_number.toLowerCase() === formData.plateNumber.trim().toLowerCase()
    )
    if (plateExists) {
      errors.plateNumber = 'This plate number is already added'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Create a new vehicle object with unique ID
    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      plate_number: formData.plateNumber.trim().toUpperCase(),
      location: formData.location.trim(),
      created_at: new Date().toISOString()
    }

    onAddVehicle(newVehicle)
    
    // Reset form
    setFormData({
      plateNumber: '',
      location: '',
      vehicleType: ''
    })
    setShowCustomLocation(false)
    setFormErrors({})
    setShowForm(false)
  }

  const handleCancel = () => {
    setFormData({
      plateNumber: '',
      location: '',
      vehicleType: ''
    })
    setShowCustomLocation(false)
    setFormErrors({})
    setShowForm(false)
  }

  const handleMaintenanceTypeChange = (vehicleId: string, type: MaintenanceType, checked: boolean) => {
    const vehicleSelection = selectedVehicles.find(v => v.vehicle.id === vehicleId)
    if (!vehicleSelection) return

    let newTypes = [...vehicleSelection.maintenanceTypes]
    
    if (checked) {
      if (!newTypes.includes(type)) {
        newTypes.push(type)
      }
    } else {
      newTypes = newTypes.filter(t => t !== type)
    }

    onUpdateMaintenanceTypes(vehicleId, newTypes)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Registration</h3>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Vehicle
        </button>
      </div>

      {/* Registration Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Register New Vehicle
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plate Number */}
              <div>
                <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plate Number *
                </label>
                <input
                  type="text"
                  id="plateNumber"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                  placeholder="AA-123456"
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.plateNumber 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {formErrors.plateNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.plateNumber}</p>
                )}
              </div>

              {/* Vehicle Type */}
              <div>
                <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vehicle Type *
                </label>
                <select
                  id="vehicleType"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.vehicleType 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select vehicle type</option>
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {formErrors.vehicleType && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.vehicleType}</p>
                )}
              </div>
            </div>

            {/* Current Maintenance Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Maintenance Location *
              </label>
              {!showCustomLocation ? (
                <div className="space-y-2">
                  <select
                    id="location"
                    value={formData.location}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomLocation(true)
                        setFormData(prev => ({ ...prev, location: '' }))
                      } else {
                        setFormData(prev => ({ ...prev, location: e.target.value }))
                      }
                    }}
                    className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formErrors.location 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select maintenance location</option>
                    {predefinedLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                    <option value="custom">Other (Enter custom location)</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    id="customLocation"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter custom maintenance location"
                    className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formErrors.location 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomLocation(false)
                      setFormData(prev => ({ ...prev, location: '' }))
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    ← Back to predefined locations
                  </button>
                </div>
              )}
              {formErrors.location && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.location}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Register Vehicle</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedVehicles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Truck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No vehicles registered</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Get started by registering your vehicles for maintenance
          </p>
        </div>
      )}

      {selectedVehicles.map((selection) => (
        <div
          key={selection.vehicle.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {selection.vehicle.plate_number}
                </h4>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {selection.vehicle.location}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onRemoveVehicle(selection.vehicle.id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Maintenance Services
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {maintenanceOptions.map((option) => (
                <label
                  key={option.key}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selection.maintenanceTypes.includes(option.key)}
                    onChange={(e) => handleMaintenanceTypeChange(selection.vehicle.id, option.key, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {option.price} ETB
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}