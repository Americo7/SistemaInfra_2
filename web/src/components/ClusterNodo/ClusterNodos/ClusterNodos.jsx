import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Dns as NodeIcon,
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as CsvIcon,
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
  Computer as MachineIcon,
  Storage as ServerIcon,
  RestoreFromTrash as RestoreIcon, // Importado para Soft Delete/Restore
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
  // --- IMPORTACIONES ADICIONALES PARA DIÁLOGO MUI ---
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/clusterNodosExporter'

// --- GRAPHQL ---
const UPDATE_CLUSTER_NODO_MUTATION = gql`
  mutation UpdateClusterNodo($id: Int!, $input: UpdateClusterNodoInput!) {
    updateClusterNodo(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_CLUSTER_NODO_MUTATION = gql`
  mutation DeleteClusterNodo($id: Int!) {
    deleteClusterNodo(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindClusterNodosRefetch {
    clusterNodos {
      id
      estado
    }
  }
`

// --- HELPERS ---
const formatDate = (d) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '-' }
}

const helpers = {
    // CORRECCIÓN: Retornamos el valor directo ya que no hay mapa
    getNombreTipoNodo: (c) => c || '-', 
    
    getUsuarioNombre: (userObj) => {
        if (!userObj) return '-'
        return `${userObj.nombres} ${userObj.primer_apellido} ${userObj.segundo_apellido || ''}`.trim()
    },
    getRecurso: (nodo) => {
      if (nodo.nodoTipo === 'VIRTUAL' && nodo.maquina) return nodo.maquina.nombre
      if (nodo.nodoTipo === 'FISICO' && nodo.servidor) return nodo.servidor.nombre
      return '-'
    },
}

const ClusterNodos = ({ clusterNodos }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)

  // --- NUEVOS ESTADOS PARA EL DIÁLOGO ---
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState([]) // Almacena las filas seleccionadas

  const [updateClusterNodo] = useMutation(UPDATE_CLUSTER_NODO_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  // 1. ELIMINADO el onCompleted: () => toast.success('...')
  const [deleteClusterNodo] = useMutation(DELETE_CLUSTER_NODO_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  // --- HANDLERS DE ELIMINACIÓN ---
  const handleSoftDelete = (rows) => {
    rows.forEach((nodo) => {
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
      // TODO: Ajustar usuario_modificacion según el auth actual si es necesario
      updateClusterNodo({
        variables: { id: nodo.id, input: { estado: newState, usuario_modificacion: 1 } },
      })
    })
    
    toast.success(`${rows.length} registros ${showDeleted ? 'restaurados' : 'desactivados'}.`)
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  // MODIFICACIÓN: Abre el diálogo y prepara los datos
  const handleHardDelete = (rows) => {
    // Guardamos los objetos de datos reales (.original) de las filas seleccionadas
    const dataObjects = rows.map((r) => r.original)
    setRowsToDelete(dataObjects)
    setOpenDeleteDialog(true)
  }

  // NUEVA FUNCIÓN: Ejecuta la eliminación tras confirmar en el diálogo MUI
  const confirmHardDelete = () => {
    setOpenDeleteDialog(false)
    
    if (rowsToDelete.length === 0) return

    rowsToDelete.forEach((nodo) => {
      deleteClusterNodo({ variables: { id: nodo.id } })
    })
    
    // Muestra el toast de éxito UNA SOLA VEZ
    toast.success(`${rowsToDelete.length} registro(s) eliminados permanentemente.`) 

    table.toggleAllRowsSelected(false)
    closeAllDialogs()
    setRowsToDelete([]) 
  }

  // --- DATOS ---
  const filteredData = useMemo(() => {
    if (!clusterNodos) return []
    return clusterNodos.filter((n) =>
      showDeleted ? n.estado === 'INACTIVO' : n.estado === 'ACTIVO'
    )
  }, [clusterNodos, showDeleted])

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    {
      accessorKey: 'nombre',
      header: 'Nombre Nodo',
      size: 150,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NodeIcon color={row.original.estado === 'INACTIVO' ? 'disabled' : 'primary'} fontSize="small" />
          <Typography variant="body2" fontWeight={500} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
            {row.original.nombre}
          </Typography>
        </Box>
      ),
    },
    { 
      accessorKey: 'cluster.nombre', 
      header: 'Cluster', 
      size: 120, 
      Cell: ({ row }) => row.original.cluster?.nombre || '-' 
    },
    { 
      accessorKey: 'nodoTipo', 
      header: 'Tipo Nodo', 
      size: 120, 
      Cell: ({ cell }) => helpers.getNombreTipoNodo(cell.getValue()) 
    },
    { 
      id: 'rol', 
      // Aquí seguimos aprovechando rolInfo que sí viene de la Query
      accessorFn: (row) => row.rolInfo?.nombre || row.rol || '-',
      header: 'Rol', 
      size: 100 
    },
    {
      id: 'recurso',
      header: 'Recurso Asignado',
      size: 150,
      Cell: ({ row }) => {
        const recurso = helpers.getRecurso(row.original)
        const tipo = row.original.nodoTipo
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            {tipo === 'VIRTUAL' ? (
              <MachineIcon fontSize="small" color="info" />
            ) : (
              <ServerIcon fontSize="small" color="warning" />
            )}
            <span>{recurso}</span>
          </Stack>
        )
      },
    },
    { accessorKey: 'identity_key', header: 'Identity Key', size: 200 },
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
    { accessorKey: 'fecha_creacion', header: 'F. creación', size: 150, Cell: ({ cell }) => formatDate(cell.getValue()) },
    { 
        accessorFn: (row) => row.creadoPor, 
        id: 'creadoPor',
        header: 'Creado por', 
        size: 150, 
        Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()) 
    },
    { accessorKey: 'fecha_modificacion', header: 'F. modificación', size: 150, Cell: ({ cell }) => formatDate(cell.getValue()) },
    { 
        accessorFn: (row) => row.modificadoPor,
        id: 'modificadoPor',
        header: 'Modif. por', 
        size: 150, 
        Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()) 
    },
  ], []) 

  /* ----------------------- TABLE CONFIG ----------------------- */

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
        estado: false,
        identity_key: false,
        fecha_creacion: false, 
        creadoPor: false, 
        fecha_modificacion: false, 
        modificadoPor: false 
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
          Nodos de Cluster
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
          <IconButton component={Link} to={routes.clusterNodo({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editClusterNodo({ id: row.original.id })} size="small">
            <EditIcon fontSize="small" color="info" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  })

  /* -------------------- EXPORT HANDLERS -------------------- */

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
    
    // Aseguramos que los helpers coincidan con la data que se pasa
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
          <ListItemIcon>{showDeleted ? <RestoreIcon fontSize="small" color="success" /> : <SoftDeleteIcon fontSize="small" color="warning" />}</ListItemIcon>
          {showDeleted ? 'Restaurar' : 'Desactivar'}
        </MenuItem>
        <MenuItem onClick={() => handleHardDelete(table.getSelectedRowModel().rows)}>
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

  // Lógica segura para obtener el nombre(s) en el diálogo
  const namesToDelete = rowsToDelete.length === 1 
    ? rowsToDelete[0]?.nombre || 'este registro' 
    : `${rowsToDelete.length} registros`

  return (
    <ScaffoldLayout
      title="Nodos de Cluster"
      titleTo="clusterNodos"
      groupTitle="Infraestructura"
      buttonLabel="Nuevo Nodo"
      buttonTo="newClusterNodo"
      listActionsConfig={listActionsConfig}
    >
      <MaterialReactTable table={table} />

      {/* --- DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
          ADVERTENCIA: ¡Eliminación Definitiva!
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Estás a punto de eliminar **{namesToDelete}** de forma permanente.
            <br />
            **Esta acción es irreversible** y eliminará los datos de la base de datos.
            <br />
            ¿Deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => { 
                setOpenDeleteDialog(false); 
                setRowsToDelete([]); 
            }} 
            color="primary"
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmHardDelete} 
            color="error" 
            variant="contained" 
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </ScaffoldLayout>
  )
}

export default ClusterNodos