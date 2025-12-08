import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as CsvIcon,
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
  Code as CodeIcon,
} from '@mui/icons-material'

import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Stack,
  ListItemIcon,
  Typography,
  Divider,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/componentesExporter'


// --- GRAPHQL ---
const UPDATE_COMPONENTE_MUTATION = gql`
  mutation UpdateComponente($id: Int!, $input: UpdateComponenteInput!) {
    updateComponente(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_COMPONENTE_MUTATION = gql`
  mutation DeleteComponente($id: Int!) {
    deleteComponente(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindComponentes1 {
    componentes {
      id
      id_sistema
      nombre
      dominio
      descripcion
      cod_entorno
      cod_categoria
      gitlab_repo
      gitlab_rama
      tecnologia
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
    usuarios {
      id
      nombres
      primer_apellido
    }
  }
`

// --- HELPERS ---
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

const truncate = (text, length = 100) => {
  if (!text) return 'N/A'
  return text.length > length ? text.substring(0, length) + '...' : text
}

const parseTecnologia = (value) => {
  try {
    if (!value) return []
    if (typeof value === 'string') {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : [parsed]
    }
    return Array.isArray(value) ? value : [value]
  } catch {
    return []
  }
}

const getTechColor = (codigo) => {
  if (!codigo) return 'default'
  if (codigo.includes('FRONTEND')) return 'primary'
  if (codigo.includes('BACKEND')) return 'secondary'
  if (codigo.includes('DATABASE')) return 'success'
  if (codigo.includes('CLOUD')) return 'info'
  return 'warning'
}

// --- COMPONENT ---
const Componentes = ({ componentes = [], usuarios = [] }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)

  const [updateComponente] = useMutation(UPDATE_COMPONENTE_MUTATION, {
    onCompleted: () => {
      toast.success('Estado actualizado')
    },
    onError: (err) => toast.error(err?.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
    awaitRefetchQueries: true,
  })

  const [deleteComponente] = useMutation(DELETE_COMPONENTE_MUTATION, {
    onCompleted: () => {
      toast.success('Componente eliminado')
    },
    onError: (err) => toast.error(err?.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
    awaitRefetchQueries: true,
  })

  // --- HANDLERS ---
  const handleSoftDelete = async (rows) => {
    if (!window.confirm(`¿Desactivar ${rows.length} componente(s)?`)) return
    for (const row of rows) {
      await updateComponente({
        variables: {
          id: row.original.id,
          input: { estado: 'INACTIVO' },
        },
      })
    }
  }

  const handleHardDelete = async (rows) => {
    if (!window.confirm(`¿Eliminar permanentemente ${rows.length} componente(s)?`)) return
    for (const row of rows) {
      await deleteComponente({
        variables: { id: row.original.id },
      })
    }
  }

  const handleExport = (scope, suffix, format) => {
    let rowsToExport = []

    if (scope === 'page') {
      const allRows = table.getPrePaginationRowModel().rows
      
      const { pageIndex, pageSize } = table.getState().pagination
      const startRow = pageIndex * pageSize
      const endRow = startRow + pageSize
      
      rowsToExport = allRows.slice(startRow, endRow)
    }

    if (scope === 'all') {
       rowsToExport = table.getPrePaginationRowModel().rows
    }

    if (scope === 'selected') {
      rowsToExport = table.getSelectedRowModel().rows
    }

    if (!rowsToExport || rowsToExport.length === 0) {
        toast.error('No hay datos para exportar')
        return
    }

    const visibleColumns = table.getVisibleLeafColumns().filter((col) => !['mrt-row-actions', 'mrt-row-select', 'mrt-row-expand', 'id'].includes(col.id))
    
    if (format === 'excel') exportToExcel(rowsToExport, visibleColumns, helpers, suffix)
    if (format === 'pdf') exportToPDF(rowsToExport, visibleColumns, helpers, suffix)
    if (format === 'csv') exportToCSV(rowsToExport, visibleColumns, helpers, suffix)
    
    closeAllDialogs()
  }

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  // --- MAPEO DE DATOS ---
  const usuariosMap = new Map(usuarios.map((u) => [u.id, `${u.nombres} ${u.primer_apellido}`]))

  const helpers = {
    getUsuarioNombre: (id) => usuariosMap.get(id) || 'Desconocido',
  }

  const filteredData = useMemo(() => {
    if (!Array.isArray(componentes)) return []
    return showDeleted
      ? componentes.filter((c) => c.estado === 'INACTIVO')
      : componentes.filter((c) => c.estado === 'ACTIVO')
  }, [componentes, showDeleted])

  // --- COLUMNS ---
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 50,
      },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        size: 150,
      },
      {
        accessorKey: 'dominio',
        header: 'Dominio',
        size: 120,
        Cell: ({ cell }) => truncate(cell.getValue(), 50),
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        size: 150,
        Cell: ({ cell }) => truncate(cell.getValue(), 60),
      },
      {
        accessorKey: 'cod_entorno',
        header: 'Entorno',
        size: 100,
      },
      {
        accessorKey: 'cod_categoria',
        header: 'Categoría',
        size: 100,
      },
      {
        accessorKey: 'tecnologia',
        header: 'Tecnología',
        size: 150,
        Cell: ({ cell }) => {
          const tecnologias = parseTecnologia(cell.getValue())
          if (!tecnologias.length) {
            return <Chip label="Sin tecnologías" size="small" variant="outlined" />
          }
          return (
            <Stack direction="row" flexWrap="wrap" spacing={0.5}>
              {tecnologias.slice(0, 2).map((t, i) => (
                <Chip
                  key={i}
                  label={`${t.nombre}${t.version ? ` v${t.version}` : ''}`}
                  size="small"
                  color={getTechColor(t.codigo)}
                />
              ))}
              {tecnologias.length > 2 && (
                <Chip label={`+${tecnologias.length - 2}`} size="small" variant="outlined" />
              )}
            </Stack>
          )
        },
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 100,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() === 'ACTIVO' ? 'Activo' : 'Inactivo'}
            color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'}
            size="small"
          />
        ),
      },
      {
        accessorKey: 'fecha_creacion',
        header: 'Creación',
        size: 140,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      {
        accessorKey: 'usuario_creacion',
        header: 'Creado por',
        size: 120,
        Cell: ({ cell }) => truncate(helpers.getUsuarioNombre(cell.getValue()), 30),
      },
      {
        accessorKey: 'fecha_modificacion',
        header: 'Modificación',
        size: 140,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      {
        accessorKey: 'usuario_modificacion',
        header: 'Modificado por',
        size: 120,
        Cell: ({ cell }) => truncate(helpers.getUsuarioNombre(cell.getValue()), 30),
      },
    ],
    []
  )

  // --- TABLE CONFIG ---
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowVirtualization: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    layoutMode: 'semantic',

    displayColumnDefOptions: {
      'mrt-row-select': {
        size: 40,
        muiTableHeadCellProps: { sx: { width: 40, minWidth: 40, maxWidth: 40 } },
        muiTableBodyCellProps: { sx: { width: 40, minWidth: 40, maxWidth: 40 } },
      },
      'mrt-row-actions': {
        size: 48,
        muiTableHeadCellProps: { sx: { width: 48, minWidth: 48, maxWidth: 48 } },
        muiTableBodyCellProps: { sx: { width: 48, minWidth: 48, maxWidth: 48 } },
      },
    },

    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnSizing: {
        'mrt-row-select': 40,
        'mrt-row-actions': 48,
      },
      columnVisibility: {
        id: false,
        gitlab_repo: false,
        gitlab_rama: false,
        fecha_creacion: false,
        usuario_creacion: false,
        fecha_modificacion: false,
        usuario_modificacion: false,
      },
    },

    muiTablePaperProps: {
      elevation: 0,
      sx: {
        maxWidth: 1500,
        mx: 'auto',
        px: 2,
        py: 1,
        border: `1px solid ${theme.palette.divider}`,
        borderTop: 'none',
        borderRadius: 2,
        borderTopLeftRadius: '0 !important',
        borderTopRightRadius: '0 !important',
        backgroundColor: 'background.paper',
        overflow: 'hidden',
      },
    },

    muiTableContainerProps: {
      sx: { maxHeight: 'calc(100vh - 300px)' },
    },

    enableRowActions: true,
    enableRowSelection: true,
    enableSelectAll: true,

    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Ver">
          <IconButton
            component={Link}
            to={routes.componente({ id: row.original.id })}
            size="small"
            color="primary"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton
            component={Link}
            to={routes.editComponente({ id: row.original.id })}
            size="small"
            color="info"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),

    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Componentes
        </Typography>
      </Box>
    ),
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
        color: 'text.primary',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        borderBottom: `1px solid ${theme.palette.divider}`, 
        borderRight: `1px solid ${theme.palette.divider}`,  
        '&:last-child': { borderRight: 'none' },
      }
    },
    muiTableBodyCellProps: {
        sx: {
            borderBottom: `1px solid ${theme.palette.divider}`,
        }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }
    }),
  })

  // --- CONFIG PARA SCAFFOLD ---
  const listActionsConfig = useMemo(() => {
    const selectedRowCount = table.getSelectedRowModel().rows.length
    
    const ExportMenu = (
      <Menu anchorEl={exportMenuAnchorEl} open={Boolean(exportMenuAnchorEl)} onClose={closeAllDialogs}>
        {/* EXCEL */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>EXCEL</Typography>
        </Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'excel')}>
          <ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Página Actual
        </MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'excel')} disabled={selectedRowCount === 0}>
          <ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Selección ({selectedRowCount})
        </MenuItem>
        
        <Divider />

        {/* PDF */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>PDF</Typography>
        </Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'pdf')}>
          <ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Página Actual
        </MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'pdf')} disabled={selectedRowCount === 0}>
          <ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Selección ({selectedRowCount})
        </MenuItem>

        <Divider />

        {/* CSV */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>CSV</Typography>
        </Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'csv')}>
          <ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Página Actual
        </MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'csv')} disabled={selectedRowCount === 0}>
          <ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Selección ({selectedRowCount})
        </MenuItem>
      </Menu>
    )

    const BulkActionMenu = (
      <Menu
        anchorEl={bulkMenuAnchorEl}
        open={Boolean(bulkMenuAnchorEl)}
        onClose={closeAllDialogs}
      >
        <MenuItem onClick={() => handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original))}>
          <ListItemIcon><SoftDeleteIcon fontSize="small" color="warning" /></ListItemIcon>
          Desactivar (Soft Delete)
        </MenuItem>
        <MenuItem onClick={() => handleHardDelete(table.getSelectedRowModel().rows.map(r => r.original))}>
          <ListItemIcon><HardDeleteIcon fontSize="small" color="error" /></ListItemIcon>
          Eliminar de Base de Datos
        </MenuItem>
      </Menu>
    )

    return {
      showDeleted,
      selectedRowCount,
      handleSwitchChange: (e) => setShowDeleted(e.target.checked),
      
      handleBulkAction: (e) => {
        if (showDeleted) {
            handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original))
        } else {
            setBulkMenuAnchorEl(e.currentTarget)
        }
      },
      
      handleExportClick: (e) => setExportMenuAnchorEl(e.currentTarget),
      exportMenu: ExportMenu,
      bulkActionMenu: BulkActionMenu,
    }
  }, [
    table, 
    showDeleted, 
    exportMenuAnchorEl, 
    bulkMenuAnchorEl, 
    table.getState().rowSelection,
    table.getState().pagination
  ])

  return (
    <ScaffoldLayout
      title="Componentes"
      titleTo="componentes"
      groupTitle="Despliegues"
      buttonLabel="Nuevo"
      buttonTo="newComponente"
      listActionsConfig={listActionsConfig}
    >
      <MaterialReactTable table={table} />
    </ScaffoldLayout>
  )
}

export default Componentes

