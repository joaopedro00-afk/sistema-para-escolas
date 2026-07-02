type Column<T> = { key: keyof T; header: string }

type TableSimpleProps<T> = {
  columns: Column<T>[]
  data: T[]
  actionHeader?: string
  renderActions?: (row: T) => React.ReactNode
  emptyMessage?: string
}

export default function TableSimple<T extends { id: number | string }>({
  columns,
  data,
  actionHeader,
  renderActions,
  emptyMessage = 'Nenhum registro encontrado.',
}: TableSimpleProps<T>) {
  if (!data.length) {
    return <div className="empty-state">{emptyMessage}</div>
  }

  return (
    <div className="table-wrapper">
      <table className="table-simple">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)}>{col.header}</th>
            ))}
            {renderActions && <th>{actionHeader ?? 'Acoes'}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={String(col.key)}>{String(row[col.key] ?? '—')}</td>
              ))}
              {renderActions && <td className="actions-cell">{renderActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
