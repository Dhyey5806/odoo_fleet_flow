import { useState } from 'react'
import { useFleetStore, MaintenanceLog } from '../store/fleetStore'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { AlertCircle, Wrench, DollarSign, Calendar } from 'lucide-react'

export default function MaintenanceLogs() {
  const { maintenanceLogs, vehicles, addMaintenanceLog } = useFleetStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ vehicleId: '', description: '', cost: 0, date: new Date().toISOString().slice(0, 10) })

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vehicleId) return
    setSubmitting(true)
    try {
      await addMaintenanceLog({
        vehicleId: form.vehicleId,
        description: form.description,
        cost: form.cost,
        date: form.date,
        type: 'routine',
        mileage: 0,
        nextScheduledDate: '',
        status: 'completed',
      })
      setForm({ vehicleId: '', description: '', cost: 0, date: new Date().toISOString().slice(0, 10) })
      setScheduleOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredLogs = maintenanceLogs.filter(log =>
    String(log.vehicleId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const completedLogs = filteredLogs.filter(l => l.status === 'completed')
  const pendingLogs = filteredLogs.filter(l => l.status === 'pending')
  const inProgressLogs = filteredLogs.filter(l => l.status === 'in_progress')

  const getVehicleInfo = (vehicleId: string) => vehicles.find(v => v.id === vehicleId)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'routine': return 'bg-blue-100 text-blue-800'
      case 'repair': return 'bg-red-100 text-red-800'
      case 'inspection': return 'bg-green-100 text-green-800'
      case 'emergency': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalCost = maintenanceLogs.reduce((acc, log) => acc + log.cost, 0)
  const pendingCost = pendingLogs.reduce((acc, log) => acc + log.cost, 0)
  const completedCost = completedLogs.reduce((acc, log) => acc + log.cost, 0)

  const MaintenanceTable = ({ logs }: { logs: MaintenanceLog[] }) => (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead>Vehicle</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-muted/50">
                <TableCell className="font-medium text-sm">
                  {getVehicleInfo(log.vehicleId)?.registrationNumber || log.vehicleId}
                </TableCell>
                <TableCell className="text-sm">{new Date(log.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs capitalize ${getTypeColor(log.type)}`}>
                    {log.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">{log.description}</TableCell>
                <TableCell className="font-medium">₹{log.cost.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={log.status === 'completed' ? 'default' : log.status === 'in_progress' ? 'secondary' : 'outline'} className="capitalize text-xs">
                    {log.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No maintenance records found
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
          <h1 className="text-3xl font-bold text-foreground">Maintenance Logs</h1>
          <p className="text-muted-foreground mt-1">Track vehicle maintenance history and costs</p>
        </div>
        <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <DialogTrigger asChild>
            <Button>Schedule Maintenance</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Schedule Maintenance</DialogTitle></DialogHeader>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <Label>Vehicle</Label>
                <Select value={form.vehicleId} onValueChange={(v) => setForm((f) => ({ ...f, vehicleId: v }))} required>
                  <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.registrationNumber} – {v.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Oil change" required />
              </div>
              <div>
                <Label>Cost (₹)</Label>
                <Input type="number" min={0} value={form.cost || ''} onChange={(e) => setForm((f) => ({ ...f, cost: Number(e.target.value) || 0 }))} required />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">Add Maintenance Log</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Search Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by vehicle ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Cost Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign size={16} /> Total Maintenance Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{totalCost.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">All completed services</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle size={16} /> Pending Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pendingLogs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">₹{pendingCost.toLocaleString()} estimated cost</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Wrench size={16} /> Average Cost per Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{maintenanceLogs.length > 0 ? Math.round(totalCost / maintenanceLogs.length) : 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Based on completed services</p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Records by Status */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
          <CardDescription>View and manage maintenance history</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="completed">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="completed">
                Completed ({completedLogs.length})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress ({inProgressLogs.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingLogs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completed" className="mt-4">
              <MaintenanceTable logs={completedLogs} />
            </TabsContent>
            <TabsContent value="in-progress" className="mt-4">
              <MaintenanceTable logs={inProgressLogs} />
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <MaintenanceTable logs={pendingLogs} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Maintenance Details */}
      {selectedLog && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Maintenance Record: {selectedLog.id}</CardTitle>
                <CardDescription className="mt-1">
                  {getVehicleInfo(selectedLog.vehicleId)?.registrationNumber || selectedLog.vehicleId}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                <Calendar size={14} /> DATE
              </p>
              <p className="text-sm font-medium">{new Date(selectedLog.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                <Wrench size={14} /> TYPE
              </p>
              <Badge variant="outline" className={`text-xs capitalize ${getTypeColor(selectedLog.type)}`}>
                {selectedLog.type}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">STATUS</p>
              <Badge variant={selectedLog.status === 'completed' ? 'default' : selectedLog.status === 'in_progress' ? 'secondary' : 'outline'} className="capitalize text-xs">
                {selectedLog.status.replace('_', ' ')}
              </Badge>
            </div>
            {selectedLog.mileage > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">MILEAGE</p>
                <p className="text-sm font-medium">{selectedLog.mileage.toLocaleString()} km</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                <DollarSign size={14} /> COST
              </p>
              <p className="text-sm font-medium">₹{selectedLog.cost.toLocaleString()}</p>
            </div>
            {selectedLog.nextScheduledDate && (
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">NEXT SCHEDULED</p>
                <p className="text-sm font-medium">{new Date(selectedLog.nextScheduledDate).toLocaleDateString()}</p>
              </div>
            )}
            <div className="md:col-span-3">
              <p className="text-xs text-muted-foreground font-semibold mb-1">DESCRIPTION</p>
              <p className="text-sm">{selectedLog.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
