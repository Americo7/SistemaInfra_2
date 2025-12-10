import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Settings as ParamIcon, // Icono sugerido para parámetros
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
  RestoreFromTrash as RestoreIcon, // Importado para Soft Delete/Restore
} from '@mui/icons-material'

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText, // Importación necesaria para texto del diálogo
  DialogActions,
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
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// --- GRAPHQL ---
const UPDATE_PARAMETRO_MUTATION = gql`
  mutation UpdateParametro($id: Int!, $input: UpdateParametroInput!) {
    updateParametro(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_PARAMETRO_MUTATION = gql`
  mutation DeleteParametro($id: Int!) {
    deleteParametro(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindParametrosRefetch {
    parametros {
      id
      estado
    }
  }
`

const Parametros = ({ parametros, usuarios }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)
  
  // Estados de UI
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)
  
  // --- ESTADOS PARA EL DIÁLOGO DE ELIMINACIÓN ---
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState([]) // Almacena las filas seleccionadas (objetos de datos)
  // El estado `deleteDialog` individual se puede simplificar o eliminar si solo usaremos el masivo. 
  // Lo comentaré por ahora para usar solo el masivo:
  // const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })

  // --- MUTACIONES ---
  const [updateParametro] = useMutation(UPDATE_PARAMETRO_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  // CORRECCIÓN: Eliminado onCompleted para manejar el toast fuera de la mutación
  const [deleteParametro] = useMutation(DELETE_PARAMETRO_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const closeAllDialogs = () => {
    setBulkMenuAnchorEl(null)
    // setActionMenu({ anchorEl: null, row: null }) // Si usas el menú de fila
  }

  // --- HANDLERS ACCIONES MASIVAS ---
  const handleSoftDelete = (rows) => {
    rows.forEach((row) => {
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
      updateParametro({
        variables: { id: row.id, input: { estado: newState, usuario_modificacion: 1 } },
      })
    })
    
    toast.success(`${rows.length} registros ${showDeleted ? 'reactivados' : 'desactivados'}.`)
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  // MODIFICACIÓN: Abre el diálogo y guarda las filas
  const handleHardDelete = (rows) => {
    const dataObjects = rows.map((r) => r.original)
    setRowsToDelete(dataObjects)
    setOpenDeleteDialog(true)
    closeAllDialogs() // Cierra el menú masivo si estaba abierto
  }

  // NUEVA FUNCIÓN: Ejecuta la eliminación tras confirmar en el diálogo MUI
  const confirmHardDelete = () => {
    setOpenDeleteDialog(false)
    
    if (rowsToDelete.length === 0) return

    rowsToDelete.forEach((row) => {
      deleteParametro({ variables: { id: row.id } })
    })

    // Muestra el toast de éxito UNA SOLA VEZ
    toast.success(`${rowsToDelete.length} registro(s) eliminado(s) permanentemente.`) 
    
    table.toggleAllRowsSelected(false)
    setRowsToDelete([]) 
  }

  // --- HELPERS ---
  const usuariosMap = useMemo(() => {
    return (usuarios || []).reduce((a, u) => { a[u.id] = `${u.nombres} ${u.primer_apellido}`; return a }, {})
  }, [usuarios])

  const helpers = {
    getUsuarioNombre: (id) => usuariosMap[id] || `ID: ${id}`,
    formatDate: (value) => {
        if (!value) return '-'
        try { return format(parseISO(value), 'dd/MM/yyyy HH:mm', { locale: es }) } catch { return '-' }
    }
  }

  // --- DATOS ---
  const filteredData = useMemo(() => {
    if (!parametros) return []
    return parametros.filter((item) =>
      showDeleted ? item.estado === 'INACTIVO' : item.estado === 'ACTIVO'
    )
  }, [parametros, showDeleted])

  // --- COLUMNAS ---
  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'codigo', header: 'Código', size: 100 },
    { 
        accessorKey: 'nombre', 
        header: 'Nombre', 
        size: 200,
        Cell: ({ row }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ParamIcon color={row.original.estado === 'INACTIVO' ? 'disabled' : 'primary'} fontSize="small" />
              <Typography variant="body2" fontWeight={500} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
                {row.original.nombre}
              </Typography>
            </Box>
        )
    },
    { accessorKey: 'grupo', header: 'Grupo', size: 120 },
    { accessorKey: 'descripcion', header: 'Descripción', size: 250 },
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
    { accessorKey: 'usuario_creacion', header: 'Creó', size: 150, Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()) },
    { accessorKey: 'fecha_modificacion', header: 'Modif.', size: 150, Cell: ({ cell }) => helpers.formatDate(cell.getValue()) },
    { accessorKey: 'usuario_modificacion', header: 'Modificó', size: 150, Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()) },
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
          Parámetros del Sistema
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
          <IconButton component={Link} to={routes.parametro({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editParametro({ id: row.original.id })} size="small">
            <EditIcon fontSize="small" color="info" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  })

  // --- CONFIG PARA SCAFFOLD ---
  const listActionsConfig = useMemo(() => {
    const selectedRowCount = table.getSelectedRowModel().rows.length
    
    // Menú de acciones masivas
    const BulkActionMenu = (
      <Menu
        anchorEl={bulkMenuAnchorEl}
        open={Boolean(bulkMenuAnchorEl)}
        onClose={closeAllDialogs}
      >
        <MenuItem onClick={() => handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original))}>
          <ListItemIcon>{showDeleted ? <RestoreIcon fontSize="small" color="success" /> : <SoftDeleteIcon fontSize="small" color="warning" />}</ListItemIcon>
          {showDeleted ? 'Reactivar' : 'Desactivar'} (Soft Delete)
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
        if (selectedRowCount === 0) {
            toast.error('Debe seleccionar al menos un registro.')
            return;
        }
        
        if (showDeleted) {
            // Si estamos viendo eliminados, el botón masivo actúa directamente para restaurar/eliminar
            handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original))
        } else {
            // Si no, mostramos menú
            setBulkMenuAnchorEl(e.currentTarget)
        }
      },
      
      // No export handler needed
      bulkActionMenu: BulkActionMenu,
    }
  }, [
    table, 
    showDeleted, 
    bulkMenuAnchorEl, 
    table.getState().rowSelection,
    table.getState().pagination
  ])
  
  // Lógica segura para obtener el nombre(s) en el diálogo
  const namesToDelete = rowsToDelete.length === 1 
    ? rowsToDelete[0]?.nombre || rowsToDelete[0]?.codigo || `el parámetro ID ${rowsToDelete[0]?.id}` 
    : `${rowsToDelete.length} registros`


  return (
    <ScaffoldLayout
      title="Parámetros"
      titleTo="parametros"
      groupTitle="Configuración"
      buttonLabel="Nuevo Parámetro"
      buttonTo="newParametro"
      listActionsConfig={listActionsConfig}
    >
      <MaterialReactTable table={table} />

      {/* DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN DEFINITIVA (MUI) */}
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
            Estás seguro de eliminar permanentemente **{namesToDelete}**?
            <br />
            **Esta acción es irreversible** y eliminará los datos de la base de datos.
            <br />
            ¿Deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDeleteDialog(false); setRowsToDelete([]); }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmHardDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            Confirmar Eliminación
          </Button>
        </DialogActions>
      </Dialog>
    </ScaffoldLayout>
  )
}

export default Parametros