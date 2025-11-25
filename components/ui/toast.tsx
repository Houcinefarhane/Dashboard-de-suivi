'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from './button'
import { useEffect } from 'react'

export interface Toast {
  id: string
  title: string
  message: string
  type: 'intervention_status' | 'invoice_overdue' | 'intervention_reminder' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

function ToastComponent({ toast, onClose }: ToastProps) {
  const getIcon = () => {
    switch (toast.type) {
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

  const getColor = () => {
    switch (toast.type) {
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

  const getBorderColor = () => {
    switch (toast.type) {
      case 'intervention_status':
        return 'border-l-4 border-primary'
      case 'invoice_overdue':
        return 'border-l-4 border-destructive'
      case 'intervention_reminder':
        return 'border-l-4 border-accent'
      default:
        return 'border-l-4 border-muted-foreground'
    }
  }

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id)
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative"
    >
      <div className={`bg-[rgb(45,45,45)] border-2 border-border rounded-xl shadow-2xl backdrop-blur-xl p-4 w-full ${getBorderColor()}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 flex-shrink-0 ${getColor()}`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{toast.message}</p>
            {toast.action && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs"
                onClick={toast.action.onClick}
              >
                {toast.action.label}
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={() => onClose(toast.id)}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-none px-4 w-full max-w-md">
      <div className="flex flex-col gap-3 items-center">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto w-full">
              <ToastComponent toast={toast} onClose={onClose} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

