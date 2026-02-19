const VARIANTS: Record<string, { color: string; border: string }> = {
  active:    { color: '#22c55e', border: 'rgba(34,197,94,0.4)' },
  inactive:  { color: '#ef4444', border: 'rgba(239,68,68,0.4)' },
  PENDIENTE: { color: '#c9a84c', border: 'rgba(201,168,76,0.4)' },
  CONFIRMADA:{ color: '#3b82f6', border: 'rgba(59,130,246,0.4)' },
  COMPLETADA:{ color: '#22c55e', border: 'rgba(34,197,94,0.4)' },
  CANCELADA: { color: '#ef4444', border: 'rgba(239,68,68,0.4)' },
  AUSENTE:   { color: '#a855f7', border: 'rgba(168,85,247,0.4)' },
}

interface BadgeProps {
  variant: string
  label: string
}

export default function Badge({ variant, label }: BadgeProps) {
  const style = VARIANTS[variant] ?? { color: '#6b6b7a', border: 'rgba(107,107,122,0.4)' }
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '0.62rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      padding: '0.25rem 0.65rem',
      border: `1px solid ${style.border}`,
      color: style.color,
    }}>
      {label}
    </span>
  )
}