import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

const formatDateTime = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('es-ES')
}

export const formatCell = (columnId, value, helpers) => {
  if (!value) return 'N/A'

  if (columnId === 'almacenamiento') {
    const discos = Array.isArray(value) ? value : JSON.parse(value || '[]')
    return discos.map((d) => `Disco ${d.Disco}: ${d.Valor}GB`).join(', ')
  }

  if (columnId.includes('fecha')) return formatDateTime(value)
  if (columnId === 'estado')
    return value === 'ACTIVO' ? 'Activo' : 'Inactivo'

  if (columnId === 'cod_plataforma')
    return helpers.getNombrePlataforma(value)

  if (columnId === 'usuario_creacion' || columnId === 'usuario_modificacion') {
    const u = helpers.getUsuarioById(value)
    return u ? `${u.nombres} ${u.primer_apellido}` : 'N/A'
  }

  return String(value)
}

export const exportToPDF = (rows, table, helpers) => {
  const visible = table.getVisibleLeafColumns()
    .filter(c => !['mrt-row-actions','mrt-row-select'].includes(c.id))

  const headers = visible.map(c => c.columnDef.header)
  const data = rows.map(r =>
    visible.map(c => formatCell(c.id, r.original[c.id], helpers))
  )

  const doc = new jsPDF({ orientation: 'landscape' })

  doc.text('Reporte de Máquinas', 14, 12)

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 20,
    styles: { fontSize: 9 }
  })

  doc.save(`maquinas-${new Date().toISOString()}.pdf`)
}

export const exportToExcel = (rows, table, helpers) => {
  const visible = table.getVisibleLeafColumns()
    .filter(c => !['mrt-row-actions','mrt-row-select'].includes(c.id))

  const headers = visible.map(c => c.columnDef.header)
  const data = rows.map(r =>
    visible.map(c => formatCell(c.id, r.original[c.id], helpers))
  )

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

  ws['!cols'] = headers.map(h => ({ wch: h.length + 15 }))

  XLSX.utils.book_append_sheet(wb, ws, 'Máquinas')
  XLSX.writeFile(wb, `maquinas-${new Date().toISOString()}.xlsx`)
}

export const exportToCSV = (rows, table, helpers) => {
  const visible = table.getVisibleLeafColumns()
    .filter(c => !['mrt-row-actions','mrt-row-select'].includes(c.id))

  const headers = visible.map(c => c.columnDef.header)
  const data = rows.map(r =>
    visible.map(c => `"${formatCell(c.id, r.original[c.id], helpers)}"`)
  )

  const csv = [
    headers.join(','),
    ...data.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `maquinas-${new Date().toISOString()}.csv`
  link.click()
}
