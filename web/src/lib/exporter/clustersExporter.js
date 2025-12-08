import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

const formatDate = (value) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString('es-BO', {
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

const truncate = (text, length = 100) => {
  if (!text) return '-'
  return text.length > length ? text.substring(0, length) + '...' : text
}

const getFormattedData = (rows, visibleColumns, helpers) => {
  const headers = visibleColumns.map((column) => column.columnDef.header)

  return {
    headers,
    data: rows.map((row) =>
      visibleColumns.map((column) => {
        const cellValue = row.original[column.id] ?? '-'

        if (column.id === 'cod_tipo_cluster')
          return helpers.getNombreTipoCluster(cellValue)
        if (column.id === 'usuario_creacion' || column.id === 'usuario_modificacion')
          return helpers.getUsuarioNombre(cellValue)
        if (column.id.includes('fecha_'))
          return formatDate(cellValue)
        if (column.id === 'estado')
          return cellValue === 'ACTIVO' ? 'Activo' : 'Inactivo'

        return truncate(cellValue, 100)
      })
    ),
  }
}

export const exportToPDF = (rows, visibleColumns, helpers, suffix = '') => {
  const { headers, data } = getFormattedData(rows, visibleColumns, helpers)

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
  })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 40, 77)
  doc.text('Reporte de Clusters', 14, 15)

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

  doc.save(`clusters${suffix}-${new Date().toISOString().split('T')[0]}.pdf`)
}

export const exportToExcel = (rows, visibleColumns, helpers, suffix = '') => {
  const { headers, data } = getFormattedData(rows, visibleColumns, helpers)

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

  XLSX.utils.sheet_add_aoa(ws, [['Reporte de Clusters']], { origin: 'A1' })
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

  XLSX.utils.book_append_sheet(wb, ws, 'Clusters')
  XLSX.writeFile(wb, `clusters${suffix}-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export const exportToCSV = (rows, visibleColumns, helpers, suffix = '') => {
  const { headers, data } = getFormattedData(rows, visibleColumns, helpers)

  const csv = [
    'Reporte de Clusters',
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
  link.download = `clusters${suffix}-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
