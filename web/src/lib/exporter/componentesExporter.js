import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

/* ----------------------- Helpers ----------------------- */

const formatDate = (value) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

const parseTecnologia = (value) => {
  try {
    if (!value) return []
    if (typeof value === 'string') value = JSON.parse(value)
    return Array.isArray(value) ? value : [value]
  } catch {
    return []
  }
}

const jsonTruncate = (value) => {
  try {
    const tecnologias = parseTecnologia(value)
    if (!tecnologias || tecnologias.length === 0) return 'Sin tecnologías'
    return tecnologias
      .map((t) => `${t.nombre}${t.version ? ` v${t.version}` : ''}`)
      .join(', ')
  } catch {
    return '-'
  }
}

/* ----------------------- PDF ----------------------- */

export const exportToPDF = (rows, table, helpers) => {
  const visibleCols = table
    .getVisibleLeafColumns()
    .filter((c) => c.id !== 'mrt-row-actions' && c.id !== 'mrt-row-select')

  const headers = visibleCols.map((c) => c.columnDef.header)

  const data = rows.map((row) =>
    visibleCols.map((col) => {
      const value = row.original[col.id]

      if (col.id.includes('fecha_')) return formatDate(value)
      if (col.id === 'id_sistema') return helpers.getNombreSistema(value)
      if (col.id === 'usuario_creacion') return helpers.getNombreUsuario(value)
      if (col.id === 'usuario_modificacion') return helpers.getNombreUsuario(value)
      if (col.id === 'estado') return value === 'ACTIVO' ? 'Activo' : 'Inactivo'
      if (col.id === 'tecnologia') return jsonTruncate(value)

      return value ?? '-'
    })
  )

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
  })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 40, 77)
  doc.text('Reporte de Componentes', 14, 15)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generado: ${formatDate(new Date())}`, 14, 22)

  autoTable(doc, {
    head: [
      headers.map((h) => ({
        content: h,
        styles: {
          fillColor: [15, 40, 77],
          textColor: 255,
          fontStyle: 'bold',
        },
      })),
    ],
    body: data.map((row, i) =>
      row.map((cell) => ({
        content: cell,
        styles: {
          fillColor: i % 2 === 0 ? [248, 249, 250] : [255, 255, 255],
        },
      }))
    ),
    startY: 30,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak',
      font: 'helvetica',
    },
    margin: { left: 10, right: 10 },
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 25,
      doc.internal.pageSize.height - 10
    )
  }

  doc.save(`componentes-${new Date().toISOString()}.pdf`)
}

/* ----------------------- Excel ----------------------- */

export const exportToExcel = (rows, table, helpers) => {
  const visibleCols = table
    .getVisibleLeafColumns()
    .filter((c) => c.id !== 'mrt-row-actions' && c.id !== 'mrt-row-select')

  const headers = visibleCols.map((c) => c.columnDef.header)

  const data = rows.map((row) =>
    visibleCols.map((col) => {
      const value = row.original[col.id]

      if (col.id.includes('fecha_')) return formatDate(value)
      if (col.id === 'id_sistema') return helpers.getNombreSistema(value)
      if (col.id === 'usuario_creacion') return helpers.getNombreUsuario(value)
      if (col.id === 'usuario_modificacion') return helpers.getNombreUsuario(value)
      if (col.id === 'estado') return value === 'ACTIVO' ? 'Activo' : 'Inactivo'
      if (col.id === 'tecnologia') return jsonTruncate(value)

      return value ?? '-'
    })
  )

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([])

  const headerStyle = {
    font: { sz: 12, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '0F284D' } },
    alignment: { horizontal: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    },
  }

  XLSX.utils.sheet_add_aoa(ws, [['Reporte de Componentes']], { origin: 'A1' })
  XLSX.utils.sheet_add_aoa(ws, [[`Generado: ${formatDate(new Date())}`]], {
    origin: 'A2',
  })
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A4' })
  XLSX.utils.sheet_add_aoa(ws, data, { origin: 'A5' })

  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let C = range.s.c; C <= range.e.c; C++) {
    const headerCell = XLSX.utils.encode_cell({ r: 3, c: C })
    ws[headerCell].s = headerStyle

    for (let R = 4; R <= range.e.r; R++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cell]) ws[cell] = {}
      ws[cell].s = {
        fill: { fgColor: { rgb: R % 2 === 0 ? 'F8F9FA' : 'FFFFFF' } },
        border: {
          top: { style: 'thin', color: { rgb: 'DDDDDD' } },
          bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
          left: { style: 'thin', color: { rgb: 'DDDDDD' } },
          right: { style: 'thin', color: { rgb: 'DDDDDD' } },
        },
      }
    }
  }

  ws['!cols'] = headers.map((_, col) => ({
    wch: Math.max(...data.map((r) => String(r[col]).length), headers[col].length) + 2,
  }))

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Componentes')
  XLSX.writeFile(wb, `componentes-${new Date().toISOString()}.xlsx`)
}

/* ----------------------- CSV ----------------------- */

export const exportToCSV = (rows, table, helpers) => {
  const visibleCols = table
    .getVisibleLeafColumns()
    .filter((c) => c.id !== 'mrt-row-actions' && c.id !== 'mrt-row-select')

  const headers = visibleCols.map((c) => c.columnDef.header)

  const data = rows.map((row) =>
    visibleCols.map((col) => {
      const value = row.original[col.id]

      if (col.id.includes('fecha_')) return formatDate(value)
      if (col.id === 'id_sistema') return helpers.getNombreSistema(value)
      if (col.id === 'usuario_creacion') return helpers.getNombreUsuario(value)
      if (col.id === 'usuario_modificacion') return helpers.getNombreUsuario(value)
      if (col.id === 'estado') return value === 'ACTIVO' ? 'Activo' : 'Inactivo'
      if (col.id === 'tecnologia') return jsonTruncate(value)

      return value ?? '-'
    })
  )

  const csv = [
    'Reporte de Componentes',
    `Generado: ${formatDate(new Date())}`,
    '',
    headers.join(','),
    ...data.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `componentes-${new Date().toISOString()}.csv`
  link.click()
}
