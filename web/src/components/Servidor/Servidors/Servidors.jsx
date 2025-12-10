import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Computer as ServerIcon,
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as CsvIcon,
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Dns as ParentIcon,
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
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/servidoresExporter'

// --- GRAPHQL ---
const UPDATE_SERVIDOR_MUTATION = gql`
  mutation UpdateServidor($id: Int!, $input: UpdateServidorInput!) {
    updateServidor(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_SERVIDOR_MUTATION = gql`
  mutation DeleteServidor($id: Int!) {
    deleteServidor(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindServidoresRefetch {
    servidores {
      id
      estado
    }
  }
`

// --- HELPERS ---
const getStatusColor = (codigo) => {
  if (!codigo) return 'default'
  const c = codigo.toUpperCase()
  if (['OPERATIVO', 'ACTIVO', 'ONLINE', 'RUNNING'].includes(c)) return 'success'
  if (['FUERA_SERVICIO', 'BAJA', 'ERROR', 'STOPPED', 'OFFLINE'].includes(c)) return 'error'
  if (['MANTENIMIENTO', 'WARNING', 'RESTARTING'].includes(c)) return 'warning'
  return 'default'
}

const formatDate = (d) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '-' }
}

const Servidores = ({ servidores, parametros, usuarios }) => {
  const theme = useTheme()
  
  const [rowSelection, setRowSelection] = useState({})
  
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)

  const [updateServidor] = useMutation(UPDATE_SERVIDOR_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const [deleteServidor] = useMutation(DELETE_SERVIDOR_MUTATION, {
    onError: (error) => toast.error(error.message),
    onCompleted: () => toast.success('Registros eliminados permanentemente.'),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  // --- MAPEOS ---
  const estadosOperativosMap = useMemo(() => {
    return (parametros || [])
      .filter((p) => p.grupo === 'ESTADO_OPERATIVO')
      .reduce((acc, p) => {
        acc[p.codigo] = p.nombre
        return acc
      }, {})
  }, [parametros])

  const usuariosMap = useMemo(() => {
    return (usuarios || []).reduce((acc, u) => {
      acc[u.id] = `${u.nombres} ${u.primer_apellido}`
      return acc
    }, {})
  }, [usuarios])

  const helpers = {
    getUsuarioNombre: (id) => usuariosMap[id] || `ID ${id}`,
    getNombreEstadoOperativo: (c) => estadosOperativosMap[c] || c || 'Desconocido',
  }

  // --- HANDLERS ---
  const handleSoftDelete = (rows) => {
    rows.forEach((servidor) => {
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
      updateServidor({
        variables: { id: servidor.id, input: { estado: newState } },
      })
    })

    toast.success(`${rows.length} registros ${showDeleted ? 'restaurados' : 'desactivados'}.`)
    setRowSelection({})
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  const handleHardDelete = (rows) => {
    if(!window.confirm(`ADVERTENCIA: ¿Estás seguro de ELIMINAR DEFINITIVAMENTE ${rows.length} registro(s)?\n\nEsta acción no se puede deshacer.`)) {
      closeAllDialogs()
      return
    }

    rows.forEach((servidor) => {
      deleteServidor({ variables: { id: servidor.id } })
    })
    
    setRowSelection({})
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  // --- DATOS ---
  const filteredData = useMemo(() => {
    if (!servidores) return []
    return servidores.filter((s) =>
      showDeleted ? s.estado === 'INACTIVO' : s.estado === 'ACTIVO'
    )
  }, [servidores, showDeleted])

  // --- COLUMNAS (Corrección de anchos) ---
  const columns = useMemo(() => [
    { 
      accessorKey: 'id', 
      header: 'ID',
      // Se eliminó size para auto-ancho
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      // Se eliminó size: 200
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ServerIcon color={row.original.estado === 'INACTIVO' ? 'disabled' : 'primary'} fontSize="small" />
          <Typography variant="body2" fontWeight={500} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
            {row.original.nombre}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'ip_primaria',
      header: 'IP',
      // Se eliminó size: 130
      Cell: ({ cell }) => cell.getValue() || '-', 
    },
    // --- MANTENEMOS FIJOS RAM Y DISCO ---
    {
      accessorKey: 'ram',
      header: 'RAM',
      size: 110, // FIJO
      Cell: ({ cell }) => {
        const val = cell.getValue()
        return val ? `${val} GB` : '-'
      },
    },
    {
      accessorKey: 'almacenamiento',
      header: 'Disco',
      size: 110, // FIJO
      Cell: ({ cell }) => {
        const val = cell.getValue()
        return val ? `${val} GB` : '-'
      },
    },
    // ------------------------------------
    {
      id: 'servidores_padre',
      header: 'Serv. Padre',
      accessorFn: (row) => row.servidores_padre?.nombre,
      // Se eliminó size: 150
      Cell: ({ cell }) => {
        const val = cell.getValue()
        if (!val) return '-'
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <ParentIcon fontSize="inherit" />
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              {val}
            </Typography>
          </Box>
        )
      }
    },
    {
      accessorKey: 'data_centers',
      header: 'Data Center',
      // Se eliminó size: 150
      Cell: ({ row }) => {
        const dc = row.original.data_centers 
        if (!dc) return '-'
        return (
             <Typography variant="body2" fontWeight={600} color="info.main">
                {dc.nombre}
             </Typography>
        )
      },
    },
    {
        accessorKey: 'nodos',
        header: 'Nodo',
        // Se eliminó size: 180
        Cell: ({ row }) => {
          const nodos = row.original.cluster_nodos
          if (!nodos?.length) return '-'
          return (
            <Stack spacing={0.3}>
              {nodos.map((n) => (
                <Link
                  key={n.id}
                  to={routes.clusterNodo({ id: n.id })}
                  style={{ textDecoration: 'none', fontWeight: 600, color: theme.palette.info.main }}
                >
                  {n.nombre}
                </Link>
              ))}
            </Stack>
          )
        },
    },
    {
        accessorKey: 'clusters',
        header: 'Cluster',
        // Se eliminó size: 180
        Cell: ({ row }) => {
          const nodos = row.original.cluster_nodos
          if (!nodos?.length) return '-'
          return (
            <Stack spacing={0.3}>
              {nodos.map((n) => (
                <Link
                  key={n.cluster?.id}
                  to={routes.cluster({ id: n.cluster?.id })}
                  style={{ textDecoration: 'none', fontWeight: 600, color: theme.palette.info.main }}
                >
                  {n.cluster?.nombre}
                </Link>
              ))}
            </Stack>
          )
        },
    },
    {
        accessorKey: 'estadoOperativoInfo',
        header: 'Estado Operativo',
        // Se eliminó size: 150
        Cell: ({ row }) => {
          const info = row.original.estadoOperativoInfo
          const label = info?.nombre || '-'
          const color = getStatusColor(info?.codigo)
          return (
            <Chip
              size="small"
              label={label}
              color={color}
              variant={info?.codigo ? 'filled' : 'outlined'}
              sx={{ fontWeight: 'bold' }}
            />
          )
        },
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      // Se eliminó size: 100
      Cell: ({ cell }) => (
        <Chip 
            label={cell.getValue()} 
            color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'} 
            size="small" 
            variant="outlined" 
            sx={{ fontSize: '0.7rem' }}
        />
      ),
    },
    {
        accessorKey: 'fecha_creacion',
        header: 'Creación',
        // Se eliminó size: 150
        Cell: ({ cell }) => formatDate(cell.getValue()),
    },
    {
        accessorKey: 'usuario_creacion',
        header: 'Creado por',
        // Se eliminó size: 150
        Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()),
    },
    {
        accessorKey: 'fecha_modificacion',
        header: 'Modificación',
        // Se eliminó size: 150
        Cell: ({ cell }) => formatDate(cell.getValue()),
    },
    {
        accessorKey: 'usuario_modificacion',
        header: 'Modif. por',
        // Se eliminó size: 150
        Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()),
    },
  ], [theme, usuariosMap, estadosOperativosMap])

  // --- CONFIGURACIÓN DE MRT ---
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableRowVirtualization: true,
    rowVirtualizerOptions: { overscan: 5 },
    
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,

    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: { 
        id: false,
        estado: false,
        fecha_creacion: false, 
        usuario_creacion: false, 
        fecha_modificacion: false, 
        usuario_modificacion: false 
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
       sx: {
         border: `1px solid ${theme.palette.divider}`,
         borderRadius: 2, 
         overflow: 'auto', 
       }
    },
    muiTopToolbarProps: {
      sx: {
        pl: 1, 
        pr: 1,
        backgroundColor: 'background.paper',
        mb: 1, 
      }
    },
    muiBottomToolbarProps: {
        sx: {
            backgroundColor: 'background.paper',
            border: 'none', 
            boxShadow: 'none',
        }
    },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Servidores
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
    renderRowActions: ({ row }) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Ver Detalles">
          <IconButton component={Link} to={routes.servidor({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editServidor({ id: row.original.id })} size="small">
            <EditIcon fontSize="small" color="info" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  })

  // --- LOGICA DE EXPORTACIÓN ---
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

  // --- CONFIG PARA SCAFFOLD ---
  const listActionsConfig = useMemo(() => {
    const selectedRowCount = Object.keys(rowSelection).length
    
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
          <ListItemIcon>{showDeleted ? <RestoreIcon fontSize="small" color="success" /> : <SoftDeleteIcon fontSize="small" color="warning" />}</ListItemIcon>
          {showDeleted ? 'Restaurar (Activar)' : 'Desactivar (Soft Delete)'}
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
        if (selectedRowCount === 0) {
            toast.error('Debe seleccionar al menos un registro.')
            return;
        }

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
    rowSelection, 
  ])

  return (
    <ScaffoldLayout
      title="Servidores"
      titleTo="servidores"
      groupTitle="Infraestructura"
      buttonLabel="Nuevo Servidor"
      buttonTo="newServidor"
      listActionsConfig={listActionsConfig}
    >
      <MaterialReactTable table={table} />
    </ScaffoldLayout>
  )
}

export default Servidores