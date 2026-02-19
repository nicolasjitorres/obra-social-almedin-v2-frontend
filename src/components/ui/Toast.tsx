import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'ok' | 'err'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return <div className={`toast toast-${type}`}>{message}</div>
}