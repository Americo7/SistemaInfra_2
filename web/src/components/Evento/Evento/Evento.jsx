import { useState } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { formatEnum, timeTag } from 'src/lib/formatters'

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
  Event as EventIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
  History as HistoryIcon,
} from '@mui/icons-material'

const DELETE_EVENTO_MUTATION = gql`
  mutation DeleteEventoMutation($id: Int!) {
    deleteEvento(id: $id) {
      id
    }
  }
`

const GET_USUARIOS_QUERY = gql`
  query GetUsuarios_fromEventoVista {
    usuarios {
      id
      nombres
      primer_apellido
    }
  }
`

const GET_BITACORAS_QUERY = gql`
  query GetBitacorasByEvento($id: Int!) {
    evento(id: $id) {
      eventos_bitacora {
        id
        estado_anterior
        estado_actual
        descripcion
        fecha_creacion
        usuario_creacion
      }
    }
  }
`

const GET_INFRA_AFECTADA_QUERY = gql`
  query GetInfraAfectadaByEvento($id: Int!) {
    evento(id: $id) {
      infra_afectada {
        id
        data_centers {
          id
          nombre
        }
        servidores {
          id
          nombre
        }
        maquinas {
          id
          nombre
        }
      }
    }
  }
`

const Evento = ({ evento }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)

  const [deleteEvento] = useMutation(DELETE_EVENTO_MUTATION, {
    onCompleted: () => {
      toast.success('Evento eliminado correctamente')
      navigate(routes.eventos())
    },
    onError: (error) => {
      toast.error(`Error al eliminar evento: ${error.message}`)
    },
  })

  // Consulta para todos los usuarios
  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)

  // Consulta para las bitácoras del evento
  const { data: bitacorasData } = useQuery(GET_BITACORAS_QUERY, {
    variables: { id: evento.id }
  })

  // Consulta para la infraestructura afectada
  const { data: infraAfectadaData } = useQuery(GET_INFRA_AFECTADA_QUERY, {
    variables: { id: evento.id }
  })

  // Función para convertir responsables a array de IDs
  const getResponsableIds = () => {
    if (!evento.responsables) return []

    if (Array.isArray(evento.responsables)) {
      return evento.responsables
    }

    if (typeof evento.responsables === 'string') {
      return evento.responsables.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    }

    return []
  }

  const responsableIds = getResponsableIds()

  // Mapa de IDs a nombres completos (de la tabla usuario)
  const usuariosMap = usuariosData?.usuarios?.reduce((map, usuario) => {
    map[usuario.id] = `${usuario.nombres} ${usuario.primer_apellido}`
    return map
  }, {}) || {}

  // Obtener nombres de responsables desde el mapa de usuarios
  const responsablesNombres = responsableIds
    .map(id => usuariosMap[id])
    .filter(Boolean) // Filtra nombres no encontrados
    .join(', ') || 'No especificado'

  // Datos de bitácoras
  const bitacoras = bitacorasData?.evento?.eventos_bitacora || []

  // Datos de infraestructura afectada
  const infraAfectada = infraAfectadaData?.evento?.infra_afectada || []

  const onDeleteClick = (id) => {
    if (confirm(`¿Está seguro que desea eliminar el evento ${id}?`)) {
      deleteEvento({ variables: { id } })
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const getEstadoColor = (estado) => {
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Volver a la lista">
          <IconButton
            onClick={() => navigate(routes.eventos())}
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
        <Typography variant="h5" component="h1" sx={{ fontWeight: 900 }}>
          {evento.cod_evento}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editEvento({ id: evento.id })}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Editar Evento
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteClick(evento.id)}
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

      {/* Tarjeta principal de información */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[3] }}>
        <CardHeader
          avatar={
            <Avatar sx={{
              bgcolor: theme.palette.primary.main,
              width: 56,
              height: 56,
            }}>
              <EventIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {evento.cod_evento}
              <Chip
                label={evento.estado}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(evento.estado),
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
                Creado el {formatDate(evento.fecha_creacion)}
              </Typography>
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
            {/* Columna izquierda - Detalles del evento */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Detalles del Evento
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo de Evento</TableCell>
                      <TableCell>{evento.cod_tipo_evento}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Codigo de Evento</TableCell>
                      <TableCell>{evento.cod_evento}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                      <TableCell>{evento.descripcion}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha del Evento</TableCell>
                      <TableCell>{timeTag(evento.fecha_evento)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Responsables</TableCell>
                      <TableCell>
                        {responsablesNombres}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Estado del Evento</TableCell>
                      <TableCell>{evento.estado_evento}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Cite</TableCell>
                      <TableCell>{evento.cite || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Solicitante</TableCell>
                      <TableCell>{evento.solicitante || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Columna derecha - Auditoría */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <UpdateIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Información de Auditoría
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
                      {usuariosMap[evento.usuario_creacion] || evento.usuario_creacion || 'N/A'}
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
                      {formatDate(evento.fecha_creacion)}
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
                      {usuariosMap[evento.usuario_modificacion] || evento.usuario_modificacion || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Última Modificación
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(evento.fecha_modificacion)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sección de pestañas */}
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
                <HistoryIcon fontSize="small" />
                <span>Bitácoras</span>
                <Chip
                  label={bitacoras.length}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <InfoIcon fontSize="small" />
                <span>Infraestructura Afectada</span>
                <Chip
                  label={infraAfectada.length}
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
                Historial de cambios del evento
              </Typography>
              {bitacoras.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado Anterior</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado Actual</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bitacoras.map((bitacora) => (
                        <TableRow key={bitacora.id} hover>
                          <TableCell>{formatDate(bitacora.fecha_creacion)}</TableCell>
                          <TableCell>
                            <Chip
                              label={bitacora.estado_anterior}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.grey[200],
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={bitacora.estado_actual}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.info.main,
                                color: 'white',
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>{bitacora.descripcion}</TableCell>
                          <TableCell>
                            {usuariosMap[bitacora.usuario_creacion] || bitacora.usuario_creacion || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <HistoryIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay registros de bitácora para este evento.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Infraestructura afectada por este evento
              </Typography>
              {infraAfectada.length > 0 ? (
                <Box>
                  {/* Data Centers */}
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Data Centers afectados:
                  </Typography>
                  {infraAfectada.filter(item => item.data_centers).length > 0 ? (
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                            <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {infraAfectada
                            .filter(item => item.data_centers)
                            .map((item) => (
                              <TableRow key={`dc-${item.data_centers.id}`} hover>
                                <TableCell>
                                  <Typography variant="body2">
                                    {item.data_centers.nombre}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      No hay data centers afectados
                    </Typography>
                  )}

                  {/* Servidores */}
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Servidores afectados:
                  </Typography>
                  {infraAfectada.filter(item => item.servidores).length > 0 ? (
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                            <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {infraAfectada
                            .filter(item => item.servidores)
                            .map((item) => (
                              <TableRow key={`sv-${item.servidores.id}`} hover>
                                <TableCell>
                                  <Link
                                    to={routes.servidor({ id: item.servidores.id })}
                                    style={{ textDecoration: 'none' }}
                                  >
                                    <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                                      {item.servidores.nombre}
                                    </Typography>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      No hay servidores afectados
                    </Typography>
                  )}

                  {/* Máquinas */}
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Máquinas afectadas:
                  </Typography>
                  {infraAfectada.filter(item => item.maquinas).length > 0 ? (
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                            <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {infraAfectada
                            .filter(item => item.maquinas)
                            .map((item) => (
                              <TableRow key={`mq-${item.maquinas.id}`} hover>
                                <TableCell>
                                  <Link
                                    to={routes.maquina({ id: item.maquinas.id })}
                                    style={{ textDecoration: 'none' }}
                                  >
                                    <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                                      {item.maquinas.nombre}
                                    </Typography>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay máquinas afectadas
                    </Typography>
                  )}
                </Box>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <InfoIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay infraestructura afectada registrada para este evento.
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Evento
