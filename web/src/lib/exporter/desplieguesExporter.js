// src/lib/exporter/desplieguesExporter.js
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

/* -----------------------------------------------------------
   Helpers
----------------------------------------------------------- */

const formatDateTime = (value) => {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export const formatCell = (columnId, value, helpers) => {
  if (!value) return 'N/A'

  // Fechas
  if (columnId.includes('fecha')) return formatDateTime(value)

  // Relaciones
  if (columnId === 'id_componente') return helpers.getComponente(value)
  if (columnId === 'id_maquina') return helpers.getMaquina(value)
  if (columnId === 'id_servidor') return helpers.getServidor(value)

  // Usuarios
  if (columnId === 'usuario_creacion' || columnId === 'usuario_modificacion')
    return helpers.getUsuario(value)

  // Estados
  if (columnId === 'estado') return value === 'ACTIVO' ? 'Activo' : 'Inactivo'
  if (columnId === 'estado_despliegue') return helpers.formatEnum(value)

  return String(value)
}

/* -----------------------------------------------------------
   EXPORTAR TABLA PRINCIPAL (PDF)
----------------------------------------------------------- */

export const exportToPDF = (rows, table, helpers) => {
  const visible = table
    .getVisibleLeafColumns()
    .filter((c) => !['mrt-row-actions', 'mrt-row-select'].includes(c.id))

  const headers = visible.map((c) => c.columnDef.header)

  const data = rows.map((r) =>
    visible.map((c) => formatCell(c.id, r.original[c.id], helpers))
  )

  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text('Reporte de Despliegues', 14, 12)

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 20,
    styles: { fontSize: 9 },
  })

  doc.save(`reporte-despliegues-${new Date().toISOString()}.pdf`)
}

/* -----------------------------------------------------------
   EXPORTAR TABLA PRINCIPAL (Excel)
----------------------------------------------------------- */

export const exportToExcel = (rows, table, helpers) => {
  const visible = table
    .getVisibleLeafColumns()
    .filter((c) => !['mrt-row-actions', 'mrt-row-select'].includes(c.id))

  const headers = visible.map((c) => c.columnDef.header)

  const data = rows.map((r) =>
    visible.map((c) => formatCell(c.id, r.original[c.id], helpers))
  )

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

  ws['!cols'] = headers.map((h) => ({ wch: h.length + 15 }))

  XLSX.utils.book_append_sheet(wb, ws, 'Despliegues')
  XLSX.writeFile(wb, `reporte-despliegues-${new Date().toISOString()}.xlsx`)
}

/* -----------------------------------------------------------
   EXPORTAR TABLA PRINCIPAL (CSV)
----------------------------------------------------------- */

export const exportToCSV = (rows, table, helpers) => {
  const visible = table
    .getVisibleLeafColumns()
    .filter((c) => !['mrt-row-actions', 'mrt-row-select'].includes(c.id))

  const headers = visible.map((c) => c.columnDef.header)

  const data = rows.map((r) =>
    visible.map((c) => `"${formatCell(c.id, r.original[c.id], helpers)}"`)
  )

  const csv = [headers.join(','), ...data.map((row) => row.join(','))].join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `reporte-despliegues-${new Date().toISOString()}.csv`
  link.click()
}

/* -----------------------------------------------------------
   EXPORTAR REPORTE POR SISTEMA (PDF)
----------------------------------------------------------- */

export const exportSystemReportToPDF = (systemReport) => {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text('Despliegues por Sistema', 14, 12)

  let y = 20

  systemReport.forEach((sys) => {
    doc.setFontSize(12)
    doc.text(`Sistema: ${sys.sistema}`, 14, y)
    y += 6

    const headers = [
      'Fecha Despliegue',
      'Fecha Solicitud',
      'Componente',
      'Máquina',
      'Servidor',
      'Solicitante',
      'Unidad Solicitante',
      'Referencia',
    ]

    const rows = sys.despliegues.map((d) => [
      d.fecha_despliegue,
      d.fecha_solicitud,
      d.componente,
      d.maquina || '-', // VM
      d.servidor || '-', // Servidor
      d.solicitante,
      d.unidad_solicitante,
      d.referencia_respaldo,
    ])

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: y,
      styles: { fontSize: 9 },
    })

    y = doc.lastAutoTable.finalY + 10
  })

  doc.save(`despliegues-por-sistema-${new Date().toISOString()}.pdf`)
}

/* -----------------------------------------------------------
   EXPORTAR REPORTE POR SISTEMA (Excel)
----------------------------------------------------------- */

export const exportSystemReportToExcel = (systemReport) => {
  const wb = XLSX.utils.book_new()

  systemReport.forEach((sys) => {
    const title = `Sistema: ${sys.sistema}`

    const headers = [
      'Fecha Despliegue',
      'Fecha Solicitud',
      'Componente',
      'Máquina',
      'Servidor',
      'Solicitante',
      'Unidad Solicitante',
      'Referencia',
    ]

    const rows = sys.despliegues.map((d) => [
      d.fecha_despliegue,
      d.fecha_solicitud,
      d.componente,
      d.maquina || '-',
      d.servidor || '-',
      d.solicitante,
      d.unidad_solicitante,
      d.referencia_respaldo,
    ])

    const ws = XLSX.utils.aoa_to_sheet([[title], [], headers, ...rows])

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    ]

    ws['!cols'] = headers.map((h) => ({ wch: h.length + 15 }))

    XLSX.utils.book_append_sheet(wb, ws, sys.sistema.substring(0, 31))
  })

  XLSX.writeFile(wb, `despliegues-por-sistema-${new Date().toISOString()}.xlsx`)
}
