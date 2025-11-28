import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useQuery, useMutation } from '@redwoodjs/web'
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
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
} from 'src/lib/exporter/servidoresExporter'

import { QUERY } from 'src/components/Servidor/ServidorsCell'

const UPDATE_SERVIDOR_MUTATION = gql`
  mutation UpdateServidorMutation_fromServidores(
    $id: Int!
    $input: UpdateServidorInput!
  ) {
    updateServidor(id: $id, input: $input) {
      id
      estado
    }
  }
`

const GET_USUARIOS_QUERY = gql`
  query GetUsuariosForServidoresList {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

const GET_PARAMETROS = gql`
  query GetParametrosInventario {
    parametros(grupo: ["AGETIC_INV", "TIPO_SERV"]) {
      codigo
      nombre
    }
  }
`

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('es-BO', {
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

const getEstadoColor = (estadoOperativo) => {
  switch (estadoOperativo) {
    case 'OPERATIVO': return '#4caf50'
    case 'online': return '#4caf50'
    case 'MANTENIMIENTO': return '#ff9800'
    case 'DISPONIBLE': return '#2196f3'
    case 'FALLA': return '#f44336'
    case 'APAGADO': return '#9e9e9e'
    case 'FUERA_SERVICIO': return '#d32f2f'
    default: return '#e0e0e0'
  }
}

const formatEnum = (value) => {
  if (!value) return '-'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

const ServidorsList = ({ servidores = [] }) => {
  const [showInactive, setShowInactive] = useState(false)
  const [exportMenu, setExportMenu] = useState({ all: null, page: null, sel: null })
  const [estadoDialog, setEstadoDialog] = useState({ open: false, id: null, estado: 'ACTIVO' })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })

  const { data: parametrosData } = useQuery(GET_PARAMETROS)
  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)

  const [updateServidor] = useMutation(UPDATE_SERVIDOR_MUTATION, {
    onCompleted: () => {
      toast.success('Estado actualizado')
      setEstadoDialog({ open: false, id: null, estado: 'ACTIVO' })
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const helpers = {
    getNombreServidorPadre: (sv) => {
      if (sv.servidores_padre?.nombre) return sv.servidores_padre.nombre
      return sv.id_padre ? `ID: ${sv.id_padre}` : '-'
    },
    getNombreDataCenter: (sv) => {
      if (sv.data_centers?.nombre) return sv.data_centers.nombre
      return sv.id_data_center ? `ID: ${sv.id_data_center}` : '-'
    },
    getNombreParametro: (codigo) => {
      if (!codigo || !parametrosData?.parametros) return codigo || '-'
      const p = parametrosData.parametros.find((pp) => pp.codigo === codigo)
      return p ? p.nombre : codigo
    },
    getNombreUsuario: (id) => {
      if (!id) return '-'
      const u = usuariosData?.usuarios?.find((uu) => uu.id === id)
      return u ? `${u.nombres} ${u.primer_apellido}` : `ID: ${id}`
    },
  }

  const filteredServidores = useMemo(() => {
    if (!servidores) return []
    return servidores.filter((s) =>
      showInactive ? s.estado === 'INACTIVO' : s.estado === 'ACTIVO'
    )
  }, [servidores, showInactive])

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 50, enableHiding: false },
      { accessorKey: 'nombre', header: 'Nombre Host', size: 150 },

      { accessorKey: 'ip_primaria', header: 'IP Primaria', size: 120 },
      { accessorKey: 'sistema_operativo', header: 'OS', size: 150 },

      {
        accessorKey: 'cod_inventario_agetic',
        header: 'Código Inventario',
        size: 150,
        Cell: ({ cell }) => helpers.getNombreParametro(cell.getValue()),
      },

      { accessorKey: 'serie', header: 'Serie', size: 120 },
      { accessorKey: 'marca', header: 'Marca', size: 100 },
      { accessorKey: 'modelo', header: 'Modelo', size: 100 },

      {
        accessorKey: 'ram',
        header: 'RAM',
        size: 80,
        Cell: ({ cell }) => `${cell.getValue()} GB`,
      },
      {
        accessorKey: 'almacenamiento',
        header: 'Almacenamiento',
        size: 120,
        Cell: ({ cell }) => `${cell.getValue()} GB`,
      },

      {
        accessorKey: 'data_centers.nombre',
        header: 'Data Center',
        size: 150,
        Cell: ({ row }) => helpers.getNombreDataCenter(row.original),
      },

      {
        accessorKey: 'cod_tipo_servidor',
        header: 'Tipo Servidor',
        size: 120,
        Cell: ({ cell }) => helpers.getNombreParametro(cell.getValue()),
      },

      {
        accessorKey: 'servidores_padre.nombre',
        header: 'Servidor Padre',
        size: 150,
        Cell: ({ row }) => helpers.getNombreServidorPadre(row.original),
      },

      {
        accessorKey: 'estado_operativo',
        header: 'Estado Operativo',
        size: 150,
        Cell: ({ row }) => (
          <Chip
            label={formatEnum(row.original.estado_operativo)}
            size="small"
            sx={{
              backgroundColor: getEstadoColor(row.original.estado_operativo),
              color: '#fff',
              fontWeight: 'bold',
            }}
          />
        ),
      },

      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 90,
        Cell: ({ cell }) => (
          <Chip
            size="small"
            label={cell.getValue() === 'ACTIVO' ? 'Activo' : 'Inactivo'}
            color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'}
          />
        ),
      },

      /* ========== AUDITORÍA (OCULTA POR DEFECTO) ========== */
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
    [parametrosData, usuariosData]
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredServidores,

    enableRowActions: true,
    enableRowSelection: true,

    initialState: {
      density: 'compact',
      showGlobalFilter: true,

      columnVisibility: {
        id: false,
        cod_inventario_agetic:false,
        serie: false,
        estado: false,
        fecha_creacion: false,
        usuario_creacion: false,
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

          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={(e) => setExportMenu({ ...exportMenu, all: e.currentTarget })}
            sx={{ backgroundColor: '#0F284D' }}
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

  const confirmarEstado = () => {
    updateServidor({
      variables: {
        id: estadoDialog.id,
        input: {
          estado: estadoDialog.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
          usuario_modificacion: 1,
          fecha_modificacion: new Date().toISOString(),
        },
      },
    })
  }

  return (
    <Box sx={{ px: 0, py: 0 }}>
      <MaterialReactTable table={table} />

      <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ open: false })}>
        <DialogTitle>
          {estadoDialog.estado === 'ACTIVO' ? 'Desactivar Servidor' : 'Activar Servidor'}
        </DialogTitle>
        <DialogContent>
          ¿Deseas cambiar el estado del servidor #{estadoDialog.id}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadoDialog({ open: false })}>Cancelar</Button>
          <Button
            onClick={confirmarEstado}
            color={estadoDialog.estado === 'ACTIVO' ? 'error' : 'success'}
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.servidor({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.editServidor({ id: actionMenu.row.id }) : '#'}
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
            {actionMenu.row?.estado === 'ACTIVO' ? 'Eliminar' : 'Activar'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ServidorsList
