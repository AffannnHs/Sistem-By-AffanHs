import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/dashboard/Sidebar'
import Navbar from '@/components/dashboard/Navbar'
import MobileSidebar from '@/components/dashboard/MobileSidebar'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export default function DashboardLayout() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <MobileSidebar />
      <div className={cn('min-h-screen', collapsed ? 'md:ml-16' : 'md:ml-60')}>
        <Navbar />
        <div className="px-6 py-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

