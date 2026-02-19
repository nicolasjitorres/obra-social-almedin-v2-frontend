interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPages, totalItems, pageSize, onChange }: PaginationProps) {
  if (totalPages <= 0) return null

  const from = page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalItems)

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) =>
    Math.max(0, Math.min(page - 2, totalPages - 5)) + i
  )

  return (
    <div className="adm-pagination">
      <span>
        {totalItems === 0 ? 'Sin resultados' : `${from}–${to} de ${totalItems}`}
      </span>
      <div className="pagination-btns">
        <button className="pg-btn" onClick={() => onChange(0)} disabled={page === 0}>«</button>
        <button className="pg-btn" onClick={() => onChange(page - 1)} disabled={page === 0}>‹</button>
        {pages.map(p => (
          <button
            key={p}
            className={`pg-btn ${p === page ? 'current' : ''}`}
            onClick={() => onChange(p)}
          >
            {p + 1}
          </button>
        ))}
        <button className="pg-btn" onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}>›</button>
        <button className="pg-btn" onClick={() => onChange(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
      </div>
    </div>
  )
}