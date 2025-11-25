import { gql } from '@redwoodjs/web'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

// ===== QUERIES Y MUTATIONS =====
export const UPDATE_ROLE_MUTATION = gql`
  mutation UpdateRoleMutation_fromRoles($id: Int!, $input: UpdateRoleInput!) {
    updateRole(id: $id, input: $input) {
      id
      estado
    }
  }
`

export const GET_USUARIOS_QUERY = gql`
  query GetUsuariosForRolesList {
    usuarios {
      id
      nombres
      primer_apellido
    }
  }
`

// ===== FUNCIONES HELPER =====
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const truncate = (text, length = 50) => {
  if (!text) return 'N/A'
  return text.length > length ? text.substring(0, length) + '...' : text
}

export const formatEnum = (value) => {
  if (!value) return 'N/A'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

// ===== FUNCIONES DE EXPORTACIÓN =====
export const exportToPDF = (headers, data, title) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
  })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 40, 77)
  doc.text(title, 14, 15)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generado: ${formatDateTime(new Date())}`, 14, 22)

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
    body: data.map((row, rowIndex) =>
      row.map((cell) => ({
        content: cell,
        styles: {
          fillColor: rowIndex % 2 === 0 ? [248, 249, 250] : [255, 255, 255],
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

  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString()}.pdf`)
}

export const exportToExcel = (headers, data, title) => {
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

  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' })
  XLSX.utils.sheet_add_aoa(
    ws,
    [[`Generado: ${formatDateTime(new Date())}`]],
    { origin: 'A2' }
  )
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A4' })
  XLSX.utils.sheet_add_aoa(ws, data, { origin: 'A5' })

  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const headerCell = XLSX.utils.encode_cell({ r: 3, c: C })
    ws[headerCell].s = headerStyle

    for (let R = 4; R <= range.e.r; ++R) {
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
    wch:
      Math.max(
        ...data.map((row) => String(row[col]).length),
        headers[col].length
      ) + 2,
  }))

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Roles')
  XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString()}.xlsx`)
}

export const exportToCSV = (headers, data, title) => {
  const csvContent = [
    title,
    `Generado: ${formatDateTime(new Date())}`,
    '',
    headers.join(','),
    ...data.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
    '',
    `*Este archivo fue generado automáticamente el ${formatDateTime(
      new Date()
    )}`,
  ].join('\n')

  const blob = new Blob(['\ufeff', csvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString()}.csv`
  link.click()
}