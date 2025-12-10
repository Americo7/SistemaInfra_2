import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Computer as VmIcon,
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as CsvIcon,
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
  RestoreFromTrash as RestoreIcon,
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
import { exportToExcel, exportToPDF, exportToCSV } from 'src/lib/exporter/maquinasExporter'

// --- GRAPHQL ---
const UPDATE_MAQUINA_MUTATION = gql`
  mutation UpdateMaquina($id: Int!, $input: UpdateMaquinaInput!) {
    updateMaquina(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DELETE_MAQUINA_MUTATION = gql`
  mutation DeleteMaquina($id: Int!) {
    deleteMaquina(id: $id) {
      id
    }
  }
`

const QUERY_REFETCH = gql`
  query FindMaquinasRefetch {
    maquinas {
      id
      estado
    }
  }
`

// --- HELPERS ---
const getStatusColor = (codigo) => {
  if (!codigo) return 'default'
  const c = codigo.toUpperCase()
  if (['OPERATIVO', 'ACTIVO', 'ONLINE', 'RUNNING', 'OK'].includes(c)) return 'success'
  if (['FUERA_SERVICIO', 'BAJA', 'ERROR', 'STOPPED', 'OFFLINE', 'FALLA', 'INACTIVO'].includes(c)) return 'error'
  if (['MANTENIMIENTO', 'WARNING', 'RESTARTING'].includes(c)) return 'warning'
  return 'default'
}

// Helper simple para formatear nombres de usuario desde el objeto
const formatUser = (userObj) => {
    if (!userObj) return '-'
    // Aseguramos que la estructura sea manejada, incluso si faltan apellidos
    return `${userObj.nombres || ''} ${userObj.primer_apellido || ''} ${userObj.segundo_apellido || ''}`.trim()
}

const helpers = {
    getNombrePlataforma: (val) => val, 
    getUsuarioNombre: (val) => val,
    getNombreEstadoOperativo: (val) => val,
}

const Maquinas = ({ maquinas }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)

  // --- ESTADOS PARA EL DIÁLOGO ---
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState([]) // Almacena las filas seleccionadas (objetos de datos)

  const [updateMaquina] = useMutation(UPDATE_MAQUINA_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  // CORRECCIÓN: Eliminado onCompleted para manejar el toast fuera de la mutación
  const [deleteMaquina] = useMutation(DELETE_MAQUINA_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  // --- HANDLERS DE ELIMINACIÓN ---
  const handleSoftDelete = (rows) => {
    rows.forEach((maquina) => {
      // Si showDeleted es true, queremos RESTAURAR (ACTIVO). Si es false, queremos DESACTIVAR (INACTIVO).
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO' 
      updateMaquina({
        variables: { id: maquina.id, input: { estado: newState } },
      })
    })
    
    toast.success(`${rows.length} registros ${showDeleted ? 'restaurados' : 'desactivados'}.`)
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  // MODIFICACIÓN: Abre el diálogo y guarda las filas
  const handleHardDelete = (rows) => {
    const dataObjects = rows.map((r) => r.original)
    setRowsToDelete(dataObjects)
    setOpenDeleteDialog(true)
  }

  // NUEVA FUNCIÓN: Ejecuta la eliminación tras confirmar en el diálogo MUI
  const confirmHardDelete = () => {
    setOpenDeleteDialog(false)
    
    if (rowsToDelete.length === 0) return

    rowsToDelete.forEach((maquina) => {
      deleteMaquina({ variables: { id: maquina.id } })
    })
    
    // Muestra el toast de éxito UNA SOLA VEZ
    toast.success(`${rowsToDelete.length} registro(s) eliminado(s) permanentemente.`) 

    table.toggleAllRowsSelected(false)
    closeAllDialogs()
    setRowsToDelete([]) 
  }

  // --- DATOS (LÓGICA DE FILTRADO CORREGIDA) ---
  const filteredData = useMemo(() => {
    if (!maquinas) return []
    return maquinas.filter((m) =>
      // Mostrar todos los no-eliminados vs solo los eliminados
      showDeleted ? m.estado === 'INACTIVO' : m.estado !== 'INACTIVO'
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
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'proxmox_vmid', header: 'VMID', size: 80 },
    {
      accessorKey: 'nombre',
      header: 'Nombre VM',
      size: 200,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VmIcon color={row.original.estado === 'INACTIVO' ? 'disabled' : 'primary'} fontSize="small" />
          <Typography variant="body2" fontWeight={500} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
            {row.original.nombre}
          </Typography>
        </Box>
      ),
    },
    { accessorKey: 'ip', header: 'IP', size: 130 },
    { 
      accessorKey: 'ram', 
      header: 'RAM', 
      size: 90, 
      Cell: ({ cell }) => `${cell.getValue()} GB` 
    },
    { 
      accessorKey: 'cpu', 
      header: 'CPU', 
      size: 90, 
      Cell: ({ cell }) => `${cell.getValue()} vCores` 
    },
    { accessorKey: 'so', header: 'SO', size: 110 },
    
    // --- COLUMNAS CON RELACIONES JERÁRQUICAS ---
    { 
        id: 'host',
        header: 'Host (Servidor)', 
        size: 150, 
        accessorFn: (row) => row.servidores?.nombre || '-',
        Cell: ({ row }) => {
            const servidor = row.original.servidores
            if (!servidor?.id) return '-';
            return (
                <Link 
                    to={routes.servidor({ id: servidor.id })}
                    style={{ textDecoration: 'none', fontWeight: 600, color: theme.palette.info.main }}
                >
                    {servidor.nombre}
                </Link>
            )
        }
    },
    {
        id: 'data_center',
        header: 'Data Center',
        size: 150,
        accessorFn: (row) => row.servidores?.data_centers?.nombre || '-',
        Cell: ({ row }) => {
            const dataCenter = row.original.servidores?.data_centers
            if (!dataCenter?.id) return '-';
            return (
                <Link 
                    to={routes.dataCenter({ id: dataCenter.id })}
                    style={{ textDecoration: 'none', fontWeight: 600, color: theme.palette.info.main }}
                >
                    {dataCenter.nombre}
                </Link>
            )
        }
    },
    { 
        id: 'cluster_perteneciente',
        header: 'Cluster', 
        size: 150, 
        accessorFn: (row) => {
            const vmCluster = row.cluster_nodos?.[0]?.cluster;
            const hostCluster = row.servidores?.cluster_nodos?.[0]?.cluster;
            const targetCluster = vmCluster || hostCluster;
            return targetCluster?.nombre || '-';
        },
        Cell: ({ row }) => {
            const vmCluster = row.original.cluster_nodos?.[0]?.cluster;
            const hostCluster = row.original.servidores?.cluster_nodos?.[0]?.cluster;
            const targetCluster = vmCluster || hostCluster;
            
            if (!targetCluster?.id) return '-';

            return (
                <Link 
                    to={routes.cluster({ id: targetCluster.id })}
                    style={{ textDecoration: 'none', fontWeight: 600, color: theme.palette.info.main }}
                >
                    {targetCluster.nombre}
                </Link>
            )
        }
    },
    { 
        // Usamos accessorFn para que el exportador obtenga el nombre real, no el código
        id: 'plataforma',
        header: 'Plataforma', 
        size: 120,
        accessorFn: (row) => row.plataformaInfo?.nombre || '-',
    },
    {
      id: 'estado_operativo',
      header: 'Estado Operativo',
      size: 150,
      // accessorFn devuelve el nombre legible para ordenamiento y exportación
      accessorFn: (row) => row.estadoOperativoInfo?.nombre || row.estado_operativo || 'Desconocido',
      Cell: ({ row, cell }) => {
        const label = cell.getValue() // Toma el valor del accessorFn
        // Para el color usamos el código
        const codigo = row.original.estadoOperativoInfo?.codigo || row.original.estado_operativo
        const color = getStatusColor(codigo)
        
        return (
          <Chip 
            size="small" 
            label={label} 
            color={color} 
            variant={codigo ? 'filled' : 'outlined'} 
            sx={{ fontWeight: 'bold' }} 
          />
        )
      },
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
        size: 150, 
        Cell: ({ cell }) => formatDate(cell.getValue()) 
    },
    { 
        id: 'creadoPor',
        header: 'Creado por', 
        size: 150, 
        accessorFn: (row) => formatUser(row.creadoPor)
    },
    { 
        accessorKey: 'fecha_modificacion', 
        header: 'F. Modificación', 
        size: 150, 
        Cell: ({ cell }) => formatDate(cell.getValue()) 
    },
    { 
        id: 'modificadoPor',
        header: 'Modif. por', 
        size: 150, 
        accessorFn: (row) => formatUser(row.modificadoPor)
    },
  ], [theme])

  // --- CONFIGURACIÓN DE MRT ---
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableRowVirtualization: true,
    rowVirtualizerOptions: { overscan: 5 },
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: { 
        id: false,
        data_center: false, 
        so: false,
        estado: false,
        fecha_creacion: false, 
        creadoPor: false, 
        fecha_modificacion: false, 
        modificadoPor: false 
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
      sx: {
        pl: 1, 
        pr: 1,
        backgroundColor: 'background.paper',
        mb: 1, 
      }
    },
    muiBottomToolbarProps: {
        sx: {
            backgroundColor: 'background.paper',
            border: 'none', 
            boxShadow: 'none',
        }
    },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Máquinas Virtuales
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
      sx: {
        borderBottom: `1px solid ${theme.palette.divider}`,
      }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }
    }),
    renderRowActions: ({ row }) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Ver Detalles">
          <IconButton component={Link} to={routes.maquina({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editMaquina({ id: row.original.id })} size="small">
            <EditIcon fontSize="small" color="info" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  })

  // --- LOGICA DE EXPORTACIÓN ---
  const handleExport = (scope, suffix, format) => {
    let rowsToExport = []

    if (scope === 'page') {
      const allRows = table.getPrePaginationRowModel().rows
      const { pageIndex, pageSize } = table.getState().pagination
      const startRow = pageIndex * pageSize
      const endRow = startRow + pageSize
      rowsToExport = allRows.slice(startRow, endRow)
    }

    if (scope === 'all') {
       rowsToExport = table.getPrePaginationRowModel().rows
    }

    if (scope === 'selected') {
      rowsToExport = table.getSelectedRowModel().rows
    }

    if (!rowsToExport || rowsToExport.length === 0) {
        toast.error('No hay datos para exportar')
        return
    }

    const visibleColumns = table.getVisibleLeafColumns().filter((col) => !['mrt-row-actions', 'mrt-row-select', 'mrt-row-expand', 'id'].includes(col.id))
    
    if (format === 'excel') exportToExcel(rowsToExport, visibleColumns, helpers, suffix)
    if (format === 'pdf') exportToPDF(rowsToExport, visibleColumns, helpers, suffix)
    if (format === 'csv') exportToCSV(rowsToExport, visibleColumns, helpers, suffix)
    
    closeAllDialogs()
  }

  // --- CONFIG PARA SCAFFOLD ---
  const listActionsConfig = useMemo(() => {
    const selectedRowCount = table.getSelectedRowModel().rows.length
    
    const ExportMenu = (
      <Menu anchorEl={exportMenuAnchorEl} open={Boolean(exportMenuAnchorEl)} onClose={closeAllDialogs}>
        {/* EXCEL */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>EXCEL</Typography>
        </Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'excel')}>
          <ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Página Actual
        </MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'excel')} disabled={selectedRowCount === 0}>
          <ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Selección ({selectedRowCount})
        </MenuItem>
        
        <Divider />

        {/* PDF */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>PDF</Typography>
        </Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'pdf')}>
          <ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Página Actual
        </MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'pdf')} disabled={selectedRowCount === 0}>
          <ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Selección ({selectedRowCount})
        </MenuItem>

        <Divider />

        {/* CSV */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>CSV</Typography>
        </Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'csv')}>
          <ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Página Actual
        </MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'csv')} disabled={selectedRowCount === 0}>
          <ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Selección ({selectedRowCount})
        </MenuItem>
      </Menu>
    )

    const BulkActionMenu = (
      <Menu
        anchorEl={bulkMenuAnchorEl}
        open={Boolean(bulkMenuAnchorEl)}
        onClose={closeAllDialogs}
      >
        <MenuItem onClick={() => handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original))}>
          <ListItemIcon>{showDeleted ? <RestoreIcon fontSize="small" color="success" /> : <SoftDeleteIcon fontSize="small" color="warning" />}</ListItemIcon>
          {showDeleted ? 'Restaurar (Activar)' : 'Desactivar (Soft Delete)'}
        </MenuItem>
        <MenuItem onClick={() => handleHardDelete(table.getSelectedRowModel().rows)}>
          <ListItemIcon><HardDeleteIcon fontSize="small" color="error" /></ListItemIcon>
          Eliminar de Base de Datos
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
             // Si estamos viendo eliminados, el botón principal es RESTAURAR
             handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original))
        } else {
             // Si estamos viendo activos, el botón principal abre el menú de baja/eliminación
             setBulkMenuAnchorEl(e.currentTarget)
        }
      },
      
      handleExportClick: (e) => setExportMenuAnchorEl(e.currentTarget),
      exportMenu: ExportMenu,
      bulkActionMenu: BulkActionMenu,
    }
  }, [
    table, 
    showDeleted, 
    exportMenuAnchorEl, 
    bulkMenuAnchorEl, 
    table.getState().rowSelection,
    table.getState().pagination,
    table.getSelectedRowModel().rows.length, 
  ])

  // Lógica segura para obtener el nombre(s) en el diálogo
  const namesToDelete = rowsToDelete.length === 1 
    ? rowsToDelete[0]?.nombre || `la máquina ID ${rowsToDelete[0]?.id}` 
    : `${rowsToDelete.length} registros`

  return (
    <ScaffoldLayout
      title="Máquinas"
      titleTo="maquinas"
      groupTitle="Infraestructura"
      buttonLabel="Nueva Máquina"
      buttonTo="newMaquina"
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

export default Maquinas