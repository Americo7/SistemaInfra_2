import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

/**
 * Extract visible columns and raw values (no extra formatting).
 * Mirrors the maquinas/eventos exporter pattern.
 */
const extractTableData = (rows, table) => {
  const visibleColumns = table
    .getVisibleLeafColumns()
    .filter((c) => c.id !== 'mrt-row-actions' && c.id !== 'mrt-row-select')

  const headers = visibleColumns.map((c) => c.columnDef.header)

  const data = rows.map((r) =>
    visibleColumns.map((col) => {
      const raw = r.original?.[col.id]
      if (raw === null || raw === undefined) return ''
      return typeof raw === 'object' ? JSON.stringify(raw) : raw
    })
  )

  return { headers, data }
}

/* PDF */
export const exportToPDF = (rows, table) => {
  const { headers, data } = extractTableData(rows, table)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 40, 77)
  doc.text('Reporte de Usuarios', 14, 15)

  doc.setFontSize(10)
  doc.setTextColor(90)
  doc.text(`Generado: ${new Date().toLocaleString('es-BO')}`, 14, 22)

  autoTable(doc, {
    head: [
      headers.map((h) => ({
        content: h,
        styles: { fillColor: [15, 40, 77], textColor: 255, fontStyle: 'bold' },
      })),
    ],
    body: data.map((row, idx) =>
      row.map((cell) => ({ content: String(cell ?? ''), styles: { fillColor: idx % 2 === 0 ? [248, 249, 250] : [255, 255, 255] } }))
    ),
    startY: 30,
    styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak', font: 'helvetica' },
    margin: { left: 10, right: 10 },
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10)
  }

  doc.save(`usuarios-${new Date().toISOString()}.pdf`)
}

/* EXCEL */
export const exportToExcel = (rows, table) => {
  const { headers, data } = extractTableData(rows, table)
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

  const headerStyle = {
    fill: { fgColor: { rgb: '0F284D' } },
    font: { color: { rgb: 'FFFFFF' }, bold: true },
    alignment: { horizontal: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    },
  }

  headers.forEach((_, idx) => {
    const ref = XLSX.utils.encode_cell({ r: 0, c: idx })
    if (ws[ref]) ws[ref].s = headerStyle
  })

  data.forEach((row, r) => {
    row.forEach((_, c) => {
      const ref = XLSX.utils.encode_cell({ r: r + 1, c })
      if (!ws[ref]) ws[ref] = {}
      ws[ref].s = {
        fill: { fgColor: { rgb: r % 2 === 0 ? 'F8F9FA' : 'FFFFFF' } },
        alignment: { wrapText: true },
      }
    })
  })

  ws['!cols'] = headers.map(() => ({ width: 20 }))

  XLSX.utils.book_append_sheet(wb, ws, 'Usuarios')
  XLSX.writeFile(wb, `usuarios-${new Date().toISOString()}.xlsx`)
}

/* CSV */
export const exportToCSV = (rows, table) => {
  const { headers, data } = extractTableData(rows, table)
  const csv =
    headers.join(',') +
    '\n' +
    data.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `usuarios-${new Date().toISOString()}.csv`
  link.click()
}
