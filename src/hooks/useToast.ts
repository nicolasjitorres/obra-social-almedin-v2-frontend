import { useState, useCallback } from 'react'

interface ToastState {
  msg: string
  type: 'ok' | 'err'
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  return { toast, showToast }
}