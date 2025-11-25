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
  useTheme,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import { Link, routes } from '@redwoodjs/router'
import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Role/RolesCell'
import {
  UPDATE_ROLE_MUTATION,
  GET_USUARIOS_QUERY,
  formatDateTime,
  truncate,
  formatEnum,
  exportToPDF,
  exportToExcel,
  exportToCSV,
} from 'src/lib/exporter/rolesExporter'

const RolesList = ({ roles = [] }) => {
  const theme = useTheme()

  if (!Array.isArray(roles)) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Error: Datos no válidos</Typography>
      </Box>
    )
  }

  const [deleteState, setDeleteState] = useState({ open: false, id: null })
  const [exportMenuAnchor, setExportMenuAnchor] = useState({
    all: null,
    page: null,
    selection: null,
  })
  const [showInactive, setShowInactive] = useState(false)
  const [usuariosMap, setUsuariosMap] = useState({})
  const [actionMenu, setActionMenu] = useState({
    anchorEl: null,
    row: null,
  })

  // Cargar usuarios
  useQuery(GET_USUARIOS_QUERY, {
    onCompleted: (data) => {
      const map = data.usuarios.reduce((acc, u) => {
        acc[u.id] = `${u.nombres} ${u.primer_apellido}`
        return acc
      }, {})
      setUsuariosMap(map)
    },
  })

  const [updateRole] = useMutation(UPDATE_ROLE_MUTATION, {
    onCompleted: () => {
      toast.success('Estado del rol actualizado')
      setDeleteState({ open: false, id: null })
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const getNombreUsuario = (id) =>
    id ? usuariosMap[id] || `(ID: ${id})` : 'N/A'

  const filteredRoles = useMemo(
    () =>
      showInactive ? roles : roles.filter((r) => r.estado === 'ACTIVO'),
    [roles, showInactive]
  )

  const getFormattedData = (rows, table) => {
    const visible = table
      .getVisibleLeafColumns()
      .filter(
        (c) => c.id !== 'mrt-row-actions' && c.id !== 'mrt-row-select'
      )

    const headers = visible.map((c) => c.columnDef.header)

    const data = rows.map((row) =>
      visible.map((col) => {
        const v = row.original[col.id]
        if (col.id.includes('fecha_')) return formatDateTime(v)
        if (col.id === 'estado') return formatEnum(v)
        if (
          col.id === 'usuario_creacion' ||
          col.id === 'usuario_modificacion'
        )
          return getNombreUsuario(v)
        return truncate(v, 100)
      })
    )

    return { headers, data }
  }

  const handleExport = (type, rows, table) => {
    const { headers, data } = getFormattedData(rows, table)

    if (type === 'pdf') exportToPDF(headers, data, 'Reporte de Roles')
    if (type === 'excel')
      exportToExcel(headers, data, 'Reporte de Roles')
    if (type === 'csv') exportToCSV(headers, data, 'Reporte de Roles')
  }

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      { accessorKey: 'nombre', header: 'Nombre', size: 150 },
      { accessorKey: 'cod_tipo_rol', header: 'Código Tipo', size: 120 },
      { accessorKey: 'descripcion', header: 'Descripción', size: 200 },
      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 100,
        Cell: ({ row }) => (
          <Chip
            label={formatEnum(row.original.estado)}
            color={
              row.original.estado === 'ACTIVO' ? 'success' : 'error'
            }
            size="small"
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
        Cell: ({ cell }) => getNombreUsuario(cell.getValue()),
      },
      {
        accessorKey: 'fecha_modificacion',
        header: 'Modificado',
        size: 150,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      {
        accessorKey: 'usuario_modificacion',
        header: 'Modificado por',
        size: 150,
        Cell: ({ cell }) => getNombreUsuario(cell.getValue()),
      },
    ],
    [usuariosMap]
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredRoles,
    enableRowSelection: true,
    enableRowActions: true,

    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: {
        id: false,
      },
    },

    muiTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: {
        cursor: 'pointer',
        backgroundColor: row.getIsSelected()
          ? 'rgba(25,118,210,0.08)'
          : undefined,
      },
    }),

    // --- MENU DE ACCIONES ---
    renderRowActions: ({ row }) => (
      <Tooltip title="Acciones">
        <IconButton
          size="small"
          onClick={(e) =>
            setActionMenu({ anchorEl: e.currentTarget, row: row.original })
          }
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ),

    // --- BOTONES SUPERIORES ---
    renderTopToolbarCustomActions: ({ table }) => {
      const selected = table.getSelectedRowModel().rows
      const hasSel = selected.length > 0

      return (
        <Box sx={{ display: 'flex', gap: 2, p: 1, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={() => setShowInactive(!showInactive)}
              />
            }
            label="Mostrar inactivos"
          />

          {/* Exportar todos */}
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            sx={{ backgroundColor: theme.palette.primary.main }}
            disabled={table.getPrePaginationRowModel().rows.length === 0}
            onClick={(e) =>
              setExportMenuAnchor({
                ...exportMenuAnchor,
                all: e.currentTarget,
              })
            }
          >
            Exportar Todos
          </Button>

          <Menu
            anchorEl={exportMenuAnchor.all}
            open={Boolean(exportMenuAnchor.all)}
            onClose={() =>
              setExportMenuAnchor({ ...exportMenuAnchor, all: null })
            }
          >
            <MenuItem
              onClick={() => {
                handleExport(
                  'pdf',
                  table.getPrePaginationRowModel().rows,
                  table
                )
                setExportMenuAnchor({ ...exportMenuAnchor, all: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport(
                  'excel',
                  table.getPrePaginationRowModel().rows,
                  table
                )
                setExportMenuAnchor({ ...exportMenuAnchor, all: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport(
                  'csv',
                  table.getPrePaginationRowModel().rows,
                  table
                )
                setExportMenuAnchor({ ...exportMenuAnchor, all: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>

          {/* Exportar selección */}
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            disabled={!hasSel}
            sx={{ backgroundColor: theme.palette.primary.main }}
            onClick={(e) =>
              setExportMenuAnchor({
                ...exportMenuAnchor,
                selection: e.currentTarget,
              })
            }
          >
            Exportar Selección ({selected.length})
          </Button>

          <Menu
            anchorEl={exportMenuAnchor.selection}
            open={Boolean(exportMenuAnchor.selection)}
            onClose={() =>
              setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
            }
          >
            <MenuItem
              onClick={() => {
                handleExport('pdf', selected, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport('excel', selected, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport('csv', selected, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>
        </Box>
      )
    },
  })

  const confirmarDesactivacion = () => {
    updateRole({
      variables: {
        id: deleteState.id,
        input: {
          estado: 'INACTIVO',
          fecha_modificacion: new Date().toISOString(),
        },
      },
    })
  }

  return (
    <Box sx={{ p: 1 }}>
      <MaterialReactTable table={table} />

      {/* --- MENU DE ACCIONES POR FILA --- */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={
            actionMenu.row ? routes.role({ id: actionMenu.row.id }) : '#'
          }
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={
            actionMenu.row
              ? routes.editRole({ id: actionMenu.row.id })
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
              setDeleteState({
                open: true,
                id: actionMenu.row.id,
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

      {/* --- DIALOGO --- */}
      <Dialog
        open={deleteState.open}
        onClose={() => setDeleteState({ open: false, id: null })}
      >
        <DialogTitle>Confirmar Desactivación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Desea desactivar el rol {deleteState.id}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmarDesactivacion}
          >
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RolesList
