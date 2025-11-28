import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Computer as VmIcon,
  MoreVert as MoreVertIcon,
  // Iconos de exportación
  FileDownload as ExportIcon,
  PictureAsPdf as PdfIcon,
  TableView as CsvIcon,
  GridOn as ExcelIcon,
  KeyboardArrowDown as ArrowDownIcon,
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
  Divider,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

// IMPORTAR EXPORTER (Las 3 funciones)
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/maquinasExporter'

// ... (Tus QUERY y mutations se mantienen igual) ...
// --- GRAPHQL ---
import { QUERY } from 'src/components/Maquina/MaquinasCell'

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
    return typeof value === 'string' ? JSON.parse(value) : value
  } catch {
    return []
  }
}

const Maquinas = ({ maquinas }) => {
  const { data: paramData } = useQuery(QUERY_PARAMETRICAS)
  const { data: usuariosData } = useQuery(QUERY_USUARIOS)

  const [showDeleted, setShowDeleted] = useState(false)
  
  // MENUS
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })
  
  // Menú Exportar Página
  const [exportPageMenu, setExportPageMenu] = useState(null)
  // Menú Exportar Selección
  const [exportSelectMenu, setExportSelectMenu] = useState(null)

  const [deleteDialog, setDeleteDialog] = useState({
    open: false, id: null, isActive: true,
  })

  const [updateMaquina] = useMutation(UPDATE_MAQUINA_MUTATION, {
    onCompleted: () => {
      toast.success('Registro actualizado')
      closeAllDialogs()
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY }],
  })

  const closeAllDialogs = () => {
    setDeleteDialog({ open: false, id: null, isActive: true })
    setActionMenu({ anchorEl: null, row: null })
    setExportPageMenu(null)
    setExportSelectMenu(null)
  }

  // ... (Tus helpers y mapas se mantienen igual) ...
  const plataformasMap = useMemo(() => {
    return (paramData?.parametros || []).reduce((a, p) => {
      a[p.codigo] = p.nombre
      return a
    }, {})
  }, [paramData])

  const usuariosMap = useMemo(() => {
    return (usuariosData?.usuarios || []).reduce((a, u) => {
      a[u.id] = `${u.nombres} ${u.primer_apellido}`
      return a
    }, {})
  }, [usuariosData])

  const helpers = {
    getNombrePlataforma: (c) => plataformasMap[c] || c || '-',
    getUsuarioNombre: (id) => usuariosMap[id] || `ID: ${id}`,
  }

  const filteredData = useMemo(() => {
    if (!maquinas) return []
    return maquinas.filter((m) =>
      showDeleted ? m.estado === 'INACTIVO' : m.estado === 'ACTIVO'
    )
  }, [maquinas, showDeleted])

  const formatDate = (d) => {
    if (!d) return '-'
    try {
      return new Date(d).toLocaleString('es-BO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    } catch { return '-' }
  }

  // --- COLUMNAS (Se mantienen igual) ---
  const columns = useMemo(() => [
      // 1. ID
      { accessorKey: 'id', header: 'ID', size: 50 },
      // 2. VMID
      { accessorKey: 'proxmox_vmid', header: 'VMID', size: 80 },
      // 3. Nombre
      {
        accessorKey: 'nombre',
        header: 'Nombre VM',
        size: 180,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VmIcon color={row.original.estado === 'INACTIVO' ? 'disabled' : 'primary'} fontSize="small" />
            <Typography variant="body2" fontWeight={500} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
              {row.original.nombre}
            </Typography>
            {row.original.estado === 'INACTIVO' && <Chip label="ELIMINADO" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
          </Box>
        ),
      },
      // 4. IP
      { accessorKey: 'ip', header: 'IP', size: 130 },
      // 5. RAM
      { accessorKey: 'ram', header: 'RAM', size: 80, Cell: ({ cell }) => `${cell.getValue()} GB` },
      // 6. Discos
      {
        accessorKey: 'almacenamiento',
        header: 'Discos',
        size: 140,
        Cell: ({ row }) => {
          const discos = parseAlmacenamiento(row.original.almacenamiento)
          return (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {discos.length ? discos.map((d, i) => (<Chip key={i} size="small" label={`D${d.Disco}: ${d.Valor}GB`} variant="outlined" sx={{ height: 22, fontSize: '0.75rem' }} />)) : <Chip size="small" label="-" variant="outlined" />}
            </Stack>
          )
        },
      },
      // 7. CPU
      { accessorKey: 'cpu', header: 'CPU', size: 80, Cell: ({ cell }) => `${cell.getValue()} vCores` },
      // 8. SO
      { accessorKey: 'so', header: 'SO', size: 110 },
      // 9. Plataforma
      { accessorKey: 'cod_plataforma', header: 'Plataforma', size: 120, Cell: ({ cell }) => helpers.getNombrePlataforma(cell.getValue()) },
      // 10. Host
      { accessorKey: 'servidores.nombre', header: 'Host', size: 120, Cell: ({ row }) => row.original.servidores?.nombre || '-' },
      // 11. Estado Operativo
      {
        accessorKey: 'estado_operativo',
        header: 'Estado Operativo',
        size: 120,
        Cell: ({ cell }) => {
          const value = cell.getValue() || 'unknown'
          const map = { OPERATIVO: { label: 'OPERATIVO', color: 'success' }, APAGADO: { label: 'APAGADO', color: 'error' }, paused: { label: 'Pausada', color: 'warning' }, unknown: { label: 'Desconocido', color: 'default' } }
          const info = map[value] || map.unknown
          return <Chip size="small" label={info.label} color={info.color} variant={value === 'unknown' ? 'outlined' : 'filled'} />
        },
      },
      // Campos Auditoría
      { accessorKey: 'estado', header: 'Auditoría', size: 90 },
      { accessorKey: 'fecha_creacion', header: 'Creación', size: 150, Cell: ({ cell }) => formatDate(cell.getValue()) },
      { accessorKey: 'usuario_creacion', header: 'Creó', size: 150, Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()) },
      { accessorKey: 'fecha_modificacion', header: 'Modif.', size: 150, Cell: ({ cell }) => formatDate(cell.getValue()) },
      { accessorKey: 'usuario_modificacion', header: 'Modificó', size: 150, Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()) },
    ], [paramData, usuariosData])

  // --- LÓGICA DE EXPORTACIÓN CENTRALIZADA ---
  const handleExport = (table, rowsToExport, suffix, format) => {
    // 1. Columnas visibles
    const visibleColumns = table.getVisibleLeafColumns()

    // 2. Filtro de seguridad (Blacklist)
    const columnsToExport = visibleColumns.filter((col) => {
      const id = col.id
      return !['mrt-row-actions', 'mrt-row-select', 'mrt-row-expand', 'id', 'uuid', 'identity_key', 'mac'].includes(id)
    })

    // 3. Ejecutar formato seleccionado
    if (format === 'excel') exportToExcel(rowsToExport, columnsToExport, helpers, suffix)
    if (format === 'pdf') exportToPDF(rowsToExport, columnsToExport, helpers, suffix)
    if (format === 'csv') exportToCSV(rowsToExport, columnsToExport, helpers, suffix)
    
    closeAllDialogs() // Cierra los menús
  }

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    enableRowSelection: true,
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: { id: false, estado: false, fecha_creacion: false, usuario_creacion: false, fecha_modificacion: false, usuario_modificacion: false },
    },

    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1, flexWrap: 'wrap' }}>
        
        <FormControlLabel
          label={showDeleted ? "Papelera" : "Activos"}
          control={<Switch checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} color="error" />}
        />
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* 1. BOTÓN EXPORTAR PÁGINA (Con menú) */}
        <Button
          onClick={(e) => setExportPageMenu(e.currentTarget)}
          endIcon={<ArrowDownIcon />}
          startIcon={<ExportIcon />}
          variant="outlined"
          size="small"
        >
          Exportar Página
        </Button>
        <Menu
          anchorEl={exportPageMenu}
          open={Boolean(exportPageMenu)}
          onClose={() => setExportPageMenu(null)}
        >
          <MenuItem onClick={() => handleExport(table, table.getRowModel().rows, '-Pagina', 'excel')}>
            <ListItemIcon><ExcelIcon fontSize="small" color="success"/></ListItemIcon> Excel
          </MenuItem>
          <MenuItem onClick={() => handleExport(table, table.getRowModel().rows, '-Pagina', 'pdf')}>
            <ListItemIcon><PdfIcon fontSize="small" color="error"/></ListItemIcon> PDF
          </MenuItem>
          <MenuItem onClick={() => handleExport(table, table.getRowModel().rows, '-Pagina', 'csv')}>
            <ListItemIcon><CsvIcon fontSize="small" color="info"/></ListItemIcon> CSV
          </MenuItem>
        </Menu>

        {/* 2. BOTÓN EXPORTAR SELECCIÓN (Con menú) */}
        <Button
          disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onClick={(e) => setExportSelectMenu(e.currentTarget)}
          endIcon={<ArrowDownIcon />}
          startIcon={<ExportIcon />}
          variant="contained"
          color="success"
          size="small"
        >
          Exportar Selección ({table.getSelectedRowModel().rows.length})
        </Button>
        <Menu
          anchorEl={exportSelectMenu}
          open={Boolean(exportSelectMenu)}
          onClose={() => setExportSelectMenu(null)}
        >
           <MenuItem onClick={() => handleExport(table, table.getSelectedRowModel().rows, '-Seleccion', 'excel')}>
            <ListItemIcon><ExcelIcon fontSize="small" color="success"/></ListItemIcon> Excel
          </MenuItem>
          <MenuItem onClick={() => handleExport(table, table.getSelectedRowModel().rows, '-Seleccion', 'pdf')}>
            <ListItemIcon><PdfIcon fontSize="small" color="error"/></ListItemIcon> PDF
          </MenuItem>
          <MenuItem onClick={() => handleExport(table, table.getSelectedRowModel().rows, '-Seleccion', 'csv')}>
            <ListItemIcon><CsvIcon fontSize="small" color="info"/></ListItemIcon> CSV
          </MenuItem>
        </Menu>

      </Box>
    ),

    renderRowActions: ({ row }) => (
      <Tooltip title="Opciones">
        <IconButton onClick={(e) => setActionMenu({ anchorEl: e.currentTarget, row: row.original })}>
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
    ),
  })

  // (El resto de handlers y dialogos de auditoría se mantienen igual)
  const confirmarDelete = () => {
    updateMaquina({
      variables: {
        id: deleteDialog.id,
        input: { estado: deleteDialog.isActive ? 'INACTIVO' : 'ACTIVO', usuario_modificacion: 1 },
      },
    })
  }

  return (
    <Box>
      <MaterialReactTable table={table} />

      <Dialog open={deleteDialog.open} onClose={closeAllDialogs}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {deleteDialog.isActive ? <DeleteIcon color="error" /> : <RestoreIcon color="primary" />}
          {deleteDialog.isActive ? 'Eliminar Registro Local' : 'Restaurar Registro Local'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {deleteDialog.isActive ? '¿Enviar a la papelera?' : '¿Restaurar registro?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAllDialogs}>Cancelar</Button>
          <Button onClick={confirmarDelete} variant="contained" color={deleteDialog.isActive ? 'error' : 'primary'}>
            {deleteDialog.isActive ? 'Eliminar' : 'Restaurar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem component={Link} to={actionMenu.row ? routes.maquina({ id: actionMenu.row.id }) : '#'}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon> Ver Detalles
        </MenuItem>
        <MenuItem component={Link} to={actionMenu.row ? routes.editMaquina({ id: actionMenu.row.id }) : '#'}>
          <ListItemIcon><EditIcon fontSize="small" color="info" /></ListItemIcon> Editar
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
            setDeleteDialog({ open: true, id: actionMenu.row.id, isActive: actionMenu.row.estado === 'ACTIVO' })
            setActionMenu({ ...actionMenu, anchorEl: null })
          }}>
          <ListItemIcon>
            {actionMenu.row?.estado === 'ACTIVO' ? <DeleteIcon fontSize="small" color="error" /> : <RestoreIcon fontSize="small" color="primary" />}
          </ListItemIcon>
          {actionMenu.row?.estado === 'ACTIVO' ? 'Eliminar' : 'Restaurar'}
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Maquinas