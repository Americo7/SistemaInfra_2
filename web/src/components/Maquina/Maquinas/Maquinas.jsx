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
  Computer as VmIcon, // Icono para VM
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
  Typography, // Agregado Typography
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
} from 'src/lib/exporter/maquinasExporter'

import { QUERY } from 'src/components/Maquina/MaquinasCell'

// --- LOOKUPS ---
const QUERY_PARAMETRICAS = gql`
  query ParamMaquinasList {
    parametros(grupo: ["PLATAFORMA"]) {
      codigo
      nombre
      grupo
    }
  }
`

const QUERY_USUARIOS = gql`
  query UsersMaquinasList {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

const UPDATE_MAQUINA_MUTATION = gql`
  mutation UpdateMaquina($id: Int!, $input: UpdateMaquinaInput!) {
    updateMaquina(id: $id, input: $input) {
      id
      estado
    }
  }
`

const parseAlmacenamiento = (value) => {
  if (!value) return []
  try {
    const json = typeof value === 'string' ? JSON.parse(value) : value
    return Array.isArray(json) ? json : []
  } catch {
    return []
  }
}

const Maquinas = ({ maquinas }) => {
  const { data: paramData } = useQuery(QUERY_PARAMETRICAS)
  const { data: usuariosData } = useQuery(QUERY_USUARIOS)

  const [showInactive, setShowInactive] = useState(false)
  const [exportMenu, setExportMenu] = useState({ all: null, page: null, sel: null })
  const [estadoDialog, setEstadoDialog] = useState({ open: false, id: null, estado: 'ACTIVO' })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })

  const [updateMaquina] = useMutation(UPDATE_MAQUINA_MUTATION, {
    onCompleted: () => {
      toast.success('Estado actualizado')
      setEstadoDialog({ open: false, id: null, estado: 'ACTIVO' })
    },
    onError: (error) => toast.error(error.message),
    // Refetch para actualizar la lista inmediatamente
    refetchQueries: [{ query: QUERY }],
  })

  // --- MAPAS DE DATOS ---
  const plataformasMap = useMemo(() => {
    return (paramData?.parametros || []).reduce((acc, p) => {
      acc[p.codigo] = p.nombre
      return acc
    }, {})
  }, [paramData])

  const usuariosMap = useMemo(() => {
    return (usuariosData?.usuarios || []).reduce((acc, u) => {
      acc[u.id] = `${u.nombres} ${u.primer_apellido}`.trim()
      return acc
    }, {})
  }, [usuariosData])

  const helpers = {
    getNombrePlataforma: (codigo) => plataformasMap[codigo] || codigo || '-',
    getUsuarioById: (id) => usuariosData?.usuarios?.find((u) => u.id === id) || null,
    getUsuarioNombre: (id) => usuariosMap[id] || `ID: ${id}`,
  }

  const filteredData = useMemo(() => {
    if (!maquinas) return []
    // Switch OFF: solo ACTIVOS | Switch ON: solo INACTIVOS
    return maquinas.filter((m) =>
      showInactive ? m.estado === 'INACTIVO' : m.estado === 'ACTIVO'
    )
  }, [maquinas, showInactive])

  // Helper para formatear fecha
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

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 50,
      enableHiding: false,
    },
    // Identificación
    {
      accessorKey: 'nombre',
      header: 'Nombre VM',
      size: 180,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VmIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight={500}>
            {row.original.nombre}
          </Typography>
        </Box>
      )
    },
    {
      accessorKey: 'ip',
      header: 'IP',
      size: 130
    },

    // --- CAMPOS NUEVOS ---
    {
      accessorKey: 'proxmox_vmid',
      header: 'PVE ID',
      size: 90,
      Cell: ({ cell }) => cell.getValue() || '-'
    },
    {
      accessorKey: 'servidores.nombre', // Acceso directo a la relación
      header: 'Host Físico',
      size: 150,
      Cell: ({ row }) => row.original.servidores?.nombre || '-',
    },
    // ---------------------

    { accessorKey: 'so', header: 'SO', size: 130 },

    {
      accessorKey: 'cod_plataforma',
      header: 'Plataforma',
      size: 120,
      Cell: ({ cell }) => helpers.getNombrePlataforma(cell.getValue()),
    },
    {
      accessorKey: 'ram',
      header: 'RAM',
      size: 80,
      Cell: ({ cell }) => `${cell.getValue()} GB`,
    },
    {
      accessorKey: 'almacenamiento',
      header: 'Discos',
      size: 140,
      Cell: ({ row }) => {
        const discos = parseAlmacenamiento(row.original.almacenamiento)
        return (
          <Stack spacing={0.5} direction="row" flexWrap="wrap" gap={0.5}>
            {discos.length > 0 ? (
              discos.map((d, i) => (
                <Chip
                  key={i}
                  size="small"
                  label={`D${d.Disco}: ${d.Valor}GB`}
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 22 }}
                />
              ))
            ) : (
              <Chip size="small" label="Sin discos" variant="outlined" sx={{ fontSize: '0.75rem', height: 20 }} />
            )}
          </Stack>
        )
      },
    },
    {
      accessorKey: 'cpu',
      header: 'CPUs',
      size: 80,
      Cell: ({ cell }) => `${cell.getValue()} vCores`,
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
    // Campos de auditoría
    {
      accessorKey: 'fecha_creacion',
      header: 'Fecha Creación',
      size: 150,
      Cell: ({ cell }) => formatDate(cell.getValue()),
    },
    {
      accessorKey: 'usuario_creacion',
      header: 'Creado por',
      size: 150,
      Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()),
    },
    {
      accessorKey: 'fecha_modificacion',
      header: 'Fecha Modificación',
      size: 150,
      Cell: ({ cell }) => formatDate(cell.getValue()),
    },
    {
      accessorKey: 'usuario_modificacion',
      header: 'Modificado por',
      size: 150,
      Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()),
    },
  ], [paramData, usuariosData, plataformasMap, usuariosMap])

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    enableRowSelection: true,
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      // Ocultar columna ID y campos de auditoría por defecto
      columnVisibility: {
        id: false,
        fecha_creacion: false,
        usuario_creacion: false,
        fecha_modificacion: false,
        usuario_modificacion: false,
      },
    },

    renderRowActions: ({ row }) => (
      <>
        <Tooltip title="Acciones">
          <IconButton
            onClick={(e) => setActionMenu({ anchorEl: e.currentTarget, row: row.original })}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </>
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
            sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
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
    updateMaquina({
      variables: {
        id: estadoDialog.id,
        input: {
          estado: estadoDialog.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
          usuario_modificacion: 1,
        },
      },
    })
  }

  return (
    <Box sx={{ px: 0, py: 0 }}>
      <MaterialReactTable table={table} />

      <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ open: false })}>
        <DialogTitle>
          {estadoDialog.estado === 'ACTIVO' ? 'Desactivar Máquina' : 'Activar Máquina'}
        </DialogTitle>
        <DialogContent>
          ¿Deseas cambiar el estado de la máquina #{estadoDialog.id}?
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

      {/* Menú de acciones por fila */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.maquina({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.editMaquina({ id: actionMenu.row.id }) : '#'}
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

export default Maquinas