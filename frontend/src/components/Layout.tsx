import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useFleetStore } from '../store/fleetStore'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Menu, X, LogOut, Home, Map, Users, Truck, Wrench, BarChart3, Settings, AlertCircle } from 'lucide-react'

const Navigation = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'Command Center', path: '/command-center', icon: AlertCircle },
  { label: 'Vehicles', path: '/vehicles', icon: Truck },
  { label: 'Drivers', path: '/drivers', icon: Users },
  { label: 'Trip Dispatcher', path: '/trips', icon: Map },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const fetchAll = useFleetStore((s) => s.fetchAll)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (user) fetchAll().catch(() => {})
  }, [user, fetchAll])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLower = user?.role?.toLowerCase() ?? ''

  const getFilteredNavigation = () => {
    if (!user) return Navigation
    if (roleLower === 'admin' || roleLower === 'manager') return Navigation
    if (roleLower === 'dispatcher') return Navigation.filter(n => ['Command Center', 'Vehicles', 'Drivers', 'Trip Dispatcher'].some(l => n.label.includes(l)))
    if (roleLower === 'driver') return Navigation.filter(n => ['Command Center', 'Trip Dispatcher'].some(l => n.label.includes(l)))
    return Navigation
  }

  const filteredNav = getFilteredNavigation()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">FleetFlow</h1>
          <p className="text-xs text-muted-foreground mt-1">Fleet Management System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {filteredNav.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-3">
            <p className="font-semibold text-foreground">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
            <p className="capitalize">{(user?.role ?? '').replace(/_/g, ' ')}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          size="icon"
          className="rounded-full"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-0 right-0 w-64 h-screen bg-card border-l border-border z-40 overflow-y-auto">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-primary">FleetFlow</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {filteredNav.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        navigate(item.path)
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Welcome to FleetFlow</h2>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-semibold text-sm">{user?.name || user?.email}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{(user?.role ?? '').replace(/_/g, ' ')}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
