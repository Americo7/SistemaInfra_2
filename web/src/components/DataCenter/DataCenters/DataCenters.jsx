import React, { useMemo, useState } from 'react'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import { Link, routes } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
} from 'src/lib/exporter/dataCentersExporter'

import { QUERY } from 'src/components/DataCenter/DataCentersCell'

const DELETE_DATA_CENTER_MUTATION = gql`
  mutation DeleteDataCenterMutation($id: Int!) {
    deleteDataCenter(id: $id) {
      id
    }
  }
`

// --- Usuarios para mostrar nombre ---
const USUARIOS_QUERY = gql`
  query UsuariosForDataCenters {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

// --- Helpers ---
const formatDateTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatEnum = (value) => {
  if (!value) return '-'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

const DataCentersList = ({ dataCenters = [] }) => {
  const { data: usuariosData } = useQuery(USUARIOS_QUERY)
  const usuarios = usuariosData?.usuarios || []

  const [exportMenu, setExportMenu] = useState({ all: null, page: null, sel: null })
  const [showInactive, setShowInactive] = useState(false)
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })

  const [deleteDataCenter] = useMutation(DELETE_DATA_CENTER_MUTATION, {
    onCompleted: () => {
      toast.success('DataCenter eliminado')
      setDeleteDialog({ open: false, id: null })
    },
    onError: (e) => toast.error(e.message),
    refetchQueries: [{ query: QUERY }],
  })

  const helpers = {
    getNombreUsuario: (id) => {
      if (!id) return '-'
      const u = usuarios.find((x) => x.id === id)
      if (!u) return `ID: ${id}`
      return `${u.nombres} ${u.primer_apellido}`.trim()
    },
  }

  const filteredData = useMemo(
    () =>
      showInactive
        ? dataCenters
        : dataCenters.filter((dc) => dc.estado === 'ACTIVO'),
    [dataCenters, showInactive]
  )

  // ----------------- Columnas Tabla -----------------
  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },

      { accessorKey: 'nombre', header: 'Nombre', size: 200 },

      { accessorKey: 'ubicacion', header: 'Ubicación', size: 200 },

      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 100,
        Cell: ({ cell }) => (
          <Chip
            size="small"
            label={formatEnum(cell.getValue())}
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
        size: 180,
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
        size: 180,
        Cell: ({ cell }) => helpers.getNombreUsuario(cell.getValue()),
      },
    ],
    [usuarios]
  )

  // ----------------- Tabla -----------------
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
            control={
              <Switch
                checked={showInactive}
                onChange={() => setShowInactive(!showInactive)}
              />
            }
            label="Mostrar inactivos"
          />

          {/* Exportar Todos */}
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            sx={{ backgroundColor: '#0F284D' }}
            onClick={(e) => setExportMenu({ ...exportMenu, all: e.currentTarget })}
          >
            Exportar Todos
          </Button>

          <Menu
            anchorEl={exportMenu.all}
            open={!!exportMenu.all}
            onClose={() => setExportMenu({ ...exportMenu, all: null })}
          >
            <MenuItem
              onClick={() => {
                exportToPDF(table.getPrePaginationRowModel().rows.map((v) => v.original))
                setExportMenu({ ...exportMenu, all: null })
              }}
            >
              PDF
            </MenuItem>

            <MenuItem
              onClick={() => {
                exportToExcel(table.getPrePaginationRowModel().rows.map((v) => v.original))
                setExportMenu({ ...exportMenu, all: null })
              }}
            >
              Excel
            </MenuItem>

            <MenuItem
              onClick={() => {
                exportToCSV(table.getPrePaginationRowModel().rows.map((v) => v.original))
                setExportMenu({ ...exportMenu, all: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>

          {/* Exportar Página */}
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
            <MenuItem
              onClick={() => {
                exportToPDF(table.getRowModel().rows.map((v) => v.original))
                setExportMenu({ ...exportMenu, page: null })
              }}
            >
              PDF
            </MenuItem>

            <MenuItem
              onClick={() => {
                exportToExcel(table.getRowModel().rows.map((v) => v.original))
                setExportMenu({ ...exportMenu, page: null })
              }}
            >
              Excel
            </MenuItem>

            <MenuItem
              onClick={() => {
                exportToCSV(table.getRowModel().rows.map((v) => v.original))
                setExportMenu({ ...exportMenu, page: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>

          {/* Exportar Selección */}
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
            <MenuItem
              onClick={() => {
                exportToPDF(selected.map((v) => v.original))
                setExportMenu({ ...exportMenu, sel: null })
              }}
            >
              PDF
            </MenuItem>

            <MenuItem
              onClick={() => {
                exportToExcel(selected.map((v) => v.original))
                setExportMenu({ ...exportMenu, sel: null })
              }}
            >
              Excel
            </MenuItem>

            <MenuItem
              onClick={() => {
                exportToCSV(selected.map((v) => v.original))
                setExportMenu({ ...exportMenu, sel: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>
        </Box>
      )
    },
  })

  // ----------------- Eliminar -----------------
  const confirmarEliminar = () => {
    deleteDataCenter({ variables: { id: deleteDialog.id } })
  }

  return (
    <Box sx={{ p: 1 }}>
      <MaterialReactTable table={table} />

      {/* Menú de acciones por fila */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={!!actionMenu.anchorEl}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.dataCenter({ id: actionMenu.row.id }) : '#'}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.editDataCenter({ id: actionMenu.row.id }) : '#'}
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

      {/* Dialog eliminar */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>Eliminar Data Center</DialogTitle>
        <DialogContent>
          ¿Deseas eliminar el DataCenter #{deleteDialog.id}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={confirmarEliminar}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DataCentersList
