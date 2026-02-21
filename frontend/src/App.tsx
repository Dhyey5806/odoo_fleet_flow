import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import CommandCenter from './pages/CommandCenter'
import VehicleRegistry from './pages/VehicleRegistry'
import DriverProfiles from './pages/DriverProfiles'
import TripDispatcher from './pages/TripDispatcher'
import MaintenanceLogs from './pages/MaintenanceLogs'
import OperationalAnalytics from './pages/OperationalAnalytics'
import Layout from './components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/command-center"
          element={
            <ProtectedRoute>
              <Layout>
                <CommandCenter />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <Layout>
                <VehicleRegistry />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/drivers"
          element={
            <ProtectedRoute>
              <Layout>
                <DriverProfiles />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <Layout>
                <TripDispatcher />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute>
              <Layout>
                <MaintenanceLogs />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <OperationalAnalytics />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
