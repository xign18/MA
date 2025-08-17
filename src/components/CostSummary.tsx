import React from 'react'
import { Calculator, Users, Truck, Clock, MapPin } from 'lucide-react'
import { type CostBreakdown } from '../lib/types'

interface CostSummaryProps {
  breakdown: CostBreakdown
}

export function CostSummary({ breakdown }: CostSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount).replace('ETB', '').trim() + ' ETB'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cost Summary</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 dark:text-gray-400">Maintenance Fees</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(breakdown.maintenanceFees)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 dark:text-gray-400">Per Diem</span>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{breakdown.crewCount} crew</span>
              <Clock className="w-3 h-3 ml-1" />
              <span>{breakdown.workDays} days</span>
            </div>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(breakdown.perDiem)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 dark:text-gray-400">Transportation</span>
            <MapPin className="w-3 h-3 text-gray-500" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(breakdown.transportation)}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(breakdown.total)}
          </span>
        </div>
      </div>

      {breakdown.total > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Calculation Details</h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Work Days: Total vehicles ÷ 3 = {breakdown.workDays} days</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4" />
              <span>Per Diem: {breakdown.crewCount} crew × 1,600 ETB × {breakdown.workDays} days</span>
            </div>
            <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-800/30 rounded text-xs">
              <strong>Crew Assignment Rules:</strong><br />
              • Offline only → 1 maintenance crew<br />
              • Any FLS service → 2 maintenance crew<br />
              • Additional crew may be assigned at provider's discretion
            </div>
          </div>
        </div>
      )}
    </div>
  )
}