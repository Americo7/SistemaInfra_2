import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Code as ComponentIcon,
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as CsvIcon,
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Dns as SistemaIcon,
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
  // --- IMPORTACIONES ADICIONALES PARA DIÁLOGO MUI ---
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/componentesExporter'

// --- GRAPHQL ---
const UPDATE_COMPONENTE_MUTATION = gql`
  mutation UpdateComponente($id: Int!, $input: UpdateComponenteInput!) {
    updateComponente(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_COMPONENTE_MUTATION = gql`
  mutation DeleteComponente($id: Int!) {
    deleteComponente(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindComponentesRefetch {
    componentes {
      id
      estado
    }
  }
`

// --- HELPERS ---
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '-' }
}

const Componentes = ({ componentes, usuarios }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)
  const [rowSelection, setRowSelection] = useState({}) 
  
  // --- ESTADOS PARA EL DIÁLOGO ---
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState([]) // Almacena las filas seleccionadas

  const [updateComponente] = useMutation(UPDATE_COMPONENTE_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  // 1. CORRECCIÓN: Eliminado onCompleted para manejar el toast fuera de la mutación
  const [deleteComponente] = useMutation(DELETE_COMPONENTE_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  // --- MAPA DE USUARIOS ---
  const usuariosMap = useMemo(() => {
    if (!usuarios) return new Map()
    return new Map(usuarios.map((u) => {
      const nombreCompleto = [u.nombres, u.primer_apellido, u.segundo_apellido]
        .filter(Boolean)
        .join(' ')
      return [u.id, nombreCompleto]
    }))
  }, [usuarios])

  // --- HELPER AJUSTADO ---
  const getUserName = (id, relationObj) => {
     // 1. Intentar usar la relación directa
     if (relationObj && (relationObj.nombres || relationObj.primer_apellido)) {
         return [relationObj.nombres, relationObj.primer_apellido, relationObj.segundo_apellido].filter(Boolean).join(' ')
     }
     // 2. Si falla, buscar en el mapa global usando el ID
     if (id && usuariosMap.has(id)) {
         return usuariosMap.get(id)
     }
     // 3. Si el ID existe (ej: 3) pero no está en la base de datos de usuarios, o no hay info:
     return '-' 
  }

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  // --- HANDLERS ---
  const handleSoftDelete = (rows) => {
    rows.forEach((componente) => {
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
      updateComponente({
        variables: { id: componente.id, input: { estado: newState } },
      })
    })
    toast.success(`${rows.length} registros ${showDeleted ? 'restaurados' : 'desactivados'}.`)
    // Limpiamos la selección después de la acción
    setRowSelection({}) 
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  // 2. MODIFICACIÓN: Abre el diálogo en lugar de window.confirm
  const handleHardDelete = (rows) => {
    const dataObjects = rows.map((r) => r.original)
    setRowsToDelete(dataObjects)
    setOpenDeleteDialog(true)
  }

  // 3. NUEVA FUNCIÓN: Ejecuta la eliminación tras confirmar en el diálogo MUI
  const confirmHardDelete = () => {
    setOpenDeleteDialog(false)
    
    if (rowsToDelete.length === 0) return

    rowsToDelete.forEach((componente) => {
      deleteComponente({ variables: { id: componente.id } })
    })
    
    // Muestra el toast de éxito UNA SOLA VEZ
    toast.success(`${rowsToDelete.length} registro(s) eliminado(s) permanentemente.`) 

    setRowSelection({}) 
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
    setRowsToDelete([]) 
  }

  // --- FILTRADO ---
  const filteredData = useMemo(() => {
    if (!componentes) return []
    return componentes.filter((c) =>
      showDeleted ? c.estado === 'INACTIVO' : c.estado !== 'INACTIVO'
    )
  }, [componentes, showDeleted])

  // --- COLUMNAS ---
  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    {
        id: 'sistema',
        header: 'Sistema',
        size: 150,
        // Usamos accessorFn para acceder a la relación y evitar errores si es null
        accessorFn: (row) => row.sistemas?.sigla || row.sistemas?.nombre || '-',
        Cell: ({ row }) => {
            const sistema = row.original.sistemas
            if (!sistema?.id) return '-'
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SistemaIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                    <Link 
                        to={routes.sistema({ id: sistema.id })}
                        style={{ textDecoration: 'none', fontWeight: 600, color: theme.palette.info.main }}
                    >
                        {sistema.sigla || sistema.nombre}
                    </Link>
                </Box>
            )
        }
    },
    {
      accessorKey: 'nombre',
      header: 'Componente',
      size: 180,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ComponentIcon color={row.original.estado === 'INACTIVO' ? 'disabled' : 'primary'} fontSize="small" />
          <Typography variant="body2" fontWeight={500} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
            {row.original.nombre}
          </Typography>
        </Box>
      ),
    },
    { 
      accessorKey: 'dominio', 
      header: 'Dominio', 
      size: 140,
      Cell: ({ cell }) => <Typography variant="body2" noWrap>{cell.getValue() || '-'}</Typography>
    },
    { 
        id: 'entorno', 
        header: 'Entorno', 
        size: 120,
        accessorFn: (row) => row.entornoInfo?.nombre || row.cod_entorno || '-'
    },
    { 
        id: 'categoria', 
        header: 'Categoría', 
        size: 120,
        accessorFn: (row) => row.categoriaInfo?.nombre || row.cod_categoria || '-'
    },
    {
      id: 'tecnologia',
      // CORRECCIÓN CLAVE: Procesar el array JSON directamente del campo 'tecnologia'
      accessorFn: (row) => {
          // row.tecnologia es el array JSON guardado: [{ codigo, nombre, version }, ...]
          const techs = Array.isArray(row.tecnologia) ? row.tecnologia : []; 
          
          if (techs.length > 0) {
              return techs.map(t => {
                  const name = t.nombre || t.codigo;
                  const version = t.version ? ` (v${t.version})` : '';
                  return `${name}${version}`;
              }).join(', ');
          }
          return '-';
      },
      header: 'Tecnología',
      size: 250, // Aumentado para mostrar más texto
      Cell: ({ cell }) => <Typography variant="body2" noWrap>{cell.getValue()}</Typography>
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 100,
      Cell: ({ cell }) => (
        <Chip 
            label={cell.getValue()} 
            color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'} 
            size="small" 
            variant="outlined" 
            sx={{ fontSize: '0.7rem' }}
        />
      ),
    },
    { 
        accessorKey: 'fecha_creacion', 
        header: 'F. Creación', 
        size: 140, 
        Cell: ({ cell }) => formatDateTime(cell.getValue()) 
    },
    { 
        id: 'creadoPor',
        header: 'Creado por', 
        size: 160, 
        accessorFn: (row) => getUserName(row.usuario_creacion, row.creadoPor)
    },
    { 
        accessorKey: 'fecha_modificacion', 
        header: 'F. Modificación', 
        size: 140, 
        Cell: ({ cell }) => formatDateTime(cell.getValue()) 
    },
    { 
        id: 'modificadoPor',
        header: 'Modif. por', 
        size: 160, 
        accessorFn: (row) => getUserName(row.usuario_modificacion, row.modificadoPor)
    },
  ], [theme, usuariosMap])

  // --- CONFIGURACIÓN TABLE ---
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableRowVirtualization: true,
    rowVirtualizerOptions: { overscan: 5 },
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: { 
        id: false,
        gitlab_repo: false,
        gitlab_rama: false,
        fecha_creacion: false, 
        creadoPor: false, 
        fecha_modificacion: true, 
        modificadoPor: true 
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        maxWidth: 1500,
        mx: 'auto',
        px: 2, 
        py: 1,
        border: `1px solid ${theme.palette.divider}`,
        borderTop: 'none', 
        borderRadius: 2, 
        borderTopLeftRadius: '0 !important',
        borderTopRightRadius: '0 !important',
        backgroundColor: 'background.paper',
        overflow: 'hidden',
      },
    },
    muiTableContainerProps: {
       sx: {
         border: `1px solid ${theme.palette.divider}`,
         borderRadius: 2, 
         overflow: 'auto', 
       }
    },
    muiTopToolbarProps: {
      sx: { pl: 1, pr: 1, mb: 1, backgroundColor: 'background.paper' }
    },
    muiBottomToolbarProps: {
        sx: { backgroundColor: 'background.paper', border: 'none', boxShadow: 'none' }
    },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Componentes
        </Typography>
      </Box>
    ),
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
        color: 'text.primary',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        borderBottom: `1px solid ${theme.palette.divider}`, 
        borderRight: `1px solid ${theme.palette.divider}`,
        '&:last-child': { borderRight: 'none' },
      }
    },
    muiTableBodyCellProps: {
      sx: { borderBottom: `1px solid ${theme.palette.divider}` }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: { '&:hover': { backgroundColor: theme.palette.action.hover } }
    }),
    renderRowActions: ({ row }) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Ver Detalles">
          <IconButton component={Link} to={routes.componente({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editComponente({ id: row.original.id })} size="small">
            <EditIcon fontSize="small" color="info" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  })

  // --- LOGICA EXPORTACIÓN ---
  const handleExport = (scope, suffix, format) => {
    let rowsToExport = []
    // Usamos el modelo de filas de la tabla para obtener las filas correctas
    if (scope === 'page') {
      rowsToExport = table.getPrePaginationRowModel().rows
          .slice(table.getState().pagination.pageIndex * table.getState().pagination.pageSize, 
                 (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize)
          .map(row => row.original)
    } else if (scope === 'all') {
       rowsToExport = table.getPrePaginationRowModel().rows.map(row => row.original)
    } else if (scope === 'selected') {
      rowsToExport = table.getSelectedRowModel().rows.map(row => row.original)
    }

    if (!rowsToExport.length) {
        toast.error('No hay datos para exportar')
        return
    }

    const visibleColumns = table.getVisibleLeafColumns().filter((col) => !['mrt-row-actions', 'mrt-row-select', 'id'].includes(col.id))
    
    // Aquí podrías necesitar ajustar los helpers si son necesarios en la exportación
    const exportHelpers = { getUsuarioNombre: getUserName }
    
    if (format === 'excel') exportToExcel(rowsToExport, visibleColumns, exportHelpers, suffix)
    if (format === 'pdf') exportToPDF(rowsToExport, visibleColumns, exportHelpers, suffix)
    if (format === 'csv') exportToCSV(rowsToExport, visibleColumns, exportHelpers, suffix)
    closeAllDialogs()
  }

  // --- CONFIG SCAFFOLD ---
  const listActionsConfig = useMemo(() => {
    const selectedRowCount = Object.keys(rowSelection).length // Usamos el estado manual
    
    const ExportMenu = (
      <Menu anchorEl={exportMenuAnchorEl} open={Boolean(exportMenuAnchorEl)} onClose={closeAllDialogs}>
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" fontWeight={700}>EXCEL</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'excel')}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'excel')} disabled={selectedRowCount === 0}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
        <Divider />
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" fontWeight={700}>PDF</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'pdf')}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'pdf')} disabled={selectedRowCount === 0}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
        <Divider />
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" fontWeight={700}>CSV</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'csv')}><ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'csv')} disabled={selectedRowCount === 0}><ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
      </Menu>
    )

    const BulkActionMenu = (
      <Menu anchorEl={bulkMenuAnchorEl} open={Boolean(bulkMenuAnchorEl)} onClose={closeAllDialogs}>
        <MenuItem onClick={() => handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original))}>
          <ListItemIcon>{showDeleted ? <RestoreIcon fontSize="small" color="success" /> : <SoftDeleteIcon fontSize="small" color="warning" />}</ListItemIcon>
          {showDeleted ? 'Restaurar' : 'Desactivar'}
        </MenuItem>
        <MenuItem onClick={() => handleHardDelete(table.getSelectedRowModel().rows)}>
          <ListItemIcon><HardDeleteIcon fontSize="small" color="error" /></ListItemIcon> Eliminar BD
        </MenuItem>
      </Menu>
    )

    return {
      showDeleted,
      selectedRowCount,
      handleSwitchChange: (e) => setShowDeleted(e.target.checked),
      handleBulkAction: (e) => {
        if (selectedRowCount === 0) {
            toast.error('Debe seleccionar al menos un registro.')
            return;
        }
        if (showDeleted) {
             handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original))
        } else {
             setBulkMenuAnchorEl(e.currentTarget)
        }
      },
      handleExportClick: (e) => setExportMenuAnchorEl(e.currentTarget),
      exportMenu: ExportMenu,
      bulkActionMenu: BulkActionMenu,
    }
  }, [table, showDeleted, exportMenuAnchorEl, bulkMenuAnchorEl, rowSelection])

  // Lógica segura para obtener el nombre(s) en el diálogo
  const namesToDelete = rowsToDelete.length === 1 
    ? rowsToDelete[0]?.nombre || 'este registro' 
    : `${rowsToDelete.length} registros`

  return (
    <ScaffoldLayout
      title="Componentes"
      titleTo="componentes"
      groupTitle="Despliegues"
      buttonLabel="Nuevo Componente"
      buttonTo="newComponente"
      listActionsConfig={listActionsConfig}
    >
      <MaterialReactTable table={table} />
      
      {/* --- DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
          ADVERTENCIA: ¡Eliminación Definitiva!
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Estás a punto de eliminar **{namesToDelete}** de forma permanente.
            <br />
            **Esta acción es irreversible** y eliminará los datos de la base de datos.
            <br />
            ¿Deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => { 
                setOpenDeleteDialog(false); 
                setRowsToDelete([]); 
            }} 
            color="primary"
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmHardDelete} 
            color="error" 
            variant="contained" 
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      {/* ----------------------------------------------------- */}
    </ScaffoldLayout>
  )
}

export default Componentes