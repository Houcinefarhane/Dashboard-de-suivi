'use client'

import { Toast } from '@/components/ui/toast'

class ToastManager {
  private listeners: Set<(toasts: Toast[]) => void> = new Set()
  private toasts: Toast[] = []

  subscribe(listener: (toasts: Toast[]) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  show(toastData: Omit<Toast, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = {
      ...toastData,
      id,
      duration: toastData.duration ?? 5000, // 5 secondes par défaut
    }
    
    this.toasts.push(newToast)
    this.notify()
    
    return id
  }

  close(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  }

  closeAll() {
    this.toasts = []
    this.notify()
  }

  getToasts() {
    return [...this.toasts]
  }
}

export const toastManager = new ToastManager()

// Helper functions pour faciliter l'utilisation
export const toast = {
  show: (toastData: Omit<Toast, 'id'>) => toastManager.show(toastData),
  close: (id: string) => toastManager.close(id),
  closeAll: () => toastManager.closeAll(),
}

