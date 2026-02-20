import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import ThemeToggle from '../ui/ThemeToggle'
import Logo from '../ui/Logo'
import MobileMenu from '../ui/MobileMenu'
import NotificationBell from '../ui/NotificationBell'

const NAV_ITEMS = [
  { path: '/specialist/dashboard', label: 'Inicio' },
  { path: '/specialist/agenda',    label: 'Mi agenda' },
  { path: '/specialist/patients',  label: 'Mis pacientes' },
  { path: '/specialist/schedules', label: 'Mis horarios' },
  { path: '/specialist/profile',   label: 'Mi perfil' },
]

export default function SpecialistLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="aff-layout">
      <header className="aff-topbar">
        <Logo size="sm" onClick={() => navigate('/specialist/dashboard')} />

        <nav className="aff-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              className={`aff-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="aff-topbar-right">
          <span className="aff-user">
            Dr/a. <strong>{user?.fullName?.split(' ')[0]}</strong>
          </span>
          <NotificationBell />
          <ThemeToggle />
          <button className="aff-logout" onClick={() => { logout(); navigate('/') }}>
            Salir
          </button>
        </div>

        <div className="aff-mobile-right">
          <ThemeToggle />
          <button className="hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
            <span /><span /><span />
          </button>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '0.2rem' }}>
              Especialista
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-cream)' }}>
              Dr/a. {user?.fullName}
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setMobileOpen(false) }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <button className="sidebar-logout" onClick={() => { logout(); navigate('/') }}>
            Cerrar sesión
          </button>
        </div>
      </MobileMenu>

      <main className="aff-main">
        {children}
      </main>
    </div>
  )
}