import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

const formatDateTime = (value) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

const formatCell = (columnId, value, helpers) => {
  if (value == null || value === '') return 'N/A'

  if (columnId.includes('fecha')) return formatDateTime(value)
  if (columnId === 'estado') return value === 'ACTIVO' ? 'Activo' : 'Inactivo'
  if (columnId === 'id_padre') return helpers.getNombreSistemaPadre(value)
  if (columnId === 'id_entidad') return helpers.getNombreEntidad(value)

  if (columnId === 'usuario_creacion' || columnId === 'usuario_modificacion') {
    return helpers.getNombreUsuario(value)
  }

  return String(value)
}

export const exportToPDF = (rows, table, helpers) => {
  const visibleCols = table
    .getVisibleLeafColumns()
    .filter((c) => !['mrt-row-actions', 'mrt-row-select'].includes(c.id))

  const headers = visibleCols.map((c) => c.columnDef.header)
  const data = rows.map((r) =>
    visibleCols.map((c) => formatCell(c.id, r.original[c.id], helpers))
  )

  const doc = new jsPDF({ orientation: 'landscape' })
  doc.text('Reporte de Sistemas', 14, 12)

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 20,
    styles: { fontSize: 9 },
  })

  doc.save(`sistemas-${new Date().toISOString()}.pdf`)
}

export const exportToExcel = (rows, table, helpers) => {
  const visibleCols = table
    .getVisibleLeafColumns()
    .filter((c) => !['mrt-row-actions', 'mrt-row-select'].includes(c.id))

  const headers = visibleCols.map((c) => c.columnDef.header)
  const data = rows.map((r) =>
    visibleCols.map((c) => formatCell(c.id, r.original[c.id], helpers))
  )

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

  ws['!cols'] = headers.map((h) => ({ wch: h.length + 20 }))

  XLSX.utils.book_append_sheet(wb, ws, 'Sistemas')
  XLSX.writeFile(wb, `sistemas-${new Date().toISOString()}.xlsx`)
}

export const exportToCSV = (rows, table, helpers) => {
  const visibleCols = table
    .getVisibleLeafColumns()
    .filter((c) => !['mrt-row-actions', 'mrt-row-select'].includes(c.id))

  const headers = visibleCols.map((c) => c.columnDef.header)
  const data = rows.map((r) =>
    visibleCols.map(
      (c) => `"${formatCell(c.id, r.original[c.id], helpers).replace(/"/g, '""')}"`
    )
  )

  const csv = [headers.join(','), ...data.map((row) => row.join(','))].join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `sistemas-${new Date().toISOString()}.csv`
  link.click()
}
