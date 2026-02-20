import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import ThemeToggle from '../ui/ThemeToggle'
import Logo from '../ui/Logo'
import MobileMenu from '../ui/MobileMenu'

const NAV_ITEMS = [
  { label: 'Dashboard',    icon: '◈', path: '/admin/dashboard' },
  { label: 'Afiliados',    icon: '◉', path: '/admin/affiliates' },
  { label: 'Especialistas',icon: '✦', path: '/admin/specialists' },
  { label: 'Turnos',       icon: '◷', path: '/admin/appointments' },
  { label: 'Horarios',     icon: '▦', path: '/admin/schedules' },
  { label: 'Penalidades',  icon: '⚑', path: '/admin/penalties' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => { navigate(item.path); onNavigate?.() }}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="sidebar-user-name">{user?.fullName}</div>
        <div className="sidebar-user-role">Administrador</div>
        <ThemeToggle />
        <button className="sidebar-logout" onClick={() => { logout(); navigate('/login') }}>
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Sidebar desktop — visible en ≥769px */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo size="sm" onClick={() => navigate('/admin/dashboard')} />
        </div>
        <NavContent />
      </aside>

      {/* Topbar mobile — visible en ≤768px */}
      <header className="adm-mobile-topbar">
        <Logo size="sm" onClick={() => navigate('/admin/dashboard')} />
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <ThemeToggle />
          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Drawer mobile */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo size="sm" onClick={() => { navigate('/admin/dashboard'); setMobileOpen(false) }} />
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        <NavContent onNavigate={() => setMobileOpen(false)} />
      </MobileMenu>
    </>
  )
}