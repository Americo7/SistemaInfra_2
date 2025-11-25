import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, useQuery, gql } from '@redwoodjs/web'
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
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Stack,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'

import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
} from 'src/lib/exporter/eventosExporter'

import { QUERY } from 'src/components/Evento/EventosCell'

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

const INFRA_QUERY = gql`
  query InfraQuery {
    dataCenters {
      id
      nombre
    }
    servidores {
      id
      nombre
    }
    maquinas {
      id
      nombre
    }
  }
`

const UPDATE_EVENTO_MUTATION = gql`
  mutation UpdateEventoMutation($id: Int!, $input: UpdateEventoInput!) {
    updateEvento(id: $id, input: $input) {
      id
      estado
    }
  }
`

const EventosList = ({ eventos = [] }) => {
  // Queries
  const { data: usuariosData } = useQuery(USUARIOS_QUERY)
  const { data: infraData } = useQuery(INFRA_QUERY)

  const usuarios = usuariosData?.usuarios || []
  const dataCenters = infraData?.dataCenters || []
  const servidores = infraData?.servidores || []
  const maquinas = infraData?.maquinas || []

  // Estados
  const [showInactive, setShowInactive] = useState(false)
  const [exportMenu, setExportMenu] = useState({ all: null, page: null, sel: null })
  const [estadoDialog, setEstadoDialog] = useState({ open: false, id: null, estado: 'ACTIVO' })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })

  const [updateEvento] = useMutation(UPDATE_EVENTO_MUTATION, {
    onCompleted: () => {
      toast.success('Estado actualizado')
      setEstadoDialog({ open: false, id: null, estado: 'ACTIVO' })
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  // Helpers
  const helpers = {
    getUsuarioById: (id) => usuarios.find((u) => u.id === id) || null,

    getNombreUsuario: (id) => {
      const u = usuarios.find((x) => x.id === id)
      return u ? `${u.nombres} ${u.primer_apellido}`.trim() : `ID: ${id}`
    },

    getNombresResponsables: (ids = []) =>
      ids
        .map((id) => {
          const u = usuarios.find((x) => x.id === id)
          return u
            ? `${u.nombres} ${u.primer_apellido}`.trim()
            : `ID: ${id}`
        })
        .join(', '),

    getInfraAfectada: (evento) => {
      if (!evento?.infra_afectada) return '-'
      const infra = []

      evento.infra_afectada.forEach((item) => {
        if (item.id_data_center) {
          const dc = dataCenters.find((x) => x.id === item.id_data_center)
          if (dc) infra.push(`DC: ${dc.nombre}`)
        }
        if (item.id_servidor) {
          const s = servidores.find((x) => x.id === item.id_servidor)
          if (s) infra.push(`Servidor: ${s.nombre}`)
        }
        if (item.id_maquina) {
          const m = maquinas.find((x) => x.id === item.id_maquina)
          if (m) infra.push(`Máquina: ${m.nombre}`)
        }
      })

      return infra.join(', ') || '-'
    },

    formatDate: (dateStr) => {
      if (!dateStr) return '-'
      try {
        return new Date(dateStr).toLocaleDateString('es-BO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      } catch {
        return '-'
      }
    },
  }

  // Filtrado igual a Maquinas
  const filteredData = useMemo(() => {
    return showInactive
      ? eventos
      : eventos.filter((e) => e.estado === 'ACTIVO')
  }, [eventos, showInactive])

  // Columnas en formato Maquinas
  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 50,
      enableHiding: false,
    },
    { accessorKey: 'cod_evento', header: 'Código', size: 120 },
    { accessorKey: 'cod_tipo_evento', header: 'Tipo', size: 120 },
    { accessorKey: 'descripcion', header: 'Descripción', size: 250 },

    {
      accessorKey: 'fecha_evento',
      header: 'Fecha Evento',
      size: 150,
      Cell: ({ cell }) => helpers.formatDate(cell.getValue()),
    },

    {
      accessorKey: 'responsables',
      header: 'Responsables',
      size: 250,
      Cell: ({ cell }) => helpers.getNombresResponsables(cell.getValue()),
    },

    {
      accessorKey: 'infra_afectada',
      header: 'Infraestructura',
      size: 250,
      Cell: ({ row }) => helpers.getInfraAfectada(row.original),
    },

    {
      accessorKey: 'estado_evento',
      header: 'Estado Evento',
      size: 120,
      Cell: ({ cell }) => (
        <Chip
          size="small"
          label={cell.getValue()}
          color={cell.getValue() === 'INICIADO' ? 'success' : 'warning'}
        />
      ),
    },

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

    { accessorKey: 'cite', header: 'Cite', size: 100 },
    { accessorKey: 'solicitante', header: 'Solicitante', size: 150 },

    {
      accessorKey: 'fecha_creacion',
      header: 'Creado',
      size: 150,
      Cell: ({ cell }) => helpers.formatDate(cell.getValue()),
    },
    {
      accessorKey: 'usuario_creacion',
      header: 'Usuario Creación',
      size: 180,
      Cell: ({ cell }) => helpers.getNombreUsuario(cell.getValue()),
    },

    {
      accessorKey: 'fecha_modificacion',
      header: 'Modificado',
      size: 150,
      Cell: ({ cell }) => helpers.formatDate(cell.getValue()),
    },
    {
      accessorKey: 'usuario_modificacion',
      header: 'Usuario Modificación',
      size: 180,
      Cell: ({ cell }) => helpers.getNombreUsuario(cell.getValue()),
    },
  ], [eventos, usuariosData, infraData])

  // Configuración de tabla igual a Maquinas
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
            sx={{ backgroundColor: '#0F284D' }}
            onClick={(e) =>
              setExportMenu({ ...exportMenu, all: e.currentTarget })
            }
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

          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            sx={{ backgroundColor: '#0F284D' }}
            onClick={(e) =>
              setExportMenu({ ...exportMenu, page: e.currentTarget })
            }
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

          <Button
            disabled={selected.length === 0}
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            sx={{ backgroundColor: '#0F284D' }}
            onClick={(e) =>
              setExportMenu({ ...exportMenu, sel: e.currentTarget })
            }
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
    updateEvento({
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
      <Dialog
        open={estadoDialog.open}
        onClose={() => setEstadoDialog({ open: false, id: null })}
      >
        <DialogTitle>
          {estadoDialog.estado === 'ACTIVO'
            ? 'Desactivar Evento'
            : 'Activar Evento'}
        </DialogTitle>
        <DialogContent>
          ¿Deseas cambiar el estado del evento #{estadoDialog.id}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadoDialog({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button
            onClick={confirmarEstado}
            color={estadoDialog.estado === 'ACTIVO' ? 'error' : 'success'}
            variant="contained"
          >
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
          to={actionMenu.row ? routes.evento({ id: actionMenu.row.id }) : '#'}
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
              ? routes.editEvento({ id: actionMenu.row.id })
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
            {actionMenu.row?.estado === 'ACTIVO' ? (
              <DeleteIcon fontSize="small" color="error" />
            ) : (
              <CheckIcon fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText>
            {actionMenu.row?.estado === 'ACTIVO'
              ? 'Desactivar'
              : 'Activar'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default EventosList
