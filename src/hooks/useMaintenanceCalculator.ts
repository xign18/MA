import { useState, useCallback } from 'react'
import { MAINTENANCE_PRICES, PER_DIEM_RATE, TRANSPORTATION_RATES, type CostBreakdown, type MaintenanceType, type Vehicle } from '../lib/types'

export type VehicleSelection = {
  vehicle: Vehicle
  maintenanceTypes: MaintenanceType[]
}

export function useMaintenanceCalculator() {
  const [selectedVehicles, setSelectedVehicles] = useState<VehicleSelection[]>([])

  const addVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicles(prev => {
      if (prev.some(v => v.vehicle.id === vehicle.id)) {
        return prev
      }
      return [...prev, { vehicle, maintenanceTypes: [] }]
    })
  }, [])

  const removeVehicle = useCallback((vehicleId: string) => {
    setSelectedVehicles(prev => prev.filter(v => v.vehicle.id !== vehicleId))
  }, [])

  const updateMaintenanceTypes = useCallback((vehicleId: string, types: MaintenanceType[]) => {
    setSelectedVehicles(prev =>
      prev.map(v =>
        v.vehicle.id === vehicleId
          ? { ...v, maintenanceTypes: types }
          : v
      )
    )
  }, [])

  const calculateCosts = useCallback((): CostBreakdown => {
    if (selectedVehicles.length === 0) {
      return {
        maintenanceFees: 0,
        perDiem: 0,
        transportation: 0,
        workDays: 0,
        crewCount: 0,
        total: 0,
      }
    }

    // Check if any vehicle has maintenance types selected
    const hasAnyMaintenanceTypes = selectedVehicles.some(({ maintenanceTypes }) => 
      maintenanceTypes.length > 0
    )

    // If no maintenance types are selected, return zero costs
    if (!hasAnyMaintenanceTypes) {
      return {
        maintenanceFees: 0,
        perDiem: 0,
        transportation: 0,
        workDays: 0,
        crewCount: 0,
        total: 0,
      }
    }

    // Calculate maintenance fees
    const maintenanceFees = selectedVehicles.reduce((total, { maintenanceTypes }) => {
      return total + maintenanceTypes.reduce((vehicleTotal, type) => {
        return vehicleTotal + MAINTENANCE_PRICES[type]
      }, 0)
    }, 0)

    // Calculate work days based on vehicles with maintenance types selected
    const vehiclesWithMaintenance = selectedVehicles.filter(({ maintenanceTypes }) => 
      maintenanceTypes.length > 0
    ).length
    
    const workDays = Math.ceil(vehiclesWithMaintenance / 3)

    // Calculate crew count based on maintenance types
    // Check if any vehicle has FLS services
    const hasFLSServices = selectedVehicles.some(({ maintenanceTypes }) =>
      maintenanceTypes.some(type => type === 'fls' || type === 'calibration' || type === 'fls_calibration')
    )
    
    // Check if all vehicles have only offline maintenance
    const hasOnlyOffline = selectedVehicles.every(({ maintenanceTypes }) =>
      maintenanceTypes.length > 0 && maintenanceTypes.every(type => type === 'offline')
    )
    
    let crewCount = 0
    if (hasOnlyOffline) {
      // Only offline maintenance → 1 crew member total
      crewCount = 1
    } else if (hasFLSServices) {
      // Any FLS service → 2 crew members total
      crewCount = 2
    } else {
      // Default case → 1 crew member
      crewCount = 1
    }

    // Calculate per diem (crew count × per diem rate × work days)
    const perDiem = crewCount * PER_DIEM_RATE * workDays

    // Calculate transportation (based on unique locations)
    const vehiclesWithMaintenanceTypes = selectedVehicles.filter(({ maintenanceTypes }) => 
      maintenanceTypes.length > 0
    )
    const uniqueLocations = new Set(vehiclesWithMaintenanceTypes.map(v => v.vehicle.location))
    const transportation = Array.from(uniqueLocations).reduce((total, location) => {
      return total + (TRANSPORTATION_RATES[location as keyof typeof TRANSPORTATION_RATES] || 0)
    }, 0)

    const total = maintenanceFees + perDiem + transportation

    return {
      maintenanceFees,
      perDiem,
      transportation,
      workDays,
      crewCount,
      total,
    }
  }, [selectedVehicles])

  const clearSelection = useCallback(() => {
    setSelectedVehicles([])
  }, [])

  return {
    selectedVehicles,
    addVehicle,
    removeVehicle,
    updateMaintenanceTypes,
    calculateCosts,
    clearSelection,
  }
}