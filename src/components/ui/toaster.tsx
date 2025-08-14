'use client'

import { useEffect } from 'react'
import { useToastState } from '@/hooks/use-toast'
import { Toast, ToastTitle, ToastDescription } from '@/components/ui/toast'

export function Toaster() {
  const { toasts, subscribe, dismiss } = useToastState()

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      // Re-render when toast state changes
    })
    return unsubscribe
  }, [subscribe])

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          onClose={() => dismiss(toast.id)}
        >
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          {toast.action && <div className="mt-2">{toast.action}</div>}
        </Toast>
      ))}
    </div>
  )
}