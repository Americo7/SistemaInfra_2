import React, { useState, useMemo } from 'react'
import {
  ArrowBack as ArrowBackIcon,
  Computer as ComputerIcon,
  MemoryOutlined as MemoryIcon,
  Storage as StorageIcon,
  DeviceHub as DeviceHubIcon,
  FileDownload as FileDownloadIcon,
  Visibility as VisibilityIcon,
  Storage,
  Close as CloseIcon,
} from '@mui/icons-material'
import {
  Box,
  Breadcrumbs,
  Chip,
  IconButton,
  Link as MuiLink,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  Typography,
  Button,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import * as XLSX from 'xlsx-js-style'

import { Link, routes, navigate } from '@redwoodjs/router'
import { useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

const ServerTypeIcon = React.memo(({ type }) => {
  switch (type) {
    case 'CHASIS': return <DeviceHubIcon fontSize="large" sx={{ color: '#1976d2' }} />
    case 'BLADE': return <MemoryIcon fontSize="large" sx={{ color: '#2e7d32' }} />
    case 'RACK': return <StorageIcon fontSize="large" sx={{ color: '#ed6c02' }} />
    case 'TORRE': return <ComputerIcon fontSize="large" sx={{ color: '#9c27b0' }} />
    default: return <DeviceHubIcon fontSize="large" sx={{ color: '#d32f2f' }} />
  }
})

const TypeChip = React.memo(({ type }) => (
  <Chip
    label={type}
    color={{
      CHASIS: 'primary',
      BLADE: 'success',
      RACK: 'warning',
      TORRE: 'secondary',
    }[type] || 'error'}
    variant="outlined"
  />
))

const StatusChip = React.memo(({ status }) => (
  <Chip
    label={status === 'ACTIVO' ? 'Activo' : 'Inactivo'}
    color={status === 'ACTIVO' ? 'success' : 'error'}
    size="small"
  />
))

const GET_DATA_CENTER_WITH_SERVERS = gql`
  query DataCenterWithServers($id: Int!) {
    dataCenter(id: $id) {
      id
      nombre
      estado
      servidores {
        id
        nombre
        cod_inventario_agetic
        ram
        almacenamiento
        estado_operativo
        estado
        marca
        modelo
        cod_tipo_servidor
        fecha_creacion
        id_padre
      }
    }
  }
`

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

const DataCenterServidor = ({ id }) => {
  const [activeTab, setActiveTab] = useState('all')
  const [exportMenuAnchor, setExportMenuAnchor] = useState({ all: null, page: null, selection: null })
  const [showInactive, setShowInactive] = useState(false)
  const [selectedServerId, setSelectedServerId] = useState(null)
  const [bladesDialogOpen, setBladesDialogOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { loading, error, data } = useQuery(GET_DATA_CENTER_WITH_SERVERS, {
    variables: { id: parseInt(id) },
    fetchPolicy: 'cache-and-network',
  })

  // Procesamos los servidores para identificar los blade que pertenecen a cada chasis
  const processedData = useMemo(() => {
    if (!data?.dataCenter?.servidores) return { serverCounts: {}, filteredServers: [], bladesByChasis: {} }

    const servers = data.dataCenter.servidores
    const counts = {
      all: servers.length,
      CHASIS: 0,
      BLADE: 0,
      RACK: 0,
      TORRE: 0,
    }

    const bladesByChasis = {}

    servers.forEach(server => {
      if (server.cod_tipo_servidor in counts) counts[server.cod_tipo_servidor]++

      // Agrupamos los blades por su chasis padre
      if (server.cod_tipo_servidor === 'BLADE' && server.id_padre) {
        if (!bladesByChasis[server.id_padre]) {
          bladesByChasis[server.id_padre] = []
        }
        bladesByChasis[server.id_padre].push(server)
      }
    })

    const filtered = servers.filter(server => {
      const typeMatch = activeTab === 'all' || server.cod_tipo_servidor === activeTab
      const statusMatch = showInactive || server.estado === 'ACTIVO'
      return typeMatch && statusMatch
    })

    return { serverCounts: counts, filteredServers: filtered, bladesByChasis }
  }, [data, activeTab, showInactive])

  const getFormattedData = (rows, table) => {
    const visibleColumns = table.getVisibleLeafColumns()
      .filter(column => !['mrt-row-actions', 'mrt-row-select'].includes(column.id))

    return {
      headers: visibleColumns.map(column => column.columnDef.header),
      data: rows.map(row => visibleColumns.map(column => {
        const cellValue = row.original[column.id] || 'N/A'
        if (column.id === 'fecha_creacion') return formatDateTime(cellValue)
        if (column.id === 'estado') return cellValue === 'ACTIVO' ? 'Activo' : 'Inactivo'
        if (column.id === 'cod_tipo_servidor') return getTypeLabel(cellValue)
        return cellValue.toString().substring(0, 100)
      }))
    }
  }

  const exportToPDF = (rows, table) => {
    const { headers, data: exportData } = getFormattedData(rows, table)
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })
    const dataCenterName = data?.dataCenter?.nombre || 'Sin nombre'
    const reportType = activeTab === 'all' ? 'Todos' : getTypeLabel(activeTab)

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 40, 77)
    doc.text(`REPORTE DE SERVIDORES - ${reportType.toUpperCase()}`, 14, 15)
    doc.setFontSize(12)
    doc.text(`Data Center: ${dataCenterName}`, 14, 22)
    doc.text(`Generado: ${formatDateTime(new Date())} | Total: ${rows.length}`, 14, 28)

    autoTable(doc, {
      head: [headers.map(h => ({ content: h, styles: { fillColor: [15, 40, 77], textColor: 255 } }))],
      body: exportData.map((row, i) => row.map(cell => ({
        content: cell,
        styles: { fillColor: i % 2 === 0 ? [248, 249, 250] : [255, 255, 255] }
      }))),
      startY: 35,
      styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
      margin: { left: 10, right: 10 }
    })

    doc.save(`Servidores-${dataCenterName}-${reportType}-${new Date().toISOString()}.pdf`)
  }

  const exportToExcel = (rows, table) => {
    const { headers, data: exportData } = getFormattedData(rows, table)
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])
    const dataCenterName = data?.dataCenter?.nombre || 'Sin nombre'
    const reportType = activeTab === 'all' ? 'Todos' : getTypeLabel(activeTab)

    XLSX.utils.sheet_add_aoa(ws, [
      [`REPORTE DE SERVIDORES - ${reportType.toUpperCase()}`],
      [`Data Center: ${dataCenterName}`],
      [`Generado: ${formatDateTime(new Date())} | Total: ${rows.length}`],
      [],
      headers
    ], { origin: 'A1' })

    XLSX.utils.sheet_add_aoa(ws, exportData, { origin: 'A5' })
    XLSX.utils.book_append_sheet(wb, ws, 'Servidores')
    XLSX.writeFile(wb, `Servidores-${dataCenterName}-${reportType}-${new Date().toISOString()}.xlsx`)
  }

  const exportToCSV = (rows, table) => {
    const { headers, data: exportData } = getFormattedData(rows, table)
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `Servidores-${data?.dataCenter?.nombre}-${activeTab}-${new Date().toISOString()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTypeLabel = (type) => ({
    CHASIS: 'Chasis',
    BLADE: 'Blade',
    RACK: 'Rack',
    TORRE: 'Torre'
  }[type] || 'TODOS')

  const handleViewBlades = (serverId) => {
    setSelectedServerId(serverId)
    setBladesDialogOpen(true)
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ServerTypeIcon type={row.original.cod_tipo_servidor} />
          {row.original.nombre}
        </Box>
      ),
      size: 200
    },
    { accessorKey: 'cod_inventario_agetic', header: 'Inventario', size: 150 },
    { accessorKey: 'cod_tipo_servidor', header: 'Tipo', Cell: ({ row }) => <TypeChip type={row.original.cod_tipo_servidor} /> },
    { accessorKey: 'marca', header: 'Marca', size: 120 },
    { accessorKey: 'modelo', header: 'Modelo', size: 120 },
    { accessorKey: 'ram', header: 'RAM (GB)', size: 100 },
    { accessorKey: 'almacenamiento', header: 'Almacenamiento (GB)', size: 140 },
    { accessorKey: 'estado', header: 'Estado', Cell: ({ row }) => <StatusChip status={row.original.estado} /> },
    { accessorKey: 'fecha_creacion', header: 'Fecha Creación', Cell: ({ cell }) => formatDateTime(cell.getValue()) },
  ], [])

  const bladeColumns = useMemo(() => [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ServerTypeIcon type="BLADE" />
          {row.original.nombre}
        </Box>
      ),
      size: 200
    },
    { accessorKey: 'cod_inventario_agetic', header: 'Inventario', size: 150 },
    { accessorKey: 'marca', header: 'Marca', size: 120 },
    { accessorKey: 'modelo', header: 'Modelo', size: 120 },
    { accessorKey: 'ram', header: 'RAM (GB)', size: 100 },
    { accessorKey: 'almacenamiento', header: 'Almacenamiento (GB)', size: 140 },
    { accessorKey: 'estado', header: 'Estado', Cell: ({ row }) => <StatusChip status={row.original.estado} /> },
    { accessorKey: 'fecha_creacion', header: 'Fecha Creación', Cell: ({ cell }) => formatDateTime(cell.getValue()) },
  ], [])

  const table = useMaterialReactTable({
    columns,
    data: processedData.filteredServers,
    enableRowActions: true,
    enableRowSelection: true,
    state: { isLoading: loading },
    muiTableContainerProps: { sx: { maxHeight: 'calc(100vh - 300px)' } },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '4px' }}>
        <Tooltip title="Ver detalles">
          <IconButton onClick={() => navigate(routes.servidor({ id: row.original.id }))}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {row.original.cod_tipo_servidor === 'CHASIS' ? (
          <Tooltip title="Ver Blades">
            <IconButton onClick={() => handleViewBlades(row.original.id)}>
              <MemoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Ver Máquinas">
            <IconButton onClick={() => navigate(routes.maquinasFiltradas({ id: row.original.id }))}>
              <DeviceHubIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {['all', 'page', 'selection'].map((type) => (
          <React.Fragment key={type}>
            <Button
              size="small"
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={(e) => setExportMenuAnchor(prev => ({ ...prev, [type]: e.currentTarget }))}
              disabled={type === 'selection' && !table.getSelectedRowModel().rows.length}
              sx={{ bgcolor: '#0F284D', '&:hover': { bgcolor: '#1A3D6D' } }}
            >
              {isMobile ? (
                type === 'all' ? 'Todos' :
                type === 'page' ? 'Página' : `Sel. (${table.getSelectedRowModel().rows.length})`
              ) : (
                `Exportar ${type === 'all' ? 'Todos' : type === 'page' ? 'Página' : `Selección (${table.getSelectedRowModel().rows.length})`}`
              )}
            </Button>
            <Menu
              anchorEl={exportMenuAnchor[type]}
              open={Boolean(exportMenuAnchor[type])}
              onClose={() => setExportMenuAnchor(prev => ({ ...prev, [type]: null }))}
            >
              {['PDF', 'Excel', 'CSV'].map(format => (
                <MenuItem key={format} onClick={() => {
                  const rows = {
                    all: table.getPrePaginationRowModel().rows,
                    page: table.getRowModel().rows,
                    selection: table.getSelectedRowModel().rows
                  }[type]

                  if (format === 'PDF') exportToPDF(rows, table)
                  if (format === 'Excel') exportToExcel(rows, table)
                  if (format === 'CSV') exportToCSV(rows, table)

                  setExportMenuAnchor(prev => ({ ...prev, [type]: null }))
                }}>
                  {format}
                </MenuItem>
              ))}
            </Menu>
          </React.Fragment>
        ))}
        <Button
          size="small"
          color={showInactive ? 'error' : 'success'}
          variant="outlined"
          onClick={() => setShowInactive(!showInactive)}
        >
          {showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
        </Button>
      </Box>
    )
  })

  // Tabla para los blades específicos de un chasis
  const selectedChasisBlades = useMemo(() => {
    if (!selectedServerId || !processedData.bladesByChasis) return []
    return processedData.bladesByChasis[selectedServerId] || []
  }, [selectedServerId, processedData.bladesByChasis])

  const bladesTable = useMaterialReactTable({
    columns: bladeColumns,
    data: selectedChasisBlades,
    enableRowActions: true,
    enablePagination: false,
    initialState: {
      density: 'compact',
    },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '4px' }}>
        <Tooltip title="Ver detalles">
          <IconButton onClick={() => {
            setBladesDialogOpen(false)
            navigate(routes.servidor({ id: row.original.id }))
          }}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ver Máquinas">
          <IconButton onClick={() => {
            setBladesDialogOpen(false)
            navigate(routes.maquinasFiltradas({ id: row.original.id }))
          }}>
            <DeviceHubIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    )
  })

  if (error) {
    toast.error('Error cargando data center')
    navigate(routes.dataCenters())
    return null
  }

  const selectedChasisName = useMemo(() => {
    if (!selectedServerId || !data?.dataCenter?.servidores) return ''
    const chasis = data.dataCenter.servidores.find(s => s.id === selectedServerId)
    return chasis ? chasis.nombre : ''
  }, [selectedServerId, data])

  return (
    <Box sx={{ p: 2, maxWidth: '100%', overflow: 'hidden' }}>
      <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
        <Breadcrumbs sx={{ mb: 2, fontSize: '0.9rem' }}>
          <MuiLink component={Link} to={routes.home()} underline="hover">Dashboard</MuiLink>
          <MuiLink component={Link} to={routes.dataCenters()} underline="hover">Data Centers</MuiLink>
          <Typography fontWeight="bold" color="#0F284D">
            {data?.dataCenter?.nombre || 'Cargando...'}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0F284D' }}>
            <Storage fontSize="large" />
            {data?.dataCenter?.nombre || 'Data Center'}
            <Chip
              label={data?.dataCenter?.estado || '...'}
              color={data?.dataCenter?.estado === 'ACTIVO' ? 'success' : 'error'}
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(routes.dataCenters())}
            variant="outlined"
          >
            Volver
          </Button>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {Object.entries(processedData.serverCounts).map(([type, count]) => (
            <Tab
              key={type}
              value={type}
              label={`${getTypeLabel(type)} (${count})`}
              sx={{ minWidth: isMobile ? 100 : 150 }}
            />
          ))}
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <MaterialReactTable table={table} />
        )}
      </Paper>

      {/* Modal para mostrar los Blades de un chassis */}
      <Dialog
        open={bladesDialogOpen}
        onClose={() => setBladesDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#0F284D', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeviceHubIcon />
            <Typography variant="h6">
              Blades del servidor Chasis: {selectedChasisName}
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setBladesDialogOpen(false)}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 0, pt: 2 }}>
          {selectedChasisBlades.length === 0 ? (
            <Typography sx={{ py: 4, textAlign: 'center' }}>
              Este chasis no tiene servidores Blade asociados.
            </Typography>
          ) : (
            <MaterialReactTable table={bladesTable} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBladesDialogOpen(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default React.memo(DataCenterServidor)
