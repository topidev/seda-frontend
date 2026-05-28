import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/layout/AppSidebar'
import AppHeader from '@/components/layout/AppHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <AppHeader />
          <main
            className="flex-1 overflow-auto"
            style={{ backgroundColor: 'var(--color-bg-primary)' }}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}