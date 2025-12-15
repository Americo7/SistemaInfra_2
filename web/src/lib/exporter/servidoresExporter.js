import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'
import logo from 'src/images/logo-agetic-reporte.png'

// Paleta de colores corporativa AGETIC
const COLOR_GUINDO = [143, 20, 64]
const COLOR_NEGRO = [0, 0, 0]
const COLOR_GRIS_OSCURO = [70, 70, 70]
const COLOR_GRIS = [120, 120, 120]
const COLOR_GRIS_CLARO = [240, 240, 240]

/* ========================================================
   HELPERS DE FORMATEO
======================================================== */
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleString('es-BO', {
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

        if (column.id === 'cod_tipo_servidor')
          return helpers?.getNombreTipoServidor(cellValue) || cellValue
        if (column.id === 'usuario_creacion' || column.id === 'usuario_modificacion')
          return helpers?.getUsuarioNombre(cellValue) || cellValue
        if (column.id === 'estado_operativo')
          return helpers?.getNombreEstadoOperativo(cellValue) || cellValue
        if (column.id.includes('fecha_'))
          return formatDateTime(cellValue)
        if (column.id === 'estado')
          return cellValue === 'ACTIVO' ? 'Activo' : 'Inactivo'

        return truncate(cellValue, 100)
      })
    ),
  }
}

/* ========================================================
   EXPORTADOR PDF PROFESIONAL
======================================================== */
export const exportToPDF = (rows, visibleColumns, helpers, suffix = '') => {
  const { headers, data } = getFormattedData(rows, visibleColumns, helpers)

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  const margin = 12
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // ====== ENCABEZADO ======
  const logoSize = 20
  doc.addImage(logo, 'PNG', margin, margin, logoSize, logoSize)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...COLOR_NEGRO)
  doc.text('AGENCIA DE GOBIERNO ELECTRÓNICO Y TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN',
    margin + logoSize + 5, margin + 6)

  doc.setFontSize(9)
  doc.text('UNIDAD DE INFRAESTRUCTURA TECNOLÓGICA',
    margin + logoSize + 5, margin + 11)

  doc.setFontSize(12)
  doc.setTextColor(...COLOR_GUINDO)
  doc.text('REPORTE DE SERVIDORES', pageWidth / 2, margin + 20, { align: 'center' })

  // Línea separadora
  doc.setDrawColor(...COLOR_GUINDO)
  doc.setLineWidth(0.5)
  doc.line(margin, margin + 25, pageWidth - margin, margin + 25)

  let startY = margin + 32

  // ====== INFORMACIÓN DEL REPORTE ======
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_GRIS_OSCURO)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generado: ${formatDateTime(new Date())}`, margin, startY)
  doc.text(`Total de Registros: ${rows.length}`, pageWidth - margin - 50, startY)

  startY += 8

  // ====== TABLA PRINCIPAL ======
  autoTable(doc, {
    head: [headers.map(h => ({
      content: h,
      styles: {
        fillColor: COLOR_GUINDO,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      }
    }))],
    body: data.map((row, i) => row.map(cell => ({
      content: cell,
      styles: {
        fillColor: i % 2 === 0 ? COLOR_GRIS_CLARO : [255, 255, 255],
        fontSize: 7,
        textColor: COLOR_NEGRO
      }
    }))),
    startY: startY,
    margin: { left: margin, right: margin },
    styles: {
      cellPadding: 2,
      lineColor: COLOR_GRIS,
      lineWidth: 0.1,
      overflow: 'linebreak'
    },
    theme: 'grid',
    didDrawPage: (data) => {
      // Pie de página
      const pageNum = doc.internal.getCurrentPageInfo().pageNumber
      const totalPages = doc.internal.getNumberOfPages()

      doc.setDrawColor(...COLOR_GRIS)
      doc.setLineWidth(0.2)
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

      doc.setFontSize(7)
      doc.setTextColor(...COLOR_GRIS_OSCURO)
      doc.setFont('helvetica', 'normal')
      doc.text(`Servidores - Página ${pageNum} de ${totalPages}`,
        pageWidth / 2, pageHeight - 10, { align: 'center' })
      doc.text(`Generado: ${new Date().toLocaleDateString('es-BO')}`,
        pageWidth - margin, pageHeight - 10, { align: 'right' })
    }
  })

  doc.save(`servidores${suffix}-${new Date().toISOString().split('T')[0]}.pdf`)
}

/* ========================================================
   EXPORTADOR EXCEL
======================================================== */
export const exportToExcel = (rows, visibleColumns, helpers, suffix = '') => {
  const { headers, data } = getFormattedData(rows, visibleColumns, helpers)

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([])

  const headerStyle = {
    font: { sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '8F1440' } }, // COLOR_GUINDO
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    },
  }

  XLSX.utils.sheet_add_aoa(ws, [['REPORTE DE SERVIDORES']], { origin: 'A1' })
  XLSX.utils.sheet_add_aoa(ws, [[`Generado: ${formatDateTime(new Date())}`]], { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(ws, [[`Total de Registros: ${rows.length}`]], { origin: 'A3' })

  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A5' })
  XLSX.utils.sheet_add_aoa(ws, data, { origin: 'A6' })

  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const headerCell = XLSX.utils.encode_cell({ r: 4, c: C })
    ws[headerCell].s = headerStyle

    for (let R = 5; R <= range.e.r; ++R) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cell]) ws[cell] = {}
      ws[cell].s = {
        fill: { fgColor: { rgb: R % 2 === 0 ? 'F0F0F0' : 'FFFFFF' } },
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
    wch: Math.max(...data.map((row) => String(row[col]).length), headers[col].length) + 2,
  }))

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Servidores')
  XLSX.writeFile(wb, `servidores${suffix}-${new Date().toISOString().split('T')[0]}.xlsx`)
}

/* ========================================================
   EXPORTADOR CSV
======================================================== */
export const exportToCSV = (rows, visibleColumns, helpers, suffix = '') => {
  const { headers, data } = getFormattedData(rows, visibleColumns, helpers)

  const csvContent = [
    'REPORTE DE SERVIDORES',
    `Generado: ${formatDateTime(new Date())}`,
    `Total de Registros: ${rows.length}`,
    '',
    headers.join(','),
    ...data.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  const blob = new Blob(['\ufeff', csvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `servidores${suffix}-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}