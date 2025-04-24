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
  useTheme,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import * as XLSX from 'xlsx-js-style'

import { alpha } from '@mui/material/styles';

import { Link, routes } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Parametro/ParametrosCell'
import { formatEnum, truncate } from 'src/lib/formatters'

const DELETE_PARAMETRO_MUTATION = gql`
  mutation DeleteParametroMutation($id: Int!) {
    deleteParametro(id: $id) {
      id
    }
  }
`

const UPDATE_PARAMETRO_MUTATION = gql`
  mutation UpdateParametroMutationFromParametroList(
    $id: Int!
    $input: UpdateParametroInput!
  ) {
    updateParametro(id: $id, input: $input) {
      id
      estado
    }
  }
`

const USUARIOS_QUERY = gql`
  query UsuariosQuery {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
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

const ParametrosList = ({ parametros = [] }) => {
  const theme = useTheme()
  const [deleteState, setDeleteState] = useState({ open: false, id: null })
  const [exportMenuAnchor, setExportMenuAnchor] = useState({
    all: null,
    page: null,
    selection: null,
  })
  const [showInactive, setShowInactive] = useState(false)

  // Fetch usuarios data
  const { data: usuariosData } = useQuery(USUARIOS_QUERY)
  const usuarios = usuariosData?.usuarios || []

  const [deleteParametro] = useMutation(DELETE_PARAMETRO_MUTATION, {
    onCompleted: () => {
      toast.success('Parámetro eliminado correctamente')
      setDeleteState({ open: false, id: null })
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const [updateParametro] = useMutation(UPDATE_PARAMETRO_MUTATION, {
    onCompleted: () => {
      toast.success('Estado del parámetro actualizado correctamente')
      setDeleteState({ open: false, id: null })
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  // Function to get full user name
  const getNombreUsuario = (id) => {
    if (!id) return 'N/A'
    const usuario = usuarios.find(u => u.id === id)
    return usuario
      ? `${usuario.nombres} ${usuario.primer_apellido} ${usuario.segundo_apellido || ''}`.trim()
      : 'N/A'
  }

  const desactivarParametro = (id) => {
    updateParametro({
      variables: {
        id: id,
        input: {
          estado: 'INACTIVO',
          fecha_modificacion: new Date().toISOString(),
        },
      },
    })
  }

  const eliminarParametro = (id) => {
    deleteParametro({ variables: { id } })
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
          const cellValue = row.original[column.id]

          if (column.id.includes('fecha_')) return formatDateTime(cellValue)
          if (column.id === 'estado') return formatEnum(cellValue)
          if (column.id === 'usuario_creacion' || column.id === 'usuario_modificacion')
            return getNombreUsuario(cellValue)
          return cellValue ? String(cellValue) : 'N/A'
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
    doc.text('Reporte de Parámetros', 14, 15)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado: ${formatDateTime(new Date())}`, 14, 22)

    autoTable(doc, {
      head: [
        headers.map((h) => ({
          content: h,
          styles: {
            fillColor: theme.palette.primary.main,
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

    doc.save(`parametros-${new Date().toISOString()}.pdf`)
  }

  const exportToExcel = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

    // Convert primary color to RGB
    const primaryColorRgb = theme.palette.primary.main.startsWith('#')
      ? hexToRgb(theme.palette.primary.main)
      : { r: 57, g: 73, b: 171 } // default to #3949AB if not hex

    // Estilos para el encabezado
    const headerStyle = {
      fill: {
        fgColor: {
          rgb: `${primaryColorRgb.r.toString(16).padStart(2, '0')}${primaryColorRgb.g.toString(16).padStart(2, '0')}${primaryColorRgb.b.toString(16).padStart(2, '0')}`
        }
      },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    }

    // Aplicar estilos al encabezado
    for (let i = 0; i < headers.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i })
      ws[cellRef].s = headerStyle
    }

    // Aplicar estilos a las filas
    for (let r = 1; r <= data.length; r++) {
      for (let c = 0; c < headers.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c })
        ws[cellRef].s = {
          fill: { fgColor: { rgb: r % 2 === 0 ? "F8F9FA" : "FFFFFF" } },
          alignment: { wrapText: true },
        }
      }
    }

    // Ajustar ancho de columnas
    ws['!cols'] = headers.map(() => ({ width: 20 }))

    XLSX.utils.book_append_sheet(wb, ws, "Parámetros")
    XLSX.writeFile(wb, `parametros-${new Date().toISOString()}.xlsx`)
  }

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const exportToCSV = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `parametros-${new Date().toISOString()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredParametros = useMemo(() => {
    if (showInactive) {
      return parametros
    }
    return parametros.filter((parametro) => parametro.estado === 'ACTIVO')
  }, [parametros, showInactive])

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      { accessorKey: 'codigo', header: 'Código', size: 100 },
      { accessorKey: 'nombre', header: 'Nombre', size: 200 },
      { accessorKey: 'grupo', header: 'Grupo', size: 120 },
      { accessorKey: 'descripcion', header: 'Descripción', size: 200 },
      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 100,
        Cell: ({ row }) => (
          <Chip
            label={formatEnum(row.original.estado)}
            color={row.original.estado === 'ACTIVO' ? 'success' : 'error'}
            size="small"
            sx={{ borderRadius: 1 }}
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
        header: 'Usuario Creación',
        size: 180,
        Cell: ({ cell }) => getNombreUsuario(cell.getValue()),
      },
      {
        accessorKey: 'fecha_modificacion',
        header: 'Fecha Modificación',
        size: 150,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      {
        accessorKey: 'usuario_modificacion',
        header: 'Usuario Modificación',
        size: 180,
        Cell: ({ cell }) => getNombreUsuario(cell.getValue()),
      },
    ],
    [usuarios]
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredParametros,
    enableRowActions: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row) => row.id.toString(),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: {
        cursor: 'pointer',
        backgroundColor: row.getIsSelected()
          ? alpha(theme.palette.primary.main, 0.1)
          : undefined,
      },
    }),

    initialState: {
      showGlobalFilter: true,
      columnVisibility: {
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
            to={routes.parametro({ id: row.original.id })}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton
            component={Link}
            to={routes.editParametro({ id: row.original.id })}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {row.original.estado === 'ACTIVO' ? (
          <Tooltip title="Desactivar">
            <IconButton
              onClick={() =>
                setDeleteState({ open: true, id: row.original.id, action: 'desactivar' })
              }
              sx={{
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Eliminar permanentemente">
            <IconButton
              onClick={() =>
                setDeleteState({ open: true, id: row.original.id, action: 'eliminar' })
              }
              sx={{
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <DeleteIcon fontSize="small" />
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
                color="primary"
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
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              },
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
            PaperProps={{
              elevation: 1,
              sx: {
                borderRadius: 2,
                minWidth: 180,
              },
            }}
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
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              },
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
            PaperProps={{
              elevation: 1,
              sx: {
                borderRadius: 2,
                minWidth: 180,
              },
            }}
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
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              },
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
            PaperProps={{
              elevation: 1,
              sx: {
                borderRadius: 2,
                minWidth: 180,
              },
            }}
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
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      },
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: 'calc(100vh - 300px)',
      },
    },
  })

  return (
    <Box sx={{ p: 1 }}>
      <MaterialReactTable table={table} />

      <Dialog
        open={deleteState.open}
        onClose={() => setDeleteState({ open: false, id: null, action: null })}
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          {deleteState.action === 'desactivar' ? 'Confirmar Desactivación' : 'Confirmar Eliminación'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {deleteState.action === 'desactivar'
              ? `¿Estás seguro de desactivar el parámetro ${deleteState.id}? Esta acción no eliminará el parámetro de la base de datos, solo cambiará su estado a inactivo.`
              : `¿Estás seguro de eliminar permanentemente el parámetro ${deleteState.id}? Esta acción no se puede deshacer.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteState({ open: false, id: null, action: null })}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (deleteState.action === 'desactivar') {
                desactivarParametro(deleteState.id)
              } else {
                eliminarParametro(deleteState.id)
              }
            }}
            color="primary"
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme.palette.error.dark,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            {deleteState.action === 'desactivar' ? 'Desactivar' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ParametrosList
