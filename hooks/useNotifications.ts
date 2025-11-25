'use client'

import { useEffect, useRef } from 'react'
import { toast } from '@/lib/toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  status: string
  interventionId: string | null
  invoiceId: string | null
}

export function useNotificationToasts() {
  const previousNotificationsRef = useRef<Set<string>>(new Set())
  const isInitializedRef = useRef(false)

  const checkNewNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      
      if (res.ok && Array.isArray(data)) {
        const currentIds = new Set(data.map((n: Notification) => n.id))
        
        // Au premier chargement, on initialise juste les IDs sans afficher de toasts
        if (!isInitializedRef.current) {
          previousNotificationsRef.current = currentIds
          isInitializedRef.current = true
          return
        }

        // Trouver les nouvelles notifications non lues
        const newNotifications = data.filter(
          (n: Notification) => 
            !previousNotificationsRef.current.has(n.id) && 
            n.status === 'unread'
        )

        // Afficher un toast pour chaque nouvelle notification
        newNotifications.forEach((notification: Notification) => {
          const getLink = () => {
            if (notification.interventionId) return '/dashboard/planning'
            if (notification.invoiceId) return '/dashboard/factures'
            return null
          }

          const link = getLink()

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

        previousNotificationsRef.current = currentIds
      }
    } catch (error) {
      console.error('Error checking notifications:', error)
    }
  }

  useEffect(() => {
    // Vérifier immédiatement
    checkNewNotifications()

    // Vérifier toutes les 10 secondes
    const interval = setInterval(checkNewNotifications, 10000)

    // Écouter les événements de mise à jour
    const handleNotificationUpdate = () => {
      setTimeout(checkNewNotifications, 1000)
    }
    
    window.addEventListener('notification-update', handleNotificationUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('notification-update', handleNotificationUpdate)
    }
  }, [])
}

