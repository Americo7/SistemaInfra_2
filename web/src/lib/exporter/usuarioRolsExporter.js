import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

// --- HELPER: FORMATEO DE DATOS ---
// Transforma los datos crudos de MRT a un array de strings para los reportes
const getFormattedData = (rows, columns, helpers) => {
  return rows.map((row) => {
    return columns.map((col) => {
      const val = row.original[col.id] // Valor base

      // 1. Manejo de Fechas
      if (col.id.includes('fecha_')) {
        return helpers.formatDate ? helpers.formatDate(val) : val
      }

      // 2. Manejo de Auditoría (Usuarios creadores/modificadores)
      if (['usuario_creacion', 'usuario_modificacion'].includes(col.id)) {
        return helpers.getUsuarioNombre ? helpers.getUsuarioNombre(val) : val
      }

      // 3. Manejo de Relaciones Específicas (Usuario Asignado)
      // En la tabla definimos 'usuarios.nombre_completo', pero aquí accedemos al objeto
      if (col.id === 'usuarios.nombre_completo' || col.id === 'id_usuario') {
        const u = row.original.usuarios
        return u ? `${u.nombres} ${u.primer_apellido}` : row.original.id_usuario
      }

      // 4. Manejo de Rol
      if (col.id === 'roles.nombre' || col.id === 'id_rol') {
        return row.original.roles?.nombre || row.original.id_rol
      }

      // 5. Manejo de Columna Especial "Recurso" (Máquina o Sistema)
      if (col.id === 'recurso') {
        const maquina = row.original.maquinas?.nombre
        const sistema = row.original.sistemas?.nombre
        
        if (maquina) return `VM: ${maquina}`
        if (sistema) return `SIS: ${sistema}`
        return '-'
      }

      // 6. Valores por defecto (null/undefined a string vacío)
      return val ?? ''
    })
  })
}

// --- EXPORTAR A PDF ---
export const exportToPDF = (rows, columns, helpers, suffix = '') => {
  const doc = new jsPDF({ orientation: 'landscape' })

  // Título
  doc.setFontSize(16)
  doc.text('Reporte de Asignación de Roles', 14, 15)
  doc.setFontSize(10)
  doc.setTextColor(100)
  const dateStr = new Date().toLocaleString('es-BO')
  doc.text(`Generado: ${dateStr}`, 14, 22)

  // Preparar datos
  const tableHeaders = columns.map((c) => c.columnDef.header)
  const tableData = getFormattedData(rows, columns, helpers)

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 30,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 40, 77] }, // Azul oscuro corporativo
    alternateRowStyles: { fillColor: [240, 240, 240] },
  })

  doc.save(`Usuario_Roles_${dateStr.replace(/[\/\s:]/g, '_')}${suffix}.pdf`)
}

// --- EXPORTAR A EXCEL ---
export const exportToExcel = (rows, columns, helpers, suffix = '') => {
  const tableHeaders = columns.map((c) => c.columnDef.header)
  const tableData = getFormattedData(rows, columns, helpers)

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([])

  // Estilos
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '0F284D' } }, // Azul oscuro
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
    }
  }

  // Insertar Título y Fecha
  XLSX.utils.sheet_add_aoa(ws, [['Reporte de Asignación de Roles']], { origin: 'A1' })
  XLSX.utils.sheet_add_aoa(ws, [[`Generado: ${new Date().toLocaleString('es-BO')}`]], { origin: 'A2' })

  // Insertar Cabeceras y Datos
  XLSX.utils.sheet_add_aoa(ws, [tableHeaders], { origin: 'A4' })
  XLSX.utils.sheet_add_aoa(ws, tableData, { origin: 'A5' })

  // Aplicar estilos a cabeceras
  const range = XLSX.utils.decode_range(ws['!ref'])
  // Fusionar título
  if(!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: tableHeaders.length - 1 } })

  // Loop para estilos de cabecera (Fila 3, índice 4 en Excel visualmente si empezamos en 1, pero aquí es index 3 -> A4)
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 3, c: C }) // Fila 3 = A4
    if (!ws[address]) continue
    ws[address].s = headerStyle
  }

  // Auto-ajuste de columnas simple
  const colWidths = tableHeaders.map(h => ({ wch: h.length + 5 }))
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'UsuarioRoles')
  const dateStr = new Date().toLocaleString('es-BO').replace(/[\/\s:]/g, '_')
  XLSX.writeFile(wb, `Usuario_Roles_${dateStr}${suffix}.xlsx`)
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
  link.setAttribute('download', `Usuario_Roles_${dateStr}${suffix}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}