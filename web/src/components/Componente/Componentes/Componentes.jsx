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
  InfoOutlined as InfoOutlinedIcon,
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
} from 'src/lib/exporter/componentesExporter'

import { QUERY as QUERY_COMPONENTES } from 'src/components/Componente/ComponentesCell'

/* ----------------------- QUERIES ----------------------- */

const QUERY_SISTEMAS = gql`
  query GetSistemasForComponentesList {
    sistemas {
      id
      nombre
    }
  }
`

const QUERY_USUARIOS = gql`
  query GetUsuariosForComponentesList {
    usuarios {
      id
      nombres
      primer_apellido
    }
  }
`

const QUERY_PARAMETROS = gql`
  query ParametrosComponentes {
    parametros {
      codigo
      nombre
      grupo
    }
  }
`

const UPDATE_COMPONENTE_MUTATION = gql`
  mutation UpdateComponente($id: Int!, $input: UpdateComponenteInput!) {
    updateComponente(id: $id, input: $input) {
      id
      estado
    }
  }
`

/* ----------------------- HELPERS ----------------------- */

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

const truncate = (text, length = 50) => {
  if (!text) return 'N/A'
  return text.length > length ? `${text.substring(0, length)}...` : text
}

const parseTecnologia = (value) => {
  try {
    if (!value) return []
    if (typeof value === 'string') {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : [parsed]
    }
    return Array.isArray(value) ? value : [value]
  } catch {
    return []
  }
}

const getTechColor = (codigo) => {
  if (!codigo) return 'default'
  if (codigo.includes('FRONTEND')) return 'primary'
  if (codigo.includes('BACKEND')) return 'secondary'
  if (codigo.includes('DATABASE')) return 'success'
  if (codigo.includes('CLOUD')) return 'info'
  return 'warning'
}

/* ----------------------- COMPONENT ----------------------- */

const ComponentesList = ({ componentes = [] }) => {
  const { data: sistemasData } = useQuery(QUERY_SISTEMAS)
  const { data: usuariosData } = useQuery(QUERY_USUARIOS)
  const { data: paramData } = useQuery(QUERY_PARAMETROS)

  const [showInactive, setShowInactive] = useState(false)
  const [exportMenu, setExportMenu] = useState({ all: null, page: null, sel: null })
  const [estadoDialog, setEstadoDialog] = useState({ open: false, id: null, estado: 'ACTIVO' })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })

  const [updateComponente] = useMutation(UPDATE_COMPONENTE_MUTATION, {
    onCompleted: () => {
      toast.success('Estado actualizado')
      setEstadoDialog({ open: false, id: null, estado: 'ACTIVO' })
    },
    onError: (err) => toast.error(err.message),
    refetchQueries: [{ query: QUERY_COMPONENTES }],
    awaitRefetchQueries: true,
  })

  /* ------------ MAPEO DE PARAMETROS ----------- */

  const helpers = {
    getNombreSistema: (id) => {
      const s = sistemasData?.sistemas?.find((x) => x.id === id)
      return s ? s.nombre : id
    },

    getNombreUsuario: (id) => {
      const u = usuariosData?.usuarios?.find((x) => x.id === id)
      return u ? `${u.nombres} ${u.primer_apellido}` : id
    },

    getNombreEntorno: (codigo) => {
      const p = paramData?.parametros?.find(
        (x) => x.grupo === 'ENTORNO' && x.codigo === codigo
      )
      return p?.nombre || codigo
    },

    getNombreCategoria: (codigo) => {
      const p = paramData?.parametros?.find(
        (x) => x.grupo === 'CATEGORIA_COMPONENTE' && x.codigo === codigo
      )
      return p?.nombre || codigo
    },
  }

  const filteredData = useMemo(() => {
    if (!Array.isArray(componentes)) return []
    return showInactive
      ? componentes.filter((c) => c.estado === 'INACTIVO')
      : componentes.filter((c) => c.estado === 'ACTIVO')
  }, [componentes, showInactive])

  /* ----------------------- COLUMNS ----------------------- */

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },

    {
      accessorKey: 'id_sistema',
      header: 'Sistema',
      // NO size: permite auto ajuste
      Cell: ({ cell }) => {
        const nombre = helpers.getNombreSistema(cell.getValue())
        return <Tooltip title={nombre}><span>{truncate(nombre, 28)}</span></Tooltip>
      },
    },

    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'dominio', header: 'Dominio' },
    { accessorKey: 'descripcion', header: 'Descripción' },

    {
      accessorKey: 'cod_entorno',
      header: 'Entorno',
      size: 90,
      Cell: ({ cell }) => helpers.getNombreEntorno(cell.getValue()),
    },

    {
      accessorKey: 'cod_categoria',
      header: 'Categoría',
      size: 110,
      Cell: ({ cell }) => helpers.getNombreCategoria(cell.getValue()),
    },

    { accessorKey: 'gitlab_repo', header: 'GitLab Repo', size: 130 },
    { accessorKey: 'gitlab_rama', header: 'GitLab Rama', size: 80 },

    {
      accessorKey: 'tecnologia',
      header: 'Tecnología',
      size: 200,
      Cell: ({ cell }) => {
        const tecnologias = parseTecnologia(cell.getValue())
        if (!tecnologias.length) {
          return (
            <Chip
              size="small"
              label="Sin tecnologías"
              variant="outlined"
              icon={<InfoOutlinedIcon fontSize="small" />}
            />
          )
        }
        return (
          <Stack direction="row" flexWrap="wrap" spacing={0.5}>
            {tecnologias.map((t, i) => (
              <Chip
                key={i}
                label={`${t.nombre}${t.version ? ` v${t.version}` : ''}`}
                size="small"
                variant="outlined"
                color={getTechColor(t.codigo)}
              />
            ))}
          </Stack>
        )
      },
    },

    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 80,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue() === 'ACTIVO' ? 'Activo' : 'Inactivo'}
          size="small"
          color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'}
        />
      ),
    },

    {
      accessorKey: 'fecha_creacion',
      header: 'Creación',
      Cell: ({ cell }) => formatDate(cell.getValue()),
    },

    {
      accessorKey: 'usuario_creacion',
      header: 'Creado por',
      Cell: ({ cell }) => {
        const nombre = helpers.getNombreUsuario(cell.getValue())
        return <Tooltip title={nombre}><span>{truncate(nombre, 20)}</span></Tooltip>
      },
    },

    {
      accessorKey: 'fecha_modificacion',
      header: 'Modificación',
      Cell: ({ cell }) => formatDate(cell.getValue()),
    },

    {
      accessorKey: 'usuario_modificacion',
      header: 'Modificado por',
      Cell: ({ cell }) => {
        const nombre = helpers.getNombreUsuario(cell.getValue())
        return <Tooltip title={nombre}><span>{truncate(nombre, 20)}</span></Tooltip>
      },
    },
  ], [sistemasData, usuariosData, paramData])

  /* ----------------------- TABLE CONFIG ----------------------- */

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    layoutMode: 'semantic',

    // enable resizing and make it responsive to user resizing
    enableColumnResizing: true,
    columnResizeMode: 'onChange',

    // force compact display for internal selection/action columns
    displayColumnDefOptions: {
      'mrt-row-select': {
        size: 40,
        muiTableHeadCellProps: { sx: { width: 40, minWidth: 40, maxWidth: 40 } },
        muiTableBodyCellProps: { sx: { width: 40, minWidth: 40, maxWidth: 40 } },
      },
      'mrt-row-actions': {
        size: 48,
        muiTableHeadCellProps: { sx: { width: 48, minWidth: 48, maxWidth: 48 } },
        muiTableBodyCellProps: { sx: { width: 48, minWidth: 48, maxWidth: 48 } },
      },
    },

    // give initial sizing so MRT doesn't allocate huge leftover space
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnSizing: {
        // minimums for the internal cols
        'mrt-row-select': 40,
        'mrt-row-actions': 48,
      },
      columnVisibility: {
        id: false,
        // keep repo/branch hidden by default to reduce width, user can show
        gitlab_repo: false,
        gitlab_rama: false,
        fecha_creacion: false,
        usuario_creacion: false,
        fecha_modificacion: false,
        usuario_modificacion: false,
      },
    },

    muiTablePaperProps: {
      sx: { overflowX: 'auto' },
    },

    enableRowActions: true,
    enableRowSelection: true,

    // row action icon
    renderRowActions: ({ row }) => (
      <IconButton onClick={(e) => setActionMenu({ anchorEl: e.currentTarget, row: row.original })}>
        <MoreVertIcon />
      </IconButton>
    ),

    renderTopToolbarCustomActions: ({ table }) => {
      const selected = table.getSelectedRowModel().rows

      return (
        <Box sx={{ display: 'flex', gap: 2, p: 1, alignItems: 'center' }}>
          <FormControlLabel
            label="Mostrar inactivos"
            control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
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

          <Menu anchorEl={exportMenu.page} open={!!exportMenu.page} onClose={() => setExportMenu({ ...exportMenu, page: null })}>
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

          <Menu anchorEl={exportMenu.sel} open={!!exportMenu.sel} onClose={() => setExportMenu({ ...exportMenu, sel: null })}>
            <MenuItem onClick={() => { exportToPDF(selected, table, helpers); setExportMenu({ ...exportMenu, sel: null }) }}>PDF</MenuItem>
            <MenuItem onClick={() => { exportToExcel(selected, table, helpers); setExportMenu({ ...exportMenu, sel: null }) }}>Excel</MenuItem>
            <MenuItem onClick={() => { exportToCSV(selected, table, helpers); setExportMenu({ ...exportMenu, sel: null }) }}>CSV</MenuItem>
          </Menu>
        </Box>
      )
    },
  })

  /* ----------------------- CONFIRMAR ESTADO ----------------------- */

  const confirmarEstado = () => {
    updateComponente({
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
    <Box sx={{ p: 2 }}>
      <MaterialReactTable table={table} />

      {/* Dialog */}
      <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ open: false })}>
        <DialogTitle>
          {estadoDialog.estado === 'ACTIVO' ? 'Desactivar Componente' : 'Activar Componente'}
        </DialogTitle>

        <DialogContent>
          ¿Deseas cambiar el estado del componente #{estadoDialog.id}?
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

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.componente({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.editComponente({ id: actionMenu.row.id }) : '#'}
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
            {actionMenu.row?.estado === 'ACTIVO'
              ? <DeleteIcon fontSize="small" color="error" />
              : <CheckIcon fontSize="small" color="success" />}
          </ListItemIcon>
          <ListItemText>
            {actionMenu.row?.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ComponentesList
