import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  AssignmentInd as UserRolIcon,
  Computer as VmIcon,
  Dns as SystemIcon,
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
  // --- IMPORTACIONES ADICIONALES PARA DIÁLOGO MUI ---
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/usuarioRolsExporter'

// --- GRAPHQL ---
const UPDATE_USUARIO_ROL_MUTATION = gql`
  mutation UpdateUsuarioRol($id: Int!, $input: UpdateUsuarioRolInput!) {
    updateUsuarioRol(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_USUARIO_ROL_MUTATION = gql`
  mutation DeleteUsuarioRol($id: Int!) {
    deleteUsuarioRol(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindUsuarioRolsRefetch {
    usuarioRols {
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

const UsuarioRols = ({ usuarioRols }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)
  
  // --- ESTADOS PARA EL DIÁLOGO ---
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState([]) // Almacena las filas seleccionadas (objetos de datos)

  const [updateUsuarioRol] = useMutation(UPDATE_USUARIO_ROL_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  // CORRECCIÓN: Eliminado onCompleted para manejar el toast fuera de la mutación
  const [deleteUsuarioRol] = useMutation(DELETE_USUARIO_ROL_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  // Helpers para el exportador
  const exportHelpers = {
    getUsuarioNombre: (val) => formatUser(val),
    // Helper para exportar el recurso calculado
    getRecurso: (val, row) => row.maquinas?.nombre ? `VM: ${row.maquinas.nombre}` : (row.sistemas?.nombre ? `SIS: ${row.sistemas.nombre}` : '-')
  }

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  // --- HANDLERS ---
  const handleSoftDelete = (rows) => {
    rows.forEach((row) => {
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
      updateUsuarioRol({
        variables: { id: row.id, input: { estado: newState } },
      })
    })
    
    toast.success(`${rows.length} registros ${showDeleted ? 'restaurados' : 'desactivados'}.`)
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  // MODIFICACIÓN: Abre el diálogo y guarda las filas
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
      deleteUsuarioRol({ variables: { id: row.id } })
    })
    
    // Muestra el toast de éxito UNA SOLA VEZ
    toast.success(`${rowsToDelete.length} asignación(es) eliminada(s) permanentemente.`) 

    table.toggleAllRowsSelected(false)
    closeAllDialogs()
    setRowsToDelete([])
  }

  // --- FILTRADO ---
  const filteredData = useMemo(() => {
    if (!usuarioRols) return []
    return usuarioRols.filter((item) =>
      showDeleted ? item.estado === 'INACTIVO' : item.estado === 'ACTIVO'
    )
  }, [usuarioRols, showDeleted])

  // --- COLUMNAS ---
  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    
    // USUARIO
    {
      id: 'usuario',
      header: 'Usuario',
      size: 200,
      accessorFn: (row) => row.usuarios ? `${row.usuarios.nombres} ${row.usuarios.primer_apellido}` : `ID: ${row.id_usuario}`,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserRolIcon color={row.original.estado === 'INACTIVO' ? 'disabled' : 'primary'} fontSize="small" />
          <Typography variant="body2" fontWeight={500} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
            {row.original.usuarios ? `${row.original.usuarios.nombres} ${row.original.usuarios.primer_apellido}` : '-'}
          </Typography>
        </Box>
      ),
    },

    // ROL
    {
      id: 'rol',
      header: 'Rol Asignado',
      size: 150,
      accessorFn: (row) => row.roles?.nombre || row.id_rol,
      Cell: ({ row }) => (
        <Chip 
            label={row.original.roles?.nombre || row.original.id_rol} 
            size="small" 
            variant="outlined"
            sx={{ fontWeight: 'bold' }} 
        />
      )
    },

    // RECURSO (MÁQUINA O SISTEMA)
    {
        id: 'recurso',
        header: 'Recurso (VM / Sis)',
        size: 200,
        // AccessorFn para que el buscador global y sorting funcionen con el texto
        accessorFn: (row) => row.maquinas?.nombre || row.sistemas?.nombre || '-',
        Cell: ({ row }) => {
            const maq = row.original.maquinas
            const sis = row.original.sistemas
            
            if (maq) {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'info.main' }}>
                        <VmIcon fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>{maq.nombre}</Typography>
                    </Box>
                )
            }
            if (sis) {
                 return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'secondary.main' }}>
                        <SystemIcon fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>{sis.nombre}</Typography>
                    </Box>
                )
            }
            return <Typography variant="caption" color="text.secondary">-</Typography>
        }
    },

    // ESTADO
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

    // AUDITORÍA (Opcional, visible por defecto si se desea)
    { 
        id: 'creadoPor',
        header: 'Creado por', 
        size: 160, 
        accessorFn: (row) => formatUser(row.creadoPor)
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
        creadoPor: true, // Visible
        modificadoPor: true // Visible
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
          Asignación de Roles
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
          <IconButton component={Link} to={routes.usuarioRol({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editUsuarioRol({ id: row.original.id })} size="small">
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

  // Lógica segura para obtener el nombre(s) en el diálogo
  const namesToDelete = rowsToDelete.length === 1 
    ? rowsToDelete[0]?.usuarios?.nombre || rowsToDelete[0]?.roles?.nombre || `la asignación ID ${rowsToDelete[0]?.id}` 
    : `${rowsToDelete.length} registros`

  return (
    <ScaffoldLayout
      title="Asignación Roles"
      titleTo="usuarioRols"
      groupTitle="Gestión de Usuarios"
      buttonLabel="Nueva Asignación"
      buttonTo="newUsuarioRol"
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

export default UsuarioRols