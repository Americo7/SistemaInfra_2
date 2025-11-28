import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  FileDownload as FileDownloadIcon,
  MoreVert as MoreVertIcon,
  Computer as MachineIcon,
  Storage as ServerIcon,
  Dns as ClusterIcon,
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
  Avatar,
  Typography,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

// Asegúrate de crear este archivo o apuntar al genérico si tienes uno
import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
} from 'src/lib/exporter/componentesExporter'

import { QUERY as QUERY_CLUSTER_NODOS } from 'src/components/ClusterNodo/ClusterNodosCell'

/* ----------------------- QUERIES & MUTATIONS ----------------------- */

const UPDATE_CLUSTER_NODO_MUTATION = gql`
  mutation UpdateClusterNodo($id: Int!, $input: UpdateClusterNodoInput!) {
    updateClusterNodo(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_CLUSTER_NODO_MUTATION = gql`
  mutation DeleteClusterNodoMutation($id: Int!) {
    deleteClusterNodo(id: $id) {
      id
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

/* ----------------------- COMPONENT ----------------------- */

const ClusterNodosList = ({ clusterNodos = [] }) => {
  const [showInactive, setShowInactive] = useState(false)
  const [exportMenu, setExportMenu] = useState({ all: null, page: null, sel: null })

  // Estado para el diálogo de Activar/Desactivar
  const [estadoDialog, setEstadoDialog] = useState({ open: false, id: null, estado: 'ACTIVO' })
  // Estado para el diálogo de Eliminar (Hard Delete)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, nombre: '' })

  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })

  // Mutation para cambiar estado
  const [updateClusterNodo] = useMutation(UPDATE_CLUSTER_NODO_MUTATION, {
    onCompleted: () => {
      toast.success('Estado del nodo actualizado')
      setEstadoDialog({ open: false, id: null, estado: 'ACTIVO' })
    },
    onError: (err) => toast.error(err.message),
    refetchQueries: [{ query: QUERY_CLUSTER_NODOS }],
    awaitRefetchQueries: true,
  })

  // Mutation para eliminar definitivamente
  const [deleteClusterNodo] = useMutation(DELETE_CLUSTER_NODO_MUTATION, {
    onCompleted: () => {
      toast.success('Nodo eliminado correctamente')
      setDeleteDialog({ open: false, id: null, nombre: '' })
    },
    onError: (err) => toast.error(err.message),
    refetchQueries: [{ query: QUERY_CLUSTER_NODOS }],
    awaitRefetchQueries: true,
  })

  /* ------------ FILTRO LOCAL DE INACTIVOS ----------- */

  const filteredData = useMemo(() => {
    if (!Array.isArray(clusterNodos)) return []
    return showInactive
      ? clusterNodos.filter((c) => c.estado === 'INACTIVO')
      : clusterNodos.filter((c) => c.estado === 'ACTIVO')
  }, [clusterNodos, showInactive])

  /* ----------------------- COLUMNS ----------------------- */

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },

    {
      accessorKey: 'nombre',
      header: 'Nombre del Nodo',
      Cell: ({ cell }) => <span style={{ fontWeight: 600 }}>{cell.getValue()}</span>,
    },

    {
      id: 'cluster',
      accessorFn: (row) => row.cluster?.nombre || row.clusterId,
      header: 'Cluster',
      Cell: ({ cell }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <ClusterIcon fontSize="small" color="primary" />
          <span>{cell.getValue()}</span>
        </Stack>
      ),
    },

    {
      accessorKey: 'nodoTipo',
      header: 'Tipo',
      size: 100,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue()}
          size="small"
          variant="outlined"
          color={cell.getValue() === 'FISICO' ? 'warning' : 'info'}
          sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
        />
      ),
    },

    {
      id: 'recurso',
      header: 'Recurso Asignado',
      accessorFn: (row) => {
        if (row.nodoTipo === 'VIRTUAL' && row.maquina) return row.maquina.nombre
        if (row.nodoTipo === 'FISICO' && row.servidor) return row.servidor.nombre
        return 'Sin Asignar'
      },
      Cell: ({ row }) => {
        const tipo = row.original.nodoTipo
        const nombre =
          tipo === 'VIRTUAL'
            ? row.original.maquina?.nombre
            : row.original.servidor?.nombre

        if (!nombre) return <span style={{ color: '#999', fontStyle: 'italic' }}>Sin asignar</span>

        return (
          <Stack direction="row" spacing={1} alignItems="center">
            {tipo === 'VIRTUAL' ? (
              <MachineIcon fontSize="small" color="info" />
            ) : (
              <ServerIcon fontSize="small" color="warning" />
            )}
            <span>{nombre}</span>
          </Stack>
        )
      },
    },

    { accessorKey: 'rol', header: 'Rol' },

    {
      accessorKey: 'identity_key',
      header: 'Identificador',
      Cell: ({ cell }) => {
        const val = cell.getValue()
        return val ? <Tooltip title={val}><span>{truncate(val, 15)}</span></Tooltip> : '-'
      }
    },

    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 90,
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
      accessorKey: 'fecha_modificacion',
      header: 'Modificación',
      Cell: ({ cell }) => formatDate(cell.getValue()),
    },
  ], [])

  /* ----------------------- TABLE CONFIG ----------------------- */

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    layoutMode: 'semantic',
    enableColumnResizing: true,
    columnResizeMode: 'onChange',

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

    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: {
        id: false,
        identity_key: false,
        fecha_creacion: false,
        fecha_modificacion: false,
      },
    },

    muiTablePaperProps: {
      sx: { overflowX: 'auto' },
    },

    enableRowActions: true,
    enableRowSelection: true,

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
            <MenuItem onClick={() => { exportToPDF(table.getPrePaginationRowModel().rows, table, {}); setExportMenu({ ...exportMenu, all: null }) }}>PDF</MenuItem>
            <MenuItem onClick={() => { exportToExcel(table.getPrePaginationRowModel().rows, table, {}); setExportMenu({ ...exportMenu, all: null }) }}>Excel</MenuItem>
            <MenuItem onClick={() => { exportToCSV(table.getPrePaginationRowModel().rows, table, {}); setExportMenu({ ...exportMenu, all: null }) }}>CSV</MenuItem>
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
            <MenuItem onClick={() => { exportToPDF(table.getRowModel().rows, table, {}); setExportMenu({ ...exportMenu, page: null }) }}>PDF</MenuItem>
            <MenuItem onClick={() => { exportToExcel(table.getRowModel().rows, table, {}); setExportMenu({ ...exportMenu, page: null }) }}>Excel</MenuItem>
            <MenuItem onClick={() => { exportToCSV(table.getRowModel().rows, table, {}); setExportMenu({ ...exportMenu, page: null }) }}>CSV</MenuItem>
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
            <MenuItem onClick={() => { exportToPDF(selected, table, {}); setExportMenu({ ...exportMenu, sel: null }) }}>PDF</MenuItem>
            <MenuItem onClick={() => { exportToExcel(selected, table, {}); setExportMenu({ ...exportMenu, sel: null }) }}>Excel</MenuItem>
            <MenuItem onClick={() => { exportToCSV(selected, table, {}); setExportMenu({ ...exportMenu, sel: null }) }}>CSV</MenuItem>
          </Menu>
        </Box>
      )
    },
  })

  /* ----------------------- ACTIONS ----------------------- */

  const confirmarCambioEstado = () => {
    updateClusterNodo({
      variables: {
        id: estadoDialog.id,
        input: {
          estado: estadoDialog.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
          // fecha_modificacion se maneja en el servicio
        },
      },
    })
  }

  const confirmarEliminacion = () => {
    deleteClusterNodo({
      variables: { id: deleteDialog.id }
    })
  }

  return (
    <Box sx={{ p: 2 }}>
      <MaterialReactTable table={table} />

      {/* --- DIALOG: CAMBIO DE ESTADO --- */}
      <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ open: false })}>
        <DialogTitle>
          {estadoDialog.estado === 'ACTIVO' ? 'Desactivar Nodo' : 'Activar Nodo'}
        </DialogTitle>
        <DialogContent>
          ¿Deseas cambiar el estado del nodo #{estadoDialog.id}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadoDialog({ open: false })}>Cancelar</Button>
          <Button
            onClick={confirmarCambioEstado}
            variant="contained"
            color={estadoDialog.estado === 'ACTIVO' ? 'error' : 'success'}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG: ELIMINAR --- */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
        <DialogTitle>Eliminar Nodo</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar permanentemente el nodo <strong>{deleteDialog.nombre}</strong> (ID: {deleteDialog.id})? <br/>
          Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Cancelar</Button>
          <Button onClick={confirmarEliminacion} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MENU DE ACCIONES --- */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.clusterNodo({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.editClusterNodo({ id: actionMenu.row.id }) : '#'}
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
              ? <CheckIcon fontSize="small" color="warning" />
              : <CheckIcon fontSize="small" color="success" />}
          </ListItemIcon>
          <ListItemText>
            {actionMenu.row?.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
          </ListItemText>
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

export default ClusterNodosList