import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  FileDownload as FileDownloadIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
} from 'src/lib/exporter/usuariosExporter'

import { QUERY } from 'src/components/Usuario/UsuariosCell'

const GET_CREATOR_USERS_QUERY = gql`
  query GetCreatorUsers {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

const UPDATE_USUARIO_MUTATION = gql`
  mutation UpdateUsuarioMutation($id: Int!, $input: UpdateUsuarioInput!) {
    updateUsuario(id: $id, input: $input) {
      id
      estado
    }
  }
`

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

const truncateText = (text, len = 50) => {
  if (text === null || text === undefined) return '-'
  const s = String(text)
  return s.length > len ? `${s.substring(0, len)}...` : s
}

const UsuariosList = ({ usuarios = [] }) => {
  // Queries
  const { data: creatorData } = useQuery(GET_CREATOR_USERS_QUERY)

  // Derived data
  const usuariosList = Array.isArray(usuarios) ? usuarios : []

  // State
  const [showInactive, setShowInactive] = useState(false)
  const [exportMenu, setExportMenu] = useState({ all: null, page: null, sel: null })
  const [estadoDialog, setEstadoDialog] = useState({ open: false, id: null, estado: 'ACTIVO' })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })

  const [updateUsuario] = useMutation(UPDATE_USUARIO_MUTATION, {
    onCompleted: () => {
      toast.success('Estado actualizado')
      setEstadoDialog({ open: false, id: null, estado: 'ACTIVO' })
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  // Helpers (same pattern as Maquinas)
  const helpers = {
    getUsuarioById: (id) => creatorData?.usuarios?.find((u) => u.id === id) || null,
    getNombreUsuario: (id) => {
      const u = creatorData?.usuarios?.find((x) => x.id === id)
      return u ? `${u.nombres} ${u.primer_apellido}`.trim() : `ID: ${id}`
    },
    formatDate,
    truncateText,
  }

  // Filtered data
  const filteredData = useMemo(() => {
    return showInactive ? usuariosList : usuariosList.filter((u) => u.estado === 'ACTIVO')
  }, [usuariosList, showInactive])

  // Columns (pattern like Maquinas)
  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 50, enableHiding: false },
    { accessorKey: 'nombre_usuario', header: 'Usuario', size: 140 },
    { accessorKey: 'nombres', header: 'Nombres', size: 180 },
    { accessorKey: 'primer_apellido', header: 'Primer Apellido', size: 140 },
    { accessorKey: 'segundo_apellido', header: 'Segundo Apellido', size: 140 },
    { accessorKey: 'nro_documento', header: 'Documento', size: 120 },
    { accessorKey: 'email', header: 'Email', size: 200 },
    { accessorKey: 'celular', header: 'Celular', size: 120 },
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 100,
      Cell: ({ cell }) => (
        <Chip
          size="small"
          label={cell.getValue() === 'ACTIVO' ? 'Activo' : 'Inactivo'}
          color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'}
        />
      ),
    },
    {
      accessorKey: 'fecha_creacion',
      header: 'Fecha Creación',
      size: 150,
      Cell: ({ cell }) => helpers.formatDate(cell.getValue()),
    },
    {
      accessorKey: 'usuario_creacion',
      header: 'Creado por',
      size: 180,
      Cell: ({ cell }) => helpers.getNombreUsuario(cell.getValue()),
    },
    {
      accessorKey: 'fecha_modificacion',
      header: 'Fecha Modificación',
      size: 150,
      Cell: ({ cell }) => helpers.formatDate(cell.getValue()),
    },
    {
      accessorKey: 'usuario_modificacion',
      header: 'Modificado por',
      size: 180,
      Cell: ({ cell }) => helpers.getNombreUsuario(cell.getValue()),
    },
    // Hidden by default sensitive fields
    { accessorKey: 'id_ciudadano_digital', header: 'ID Ciudadano', size: 120 },
    { accessorKey: 'contrasena', header: 'Contraseña', size: 120 },
  ], [creatorData])

  // Table config (Maquinas pattern)
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row) => row.id?.toString?.() ?? Math.random().toString(),

    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: {
        id: false,
        fecha_creacion: false,
        usuario_creacion: false,
        fecha_modificacion: false,
        usuario_modificacion: false,
        id_ciudadano_digital: false,
        contrasena: false,
      },
    },

    renderRowActions: ({ row }) => (
      <Tooltip title="Acciones">
        <IconButton
          onClick={(e) => setActionMenu({ anchorEl: e.currentTarget, row: row.original })}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
    ),

    renderTopToolbarCustomActions: ({ table }) => {
      const selected = table.getSelectedRowModel().rows

      return (
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

          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
            onClick={(e) => setExportMenu({ ...exportMenu, all: e.currentTarget })}
          >
            Exportar Todos
          </Button>

          <Menu
            anchorEl={exportMenu.all}
            open={!!exportMenu.all}
            onClose={() => setExportMenu({ ...exportMenu, all: null })}
          >
            <MenuItem onClick={() => { exportToPDF(table.getPrePaginationRowModel().rows, table, helpers); setExportMenu({ ...exportMenu, all: null }) }}>PDF</MenuItem>
            <MenuItem onClick={() => { exportToExcel(table.getPrePaginationRowModel().rows, table, helpers); setExportMenu({ ...exportMenu, all: null }) }}>Excel</MenuItem>
            <MenuItem onClick={() => { exportToCSV(table.getPrePaginationRowModel().rows, table, helpers); setExportMenu({ ...exportMenu, all: null }) }}>CSV</MenuItem>
          </Menu>

          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            sx={{ backgroundColor: '#0F284D' }}
            onClick={(e) => setExportMenu({ ...exportMenu, page: e.currentTarget })}
          >
            Exportar Página
          </Button>

          <Menu
            anchorEl={exportMenu.page}
            open={!!exportMenu.page}
            onClose={() => setExportMenu({ ...exportMenu, page: null })}
          >
            <MenuItem onClick={() => { exportToPDF(table.getRowModel().rows, table, helpers); setExportMenu({ ...exportMenu, page: null }) }}>PDF</MenuItem>
            <MenuItem onClick={() => { exportToExcel(table.getRowModel().rows, table, helpers); setExportMenu({ ...exportMenu, page: null }) }}>Excel</MenuItem>
            <MenuItem onClick={() => { exportToCSV(table.getRowModel().rows, table, helpers); setExportMenu({ ...exportMenu, page: null }) }}>CSV</MenuItem>
          </Menu>

          <Button
            disabled={selected.length === 0}
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            sx={{ backgroundColor: '#0F284D' }}
            onClick={(e) => setExportMenu({ ...exportMenu, sel: e.currentTarget })}
          >
            Exportar Selección ({selected.length})
          </Button>

          <Menu
            anchorEl={exportMenu.sel}
            open={!!exportMenu.sel}
            onClose={() => setExportMenu({ ...exportMenu, sel: null })}
          >
            <MenuItem onClick={() => { exportToPDF(selected, table, helpers); setExportMenu({ ...exportMenu, sel: null }) }}>PDF</MenuItem>
            <MenuItem onClick={() => { exportToExcel(selected, table, helpers); setExportMenu({ ...exportMenu, sel: null }) }}>Excel</MenuItem>
            <MenuItem onClick={() => { exportToCSV(selected, table, helpers); setExportMenu({ ...exportMenu, sel: null }) }}>CSV</MenuItem>
          </Menu>
        </Box>
      )
    },
  })

  const confirmarEstado = () => {
    updateUsuario({
      variables: {
        id: estadoDialog.id,
        input: {
          estado: estadoDialog.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
          fecha_modificacion: new Date().toISOString(),
        },
      },
    })
  }

  return (
    <Box sx={{ p: 0 }}>
      <MaterialReactTable table={table} />

      {/* Diálogo Activar/Desactivar */}
      <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ open: false, id: null })}>
        <DialogTitle>{estadoDialog.estado === 'ACTIVO' ? 'Desactivar Usuario' : 'Activar Usuario'}</DialogTitle>
        <DialogContent>
          ¿Deseas cambiar el estado del usuario #{estadoDialog.id}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadoDialog({ open: false, id: null })}>Cancelar</Button>
          <Button onClick={confirmarEstado} color={estadoDialog.estado === 'ACTIVO' ? 'error' : 'success'} variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menú de acciones por fila */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.usuario({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.editUsuario({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon><EditIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionMenu.row) {
              setEstadoDialog({ open: true, id: actionMenu.row.id, estado: actionMenu.row.estado })
            }
            setActionMenu({ anchorEl: null, row: null })
          }}
        >
          <ListItemIcon>
            {actionMenu.row?.estado === 'ACTIVO' ? (
              <DeleteIcon fontSize="small" color="error" />
            ) : (
              <CheckIcon fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText>{actionMenu.row?.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default UsuariosList
