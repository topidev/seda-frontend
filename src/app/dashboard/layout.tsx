import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/layout/AppSidebar'
import AppHeader from '@/components/layout/AppHeader'
import { Toaster } from 'sonner'

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
            className="flex-1 overflow-auto p-8"
            style={{ backgroundColor: 'var(--color-bg-primary)' }}
          >
            <div className="max-w-2xl mx-auto">
              {children}
              <Toaster richColors position='bottom-right' />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}