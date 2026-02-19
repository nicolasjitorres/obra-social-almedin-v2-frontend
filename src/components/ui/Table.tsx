import { type ReactNode } from 'react'

interface Column<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  rowKey: (row: T) => string | number
}

export default function Table<T>({ columns, data, isLoading, rowKey }: TableProps<T>) {
  return (
    <div className="adm-table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr className="loading-row">
              <td colSpan={columns.length}>Cargando...</td>
            </tr>
          ) : data.length === 0 ? (
            <tr className="empty-row">
              <td colSpan={columns.length}>No se encontraron resultados</td>
            </tr>
          ) : data.map(row => (
            <tr key={rowKey(row)}>
              {columns.map(col => (
                <td key={col.key}>{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}