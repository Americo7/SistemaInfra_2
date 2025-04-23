import { useState } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { formatEnum } from 'src/lib/formatters'

// Material-UI imports
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  colors,
  Tab,
  Tabs,
  Divider,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storage as ServerIcon,
  Computer as MachineIcon,
  Dns as ClusterIcon,
  Event as EventIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Dns as DnsIcon,
  Business as DataCenterIcon,
  DeveloperBoard as MotherboardIcon,
  Power as PowerIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material'

const DELETE_SERVIDOR_MUTATION = gql`
  mutation DeleteServidorMutation($id: Int!) {
    deleteServidor(id: $id) {
      id
    }
  }
`

const GET_USUARIOS_QUERY = gql`
  query UsuariosQuery_fromServidor {
    usuarios {
      id
      nombres
    }
  }
`

const GET_SERVIDOR_PADRE_QUERY = gql`
  query ServidorPadreQuery($id: Int!) {
    servidor(id: $id) {
      id
      nombre
    }
  }
`

const Servidor = ({ servidor }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [deleteServidor] = useMutation(DELETE_SERVIDOR_MUTATION, {
    onCompleted: () => {
      toast.success('Servidor eliminado correctamente')
      navigate(routes.servidors())
    },
    onError: (error) => {
      toast.error(`Error al eliminar servidor: ${error.message}`)
    },
  })

  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)

  const { data: servidorPadreData } = useQuery(GET_SERVIDOR_PADRE_QUERY, {
    variables: { id: servidor.id_padre },
    skip: !servidor.id_padre
  })

  const usuariosMap = usuariosData?.usuarios?.reduce((map, usuario) => {
    map[usuario.id] = usuario.nombres
    return map
  }, {}) || {}



  const onDeleteClick = (id) => {
    if (confirm(`¿Está seguro que desea eliminar el servidor ${servidor.nombre} (ID: ${id})?`)) {
      deleteServidor({ variables: { id } })
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const getEstadoColor = (estadoOperativo) => {
    switch (estadoOperativo) {
      case 'OPERATIVO': return theme.palette.success.main
      case 'MANTENIMIENTO': return theme.palette.warning.main
      case 'DISPONIBLE': return theme.palette.info.main
      case 'FALLA': return theme.palette.error.main
      case 'APAGADO': return theme.palette.grey[500]
      case 'FUERA_SERVICIO': return theme.palette.error.dark
      default: return theme.palette.grey[300]
    }
  }

  const getEstadoColor1 = (estado) => {
    return estado === 'ACTIVO' ? theme.palette.success.main : theme.palette.error.main
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const machines = servidor.asignacion_servidor_maquina || []
  const clusters = servidor.asignacion_servidor_maquina?.filter(a => a.id_cluster) || []
  const events = servidor.infra_afectada || []

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with back button and actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Volver a la lista">
          <IconButton
            onClick={() => navigate(routes.servidors())}
            sx={{
              mr: 2,
              backgroundColor: theme.palette.action.hover,
              '&:hover': {
                backgroundColor: theme.palette.action.selected,
              }
            }}
          >
            <BackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {servidor.nombre}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editServidor({ id: servidor.id })}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Editar Servidor
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteClick(servidor.id)}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Eliminar
          </Button>
        </Stack>
      </Box>

      {/* Main server information card */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[3] }}>
        <CardHeader
          avatar={
            <Avatar sx={{
              bgcolor: theme.palette.primary.main,
              width: 56,
              height: 56,
            }}>
              <ServerIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {servidor.nombre}
              <Chip
                label={servidor.estado_operativo}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(servidor.estado_operativo),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            </Typography>
          }
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                {servidor.cod_tipo_servidor} • {servidor.cod_inventario_agetic}
              </Typography>
              <Chip
                label={servidor.estado}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor1(servidor.estado),
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            </Box>
          }
          action={
            <IconButton>
              <MoreIcon />
            </IconButton>
          }
          sx={{
            pb: 0,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Left column - Hardware specs */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <MotherboardIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Especificaciones Técnicas
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <MemoryIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Memoria RAM
                      </Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {servidor.ram ? `${servidor.ram} GB` : 'No especificado'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <StorageIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Almacenamiento
                      </Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {servidor.almacenamiento ? `${servidor.almacenamiento} GB` : 'No especificado'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>Marca/Modelo</TableCell>
                      <TableCell>{`${servidor.marca || '-'} / ${servidor.modelo || '-'}`}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Número de Serie</TableCell>
                      <TableCell>{servidor.serie || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Data Center</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <DataCenterIcon fontSize="small" color="action" />
                          <span>{servidor.data_center?.nombre || 'No asignado'}</span>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Servidor Padre</TableCell>
                      <TableCell>
                        {servidorPadreData?.servidor ? (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ServerIcon fontSize="small" color="action" />
                            <span>{servidorPadreData.servidor.nombre}</span>
                          </Stack>
                        ) : 'Ninguno'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Right column - Status and audit */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <PowerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Estado y Auditoría
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Creado por
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {usuariosMap[servidor.usuario_creacion] || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Fecha Creación
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(servidor.fecha_creacion)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Modificado por
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {usuariosMap[servidor.usuario_modificacion] || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <UpdateIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Última Modificación
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(servidor.fecha_modificacion)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="subtitle1" sx={{
                mb: 1,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                Información Adicional
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {servidor.descripcion || 'No hay descripción adicional para este servidor.'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs section */}
      <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTabs-flexContainer': {
              borderBottom: `1px solid ${theme.palette.divider}`,
            }
          }}
        >
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <MachineIcon fontSize="small" />
                <span>Máquinas Virtuales</span>
                <Chip
                  label={machines.length}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <ClusterIcon fontSize="small" />
                <span>Clusters</span>
                <Chip
                  label={clusters.length}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <EventIcon fontSize="small" />
                <span>Eventos</span>
                <Chip
                  label={events.length}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            }
          />
        </Tabs>

        <CardContent>
          {activeTab === 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Máquinas asociadas a este servidor físico
              </Typography>
              {machines.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Sistema Operativo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>RAM</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>CPU</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Plataforma</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {machines.map((asignacion) => (
                        <TableRow key={asignacion.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {asignacion.maquinas?.nombre || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>{asignacion.maquinas?.ip || 'N/A'}</TableCell>
                          <TableCell>{asignacion.maquinas?.so || 'N/A'}</TableCell>
                          <TableCell>
                            {asignacion.maquinas?.ram ? `${asignacion.maquinas.ram} GB` : '-'}
                          </TableCell>
                          <TableCell>
                            {asignacion.maquinas?.cpu ? `${asignacion.maquinas.cpu} cores` : '-'}
                          </TableCell>
                          <TableCell>
                            {asignacion.maquinas?.cod_plataforma || asignacion.maquinas?.cod_plataforma || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {asignacion.maquinas?.estado ? (
                              <Chip
                                label={asignacion.maquinas.estado}
                                size="small"
                                sx={{
                                  backgroundColor: getEstadoColor1(asignacion.maquinas.estado),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            ) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <MachineIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay máquinas asociadas a este servidor.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Clusters en los que participa este servidor
              </Typography>
              {clusters.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clusters.map((asignacion) => (
                        <TableRow key={asignacion.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {asignacion.clusters?.nombre || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={asignacion.clusters?.cod_tipo_cluster || 'N/A'}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.grey[200],
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {asignacion.clusters?.descripcion?.substring(0, 50) || 'N/A'}
                              {asignacion.clusters?.descripcion?.length > 50 ? '...' : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {asignacion.clusters?.estado ? (
                              <Chip
                                label={asignacion.clusters.estado}
                                size="small"
                                sx={{
                                  backgroundColor: getEstadoColor1(asignacion.clusters.estado),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            ) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <ClusterIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    Este servidor no participa en ningún cluster.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 2 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Eventos registrados para este servidor
              </Typography>
              {events.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Solicitante</TableCell>

                      </TableRow>

                    </TableHead>
                    <TableBody>
                      {events.map((infra) => (
                        <TableRow key={infra.id} hover>
                          <TableCell>
                            <Chip
                              label={infra.eventos?.cod_tipo_evento || 'N/A'}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.grey[200],
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {infra.eventos?.descripcion?.substring(0, 60) || 'N/A'}
                              {infra.eventos?.descripcion?.length > 60 ? '...' : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(infra.eventos?.fecha_evento) || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={infra.eventos?.estado_evento || 'N/A'}
                              size="small"
                              sx={{
                                backgroundColor: colors.orange[100],
                                color: colors.orange[800],
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {infra.eventos?.solicitante || 'No especificado'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <EventIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay eventos registrados para este servidor.
                  </Typography>
                </Paper>
              )}
            </>
          )}s
        </CardContent>
      </Card>
    </Box>
  )
}

export default Servidor
