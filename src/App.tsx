import { useEffect } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import ToastManager from '@/components/ToastManager'
import ShortcutsModal from '@/components/ShortcutsModal'
import GlobalHotkeys from '@/components/GlobalHotkeys'
import { hydrateSession } from '@/stores/sessionStore'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PendingRoute from '@/routes/PendingRoute'
import DashboardLayout from '@/layouts/DashboardLayout'
import Login from '@/pages/Login'
import Pending from '@/pages/Pending'
import NotFound from '@/pages/NotFound'
import DashboardHome from '@/pages/dashboard/DashboardHome'
import AlertsList from '@/pages/dashboard/alerts/AlertsList'
import AlertDetail from '@/pages/dashboard/alerts/AlertDetail'
import UsersManagement from '@/pages/dashboard/users/UsersManagement'
import PendingUsers from '@/pages/dashboard/users/PendingUsers'
import Devices from '@/pages/dashboard/devices/Devices'
import Settings from '@/pages/dashboard/settings/Settings'
import LiveMap from '@/pages/dashboard/live-map/LiveMap'
import Kiosk from '@/pages/dashboard/live-map/Kiosk'

export default function App() {
  useEffect(() => {
    void hydrateSession()
  }, [])

  return (
    <Router>
      <ToastManager />
      <ShortcutsModal />
      <GlobalHotkeys />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/pending"
          element={
            <PendingRoute>
              <Pending />
            </PendingRoute>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/live-map/kiosk" element={<Kiosk />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/live-map" element={<LiveMap />} />
            <Route path="/dashboard/alerts" element={<AlertsList />} />
            <Route path="/dashboard/alerts/:id" element={<AlertDetail />} />
            <Route path="/dashboard/users" element={<UsersManagement />} />
            <Route path="/dashboard/users/pending" element={<PendingUsers />} />
            <Route path="/dashboard/devices" element={<Devices />} />
            <Route path="/dashboard/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}
