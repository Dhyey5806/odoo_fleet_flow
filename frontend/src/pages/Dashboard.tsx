import { useState, useEffect } from 'react'
import { useFleetStore } from '../store/fleetStore'
import { useAuthStore } from '../store/authStore'
import { api } from '../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Truck, Users, MapPin, AlertTriangle } from 'lucide-react'

interface DashboardKPIs {
  activeFleet?: number
  maintenanceAlerts?: number
  utilizationRate?: string
  pendingCargo?: number
}

export default function Dashboard() {
  const { vehicles, drivers, trips } = useFleetStore()
  const { user } = useAuthStore()
  const [kpis, setKpis] = useState<DashboardKPIs>({})

  useEffect(() => {
    api.get<DashboardKPIs>('/api/dashboard/kpis').then(setKpis).catch(() => {})
  }, [])

  const activeVehicles = kpis.activeFleet ?? vehicles.filter(v => v.status === 'active').length
  const activeTrips = trips.filter(t => t.status === 'in_progress').length
  const completedTrips = trips.filter(t => t.status === 'completed').length
  const totalDistance = trips.reduce((acc, t) => acc + t.distance, 0)
  const maintenanceNeeded = kpis.maintenanceAlerts ?? vehicles.filter(v => {
    if (v.nextMaintenanceDate) {
      const nextDate = new Date(v.nextMaintenanceDate)
      return nextDate <= new Date()
    }
    return false
  }).length
  const activeDriversCount = drivers.filter(d => d.status === 'active').length

  const stats = [
    { title: 'Active Vehicles', value: activeVehicles, total: vehicles.length || 1, icon: Truck, color: 'text-blue-600' },
    { title: 'Active Drivers', value: activeDriversCount, total: drivers.length || 1, icon: Users, color: 'text-green-600' },
    { title: 'Ongoing Trips', value: activeTrips, total: trips.length || 1, icon: MapPin, color: 'text-purple-600' },
    { title: 'Maintenance Alerts', value: maintenanceNeeded, total: vehicles.length || 1, icon: AlertTriangle, color: 'text-red-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your fleet operations</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {(user?.role ?? '').replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`${stat.color} w-5 h-5`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">of {stat.total}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.min(100, (stat.value / (stat.total || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fleet Overview */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Fleet Overview</CardTitle>
            <CardDescription>Current status of all vehicles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {vehicles.slice(0, 4).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {vehicle.registrationNumber}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {vehicle.model} • {vehicle.location}
                    </p>
                  </div>
                  <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                    {vehicle.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trip Summary */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Trip Summary</CardTitle>
            <CardDescription>Trip statistics this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Completed Trips</p>
                <p className="text-2xl font-bold text-foreground mt-1">{completedTrips}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Ongoing Trips</p>
                <p className="text-2xl font-bold text-foreground mt-1">{activeTrips}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Total Distance</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalDistance}km</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Avg Distance</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {trips.length > 0 ? Math.round(totalDistance / trips.length) : 0}km
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {maintenanceNeeded > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <AlertTriangle size={20} />
              Maintenance Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {maintenanceNeeded} vehicle{maintenanceNeeded !== 1 ? 's' : ''} require{maintenanceNeeded === 1 ? 's' : ''} maintenance soon. Please schedule them accordingly.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
