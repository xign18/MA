import React from 'react'
import { AlertTriangle, Info, Users, Clock, Shield, Truck } from 'lucide-react'

export function MaintenanceRules() {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-shrink-0 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
          <Info className="w-5 h-5 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          Maintenance Service Rules and Notices
        </h3>
      </div>

      <div className="space-y-6">
        {/* Important Notice */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Important Notice</h4>
              <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                <li className="flex items-start space-x-2">
                  <Truck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    If maintenance is performed <strong>outside Addis Ababa</strong>, the <strong>owner</strong> must provide transportation for the crew.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    The <strong>client</strong> is responsible for ensuring the crew's <strong>security</strong> and <strong>safety</strong> during their stay.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    If extra days are required for transportation between sites, the <strong>per diem</strong> will be calculated and charged for those additional days.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Automatic Calculations */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Automatic Calculations</h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>• Fees are automatically calculated based on the selected services.</li>
                <li>• The system determines work days (<strong>3 vehicles per day</strong>), for one team or crew.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technician Assignment */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-1 bg-green-100 dark:bg-green-900/30 rounded">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Technician Assignment</h4>
              <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                <li>• We will assign <strong>two technicians</strong> to your site: one <strong>IT specialist</strong> and one <strong>electrician</strong>.</li>
                <li>• If additional manpower is required, you will arrange it from your garage, depending on the specific task.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}