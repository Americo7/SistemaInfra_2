import React, { useState, useMemo } from 'react'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import * as XLSX from 'xlsx-js-style'

import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Despliegue/DesplieguesCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters'

const UPDATE_DESPLIEGUE_MUTATION = gql`
  mutation UpdateDespliegueMutation_fromDespliegue(
    $id: Int!
    $input: UpdateDespliegueInput!
  ) {
    updateDespliegue(id: $id, input: $input) {
      id
      estado
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

const DesplieguesList = ({ despliegues = [], componentes = [], maquinas = [] }) => {
  const [deleteState, setDeleteState] = useState({ open: false, id: null })
  const [exportMenuAnchor, setExportMenuAnchor] = useState({
    all: null,
    page: null,
    selection: null,
  })
  const [showInactive, setShowInactive] = useState(false)

  const [updateDespliegue] = useMutation(UPDATE_DESPLIEGUE_MUTATION, {
    onCompleted: () => {
      toast.success('Despliegue desactivado correctamente')
      setDeleteState({ open: false, id: null })
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const desactivarDespliegue = (id) => {
    updateDespliegue({
      variables: {
        id: id,
        input: {
          estado: 'INACTIVO',
          fecha_modificacion: new Date().toISOString(),
        },
      },
    })
  }

  const getComponenteNombre = (id) => {
    const componente = componentes.find(c => c.id === id)
    return componente ? componente.nombre : `ID: ${id}`
  }

  const getMaquinaNombre = (id) => {
    const maquina = maquinas.find(m => m.id === id)
    return maquina ? maquina.nombre : `ID: ${id}`
  }

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

          if (column.id === 'id_componente') return getComponenteNombre(cellValue)
          if (column.id === 'id_maquina') return getMaquinaNombre(cellValue)
          if (column.id.includes('fecha_')) return formatDateTime(cellValue)
          if (column.id === 'estado' || column.id === 'estado_despliegue')
            return formatEnum(cellValue)
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
    doc.text('Reporte de Despliegues', 14, 15)

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

    doc.save(`despliegues-${new Date().toISOString()}.pdf`)
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

    XLSX.utils.sheet_add_aoa(ws, [['Reporte de Despliegues']], { origin: 'A1' })
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

    XLSX.utils.book_append_sheet(wb, ws, 'Despliegues')
    XLSX.writeFile(wb, `despliegues-${new Date().toISOString()}.xlsx`)
  }

  const exportToCSV = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const csvContent = [
      'Reporte de Despliegues',
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
    link.download = `despliegues-${new Date().toISOString()}.csv`
    link.click()
  }

  const filteredDespliegues = useMemo(() => {
    if (showInactive) {
      return despliegues
    }
    return despliegues.filter((despliegue) => despliegue.estado === 'ACTIVO')
  }, [despliegues, showInactive])

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      {
        accessorKey: 'id_componente',
        header: 'Componente',
        size: 150,
        Cell: ({ row }) => {
          const componenteId = row.original.id_componente
          const componente = componentes.find(c => c.id === componenteId)
          return componente ? componente.nombre : `ID: ${componenteId}`
        },
      },
      {
        accessorKey: 'id_maquina',
        header: 'Máquina',
        size: 150,
        Cell: ({ row }) => {
          const maquinaId = row.original.id_maquina
          const maquina = maquinas.find(m => m.id === maquinaId)
          return maquina ? maquina.nombre : `ID: ${maquinaId}`
        },
      },
      {
        accessorKey: 'fecha_despliegue',
        header: 'Fecha Despliegue',
        size: 150,
        Cell: ({ cell }) => timeTag(cell.getValue()),
      },
      {
        accessorKey: 'fecha_solicitud',
        header: 'Fecha Solicitud',
        size: 150,
        Cell: ({ cell }) => timeTag(cell.getValue()),
      },
      {
        accessorKey: 'unidad_solicitante',
        header: 'Unidad Solicitante',
        size: 150,
      },
      {
        accessorKey: 'solicitante',
        header: 'Solicitante',
        size: 120,
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        size: 200,
      },
      {
        accessorKey: 'cod_tipo_respaldo',
        header: 'Tipo Respaldo',
        size: 120,
      },
      {
        accessorKey: 'referencia_respaldo',
        header: 'Referencia Respaldo',
        size: 150,
      },
      {
        accessorKey: 'estado_despliegue',
        header: 'Estado Despliegue',
        size: 120,
        Cell: ({ cell }) => formatEnum(cell.getValue()),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 100,
        Cell: ({ row }) => (
          <Chip
            label={formatEnum(row.original.estado)}
            color={row.original.estado === 'ACTIVO' ? 'success' : 'error'}
            size="small"
          />
        ),
      },
      {
        accessorKey: 'fecha_creacion',
        header: 'Fecha Creación',
        size: 150,
        Cell: ({ cell }) => timeTag(cell.getValue()),
      },
      {
        accessorKey: 'usuario_creacion',
        header: 'Creado por',
        size: 120,
      },
      {
        accessorKey: 'fecha_modificacion',
        header: 'Última Modificación',
        size: 150,
        Cell: ({ cell }) => timeTag(cell.getValue()),
      },
      {
        accessorKey: 'usuario_modificacion',
        header: 'Modificado por',
        size: 120,
      },
    ],
    [componentes, maquinas]
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredDespliegues,
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
      columnVisibility: {
        usuario_creacion: false,
        fecha_modificacion: false,
        usuario_modificacion: false,
      },
      density: 'compact',
    },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Ver detalles">
          <IconButton
            component={Link}
            to={routes.despliegue({ id: row.original.id })}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton
            component={Link}
            to={routes.editDespliegue({ id: row.original.id })}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {row.original.estado === 'ACTIVO' && (
          <Tooltip title="Desactivar">
            <IconButton
              onClick={() =>
                setDeleteState({ open: true, id: row.original.id })
              }
            >
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().rows
      const hasSelection = selectedRows.length > 0

      return (
        <Box
          sx={{
            display: 'flex',
            gap: '16px',
            p: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                size="small"
              />
            }
            label="Mostrar inactivos"
          />

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
            disabled={!hasSelection}
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
            Exportar Selección ({hasSelection ? selectedRows.length : 0})
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
                exportToPDF(selectedRows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(selectedRows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(selectedRows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>
        </Box>
      )
    },
  })

  return (
    <Box sx={{ p: 1 }}>
      <MaterialReactTable table={table} />

      <Dialog
        open={deleteState.open}
        onClose={() => setDeleteState({ open: false, id: null })}
      >
        <DialogTitle>Confirmar Desactivación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de desactivar el despliegue {deleteState.id}? Esta
            acción no eliminará el despliegue de la base de datos, solo cambiará
            su estado a inactivo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button
            onClick={() => desactivarDespliegue(deleteState.id)}
            color="error"
            variant="contained"
            sx={{
              backgroundColor: '#e57373',
              '&:hover': { backgroundColor: '#ef5350' },
            }}
          >
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DesplieguesList
