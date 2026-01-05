'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Package,
  LogOut,
  Menu,
  X,
  MapPin,
  Bell,
  Settings,
  Lock,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

const menuItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/planning', label: 'Planning', icon: Calendar },
  { href: '/dashboard/geolocalisation', label: 'Géolocalisation', icon: MapPin },
  { href: '/dashboard/devis', label: 'Devis', icon: FileCheck },
  { href: '/dashboard/factures', label: 'Factures', icon: FileText },
  { href: '/dashboard/depenses', label: 'Dépenses', icon: TrendingDown },
  { href: '/dashboard/finances', label: 'Finances', icon: TrendingUp },
  { href: '/dashboard/stock', label: 'Stock', icon: Package },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/personnalisation', label: 'Personnalisation', icon: Settings },
  { href: '/dashboard/abonnement', label: 'Abonnement', icon: CreditCard },
  { href: '/dashboard/parametres', label: 'Paramètres', icon: Lock },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)

  // Détecter si on est sur desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Fermer le menu mobile quand la route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Charger le nombre de notifications non lues
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const notifications = await res.json()
          const unread = notifications.filter((n: any) => n.status === 'unread').length
          setUnreadNotifications(unread)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    fetchUnreadCount()
    // Rafraîchir toutes les 5 secondes pour un temps réel
    const interval = setInterval(fetchUnreadCount, 5000)
    
    // Écouter les événements de mise à jour
    const handleNotificationUpdate = () => {
      setTimeout(fetchUnreadCount, 500)
    }
    
    window.addEventListener('notification-update', handleNotificationUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('notification-update', handleNotificationUpdate)
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/auth/login'
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-card/90 backdrop-blur-sm border border-border shadow-lg h-10 w-10"
          aria-label={isMobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isMobileOpen}
          aria-controls="sidebar-menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[45]"
          onClick={() => setIsMobileOpen(false)}
          onTouchStart={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isDesktop ? 0 : (isMobileOpen ? 0 : -256)
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-card/95 backdrop-blur-xl border-r border-border z-[50]"
        )}
        id="sidebar-menu"
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="flex flex-col h-full p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 flex items-center justify-between"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Logo size="md" showText={false} />
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Billiev</span>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider ml-12">
                BELIEVE IN YOUR BUSINESS
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden h-8 w-8"
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          </motion.div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={item.href}
                    prefetch={true}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium relative min-h-[44px]",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                      {item.href === '/dashboard/notifications' && unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                      )}
                    </div>
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2 pt-4 border-t border-border"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">Thème</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-3" strokeWidth={2} />
              <span className="text-sm font-medium">Déconnexion</span>
            </Button>
          </motion.div>
        </div>
      </motion.aside>
    </>
  )
}
