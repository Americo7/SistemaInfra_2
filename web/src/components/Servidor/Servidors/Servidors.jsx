import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Computer as ServerIcon,
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as CsvIcon,
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
} from '@mui/icons-material'

import {
  Box,
  Chip,
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
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/servidoresExporter'

/* ------------------------------------------
   MUTACIONES
------------------------------------------ */
const UPDATE_SERVIDOR_MUTATION = gql`
  mutation UpdateServidor($id: Int!, $input: UpdateServidorInput!) {
    updateServidor(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_SERVIDOR_MUTATION = gql`
  mutation DeleteServidor($id: Int!) {
    deleteServidor(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindServidoresRefetch {
    servidores {
      id
      estado
    }
  }
`

/* ------------------------------------------
   HELPERS
------------------------------------------ */
const getStatusColor = (codigo) => {
  if (!codigo) return 'default'
  const c = codigo.toUpperCase()

  if (['OPERATIVO', 'ACTIVO', 'ONLINE', 'RUNNING'].includes(c)) return 'success'
  if (['FUERA_SERVICIO', 'BAJA', 'ERROR', 'STOPPED', 'OFFLINE'].includes(c)) return 'error'
  if (['MANTENIMIENTO', 'WARNING', 'RESTARTING'].includes(c)) return 'warning'

  return 'default'
}

const formatDate = (d) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleString('es-BO')
  } catch {
    return '-'
  }
}

/* ------------------------------------------
   COMPONENTE PRINCIPAL
------------------------------------------ */
const Servidores = ({ servidores, parametros, usuarios }) => {
  const theme = useTheme()

  /* -------------------------
     SELECCIÓN CONTROLADA
  -------------------------- */
  const [rowSelection, setRowSelection] = useState({})

  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  const [updateServidor] = useMutation(UPDATE_SERVIDOR_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const [deleteServidor] = useMutation(DELETE_SERVIDOR_MUTATION, {
    onError: (error) => toast.error(error.message),
    onCompleted: () => toast.success('Registros eliminados permanentemente.'),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  /* ------------------------------------------
     FILTRO ACTIVOS/INACTIVOS
  ------------------------------------------ */
  const filteredData = useMemo(() => {
    if (!servidores) return []
    return servidores.filter((s) =>
      showDeleted ? s.estado === 'INACTIVO' : s.estado === 'ACTIVO'
    )
  }, [servidores, showDeleted])

  /* ------------------------------------------
     MAPEOS
  ------------------------------------------ */
  const estadosOperativosMap = useMemo(() => {
    return (parametros || [])
      .filter((p) => p.grupo === 'ESTADO_OPERATIVO')
      .reduce((acc, p) => {
        acc[p.codigo] = p.nombre
        return acc
      }, {})
  }, [parametros])

  const usuariosMap = useMemo(() => {
    return (usuarios || []).reduce((acc, u) => {
      acc[u.id] = `${u.nombres} ${u.primer_apellido}`
      return acc
    }, {})
  }, [usuarios])

  const helpers = {
    getUsuarioNombre: (id) => usuariosMap[id] || `ID ${id}`,
    getNombreEstadoOperativo: (c) => estadosOperativosMap[c] || c || 'Desconocido',
  }

  /* ------------------------------------------
     SOFT DELETE / RESTAURAR
  ------------------------------------------ */
  const handleSoftDelete = (rows) => {
    rows.forEach((servidor) => {
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
      updateServidor({
        variables: { id: servidor.id, input: { estado: newState } },
      })
    })

    toast.success(
      `${rows.length} registro(s) ${showDeleted ? 'restaurado(s)' : 'desactivado(s)'}.`
    )

    setRowSelection({})
    closeAllDialogs()
  }

  /* ------------------------------------------
     HARD DELETE
  ------------------------------------------ */
  const handleHardDelete = (rows) => {
    if (!confirm(`¿Eliminar DEFINITIVAMENTE ${rows.length} registro(s)?`)) {
      closeAllDialogs()
      return
    }

    rows.forEach((servidor) => {
      deleteServidor({ variables: { id: servidor.id } })
    })

    toast.success('Registros eliminados permanentemente.')

    setRowSelection({})
    closeAllDialogs()
  }

  /* ------------------------------------------
     COLUMNS
  ------------------------------------------ */
  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },

      {
        accessorKey: 'nombre',
        header: 'Nombre Servidor',
        size: 180,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ServerIcon fontSize="small" color="primary" />
            {row.original.nombre}
          </Box>
        ),
      },

      { accessorKey: 'ip_primaria', header: 'IP', size: 120 },

      {
        accessorKey: 'ram',
        header: 'RAM',
        size: 90,
        Cell: ({ cell }) => `${cell.getValue()} GB`,
      },

      {
        accessorKey: 'almacenamiento',
        header: 'Disco',
        size: 90,
        Cell: ({ cell }) => `${cell.getValue()} GB`,
      },

      {
        accessorKey: 'data_centers',
        header: 'Data Center',
        size: 160,
        Cell: ({ row }) => row.original.data_centers?.[0]?.nombre || '—',
      },

      /* RELACIÓN NODOS */
      {
        accessorKey: 'nodos',
        header: 'Nodos',
        size: 180,
        Cell: ({ row }) => {
          const nodos = row.original.cluster_nodos
          if (!nodos?.length) return '—'
          return (
            <Stack spacing={0.3}>
              {nodos.map((n) => (
                <Link
                  key={n.id}
                  to={routes.clusterNodo({ id: n.id })}
                  style={{ textDecoration: 'none', color: theme.palette.primary.main }}
                >
                  {n.nombre}
                </Link>
              ))}
            </Stack>
          )
        },
      },

      /* RELACIÓN CLUSTERS */
      {
        accessorKey: 'clusters',
        header: 'Clusters',
        size: 180,
        Cell: ({ row }) => {
          const nodos = row.original.cluster_nodos
          if (!nodos?.length) return '—'
          return (
            <Stack spacing={0.3}>
              {nodos.map((n) => (
                <Link
                  key={n.cluster?.id}
                  to={routes.cluster({ id: n.cluster?.id })}
                  style={{ textDecoration: 'none', color: theme.palette.secondary.main }}
                >
                  {n.cluster?.nombre}
                </Link>
              ))}
            </Stack>
          )
        },
      },

      /* ESTADO OPERATIVO */
      {
        accessorKey: 'estadoOperativoInfo',
        header: 'Estado Operativo',
        size: 150,
        Cell: ({ row }) => {
          const info = row.original.estadoOperativoInfo
          return (
            <Chip
              size="small"
              label={info?.nombre || '—'}
              color={getStatusColor(info?.codigo)}
              sx={{ fontWeight: 'bold' }}
            />
          )
        },
      },

      /* ESTADO (OCULTO) */
      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 100,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'}
            size="small"
          />
        ),
      },

      /* AUDITORÍA (OCULTA) */
      {
        accessorKey: 'fecha_creacion',
        header: 'Creación',
        size: 150,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorKey: 'usuario_creacion',
        header: 'Creó',
        size: 150,
        Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()),
      },
      {
        accessorKey: 'fecha_modificacion',
        header: 'Modif.',
        size: 150,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorKey: 'usuario_modificacion',
        header: 'Modificó',
        size: 150,
        Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()),
      },
    ],
    [theme]
  )

  /* ------------------------------------------
     MRT CONFIG
  ------------------------------------------ */
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableRowVirtualization: true,

    /* SELECCIÓN CONTROLADA */
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,

    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: {
        id: false,
        estado: false,
        fecha_creacion: false,
        usuario_creacion: false,
        fecha_modificacion: false,
        usuario_modificacion: false,
      },
    },

    renderRowActions: ({ row }) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Ver Detalles">
          <IconButton component={Link} to={routes.servidor({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editServidor({ id: row.original.id })} size="small">
            <EditIcon fontSize="small" color="info" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  })

  /* ------------------------------------------
     EXPORTACIÓN
  ------------------------------------------ */
  const handleExport = (scope, suffix, format) => {
    let rows = []

    if (scope === 'page') {
      const { pageIndex, pageSize } = table.getState().pagination
      const allRows = table.getPrePaginationRowModel().rows
      rows = allRows.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)
    }

    if (scope === 'all') rows = table.getPrePaginationRowModel().rows
    if (scope === 'selected') rows = table.getSelectedRowModel().rows

    if (!rows.length) return toast.error('No hay datos para exportar')

    const visibleCols =
      table.getVisibleLeafColumns().filter((c) => !['mrt-row-actions', 'mrt-row-select', 'id'].includes(c.id))

    if (format === 'excel') exportToExcel(rows, visibleCols, helpers, suffix)
    if (format === 'pdf') exportToPDF(rows, visibleCols, helpers, suffix)
    if (format === 'csv') exportToCSV(rows, visibleCols, helpers, suffix)

    setExportMenuAnchorEl(null)
  }

  /* ------------------------------------------
     ACCIONES DEL LAYOUT
  ------------------------------------------ */
  const listActionsConfig = useMemo(() => {
    const selected = Object.keys(rowSelection).length

    return {
      showDeleted,
      selectedRowCount: selected,

      handleSwitchChange: (e) => setShowDeleted(e.target.checked),

      handleBulkAction: (e) => {
        const rows = table.getSelectedRowModel().rows.map((r) => r.original)

        if (showDeleted) {
          handleSoftDelete(rows)
        } else {
          setBulkMenuAnchorEl(e.currentTarget)
        }
      },

      bulkActionMenu: (
        <Menu
          anchorEl={bulkMenuAnchorEl}
          open={Boolean(bulkMenuAnchorEl)}
          onClose={closeAllDialogs}
        >
          <MenuItem
            onClick={() =>
              handleSoftDelete(table.getSelectedRowModel().rows.map((r) => r.original))
            }
          >
            <ListItemIcon>
              <SoftDeleteIcon fontSize="small" color="warning" />
            </ListItemIcon>
            Desactivar
          </MenuItem>

          <MenuItem
            onClick={() =>
              handleHardDelete(table.getSelectedRowModel().rows.map((r) => r.original))
            }
          >
            <ListItemIcon>
              <HardDeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Eliminar Definitivo
          </MenuItem>
        </Menu>
      ),

      handleExportClick: (e) => setExportMenuAnchorEl(e.currentTarget),

      exportMenu: (
        <Menu
          anchorEl={exportMenuAnchorEl}
          open={Boolean(exportMenuAnchorEl)}
          onClose={closeAllDialogs}
        >
          {/* EXCEL */}
          <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              EXCEL
            </Typography>
          </Box>

          <MenuItem onClick={() => handleExport('page', '-Pagina', 'excel')}>
            <ListItemIcon>
              <ExcelIcon fontSize="small" color="success" />
            </ListItemIcon>
            Página Actual
          </MenuItem>

          <MenuItem
            disabled={selected === 0}
            onClick={() => handleExport('selected', '-Seleccionados', 'excel')}
          >
            <ListItemIcon>
              <ExcelIcon fontSize="small" color="success" />
            </ListItemIcon>
            Selección ({selected})
          </MenuItem>

          <Divider />

          {/* PDF */}
          <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              PDF
            </Typography>
          </Box>

          <MenuItem onClick={() => handleExport('page', '-Pagina', 'pdf')}>
            <ListItemIcon>
              <PdfIcon fontSize="small" color="error" />
            </ListItemIcon>
            Página Actual
          </MenuItem>

          <MenuItem
            disabled={selected === 0}
            onClick={() => handleExport('selected', '-Seleccionados', 'pdf')}
          >
            <ListItemIcon>
              <PdfIcon fontSize="small" color="error" />
            </ListItemIcon>
            Selección ({selected})
          </MenuItem>

          <Divider />

          {/* CSV */}
          <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              CSV
            </Typography>
          </Box>

          <MenuItem onClick={() => handleExport('page', '-Pagina', 'csv')}>
            <ListItemIcon>
              <CsvIcon fontSize="small" color="info" />
            </ListItemIcon>
            Página Actual
          </MenuItem>

          <MenuItem
            disabled={selected === 0}
            onClick={() => handleExport('selected', '-Seleccionados', 'csv')}
          >
            <ListItemIcon>
              <CsvIcon fontSize="small" color="info" />
            </ListItemIcon>
            Selección ({selected})
          </MenuItem>
        </Menu>
      ),
    }
  }, [
    showDeleted,
    rowSelection,
    table,
    exportMenuAnchorEl,
    bulkMenuAnchorEl,
  ])

  return (
    <ScaffoldLayout
      title="Servidores"
      titleTo="servidores"
      groupTitle="Infraestructura"
      buttonLabel="Nuevo Servidor"
      buttonTo="newServidor"
      listActionsConfig={listActionsConfig}
    >
      <MaterialReactTable table={table} />
    </ScaffoldLayout>
  )
}

export default Servidores
