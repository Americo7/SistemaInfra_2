import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Apartment as DataCenterIcon,
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as CsvIcon,
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
  RestoreFromTrash as RestoreIcon,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/dataCentersExporter'

// --- GRAPHQL ---
const UPDATE_DATA_CENTER_MUTATION = gql`
  mutation UpdateDataCenter($id: Int!, $input: UpdateDataCenterInput!) {
    updateDataCenter(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_DATA_CENTER_MUTATION = gql`
  mutation DeleteDataCenter($id: Int!) {
    deleteDataCenter(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindDataCentersRefetch {
    dataCenters {
      id
      estado
    }
  }
`

// --- HELPERS SEGUROS ---
const formatDate = (d) => {
  if (!d) return '-' // Retorna guion si es null, undefined o vacio
  try {
    const date = new Date(d)
    if (isNaN(date.getTime())) return '-' // Retorna guion si la fecha es invalida
    return date.toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '-' }
}

const DataCenters = ({ dataCenters, parametros, usuarios }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState([]) 

  const [updateDataCenter] = useMutation(UPDATE_DATA_CENTER_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const [deleteDataCenter] = useMutation(DELETE_DATA_CENTER_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  // --- MAPEOS ---
  const usuariosMap = useMemo(() => {
    return (usuarios || []).reduce((a, u) => { 
        a[u.id] = `${u.nombres} ${u.primer_apellido || ''} ${u.segundo_apellido || ''}`.trim(); 
        return a 
    }, {})
  }, [usuarios])

  const helpers = {
    getUsuarioNombre: (id) => {
        if (!id) return '-'; // Si ID es null/undefined, devuelve guion
        return usuariosMap[id] || `ID: ${id}`; // Si tiene ID pero no está en mapa, muestra el ID
    },
  }

  // --- HANDLERS ---
  const handleSoftDelete = (rows) => {
    rows.forEach((dc) => {
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
      updateDataCenter({
        variables: { id: dc.id, input: { estado: newState, usuario_modificacion: 1 } },
      })
    })
    toast.success(`${rows.length} registros ${showDeleted ? 'restaurados' : 'desactivados'}.`)
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  const handleHardDelete = (rows) => {
    const dataObjects = rows.map((r) => r.original)
    setRowsToDelete(dataObjects)
    setOpenDeleteDialog(true)
  }
  
  const confirmHardDelete = () => {
    setOpenDeleteDialog(false)
    if (rowsToDelete.length === 0) return
    rowsToDelete.forEach((dc) => {
      deleteDataCenter({ variables: { id: dc.id } })
    })
    toast.success(`${rowsToDelete.length} registro(s) eliminado(s) permanentemente.`) 
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
    setRowsToDelete([]) 
  }

  const filteredData = useMemo(() => {
    if (!dataCenters) return []
    return dataCenters.filter((dc) =>
      showDeleted ? dc.estado === 'INACTIVO' : dc.estado === 'ACTIVO'
    )
  }, [dataCenters, showDeleted])

  // --- COLUMNAS ---
  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    {
      accessorKey: 'nombre',
      header: 'Nombre Data Center',
      size: 200,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DataCenterIcon color={row.original.estado === 'INACTIVO' ? 'disabled' : 'primary'} fontSize="small" />
          <Typography variant="body2" fontWeight={500} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
            {row.original.nombre || '-'}
          </Typography>
        </Box>
      ),
    },
    { 
        accessorKey: 'ubicacion', 
        header: 'Ubicación', 
        size: 200,
        Cell: ({ cell }) => cell.getValue() || '-' // Manejo de nulos directo
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 100,
      Cell: ({ cell }) => (
        <Chip 
            label={cell.getValue() || 'UNKNOWN'} 
            color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'} 
            size="small" 
            variant="outlined" 
            sx={{ fontSize: '0.7rem' }}
        />
      ),
    },
    { 
        accessorKey: 'fecha_creacion', 
        header: 'F. Creación', 
        size: 150, 
        Cell: ({ cell }) => formatDate(cell.getValue()) 
    },
    { 
        accessorKey: 'usuario_creacion', 
        header: 'Creado por', 
        size: 150, 
        Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()) 
    },
    { 
        accessorKey: 'fecha_modificacion', 
        header: 'F. Modificación', 
        size: 150, 
        Cell: ({ cell }) => formatDate(cell.getValue()) 
    },
    { 
        accessorKey: 'usuario_modificacion', 
        header: 'Modif. por', 
        size: 150, 
        Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()) 
    },
  ], [theme, usuariosMap]) 

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
        estado: true,
        fecha_creacion: true, 
        usuario_creacion: true, 
        fecha_modificacion: true, 
        usuario_modificacion: true 
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
      sx: { pl: 1, pr: 1, backgroundColor: 'background.paper', mb: 1 }
    },
    muiBottomToolbarProps: {
        sx: { backgroundColor: 'background.paper', border: 'none', boxShadow: 'none' }
    },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Data Centers</Typography>
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
    muiTableBodyCellProps: { sx: { borderBottom: `1px solid ${theme.palette.divider}` } },
    muiTableBodyRowProps: ({ row }) => ({
      sx: { '&:hover': { backgroundColor: theme.palette.action.hover } }
    }),
    renderRowActions: ({ row }) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Ver Detalles">
          <IconButton component={Link} to={routes.dataCenter({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editDataCenter({ id: row.original.id })} size="small">
            <EditIcon fontSize="small" color="info" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  })

  // --- EXPORTAR ---
  const handleExport = (scope, suffix, format) => {
    let rowsToExport = []
    if (scope === 'page') {
      const allRows = table.getPrePaginationRowModel().rows
      const { pageIndex, pageSize } = table.getState().pagination
      const startRow = pageIndex * pageSize
      const endRow = startRow + pageSize
      rowsToExport = allRows.slice(startRow, endRow)
    } else if (scope === 'all') {
       rowsToExport = table.getPrePaginationRowModel().rows
    } else if (scope === 'selected') {
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

  const listActionsConfig = useMemo(() => {
    const selectedRowCount = table.getSelectedRowModel().rows.length
    
    const ExportMenu = (
      <Menu anchorEl={exportMenuAnchorEl} open={Boolean(exportMenuAnchorEl)} onClose={closeAllDialogs}>
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" color="text.secondary" fontWeight={700}>EXCEL</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'excel')}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'excel')} disabled={selectedRowCount === 0}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
        <Divider />
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" color="text.secondary" fontWeight={700}>PDF</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'pdf')}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'pdf')} disabled={selectedRowCount === 0}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
        <Divider />
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" color="text.secondary" fontWeight={700}>CSV</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'csv')}><ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'csv')} disabled={selectedRowCount === 0}><ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
      </Menu>
    )

    const BulkActionMenu = (
      <Menu anchorEl={bulkMenuAnchorEl} open={Boolean(bulkMenuAnchorEl)} onClose={closeAllDialogs}>
        <MenuItem onClick={() => handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original))}>
          <ListItemIcon>{showDeleted ? <RestoreIcon fontSize="small" color="success" /> : <SoftDeleteIcon fontSize="small" color="warning" />}</ListItemIcon>
          {showDeleted ? 'Restaurar (Activar)' : 'Desactivar (Soft Delete)'}
        </MenuItem>
        <MenuItem onClick={() => handleHardDelete(table.getSelectedRowModel().rows)}>
          <ListItemIcon><HardDeleteIcon fontSize="small" color="error" /></ListItemIcon> Eliminar de Base de Datos
        </MenuItem>
      </Menu>
    )

    return {
      showDeleted,
      selectedRowCount,
      handleSwitchChange: (e) => setShowDeleted(e.target.checked),
      handleBulkAction: (e) => {
        if (selectedRowCount === 0) { toast.error('Debe seleccionar al menos un registro.'); return; }
        if (showDeleted) { handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original)) } 
        else { setBulkMenuAnchorEl(e.currentTarget) }
      },
      handleExportClick: (e) => setExportMenuAnchorEl(e.currentTarget),
      exportMenu: ExportMenu,
      bulkActionMenu: BulkActionMenu,
    }
  }, [table, showDeleted, exportMenuAnchorEl, bulkMenuAnchorEl, table.getState().rowSelection])

  const namesToDelete = rowsToDelete.length === 1 ? rowsToDelete[0]?.nombre || 'este registro' : `${rowsToDelete.length} registros`

  return (
    <ScaffoldLayout
      title="Data Centers"
      titleTo="dataCenters"
      groupTitle="Infraestructura"
      buttonLabel="Nuevo Data Center"
      buttonTo="newDataCenter"
      listActionsConfig={listActionsConfig}
    >
      <MaterialReactTable table={table} />
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>ADVERTENCIA: ¡Eliminación Definitiva!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de eliminar **{namesToDelete}** de forma permanente.<br />**Esta acción es irreversible**.<br />¿Deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDeleteDialog(false); setRowsToDelete([]); }} color="primary">Cancelar</Button>
          <Button onClick={confirmHardDelete} color="error" variant="contained" autoFocus>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </ScaffoldLayout>
  )
}

export default DataCenters