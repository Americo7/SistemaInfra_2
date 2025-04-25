import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { useState, useMemo } from 'react'
import {
  Container, Box, Grid, Paper, Typography,
  Card, CardContent, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Divider, IconButton,
  Tooltip, LinearProgress, Badge, useTheme
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Dns as ServerIcon,
  Memory as ComponentIcon,
  CloudQueue as CloudIcon,
  Event as EventIcon,
  CheckCircle,
  Warning as WarningIcon,
  Sync as SyncIcon,
  Timeline as TimelineIcon,
  MoreVert as MoreIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  BarChart as ChartIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Storage as DataCenterIcon,
  Computer as ComputerIcon,
  FiberManualRecord as DotIcon
} from '@mui/icons-material'
import Chart from 'react-apexcharts'
import { useQuery } from '@redwoodjs/web'
import { styled, alpha } from '@mui/material/styles'



// Consultas GraphQL optimizadas
const GET_SYSTEMS = gql`
  query FindSystems {
    sistemas {
      id
      codigo
      nombre
      estado
      entidades {
        nombre
      }
      componentes {
        id
        estado
      }
      fecha_creacion
    }
  }
`

const GET_DEPLOYMENTS = gql`
  query FindDeployments {
    despliegues(limit: 5, orderBy: { fecha_despliegue: desc }) {
      id
      estado_despliegue
      fecha_despliegue
      componentes {
        nombre
      }
      maquinas {
        nombre
      }
    }
  }
`

const GET_EVENTS = gql`
  query FindEvents {
    eventos(limit: 2, orderBy: { fecha_evento: desc }) {
      id
      cod_tipo_evento
      descripcion
      fecha_evento
      estado_evento
      infra_afectada {
        data_centers {
          nombre
        }
      }
    }
  }
`

const GET_SERVERS = gql`
  query FindServers {
    servidores {
      id
      nombre
      cod_tipo_servidor
      estado_operativo
      data_center {
        nombre
      }
    }
  }
`

const GET_DATA_CENTERS = gql`
  query FindDataCenters_fromHomePage {
    dataCenters {
      id
      nombre
      ubicacion
      servidores {
        id
      }
    }
  }
`

const GET_MACHINES = gql`
  query FindMachines {
    maquinas {
      id
      nombre
      estado
      es_virtual
    }
  }
`
const GET_DEPLOYMENTS_HISTORY = gql`
  query FindDeploymentsHistory {
    despliegues(orderBy: { fecha_despliegue: asc }) {
      id
      estado_despliegue
      fecha_despliegue
    }
  }
`
// Componentes personalizados
const GlowCard = styled(Paper)(({ theme, glowcolor }) => ({
  borderRadius: '16px',
  boxShadow: `0 4px 20px 0 ${alpha(glowcolor || theme.palette.primary.main, 0.2)}`,
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 8px 30px 0 ${alpha(glowcolor || theme.palette.primary.main, 0.3)}`
  }
}))

const GradientAvatar = styled(Avatar)(({ gradient }) => ({
  background: gradient,
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
}))

const HomePage = () => {
  const theme = useTheme()

  // Consultas a la API con memoización
  const { data: systemsData, loading: systemsLoading } = useQuery(GET_SYSTEMS)
  const { data: deploymentsData, loading: deploymentsLoading } = useQuery(GET_DEPLOYMENTS)
  const { data: eventsData, loading: eventsLoading } = useQuery(GET_EVENTS)
  const { data: serversData, loading: serversLoading } = useQuery(GET_SERVERS)
  const { data: dataCentersData, loading: dataCentersLoading } = useQuery(GET_DATA_CENTERS)
  const { data: machinesData, loading: machinesLoading } = useQuery(GET_MACHINES)
  const { data: deploymentsHistoryData } = useQuery(GET_DEPLOYMENTS_HISTORY)
  // Estado para sistemas expandidos
  const [expandedSystems, setExpandedSystems] = useState({})

  // Calcular estadísticas con useMemo para optimización
  const systemStats = useMemo(() => {
    if (!systemsData) return { total: 0, active: 0, inactive: 0 }
    const active = systemsData.sistemas.filter(s => s.estado === 'ACTIVO').length
    const inactive = systemsData.sistemas.filter(s => s.estado === 'INACTIVO').length
    return { total: systemsData.sistemas.length, active, inactive }
  }, [systemsData])

  const deploymentStats = useMemo(() => {
    if (!deploymentsData) return { total: 0, started: 0, finished: 0 }
    const started = deploymentsData.despliegues.filter(d => d.estado_despliegue === 'INICIADO').length
    const finished = deploymentsData.despliegues.filter(d => d.estado_despliegue === 'FINALIZADO').length
    return { total: deploymentsData.despliegues.length, started, finished }
  }, [deploymentsData])

  const serverStats = useMemo(() => {
    if (!serversData) return { total: 0, types: {}, status: {} }
    const types = {}
    const status = {}
    serversData.servidores.forEach(server => {
      types[server.cod_tipo_servidor] = (types[server.cod_tipo_servidor] || 0) + 1
      status[server.estado_operativo] = (status[server.estado_operativo] || 0) + 1
    })
    return { total: serversData.servidores.length, types, status }
  }, [serversData])

  const eventStats = useMemo(() => {
    if (!eventsData) return { total: 0, maintenance: 0, incidents: 0 }
    const maintenance = eventsData.eventos.filter(e => e.cod_tipo_evento === 'MANTENIMIENTO').length
    const incidents = eventsData.eventos.filter(e => e.cod_tipo_evento === 'INCIDENTE').length
    return { total: eventsData.eventos.length, maintenance, incidents }
  }, [eventsData])

  const dataCenterStats = useMemo(() => {
    if (!dataCentersData) return { total: 0, servers: 0 }
    const totalServers = dataCentersData.dataCenters.reduce((sum, dc) => sum + (dc.servidores?.length || 0), 0)
    return { total: dataCentersData.dataCenters.length, servers: totalServers }
  }, [dataCentersData])

  const machineStats = useMemo(() => {
    if (!machinesData) return { total: 0, physical: 0, virtual: 0 }
    const physical = machinesData.maquinas.filter(m => !m.es_virtual).length
    const virtual = machinesData.maquinas.filter(m => m.es_virtual).length
    return { total: machinesData.maquinas.length, physical, virtual }
  }, [machinesData])


 // Procesar datos históricos de despliegues
 const deploymentHistoryData = useMemo(() => {
  if (!deploymentsHistoryData) return { series: [], categories: [] }

  const monthlyData = deploymentsHistoryData.despliegues.reduce((acc, deployment) => {
    const date = new Date(deployment.fecha_despliegue)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!acc[monthYear]) {
      acc[monthYear] = { started: 0, finished: 0 }
    }

    if (deployment.estado_despliegue === 'INICIADO') {
      acc[monthYear].started += 1
    } else if (deployment.estado_despliegue === 'FINALIZADO') {
      acc[monthYear].finished += 1
    }

    return acc
  }, {})

  const sortedMonths = Object.keys(monthlyData).sort()

  const categories = sortedMonths.map(month => {
    const [year, monthNum] = month.split('-')
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`
  })

  const startedData = sortedMonths.map(month => monthlyData[month].started)
  const finishedData = sortedMonths.map(month => monthlyData[month].finished)

  return {
    series: [
      { name: 'Despliegues Iniciados', data: startedData },
      { name: 'Despliegues Finalizados', data: finishedData }
    ],
    categories
  }
}, [deploymentsHistoryData])
  // Componentes de estado optimizados
  const StateChip = ({ estado }) => {
    switch(estado) {
      case 'ACTIVO': return <Chip size="small" icon={<CheckCircle />} label="Activo" color="success" sx={{ fontWeight: 600 }} />
      case 'INACTIVO': return <Chip size="small" icon={<ErrorIcon />} label="Inactivo" color="error" sx={{ fontWeight: 600 }} />
      default: return <Chip size="small" label={estado} sx={{ fontWeight: 600 }} />
    }
  }

  const DeploymentStateChip = ({ estado }) => {
    switch(estado) {
      case 'FINALIZADO': return <Chip size="small" icon={<CheckCircle />} label="Finalizado" color="success" sx={{ fontWeight: 600 }} />
      case 'INICIADO': return <Chip size="small" icon={<SyncIcon />} label="Iniciado" color="info" sx={{ fontWeight: 600 }} />
      default: return <Chip size="small" label={estado} sx={{ fontWeight: 600 }} />
    }
  }

  const EventTypeChip = ({ tipo }) => {
    switch(tipo) {
      case 'MANTENIMIENTO': return <Chip size="small" icon={<SettingsIcon />} label="Mantenimiento" color="info" sx={{ fontWeight: 600 }} />
      case 'INCIDENTE': return <Chip size="small" icon={<WarningIcon />} label="Incidente" color="warning" sx={{ fontWeight: 600 }} />
      default: return <Chip size="small" label={tipo} sx={{ fontWeight: 600 }} />
    }
  }

  // Opciones para gráficos 3D mejorados
  const deploymentChartOptions = {
    chart: {
      id: 'deployments-chart',
      toolbar: { show: false },
      foreColor: theme.palette.text.secondary,
      dropShadow: {
        enabled: true,
        top: 3,
        left: 3,
        blur: 4,
        opacity: 0.1
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      lineCap: 'round'
    },
 xaxis: {
      categories: deploymentHistoryData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
  yaxis: {
      show: true,
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    grid: {
      borderColor: alpha(theme.palette.divider, 0.1),
      strokeDashArray: 3,
      padding: { top: 0, right: 0, bottom: 0, left: 0 }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: [theme.palette.primary.main, theme.palette.secondary.main],
        shadeIntensity: 1,
        type: 'vertical',
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100]
      }
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      markers: { radius: 12 }
    },
    tooltip: {
      theme: theme.palette.mode,
      fillSeriesColor: false,
      marker: { show: false }
    },
    dataLabels: { enabled: false }
  }


  const systemStatusOptions = {
    chart: {
      type: 'donut',
      sparkline: { enabled: false },
      animations: { enabled: true, speed: 800 }
    },
    labels: ['Activos', 'Inactivos'],
    colors: [theme.palette.success.main, theme.palette.error.main],
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontFamily: theme.typography.fontFamily,
      markers: { radius: 12 }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: theme.palette.text.secondary,
              fontSize: '16px',
              fontFamily: theme.typography.fontFamily
            }
          }
        }
      }
    },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    tooltip: { theme: theme.palette.mode }
  }

  const serverStatusOptions = {
    chart: {
      type: 'donut',
      sparkline: { enabled: false },
      animations: { enabled: true, speed: 800 }
    },
    labels: Object.keys(serverStats.status || {}),
    colors: [
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main
    ],
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontFamily: theme.typography.fontFamily,
      markers: { radius: 12 }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: theme.palette.text.secondary,
              fontSize: '16px',
              fontFamily: theme.typography.fontFamily
            }
          }
        }
      }
    },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    tooltip: { theme: theme.palette.mode }
  }


  if (systemsLoading || deploymentsLoading || eventsLoading ||
    serversLoading || dataCentersLoading || machinesLoading) {
  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 6 }}>
      <LinearProgress color="primary" sx={{ height: 6, borderRadius: 3 }} />
    </Container>
  )
}

  return (
    <>
      <Metadata title="Panel de Control UIT" description="Panel de control general" />

      <Container maxWidth="xl" sx={{ mt: 3, mb: 6 }}>
        {/* Panel Principal */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" gutterBottom sx={{
                fontWeight: '700',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Panel de Control
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: '400' }}>
                Monitoreo y gestión centralizada de sistemas e infraestructura
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1
            }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                sx={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                disableElevation
                startIcon={<FilterIcon />}
                sx={{
                  borderRadius: '12px',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                Filtros
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Estadísticas Rápidas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Estadísticas de Sistemas */}
          <Grid item xs={12} sm={6} md={3}>
            <GlowCard glowcolor={theme.palette.primary.main}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: '600' }}>
                    Sistemas
                  </Typography>
                  <Typography variant="h2" sx={{ mt: 1, fontWeight: '700' }}>
                    {systemStats.total}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DotIcon sx={{ color: 'success.main', fontSize: '14px', mr: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: '600' }}>
                        {systemStats.active} activos
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DotIcon sx={{ color: 'error.main', fontSize: '14px', mr: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: '600' }}>
                        {systemStats.inactive} inactivos
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <GradientAvatar gradient={`linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`}>
                  <CloudIcon sx={{ fontSize: '1.5rem' }} />
                </GradientAvatar>
              </Box>
              <Divider />
              <Box sx={{ p: 2, bgcolor: 'action.hover', display: 'flex', justifyContent: 'center' }}>
                <Button
                  size="small"
                  component={Link}
                  to={routes.sistemas()}
                  endIcon={<ArrowDownIcon />}
                  sx={{ fontWeight: '600' }}
                >
                  Ver detalles
                </Button>
              </Box>
            </GlowCard>
          </Grid>

          {/* Estadísticas de Despliegues */}
          <Grid item xs={12} sm={6} md={3}>
            <GlowCard glowcolor="#ff9800">
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: '600' }}>
                    Despliegues
                  </Typography>
                  <Typography variant="h2" sx={{ mt: 1, fontWeight: '700' }}>
                    {deploymentStats.total}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DotIcon sx={{ color: 'info.main', fontSize: '14px', mr: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: '600' }}>
                        {deploymentStats.started} iniciados
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DotIcon sx={{ color: 'success.main', fontSize: '14px', mr: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: '600' }}>
                        {deploymentStats.finished} finalizados
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <GradientAvatar gradient="linear-gradient(135deg, #ff9800 0%, #ff5722 100%)">
                  <TimelineIcon sx={{ fontSize: '1.5rem' }} />
                </GradientAvatar>
              </Box>
              <Divider />
              <Box sx={{ p: 2, bgcolor: 'action.hover', display: 'flex', justifyContent: 'center' }}>
                <Button
                  size="small"
                  component={Link}
                  to={routes.despliegues()}
                  endIcon={<ArrowDownIcon />}
                  sx={{ fontWeight: '600' }}
                >
                  Ver detalles
                </Button>
              </Box>
            </GlowCard>
          </Grid>

          {/* Estadísticas de Servidores */}
          <Grid item xs={12} sm={6} md={3}>
            <GlowCard glowcolor="#2196f3">
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: '600' }}>
                    Servidores
                  </Typography>
                  <Typography variant="h2" sx={{ mt: 1, fontWeight: '700' }}>
                    {serverStats.total}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {Object.entries(serverStats.types || {}).map(([type, count]) => (
                      <Chip
                        key={type}
                        size="small"
                        color="primary"
                        label={`${count} ${type.toLowerCase()}`}
                        sx={{ fontWeight: '600' }}
                      />
                    ))}
                  </Box>
                </Box>
                <GradientAvatar gradient="linear-gradient(135deg, #2196f3 0%, #1976d2 100%)">
                  <ServerIcon sx={{ fontSize: '1.5rem' }} />
                </GradientAvatar>
              </Box>
              <Divider />
              <Box sx={{ p: 2, bgcolor: 'action.hover', display: 'flex', justifyContent: 'center' }}>
                <Button
                  size="small"
                  component={Link}
                  to={routes.servidors()}
                  endIcon={<ArrowDownIcon />}
                  sx={{ fontWeight: '600' }}
                >
                  Ver detalles
                </Button>
              </Box>
            </GlowCard>
          </Grid>

          {/* Estadísticas de Eventos */}
          <Grid item xs={12} sm={6} md={3}>
            <GlowCard glowcolor="#e91e63">
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: '600' }}>
                    Eventos
                  </Typography>
                  <Typography variant="h2" sx={{ mt: 1, fontWeight: '700' }}>
                    {eventStats.total}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DotIcon sx={{ color: 'info.main', fontSize: '14px', mr: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: '600' }}>
                        {eventStats.maintenance} mantenimientos
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DotIcon sx={{ color: 'warning.main', fontSize: '14px', mr: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: '600' }}>
                        {eventStats.incidents} incidentes
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <GradientAvatar gradient="linear-gradient(135deg, #e91e63 0%, #c2185b 100%)">
                  <EventIcon sx={{ fontSize: '1.5rem' }} />
                </GradientAvatar>
              </Box>
              <Divider />
              <Box sx={{ p: 2, bgcolor: 'action.hover', display: 'flex', justifyContent: 'center' }}>
                <Button
                  size="small"
                  component={Link}
                  to={routes.eventos()}
                  endIcon={<ArrowDownIcon />}
                  sx={{ fontWeight: '600' }}
                >
                  Ver detalles
                </Button>
              </Box>
            </GlowCard>
          </Grid>
        </Grid>

        {/* Vista desde el nivel físico */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{
            fontWeight: '600',
            mb: 3,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '60px',
              height: '4px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              borderRadius: '2px'
            }
          }}>
            Datecenter y maquinas
          </Typography>
          <Grid container spacing={3}>
            {/* Data Centers */}
            <Grid item xs={12} sm={6} md={3}>
              <GlowCard glowcolor="#9c27b0">
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: '600' }}>
                      Data Centers
                    </Typography>
                    <Typography variant="h2" sx={{ mt: 1, fontWeight: '700' }}>
                      {dataCenterStats.total}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2, fontWeight: '600' }}>

                    </Typography>
                  </Box>
                  <GradientAvatar gradient="linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)">
                    <DataCenterIcon sx={{ fontSize: '1.5rem' }} />
                  </GradientAvatar>
                </Box>
                <Divider />
                <Box sx={{ p: 2, bgcolor: 'action.hover', display: 'flex', justifyContent: 'center' }}>
                  <Button
                    size="small"
                    component={Link}
                    to={routes.dataCenters()}
                    endIcon={<ArrowDownIcon />}
                    sx={{ fontWeight: '600' }}
                  >
                    Ver detalles
                  </Button>
                </Box>
              </GlowCard>
            </Grid>

            {/* Máquinas Físicas */}
            <Grid item xs={12} sm={6} md={3}>
              <GlowCard glowcolor="#673ab7">
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: '600' }}>
                      Máquinas Físicas
                    </Typography>
                    <Typography variant="h2" sx={{ mt: 1, fontWeight: '700' }}>
                      {machineStats.physical}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2, fontWeight: '600' }}>
                      {machineStats.total} total
                    </Typography>
                  </Box>
                  <GradientAvatar gradient="linear-gradient(135deg, #673ab7 0%, #5e35b1 100%)">
                    <ComputerIcon sx={{ fontSize: '1.5rem' }} />
                  </GradientAvatar>
                </Box>
                <Divider />
                <Box sx={{ p: 2, bgcolor: 'action.hover', display: 'flex', justifyContent: 'center' }}>
                  <Button
                    size="small"
                    component={Link}
                    to={routes.maquinas()}
                    endIcon={<ArrowDownIcon />}
                    sx={{ fontWeight: '600' }}
                  >
                    Ver detalles
                  </Button>
                </Box>
              </GlowCard>
            </Grid>

            {/* Máquinas Virtuales */}
            <Grid item xs={12} sm={6} md={3}>
              <GlowCard glowcolor="#3f51b5">
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: '600' }}>
                      Máquinas Virtuales
                    </Typography>
                    <Typography variant="h2" sx={{ mt: 1, fontWeight: '700' }}>
                      {machineStats.virtual}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2, fontWeight: '600' }}>
                      {machineStats.total} total
                    </Typography>
                  </Box>
                  <GradientAvatar gradient="linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)">
                    <ComputerIcon sx={{ fontSize: '1.5rem' }} />
                  </GradientAvatar>
                </Box>
                <Divider />
                <Box sx={{ p: 2, bgcolor: 'action.hover', display: 'flex', justifyContent: 'center' }}>
                  <Button
                    size="small"
                    component={Link}
                    to={routes.maquinas()}
                    endIcon={<ArrowDownIcon />}
                    sx={{ fontWeight: '600' }}
                  >
                    Ver detalles
                  </Button>
                </Box>
              </GlowCard>
            </Grid>

            {/* Estado de Servidores */}
            <Grid item xs={12} sm={6} md={3}>
              <GlowCard glowcolor="#4caf50">
                <Box sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }}>
                    Estado de Servidores
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', height: '200px' }}>
                    <Chart
                      options={serverStatusOptions}
                      series={Object.values(serverStats.status || {})}
                      type="donut"
                      height="100%"
                    />
                  </Box>
                </Box>
              </GlowCard>
            </Grid>
          </Grid>
        </Box>

        {/* Gráficos y Tablas */}
        <Grid container spacing={3}>
          {/* Gráfico de Despliegues */}
          <Grid item xs={12} md={8}>
            <GlowCard>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: '600' }}>
                    Histórico de Despliegues
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ChartIcon />}
                    sx={{ fontWeight: '600' }}
                  >
                    Exportar
                  </Button>
                </Box>
                <Box sx={{ height: '350px' }}>
                  {deploymentHistoryData.series.length > 0 ? (
                    <Chart
                      options={deploymentChartOptions}
                      series={deploymentHistoryData.series}
                      type="area"
                      height="100%"
                    />
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      color: 'text.secondary'
                    }}>
                      <Typography>No hay datos de despliegues disponibles</Typography>
                    </Box>
                  )}
                </Box>
                </Box>
            </GlowCard>
          </Grid>

          {/* Estado de Sistemas */}
          <Grid item xs={12} md={4}>
            <GlowCard>
              <Box sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: '600' }}>
                  Estado de Sistemas
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, height: '200px' }}>
                  <Chart
                    options={systemStatusOptions}
                    series={[systemStats.active, systemStats.inactive]}
                    type="donut"
                    height="100%"
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: '12px',
                        borderColor: alpha(theme.palette.success.main, 0.3),
                        background: alpha(theme.palette.success.main, 0.05)
                      }}>
                        <Typography variant="h3" color="success.main" sx={{ fontWeight: '700' }}>
                          {systemStats.active}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '600' }}>
                          Activos
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: '12px',
                        borderColor: alpha(theme.palette.error.main, 0.3),
                        background: alpha(theme.palette.error.main, 0.05)
                      }}>
                        <Typography variant="h3" color="error.main" sx={{ fontWeight: '700' }}>
                          {systemStats.inactive}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '600' }}>
                          Inactivos
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </GlowCard>
          </Grid>

          {/* Últimos Despliegues */}
          <Grid item xs={12} md={6}>
            <GlowCard>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: '600' }}>
                  Últimos Despliegues
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowDownIcon />}
                  component={Link}
                  to={routes.despliegues()}
                  sx={{ fontWeight: '600' }}
                >
                  Ver Todos
                </Button>
              </Box>
              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600' }}>Componente</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Máquina</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deploymentsData?.despliegues.map((despliegue) => (
                      <TableRow
                        key={despliegue.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell sx={{ fontWeight: '500' }}>
                          {despliegue.componentes?.nombre || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <DeploymentStateChip estado={despliegue.estado_despliegue} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: '500' }}>
                          {new Date(despliegue.fecha_despliegue).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontWeight: '500' }}>
                          {despliegue.maquinas?.nombre || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </GlowCard>
          </Grid>

          {/* Últimos Eventos */}
          <Grid item xs={12} md={6}>
            <GlowCard>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: '600' }}>
                  Últimos Eventos
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowDownIcon />}
                  component={Link}
                  to={routes.eventos()}
                  sx={{ fontWeight: '600' }}
                >
                  Ver Todos
                </Button>
              </Box>
              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600' }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Descripción</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eventsData?.eventos.map((evento) => (
                      <TableRow
                        key={evento.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <EventTypeChip tipo={evento.cod_tipo_evento} />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={evento.descripcion} arrow>
                            <Typography variant="body2" noWrap sx={{ fontWeight: '500' }}>
                              {evento.descripcion.substring(0, 30)}...
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontWeight: '500' }}>
                          {new Date(evento.fecha_evento).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontWeight: '500' }}>
                          {evento.estado_evento}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </GlowCard>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default HomePage
