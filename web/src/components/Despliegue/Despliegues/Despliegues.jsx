import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useTheme } from '@mui/material/styles'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout/ScaffoldLayout'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as CsvIcon,
  DeleteForever as HardDeleteIcon,
  PowerOff as SoftDeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Computer as VmIcon,
  Storage as ServerIcon,
  Hub as ClusterIcon,
  // Iconos nuevos para visualización en tabla
  Commit as CommitIcon,
  Tag as VersionIcon,
  SwapHoriz as TypeIcon,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { exportToPDF, exportToExcel, exportToCSV } from 'src/lib/exporter/desplieguesExporter'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// --- GRAPHQL LOCAL ---
const QUERY_REFETCH = gql`
  query FindDesplieguesRefetch {
    despliegues {
      id
      estado
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const UPDATE_DESPLIEGUE_MUTATION = gql`
  mutation UpdateDespliegue($id: Int!, $input: UpdateDespliegueInput!) {
    updateDespliegue(id: $id, input: $input) {
      id
      estado
      fecha_modificacion
    }
  }
`

const DELETE_DESPLIEGUE_MUTATION = gql`
  mutation DeleteDespliegue($id: Int!) {
    deleteDespliegue(id: $id) {
      id
    }
  }
`

// --- HELPERS GENERALES ---
const formatDateTime = (value) => {
  if (!value) return '-'
  try {
    return format(parseISO(value), 'dd/MM/yyyy HH:mm', { locale: es })
  } catch {
    return '-'
  }
}

const formatUser = (userObj) => {
    if (!userObj) return '-'
    return `${userObj.nombres || ''} ${userObj.primer_apellido || ''} ${userObj.segundo_apellido || ''}`.trim()
}

// --- COMPONENTE PRINCIPAL ---

const Despliegues = ({ despliegues }) => {
  const theme = useTheme()
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null)
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null)
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState([]) 

  const [updateDespliegue] = useMutation(UPDATE_DESPLIEGUE_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const [deleteDespliegue] = useMutation(DELETE_DESPLIEGUE_MUTATION, {
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: QUERY_REFETCH }],
  })

  const closeAllDialogs = () => {
    setExportMenuAnchorEl(null)
    setBulkMenuAnchorEl(null)
  }

  /* ---------------------------------------------------------
     HELPERS DE RELACIONES
  --------------------------------------------------------- */
  const deploymentHelpers = useMemo(() => {
    return {
        componenteNombre: (d) => d.componentes?.nombre || '-',
        sistemaSigla: (d) => d.componentes?.sistemas?.sigla || '-', 

        recursoDestino: (d) => {
            const esVm = !!d.maquinas?.nombre;
            const esServer = !!d.servidores?.nombre;

            if (esVm) {
                return {
                    nombre: d.maquinas.nombre,
                    tipo: 'VM',
                    icon: VmIcon,
                    id: d.maquinas.id,
                    route: routes.maquina,
                }
            } else if (esServer) {
                return {
                    nombre: d.servidores.nombre,
                    tipo: 'Servidor',
                    icon: ServerIcon,
                    id: d.servidores.id,
                    route: routes.servidor,
                }
            }
            return { nombre: '-', tipo: 'N/A' }
        },

        clusterInfo: (d) => {
            const vmCluster = d.maquinas?.cluster_nodos?.[0]?.cluster;
            const vmHostCluster = d.maquinas?.servidores?.cluster_nodos?.[0]?.cluster;
            const serverCluster = d.servidores?.cluster_nodos?.[0]?.cluster;
            const target = vmCluster || vmHostCluster || serverCluster;
            return target ? { id: target.id, nombre: target.nombre } : null;
        },
        
        respaldoNombre: (d) => d.tipoRespaldoInfo?.nombre || d.cod_tipo_respaldo || '-',
        estadoDespliegueNombre: (d) => d.estadoDespliegueInfo?.nombre || d.estado_despliegue || '-',
        
        // --- NUEVOS HELPERS PARA CAMPOS ---
        tipoDespliegueNombre: (d) => d.tipoDespliegueInfo?.nombre || d.tipo_despliegue || '-',
    }
  }, []) 
  
  const helpers = {
      ...deploymentHelpers,
      formatDateTime: formatDateTime,
      getRecurso: (row) => deploymentHelpers.recursoDestino(row).nombre,
      getCluster: (row) => deploymentHelpers.clusterInfo(row)?.nombre || '-'
  }

  // --- HANDLERS ---
  const handleSoftDelete = (rows) => {
    rows.forEach((despliegue) => {
      const newState = showDeleted ? 'ACTIVO' : 'INACTIVO'
      updateDespliegue({
        variables: { id: despliegue.id, input: { estado: newState } },
      })
    })
    toast.success(`${rows.length} registros ${showDeleted ? 'restaurados' : 'desactivados'}.`)
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
  }

  const handleHardDelete = (rows) => {
    const dataObjects = rows.map((r) => r.original)
    setRowsToDelete(dataObjects)
    setOpenDeleteDialog(true)
  }

  const confirmHardDelete = () => {
    setOpenDeleteDialog(false)
    if (rowsToDelete.length === 0) return
    rowsToDelete.forEach((d) => {
      deleteDespliegue({ variables: { id: d.id } })
    })
    toast.success(`${rowsToDelete.length} registro(s) eliminado(s) permanentemente.`) 
    table.toggleAllRowsSelected(false)
    closeAllDialogs()
    setRowsToDelete([]) 
  }

  // --- FILTRADO ---
  const filteredData = useMemo(() => {
    if (!despliegues) return []
    return despliegues.filter((d) =>
      showDeleted ? d.estado === 'INACTIVO' : d.estado === 'ACTIVO'
    )
  }, [despliegues, showDeleted])

  /* -----------------------------------------------------------------
   * COLUMNAS
   * ----------------------------------------------------------------- */
  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 }, 

      {
        id: 'componente',
        header: 'Componente',
        minSize: 150, 
        accessorFn: (row) => deploymentHelpers.componenteNombre(row),
        Cell: ({ row }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight={600} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
                {deploymentHelpers.componenteNombre(row.original)}
                </Typography>
            </Box>
        ),
      },
      
      {
        id: 'sistema',
        header: 'Sistema',
        size: 50,
        accessorFn: (row) => deploymentHelpers.sistemaSigla(row),
        Cell: ({ row }) => {
            const sistemaSigla = deploymentHelpers.sistemaSigla(row.original)
            const sistemaId = row.original.componentes?.sistemas?.id
            
            if (!sistemaSigla || !sistemaId) {
                return <Chip label={sistemaSigla || '-'} size="small" variant="outlined" sx={{ fontWeight: 'bold', borderColor: theme.palette.divider }} />
            }
            return (
                <Link to={routes.sistema({ id: sistemaId })} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Chip 
                        label={sistemaSigla} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                            fontWeight: 'bold', 
                            color: theme.palette.primary.main, 
                            borderColor: theme.palette.primary.light,
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: theme.palette.primary.light }
                        }}
                    />
                </Link>
            )
        },
      },
      
      {
        id: 'recursoDestino',
        header: 'Recurso Destino',
        accessorFn: (row) => deploymentHelpers.recursoDestino(row).nombre,
        Cell: ({ row }) => {
            const recurso = deploymentHelpers.recursoDestino(row.original)
            if (recurso.nombre === '-') return '-'

            const Content = (
                <Stack direction="row" spacing={1} alignItems="center">
                    <recurso.icon color={row.original.estado === 'INACTIVO' ? 'disabled' : 'info'} fontSize="small" />
                    <Typography variant="body2" fontWeight={500} color={row.original.estado === 'INACTIVO' ? 'text.disabled' : 'text.primary'}>
                        {recurso.nombre}
                    </Typography>
                    <Chip 
                        label={recurso.tipo} 
                        size="small" 
                        variant="filled" 
                        color="default"
                        sx={{ fontSize: '0.65rem', height: 20, opacity: 0.7 }}
                    />
                </Stack>
            )
            return recurso.route ? (
                <Link to={recurso.route({ id: recurso.id })} style={{ textDecoration: 'none', color: 'inherit' }}>{Content}</Link>
            ) : Content
        },
      },

      {
        id: 'cluster',
        header: 'Cluster',
        accessorFn: (row) => deploymentHelpers.clusterInfo(row)?.nombre || '-',
        Cell: ({ row }) => {
            const cluster = deploymentHelpers.clusterInfo(row.original)
            if (!cluster) return '-'
            return (
                <Link to={routes.cluster({ id: cluster.id })} style={{ textDecoration: 'none', fontWeight: 600, color: theme.palette.info.main }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ClusterIcon fontSize="small" />
                        {cluster.nombre}
                    </Box>
                </Link>
            )
        }
      },

      // --- NUEVOS CAMPOS ---
      {
        id: 'tipoAccion',
        header: 'Acción',
        accessorFn: (row) => deploymentHelpers.tipoDespliegueNombre(row),
        size: 100,
        Cell: ({ row }) => {
            const val = deploymentHelpers.tipoDespliegueNombre(row.original);
            if (val === '-') return '-';
            return (
                <Chip 
                    icon={<TypeIcon style={{fontSize: 14}}/>}
                    label={val} 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    sx={{ fontSize: '0.75rem', height: 24 }}
                />
            )
        }
      },
      {
        accessorKey: 'version_aplicacion',
        header: 'Versión',
        size: 80,
        Cell: ({ cell }) => cell.getValue() ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VersionIcon fontSize="small" sx={{ opacity: 0.6, fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{cell.getValue()}</Typography>
            </Box>
        ) : '-'
      },
      {
        accessorKey: 'git_commit',
        header: 'Commit',
        size: 90,
        Cell: ({ cell }) => cell.getValue() ? (
            <Tooltip title={cell.getValue()}>
                <Chip 
                    icon={<CommitIcon style={{fontSize: 14}}/>}
                    label={cell.getValue().substring(0,7)} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem', height: 24 }}
                />
            </Tooltip>
        ) : '-'
      },
      // ---------------------

      {
        accessorKey: 'fecha_despliegue',
        header: 'F. Despliegue',
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },

      {
        accessorKey: 'fecha_solicitud',
        header: 'F. Solicitud',
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },

      {
        id: 'tipoRespaldo',
        header: 'Tipo Respaldo',
        accessorFn: (row) => deploymentHelpers.respaldoNombre(row),
        Cell: ({ row }) => (
            <Chip 
                label={deploymentHelpers.respaldoNombre(row.original)}
                size="small"
                variant="outlined"
            />
        ),
      },
      
      {
        id: 'estadoDespliegue',
        header: 'Estado Despliegue',
        accessorFn: (row) => deploymentHelpers.estadoDespliegueNombre(row),
        Cell: ({ row }) => {
            const estadoNombre = deploymentHelpers.estadoDespliegueNombre(row.original);
            const estadoCodigo = (row.original.estadoDespliegueInfo?.codigo || row.original.estado_despliegue || '').toUpperCase();
            
            let chipColor = 'default';
            if (estadoCodigo.includes('COMPLETADO') || estadoCodigo.includes('FINALIZADO') || estadoCodigo.includes('OK')) {
                chipColor = 'success';
            } else if (estadoCodigo.includes('INICIADO') || estadoCodigo.includes('PROCESO')) {
                chipColor = 'warning';
            } else if (estadoCodigo.includes('ERROR') || estadoCodigo.includes('FALLIDO') || estadoCodigo.includes('CANCELADO')) {
                chipColor = 'error';
            } else if (estadoCodigo.includes('PENDIENTE') || estadoCodigo.includes('CREADO')) {
                chipColor = 'info';
            }

            return (
              <Chip 
                  label={estadoNombre}
                  size="small"
                  variant="filled" // CAMBIO REALIZADO: Ahora es relleno (sólido)
                  color={chipColor}
                  sx={{ fontSize: '0.7rem', fontWeight: 'bold' }} // Agregado negrita para contraste
              />
            )
        },
      },

      { accessorKey: 'unidad_solicitante', header: 'Unidad' }, 
      
      { accessorKey: 'solicitante', header: 'Solicitante' }, 
      
      {
        accessorKey: 'estado',
        header: 'Estado (Soft)',
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'}
            size="small"
            variant="filled"
            sx={{ fontSize: '0.7rem', fontWeight: 600 }}
          />
        ),
      },

      { 
        accessorKey: 'fecha_creacion', 
        header: 'F. Creación', 
        Cell: ({ cell }) => formatDateTime(cell.getValue()) 
      },
      { 
        id: 'creadoPor',
        header: 'Creado por', 
        accessorFn: (row) => formatUser(row.creadoPor)
      },
      { 
        accessorKey: 'fecha_modificacion', 
        header: 'F. Modificación', 
        Cell: ({ cell }) => formatDateTime(cell.getValue()) 
      },
      { 
        id: 'modificadoPor',
        header: 'Modif. por', 
        accessorFn: (row) => formatUser(row.modificadoPor)
      },
      
    ],
    [deploymentHelpers, theme]
  )

  // --- MRT CONFIG ---
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableColumnResizing: true, 
    enableRowActions: true,
    enableRowSelection: true,
    enableGlobalFilter: true,
    layoutMode: 'semantic', 
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: { 
        id: false,
        descripcion: false,
        solicitante: false,
        unidad_solicitante: false,
        estado: false,
        fecha_solicitud: false,
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
        px: 2, py: 1,
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
      sx: { pl: 1, pr: 1, backgroundColor: 'background.paper', mb: 1 }
    },
    muiBottomToolbarProps: {
        sx: { backgroundColor: 'background.paper', border: 'none', boxShadow: 'none' }
    },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Despliegues</Typography>
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
        whiteSpace: 'nowrap', 
      }
    },
    muiTableBodyCellProps: {
      sx: {
        borderBottom: `1px solid ${theme.palette.divider}`,
      }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        '&:hover': { backgroundColor: theme.palette.action.hover },
      }
    }),
    renderRowActions: ({ row }) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Ver Detalles">
          <IconButton component={Link} to={routes.despliegue({ id: row.original.id })} size="small">
            <VisibilityIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editDespliegue({ id: row.original.id })} size="small">
            <EditIcon fontSize="small" color="info" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  })

  // --- EXPORTAR ---
  const handleExport = (scope, suffix, format) => {
    let rowsToExport = []
    if (scope === 'page') {
      const allRows = table.getPrePaginationRowModel().rows
      const { pageIndex, pageSize } = table.getState().pagination
      rowsToExport = allRows.slice(pageIndex * pageSize, (pageIndex * pageSize) + pageSize)
    }
    if (scope === 'all') rowsToExport = table.getPrePaginationRowModel().rows
    if (scope === 'selected') rowsToExport = table.getSelectedRowModel().rows

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

  // --- ACTIONS LAYOUT ---
  const listActionsConfig = useMemo(() => {
    const selectedRowCount = table.getSelectedRowModel().rows.length
    
    const ExportMenu = (
      <Menu anchorEl={exportMenuAnchorEl} open={Boolean(exportMenuAnchorEl)} onClose={closeAllDialogs}>
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" color="text.secondary" fontWeight={700}>EXCEL</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'excel')}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'excel')} disabled={selectedRowCount === 0}><ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
        <Divider />
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" color="text.secondary" fontWeight={700}>PDF</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'pdf')}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'pdf')} disabled={selectedRowCount === 0}><ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
        <Divider />
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}><Typography variant="caption" color="text.secondary" fontWeight={700}>CSV</Typography></Box>
        <MenuItem onClick={() => handleExport('page', '-Pagina', 'csv')}><ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Página Actual</MenuItem>
        <MenuItem onClick={() => handleExport('selected', '-Seleccionados', 'csv')} disabled={selectedRowCount === 0}><ListItemIcon><CsvIcon fontSize="small" color="info" /></ListItemIcon> Selección ({selectedRowCount})</MenuItem>
      </Menu>
    )

    const BulkActionMenu = (
      <Menu anchorEl={bulkMenuAnchorEl} open={Boolean(bulkMenuAnchorEl)} onClose={closeAllDialogs}>
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
        if (selectedRowCount === 0) { toast.error('Debe seleccionar al menos un registro.'); return; }
        if (showDeleted) { handleSoftDelete(table.getSelectedRowModel().rows.map(r => r.original)) } 
        else { setBulkMenuAnchorEl(e.currentTarget) }
      },
      handleExportClick: (e) => setExportMenuAnchorEl(e.currentTarget),
      exportMenu: ExportMenu,
      bulkActionMenu: BulkActionMenu,
    }
  }, [table, showDeleted, exportMenuAnchorEl, bulkMenuAnchorEl, table.getState().rowSelection, table.getState().pagination])

  const namesToDelete = rowsToDelete.length === 1 ? rowsToDelete[0]?.componentes?.nombre || `el despliegue ID ${rowsToDelete[0]?.id}` : `${rowsToDelete.length} registros`

  return (
    <ScaffoldLayout
      title="Despliegues"
      titleTo="despliegues"
      groupTitle="Despliegues"
      buttonLabel="Nuevo Despliegue"
      buttonTo="newDespliegue"
      listActionsConfig={listActionsConfig}
    >
      <MaterialReactTable table={table} />
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>ADVERTENCIA: ¡Eliminación Definitiva!</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Estás a punto de eliminar **{namesToDelete}** de forma permanente.<br />**Esta acción es irreversible** y eliminará los datos de la base de datos.<br />¿Deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDeleteDialog(false); setRowsToDelete([]); }} color="primary">Cancelar</Button>
          <Button onClick={confirmHardDelete} color="error" variant="contained" autoFocus>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </ScaffoldLayout>
  )
}

export default Despliegues