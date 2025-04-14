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
import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Servidor/ServidorsCell'

const UPDATE_SERVIDOR_MUTATION = gql`
  mutation UpdateServidorMutation_fromServidores(
    $id: Int!
    $input: UpdateServidorInput!
  ) {
    updateServidor(id: $id, input: $input) {
      id
      estado
    }
  }
`

const GET_SERVIDORES_PADRES = gql`
  query GetServidoresPadres {
    servidores {
      id
      nombre
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

const formatEnum = (value) => {
  if (!value) return 'N/A'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

const ServidorsList = ({ servidores = [] }) => {
  const [deleteState, setDeleteState] = useState({ open: false, id: null })
  const [exportMenuAnchor, setExportMenuAnchor] = useState({
    all: null,
    page: null,
    selection: null,
  })
  const [showInactive, setShowInactive] = useState(false)
  const [servidoresPadres, setServidoresPadres] = useState([])

  const { loading: loadingPadres } = useQuery(GET_SERVIDORES_PADRES, {
    onCompleted: (data) => {
      setServidoresPadres(data.servidores)
    },
  })

  const [updateServidor] = useMutation(UPDATE_SERVIDOR_MUTATION, {
    onCompleted: () => {
      toast.success('Estado del servidor actualizado')
      setDeleteState({ open: false, id: null })
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const desactivarServidor = (id) => {
    updateServidor({
      variables: {
        id: id,
        input: {
          estado: 'INACTIVO',
          fecha_modificacion: new Date().toISOString(),
        },
      },
    })
  }

  const filteredServidores = useMemo(() => {
    return showInactive
      ? servidores
      : servidores.filter((servidor) => servidor.estado === 'ACTIVO')
  }, [servidores, showInactive])

  const getNombreServidorPadre = (idPadre) => {
    if (!idPadre) return 'N/A'
    const padre = servidoresPadres.find((serv) => serv.id === idPadre)
    return padre ? padre.nombre : `ID: ${idPadre}`
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
          const cellValue = row.original[column.id] ?? 'N/A'

          if (column.id === 'id_padre') return getNombreServidorPadre(cellValue)
          if (column.id.includes('fecha_')) return formatDateTime(cellValue)
          if (column.id === 'estado' || column.id === 'estado_operativo')
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
    doc.text('Reporte de Servidores', 14, 15)

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

    doc.save(`servidores-${new Date().toISOString()}.pdf`)
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

    XLSX.utils.sheet_add_aoa(ws, [['Reporte de Servidores']], { origin: 'A1' })
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

    XLSX.utils.book_append_sheet(wb, ws, 'Servidores')
    XLSX.writeFile(wb, `servidores-${new Date().toISOString()}.xlsx`)
  }

  const exportToCSV = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const csvContent = [
      'Reporte de Servidores',
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
    link.download = `servidores-${new Date().toISOString()}.csv`
    link.click()
  }

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      {
        accessorKey: 'cod_inventario_agetic',
        header: 'Código AGETIC',
        size: 120,
      },
      { accessorKey: 'serie', header: 'Serie', size: 120 },
      { accessorKey: 'marca', header: 'Marca', size: 100 },
      { accessorKey: 'modelo', header: 'Modelo', size: 100 },
      { accessorKey: 'nombre', header: 'Nombre', size: 100 },
      { accessorKey: 'ram', header: 'RAM (GB)', size: 100 },
      {
        accessorKey: 'almacenamiento',
        header: 'Almacenamiento (GB)',
        size: 120,
      },
      { accessorKey: 'id_data_center', header: 'Data Center ID', size: 120 },
      { accessorKey: 'cod_tipo_servidor', header: 'Tipo Servidor', size: 120 },
      {
        accessorKey: 'id_padre',
        header: 'Servidor Padre',
        size: 150,
        Cell: ({ cell }) => getNombreServidorPadre(cell.getValue()),
      },
      {
        accessorKey: 'estado_operativo',
        header: 'Estado Operativo',
        size: 150,
        Cell: ({ row }) => (
          <Chip
            label={formatEnum(row.original.estado_operativo)}
            size="small"
            sx={{
              backgroundColor: '#fbc02d',
              color: '#000',
              fontWeight: 'bold',
            }}
          />
        ),
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
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      {
        accessorKey: 'usuario_creacion',
        header: 'Creado por',
        size: 120,
        visible: false,
      },
      {
        accessorKey: 'fecha_modificacion',
        header: 'Última Modificación',
        size: 150,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
        visible: false,
      },
      {
        accessorKey: 'usuario_modificacion',
        header: 'Modificado por',
        size: 120,
        visible: false,
      },
    ],
    [servidoresPadres]
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredServidores,
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
            to={routes.servidor({ id: row.original.id })}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton
            component={Link}
            to={routes.editServidor({ id: row.original.id })}
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
              PDF (Estilizado)
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(table.getPrePaginationRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, all: null })
              }}
            >
              Excel (Profesional)
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(table.getPrePaginationRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, all: null })
              }}
            >
              CSV (Estándar)
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
            ¿Estás seguro de desactivar el servidor {deleteState.id}? Esta
            acción no eliminará el servidor de la base de datos, solo cambiará
            su estado a inactivo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button
            onClick={() => desactivarServidor(deleteState.id)}
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

export default ServidorsList
