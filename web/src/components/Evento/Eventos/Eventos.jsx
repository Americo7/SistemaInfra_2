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
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/eventosExporter'

// --- GRAPHQL ---
const UPDATE_EVENTO_MUTATION = gql`
  mutation UpdateEvento($id: Int!, $input: UpdateEventoInput!) {
    updateEvento(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_EVENTO_MUTATION = gql`
  mutation DeleteEvento($id: Int!) {
    deleteEvento(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindEventosRefetch {
    eventos {
      id
      estado
    }
  }
`

// --- HELPERS GLOBALES ---
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '-' }
}

const formatUser = (userObj) => {
  if (!userObj) return '-'
  const fullName = [userObj.nombres, userObj.primer_apellido, userObj.segundo_apellido]
    .filter(Boolean)
    .join(' ')
  return fullName || '-'
}

const Eventos = ({ eventos }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState([]) 

  const [updateEvento] = useMutation(UPDATE_EVENTO_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const [deleteEvento] = useMutation(DELETE_EVENTO_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const exportHelpers = {
    getUsuarioNombre: (val) => formatUser(val),
    formatDate: (val) => formatDateTime(val),
    getTipoEvento: (val, row) => row.tipoEventoInfo?.nombre || row.cod_tipo_evento,
    getEstadoEvento: (val, row) => row.estadoEventoInfo?.nombre || row.estado_evento,
  }

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  const handleSoftDelete = (rows) => {
    rows.forEach((row) => {
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
      updateEvento({
        variables: { id: row.id, input: { estado: newState } },
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
    rowsToDelete.forEach((row) => {
      deleteEvento({ variables: { id: row.id } })
    })
    toast.success(`${rowsToDelete.length} evento(s) eliminado(s) permanentemente.`) 
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
    setRowsToDelete([]) 
  }

  const filteredData = useMemo(() => {
    if (!eventos) return []
    return eventos.filter((e) =>
      showDeleted ? e.estado === 'INACTIVO' : e.estado === 'ACTIVO'
    )
  }, [eventos, showDeleted])

  // --- COLUMNAS ---
  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'cod_evento', header: 'Código', size: 200 },
    
    // TIPO EVENTO 
    { 
        id: 'tipo_evento', 
        header: 'Tipo', 
        size: 180, 
        accessorFn: (row) => row.tipoEventoInfo?.nombre || row.cod_tipo_evento,
        Cell: ({ row }) => (
           <Chip 
              label={row.original.tipoEventoInfo?.nombre || row.original.cod_tipo_evento}
              size="small"
              variant="outlined"
           />
        )
    },
    
    // FECHA EVENTO (LETRAS PEQUEÑAS)
    { 
        accessorKey: 'fecha_evento', 
        header: 'Fecha Evento', 
        size: 140, 
        Cell: ({ cell }) => (
          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {formatDateTime(cell.getValue())}
          </Typography>
        )
    },
    
    // ESTADO EVENTO
    {
      id: 'estado_evento',
      header: 'Estado Evento',
      size: 130,
      accessorFn: (row) => row.estadoEventoInfo?.nombre || row.estado_evento,
      Cell: ({ row }) => {
        const nombre = row.original.estadoEventoInfo?.nombre || row.original.estado_evento
        const codigo = row.original.estadoEventoInfo?.codigo || nombre
        
        let color = 'info'
        if (['CERRADO', 'SOLUCIONADO', 'FINALIZADO'].includes(codigo)) color = 'success'
        if (['EN_PROCESO', 'PENDIENTE'].includes(codigo)) color = 'warning'
        if (['CANCELADO', 'ANULADO'].includes(codigo)) color = 'error'

        return (
            <Chip 
                label={nombre} 
                color={color} 
                size="small" 
                variant="filled" 
                sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
            />
        )
      }
    },
    { accessorKey: 'cite', header: 'CITE', size: 180 },
    { accessorKey: 'solicitante', header: 'Solicitante', size: 200 },
    
    // AUDITORÍA (LETRAS PEQUEÑAS)
    { 
        id: 'fecha_creacion',
        header: 'F. Creación', 
        size: 140, 
        accessorFn: (row) => row.fecha_creacion,
        Cell: ({ cell }) => (
          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {formatDateTime(cell.getValue())}
          </Typography>
        )
    },
    { 
        id: 'creadoPor',
        header: 'Creado por', 
        size: 160, 
        accessorFn: (row) => formatUser(row.creadoPor)
    },
    { 
        id: 'fecha_modificacion',
        header: 'F. Modif.', 
        size: 140, 
        accessorFn: (row) => row.fecha_modificacion,
        Cell: ({ cell }) => (
          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {formatDateTime(cell.getValue())}
          </Typography>
        )
    },
    { 
        id: 'modificadoPor',
        header: 'Modif. por', 
        size: 160, 
        accessorFn: (row) => formatUser(row.modificadoPor)
    },
    {
      accessorKey: 'estado',
      header: 'Estado Reg.',
      size: 80,
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
  ], [theme])

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
        cite: false,
        solicitante: false,
        fecha_creacion: false, 
        creadoPor: false, 
        fecha_modificacion: true, 
        modificadoPor: true 
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
      sx: { pl: 1, pr: 1, mb: 1, backgroundColor: 'background.paper' }
    },
    muiBottomToolbarProps: {
        sx: { backgroundColor: 'background.paper', border: 'none', boxShadow: 'none' }
    },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Eventos
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
        sx: { borderBottom: `1px solid ${theme.palette.divider}` }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: { '&:hover': { backgroundColor: theme.palette.action.hover } }
    }),
    renderRowActions: ({ row }) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Ver Detalles">
          <IconButton component={Link} to={routes.evento({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editEvento({ id: row.original.id })} size="small">
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
      const { pageIndex, pageSize } = table.getState().pagination
      rowsToExport = table.getPrePaginationRowModel().rows.slice(pageIndex * pageSize, (pageIndex * pageSize) + pageSize)
    } else if (scope === 'all') {
       rowsToExport = table.getPrePaginationRowModel().rows
    } else if (scope === 'selected') {
      rowsToExport = table.getSelectedRowModel().rows
    }

    if (!rowsToExport || rowsToExport.length === 0) {
        toast.error('No hay datos para exportar')
        return
    }

    const visibleColumns = table.getVisibleLeafColumns().filter((col) => !['mrt-row-actions', 'mrt-row-select', 'id'].includes(col.id))
    
    if (format === 'excel') exportToExcel(rowsToExport, visibleColumns, exportHelpers, suffix)
    if (format === 'pdf') exportToPDF(rowsToExport, visibleColumns, exportHelpers, suffix)
    if (format === 'csv') exportToCSV(rowsToExport, visibleColumns, exportHelpers, suffix)
    
    closeAllDialogs()
  }

  // --- CONFIG PARA SCAFFOLD ---
  const listActionsConfig = useMemo(() => {
    const selectedRowCount = table.getSelectedRowModel().rows.length
    
    const ExportMenu = (
      <Menu anchorEl={exportMenuAnchorEl} open={Boolean(exportMenuAnchorEl)} onClose={closeAllDialogs}>
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" fontWeight={700}>EXCEL</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'excel')}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'excel')} disabled={selectedRowCount === 0}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
        <Divider />
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" fontWeight={700}>PDF</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'pdf')}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'pdf')} disabled={selectedRowCount === 0}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
        <Divider />
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" fontWeight={700}>CSV</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'csv')}><ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'csv')} disabled={selectedRowCount === 0}><ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
      </Menu>
    )

    const BulkActionMenu = (
      <Menu anchorEl={bulkMenuAnchorEl} open={Boolean(bulkMenuAnchorEl)} onClose={closeAllDialogs}>
        <MenuItem onClick={() => handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original))}>
          <ListItemIcon>{showDeleted ? <RestoreIcon fontSize="small" color="success" /> : <SoftDeleteIcon fontSize="small" color="warning" />}</ListItemIcon>
          {showDeleted ? 'Restaurar' : 'Desactivar'}
        </MenuItem>
        <MenuItem onClick={() => handleHardDelete(table.getSelectedRowModel().rows)}>
          <ListItemIcon><HardDeleteIcon fontSize="small" color="error" /></ListItemIcon> Eliminar BD
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
  }, [table, showDeleted, exportMenuAnchorEl, bulkMenuAnchorEl, table.getState().rowSelection])

  const namesToDelete = rowsToDelete.length === 1 
    ? rowsToDelete[0]?.cod_evento || `el evento ID ${rowsToDelete[0]?.id}` 
    : `${rowsToDelete.length} registros`

  return (
    <ScaffoldLayout
      title="Eventos"
      titleTo="eventos"
      groupTitle="Eventos"
      buttonLabel="Nuevo Evento"
      buttonTo="newEvento"
      listActionsConfig={listActionsConfig}
    >
      <MaterialReactTable table={table} />

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

export default Eventos