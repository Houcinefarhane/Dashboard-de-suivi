'use client'

import { useNotificationToasts } from '@/hooks/useNotifications'

export function NotificationWatcher() {
  useNotificationToasts()
  return null
}

