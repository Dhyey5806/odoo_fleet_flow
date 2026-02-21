import { useState } from 'react'
import { useFleetStore, Trip } from '../store/fleetStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { MapPin, Calendar } from 'lucide-react'

const tripSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  cargo_weight: z.coerce.number().min(0.01, 'Cargo weight is required'),
})

type TripFormData = z.infer<typeof tripSchema>

export default function TripDispatcher() {
  const { trips, vehicles, drivers, addTrip, completeTrip } = useFleetStore()
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [isAddingTrip, setIsAddingTrip] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [completingTripId, setCompletingTripId] = useState<string | null>(null)
  const [endOdometer, setEndOdometer] = useState(0)
  const [revenue, setRevenue] = useState(0)

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      vehicleId: '',
      driverId: '',
      source: '',
      destination: '',
      cargo_weight: 0,
    },
  })

  const onSubmit = async (data: TripFormData) => {
    try {
      await addTrip({
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        source: data.source,
        destination: data.destination,
        cargo_weight: data.cargo_weight,
      })
      form.reset()
      setIsAddingTrip(false)
    } catch (error) {
      console.error('Failed to create trip:', error)
    }
  }

  const activeTrips = trips.filter(t => t.status === 'in_progress')
  const plannedTrips = trips.filter(t => t.status === 'planned')
  const completedTrips = trips.filter(t => t.status === 'completed')

  const getVehicleInfo = (vehicleId: string) => vehicles.find(v => v.id === vehicleId)
  const getDriverInfo = (driverId: string) => drivers.find(d => d.id === driverId)
  const getTripDisplayRoute = (trip: Trip) =>
    trip.origin && trip.destination ? `${trip.origin} → ${trip.destination}` : trip.vehicleName && trip.driverName ? `${trip.vehicleName} / ${trip.driverName}` : `Trip #${trip.id}`

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
            tripList.map((trip) => (
              <TableRow key={trip.id} className="hover:bg-muted/50">
                <TableCell className="font-medium text-sm">{trip.id}</TableCell>
                <TableCell className="text-sm">{getVehicleInfo(trip.vehicleId)?.registrationNumber}</TableCell>
                <TableCell className="text-sm">{getDriverInfo(trip.driverId)?.name}</TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span className="max-w-[150px] truncate">{getTripDisplayRoute(trip)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{trip.cargo_weight ?? trip.distance ?? 0} kg</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{trip.status.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTrip(trip)}>View</Button>
                  {trip.status === 'in_progress' && (
                    <Button variant="outline" size="sm" className="ml-1" onClick={() => { setCompletingTripId(trip.id); setCompleteOpen(true); setEndOdometer(0); setRevenue(0); }}>
                      Complete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trip Dispatcher</h1>
          <p className="text-muted-foreground mt-1">Create and manage vehicle trips and routes</p>
        </div>
        <Dialog open={isAddingTrip} onOpenChange={setIsAddingTrip}>
          <DialogTrigger asChild>
            <Button>Create New Trip</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Trip</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Vehicle Selection */}
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select value={form.watch('vehicleId')} onValueChange={(value) => form.setValue('vehicleId', value)}>
                  <SelectTrigger id="vehicle">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.filter(v => v.status === 'active').map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.registrationNumber} - {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.vehicleId && (
                  <p className="text-xs text-destructive">{form.formState.errors.vehicleId.message}</p>
                )}
              </div>

              {/* Driver Selection */}
              <div className="space-y-2">
                <Label htmlFor="driver">Driver</Label>
                <Select value={form.watch('driverId')} onValueChange={(value) => form.setValue('driverId', value)}>
                  <SelectTrigger id="driver">
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.filter(d => d.status === 'active').map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.driverId && (
                  <p className="text-xs text-destructive">{form.formState.errors.driverId.message}</p>
                )}
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input id="source" placeholder="From (e.g. Mumbai Depot)" {...form.register('source')} />
                {form.formState.errors.source && (
                  <p className="text-xs text-destructive">{form.formState.errors.source.message}</p>
                )}
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" placeholder="To (e.g. Pune DC)" {...form.register('destination')} />
                {form.formState.errors.destination && (
                  <p className="text-xs text-destructive">{form.formState.errors.destination.message}</p>
                )}
              </div>

              {/* Cargo Weight (kg) */}
              <div className="space-y-2">
                <Label htmlFor="cargo_weight">Cargo Weight (kg)</Label>
                <Input
                  id="cargo_weight"
                  type="number"
                  min={0.01}
                  placeholder="e.g. 500"
                  {...form.register('cargo_weight')}
                />
                {form.formState.errors.cargo_weight && (
                  <p className="text-xs text-destructive">{form.formState.errors.cargo_weight.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                Create Trip
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{activeTrips.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Planned Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{plannedTrips.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Completed Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completedTrips.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Trips by Status */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Trip Management</CardTitle>
          <CardDescription>Monitor and manage trips by status</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="planned">Planned</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4">
              <TripTable tripList={activeTrips} />
            </TabsContent>
            <TabsContent value="planned" className="mt-4">
              <TripTable tripList={plannedTrips} />
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <TripTable tripList={completedTrips} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Complete Trip Dialog */}
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Complete Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>End Odometer</Label>
              <Input type="number" min={0} value={endOdometer || ''} onChange={(e) => setEndOdometer(Number(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Revenue (₹)</Label>
              <Input type="number" min={0} value={revenue || ''} onChange={(e) => setRevenue(Number(e.target.value) || 0)} />
            </div>
            <Button className="w-full" onClick={async () => { if (completingTripId) { await completeTrip(completingTripId, endOdometer, revenue); setCompleteOpen(false); setCompletingTripId(null); } }}>
              Mark Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trip Details */}
      {selectedTrip && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Trip {selectedTrip.id}</CardTitle>
                <CardDescription>Complete trip information</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTrip(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">SOURCE</p>
              <p className="text-sm font-medium">{selectedTrip.origin || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">DESTINATION</p>
              <p className="text-sm font-medium">{selectedTrip.destination || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">VEHICLE</p>
              <p className="text-sm font-medium">{getVehicleInfo(selectedTrip.vehicleId)?.registrationNumber || selectedTrip.vehicleName || selectedTrip.vehicleId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">DRIVER</p>
              <p className="text-sm font-medium">{getDriverInfo(selectedTrip.driverId)?.name || selectedTrip.driverName || selectedTrip.driverId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">CARGO (kg)</p>
              <p className="text-sm font-medium">{selectedTrip.cargo_weight ?? selectedTrip.distance ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                <Calendar size={14} /> CREATED
              </p>
              <p className="text-sm font-medium">{selectedTrip.created_at ? new Date(selectedTrip.created_at).toLocaleString() : new Date(selectedTrip.startTime).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">STATUS</p>
              <Badge variant="outline" className="capitalize">{selectedTrip.status.replace('_', ' ')}</Badge>
            </div>
            {selectedTrip.revenue != null && (
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">REVENUE</p>
                <p className="text-sm font-medium">₹{selectedTrip.revenue}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
