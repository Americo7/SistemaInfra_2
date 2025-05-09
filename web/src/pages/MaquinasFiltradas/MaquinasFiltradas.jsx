import React, { useState, useMemo } from 'react'
import {
  ArrowBack as ArrowBackIcon,
  Computer as ComputerIcon,
  MemoryOutlined as MemoryIcon,
  Storage as StorageIcon,
  MoreVert as MoreVertIcon,
  SettingsEthernet as SettingsEthernetIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FileDownload as FileDownloadIcon,
  Visibility as VisibilityIcon,
  DeviceHub as DeviceHubIcon,
} from '@mui/icons-material'
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Grid,
  IconButton,
  Link as MuiLink,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import * as XLSX from 'xlsx-js-style'

import { Link, routes, navigate } from '@redwoodjs/router'
import { useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

const GET_SERVER_WITH_MACHINES = gql`
  query ServerWithMachines($id: Int!) {
    servidor(id: $id) {
      id
      nombre
      cod_tipo_servidor
      cod_inventario_agetic
      estado_operativo
      marca
      modelo
      id_padre

      data_center {
        id
        nombre
      }
      asignacion_servidor_maquina {
        maquinas {
          id
          nombre
          codigo
          ip
          so
          ram
          almacenamiento
          cpu
          estado
          cod_plataforma
          es_virtual
          fecha_creacion
          usuario_creacion
        }
      }
    }
  }
`

const ServerTypeIcon = React.memo(({ type }) => {
  switch (type) {
    case 'CHASIS': return <StorageIcon fontSize="large" sx={{ color: '#1976d2' }} />
    case 'BLADE': return <MemoryIcon fontSize="large" sx={{ color: '#2e7d32' }} />
    case 'RACK': return <StorageIcon fontSize="large" sx={{ color: '#ed6c02' }} />
    case 'TORRE': return <ComputerIcon fontSize="large" sx={{ color: '#9c27b0' }} />
    default: return <ComputerIcon fontSize="large" sx={{ color: '#d32f2f' }} />
  }
})

const PlatformIcon = React.memo(({ code }) => {
  switch (code) {
    case 1: return <StorageIcon fontSize="small" sx={{ color: '#ff9800' }} /> // Linux
    case 2: return <ComputerIcon fontSize="small" sx={{ color: '#2196f3' }} /> // Windows
    case 3: return <MemoryIcon fontSize="small" sx={{ color: '#4caf50' }} /> // VMware
    default: return <SettingsEthernetIcon fontSize="small" sx={{ color: '#9e9e9e' }} />
  }
})

const StatusChip = React.memo(({ status }) => (
  <Chip
    label={status === 'ACTIVO' ? 'Activo' : 'Inactivo'}
    color={status === 'ACTIVO' ? 'success' : 'error'}
    size="small"
  />
))

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatStorage = (storageData) => {
  if (!storageData) return 'N/A'

  // Si es array de discos
  if (Array.isArray(storageData)) {
    return storageData.map(disk => (
      <div key={disk.Disco}>
        Disco {disk.Disco}: {disk.Valor}GB
      </div>
    ))
  }

  // Si es objeto simple
  if (typeof storageData === 'object') {
    return `${storageData.Valor || storageData.Disco || 'N/A'}GB`
  }

  // Valor directo
  return `${storageData}GB`
}

const formatRam = (ramData) => {
  if (!ramData) return 'N/A'
  return typeof ramData === 'object' ? ramData.Valor || 'N/A' : ramData
}

const MaquinasFiltradas = ({ id }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [exportMenuAnchor, setExportMenuAnchor] = useState({ all: null, page: null, selection: null })
  const [showInactive, setShowInactive] = useState(false)

  const { loading, error, data } = useQuery(GET_SERVER_WITH_MACHINES, {
    variables: { id: parseInt(id) },
    fetchPolicy: 'network-only',
  })

  const servidor = data?.servidor
  const serverType = servidor?.cod_tipo_servidor

  const filteredMachines = useMemo(() => {
    if (!servidor?.asignacion_servidor_maquina) return []

    return servidor.asignacion_servidor_maquina.flatMap(asignacion => {
      const maquinas = Array.isArray(asignacion?.maquinas)
        ? asignacion.maquinas
        : asignacion?.maquinas ? [asignacion.maquinas] : []

      return maquinas.filter(m => showInactive || m.estado === 'ACTIVO')
    })
  }, [servidor, showInactive])

  const getFormattedData = (rows, table) => {
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter(column => column.id !== 'mrt-row-actions' && column.id !== 'mrt-row-select')

    const headers = visibleColumns.map(column => column.columnDef.header)

    return {
      headers,
      data: rows.map(row =>
        visibleColumns.map(column => {
          const cellValue = row.original[column.id] || 'N/A'

          if (column.id === 'fecha_creacion') return formatDateTime(cellValue)
          if (column.id === 'estado') return cellValue === 'ACTIVO' ? 'Activo' : 'Inactivo'
          if (column.id === 'es_virtual') return cellValue ? 'Virtual' : 'Física'
          if (column.id === 'cod_plataforma') return getPlatformName(cellValue)
          if (column.id === 'almacenamiento') {
            if (Array.isArray(cellValue)) {
              return cellValue.map(disk => `Disco ${disk.Disco}: ${disk.Valor}GB`).join(' | ')
            }
            return typeof cellValue === 'object'
              ? `${cellValue.Valor || cellValue.Disco || 'N/A'}GB`
              : `${cellValue}GB`
          }
          if (column.id === 'ram') {
            return typeof cellValue === 'object' ? cellValue.Valor || 'N/A' : cellValue
          }
          return cellValue.toString().substring(0, 100)
        })
      ),
    }
  }

  const exportToPDF = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })
    const serverName = servidor?.nombre || 'Servidor desconocido'
    const dataCenterName = servidor?.data_center?.nombre || 'Data Center desconocido'

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 40, 77)
    doc.text(`REPORTE DE MÁQUINAS - ${serverName.toUpperCase()}`, 14, 15)
    doc.setFontSize(12)
    doc.text(`Data Center: ${dataCenterName}`, 14, 22)
    doc.text(`Generado: ${formatDateTime(new Date())} | Total: ${rows.length}`, 14, 29)

    autoTable(doc, {
      head: [headers.map(h => ({
        content: h,
        styles: { fillColor: [15, 40, 77], textColor: 255, fontStyle: 'bold' }
      }))],
      body: data.map((row, i) => row.map(cell => ({
        content: cell,
        styles: { fillColor: i % 2 === 0 ? [248, 249, 250] : [255, 255, 255] }
      }))),
      startY: 35,
      styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
      margin: { left: 10, right: 10 }
    })

    doc.save(`Maquinas-${serverName}-${new Date().toISOString()}.pdf`)
  }

  const exportToExcel = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])
    const serverName = servidor?.nombre || 'Servidor desconocido'
    const dataCenterName = servidor?.data_center?.nombre || 'Data Center desconocido'

    XLSX.utils.sheet_add_aoa(ws, [
      [`REPORTE DE MÁQUINAS - ${serverName.toUpperCase()}`],
      [`Data Center: ${dataCenterName}`],
      [`Generado: ${formatDateTime(new Date())} | Total: ${rows.length}`],
      [],
      headers
    ], { origin: 'A1' })

    XLSX.utils.sheet_add_aoa(ws, data, { origin: 'A5' })
    XLSX.utils.book_append_sheet(wb, ws, 'Máquinas')
    XLSX.writeFile(wb, `Maquinas-${serverName}-${new Date().toISOString()}.xlsx`)
  }

  const getPlatformName = (code) => ({
    VM_P: 'Proxmox',
    VM_O: 'OpenStack',
    BM: 'Bare Metal'
  }[code] || 'Otra')

  const columns = useMemo(() => [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      size: 200,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {row.original.es_virtual ? (
            <MemoryIcon fontSize="small" color="info" />
          ) : (
            <ComputerIcon fontSize="small" color="action" />
          )}
          <MuiLink
            component={Link}
            to={routes.maquina({ id: row.original.id })}
            sx={{
              color: 'inherit',
              '&:hover': {
                color: theme.palette.primary.main,
                textDecoration: 'underline'
              }
            }}
          >
            {row.original.nombre}
          </MuiLink>
        </Box>
      ),
    },
    { accessorKey: 'codigo', header: 'Código', size: 120 },
    { accessorKey: 'ip', header: 'IP', size: 120 },
    { accessorKey: 'so', header: 'Sistema Operativo', size: 150 },
    {
      accessorKey: 'ram',
      header: 'RAM (GB)',
      Cell: ({ cell }) => formatRam(cell.getValue()),
      size: 100
    },
    {
      accessorKey: 'almacenamiento',
      header: 'Almacenamiento',
      Cell: ({ cell }) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {formatStorage(cell.getValue())}
        </Box>
      ),
      size: 200
    },
    { accessorKey: 'cpu', header: 'CPU', size: 120 },
    {
      accessorKey: 'cod_plataforma',
      header: 'Plataforma',
      size: 120,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

      <Typography variant="body2">
        {getPlatformName(row.original.cod_plataforma)}
      </Typography>
    </Box>
      ),
    },
    {
      accessorKey: 'es_virtual',
      header: 'Tipo',
      size: 100,
      Cell: ({ row }) => (
        <Chip
          label={row.original.es_virtual ? 'Virtual' : 'Física'}
          color={row.original.es_virtual ? 'info' : 'default'}
          size="small"
        />
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 100,
      Cell: ({ row }) => <StatusChip status={row.original.estado} />,
    },
    {
      accessorKey: 'fecha_creacion',
      header: 'Fecha Creación',
      size: 150,
      Cell: ({ cell }) => formatDateTime(cell.getValue()),
    },
  ], [])

  const table = useMaterialReactTable({
    columns,
    data: filteredMachines,
    enableRowActions: true,
    enableRowSelection: true,
    initialState: { density: 'compact' },
    state: { isLoading: loading },
    muiTableContainerProps: { sx: { maxHeight: 'calc(100vh - 300px)' } },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '4px' }}>
        <Tooltip title="Ver detalles">
          <IconButton
            size="small"
            onClick={() => navigate(routes.maquina({ id: row.original.id }))}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().rows
      const hasSelection = selectedRows.length > 0

      return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>


          <Button
            disabled={table.getPrePaginationRowModel().rows.length === 0}
            onClick={(e) => setExportMenuAnchor({ ...exportMenuAnchor, all: e.currentTarget })}
            size="small"
            variant="contained"
            startIcon={<FileDownloadIcon />}
            sx={{ bgcolor: '#0F284D', '&:hover': { bgcolor: '#1A3D6D' } }}
          >
            {isMobile ? "Todos" : "Exportar Todos"}
          </Button>
          <Menu
            anchorEl={exportMenuAnchor.all}
            open={Boolean(exportMenuAnchor.all)}
            onClose={() => setExportMenuAnchor({ ...exportMenuAnchor, all: null })}
          >
            <MenuItem onClick={() => {
              exportToPDF(table.getPrePaginationRowModel().rows, table)
              setExportMenuAnchor({ ...exportMenuAnchor, all: null })
            }}>
              PDF
            </MenuItem>
            <MenuItem onClick={() => {
              exportToExcel(table.getPrePaginationRowModel().rows, table)
              setExportMenuAnchor({ ...exportMenuAnchor, all: null })
            }}>
              Excel
            </MenuItem>
          </Menu>

          <Button
            disabled={table.getRowModel().rows.length === 0}
            onClick={(e) => setExportMenuAnchor({ ...exportMenuAnchor, page: e.currentTarget })}
            size="small"
            variant="contained"
            startIcon={<FileDownloadIcon />}
            sx={{ bgcolor: '#0F284D', '&:hover': { bgcolor: '#1A3D6D' } }}
          >
            {isMobile ? "Página" : "Exportar Página"}
          </Button>
          <Menu
            anchorEl={exportMenuAnchor.page}
            open={Boolean(exportMenuAnchor.page)}
            onClose={() => setExportMenuAnchor({ ...exportMenuAnchor, page: null })}
          >
            <MenuItem onClick={() => {
              exportToPDF(table.getRowModel().rows, table)
              setExportMenuAnchor({ ...exportMenuAnchor, page: null })
            }}>
              PDF
            </MenuItem>
            <MenuItem onClick={() => {
              exportToExcel(table.getRowModel().rows, table)
              setExportMenuAnchor({ ...exportMenuAnchor, page: null })
            }}>
              Excel
            </MenuItem>
          </Menu>

          <Button
            disabled={!hasSelection}
            onClick={(e) => setExportMenuAnchor({ ...exportMenuAnchor, selection: e.currentTarget })}
            size="small"
            variant="contained"
            startIcon={<FileDownloadIcon />}
            sx={{ bgcolor: '#0F284D', '&:hover': { bgcolor: '#1A3D6D' } }}
          >
            {isMobile ? `Sel. (${hasSelection ? selectedRows.length : 0})` :
             `Exportar Selección (${hasSelection ? selectedRows.length : 0})`}
          </Button>
          <Menu
            anchorEl={exportMenuAnchor.selection}
            open={Boolean(exportMenuAnchor.selection)}
            onClose={() => setExportMenuAnchor({ ...exportMenuAnchor, selection: null })}
          >
            <MenuItem onClick={() => {
              exportToPDF(selectedRows, table)
              setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
            }}>
              PDF
            </MenuItem>
            <MenuItem onClick={() => {
              exportToExcel(selectedRows, table)
              setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
            }}>
              Excel
            </MenuItem>
          </Menu>
        </Box>
      )
    },
  })

  if (error) {
    toast.error('Error cargando el servidor')
    navigate(routes.dataCenters())
    return null
  }

  if (!servidor) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Servidor no encontrado</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(routes.dataCenters())}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2, maxWidth: '100%', overflow: 'hidden' }}>
      <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} to={routes.home()} underline="hover">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} to={routes.dataCenters()} underline="hover">
            Data Centers
          </MuiLink>
          <MuiLink
            component={Link}
            to={routes.dataCenterServidor({ id: servidor.data_center.id })}
            underline="hover"
          >
            {servidor.data_center.nombre}
          </MuiLink>
          <Typography>{servidor.nombre}</Typography>
        </Breadcrumbs>

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2
        }}>
          <Typography variant="h4" sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#0F284D'
          }}>
            <ServerTypeIcon type={serverType} />
            {servidor.nombre}
            <Chip
              label={servidor.estado_operativo}
              color={servidor.estado_operativo === 'OPERATIVO' ? 'success' : 'error'}
              size="small"
              icon={servidor.estado_operativo === 'OPERATIVO' ? <CheckCircleIcon /> : <ErrorIcon />}
              sx={{ ml: 1 }}
            />
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(routes.dataCenterServidor({ id: servidor.data_center.id }))}
            variant="outlined"
          >
            Volver
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Inventario:
            </Typography>
            <Typography>{servidor.cod_inventario_agetic || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Marca/Modelo:
            </Typography>
            <Typography>{servidor.marca} {servidor.modelo}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Data Center:
            </Typography>
            <Typography>{servidor.data_center.nombre}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Tipo:
            </Typography>
            <Chip
              label={serverType}
              color={{
                CHASIS: 'primary',
                BLADE: 'success',
                RACK: 'warning',
                TORRE: 'secondary',
              }[serverType] || 'error'}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Máquinas asignadas ({filteredMachines.length})
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <MaterialReactTable
            table={table}
            muiTablePaperProps={{ elevation: 0 }}
          />
        )}
      </Paper>
    </Box>
  )
}

export default React.memo(MaquinasFiltradas)


