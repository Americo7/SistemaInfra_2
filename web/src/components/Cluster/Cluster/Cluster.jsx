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
  Dns as ClusterIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  Event as CalendarIcon,
  Computer as MachineIcon,
  Storage as ServerIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
  Business as DataCenterIcon,
  Person as PersonIcon,
} from '@mui/icons-material'

const DELETE_CLUSTER_MUTATION = gql`
  mutation DeleteClusterMutation($id: Int!) {
    deleteCluster(id: $id) {
      id
    }
  }
`

const GET_MAQUINAS_QUERY = gql`
  query MaquinasClusterQuery($id: Int!) {
    cluster(id: $id) {
      asignacion_servidor_maquina {
        id
        maquinas {
          id
          nombre
          ip
          so
          estado
          fecha_creacion
          usuario_creacion
        }
      }
    }
  }
`

const GET_SERVIDORES_QUERY = gql`
  query ServidoresClusterQuery($id: Int!) {
    cluster(id: $id) {
      asignacion_servidor_maquina {
        id
        servidores {
          id
          nombre
          estado
          data_center {
            id
            nombre
          }
          fecha_creacion
          usuario_creacion
        }
      }
    }
  }
`

const GET_USER_CREACION_QUERY = gql`
  query UserCreacionQuery($id: Int!) {
    usuario(id: $id) {
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

const GET_USER_MODIFICACION_QUERY = gql`
  query UserModificacionQuery($id: Int!) {
    usuario(id: $id) {
      nombres
      primer_apellido
      segundo_apellido
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

const Cluster = ({ cluster }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [deleteCluster] = useMutation(DELETE_CLUSTER_MUTATION, {
    onCompleted: () => {
      toast.success('Cluster eliminado correctamente')
      navigate(routes.clusters())
    },
    onError: (error) => {
      toast.error(`Error al eliminar cluster: ${error.message}`)
    },
  })

  const { data: maquinasData } = useQuery(GET_MAQUINAS_QUERY, {
    variables: { id: cluster.id }
  })

  const { data: servidoresData } = useQuery(GET_SERVIDORES_QUERY, {
    variables: { id: cluster.id }
  })

  const { data: userCreacionData } = useQuery(GET_USER_CREACION_QUERY, {
    variables: { id: cluster.usuario_creacion },
    skip: !cluster.usuario_creacion
  })

  const { data: userModificacionData } = useQuery(GET_USER_MODIFICACION_QUERY, {
    variables: { id: cluster.usuario_modificacion },
    skip: !cluster.usuario_modificacion
  })

  // Extraer datos de las consultas
  const maquinas = maquinasData?.cluster?.asignacion_servidor_maquina || []
  const servidores = servidoresData?.cluster?.asignacion_servidor_maquina || []

  // Formatear nombres de usuarios
  const formatUserName = (user) => {
    if (!user) return 'N/A'
    return `${user.nombres || ''} ${user.primer_apellido || ''} ${user.segundo_apellido || ''}`.trim()
  }

  const usuarioCreacionNombre = formatUserName(userCreacionData?.usuario)
  const usuarioModificacionNombre = formatUserName(userModificacionData?.usuario)

  const onDeleteClick = (id) => {
    if (confirm(`¿Está seguro que desea eliminar el cluster "${cluster.nombre}" (ID: ${id})?`)) {
      deleteCluster({ variables: { id } })
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const getEstadoColor = (estado) => {
    return estado === 'ACTIVO' ? theme.palette.success.main : theme.palette.error.main
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* acciones */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Volver a la lista">
          <IconButton
            onClick={() => navigate(routes.clusters())}
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
          {cluster.nombre}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editCluster({ id: cluster.id })}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Editar Cluster
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteClick(cluster.id)}
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

      {/* informacion */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[3] }}>
        <CardHeader
          avatar={
            <Avatar sx={{
              bgcolor: theme.palette.primary.main,
              width: 56,
              height: 56,
            }}>
              <ClusterIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {cluster.nombre}
              <Chip
                label={formatEnum(cluster.estado)}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(cluster.estado),
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
                {cluster.cod_tipo_cluster}
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
            {/* Left column - Cluster info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Información del Cluster
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>Tipo de Cluster</TableCell>
                      <TableCell>{cluster.cod_tipo_cluster}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                      <TableCell>{cluster.descripcion || 'N/A'}</TableCell>
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
                <CalendarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Auditoría
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
                      {usuarioCreacionNombre}
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
                      {formatDateTime(cluster.fecha_creacion)}
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
                      {usuarioModificacionNombre}
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
                      {formatDateTime(cluster.fecha_modificacion)}
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
                Estado
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <Chip
                  label={formatEnum(cluster.estado)}
                  size="small"
                  sx={{
                    backgroundColor: getEstadoColor(cluster.estado),
                    color: 'white',
                  }}
                />
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
                <span>Máquinas</span>
                <Chip
                  label={maquinas.length}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <ServerIcon fontSize="small" />
                <span>Servidores</span>
                <Chip
                  label={servidores.length}
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
                Máquinas asociadas a este cluster
              </Typography>
              {maquinas.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Sistema Operativo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Fecha Creación</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {maquinas.map((asignacion) => (
                        asignacion.maquinas && (
                          <TableRow key={asignacion.id} hover>
                            <TableCell>
                              <Link
                                to={routes.maquina({ id: asignacion.maquinas.id })}
                                style={{ textDecoration: 'none' }}
                              >
                                <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                                  {asignacion.maquinas.nombre}
                                </Typography>
                              </Link>
                            </TableCell>
                            <TableCell>{asignacion.maquinas.ip}</TableCell>
                            <TableCell>{asignacion.maquinas.so}</TableCell>
                            <TableCell>
                              <Chip
                                label={formatEnum(asignacion.maquinas.estado)}
                                size="small"
                                sx={{
                                  backgroundColor: getEstadoColor(asignacion.maquinas.estado),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {formatDateTime(asignacion.maquinas.fecha_creacion)}
                            </TableCell>
                          </TableRow>
                        )
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <MachineIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay máquinas asociadas a este cluster.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Servidores asociados a este cluster
              </Typography>
              {servidores.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Data Center</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Fecha Creación</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {servidores.map((asignacion) => (
                        asignacion.servidores && (
                          <TableRow key={asignacion.id} hover>
                            <TableCell>
                              <Link
                                to={routes.servidor({ id: asignacion.servidores.id })}
                                style={{ textDecoration: 'none' }}
                              >
                                <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                                  {asignacion.servidores.nombre}
                                </Typography>
                              </Link>
                            </TableCell>
                            <TableCell>
                              {asignacion.servidores.data_center ? (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <DataCenterIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {asignacion.servidores.data_center.nombre}
                                  </Typography>
                                </Stack>
                              ) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={formatEnum(asignacion.servidores.estado)}
                                size="small"
                                sx={{
                                  backgroundColor: getEstadoColor(asignacion.servidores.estado),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {formatDateTime(asignacion.servidores.fecha_creacion)}
                            </TableCell>
                          </TableRow>
                        )
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <ServerIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay servidores asociados a este cluster.
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

export default Cluster
