import React from 'react'
import { User, Phone, Building2 } from 'lucide-react'

interface OwnerFormProps {
  ownerName: string
  contactNumber: string
  companyName: string
  onOwnerNameChange: (value: string) => void
  onContactNumberChange: (value: string) => void
  onCompanyNameChange: (value: string) => void
  errors: {
    ownerName?: string
    contactNumber?: string
  }
}

export function OwnerForm({
  ownerName,
  contactNumber,
  companyName,
  onOwnerNameChange,
  onContactNumberChange,
  onCompanyNameChange,
  errors,
}: OwnerFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Owner Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="ownerName"
              value={ownerName}
              onChange={(e) => onOwnerNameChange(e.target.value)}
              placeholder="Enter your full name"
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.ownerName 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
          </div>
          {errors.ownerName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ownerName}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contact Number *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="tel"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => onContactNumberChange(e.target.value)}
              placeholder="+251 9XX XXX XXX"
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.contactNumber 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
          </div>
          {errors.contactNumber && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactNumber}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Name (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => onCompanyNameChange(e.target.value)}
              placeholder="Enter company name (optional)"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}