import React, { useState, useMemo } from 'react'

import {
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import * as XLSX from 'xlsx-js-style'

import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/EventosBitacora/EventosBitacorasCell'

const UPDATE_EVENTOS_BITACORA_MUTATION = gql`
  mutation UpdateEventosBitacoraMutation_fromEventosBitacora(
    $id: Int!
    $input: UpdateEventosBitacoraInput!
  ) {
    updateEventosBitacora(id: $id, input: $input) {
      id
      estado_actual
      evento {
        descripcion
      }
    }
  }
`

const formatDateTime = (dateString) => {
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

const truncate = (text, length = 50) => {
  if (!text) return 'N/A'
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatEstado = (value) => {
  if (!value) return 'N/A'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

const EventosBitacorasList = ({ eventosBitacoras = [] }) => {
  const [exportMenuAnchor, setExportMenuAnchor] = useState({
    all: null,
    page: null,
    selection: null,
  })
  const [showInactive, setShowInactive] = useState(true) // Changed to true to show all by default

  const [updateEventosBitacora] = useMutation(
    UPDATE_EVENTOS_BITACORA_MUTATION,
    {
      onCompleted: () => {
        toast.success('Estado actualizado correctamente')
      },
      onError: (error) => {
        toast.error(error.message)
      },
      refetchQueries: [{ query: QUERY }],
      awaitRefetchQueries: true,
    }
  )

  const filteredEventosBitacoras = useMemo(() => {
    if (showInactive) {
      return eventosBitacoras
    }
    return eventosBitacoras.filter(
      (evento) => evento.estado_actual === 'ACTIVO'
    )
  }, [eventosBitacoras, showInactive])

  const getFormattedData = (rows, table) => {
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter(
        (column) =>
          column.id !== 'mrt-row-actions' && column.id !== 'mrt-row-select'
      )

    const headers = visibleColumns.map((column) => column.columnDef.header)

    return {
      headers,
      data: rows.map((row) =>
        visibleColumns.map((column) => {
          const cellValue = row.original[column.id] || 'N/A'

          if (column.id === 'id_evento') return row.original.evento?.descripcion
          if (column.id.includes('fecha_')) return formatDateTime(cellValue)
          if (column.id.includes('estado_')) return formatEstado(cellValue)
          return truncate(cellValue, 100)
        })
      ),
    }
  }

  const exportToPDF = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
    })

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 40, 77)
    doc.text('Reporte de Eventos de Bitácora', 14, 15)

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

    doc.save(`eventos-bitacora-${new Date().toISOString()}.pdf`)
  }

  const exportToExcel = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
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

    XLSX.utils.sheet_add_aoa(ws, [['Reporte de Eventos de Bitácora']], {
      origin: 'A1',
    })
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

    XLSX.utils.book_append_sheet(wb, ws, 'Eventos Bitácora')
    XLSX.writeFile(wb, `eventos-bitacora-${new Date().toISOString()}.xlsx`)
  }

  const exportToCSV = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const csvContent = [
      'Reporte de Eventos de Bitácora',
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
    link.download = `eventos-bitacora-${new Date().toISOString()}.csv`
    link.click()
  }

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      {
        accessorKey: 'id_evento',
        header: 'Evento',
        size: 200,
        Cell: ({ row }) => row.original.evento?.descripcion || 'N/A',
      },
      {
        accessorKey: 'fecha_creacion',
        header: 'Fecha Creación',
        size: 150,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      { accessorKey: 'usuario_creacion', header: 'Creado por', size: 120 },
      {
        accessorKey: 'fecha_modificacion',
        header: 'Última Modificación',
        size: 150,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      {
        accessorKey: 'usuario_modificacion',
        header: 'Modificado por',
        size: 120,
      },
      {
        accessorKey: 'estado_anterior',
        header: 'Estado Anterior',
        size: 120,
        Cell: ({ row }) => (
          <Chip
            label={formatEstado(row.original.estado_anterior)}
            color={
              row.original.estado_anterior === 'ACTIVO' ? 'success' : 'error'
            }
            size="small"
          />
        ),
      },
      {
        accessorKey: 'estado_actual',
        header: 'Estado Actual',
        size: 120,
        Cell: ({ row }) => (
          <Chip
            label={formatEstado(row.original.estado_actual)}
            color={
              row.original.estado_actual === 'ACTIVO' ? 'success' : 'error'
            }
            size="small"
          />
        ),
      },
    ],
    []
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredEventosBitacoras,
    enableRowActions: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row) => row.id.toString(),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: {
        cursor: 'pointer',
        backgroundColor: row.getIsSelected()
          ? 'rgba(0, 0, 255, 0.1)'
          : undefined,
      },
    }),
    initialState: {
      showGlobalFilter: true,
      density: 'compact',
    },
    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: '8px',
        }}
      >

        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Button
            disabled={table.getPrePaginationRowModel().rows.length === 0}
            onClick={(e) =>
              setExportMenuAnchor({ ...exportMenuAnchor, all: e.currentTarget })
            }
            startIcon={<FileDownloadIcon />}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#0F284D',
              '&:hover': { backgroundColor: '#1A3D6D' },
            }}
          >
            Exportar Todos
          </Button>
          <Menu
            anchorEl={exportMenuAnchor.all}
            open={Boolean(exportMenuAnchor.all)}
            onClose={() =>
              setExportMenuAnchor({ ...exportMenuAnchor, all: null })
            }
          >
            <MenuItem
              onClick={() => {
                exportToPDF(table.getPrePaginationRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, all: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(table.getPrePaginationRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, all: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(table.getPrePaginationRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, all: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>

          <Button
            disabled={table.getRowModel().rows.length === 0}
            onClick={(e) =>
              setExportMenuAnchor({
                ...exportMenuAnchor,
                page: e.currentTarget,
              })
            }
            startIcon={<FileDownloadIcon />}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#0F284D',
              '&:hover': { backgroundColor: '#1A3D6D' },
            }}
          >
            Exportar Página
          </Button>
          <Menu
            anchorEl={exportMenuAnchor.page}
            open={Boolean(exportMenuAnchor.page)}
            onClose={() =>
              setExportMenuAnchor({ ...exportMenuAnchor, page: null })
            }
          >
            <MenuItem
              onClick={() => {
                exportToPDF(table.getRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, page: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(table.getRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, page: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(table.getRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, page: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>

          <Button
            disabled={table.getSelectedRowModel().rows.length === 0}
            onClick={(e) =>
              setExportMenuAnchor({
                ...exportMenuAnchor,
                selection: e.currentTarget,
              })
            }
            startIcon={<FileDownloadIcon />}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#0F284D',
              '&:hover': { backgroundColor: '#1A3D6D' },
            }}
          >
            Exportar Selección ({table.getSelectedRowModel().rows.length})
          </Button>
          <Menu
            anchorEl={exportMenuAnchor.selection}
            open={Boolean(exportMenuAnchor.selection)}
            onClose={() =>
              setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
            }
          >
            <MenuItem
              onClick={() => {
                exportToPDF(table.getSelectedRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(table.getSelectedRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(table.getSelectedRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Ver detalles">
          <IconButton
            component={Link}
            to={routes.eventosBitacora({ id: row.original.id })}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  })

  return (
    <Box sx={{ p: 1 }}>
      <MaterialReactTable table={table} />
    </Box>
  )
}

export default EventosBitacorasList
