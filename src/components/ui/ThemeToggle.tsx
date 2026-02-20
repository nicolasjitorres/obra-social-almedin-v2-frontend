import { useTheme } from '../../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
      style={{
        background: 'none',
        border: '1px solid var(--color-border)',
        color: 'var(--color-muted)',
        width: 34,
        height: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '1rem',
        flexShrink: 0,
      }}
    >
      {theme === 'light' ? '☽' : '○'}
    </button>
  )
}