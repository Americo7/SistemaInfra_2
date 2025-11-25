// web/src/lib/exporter/dataCentersExporter.js

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

// ---------- Helpers ----------
export const formatDateTime = (value) => {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatEnum = (value) => {
  if (!value) return 'N/A'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

// ---------- Formatear data ----------
export const getFormattedData = (rows) => {
  const headers = [
    'ID',
    'Nombre',
    'Ubicación',
    'Estado',
    'Fecha Creación',
    'Creado por',
    'Fecha Modificación',
    'Modificado por',
  ]

  const data = rows.map((r) => [
    r.id,
    r.nombre,
    r.ubicacion,
    formatEnum(r.estado),
    formatDateTime(r.fecha_creacion),
    r.usuario_creacion || 'N/A',
    formatDateTime(r.fecha_modificacion),
    r.usuario_modificacion || 'N/A',
  ])

  return { headers, data }
}

// ---------- PDF ----------
export const exportToPDF = (rows) => {
  const { headers, data } = getFormattedData(rows)

  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text('Reporte de Data Centers', 14, 15)

  autoTable(doc, {
    startY: 25,
    head: [headers],
    body: data,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [15, 40, 77],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    )
  }

  doc.save(`datacenters-${new Date().toISOString()}.pdf`)
}

// ---------- Excel ----------
export const exportToExcel = (rows) => {
  const { headers, data } = getFormattedData(rows)

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

  // Estilos encabezado
  for (let c = 0; c < headers.length; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c })
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '0F284D' } },
      alignment: { horizontal: 'center' },
    }
  }

  // Estilos filas
  for (let r = 1; r <= data.length; r++) {
    for (let c = 0; c < headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      if (!ws[cellRef]) ws[cellRef] = {}
      ws[cellRef].s = {
        fill: {
          fgColor: { rgb: r % 2 === 0 ? 'F8F9FA' : 'FFFFFF' },
        },
      }
    }
  }

  // Tamaño columnas
  ws['!cols'] = headers.map((h, idx) => ({
    wch: Math.max(
      ...data.map((row) => String(row[idx]).length),
      h.length
    ) + 4,
  }))

  XLSX.utils.book_append_sheet(wb, ws, 'DataCenters')
  XLSX.writeFile(wb, `datacenters-${new Date().toISOString()}.xlsx`)
}

// ---------- CSV ----------
export const exportToCSV = (rows) => {
  const { headers, data } = getFormattedData(rows)

  const csvContent = [
    headers.join(','),
    ...data.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `datacenters-${new Date().toISOString()}.csv`
  link.click()
}
