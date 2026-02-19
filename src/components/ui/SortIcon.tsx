type SortDir = 'asc' | 'desc'

interface SortIconProps {
  col: string
  sortKey: string
  sortDir: SortDir
}

export default function SortIcon({ col, sortKey, sortDir }: SortIconProps) {
  return sortKey === col
    ? <span style={{ color: 'var(--gold)', marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
    : <span style={{ color: 'var(--muted)', marginLeft: 4, opacity: 0.4 }}>↕</span>
}