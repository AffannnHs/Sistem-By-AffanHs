import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'alert'

export type Toast = {
  id: string
  type: ToastType
  title: string
  message?: string
  durationMs: number
  createdAt: number
  action?: { label: string; onClick: () => void }
}

type ToastState = {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id' | 'createdAt'>) => void
  dismiss: (id: string) => void
  clear: () => void
}

function id() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const toast: Toast = { ...t, id: id(), createdAt: Date.now() }
    const next = [toast, ...get().toasts].slice(0, 5)
    set({ toasts: next })
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  clear: () => set({ toasts: [] }),
}))

