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
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storage as DataCenterIcon,
  Dns as ServerIcon,
  Computer as MachineIcon,
  Event as EventIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material'

const DELETE_INFRA_AFECTADA_MUTATION = gql`
  mutation DeleteInfraAfectadaMutation($id: Int!) {
    deleteInfraAfectada(id: $id) {
      id
    }
  }
`

const GET_EVENTO_QUERY = gql`
  query GetEvento($id: Int!) {
    evento(id: $id) {
      id
      descripcion
    }
  }
`

const GET_DATA_CENTER_QUERY = gql`
  query GetDataCenter($id: Int!) {
    dataCenter(id: $id) {
      id
      nombre
    }
  }
`

const GET_SERVIDOR_QUERY = gql`
  query GetServidor($id: Int!) {
    servidor(id: $id) {
      id
      nombre
      cod_tipo_servidor
      id_padre
    }
  }
`

const GET_SERVIDOR_PADRE_QUERY = gql`
  query GetServidorPadre($id: Int!) {
    servidor(id: $id) {
      id
      nombre
    }
  }
`

const GET_MAQUINA_QUERY = gql`
  query GetMaquina($id: Int!) {
    maquina(id: $id) {
      id
      nombre
    }
  }
`

const GET_USUARIOS_QUERY = gql`
  query GetUsuarios_fromInfraVista {
    usuarios {
      id
      nombres
      primer_apellido
    }
  }
`

const InfraAfectada = ({ infraAfectada }) => {
  const theme = useTheme()

  const [deleteInfraAfectada] = useMutation(DELETE_INFRA_AFECTADA_MUTATION, {
    onCompleted: () => {
      toast.success('Infraestructura afectada eliminada correctamente')
      navigate(routes.infraAfectadas())
    },
    onError: (error) => {
      toast.error(`Error al eliminar: ${error.message}`)
    },
  })

  // Consultas para las asociaciones
  const { data: eventoData } = useQuery(GET_EVENTO_QUERY, {
    variables: { id: infraAfectada.id_evento },
    skip: !infraAfectada.id_evento
  })

  const { data: dataCenterData } = useQuery(GET_DATA_CENTER_QUERY, {
    variables: { id: infraAfectada.id_data_center },
    skip: !infraAfectada.id_data_center
  })

  const { data: servidorData } = useQuery(GET_SERVIDOR_QUERY, {
    variables: { id: infraAfectada.id_servidor },
    skip: !infraAfectada.id_servidor
  })

  // Consulta para el servidor padre (solo si existe)
  const { data: servidorPadreData } = useQuery(GET_SERVIDOR_PADRE_QUERY, {
    variables: { id: servidorData?.servidor?.id_padre },
    skip: !servidorData?.servidor?.id_padre
  })

  const { data: maquinaData } = useQuery(GET_MAQUINA_QUERY, {
    variables: { id: infraAfectada.id_maquina },
    skip: !infraAfectada.id_maquina
  })

  // Consulta para los usuarios
  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)

  // Mapa de IDs a nombres completos
  const usuariosMap = usuariosData?.usuarios?.reduce((map, usuario) => {
    map[usuario.id] = `${usuario.nombres} ${usuario.primer_apellido}`
    return map
  }, {}) || {}

  const onDeleteClick = (id) => {
    if (confirm(`¿Está seguro que desea eliminar esta infraestructura afectada (ID: ${id})?`)) {
      deleteInfraAfectada({ variables: { id } })
    }
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
            onClick={() => navigate(routes.infraAfectadas())}
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
          Infraestructura Afectada #{infraAfectada.id}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editInfraAfectada({ id: infraAfectada.id })}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteClick(infraAfectada.id)}
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
              <DataCenterIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Infraestructura #{infraAfectada.id}
              <Chip
                label={infraAfectada.estado}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(infraAfectada.estado),
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
                Creada el {formatDate(infraAfectada.fecha_creacion)}
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
            {/* Columna izquierda - Detalles de la infraestructura */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Detalles de la Infraestructura
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>

                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Evento</TableCell>
                      <TableCell>
                        {eventoData?.evento ? (
                          <Link
                            to={routes.evento({ id: eventoData.evento.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <EventIcon fontSize="small" color="action" />
                              <span style={{ color: theme.palette.primary.main }}>
                                {eventoData.evento.descripcion || `Evento ${eventoData.evento.id}`}
                              </span>
                            </Stack>
                          </Link>
                        ) : infraAfectada.id_evento ? infraAfectada.id_evento : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Data Center</TableCell>
                      <TableCell>
                        {dataCenterData?.dataCenter ? (
                          <Link
                            to={routes.dataCenter({ id: dataCenterData.dataCenter.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <DataCenterIcon fontSize="small" color="action" />
                              <span style={{ color: theme.palette.primary.main }}>
                                {dataCenterData.dataCenter.nombre}
                              </span>
                            </Stack>
                          </Link>
                        ) : infraAfectada.id_data_center ? infraAfectada.id_data_center : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900 }}>Servidor</TableCell>
                      <TableCell>
                        {servidorData?.servidor ? (
                          <Box>
                            <Link
                              to={routes.servidor({ id: servidorData.servidor.id })}
                              style={{ textDecoration: 'none' }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <ServerIcon fontSize="small" color="action" />
                                <span style={{ color: theme.palette.primary.main }}>
                                  {servidorData.servidor.nombre}
                                </span>
                              </Stack>
                            </Link>
                            <Box sx={{ ml: 4, mt: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Tipo:</strong> {servidorData.servidor.cod_tipo_servidor}
                              </Typography>
                              {servidorData.servidor.id_padre && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Servidor padre:</strong> {servidorPadreData?.servidor ? (
                                    <Link
                                      to={routes.servidor({ id: servidorData.servidor.id_padre })}
                                      style={{ textDecoration: 'none' }}
                                    >
                                      <span style={{ color: theme.palette.primary.main }}>
                                        {servidorPadreData.servidor.nombre}
                                      </span>
                                    </Link>
                                  ) : servidorData.servidor.id_padre}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        ) : infraAfectada.id_servidor ? infraAfectada.id_servidor : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Máquina</TableCell>
                      <TableCell>
                        {maquinaData?.maquina ? (
                          <Link
                            to={routes.maquina({ id: maquinaData.maquina.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <MachineIcon fontSize="small" color="action" />
                              <span style={{ color: theme.palette.primary.main }}>
                                {maquinaData.maquina.nombre}
                              </span>
                            </Stack>
                          </Link>
                        ) : infraAfectada.id_maquina ? infraAfectada.id_maquina : 'N/A'}
                      </TableCell>
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
                      {usuariosMap[infraAfectada.usuario_creacion] || infraAfectada.usuario_creacion || 'N/A'}
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
                      {formatDate(infraAfectada.fecha_creacion)}
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
                      {usuariosMap[infraAfectada.usuario_modificacion] || infraAfectada.usuario_modificacion || 'N/A'}
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
                      {formatDate(infraAfectada.fecha_modificacion)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>


            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default InfraAfectada
