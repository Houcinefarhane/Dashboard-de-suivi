'use client'

import { useEffect, useState } from 'react'
import { ToastContainer, Toast } from '@/components/ui/toast'
import { toastManager } from '@/lib/toast'

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((newToasts) => {
      setToasts(newToasts)
    })

    // Charger les toasts existants
    setToasts(toastManager.getToasts())

    return unsubscribe
  }, [])

  const handleClose = (id: string) => {
    toastManager.close(id)
  }

  return <ToastContainer toasts={toasts} onClose={handleClose} />
}

