import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

let toastCount = 0

export function useToast() {
  const [state, setState] = useState<ToastState>({
    toasts: [],
  })

  const toast = useCallback(
    ({
      title,
      description,
      action,
      variant = 'default',
      duration = 5000,
      ...props
    }: Omit<Toast, 'id'>) => {
      const id = (++toastCount).toString()

      const newToast: Toast = {
        id,
        title,
        description,
        action,
        variant,
        duration,
        ...props,
      }

      setState((prevState) => ({
        toasts: [...prevState.toasts, newToast],
      }))

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }

      return {
        id,
        dismiss: () => dismiss(id),
        update: (toastUpdate: Partial<Toast>) =>
          setState((prevState) => ({
            toasts: prevState.toasts.map((t) =>
              t.id === id ? { ...t, ...toastUpdate } : t
            ),
          })),
      }
    },
    []
  )

  const dismiss = useCallback((toastId?: string) => {
    setState((prevState) => ({
      toasts: toastId
        ? prevState.toasts.filter((toast) => toast.id !== toastId)
        : [],
    }))
  }, [])

  return {
    ...state,
    toast,
    dismiss,
  }
}

// Global toast state for use across components
let globalToastState: ToastState = { toasts: [] }
let listeners: Array<(state: ToastState) => void> = []

const addToGlobalState = (toast: Toast) => {
  globalToastState = {
    toasts: [...globalToastState.toasts, toast],
  }
  listeners.forEach((listener) => listener(globalToastState))
}

const removeFromGlobalState = (toastId: string) => {
  globalToastState = {
    toasts: globalToastState.toasts.filter((toast) => toast.id !== toastId),
  }
  listeners.forEach((listener) => listener(globalToastState))
}

export const toast = ({
  title,
  description,
  action,
  variant = 'default',
  duration = 5000,
  ...props
}: Omit<Toast, 'id'>) => {
  const id = (++toastCount).toString()

  const newToast: Toast = {
    id,
    title,
    description,
    action,
    variant,
    duration,
    ...props,
  }

  addToGlobalState(newToast)

  if (duration > 0) {
    setTimeout(() => {
      removeFromGlobalState(id)
    }, duration)
  }

  return {
    id,
    dismiss: () => removeFromGlobalState(id),
    update: (toastUpdate: Partial<Toast>) => {
      globalToastState = {
        toasts: globalToastState.toasts.map((t) =>
          t.id === id ? { ...t, ...toastUpdate } : t
        ),
      }
      listeners.forEach((listener) => listener(globalToastState))
    },
  }
}

export function useToastState() {
  const [state, setState] = useState(globalToastState)

  const subscribe = useCallback((listener: (state: ToastState) => void) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      removeFromGlobalState(toastId)
    } else {
      globalToastState = { toasts: [] }
      listeners.forEach((listener) => listener(globalToastState))
    }
  }, [])

  return {
    toasts: state.toasts,
    subscribe,
    dismiss,
  }
}