import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X, Bell } from 'lucide-react'
import { clsx } from 'clsx'

export type ToastKind = 'success' | 'error' | 'info' | 'notification'

interface Toast {
  id: number
  kind: ToastKind
  title: string
  body?: string
  duration?: number
}

interface ToastCtx {
  show: (t: Omit<Toast, 'id'>) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const ICONS: Record<ToastKind, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  notification: Bell,
}

const COLORS: Record<ToastKind, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  notification: 'bg-brand-50 border-brand-200 text-brand-800',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((input: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random()
    const toast: Toast = { id, duration: 4500, ...input }
    setToasts((ts) => [...ts, toast])
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration)
    }
  }, [dismiss])

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.kind]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                className={clsx(
                  'pointer-events-auto rounded-2xl border shadow-lg backdrop-blur-md px-4 py-3 flex items-start gap-3',
                  COLORS[t.kind],
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{t.title}</div>
                  {t.body && <div className="text-xs mt-0.5 opacity-80">{t.body}</div>}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="opacity-50 hover:opacity-100 flex-shrink-0"
                  aria-label="Zamknij"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}
