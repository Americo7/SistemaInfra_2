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
  // Iconos de exportación
  FileDownload as ExportIcon,
  PictureAsPdf as PdfIcon,
  TableView as CsvIcon,
  GridOn as ExcelIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Add as AddIcon,
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
  Typography,
  Divider,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

// IMPORTAR EXPORTER (Las 3 funciones)
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/maquinasExporter'

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
  
  const [exportPageMenu, setExportPageMenu] = useState(null)
  const [exportSelectMenu, setExportSelectMenu] = useState(null)

  // El estado ahora guarda las filas seleccionadas para acciones masivas
  const [deleteDialog, setDeleteDialog] = useState({
    open: false, id: null, isActive: true, rows: [],
  })

  const [updateMaquina] = useMutation(UPDATE_MAQUINA_MUTATION, {
    onCompleted: () => {
      // El toast se maneja mejor en la función `confirmarDelete` para dar detalles.
      // Aquí solo se maneja el cierre si es una sola operación (aunque ya no se usa).
      // toast.success('Registro actualizado')
      // closeAllDialogs()
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY }],
  })

  const closeAllDialogs = () => {
    setDeleteDialog({ open: false, id: null, isActive: true, rows: [] })
    setExportPageMenu(null)
    setExportSelectMenu(null)
  }

  // --- Helpers y Mapeos ---
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

  // --- COLUMNAS ---
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
          const map = { OPERATIVO: { label: 'OPERATIVO', color: 'success' }, FUERA_SERVICIO: { label: 'FUERA DE SERVICIO', color: 'error' }, unknown: { label: 'Desconocido', color: 'default' } }
          const info = map[value] || map.unknown
          return <Chip size="small" label={info.label} color={info.color} variant={value === 'unknown' ? 'outlined' : 'filled'} />
        },
      },
      // Campos Auditoría
      { accessorKey: 'fecha_creacion', header: 'Creación', size: 150, Cell: ({ cell }) => formatDate(cell.getValue()) },
      { accessorKey: 'usuario_creacion', header: 'Creó', size: 150, Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()) },
      { accessorKey: 'fecha_modificacion', header: 'Modif.', size: 150, Cell: ({ cell }) => formatDate(cell.getValue()) },
      { accessorKey: 'usuario_modificacion', header: 'Modificó', size: 150, Cell: ({ cell }) => helpers.getUsuarioNombre(cell.getValue()) },
    ], [paramData, usuariosData])

  // --- LÓGICA DE EXPORTACIÓN ---
  const handleExport = (table, rowsToExport, suffix, format) => {
    const visibleColumns = table.getVisibleLeafColumns()

    const columnsToExport = visibleColumns.filter((col) => {
      const id = col.id
      return !['mrt-row-actions', 'mrt-row-select', 'mrt-row-expand', 'id', 'identity_key'].includes(id)
    })

    if (format === 'excel') exportToExcel(rowsToExport, columnsToExport, helpers, suffix)
    if (format === 'pdf') exportToPDF(rowsToExport, columnsToExport, helpers, suffix)
    if (format === 'csv') exportToCSV(rowsToExport, columnsToExport, helpers, suffix)
    
    closeAllDialogs()
  }
  
  // --- ACCIÓN MASIVA (ELIMINAR/RESTAURAR) ---
  const handleBulkAction = (table) => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.error('Selecciona al menos un registro.')
      return
    }

    setDeleteDialog({ 
      open: true, 
      id: null, 
      isActive: !showDeleted, // True si es Eliminar (vista Activos), False si es Restaurar (vista Papelera)
      rows: selectedRows.map(row => row.original),
    })
  }

  const confirmarDelete = () => {
    const action = deleteDialog.isActive ? 'INACTIVO' : 'ACTIVO'
    const itemsToUpdate = deleteDialog.rows

    itemsToUpdate.forEach((maquina) => {
      // Usar `updateMaquina` para cada item seleccionado.
      // NOTA: Para un gran volumen, considera una mutación de GraphQL masiva si tu API lo permite.
      updateMaquina({
        variables: {
          id: maquina.id,
          input: { estado: action, usuario_modificacion: 1 },
        },
      })
    })
    
    closeAllDialogs()
    toast.success(`${itemsToUpdate.length} Registros marcados como ${action}.`)
    // Refetching ya se maneja en el objeto `updateMaquina`
  }
  
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    enableRowSelection: true,
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: { id: false, so: false,estado: false, fecha_creacion: false, usuario_creacion: false, fecha_modificacion: false, usuario_modificacion: false },
    },

    // ⬆️ REORGANIZACIÓN DEL ENCABEZADO (TOP TOOLBAR)
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1, flexWrap: 'wrap', width: '100%' }}>
        
        {/* 2. BOTÓN ELIMINAR/RESTAURAR SELECCIÓN */}
        <Button
          disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onClick={() => handleBulkAction(table)}
          startIcon={showDeleted ? <RestoreIcon /> : <DeleteIcon />}
          variant="outlined"
          color={showDeleted ? 'primary' : 'error'}
          size="small"
        >
          {showDeleted ? `Restaurar (${table.getSelectedRowModel().rows.length})` : `Eliminar (${table.getSelectedRowModel().rows.length})`}
        </Button>

        <Box sx={{ flexGrow: 1 }} /> {/* Espacio para empujar los filtros/exportación a la derecha */}
        
        {/* 3. SWITCH ACTIVOS / PAPELERA */}
        <FormControlLabel
          label={showDeleted ? "Papelera" : "Activos"}
          control={<Switch checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} color="error" />}
        />
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* 4. BOTONES DE EXPORTACIÓN (Con menú) */}
        <Button
          onClick={(e) => setExportPageMenu(e.currentTarget)}
          endIcon={<ArrowDownIcon />}
          startIcon={<ExportIcon />}
          variant="outlined"
          size="small"
        >
          Exportar
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

      </Box>
    ),

    // 🔽 ACCIONES DE FILA DIRECTAS (Ver y Editar)
    renderRowActions: ({ row }) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Ver Detalles">
          <IconButton 
            component={Link} 
            to={routes.maquina({ id: row.original.id })}
            size="small"
          >
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Editar">
          <IconButton 
            component={Link} 
            to={routes.editMaquina({ id: row.original.id })}
            size="small"
          >
            <EditIcon fontSize="small" color="info" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  })

  return (
    <Box 
      // ✅ Estilos para ancho, centrado, borde y color
      sx={{ 
        maxWidth: 1500,
        mx: 'auto',     
        py: 2,          
        bgcolor: 'background.paper', 
        borderRadius: 2,             
        boxShadow: 3,                
        border: '1px solid',
        borderColor: 'grey.300',     
      }}
    >
      <MaterialReactTable table={table} />

      {/* --- DIÁLOGO DE CONFIRMACIÓN MASIVA --- */}
      <Dialog open={deleteDialog.open} onClose={closeAllDialogs}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {deleteDialog.isActive ? <DeleteIcon color="error" /> : <RestoreIcon color="primary" />}
          {deleteDialog.isActive ? 'Confirmar Eliminación Masiva' : 'Confirmar Restauración Masiva'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas **{deleteDialog.isActive ? 'enviar a la papelera' : 'restaurar'}** {deleteDialog.rows.length} registro(s) seleccionado(s)?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAllDialogs}>Cancelar</Button>
          <Button onClick={confirmarDelete} variant="contained" color={deleteDialog.isActive ? 'error' : 'primary'}>
            {deleteDialog.isActive ? `Eliminar (${deleteDialog.rows.length})` : `Restaurar (${deleteDialog.rows.length})`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Maquinas