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
  Link as MuiLink,
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
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material'

const DELETE_ASIGNACION_SERVIDOR_MAQUINA_MUTATION = gql`
  mutation DeleteAsignacionServidorMaquinaMutation($id: Int!) {
    deleteAsignacionServidorMaquina(id: $id) {
      id
    }
  }
`

const GET_SERVIDOR_QUERY = gql`
  query GetServidorQuery($id: Int!) {
    servidor(id: $id) {
      id
      nombre
      cod_tipo_servidor
      id_padre
    }
  }
`

const GET_SERVIDOR_PADRE_QUERY = gql`
  query GetServidorPadreQuery($id: Int!) {
    servidor(id: $id) {
      id
      nombre
    }
  }
`

const GET_MAQUINA_QUERY = gql`
  query GetMaquinaQuery($id: Int!) {
    maquina(id: $id) {
      id
      nombre
      ip
      so
      ram
      cpu
      cod_plataforma
      estado
    }
  }
`

const GET_CLUSTER_QUERY = gql`
  query GetClusterQuery($id: Int!) {
    cluster(id: $id) {
      id
      nombre
      descripcion
      estado
    }
  }
`

const GET_USUARIOS_QUERY = gql`
  query GetUsuarios_fromAsignacionVista {
    usuarios {
      id
      nombres
      primer_apellido
    }
  }
`

const AsignacionServidorMaquina = ({ asignacionServidorMaquina }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)

  const [deleteAsignacionServidorMaquina] = useMutation(
    DELETE_ASIGNACION_SERVIDOR_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('Asignación eliminada correctamente')
        navigate(routes.asignacionServidorMaquinas())
      },
      onError: (error) => {
        toast.error(`Error al eliminar asignación: ${error.message}`)
      },
    }
  )

  // Consulta para el servidor principal
  const { data: servidorData, loading: loadingServidor } = useQuery(GET_SERVIDOR_QUERY, {
    variables: { id: asignacionServidorMaquina.id_servidor }
  })

  // Consulta para el servidor padre (solo si existe id_padre)
  const { data: padreData, loading: loadingPadre } = useQuery(GET_SERVIDOR_PADRE_QUERY, {
    variables: { id: servidorData?.servidor?.id_padre },
    skip: !servidorData?.servidor?.id_padre
  })

  // Consulta para la máquina
  const { data: maquinaData, loading: loadingMaquina } = useQuery(GET_MAQUINA_QUERY, {
    variables: { id: asignacionServidorMaquina.id_maquina }
  })

  // Consulta para el cluster (solo si existe id_cluster)
  const { data: clusterData, loading: loadingCluster } = useQuery(GET_CLUSTER_QUERY, {
    variables: { id: asignacionServidorMaquina.id_cluster },
    skip: !asignacionServidorMaquina.id_cluster
  })

  // Consulta para los usuarios
  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)

  // Mapa de IDs de usuario a nombres completos
  const usuariosMap = usuariosData?.usuarios?.reduce((map, usuario) => {
    map[usuario.id] = `${usuario.nombres} ${usuario.primer_apellido}`
    return map
  }, {}) || {}

  const onDeleteClick = (id) => {
    if (confirm(`¿Está seguro que desea eliminar esta asignación (ID: ${id})?`)) {
      deleteAsignacionServidorMaquina({ variables: { id } })
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

  // Mostrar loading si alguna consulta está en progreso
  if (loadingServidor || loadingMaquina || loadingCluster || loadingPadre) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Cargando información de la asignación...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Volver a la lista">
          <IconButton
            onClick={() => navigate(routes.asignacionServidorMaquinas())}
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
          Asignación Servidor-Máquina
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editAsignacionServidorMaquina({ id: asignacionServidorMaquina.id })}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Editar Asignación
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteClick(asignacionServidorMaquina.id)}
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
              <ServerIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Asignación #{asignacionServidorMaquina.id}
              <Chip
                label={asignacionServidorMaquina.estado}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(asignacionServidorMaquina.estado),
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
                Creada el {formatDate(asignacionServidorMaquina.fecha_creacion)}
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
            {/* Columna izquierda - Detalles de la asignación */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Detalles de la Asignación
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>

                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Servidor</TableCell>
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
                            <Box sx={{ ml: 4, mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Tipo:</strong> {servidorData.servidor.cod_tipo_servidor}
                              </Typography>
                              {servidorData.servidor.id_padre && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Servidor padre:</strong> {padreData?.servidor ? (
                                    <Link
                                      to={routes.servidor({ id: servidorData.servidor.id_padre })}
                                      style={{ textDecoration: 'none' }}
                                    >
                                      <span style={{ color: theme.palette.primary.main }}>
                                        {padreData.servidor.nombre}
                                      </span>
                                    </Link>
                                  ) : servidorData.servidor.id_padre}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        ) : 'N/A'}
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
                        ) : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Cluster</TableCell>
                      <TableCell>
                        {clusterData?.cluster ? (
                          <Link
                            to={routes.cluster({ id: clusterData.cluster.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <ClusterIcon fontSize="small" color="action" />
                              <span style={{ color: theme.palette.primary.main }}>
                                {clusterData.cluster.nombre}
                              </span>
                            </Stack>
                          </Link>
                        ) : 'N/A'}
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
                      {usuariosMap[asignacionServidorMaquina.usuario_creacion] || asignacionServidorMaquina.usuario_creacion || 'N/A'}
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
                      {formatDate(asignacionServidorMaquina.fecha_creacion)}
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
                      {usuariosMap[asignacionServidorMaquina.usuario_modificacion] || asignacionServidorMaquina.usuario_modificacion || 'N/A'}
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
                      {formatDate(asignacionServidorMaquina.fecha_modificacion)}
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
                <ServerIcon fontSize="small" />
                <span>Detalles del Servidor</span>
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <MachineIcon fontSize="small" />
                <span>Detalles de la Máquina</span>
              </Stack>
            }
          />
          {clusterData?.cluster && (
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ClusterIcon fontSize="small" />
                  <span>Detalles del Cluster</span>
                </Stack>
              }
            />
          )}
        </Tabs>

        <CardContent>
          {activeTab === 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Información detallada del servidor
              </Typography>
              {servidorData?.servidor ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Servidor Padre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell>{servidorData.servidor.id}</TableCell>
                        <TableCell>
                          <Link
                            to={routes.servidor({ id: servidorData.servidor.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                              {servidorData.servidor.nombre}
                            </Typography>
                          </Link>
                        </TableCell>
                        <TableCell>{servidorData.servidor.cod_tipo_servidor}</TableCell>
                        <TableCell>
                          {servidorData.servidor.id_padre ? (
                            padreData?.servidor ? (
                              <Link
                                to={routes.servidor({ id: servidorData.servidor.id_padre })}
                                style={{ textDecoration: 'none' }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                                  {padreData.servidor.nombre}
                                </Typography>
                              </Link>
                            ) : (
                              servidorData.servidor.id_padre
                            )
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <ServerIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No se encontró información del servidor.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Información detallada de la máquina
              </Typography>
              {maquinaData?.maquina ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
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
                      <TableRow hover>
                        <TableCell>{maquinaData.maquina.id}</TableCell>
                        <TableCell>
                          <Link
                            to={routes.maquina({ id: maquinaData.maquina.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                              {maquinaData.maquina.nombre}
                            </Typography>
                          </Link>
                        </TableCell>
                        <TableCell>{maquinaData.maquina.ip || 'N/A'}</TableCell>
                        <TableCell>{maquinaData.maquina.so || 'N/A'}</TableCell>
                        <TableCell>{maquinaData.maquina.ram ? `${maquinaData.maquina.ram} GB` : '-'}</TableCell>
                        <TableCell>{maquinaData.maquina.cpu ? `${maquinaData.maquina.cpu} cores` : '-'}</TableCell>
                        <TableCell>{maquinaData.maquina.cod_plataforma || 'N/A'}</TableCell>
                        <TableCell>
                          {maquinaData.maquina.estado ? (
                            <Chip
                              label={maquinaData.maquina.estado}
                              size="small"
                              sx={{
                                backgroundColor: getEstadoColor(maquinaData.maquina.estado),
                                color: 'white',
                              }}
                            />
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <MachineIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No se encontró información de la máquina.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 2 && clusterData?.cluster && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Información detallada del cluster
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                      <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell>{clusterData.cluster.id}</TableCell>
                      <TableCell>
                        <Link
                          to={routes.cluster({ id: clusterData.cluster.id })}
                          style={{ textDecoration: 'none' }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                            {clusterData.cluster.nombre}
                          </Typography>
                        </Link>
                      </TableCell>
                      <TableCell>{clusterData.cluster.descripcion || 'N/A'}</TableCell>
                      <TableCell>
                        {clusterData.cluster.estado ? (
                          <Chip
                            label={clusterData.cluster.estado}
                            size="small"
                            sx={{
                              backgroundColor: getEstadoColor(clusterData.cluster.estado),
                              color: 'white',
                            }}
                          />
                        ) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default AsignacionServidorMaquina
