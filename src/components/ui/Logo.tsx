interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const sizes = { sm: 20, md: 26, lg: 34 }

export default function Logo({ size = 'md', onClick }: LogoProps) {
  const h = sizes[size]

  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: 0,
        color: 'var(--color-cream)',
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.opacity = '0.75')}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLElement).style.opacity = '1')}
    >
      {/* Ícono */}
      <svg
        width={h}
        height={h}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="5" fill="var(--color-accent)" />
        <rect x="14" y="7" width="4" height="18" rx="1" fill="white" />
        <rect x="7" y="14" width="18" height="4" rx="1" fill="white" />
      </svg>

      {/* Wordmark */}
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.2rem' : '1.5rem',
        fontWeight: 500,
        color: 'var(--color-cream)',
        letterSpacing: '0.02em',
        lineHeight: 1,
      }}>
        Almedin
      </span>
    </button>
  )
}