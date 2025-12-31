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
  Bell,
  MapPin,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ObjectivesModal } from './ObjectivesModal'

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
]

export function TopNav() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [showObjectives, setShowObjectives] = useState(false)

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
      {/* Top Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-xl border-b border-border z-50"
      >
        <div className="h-full px-4 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0"
          >
            <Logo size="sm" showText={false} />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium relative",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="relative">
                      <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                      {item.href === '/dashboard/notifications' && unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                      )}
                    </div>
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-foreground rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Right side - Objectives, Theme Toggle & Logout */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowObjectives(true)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Target className="w-4 h-4 mr-2" strokeWidth={2} />
              <span className="text-sm font-medium">Objectifs</span>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" strokeWidth={2} />
              <span className="text-sm font-medium">Déconnexion</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="bg-card/90 backdrop-blur-sm border border-border"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isMobileOpen ? 0 : '100%' }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          "lg:hidden fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-card/95 backdrop-blur-xl border-l border-border z-50 overflow-y-auto",
        )}
      >
        <div className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            )
          })}
          <div className="pt-4 border-t border-border mt-4 space-y-1">
            <Button
              variant="ghost"
              onClick={() => {
                setShowObjectives(true)
                setIsMobileOpen(false)
              }}
              className="w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Target className="w-4 h-4 mr-3" strokeWidth={2} />
              <span className="text-sm font-medium">Objectifs</span>
            </Button>
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
          </div>
        </div>
      </motion.div>

      {/* Modale des objectifs */}
      <ObjectivesModal isOpen={showObjectives} onClose={() => setShowObjectives(false)} />
    </>
  )
}

