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
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Sistema/SistemasCell'
import { formatEnum, truncate } from 'src/lib/formatters'

const UPDATE_SISTEMA_MUTATION = gql`
  mutation UpdateSistemaMutation_fromSistema(
    $id: Int!
    $input: UpdateSistemaInput!
  ) {
    updateSistema(id: $id, input: $input) {
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

const SISTEMAS_QUERY = gql`
  query SistemasQuery_fromSistemasList {
    sistemas {
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

const SistemasList = ({ sistemas = [] }) => {
  const [deleteState, setDeleteState] = useState({ open: false, id: null })
  const [exportMenuAnchor, setExportMenuAnchor] = useState({
    all: null,
    page: null,
    selection: null,
  })
  const [showInactive, setShowInactive] = useState(false)

  // Fetch usuarios and sistemas data
  const { data: usuariosData } = useQuery(USUARIOS_QUERY)
  const { data: sistemasData } = useQuery(SISTEMAS_QUERY)
  const usuarios = usuariosData?.usuarios || []
  const allSistemas = sistemasData?.sistemas || []

  const [updateSistema] = useMutation(UPDATE_SISTEMA_MUTATION, {
    onCompleted: () => {
      toast.success('Sistema desactivado correctamente')
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

  // Function to get parent system name
  const getNombreSistemaPadre = (id) => {
    if (!id) return 'N/A'
    const sistema = allSistemas.find(s => s.id === id)
    return sistema ? sistema.nombre : 'N/A'
  }

  const desactivarSistema = (id) => {
    updateSistema({
      variables: {
        id: id,
        input: {
          estado: 'INACTIVO',
          fecha_modificacion: new Date().toISOString(),
        },
      },
    })
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
          if (column.id === 'id_padre') return getNombreSistemaPadre(cellValue)
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
    doc.text('Reporte de Sistemas', 14, 15)

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

    doc.save(`sistemas-${new Date().toISOString()}.pdf`)
  }

  const exportToExcel = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

    // Estilos para el encabezado
    const headerStyle = {
      fill: { fgColor: { rgb: "0F284D" } },
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

    XLSX.utils.book_append_sheet(wb, ws, "Sistemas")
    XLSX.writeFile(wb, `sistemas-${new Date().toISOString()}.xlsx`)
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
    link.setAttribute('download', `sistemas-${new Date().toISOString()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredSistemas = useMemo(() => {
    if (showInactive) {
      return sistemas
    }
    return sistemas.filter((sistema) => sistema.estado === 'ACTIVO')
  }, [sistemas, showInactive])

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      {
        accessorKey: 'id_padre',
        header: 'Sistema Padre',
        size: 150,
        Cell: ({ cell }) => getNombreSistemaPadre(cell.getValue()),
      },
      {
        accessorKey: 'id_entidad',
        header: 'ID Entidad',
        size: 100
      },
      {
        accessorKey: 'codigo',
        header: 'Código',
        size: 100
      },
      {
        accessorKey: 'sigla',
        header: 'Sigla',
        size: 100
      },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        size: 150
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        size: 200
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
        accessorKey: 'ra_creacion',
        header: 'RA Creación',
        size: 150,
        Cell: ({ cell }) => cell.getValue() || 'N/A',
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
        size: 180,
        Cell: ({ cell }) => getNombreUsuario(cell.getValue()),
      },
      {
        accessorKey: 'fecha_modificacion',
        header: 'Última Modificación',
        size: 150,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      {
        accessorKey: 'usuario_modificacion',
        header: 'Modificado por',
        size: 180,
        Cell: ({ cell }) => getNombreUsuario(cell.getValue()),
      },
    ],
    [usuarios, allSistemas]
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredSistemas,
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
            to={routes.sistema({ id: row.original.id })}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton
            component={Link}
            to={routes.editSistema({ id: row.original.id })}
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
            ¿Estás seguro de desactivar el sistema {deleteState.id}? Esta acción
            no eliminará el sistema de la base de datos, solo cambiará su estado
            a inactivo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button
            onClick={() => desactivarSistema(deleteState.id)}
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

export default SistemasList
