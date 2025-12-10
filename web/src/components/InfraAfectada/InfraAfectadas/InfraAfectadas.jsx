import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Dns as InfraIcon,
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as CsvIcon,
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Storage as ServerIcon,
  Computer as VmIcon,
  Domain as DcIcon,
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
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/infraAfectadasExporter'

// --- GRAPHQL ---
const UPDATE_INFRA_AFECTADA_MUTATION = gql`
  mutation UpdateInfraAfectada($id: Int!, $input: UpdateInfraAfectadaInput!) {
    updateInfraAfectada(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_INFRA_AFECTADA_MUTATION = gql`
  mutation DeleteInfraAfectada($id: Int!) {
    deleteInfraAfectada(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindInfraAfectadasRefetch {
    infraAfectadas {
      id
      estado
    }
  }
`

// --- HELPERS ---
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

const InfraAfectadas = ({ infraAfectadas }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)

  // --- ESTADOS PARA EL DIÁLOGO ---
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState([]) // Almacena las filas seleccionadas (objetos de datos)


  const [updateInfraAfectada] = useMutation(UPDATE_INFRA_AFECTADA_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  // CORRECCIÓN: Eliminado onCompleted para manejar el toast fuera de la mutación
  const [deleteInfraAfectada] = useMutation(DELETE_INFRA_AFECTADA_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  // Helpers para exportación (extraen datos de los objetos anidados)
  const exportHelpers = {
    getUsuarioNombre: (val) => formatUser(val),
    getEvento: (val, row) => row.eventos?.cod_evento || row.id_evento,
    getDataCenter: (val, row) => row.dataCenter?.nombre || '-',
    getServidor: (val, row) => row.servidor?.nombre || '-',
    getMaquina: (val, row) => row.maquina?.nombre || '-',
  }

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  // --- HANDLERS ---
  const handleSoftDelete = (rows) => {
    rows.forEach((row) => {
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
      // Se inyecta usuario_modificacion: 1 por defecto si no hay contexto
      updateInfraAfectada({
        variables: { id: row.id, input: { estado: newState, usuario_modificacion: 1 } },
      })
    })
    
    toast.success(`${rows.length} registros ${showDeleted ? 'restaurados' : 'desactivados'}.`)
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  // MODIFICACIÓN: Abre el diálogo en lugar de window.confirm
  const handleHardDelete = (rows) => {
    const dataObjects = rows.map((r) => r.original)
    setRowsToDelete(dataObjects)
    setOpenDeleteDialog(true)
  }

  // NUEVA FUNCIÓN: Ejecuta la eliminación tras confirmar en el diálogo MUI
  const confirmHardDelete = () => {
    setOpenDeleteDialog(false)
    
    if (rowsToDelete.length === 0) return

    rowsToDelete.forEach((row) => {
      deleteInfraAfectada({ variables: { id: row.id } })
    })
    
    // Muestra el toast de éxito UNA SOLA VEZ
    toast.success(`${rowsToDelete.length} registro(s) de infraestructura afectada eliminado(s) permanentemente.`) 
    
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
    setRowsToDelete([]) 
  }

  // --- FILTRADO ---
  const filteredData = useMemo(() => {
    if (!infraAfectadas) return []
    return infraAfectadas.filter((item) =>
      showDeleted ? item.estado === 'INACTIVO' : item.estado === 'ACTIVO'
    )
  }, [infraAfectadas, showDeleted])

  // --- COLUMNAS ---
  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    
    // EVENTO
    {
      id: 'evento',
      header: 'Evento Relacionado',
      size: 200,
      accessorFn: (row) => row.eventos?.cod_evento || row.id_evento,
      Cell: ({ row }) => {
        const evt = row.original.eventos
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfraIcon color="primary" fontSize="small" />
                <Link to={routes.evento({ id: row.original.id_evento })} style={{ textDecoration: 'none', fontWeight: 600, color: theme.palette.text.primary }}>
                    {evt?.cod_evento || `ID: ${row.original.id_evento}`}
                </Link>
            </Box>
            {evt?.tipoEventoInfo && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                    {evt.tipoEventoInfo.nombre}
                </Typography>
            )}
          </Box>
        )
      }
    },

    // INFRAESTRUCTURA (Columnas separadas pero limpias)
    { 
        id: 'dataCenter',
        header: 'Data Center', 
        size: 150,
        accessorFn: (row) => row.dataCenter?.nombre,
        Cell: ({ cell }) => cell.getValue() ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <DcIcon fontSize="small" /> {cell.getValue()}
            </Box>
        ) : '-'
    },
    { 
        id: 'servidor',
        header: 'Servidor', 
        size: 180,
        accessorFn: (row) => row.servidor?.nombre,
        Cell: ({ cell }) => cell.getValue() ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <ServerIcon fontSize="small" /> {cell.getValue()}
            </Box>
        ) : '-'
    },
    { 
        id: 'maquina',
        header: 'Máquina (VM)', 
        size: 180,
        accessorFn: (row) => row.maquina?.nombre,
        Cell: ({ cell }) => cell.getValue() ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 500 }}>
                <VmIcon fontSize="small" /> {cell.getValue()}
            </Box>
        ) : '-'
    },

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

    // AUDITORÍA
    { 
        id: 'fecha_creacion',
        header: 'F. Creación', 
        size: 150, 
        accessorFn: (row) => row.fecha_creacion,
        Cell: ({ cell }) => formatDateTime(cell.getValue()) 
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
        size: 150, 
        accessorFn: (row) => row.fecha_modificacion,
        Cell: ({ cell }) => formatDateTime(cell.getValue()) 
    },
    { 
        id: 'modificadoPor',
        header: 'Modif. por', 
        size: 160, 
        accessorFn: (row) => formatUser(row.modificadoPor)
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
        // Auditoría visible
        fecha_creacion: true, 
        creadoPor: true, 
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
          Infraestructura Afectada
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
          <IconButton component={Link} to={routes.infraAfectada({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editInfraAfectada({ id: row.original.id })} size="small">
            <EditIcon fontSize="small" color="info" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  })

  // --- EXPORTACIÓN ---
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

  // --- SCAFFOLD CONFIG ---
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
        <MenuItem onClick={() => handleHardDelete(table.getSelectedRowModel().rows.map(r => r.original))}>
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

  // Lógica segura para obtener el nombre(s) en el diálogo
  const namesToDelete = rowsToDelete.length === 1 
    ? rowsToDelete[0]?.eventos?.cod_evento || `la infraestructura afectada ID ${rowsToDelete[0]?.id}` 
    : `${rowsToDelete.length} registros`

  return (
    <ScaffoldLayout
      title="Infra. Afectada"
      titleTo="infraAfectadas"
      groupTitle="Eventos"
      buttonLabel="Nuevo Registro"
      buttonTo="newInfraAfectada"
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
      {/* ----------------------------------------------------- */}
    </ScaffoldLayout>
  )
}

export default InfraAfectadas