import React, { useState, useMemo, useEffect } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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
  FormControlLabel,
  Switch,
  ListItemIcon,
  ListItemText,
} from '@mui/material'

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'

/* DELETE MUTATION */
const DELETE_PROXMOX_ENDPOINT_MUTATION = gql`
  mutation DeleteProxmoxEndpointMutation($id: Int!) {
    deleteProxmoxEndpoint(id: $id) {
      id
    }
  }
`

/* CONSULTA INDIVIDUAL PARA USUARIOS */
const USUARIO_BY_ID_QUERY = gql`
  query UsuarioById($id: Int!) {
    usuario: usuario(id: $id) {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

/* -----------------------------------------------
 * LISTA PRINCIPAL
 * ----------------------------------------------- */
const ProxmoxEndpointsList = ({ proxmoxEndpoints }) => {
  const [showInactive, setShowInactive] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })
  const [usuariosCache, setUsuariosCache] = useState({})

  /* Mutation eliminar */
  const [deleteProxmoxEndpoint] = useMutation(
    DELETE_PROXMOX_ENDPOINT_MUTATION,
    {
      onCompleted: () => {
        toast.success('Endpoint eliminado')
        setDeleteDialog({ open: false, id: null })
      },
      onError: (error) => toast.error(error.message),
      refetchQueries: ['FindProxmoxEndpoints'],
      awaitRefetchQueries: true,
    }
  )

  /* ---- Helpers ---- */
  const helpers = {
    formatDate: (value) => {
      if (!value) return '-'
      return new Date(value).toLocaleString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    truncate: (txt, len = 35) => {
      if (!txt) return '-'
      const s = String(txt)
      return s.length > len ? `${s.slice(0, len)}…` : s
    },

    checkbox: (v) => (v ? 'Sí' : 'No'),
  }

  /* ---- Obtener nombres de usuario ---- */
  const getUsuarioNombre = (id) => {
    if (!id) return '-'

    // Si ya está en cache, usarlo
    if (usuariosCache[id]) {
      return usuariosCache[id]
    }

    // Caso contrario, consultar al backend
    fetchUsuario(id)
    return 'Cargando...'
  }

  /* Consulta individual on-demand */
  const fetchUsuario = async (id) => {
    try {
      const result = await fetch(
        '/.redwood/functions/graphql',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query UsuarioById($id: Int!) {
                usuario(id: $id) {
                  id
                  nombres
                  primer_apellido
                  segundo_apellido
                }
              }`,
            variables: { id },
          }),
        }
      )

      const { data } = await result.json()
      if (data?.usuario) {
        const u = data.usuario
        const nombre = [u.nombres, u.primer_apellido, u.segundo_apellido]
          .filter(Boolean)
          .join(' ')

        setUsuariosCache((prev) => ({ ...prev, [id]: nombre }))
      }
    } catch (e) {
      console.error('Error consultando usuario:', e)
    }
  }

  /* ---- Filtro Activos/Inactivos ---- */
  const filteredData = useMemo(() => {
    return showInactive
      ? proxmoxEndpoints
      : proxmoxEndpoints.filter((x) => x.estado === 'ACTIVO')
  }, [proxmoxEndpoints, showInactive])

  /* ---- Columnas ---- */
  const columns = useMemo(
    () => [
      { accessorKey: 'nombre', header: 'Nombre', size: 150 },

      { accessorKey: 'dominio', header: 'Dominio', size: 160 },

      { accessorKey: 'ip', header: 'IP', size: 120 },

      { accessorKey: 'puerto', header: 'Puerto', size: 80 },

      {
        accessorKey: 'ssl',
        header: 'SSL',
        size: 60,
        Cell: ({ cell }) => helpers.checkbox(cell.getValue()),
      },

      { accessorKey: 'usuario', header: 'Usuario API', size: 150 },

      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        size: 200,
        Cell: ({ cell }) => helpers.truncate(cell.getValue(), 35),
      },

      {
        accessorKey: 'fecha_ultima_sync',
        header: 'Última Sync',
        size: 160,
        Cell: ({ cell }) => helpers.formatDate(cell.getValue()),
      },

      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 90,
        Cell: ({ cell }) => (
          <Chip
            size="small"
            label={cell.getValue()}
            color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'}
          />
        ),
      },

      /* --------- AUDITORÍA --------- */

      {
        accessorKey: 'fecha_creacion',
        header: 'Fecha creación',
        size: 150,
        Cell: ({ cell }) => helpers.formatDate(cell.getValue()),
      },

      {
        accessorKey: 'usuario_creacion',
        header: 'Creado por',
        size: 200,
        Cell: ({ cell }) => getUsuarioNombre(cell.getValue()),
      },

      {
        accessorKey: 'fecha_modificacion',
        header: 'Fecha modificación',
        size: 150,
        Cell: ({ cell }) => helpers.formatDate(cell.getValue()),
      },

      {
        accessorKey: 'usuario_modificacion',
        header: 'Modificado por',
        size: 200,
        Cell: ({ cell }) => getUsuarioNombre(cell.getValue()),
      },
    ],
    [usuariosCache]
  )

  /* Config tabla */
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,

    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: {
        fecha_creacion: false,
        usuario_creacion: false,
        fecha_modificacion: false,
        usuario_modificacion: false,
      },
    },

    renderRowActions: ({ row }) => (
      <Tooltip title="Acciones">
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
          label="Mostrar inactivos"
          control={
            <Switch
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
          }
        />
      </Box>
    ),
  })

  /* Confirmar eliminación */
  const confirmarDelete = () => {
    deleteProxmoxEndpoint({ variables: { id: deleteDialog.id } })
  }

  /* Render */
  return (
    <Box>
      <MaterialReactTable table={table} />

      {/* CONFIRMAR DELETE */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>Eliminar Endpoint</DialogTitle>
        <DialogContent>
          ¿Deseas eliminar el endpoint #{deleteDialog.id}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={confirmarDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ACTION MENU */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={
            actionMenu.row
              ? routes.proxmoxEndpoint({ id: actionMenu.row.id })
              : '#'
          }
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={
            actionMenu.row
              ? routes.editProxmoxEndpoint({ id: actionMenu.row.id })
              : '#'
          }
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionMenu.row) {
              setDeleteDialog({ open: true, id: actionMenu.row.id })
            }
            setActionMenu({ anchorEl: null, row: null })
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ProxmoxEndpointsList
