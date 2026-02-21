import { useState } from 'react'
import { useFleetStore, Vehicle } from '../store/fleetStore'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { AlertCircle, Calendar, Gauge, Fuel } from 'lucide-react'

export default function VehicleRegistry() {
  const { vehicles, addVehicle, updateVehicleStatus } = useFleetStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name_model: '',
    license_plate: '',
    max_load_kg: 1000,
    current_odometer: 0,
    acquisition_cost: 0,
  })

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addVehicle({
        model: form.name_model,
        registrationNumber: form.license_plate,
        location: '',
        currentMileage: form.current_odometer,
        manufacturer: '',
        year: 0,
        purchaseDate: '',
        fuelType: 'diesel',
        condition: 'good',
        lastMaintenanceDate: '',
        nextMaintenanceDate: '',
        status: 'active',
        max_load_kg: form.max_load_kg,
        acquisition_cost: form.acquisition_cost,
      } as any)
      setForm({ name_model: '', license_plate: '', max_load_kg: 1000, current_odometer: 0, acquisition_cost: 0 })
      setAddOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredVehicles = vehicles.filter(v =>
    v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'maintenance': return 'secondary'
      case 'inactive': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vehicle Registry</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all vehicles in your fleet</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>Add Vehicle</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <Label>Model / Name</Label>
                <Input value={form.name_model} onChange={(e) => setForm((f) => ({ ...f, name_model: e.target.value }))} placeholder="e.g. Tata Truck" required />
              </div>
              <div>
                <Label>License Plate</Label>
                <Input value={form.license_plate} onChange={(e) => setForm((f) => ({ ...f, license_plate: e.target.value }))} placeholder="e.g. MH-01-AB-1234" required />
              </div>
              <div>
                <Label>Max Load (kg)</Label>
                <Input type="number" min={0} value={form.max_load_kg || ''} onChange={(e) => setForm((f) => ({ ...f, max_load_kg: Number(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Current Odometer</Label>
                <Input type="number" min={0} value={form.current_odometer || ''} onChange={(e) => setForm((f) => ({ ...f, current_odometer: Number(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Acquisition Cost (₹)</Label>
                <Input type="number" min={0} value={form.acquisition_cost || ''} onChange={(e) => setForm((f) => ({ ...f, acquisition_cost: Number(e.target.value) || 0 }))} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">Add Vehicle</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Search Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by registration number or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{vehicles.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => v.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">In Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{vehicles.filter(v => v.status === 'maintenance').length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Maintenance Due</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {vehicles.filter(v => new Date(v.nextMaintenanceDate) <= new Date()).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Fleet Inventory</CardTitle>
          <CardDescription>Showing {filteredVehicles.length} of {vehicles.length} vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead>Registration</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{vehicle.registrationNumber}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{vehicle.model}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.manufacturer}</p>
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell className="text-sm">{vehicle.currentMileage.toLocaleString()} km</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs capitalize ${getConditionColor(vehicle.condition)}`}>
                          {vehicle.condition}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(vehicle.status) as any} className="capitalize">
                          {vehicle.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No vehicles found matching your search
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Details */}
      {selectedVehicle && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selectedVehicle.registrationNumber}</CardTitle>
                <CardDescription className="mt-1">{selectedVehicle.manufacturer} {selectedVehicle.model}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVehicle(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">REGISTRATION</p>
                <p className="text-sm font-medium">{selectedVehicle.registrationNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">YEAR</p>
                <p className="text-sm font-medium">{selectedVehicle.year}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">PURCHASE DATE</p>
                <p className="text-sm font-medium">{new Date(selectedVehicle.purchaseDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">FUEL TYPE</p>
                <p className="text-sm font-medium capitalize">{selectedVehicle.fuelType}</p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <Gauge size={14} /> CURRENT MILEAGE
                </p>
                <p className="text-sm font-medium">{selectedVehicle.currentMileage.toLocaleString()} km</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">CONDITION</p>
                <Badge variant="outline" className={`text-xs capitalize ${getConditionColor(selectedVehicle.condition)}`}>
                  {selectedVehicle.condition}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">STATUS</p>
                <Badge variant={getStatusBadgeVariant(selectedVehicle.status) as any} className="capitalize">
                  {selectedVehicle.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">LOCATION</p>
                <p className="text-sm font-medium">{selectedVehicle.location}</p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <Calendar size={14} /> LAST MAINTENANCE
                </p>
                <p className="text-sm font-medium">{new Date(selectedVehicle.lastMaintenanceDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">NEXT MAINTENANCE</p>
                <p className="text-sm font-medium">{new Date(selectedVehicle.nextMaintenanceDate).toLocaleDateString()}</p>
                {new Date(selectedVehicle.nextMaintenanceDate) <= new Date() && (
                  <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                    <AlertCircle size={14} />
                    <span>Maintenance overdue</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">ASSIGNED DRIVER</p>
                <p className="text-sm font-medium">{selectedVehicle.assignedDriver || 'Not assigned'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
