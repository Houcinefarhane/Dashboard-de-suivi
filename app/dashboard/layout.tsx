import { Sidebar } from '@/components/dashboard/Sidebar'
// import { ToastProvider } from '@/components/ToastProvider'
// import { NotificationWatcher } from '@/components/NotificationWatcher'
import { getCurrentArtisan } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const artisan = await getCurrentArtisan()

  if (!artisan) {
    console.log('DashboardLayout - Pas d\'artisan trouvé, redirection vers login')
    redirect('/auth/login')
  }
  
  console.log('DashboardLayout - Artisan connecté:', artisan.email)

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      {/* <ToastProvider /> */}
      {/* <NotificationWatcher /> */}
      <main className="flex-1 lg:ml-64 pb-4 px-4 lg:px-8 pt-4 lg:pt-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

