import { useState } from 'react'
import { useFleetStore, Trip } from '../store/fleetStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { AlertCircle, AlertTriangle, MapPin, Truck, Clock } from 'lucide-react'

export default function CommandCenter() {
  const { trips, vehicles, drivers, completeTrip } = useFleetStore()
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [completingTripId, setCompletingTripId] = useState<string | null>(null)
  const [endOdometer, setEndOdometer] = useState(0)
  const [revenue, setRevenue] = useState(0)

  const activeTrips = trips.filter(t => t.status === 'in_progress')
  const pendingTrips = trips.filter(t => t.status === 'planned')
  const completedTrips = trips.filter(t => t.status === 'completed')

  const getVehicleInfo = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId)
  }

  const getDriverInfo = (driverId: string) => {
    return drivers.find(d => d.id === driverId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const TripTable = ({ tripList }: { tripList: Trip[] }) => (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead>Trip ID</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Cargo (kg)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tripList.length > 0 ? (
            tripList.map((trip) => {
              const vehicle = getVehicleInfo(trip.vehicleId)
              const driver = getDriverInfo(trip.driverId)
              return (
                <TableRow key={trip.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-sm">{trip.id}</TableCell>
                  <TableCell className="text-sm">
                    {vehicle?.registrationNumber || 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {driver?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin size={14} />
                      <span className="truncate max-w-[150px]">
                        {trip.origin && trip.destination ? `${trip.origin} → ${trip.destination}` : trip.vehicleName && trip.driverName ? `${trip.vehicleName} / ${trip.driverName}` : `Trip #${trip.id}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{trip.cargo_weight ?? trip.distance ?? 0} kg</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs capitalize ${getStatusColor(trip.status)}`}>
                      {trip.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTrip(trip)}>View</Button>
                    {trip.status === 'in_progress' && (
                      <Button variant="outline" size="sm" className="ml-1" onClick={() => { setCompletingTripId(trip.id); setCompleteOpen(true); setEndOdometer(0); setRevenue(0); }}>Complete</Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No trips found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Command Center</h1>
        <p className="text-muted-foreground mt-1">Real-time monitoring and management of all fleet operations</p>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-900">
              <Clock size={18} />
              Active Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-900">{activeTrips.length}</p>
            <p className="text-xs text-blue-700 mt-1">Trips currently in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-yellow-900">
              <AlertCircle size={18} />
              Pending Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-900">{pendingTrips.length}</p>
            <p className="text-xs text-yellow-700 mt-1">Planned trips awaiting start</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-900">
              <Truck size={18} />
              Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-900">{vehicles.filter(v => v.status === 'active').length}/{vehicles.length}</p>
            <p className="text-xs text-green-700 mt-1">Vehicles active in fleet</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different trip statuses */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Trip Operations</CardTitle>
          <CardDescription>Monitor and manage all trip statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="active" className="relative">
                Active
                {activeTrips.length > 0 && (
                  <span className="absolute top-0 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {activeTrips.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                {pendingTrips.length > 0 && (
                  <span className="absolute top-0 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-yellow-600 rounded-full">
                    {pendingTrips.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <TripTable tripList={activeTrips} />
            </TabsContent>
            <TabsContent value="pending" className="space-y-4">
              <TripTable tripList={pendingTrips} />
            </TabsContent>
            <TabsContent value="completed" className="space-y-4">
              <TripTable tripList={completedTrips} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Complete Trip</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>End Odometer</Label><Input type="number" min={0} value={endOdometer || ''} onChange={(e) => setEndOdometer(Number(e.target.value) || 0)} /></div>
            <div><Label>Revenue (₹)</Label><Input type="number" min={0} value={revenue || ''} onChange={(e) => setRevenue(Number(e.target.value) || 0)} /></div>
            <Button className="w-full" onClick={async () => { if (completingTripId) { await completeTrip(completingTripId, endOdometer, revenue); setCompleteOpen(false); setCompletingTripId(null); } }}>Mark Complete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trip Details Modal/Card */}
      {selectedTrip && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Trip Details: {selectedTrip.id}</CardTitle>
                <CardDescription className="mt-1">Complete information for selected trip</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTrip(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">SOURCE</p>
              <p className="text-sm font-medium">{selectedTrip.origin || '—'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">DESTINATION</p>
              <p className="text-sm font-medium">{selectedTrip.destination || '—'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">VEHICLE</p>
              <p className="text-sm font-medium">{getVehicleInfo(selectedTrip.vehicleId)?.registrationNumber || selectedTrip.vehicleName || selectedTrip.vehicleId}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">DRIVER</p>
              <p className="text-sm font-medium">{getDriverInfo(selectedTrip.driverId)?.name || selectedTrip.driverName || selectedTrip.driverId}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">CARGO (kg)</p>
              <p className="text-sm font-medium">{selectedTrip.cargo_weight ?? selectedTrip.distance ?? '—'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">CREATED</p>
              <p className="text-sm font-medium">{selectedTrip.created_at ? new Date(selectedTrip.created_at).toLocaleString() : new Date(selectedTrip.startTime).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">STATUS</p>
              <Badge variant="outline" className="capitalize">{selectedTrip.status.replace('_', ' ')}</Badge>
            </div>
            {selectedTrip.revenue != null && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold">REVENUE</p>
                <p className="text-sm font-medium">₹{selectedTrip.revenue}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
