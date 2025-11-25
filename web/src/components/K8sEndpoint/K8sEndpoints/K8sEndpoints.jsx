import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cloud as CloudIcon,
  Dns as ClusterIcon,
} from '@mui/icons-material'

import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material'

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'

// Si tienes funciones de exportación, impórtalas aquí:
// import { exportToPDF, exportToExcel, exportToCSV } from 'src/lib/exporter'

/* ---------------------------------------
 * MUTATION ELIMINAR
 * --------------------------------------- */
const DELETE_K8S_ENDPOINT_MUTATION = gql`
  mutation DeleteK8sEndpointMutation($id: Int!) {
    deleteK8sEndpoint(id: $id) {
      id
    }
  }
`

/* ---------------------------------------
 * LISTA PRINCIPAL
 * --------------------------------------- */
const K8sEndpointsList = ({ k8SEndpoints, usuarios = [] }) => {
  const [showInactive, setShowInactive] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, nombre: '' })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })

  /* MUTATION */
  const [deleteK8sEndpoint] = useMutation(DELETE_K8S_ENDPOINT_MUTATION, {
    onCompleted: () => {
      toast.success('Endpoint eliminado correctamente')
      setDeleteDialog({ open: false, id: null, nombre: '' })
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: ['FindK8sEndpoints'],
    awaitRefetchQueries: true,
  })

  /* ---------------------------------------
   * HELPERS
   * --------------------------------------- */
  const helpers = {
    formatDate: (dateStr) => {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    getUserName: (id) => {
      if (!id) return 'Sistema'
      const u = usuarios.find((x) => x.id === id)
      return u ? `${u.nombres} ${u.primer_apellido}` : `ID: ${id}`
    }
  }

  /* ---------------------------------------
   * FILTRADO (ACTIVOS / TODOS)
   * --------------------------------------- */
  const filteredData = useMemo(() => {
    if (!k8SEndpoints) return []
    return showInactive
      ? k8SEndpoints
      : k8SEndpoints.filter((x) => x.estado === 'ACTIVO')
  }, [k8SEndpoints, showInactive])

  /* ---------------------------------------
   * COLUMNAS TABLA
   * --------------------------------------- */
  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },

      {
        accessorKey: 'nombre',
        header: 'Nombre del Endpoint',
        size: 200,
        Cell: ({ cell }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <CloudIcon color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              {cell.getValue()}
            </Typography>
          </Stack>
        )
      },

      {
        accessorKey: 'url_api',
        header: 'URL API',
        size: 200,
        Cell: ({ cell }) => (
          <Typography
            variant="caption"
            sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
          >
            {cell.getValue()}
          </Typography>
        ),
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

      {
        accessorKey: 'fecha_ultima_sync',
        header: 'Última Sync',
        size: 150,
        Cell: ({ cell }) => helpers.formatDate(cell.getValue()),
      },

      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 100,
        Cell: ({ cell }) => (
          <Chip
            size="small"
            label={cell.getValue()}
            color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'}
            variant={cell.getValue() === 'ACTIVO' ? 'filled' : 'outlined'}
          />
        ),
      },

      {
        accessorKey: 'usuario_creacion',
        header: 'Creado por',
        size: 150,
        Cell: ({ cell }) => helpers.getUserName(cell.getValue()),
      },

      {
        accessorKey: 'fecha_modificacion',
        header: 'Modificado',
        size: 150,
        Cell: ({ cell }) => helpers.formatDate(cell.getValue()),
      },
    ],
    [usuarios]
  )

  /* ---------------------------------------
   * CONFIG TABLA
   * --------------------------------------- */
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    layoutMode: 'semantic',

    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: {
        id: false,
        fecha_modificacion: false,
      },
    },

    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: 2,
        border: '1px solid #e0e0e0',
      },
    },

    renderRowActions: ({ row }) => (
      <Tooltip title="Opciones">
        <IconButton
          onClick={(e) =>
            setActionMenu({ anchorEl: e.currentTarget, row: row.original })
          }
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
    ),

    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              size="small"
            />
          }
          label={<Typography variant="body2">Mostrar inactivos</Typography>}
        />
        {/* Aquí puedes agregar tus botones de Exportar si los tienes */}
      </Box>
    ),
  })

  /* ---------------------------------------
   * ELIMINAR
   * --------------------------------------- */
  const confirmarDelete = () => {
    deleteK8sEndpoint({ variables: { id: deleteDialog.id } })
  }

  /* ---------------------------------------
   * RENDER
   * --------------------------------------- */
  return (
    <Box sx={{ p: 2 }}>
      <MaterialReactTable table={table} />

      {/* Diálogo de eliminación */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, nombre: '' })}>
        <DialogTitle>Eliminar Endpoint</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar permanentemente el endpoint <strong>{deleteDialog.nombre}</strong> (ID: {deleteDialog.id})?
          <br />
          Esta acción podría afectar a los clústeres asociados.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, nombre: '' })}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={confirmarDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menú acciones */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.k8SEndpoint({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.editK8sEndpoint({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon><EditIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionMenu.row) {
              setDeleteDialog({ open: true, id: actionMenu.row.id, nombre: actionMenu.row.nombre })
            }
            setActionMenu({ anchorEl: null, row: null })
          }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default K8sEndpointsList