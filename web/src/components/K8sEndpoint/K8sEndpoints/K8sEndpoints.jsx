import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Cloud as CloudIcon,
  Dns as ClusterIcon,
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as CsvIcon,
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
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
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/k8sEndpointsExporter'

// --- GRAPHQL ---
const UPDATE_K8S_ENDPOINT_MUTATION = gql`
  mutation UpdateK8sEndpoint($id: Int!, $input: UpdateK8sEndpointInput!) {
    updateK8sEndpoint(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_K8S_ENDPOINT_MUTATION = gql`
  mutation DeleteK8sEndpoint($id: Int!) {
    deleteK8sEndpoint(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindK8sEndpointsRefetch {
    k8SEndpoints {
      id
      estado
    }
  }
`

const K8sEndpoints = ({ k8SEndpoints, usuarios }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)

  const [updateK8sEndpoint] = useMutation(UPDATE_K8S_ENDPOINT_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const [deleteK8sEndpoint] = useMutation(DELETE_K8S_ENDPOINT_MUTATION, {
    onError: (error) => toast.error(error.message),
    onCompleted: () => toast.success('Endpoints eliminados permanentemente.'),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  // --- HANDLERS DE ELIMINACIÓN ---
  const handleSoftDelete = (rows) => {
    rows.forEach((row) => {
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
      updateK8sEndpoint({
        variables: { id: row.id, input: { estado: newState, usuario_modificacion: 1 } },
      })
    })
    
    toast.success(`${rows.length} registros ${showDeleted ? 'restaurados' : 'desactivados'}.`)
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  const handleHardDelete = (rows) => {
    if(!window.confirm(`ADVERTENCIA: ¿Estás seguro de ELIMINAR DEFINITIVAMENTE ${rows.length} endpoint(s)?\n\nEsta acción no se puede deshacer.`)) {
        closeAllDialogs()
        return
    }

    rows.forEach((row) => {
      deleteK8sEndpoint({ variables: { id: row.id } })
    })
    
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  // --- MAPEOS Y HELPERS ---
  const usuariosMap = useMemo(() => {
    return (usuarios || []).reduce((a, u) => { a[u.id] = `${u.nombres} ${u.primer_apellido}`; return a }, {})
  }, [usuarios])

  const helpers = {
    getUserName: (id) => usuariosMap[id] || `ID: ${id}`,
    formatDate: (d) => {
        if (!d) return '-'
        try {
          return new Date(d).toLocaleString('es-BO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })
        } catch { return '-' }
    }
  }

  // --- DATOS ---
  const filteredData = useMemo(() => {
    if (!k8SEndpoints) return []
    return k8SEndpoints.filter((e) =>
      showDeleted ? e.estado === 'INACTIVO' : e.estado === 'ACTIVO'
    )
  }, [k8SEndpoints, showDeleted])

  // --- COLUMNAS ---
  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { 
        accessorKey: 'nombre', 
        header: 'Nombre del Endpoint', 
        size: 200,
        Cell: ({ row }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudIcon color={row.original.estado === 'INACTIVO' ? 'disabled' : 'primary'} fontSize="small" />
              <Typography variant="body2" fontWeight={500} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
                {row.original.nombre}
              </Typography>
            </Box>
        ),
    },
    { 
        accessorKey: 'url_api', 
        header: 'URL API', 
        size: 250,
        Cell: ({ cell }) => (
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                {cell.getValue()}
            </Typography>
        )
    },
    {
        id: 'clusters_count',
        header: 'Clusters',
        size: 100,
        accessorFn: (row) => row.clusters?.length || 0,
        Cell: ({ cell }) => (
          <Chip
            icon={<ClusterIcon fontSize="small" />}
            label={cell.getValue()}
            size="small"
            variant="outlined"
          />
        )
    },
    { accessorKey: 'fecha_ultima_sync', header: 'Última Sync', size: 160, Cell: ({ cell }) => helpers.formatDate(cell.getValue()) },
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 100,
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
    { accessorKey: 'fecha_creacion', header: 'Creación', size: 150, Cell: ({ cell }) => helpers.formatDate(cell.getValue()) },
    { accessorKey: 'usuario_creacion', header: 'Creó', size: 150, Cell: ({ cell }) => helpers.getUserName(cell.getValue()) },
    { accessorKey: 'fecha_modificacion', header: 'Modif.', size: 150, Cell: ({ cell }) => helpers.formatDate(cell.getValue()) },
    { accessorKey: 'usuario_modificacion', header: 'Modificó', size: 150, Cell: ({ cell }) => helpers.getUserName(cell.getValue()) },
  ], [usuariosMap])

  // --- CONFIGURACIÓN DE MRT ---
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableRowVirtualization: true,
    rowVirtualizerOptions: { overscan: 5 },
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: { 
        id: false, 
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
          Endpoints Kubernetes
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
          <IconButton component={Link} to={routes.k8SEndpoint({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editK8sEndpoint({ id: row.original.id })} size="small">
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
      title="Endpoints K8s"
      titleTo="k8SEndpoints"
      groupTitle="Syncronizaciones"
      buttonLabel="Nuevo Endpoint"
      buttonTo="newK8sEndpoint"
      listActionsConfig={listActionsConfig}
    >
      <MaterialReactTable table={table} />
    </ScaffoldLayout>
  )
}

export default K8sEndpoints