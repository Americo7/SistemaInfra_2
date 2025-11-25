import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
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
  FormControlLabel,
  Switch,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import {
  exportToPDF,
  exportToExcel,
  exportToCSV
} from 'src/lib/exporter/entidadesExporter'

import { QUERY } from 'src/components/Entidad/EntidadsCell'

const UPDATE_ENTIDAD_MUTATION = gql`
  mutation UpdateEntidadMutationFromEntidadList(
    $id: Int!
    $input: UpdateEntidadInput!
  ) {
    updateEntidad(id: $id, input: $input) {
      id
      estado
    }
  }
`

const USUARIOS_QUERY = gql`
  query UsuariosQuery {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

const formatDateTime = (value) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString('es-BO', {
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

const Entidades = ({ entidads = [] }) => {
  const [showInactive, setShowInactive] = useState(false)
  const [exportMenu, setExportMenu] = useState({ all: null, page: null, sel: null })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })

  const { data: usuariosData } = useQuery(USUARIOS_QUERY)

  const [updateEntidad] = useMutation(UPDATE_ENTIDAD_MUTATION, {
    onCompleted: () => {
      toast.success('Estado actualizado')
      setDeleteDialog({ open: false, id: null })
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const helpers = {
    getNombreUsuario: (id) => {
      if (!id) return '-'
      const u = usuariosData?.usuarios?.find((x) => x.id === id)
      return u ? `${u.nombres} ${u.primer_apellido}` : `ID: ${id}`
    },
  }

  const filteredData = useMemo(() => {
    if (!entidads) return []
    return entidads.filter((e) =>
      showInactive ? e.estado === 'INACTIVO' : e.estado === 'ACTIVO'
    )
  }, [entidads, showInactive])

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60, enableHiding: false },
      { accessorKey: 'codigo', header: 'Código', size: 100 },
      { accessorKey: 'sigla', header: 'Sigla', size: 100 },
      { accessorKey: 'nombre', header: 'Nombre', size: 200 },

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
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },

      {
        accessorKey: 'usuario_creacion',
        header: 'Creado por',
        size: 150,
        Cell: ({ cell }) => helpers.getNombreUsuario(cell.getValue()),
      },

      {
        accessorKey: 'fecha_modificacion',
        header: 'Fecha Modificación',
        size: 150,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },

      {
        accessorKey: 'usuario_modificacion',
        header: 'Modificado por',
        size: 150,
        Cell: ({ cell }) => helpers.getNombreUsuario(cell.getValue()),
      },
    ],
    [usuariosData]
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    enableRowSelection: true,

    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: {
        id: false,
        fecha_modificacion: false,
        usuario_modificacion: false,
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

          {/* Exportar Todos */}
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={(e) => setExportMenu({ ...exportMenu, all: e.currentTarget })}
            sx={{
              backgroundColor: '#0F284D',
              '&:hover': { backgroundColor: '#1A3D6D' },
            }}
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

          {/* Exportar Página */}
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={(e) => setExportMenu({ ...exportMenu, page: e.currentTarget })}
            sx={{ backgroundColor: '#0F284D' }}
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

          {/* Exportar Selección */}
          <Button
            disabled={selected.length === 0}
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={(e) => setExportMenu({ ...exportMenu, sel: e.currentTarget })}
            sx={{ backgroundColor: '#0F284D' }}
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

  const confirmarDesactivar = () => {
    updateEntidad({
      variables: {
        id: deleteDialog.id,
        input: {
          estado: 'INACTIVO',
          fecha_modificacion: new Date().toISOString(),
        },
      },
    })
  }

  return (
    <Box sx={{ px: 0, py: 0 }}>
      <MaterialReactTable table={table} />

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
        <DialogTitle>Desactivar entidad</DialogTitle>
        <DialogContent>
          ¿Deseas desactivar la entidad #{deleteDialog.id}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmarDesactivar}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menú de acciones */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.entidad({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.editEntidad({ id: actionMenu.row.id }) : '#'}
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
          <ListItemText>Desactivar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Entidades
