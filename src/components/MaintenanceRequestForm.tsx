import React, { useState, useCallback } from 'react'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { MaintenanceRules } from './MaintenanceRules'
import { OwnerForm } from './OwnerForm'
import { VehicleSelector } from './VehicleSelector'
import { CostSummary } from './CostSummary'
import { ConfirmationModal } from './ConfirmationModal'
import { useMaintenanceCalculator } from '../hooks/useMaintenanceCalculator'
import { type UserProfile } from '../lib/auth'

interface MaintenanceRequestFormProps {
  onSubmit: (requestData: any, vehiclesData: any[]) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  userProfile: UserProfile | null
}

interface FormErrors {
  ownerName?: string
  contactNumber?: string
  vehicles?: string
  maintenance?: string
}

export function MaintenanceRequestForm({ onSubmit, onCancel, userProfile }: MaintenanceRequestFormProps) {
  const [ownerName, setOwnerName] = useState(userProfile?.full_name || '')
  const [contactNumber, setContactNumber] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState('')
  
  const {
    selectedVehicles,
    addVehicle,
    removeVehicle,
    updateMaintenanceTypes,
    calculateCosts,
    clearSelection,
  } = useMaintenanceCalculator()

  const breakdown = calculateCosts()

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!ownerName.trim()) {
      newErrors.ownerName = 'Name is required'
    }

    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    } else if (!/^(\+251|0)?[79]\d{8}$/.test(contactNumber.replace(/\s+/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid Ethiopian phone number'
    }

    if (selectedVehicles.length === 0) {
      newErrors.vehicles = 'At least one vehicle must be selected'
    }

    const hasMaintenanceTypes = selectedVehicles.some(v => v.maintenanceTypes.length > 0)
    if (!hasMaintenanceTypes) {
      newErrors.maintenance = 'At least one maintenance type must be selected'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [ownerName, contactNumber, selectedVehicles])

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return
    }

    setShowConfirmation(true)
  }, [validateForm])

  const handleConfirmSubmission = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Prepare request data
      const requestData = {
        owner_name: ownerName,
        contact_number: contactNumber,
        company_name: companyName || undefined,
        total_cost: breakdown.total,
        breakdown: breakdown
      }

      // Prepare vehicles data
      const vehiclesData = selectedVehicles.map(selection => ({
        plate_number: selection.vehicle.plate_number,
        location: selection.vehicle.location,
        maintenance_types: selection.maintenanceTypes
      }))

      const result = await onSubmit(requestData, vehiclesData)
      
      if (result.success) {
        setSubmitStatus('success')
        setShowConfirmation(false)
        
        // Reset form
        setOwnerName(userProfile?.full_name || '')
        setContactNumber('')
        setCompanyName('')
        clearSelection()
        setErrors({})
        
        // Auto-close after success
        setTimeout(() => {
          onCancel()
        }, 2000)
      } else {
        setSubmitStatus('error')
        setSubmitError(result.error || 'Failed to submit request')
      }
    } catch (error: any) {
      setSubmitStatus('error')
      setSubmitError(error.message || 'Failed to submit request')
    } finally {
      setIsSubmitting(false)
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle')
        setSubmitError('')
      }, 5000)
    }
  }, [ownerName, contactNumber, companyName, selectedVehicles, breakdown, clearSelection, onSubmit, userProfile, onCancel])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                New Maintenance Request
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Submit a new maintenance request with automatic cost calculation
              </p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-green-800 dark:text-green-100 font-medium">Request Submitted Successfully!</h3>
              <p className="text-green-700 dark:text-green-200 text-sm">
                Your maintenance request has been submitted and will be processed soon.
              </p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-red-800 dark:text-red-100 font-medium">Submission Failed</h3>
              <p className="text-red-700 dark:text-red-200 text-sm">
                {submitError || 'There was an error submitting your request. Please try again.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <MaintenanceRules />
            
            <OwnerForm
              ownerName={ownerName}
              contactNumber={contactNumber}
              companyName={companyName}
              onOwnerNameChange={setOwnerName}
              onContactNumberChange={setContactNumber}
              onCompanyNameChange={setCompanyName}
              errors={errors}
            />

            <VehicleSelector
              selectedVehicles={selectedVehicles}
              onAddVehicle={addVehicle}
              onRemoveVehicle={removeVehicle}
              onUpdateMaintenanceTypes={updateMaintenanceTypes}
            />

            {errors.vehicles && (
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.vehicles}</p>
            )}

            {errors.maintenance && (
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.maintenance}</p>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={breakdown.total === 0}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Review & Submit Request</span>
              </button>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="lg:col-span-1">
            <CostSummary breakdown={breakdown} />
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmSubmission}
          ownerName={ownerName}
          contactNumber={contactNumber}
          companyName={companyName}
          selectedVehicles={selectedVehicles}
          breakdown={breakdown}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}