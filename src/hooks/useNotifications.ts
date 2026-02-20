// src/hooks/useNotifications.ts
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'

export interface Notification {
  type: string
  specialistId: number
  message: string
  timestamp: string
}

export function useNotifications() {
  const { user, token } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user || user.role !== 'SPECIALIST' || !token) return

    const url = `${import.meta.env.VITE_API_URL}/notifications/stream/${user.userId}`
    const es = new EventSource(url, { withCredentials: true })

    es.onmessage = (event) => {
      try {
        const data: Notification = JSON.parse(event.data)
        setNotifications(prev => [data, ...prev].slice(0, 20))
        setUnread(prev => prev + 1)
      } catch (e) {
        console.error('SSE parse error', e)
      }
    }

    es.onerror = () => {
        // Aqui no hacemos nada
    }

    return () => es.close()
  }, [user?.userId, token])

  const markAllRead = () => setUnread(0)

  return { notifications, unread, markAllRead }
}