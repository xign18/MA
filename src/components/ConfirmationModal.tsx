import React from 'react'
import { CheckCircle, X, FileText, Users, Clock, MapPin, Calculator } from 'lucide-react'
import { type CostBreakdown } from '../lib/types'
import { type VehicleSelection } from '../hooks/useMaintenanceCalculator'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  ownerName: string
  contactNumber: string
  companyName: string
  selectedVehicles: VehicleSelection[]
  breakdown: CostBreakdown
  isSubmitting: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  ownerName,
  contactNumber,
  companyName,
  selectedVehicles,
  breakdown,
  isSubmitting,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount).replace('ETB', '').trim() + ' ETB'
  }

  const maintenanceLabels = {
    offline: 'Offline Maintenance',
    fls: 'FLS Maintenance',
    calibration: 'FLS Calibration',
    fls_calibration: 'FLS Maintenance + Calibration',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Review Maintenance Request
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please review your request before submission
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Owner Information */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Owner Information</h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{contactNumber}</span>
                </div>
                {companyName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Company:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{companyName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Information */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Selected Vehicles</h4>
              <div className="space-y-3">
                {selectedVehicles.map((selection) => (
                  <div key={selection.vehicle.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selection.vehicle.plate_number}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {selection.vehicle.location}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Services: {selection.maintenanceTypes.map(type => maintenanceLabels[type]).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2" />
                Complete Cost Breakdown
              </h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Maintenance Fees:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(breakdown.maintenanceFees)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">Per Diem:</span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{breakdown.crewCount} crew</span>
                      <Clock className="w-3 h-3 ml-1" />
                      <span>{breakdown.workDays} days</span>
                    </div>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(breakdown.perDiem)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transportation:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(breakdown.transportation)}
                  </span>
                </div>
                
                {/* Detailed breakdown section */}
                <div className="border-t border-blue-200 dark:border-blue-800 pt-3">
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                    <div className="font-medium">Per Diem Calculation:</div>
                    <div className="ml-2">
                      <div>• {breakdown.crewCount} crew members × 1,600 ETB/day × {breakdown.workDays} days</div>
                    </div>
                    <div className="text-xs mt-2 p-2 bg-blue-100 dark:bg-blue-800/30 rounded">
                      <strong>Crew Assignment:</strong> Based on maintenance types selected.<br />
                      • Offline only → 1 crew member<br />
                      • Any FLS service → 2 crew members
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-blue-200 dark:border-blue-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(breakdown.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}