import { useState } from 'react'
import { useFleetStore, Driver } from '../store/fleetStore'
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
import { AlertTriangle, Phone, Mail, Award, TrendingUp } from 'lucide-react'

export default function DriverProfiles() {
  const { drivers, addDriver } = useFleetStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    license_expiry: '',
    safety_score: 100,
  })

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addDriver({
        name: form.name,
        licenseExpiry: form.license_expiry,
        licenseNumber: '',
        experience: 0,
        phone: '',
        email: '',
        status: 'active',
        trainingCertifications: [],
        accidentCount: 0,
        assignedVehicles: [],
        safety_score: form.safety_score,
      } as any)
      setForm({ name: '', license_expiry: '', safety_score: 100 })
      setAddOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'on_leave': return 'secondary'
      case 'inactive': return 'outline'
      default: return 'outline'
    }
  }

  const isLicenseExpiring = (date: string) => {
    const expiry = new Date(date)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return expiry <= thirtyDaysFromNow && expiry > today
  }

  const isLicenseExpired = (date: string) => {
    return new Date(date) <= new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Driver Profiles</h1>
          <p className="text-muted-foreground mt-1">Manage driver information and performance metrics</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>Add Driver</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Driver</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDriver} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Driver name" required />
              </div>
              <div>
                <Label>License Expiry (Date)</Label>
                <Input type="date" value={form.license_expiry} onChange={(e) => setForm((f) => ({ ...f, license_expiry: e.target.value }))} required />
              </div>
              <div>
                <Label>Safety Score (0–100)</Label>
                <Input type="number" min={0} max={100} value={form.safety_score} onChange={(e) => setForm((f) => ({ ...f, safety_score: Number(e.target.value) || 100 }))} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">Add Driver</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Search Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or license number..."
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
            <CardTitle className="text-sm text-muted-foreground">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{drivers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{drivers.filter(d => d.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{drivers.filter(d => d.status === 'on_leave').length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">License Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {drivers.filter(d => isLicenseExpired(d.licenseExpiry) || isLicenseExpiring(d.licenseExpiry)).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Drivers Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Driver Directory</CardTitle>
          <CardDescription>Showing {filteredDrivers.length} of {drivers.length} drivers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead>Name</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Accidents</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver) => (
                    <TableRow key={driver.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{driver.licenseNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            Exp: {new Date(driver.licenseExpiry).toLocaleDateString()}
                            {isLicenseExpired(driver.licenseExpiry) && (
                              <span className="text-red-600 ml-1 font-semibold">EXPIRED</span>
                            )}
                            {isLicenseExpiring(driver.licenseExpiry) && !isLicenseExpired(driver.licenseExpiry) && (
                              <span className="text-yellow-600 ml-1 font-semibold">EXPIRING SOON</span>
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{driver.experience} yrs</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(driver.status) as any} className="capitalize">
                          {driver.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${driver.accidentCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {driver.accidentCount} {driver.accidentCount === 1 ? 'accident' : 'accidents'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDriver(driver)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No drivers found matching your search
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Driver Details */}
      {selectedDriver && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selectedDriver.name}</CardTitle>
                <CardDescription className="mt-1">License: {selectedDriver.licenseNumber}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDriver(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 - Basic Info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">NAME</p>
                <p className="text-sm font-medium">{selectedDriver.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <Phone size={14} /> PHONE
                </p>
                <p className="text-sm font-medium">{selectedDriver.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <Mail size={14} /> EMAIL
                </p>
                <p className="text-sm font-medium break-all">{selectedDriver.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">STATUS</p>
                <Badge variant={getStatusBadgeVariant(selectedDriver.status) as any} className="capitalize">
                  {selectedDriver.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Column 2 - License & Experience */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">LICENSE NUMBER</p>
                <p className="text-sm font-medium">{selectedDriver.licenseNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">LICENSE EXPIRY</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{new Date(selectedDriver.licenseExpiry).toLocaleDateString()}</p>
                  {isLicenseExpired(selectedDriver.licenseExpiry) && (
                    <Badge variant="destructive" className="text-xs">Expired</Badge>
                  )}
                  {isLicenseExpiring(selectedDriver.licenseExpiry) && !isLicenseExpired(selectedDriver.licenseExpiry) && (
                    <Badge variant="secondary" className="text-xs">Expiring</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <TrendingUp size={14} /> EXPERIENCE
                </p>
                <p className="text-sm font-medium">{selectedDriver.experience} years</p>
              </div>
            </div>

            {/* Column 3 - Certifications & Safety */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <Award size={14} /> CERTIFICATIONS
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedDriver.trainingCertifications.length > 0 ? (
                    selectedDriver.trainingCertifications.map((cert, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No certifications</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <AlertTriangle size={14} /> ACCIDENT RECORD
                </p>
                <p className={`text-sm font-medium ${selectedDriver.accidentCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedDriver.accidentCount} {selectedDriver.accidentCount === 1 ? 'accident' : 'accidents'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">ASSIGNED VEHICLES</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDriver.assignedVehicles.length > 0 ? (
                    selectedDriver.assignedVehicles.map((vehicleId, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {vehicleId}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No vehicles assigned</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
