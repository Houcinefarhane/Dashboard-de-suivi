'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, CheckCircle2, Clock, AlertCircle, X, Trash2, Send, Calendar, FileText, Search, Filter, ExternalLink, BarChart3, Archive, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import Link from 'next/link'
import { toast } from '@/lib/toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  status: string
  sentAt: string | null
  readAt: string | null
  createdAt: string
  interventionId: string | null
  invoiceId: string | null
  client: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string
  } | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date')
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [showStats, setShowStats] = useState(false)
  const [groupByType, setGroupByType] = useState(false)
  const previousNotificationsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    fetchNotifications()
    // Vérifier les factures en retard au chargement
    checkOverdueInvoices()
    // Vérifier les rappels d'interventions au chargement
    checkInterventionReminders()
    
    // Rafraîchir automatiquement toutes les 5 secondes
    const interval = setInterval(() => {
      fetchNotifications()
    }, 5000)
    
    // Vérifier les rappels toutes les heures
    const reminderInterval = setInterval(() => {
      checkInterventionReminders()
    }, 60 * 60 * 1000) // Toutes les heures
    
    // Écouter les événements de mise à jour de notification
    const handleNotificationUpdate = () => {
      // Attendre un peu pour que la notification soit créée côté serveur
      setTimeout(() => {
        fetchNotifications()
      }, 500)
    }
    
    window.addEventListener('notification-update', handleNotificationUpdate)
    
    return () => {
      clearInterval(interval)
      clearInterval(reminderInterval)
      window.removeEventListener('notification-update', handleNotificationUpdate)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (res.ok) {
        // Détecter les nouvelles notifications
        const currentIds = new Set(data.map((n: Notification) => n.id))
        const previousIds = previousNotificationsRef.current
        
        // Trouver les nouvelles notifications
        const newNotifications = data.filter((n: Notification) => !previousIds.has(n.id) && n.status === 'unread')
        
        // Afficher un toast pour chaque nouvelle notification
        newNotifications.forEach((notification: Notification) => {
          const link = getNotificationLink(notification)
          
          toast.show({
            title: notification.title,
            message: notification.message,
            type: notification.type as any,
            duration: 6000,
            action: link ? {
              label: 'Voir',
              onClick: () => {
                window.location.href = link
              },
            } : undefined,
          })
        })
        
        previousNotificationsRef.current = currentIds as Set<string>
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkOverdueInvoices = async () => {
    try {
      await fetch('/api/notifications/check-overdue', { method: 'POST' })
      // Rafraîchir les notifications après la vérification
      setTimeout(() => fetchNotifications(), 500)
    } catch (error) {
      console.error('Error checking overdue invoices:', error)
    }
  }

  const checkInterventionReminders = async () => {
    try {
      await fetch('/api/notifications/check-reminders', { method: 'POST' })
      // Rafraîchir les notifications après la vérification
      setTimeout(() => fetchNotifications(), 500)
    } catch (error) {
      console.error('Error checking intervention reminders:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read', readAt: new Date().toISOString() }),
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, status: 'read', readAt: new Date().toISOString() } : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = filteredNotifications.filter((n) => n.status === 'unread')
      await Promise.all(
        unreadNotifications.map((notif) =>
          fetch(`/api/notifications/${notif.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'read', readAt: new Date().toISOString() }),
          })
        )
      )
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'intervention_status':
        return <Calendar className="w-5 h-5" />
      case 'invoice_overdue':
        return <AlertCircle className="w-5 h-5" />
      case 'intervention_reminder':
        return <Clock className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'intervention_status':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'invoice_overdue':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      case 'intervention_reminder':
        return 'bg-accent/20 text-accent border-accent/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const filteredNotifications = notifications
    .filter((notif) => {
      // Filtre par statut
      if (filter === 'unread' && notif.status !== 'unread') return false
      if (filter === 'read' && notif.status !== 'read') return false
      
      // Filtre par type
      if (typeFilter !== 'all' && notif.type !== typeFilter) return false
      
      // Recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesTitle = notif.title.toLowerCase().includes(searchLower)
        const matchesMessage = notif.message.toLowerCase().includes(searchLower)
        const matchesClient = notif.client 
          ? `${notif.client.firstName} ${notif.client.lastName}`.toLowerCase().includes(searchLower)
          : false
        if (!matchesTitle && !matchesMessage && !matchesClient) return false
      }
      
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return a.type.localeCompare(b.type)
      }
    })

  const unreadCount = notifications.filter((n) => n.status === 'unread').length
  const readCount = notifications.filter((n) => n.status === 'read').length
  
  // Statistiques
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    read: readCount,
    byType: {
      intervention_status: notifications.filter(n => n.type === 'intervention_status').length,
      invoice_overdue: notifications.filter(n => n.type === 'invoice_overdue').length,
      intervention_reminder: notifications.filter(n => n.type === 'intervention_reminder').length,
    }
  }

  // Groupement par type
  const groupedNotifications = groupByType
    ? filteredNotifications.reduce((acc, notif) => {
        if (!acc[notif.type]) acc[notif.type] = []
        acc[notif.type].push(notif)
        return acc
      }, {} as Record<string, Notification[]>)
    : { all: filteredNotifications }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedNotifications)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedNotifications(newSelected)
  }

  const selectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set())
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)))
    }
  }

  const deleteSelected = async () => {
    try {
      await Promise.all(
        Array.from(selectedNotifications).map(id =>
          fetch(`/api/notifications/${id}`, { method: 'DELETE' })
        )
      )
      setSelectedNotifications(new Set())
      fetchNotifications()
    } catch (error) {
      console.error('Error deleting notifications:', error)
    }
  }

  const markSelectedAsRead = async () => {
    try {
      await Promise.all(
        Array.from(selectedNotifications).map(id =>
          fetch(`/api/notifications/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'read', readAt: new Date().toISOString() }),
          })
        )
      )
      setSelectedNotifications(new Set())
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.interventionId) {
      return `/dashboard/planning`
    }
    if (notification.invoiceId) {
      return `/dashboard/factures`
    }
    return null
  }

  // Initialiser les IDs précédents au premier chargement
  useEffect(() => {
    if (notifications.length > 0 && previousNotificationsRef.current.size === 0) {
      previousNotificationsRef.current = new Set(notifications.map(n => n.id))
    }
  }, [notifications])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            Suivez les avancements et alertes importantes
          </p>
        </div>
        <div className="flex gap-2">
          {filteredNotifications.length > 0 && (
            <Button variant="outline" onClick={selectAll}>
              {selectedNotifications.size === filteredNotifications.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Tout marquer comme lu ({unreadCount})
            </Button>
          )}
          <Button variant="outline" onClick={checkOverdueInvoices}>
            <AlertCircle className="w-4 h-4 mr-2" />
            Vérifier les retards
          </Button>
          <Button variant="outline" onClick={checkInterventionReminders}>
            <Clock className="w-4 h-4 mr-2" />
            Vérifier les rappels
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              // Notification de test
              toast.show({
                title: 'Notification de test',
                message: 'Ceci est une notification de test pour vérifier l\'affichage du bandeau',
                type: 'info',
                duration: 5000,
                action: {
                  label: 'OK',
                  onClick: () => console.log('Test notification clicked'),
                },
              })
            }}
          >
            <Bell className="w-4 h-4 mr-2" />
            Test Toast
          </Button>
        </div>
      </motion.div>

      {/* Statistiques */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Non lues</p>
                    <p className="text-2xl font-bold text-primary">{stats.unread}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Interventions</p>
                    <p className="text-2xl font-bold">{stats.byType.intervention_status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Factures en retard</p>
                    <p className="text-2xl font-bold text-destructive">{stats.byType.invoice_overdue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Rappels</p>
                    <p className="text-2xl font-bold">{stats.byType.intervention_reminder}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre de recherche et filtres */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Rechercher dans les notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Stats
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGroupByType(!groupByType)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {groupByType ? 'Dégrouper' : 'Grouper'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Toutes ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Non lues ({unreadCount})
          </Button>
          <Button
            variant={filter === 'read' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('read')}
          >
            Lues ({readCount})
          </Button>
          
          <div className="border-l border-border mx-2" />
          
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            Tous types
          </Button>
          <Button
            variant={typeFilter === 'intervention_status' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('intervention_status')}
          >
            Interventions
          </Button>
          <Button
            variant={typeFilter === 'invoice_overdue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('invoice_overdue')}
          >
            Factures
          </Button>
          
          <div className="border-l border-border mx-2" />
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'type')}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="date">Trier par date</option>
            <option value="type">Trier par type</option>
          </select>
        </div>

        {/* Actions en masse */}
        {selectedNotifications.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg"
          >
            <span className="text-sm font-medium">
              {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} sélectionnée{selectedNotifications.size > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={markSelectedAsRead}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Marquer comme lu
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSelected}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNotifications(new Set())}
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Liste des notifications */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedNotifications).map(([groupKey, groupNotifications]) => (
            <div key={groupKey} className="space-y-3">
              {groupByType && groupKey !== 'all' && (
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {groupKey === 'intervention_status' ? 'Interventions' :
                     groupKey === 'invoice_overdue' ? 'Factures en retard' :
                     groupKey === 'intervention_reminder' ? 'Rappels' : groupKey}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    ({groupNotifications.length})
                  </span>
                </div>
              )}
              
              {groupNotifications.map((notification, index) => {
                const link = getNotificationLink(notification)
                const isSelected = selectedNotifications.has(notification.id)
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card
                      className={`border-2 transition-all duration-200 cursor-pointer ${
                        notification.status === 'unread'
                          ? 'border-primary/50 bg-primary/5 shadow-lg'
                          : isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:shadow-md'
                      }`}
                      onClick={() => toggleSelection(notification.id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelection(notification.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 w-4 h-4 rounded border-border"
                            />
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 flex-shrink-0 ${getNotificationColor(
                                notification.type
                              )}`}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{notification.title}</h3>
                                  {link && (
                                    <Link
                                      href={link}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-primary hover:text-primary/80"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Link>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                                {notification.client && (
                                  <p className="text-xs text-muted-foreground">
                                    Client: {notification.client.firstName} {notification.client.lastName}
                                    {notification.client.email && ` • ${notification.client.email}`}
                                    {notification.client.phone && ` • ${notification.client.phone}`}
                                  </p>
                                )}
                              </div>
                              {notification.status === 'unread' && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground flex-shrink-0">
                                  Non lue
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                    locale: fr,
                                  })}
                                </span>
                                {notification.sentAt && (
                                  <span className="flex items-center gap-1">
                                    <Send className="w-3 h-3" />
                                    Envoyée {formatDate(notification.sentAt)}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                {notification.status === 'unread' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Marquer comme lu
                                  </Button>
                                )}
                                {link && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <Link href={link}>
                                      <ExternalLink className="w-4 h-4 mr-1" />
                                      Voir
                                    </Link>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

