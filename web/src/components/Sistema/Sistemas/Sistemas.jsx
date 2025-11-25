import React, { useState, useMemo } from 'react'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
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
  Typography,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  ListItemIcon,
  ListItemText,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import { Link, routes } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Sistema/SistemasCell'
import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
} from 'src/lib/exporter/sistemasExporter'

const UPDATE_SISTEMA_MUTATION = gql`
  mutation UpdateSistemaMutation_fromSistema(
    $id: Int!
    $input: UpdateSistemaInput!
  ) {
    updateSistema(id: $id, input: $input) {
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

const ENTIDADES_QUERY = gql`
  query FindEntidadesForSistemas {
    entidads {
      id
      nombre
    }
  }
`

const SISTEMAS_PADRE_QUERY = gql`
  query SistemasPadre {
    sistemas {
      id
      nombre
    }
  }
`

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const Sistemas = ({ sistemas = [] }) => {
  const { data: usuariosData } = useQuery(USUARIOS_QUERY)
  const { data: entidadesData } = useQuery(ENTIDADES_QUERY)
  const { data: sistemasPadreData } = useQuery(SISTEMAS_PADRE_QUERY)

  const usuarios = usuariosData?.usuarios || []
  const entidades = entidadesData?.entidads || []
  const sistemasPadre = sistemasPadreData?.sistemas || []

  const [showInactive, setShowInactive] = useState(false)
  const [exportMenu, setExportMenu] = useState({ all: null, page: null, sel: null })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })
  const [estadoDialog, setEstadoDialog] = useState({ open: false, id: null, estado: 'ACTIVO' })

  const [updateSistema] = useMutation(UPDATE_SISTEMA_MUTATION, {
    onCompleted: () => {
      toast.success('Estado actualizado')
      setEstadoDialog({ open: false })
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const helpers = {
    getNombreUsuario: (id) => {
      const u = usuarios.find((x) => x.id === id)
      return u ? `${u.nombres} ${u.primer_apellido}` : 'N/A'
    },

    getNombreSistemaPadre: (id) => {
      const s = sistemasPadre.find((x) => x.id === id)
      return s ? s.nombre : 'N/A'
    },

    getNombreEntidad: (id) => {
      const e = entidades.find((x) => x.id === id)
      return e ? e.nombre : 'N/A'
    },
  }

  const filteredSistemas = useMemo(() => {
    return showInactive
      ? sistemas
      : sistemas.filter((s) => s.estado === 'ACTIVO')
  }, [sistemas, showInactive])

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      {
        accessorKey: 'id_padre',
        header: 'Sistema Padre',
        size: 150,
        Cell: ({ cell }) => helpers.getNombreSistemaPadre(cell.getValue()),
      },
      {
        accessorKey: 'id_entidad',
        header: 'Entidad',
        size: 150,
        Cell: ({ cell }) => helpers.getNombreEntidad(cell.getValue()),
      },
      { accessorKey: 'codigo', header: 'Código', size: 120 },
      { accessorKey: 'sigla', header: 'Sigla', size: 120 },
      { accessorKey: 'nombre', header: 'Nombre', size: 180 },
      { accessorKey: 'descripcion', header: 'Descripción', size: 240 },
      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 90,
        Cell: ({ row }) => (
          <Chip
            size="small"
            label={row.original.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
            color={row.original.estado === 'ACTIVO' ? 'success' : 'error'}
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
        size: 170,
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
        size: 170,
        Cell: ({ cell }) => helpers.getNombreUsuario(cell.getValue()),
      },
    ],
    [usuarios, entidades, sistemasPadre]
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredSistemas,
    enableRowSelection: true,
    enableRowActions: true,
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: {
        id: false,
        fecha_creacion: false,
        usuario_creacion: false,
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

    renderTopToolbarCustomActions: ({ table }) => {
      const selected = table.getSelectedRowModel().rows

      return (
        <Box sx={{ display: 'flex', gap: 2, p: 1, alignItems: 'center' }}>
          <FormControlLabel
            label="Mostrar inactivos"
            control={
              <Switch
                checked={showInactive}
                onChange={() => setShowInactive(!showInactive)}
              />
            }
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
                exportToPDF(table.getPrePaginationRowModel().rows, table, helpers)
                setExportMenu({ ...exportMenu, all: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(table.getPrePaginationRowModel().rows, table, helpers)
                setExportMenu({ ...exportMenu, all: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(table.getPrePaginationRowModel().rows, table, helpers)
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
                exportToPDF(table.getRowModel().rows, table, helpers)
                setExportMenu({ ...exportMenu, page: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(table.getRowModel().rows, table, helpers)
                setExportMenu({ ...exportMenu, page: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(table.getRowModel().rows, table, helpers)
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
                exportToPDF(selected, table, helpers)
                setExportMenu({ ...exportMenu, sel: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(selected, table, helpers)
                setExportMenu({ ...exportMenu, sel: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(selected, table, helpers)
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

  const confirmarEstado = () => {
    updateSistema({
      variables: {
        id: estadoDialog.id,
        input: {
          estado: estadoDialog.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
          fecha_modificacion: new Date().toISOString(),
          usuario_modificacion: 1,
        },
      },
    })
  }

  return (
    <Box sx={{ p: 1 }}>
      <MaterialReactTable table={table} />

      {/* Menú de acciones por fila */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.sistema({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.editSistema({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon><EditIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionMenu.row) {
              setEstadoDialog({
                open: true,
                id: actionMenu.row.id,
                estado: actionMenu.row.estado,
              })
            }
            setActionMenu({ anchorEl: null, row: null })
          }}
        >
          <ListItemIcon>
            {actionMenu.row?.estado === 'ACTIVO'
              ? <DeleteIcon fontSize="small" color="error" />
              : <CheckIcon fontSize="small" color="success" />}
          </ListItemIcon>
          <ListItemText>
            {actionMenu.row?.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirmación */}
      <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ open: false })}>
        <DialogTitle>Confirmar Cambio de Estado</DialogTitle>
        <DialogContent>
          ¿Deseas cambiar el estado del sistema #{estadoDialog.id}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadoDialog({ open: false })}>Cancelar</Button>
          <Button
            onClick={confirmarEstado}
            variant="contained"
            color={estadoDialog.estado === 'ACTIVO' ? 'error' : 'success'}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Sistemas
