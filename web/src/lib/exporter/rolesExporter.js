import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

// --- HELPER: FORMATEO DE DATOS ---
const getFormattedData = (rows, columns, helpers) => {
  return rows.map((row) => {
    return columns.map((col) => {
      const val = row.original[col.id]

      // 1. Manejo de Fechas
      if (col.id.includes('fecha_')) {
        return helpers.formatDate ? helpers.formatDate(val) : val
      }

      // 2. Manejo de Auditoría
      if (['usuario_creacion', 'usuario_modificacion'].includes(col.id)) {
        return helpers.getUsuarioNombre ? helpers.getUsuarioNombre(val) : val
      }

      // 3. Manejo de Estado (Enum format)
      if (col.id === 'estado') {
        return val ? val : ''
      }

      return val ?? ''
    })
  })
}

// --- EXPORTAR A PDF ---
export const exportToPDF = (rows, columns, helpers, suffix = '') => {
  const doc = new jsPDF({ orientation: 'landscape' })

  doc.setFontSize(16)
  doc.text('Reporte de Roles', 14, 15)
  doc.setFontSize(10)
  doc.setTextColor(100)
  const dateStr = new Date().toLocaleString('es-BO')
  doc.text(`Generado: ${dateStr}`, 14, 22)

  const tableHeaders = columns.map((c) => c.columnDef.header)
  const tableData = getFormattedData(rows, columns, helpers)

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 30,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 40, 77] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  })

  doc.save(`Roles_${dateStr.replace(/[\/\s:]/g, '_')}${suffix}.pdf`)
}

// --- EXPORTAR A EXCEL ---
export const exportToExcel = (rows, columns, helpers, suffix = '') => {
  const tableHeaders = columns.map((c) => c.columnDef.header)
  const tableData = getFormattedData(rows, columns, helpers)

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([])

  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '0F284D' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
    }
  }

  XLSX.utils.sheet_add_aoa(ws, [['Reporte de Roles']], { origin: 'A1' })
  XLSX.utils.sheet_add_aoa(ws, [[`Generado: ${new Date().toLocaleString('es-BO')}`]], { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(ws, [tableHeaders], { origin: 'A4' })
  XLSX.utils.sheet_add_aoa(ws, tableData, { origin: 'A5' })

  if(!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: tableHeaders.length - 1 } })

  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 3, c: C })
    if (ws[address]) ws[address].s = headerStyle
  }

  const colWidths = tableHeaders.map(h => ({ wch: h.length + 10 }))
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'Roles')
  const dateStr = new Date().toLocaleString('es-BO').replace(/[\/\s:]/g, '_')
  XLSX.writeFile(wb, `Roles_${dateStr}${suffix}.xlsx`)
}

// --- EXPORTAR A CSV ---
export const exportToCSV = (rows, columns, helpers, suffix = '') => {
  const tableHeaders = columns.map((c) => c.columnDef.header)
  const tableData = getFormattedData(rows, columns, helpers)

  const csvContent = [
    tableHeaders.join(','),
    ...tableData.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const dateStr = new Date().toLocaleString('es-BO').replace(/[\/\s:]/g, '_')
  
  link.setAttribute('href', url)
  link.setAttribute('download', `Roles_${dateStr}${suffix}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}