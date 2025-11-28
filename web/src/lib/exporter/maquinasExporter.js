import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

/* ========================================================
   HELPERS DE FORMATEO
======================================================== */
const formatDateTime = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('es-BO')
}

const getNestedValue = (obj, path) => {
  if (!path) return null
  return path.split('.').reduce((o, k) => (o || {})[k], obj)
}

export const formatCell = (columnId, value, helpers) => {
  if (value === null || value === undefined) return ''

  // 1. Almacenamiento
  if (columnId === 'almacenamiento') {
    const discos = Array.isArray(value) ? value : JSON.parse(value || '[]')
    return discos.map((d) => `D${d.Disco}:${d.Valor}GB`).join(', ')
  }

  // 2. Fechas
  if (columnId.includes('fecha')) return formatDateTime(value)

  // 3. Estados
  if (columnId === 'estado')
    return value === 'ACTIVO' ? 'Activo' : 'Inactivo (Eliminado)'

  if (columnId === 'estado_operativo') {
    const map = { running: 'Encendida', stopped: 'Apagada', paused: 'Pausada' }
    return map[value] || value
  }

  // 4. Lookups
  if (columnId === 'cod_plataforma') return helpers.getNombrePlataforma(value)

  if (columnId === 'usuario_creacion' || columnId === 'usuario_modificacion') {
    return helpers.getUsuarioNombre(value)
  }

  return String(value)
}

/* ========================================================
   PREPARACIÓN DE DATOS (COMÚN)
======================================================== */
const prepareExportData = (rows, columns, helpers) => {
  // 1. Cabeceras
  const headers = columns.map((c) => c.columnDef.header)

  // 2. Cuerpo
  const body = rows.map((row) => {
    return columns.map((col) => {
      const key = col.id
      const rawValue = getNestedValue(row.original, key)
      return formatCell(key, rawValue, helpers)
    })
  })

  return { headers, body }
}

const getFileName = (suffix, ext) => 
  `maquinas${suffix}_${new Date().getTime()}.${ext}`

/* ========================================================
   EXPORTADORES INDIVIDUALES
======================================================== */

// --- 1. EXCEL ---
export const exportToExcel = (rows, columns, helpers, suffix = '') => {
  const { headers, body } = prepareExportData(rows, columns, helpers)

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...body])

  ws['!cols'] = headers.map(() => ({ wch: 20 }))

  XLSX.utils.book_append_sheet(wb, ws, 'Máquinas')
  XLSX.writeFile(wb, getFileName(suffix, 'xlsx'))
}

// --- 2. PDF ---
export const exportToPDF = (rows, columns, helpers, suffix = '') => {
  const { headers, body } = prepareExportData(rows, columns, helpers)
  const doc = new jsPDF({ orientation: 'landscape' })

  // Título
  doc.setFontSize(14)
  doc.text(`Reporte de Máquinas ${suffix.replace('-', '')}`, 14, 15)
  
  // Fecha
  doc.setFontSize(10)
  doc.text(`Generado: ${new Date().toLocaleString('es-BO')}`, 14, 22)

  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 26,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [66, 66, 66] }, // Gris oscuro
    theme: 'grid'
  })

  doc.save(getFileName(suffix, 'pdf'))
}

// --- 3. CSV ---
export const exportToCSV = (rows, columns, helpers, suffix = '') => {
  const { headers, body } = prepareExportData(rows, columns, helpers)

  const csvContent = [
    headers.join(','),
    ...body.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = getFileName(suffix, 'csv')
  link.click()
}