import { useEffect } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function MobileMenu({ isOpen, onClose, children }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 150,
          animation: 'fadeIn 0.2s ease',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: 280,
        background: 'var(--color-bg-soft)',
        borderRight: '1px solid var(--color-border)',
        zIndex: 151,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInLeft 0.25s ease',
        overflowY: 'auto',
      }}>
        {children}
      </div>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}