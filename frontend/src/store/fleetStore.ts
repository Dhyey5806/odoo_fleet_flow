import { create } from 'zustand'
import { api } from '../lib/api'

export interface Vehicle {
  id: string
  registrationNumber: string
  model: string
  manufacturer: string
  year: number
  purchaseDate: string
  fuelType: 'diesel' | 'petrol' | 'electric' | 'hybrid'
  currentMileage: number
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  location: string
  status: 'active' | 'maintenance' | 'inactive'
  assignedDriver?: string
}

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  licenseExpiry: string
  experience: number
  phone: string
  email: string
  status: 'active' | 'inactive' | 'on_leave'
  trainingCertifications: string[]
  accidentCount: number
  assignedVehicles: string[]
}

export interface Trip {
  id: string
  vehicleId: string
  driverId: string
  origin: string
  destination: string
  startTime: string
  endTime?: string
  distance: number
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  fuel: number
  notes: string
  vehicleName?: string
  driverName?: string
  cargo_weight?: number
  revenue?: number
  created_at?: string
}

export interface MaintenanceLog {
  id: string
  vehicleId: string
  date: string
  type: 'routine' | 'repair' | 'inspection' | 'emergency'
  description: string
  cost: number
  mileage: number
  nextScheduledDate: string
  status: 'completed' | 'pending' | 'in_progress'
}

// --- Backend response types (DB shape) ---
interface VehicleRow {
  id: number
  name_model: string
  license_plate: string
  vehicle_type?: string
  region?: string | null
  max_load_kg: number
  current_odometer: number
  acquisition_cost: number
  status: 'Available' | 'On Trip' | 'In Shop' | 'Out of Service' | 'Retired'
}

interface DriverRow {
  id: number
  name: string
  license_expiry: string
  allowed_vehicle_type?: string
  safety_score: number
  status: 'On Duty' | 'Off Duty' | 'Suspended'
}

interface TripRow {
  id: number
  vehicle_id: number
  driver_id: number
  source?: string
  destination?: string
  cargo_weight: number
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled'
  revenue: number
  start_odometer: number | null
  end_odometer: number | null
  created_at: string
  name_model?: string
  name?: string
}

interface ServiceLogRow {
  id: number
  vehicle_id: number
  description: string
  cost: number
  date: string
  license_plate?: string
  name_model?: string
}

// --- Mappers: backend -> frontend ---
function mapVehicleStatus(s: string): Vehicle['status'] {
  if (s === 'Available') return 'active'
  if (s === 'On Trip') return 'active'
  if (s === 'In Shop') return 'maintenance'
  if (s === 'Out of Service' || s === 'Retired') return 'inactive'
  return 'active'
}

function mapDriverStatus(s: string): Driver['status'] {
  if (s === 'On Duty') return 'active'
  if (s === 'Off Duty') return 'inactive'
  if (s === 'Suspended') return 'inactive'
  return 'active'
}

function mapTripStatus(s: string): Trip['status'] {
  if (s === 'Draft') return 'planned'
  if (s === 'Dispatched') return 'in_progress'
  if (s === 'Completed') return 'completed'
  if (s === 'Cancelled') return 'cancelled'
  return 'planned'
}

function vehicleFromRow(r: VehicleRow): Vehicle {
  return {
    id: String(r.id),
    registrationNumber: r.license_plate,
    model: r.name_model,
    manufacturer: '',
    year: 0,
    purchaseDate: '',
    fuelType: 'diesel',
    currentMileage: r.current_odometer ?? 0,
    condition: 'good',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    location: r.region ?? '',
    status: mapVehicleStatus(r.status),
  }
}

function driverFromRow(r: DriverRow): Driver {
  return {
    id: String(r.id),
    name: r.name,
    licenseNumber: '',
    licenseExpiry: r.license_expiry,
    experience: 0,
    phone: '',
    email: '',
    status: mapDriverStatus(r.status),
    trainingCertifications: [],
    accidentCount: 0,
    assignedVehicles: [],
  }
}

function tripFromRow(r: TripRow): Trip {
  const startOdo = r.start_odometer ?? 0
  const endOdo = r.end_odometer ?? 0
  const distance = r.status === 'Completed' ? Math.max(0, endOdo - startOdo) : 0
  return {
    id: String(r.id),
    vehicleId: String(r.vehicle_id),
    driverId: String(r.driver_id),
    origin: r.source ?? '',
    destination: r.destination ?? '',
    startTime: r.created_at ?? new Date().toISOString(),
    distance,
    status: mapTripStatus(r.status),
    fuel: 0,
    notes: '',
    vehicleName: r.name_model,
    driverName: r.name,
    cargo_weight: r.cargo_weight,
    revenue: r.revenue,
    created_at: r.created_at,
  }
}

function maintenanceFromRow(r: ServiceLogRow): MaintenanceLog {
  return {
    id: String(r.id),
    vehicleId: String(r.vehicle_id),
    date: r.date,
    type: 'routine',
    description: r.description,
    cost: Number(r.cost),
    mileage: 0,
    nextScheduledDate: '',
    status: 'completed',
  }
}

interface FleetState {
  vehicles: Vehicle[]
  drivers: Driver[]
  trips: Trip[]
  maintenanceLogs: MaintenanceLog[]
  loading: boolean
  error: string | null

  fetchVehicles: () => Promise<void>
  fetchDrivers: () => Promise<void>
  fetchTrips: () => Promise<void>
  fetchMaintenanceLogs: () => Promise<void>
  fetchAll: () => Promise<void>

  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void
  updateVehicleStatus: (id: string, status: string) => Promise<void>
  deleteVehicle: (id: string) => void
  getVehicleById: (id: string) => Vehicle | undefined

  addDriver: (driver: Omit<Driver, 'id'>) => Promise<void>
  updateDriver: (id: string, driver: Partial<Driver>) => void
  updateDriverStatus: (id: string, status: string) => Promise<void>
  deleteDriver: (id: string) => void
  getDriverById: (id: string) => Driver | undefined

  addTrip: (trip: { vehicleId: string; driverId: string; cargo_weight: number; source: string; destination: string }) => Promise<void>
  updateTrip: (id: string, trip: Partial<Trip>) => void
  completeTrip: (id: string, end_odometer: number, revenue?: number) => Promise<void>
  deleteTrip: (id: string) => void
  getTripById: (id: string) => Trip | undefined

  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => Promise<void>
  updateMaintenanceLog: (id: string, log: Partial<MaintenanceLog>) => void
  deleteMaintenanceLog: (id: string) => void
  getMaintenanceLogById: (id: string) => MaintenanceLog | undefined
}

export const useFleetStore = create<FleetState>((set, get) => ({
  vehicles: [],
  drivers: [],
  trips: [],
  maintenanceLogs: [],
  loading: false,
  error: null,

  fetchVehicles: async () => {
    set({ loading: true, error: null })
    try {
      const rows = await api.get<VehicleRow[]>('/api/vehicles')
      set({ vehicles: (rows || []).map(vehicleFromRow) })
    } catch (e: any) {
      set({ error: e.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchDrivers: async () => {
    set({ loading: true, error: null })
    try {
      const rows = await api.get<DriverRow[]>('/api/drivers')
      set({ drivers: (rows || []).map(driverFromRow) })
    } catch (e: any) {
      set({ error: e.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchTrips: async () => {
    set({ loading: true, error: null })
    try {
      const rows = await api.get<TripRow[]>('/api/trips')
      set({ trips: (rows || []).map(tripFromRow) })
    } catch (e: any) {
      set({ error: e.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchMaintenanceLogs: async () => {
    set({ loading: true, error: null })
    try {
      const rows = await api.get<ServiceLogRow[]>('/api/maintenance')
      set({ maintenanceLogs: (rows || []).map(maintenanceFromRow) })
    } catch (e: any) {
      set({ error: e.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const [vRes, dRes, tRes, mRes] = await Promise.allSettled([
        api.get<VehicleRow[]>('/api/vehicles'),
        api.get<DriverRow[]>('/api/drivers'),
        api.get<TripRow[]>('/api/trips'),
        api.get<ServiceLogRow[]>('/api/maintenance'),
      ])
      set({
        vehicles: vRes.status === 'fulfilled' && vRes.value ? vRes.value.map(vehicleFromRow) : get().vehicles,
        drivers: dRes.status === 'fulfilled' && dRes.value ? dRes.value.map(driverFromRow) : get().drivers,
        trips: tRes.status === 'fulfilled' && tRes.value ? tRes.value.map(tripFromRow) : get().trips,
        maintenanceLogs: mRes.status === 'fulfilled' && mRes.value ? mRes.value.map(maintenanceFromRow) : get().maintenanceLogs,
      })
    } catch (e: any) {
      set({ error: e.message })
    } finally {
      set({ loading: false })
    }
  },

  addVehicle: async (vehicle) => {
    const body = {
      name_model: vehicle.model,
      license_plate: vehicle.registrationNumber,
      max_load_kg: (vehicle as any).max_load_kg ?? 1000,
      current_odometer: vehicle.currentMileage ?? 0,
      acquisition_cost: (vehicle as any).acquisition_cost ?? 0,
    }
    await api.post('/api/vehicles', body)
    await get().fetchVehicles()
  },

  updateVehicle: (id, updates) => {
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }))
  },

  updateVehicleStatus: async (id, status) => {
    const backendStatus = status === 'active' ? 'Available' : status === 'maintenance' ? 'In Shop' : status === 'inactive' ? 'Retired' : 'Available'
    await api.patch(`/api/vehicles/${id}/status`, { status: backendStatus })
    await get().fetchVehicles()
  },

  deleteVehicle: (id) => {
    set((state) => ({ vehicles: state.vehicles.filter((v) => v.id !== id) }))
  },

  getVehicleById: (id) => get().vehicles.find((v) => v.id === id),

  addDriver: async (driver) => {
    const body = {
      name: driver.name,
      license_expiry: driver.licenseExpiry,
      allowed_vehicle_type: (driver as any).allowed_vehicle_type || 'All',
      safety_score: (driver as any).safety_score ?? 100,
    }
    await api.post('/api/drivers', body)
    await get().fetchDrivers()
  },

  updateDriver: (id, updates) => {
    set((state) => ({
      drivers: state.drivers.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }))
  },

  updateDriverStatus: async (id, status) => {
    const backendStatus = status === 'active' ? 'On Duty' : status === 'inactive' ? 'Off Duty' : 'Suspended'
    await api.patch(`/api/drivers/${id}/status`, { status: backendStatus })
    await get().fetchDrivers()
  },

  deleteDriver: (id) => {
    set((state) => ({ drivers: state.drivers.filter((d) => d.id !== id) }))
  },

  getDriverById: (id) => get().drivers.find((d) => d.id === id),

  addTrip: async (trip) => {
    await api.post('/api/trips', {
      vehicle_id: Number(trip.vehicleId),
      driver_id: Number(trip.driverId),
      cargo_weight: trip.cargo_weight,
      source: trip.source,
      destination: trip.destination,
    })
    await get().fetchTrips()
  },

  updateTrip: (id, updates) => {
    set((state) => ({
      trips: state.trips.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  },

  completeTrip: async (id, end_odometer, revenue = 0) => {
    await api.patch(`/api/trips/${id}/complete`, { end_odometer, revenue })
    await get().fetchTrips()
    await get().fetchVehicles()
  },

  deleteTrip: (id) => {
    set((state) => ({ trips: state.trips.filter((t) => t.id !== id) }))
  },

  getTripById: (id) => get().trips.find((t) => t.id === id),

  addMaintenanceLog: async (log) => {
    await api.post('/api/maintenance', {
      vehicle_id: Number(log.vehicleId),
      description: log.description,
      cost: log.cost,
      date: log.date,
    })
    await get().fetchMaintenanceLogs()
    await get().fetchVehicles()
  },

  updateMaintenanceLog: (id, updates) => {
    set((state) => ({
      maintenanceLogs: state.maintenanceLogs.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }))
  },

  deleteMaintenanceLog: (id) => {
    set((state) => ({
      maintenanceLogs: state.maintenanceLogs.filter((m) => m.id !== id),
    }))
  },

  getMaintenanceLogById: (id) => get().maintenanceLogs.find((m) => m.id === id),
}))
