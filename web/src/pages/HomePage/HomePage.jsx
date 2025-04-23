import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import {
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Chip
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  ShowChart,
  PieChart,
  Event,
  Cloud,
  ExpandMore,
  Storage,
  Dns,
  Apps
} from '@mui/icons-material'
import Chart from 'react-apexcharts'

const HomePage = () => {
  // Datos de ejemplo
  const sistemas = [
    { id: 1, nombre: 'Sistema Financiero', componentes: 5, estado: 'ACTIVO' },
    { id: 2, nombre: 'Plataforma Educativa', componentes: 3, estado: 'INACTIVO' },
    { id: 3, nombre: 'Gestión Documental', componentes: 8, estado: 'ACTIVO' }
  ]

  const despliegues = [
    { id: 1, componente: 'API Principal', fecha: '2023-08-15', estado: 'Exitoso' },
    { id: 2, componente: 'Frontend Web', fecha: '2023-08-14', estado: 'Fallido' },
    { id: 3, componente: 'Microservicio Pagos', fecha: '2023-08-13', estado: 'Pendiente' }
  ]

  const eventos = [
    { id: 1, tipo: 'Mantenimiento', descripcion: 'Actualización de seguridad', fecha: '2023-08-15' },
    { id: 2, tipo: 'Incidente', descripcion: 'Caída de servidor DC-01', fecha: '2023-08-14' }
  ]

  const chartOptions = {
    chart: { id: 'deployments-chart' },
    xaxis: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago']
    }
  }

  const chartSeries = [
    { name: 'Despliegues Exitosos', data: [30, 40, 35, 50, 49, 60, 70, 91] }
  ]

  const pieChartOptions = {
    labels: ['ACTIVO', 'INACTIVO', 'MANTENIMIENTO'],
    colors: ['#4CAF50', '#F44336', '#FFC107']
  }

  const pieChartSeries = [65, 15, 20]

  return (
    <>
      <Metadata title="Dashboard" description="Panel de control principal" />

      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Panel de Control de Sistemas
          </Typography>
          <Cloud sx={{ mr: 2 }} />
          <Dns sx={{ mr: 2 }} />
          <Storage />
        </Toolbar>
        
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Estadísticas rápidas */}
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
              <CardContent>
                <DashboardIcon fontSize="large" />
                <Typography variant="h6">Sistemas</Typography>
                <Typography variant="h4">15</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Apps fontSize="large" />
                <Typography variant="h6">Componentes</Typography>
                <Typography variant="h4">243</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <ShowChart fontSize="large" />
                <Typography variant="h6">Despliegues Activos</Typography>
                <Typography variant="h4">32</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Event fontSize="large" />
                <Typography variant="h6">Eventos Pendientes</Typography>
                <Typography variant="h4">5</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráficos principales */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Frecuencia de Despliegues
                </Typography>
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="line"
                  height={300}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estado de Sistemas
                </Typography>
                <Chart
                  options={pieChartOptions}
                  series={pieChartSeries}
                  type="pie"
                  height={300}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Tabla de Eventos Recientes */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Eventos Recientes
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eventos.map((evento) => (
                      <TableRow key={evento.id}>
                        <TableCell>
                          <Chip label={evento.tipo} color="primary" size="small" />
                        </TableCell>
                        <TableCell>{evento.descripcion}</TableCell>
                        <TableCell>{evento.fecha}</TableCell>
                        <TableCell>
                          <LinearProgress variant="determinate" value={75} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          {/* Listado de Sistemas */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sistemas Registrados
                </Typography>
                {sistemas.map((sistema) => (
                  <Accordion key={sistema.id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography sx={{ width: '33%', flexShrink: 0 }}>
                        {sistema.nombre}
                      </Typography>
                      <Chip
                        label={sistema.estado}
                        color={sistema.estado === 'ACTIVO' ? 'success' : 'error'}
                        size="small"
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>Componentes: {sistema.componentes}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Último despliegue: 2023-08-15
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Tabla de Despliegues Recientes */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Últimos Despliegues
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Componente</TableCell>
                      <TableCell>Entorno</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {despliegues.map((despliegue) => (
                      <TableRow key={despliegue.id}>
                        <TableCell>{despliegue.componente}</TableCell>
                        <TableCell>Producción</TableCell>
                        <TableCell>{despliegue.fecha}</TableCell>
                        <TableCell>
                          <Chip
                            label={despliegue.estado}
                            color={
                              despliegue.estado === 'Exitoso'
                                ? 'success'
                                : despliegue.estado === 'Fallido'
                                ? 'error'
                                : 'warning'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Link to={routes.despliegue({ id: despliegue.id })}>
                            Ver Detalles
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Plataforma de Gestión de Sistemas - Versión 1.0.0
          </Typography>
        </Box>
      </Container>
    </>
  )
}

export default HomePage
