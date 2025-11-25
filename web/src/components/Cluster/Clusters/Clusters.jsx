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
} from '@mui/material'

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'

import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
} from 'src/lib/exporter/clustersExporter'

import { QUERY as QUERY_CLUSTERS } from 'src/components/Cluster/ClustersCell'

const QUERY_USUARIOS = gql`
  query GetUsuariosListClusters {
    usuarios {
      id
      nombres
      primer_apellido
    }
  }
`

const UPDATE_CLUSTER_MUTATION = gql`
  mutation UpdateClusterMutation1($id: Int!, $input: UpdateClusterInput!) {
    updateCluster(id: $id, input: $input) {
      id
      estado
    }
  }
`

/* ----------------------------------------------------------
   FORMATEADORES
---------------------------------------------------------- */
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

const ClustersList = ({ clusters = [] }) => {
  const { data: usuariosData } = useQuery(QUERY_USUARIOS)

  const [showInactive, setShowInactive] = useState(false)
  const [exportMenu, setExportMenu] = useState({ all: null, page: null, sel: null })
  const [estadoDialog, setEstadoDialog] = useState({ open: false, id: null, estado: 'ACTIVO' })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })

  const [updateCluster] = useMutation(UPDATE_CLUSTER_MUTATION, {
    onCompleted: () => {
      toast.success('Estado actualizado')
      setEstadoDialog({ open: false, id: null, estado: 'ACTIVO' })
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_CLUSTERS }],
  })

  /* ----------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */
  const helpers = {
    getAutor: (id) => {
      if (!id) return '-'
      const u = usuariosData?.usuarios?.find((x) => x.id === id)
      return u ? `${u.nombres} ${u.primer_apellido}` : `ID:${id}`
    },

    getTipoClusterNombre: (codigo) => {
      if (!codigo) return '-'
      if (codigo === 'PX') return 'Proxmox'
      if (codigo === 'K8S') return 'Kubernetes'
      return codigo
    },

    getEndpoint: (cluster) => {
      if (cluster.cod_tipo_cluster === 'PX')
        return cluster.proxmox_endpoint?.nombre || '—'
      if (cluster.cod_tipo_cluster === 'K8S')
        return cluster.k8s_endpoint?.nombre || '—'
      return '—'
    },
  }

  /* ----------------------------------------------------------
     FILTRO
  ---------------------------------------------------------- */
  const filteredData = useMemo(() => {
    if (!clusters) return []
    return clusters.filter((c) =>
      showInactive ? c.estado === 'INACTIVO' : c.estado === 'ACTIVO'
    )
  }, [clusters, showInactive])

  /* ----------------------------------------------------------
     COLUMNAS
  ---------------------------------------------------------- */
  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 60,
      enableHiding: true,
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      size: 150,
      Cell: ({ cell, row }) => (
        <Link
          to={routes.cluster({ id: row.original.id })}
          style={{ color: '#0F284D', fontWeight: 600, textDecoration: 'none' }}
        >
          {cell.getValue()}
        </Link>
      ),
    },
    {
      id: 'tipo_cluster',
      header: 'Tipo',
      size: 120,
      Cell: ({ row }) => helpers.getTipoClusterNombre(row.original.cod_tipo_cluster),
    },
    {
      id: 'endpoint',
      header: 'Endpoint',
      size: 150,
      Cell: ({ row }) => helpers.getEndpoint(row.original),
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      size: 200,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 110,
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
      header: 'F. Creación',
      size: 150,
      Cell: ({ cell }) => formatDate(cell.getValue()),
    },
    {
      accessorKey: 'usuario_creacion',
      header: 'Creado por',
      size: 150,
      Cell: ({ cell }) => helpers.getAutor(cell.getValue()),
    },
    {
      accessorKey: 'fecha_modificacion',
      header: 'F. Modificación',
      size: 150,
      Cell: ({ cell }) => formatDate(cell.getValue()),
    },
    {
      accessorKey: 'usuario_modificacion',
      header: 'Modificado por',
      size: 150,
      Cell: ({ cell }) => helpers.getAutor(cell.getValue()),
    },
  ], [usuariosData])

  /* ----------------------------------------------------------
     TABLA
  ---------------------------------------------------------- */
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
          onClick={(e) =>
            setActionMenu({ anchorEl: e.currentTarget, row: row.original })
          }
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
    ),

    /* ----------------------------------------------------------
       TOOLBAR SUPERIOR
    ---------------------------------------------------------- */
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

          {/* Exportar */}
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

          {/* Exportar página */}
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

          {/* Exportar selección */}
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

  /* ----------------------------------------------------------
     CONFIRMAR CAMBIO ESTADO
  ---------------------------------------------------------- */
  const confirmarEstado = () => {
    updateCluster({
      variables: {
        id: estadoDialog.id,
        input: {
          estado: estadoDialog.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
          usuario_modificacion: 1,
        },
      },
    })
  }

  /* ----------------------------------------------------------
     RENDER PRINCIPAL
  ---------------------------------------------------------- */
  return (
    <Box sx={{ px: 0, py: 0 }}>
      <MaterialReactTable table={table} />

      {/* DIALOGO DE ESTADO */}
      <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ open: false })}>
        <DialogTitle>
          {estadoDialog.estado === 'ACTIVO' ? 'Desactivar Cluster' : 'Activar Cluster'}
        </DialogTitle>
        <DialogContent>
          ¿Deseas cambiar el estado del cluster #{estadoDialog.id}?
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

      {/* MENÚ ACCIONES */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.cluster({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.editCluster({ id: actionMenu.row.id }) : '#'}
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
            {actionMenu.row?.estado === 'ACTIVO'
              ? <DeleteIcon fontSize="small" color="error" />
              : <CheckIcon fontSize="small" color="success" />}
          </ListItemIcon>

          <ListItemText>
            {actionMenu.row?.estado === 'ACTIVO' ? 'Eliminar' : 'Activar'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ClustersList
