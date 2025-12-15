import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

// Iconos
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CloudQueue as K8sIcon, // Icono para Kubernetes
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as CsvIcon,
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Link as LinkIcon
} from '@mui/icons-material'

// Componentes MUI
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
// Asegúrate de tener este exportador o ajusta la ruta si usas uno genérico
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/k8sEndpointsExporter'

// --- GRAPHQL ---
const UPDATE_K8S_ENDPOINT_MUTATION = gql`
  mutation UpdateK8sEndpointMutation($id: Int!, $input: UpdateK8sEndpointInput!) {
    updateK8sEndpoint(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_K8S_ENDPOINT_MUTATION = gql`
  mutation DeleteK8sEndpointMutation($id: Int!) {
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

// --- HELPERS DE FORMATO ---
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

// Helper para concatenar nombres del objeto usuario
const formatUser = (userObj) => {
  if (!userObj) return '-'
  const fullName = [userObj.nombres, userObj.primer_apellido, userObj.segundo_apellido]
    .filter(Boolean)
    .join(' ')
  return fullName || '-'
}

// --- COMPONENTE PRINCIPAL ---
const K8sEndpoints = ({ k8SEndpoints }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)

  // Estados de Menús
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)

  // Estados de Diálogo (Eliminación dura)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState([])

  // --- MUTACIONES ---
  const [updateK8SEndpoint] = useMutation(UPDATE_K8S_ENDPOINT_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const [deleteK8SEndpoint] = useMutation(DELETE_K8S_ENDPOINT_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  // Helpers para exportación (pasan los datos formateados al excel/pdf)
  const exportHelpers = {
    getUsuarioNombre: (val) => formatUser(val), // Se usa para creadoPor y modificadoPor
    // Puedes agregar más helpers específicos si lo necesitas
  }

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  // --- HANDLERS (Async/Await) ---

  // 1. Soft Delete / Restaurar
  const handleSoftDelete = async (rows) => {
    const toastId = toast.loading('Procesando cambios...')
    try {
      await Promise.all(
        rows.map((row) => {
          const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
          // Se asume usuario_modificacion: 1 por defecto (System/Admin)
          return updateK8SEndpoint({
            variables: { id: row.id, input: { estado: newState, usuario_modificacion: 1 } },
          })
        })
      )
      toast.success(`${rows.length} registros ${showDeleted ? 'restaurados' : 'desactivados'}.`, { id: toastId })
      table.toggleAllRowsSelected(false)
      closeAllDialogs()
    } catch (error) {
      toast.error('Error al procesar los registros', { id: toastId })
    }
  }

  // 2. Hard Delete - Confirmación
  const handleHardDelete = (mrtRows) => {
    const dataObjects = mrtRows.map((r) => r.original)
    setRowsToDelete(dataObjects)
    setOpenDeleteDialog(true)
  }

  // 3. Hard Delete - Ejecución
  const confirmHardDelete = async () => {
    setOpenDeleteDialog(false)
    if (rowsToDelete.length === 0) return

    const toastId = toast.loading('Eliminando registros permanentemente...')
    try {
      await Promise.all(
        rowsToDelete.map((row) =>
          deleteK8SEndpoint({ variables: { id: row.id } })
        )
      )
      toast.success(`${rowsToDelete.length} registro(s) eliminado(s) correctamente.`, { id: toastId })
      table.toggleAllRowsSelected(false)
      closeAllDialogs()
      setRowsToDelete([])
    } catch (error) {
      toast.error('Error al eliminar los registros', { id: toastId })
    }
  }

  // --- FILTRADO DE DATOS ---
  const filteredData = useMemo(() => {
    if (!k8SEndpoints) return []
    return k8SEndpoints.filter((item) =>
      showDeleted ? item.estado === 'INACTIVO' : item.estado === 'ACTIVO'
    )
  }, [k8SEndpoints, showDeleted])

  // --- DEFINICIÓN DE COLUMNAS ---
  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },

    {
      accessorKey: 'nombre',
      header: 'Nombre Cluster',
      size: 150,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <K8sIcon color={row.original.estado === 'INACTIVO' ? 'disabled' : 'primary'} fontSize="small" />
          <Typography variant="body2" fontWeight={600} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
            {row.original.nombre || '-'}
          </Typography>
        </Box>
      ),
    },

    {
      accessorKey: 'url_api',
      header: 'URL API',
      size: 250,
      Cell: ({ cell }) => cell.getValue() ? (
        <Stack direction="row" alignItems="center" gap={0.5}>
          <LinkIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{cell.getValue()}</Typography>
        </Stack>
      ) : '-'
    },

    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      size: 250,
      Cell: ({ cell }) => cell.getValue() || '-' // Si es null muestra -
    },

    {
      accessorKey: 'fecha_ultima_sync',
      header: 'Última Sinc.',
      size: 160,
      Cell: ({ cell }) => formatDateTime(cell.getValue())
    },

    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 100,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue() || '-'}
          color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.7rem' }}
        />
      ),
    },

    // --- AUDITORÍA (Mapeo de Usuarios Corregido) ---
    {
      id: 'fecha_creacion',
      header: 'F. Creación',
      size: 150,
      accessorFn: (row) => row.fecha_creacion,
      Cell: ({ cell }) => formatDateTime(cell.getValue())
    },
    {
      id: 'creadoPor', // ID único para la columna
      header: 'Creado por',
      size: 150,
      accessorFn: (row) => formatUser(row.creadoPor), // Extrae el nombre del objeto
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
      size: 150,
      accessorFn: (row) => formatUser(row.modificadoPor), // Extrae el nombre del objeto
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
        descripcion: false, // Oculto por defecto para limpiar la vista
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
        px: 2, py: 1,
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
        borderRadius: 2, overflow: 'auto',
      }
    },
    muiTopToolbarProps: {
      sx: { pl: 1, pr: 1, mb: 1, backgroundColor: 'background.paper' }
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
      sx: { borderBottom: `1px solid ${theme.palette.divider}` }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: { '&:hover': { backgroundColor: theme.palette.action.hover } }
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

  // --- LÓGICA DE EXPORTACIÓN ---
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

  // Nombre para el diálogo de eliminación
  const namesToDelete = rowsToDelete.length === 1
    ? rowsToDelete[0]?.nombre || `el endpoint ID ${rowsToDelete[0]?.id}`
    : `${rowsToDelete.length} registros`

  return (
    <ScaffoldLayout
      title="Endpoints K8s"
      titleTo="k8sEndpoints"
      groupTitle="Infraestructura"
      buttonLabel="Nuevo Endpoint"
      buttonTo="newK8sEndpoint"
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

export default K8sEndpoints