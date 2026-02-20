import { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'

export default function NotificationBell() {
  const { notifications, unread, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)

  const toggle = () => {
    setOpen(p => !p)
    if (!open) markAllRead()
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        style={{
          background: 'none', border: '1px solid var(--color-border)',
          padding: '0.4rem 0.6rem', cursor: 'pointer',
          color: unread > 0 ? 'var(--color-accent)' : 'var(--color-muted)',
          position: 'relative', transition: 'all 0.2s',
          borderColor: unread > 0 ? 'var(--color-accent)' : 'var(--color-border)',
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            background: 'var(--color-error-text)',
            color: '#fff', borderRadius: '50%',
            width: 18, height: 18,
            fontSize: '0.6rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
          />
          <div style={{
            position: 'absolute', top: '110%', right: 0,
            width: 300, maxHeight: 360, overflowY: 'auto',
            background: 'var(--color-bg-soft)',
            border: '1px solid var(--color-border)',
            zIndex: 91,
            boxShadow: '0 4px 20px var(--color-shadow)',
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '0.65rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'var(--color-muted)',
            }}>
              Notificaciones
            </div>

            {notifications.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.82rem' }}>
                Sin notificaciones
              </div>
            ) : notifications.map((n, i) => (
              <div key={i} style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '0.82rem',
              }}>
                <div style={{
                  fontSize: '0.62rem', letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: '0.3rem',
                  color: n.type === 'CANCELLED' ? 'var(--color-error-text)' : 'var(--color-accent)',
                }}>
                  {n.type === 'NEW_APPOINTMENT' ? 'Nuevo turno' : 'Turno cancelado'}
                </div>
                <div style={{ color: 'var(--color-cream)', lineHeight: 1.5 }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-muted)', marginTop: '0.3rem' }}>
                  {new Date(n.timestamp).toLocaleString('es-AR')}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}