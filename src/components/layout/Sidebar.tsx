import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const NAV_ITEMS = [
  { label: 'Dashboard',     icon: '◈', path: '/admin/dashboard' },
  { label: 'Afiliados',     icon: '◉', path: '/admin/affiliates' },
  { label: 'Especialistas', icon: '✦', path: '/admin/specialists' },
  { label: 'Turnos',        icon: '◷', path: '/admin/appointments' },
  { label: 'Horarios',      icon: '▦', path: '/admin/schedules' },
  { label: 'Penalidades',   icon: '⚑', path: '/admin/penalties' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/admin/dashboard')}>
        <span className="sidebar-logo-dot" />
        Almedin
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-name">{user?.fullName}</div>
        <div className="sidebar-user-role">Administrador</div>
        <button
          className="sidebar-logout"
          onClick={() => { logout(); navigate('/login') }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}