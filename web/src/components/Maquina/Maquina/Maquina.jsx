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
  Computer as MachineIcon,
  Dns as ClusterIcon,
  Event as EventIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Business as DataCenterIcon,
  DeveloperBoard as MotherboardIcon,
  Power as PowerIcon,
  CalendarToday as CalendarIcon, // Import añadido para CalendarIcon
  Person as PersonIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
  Storage as ServerIcon,
  Apps as SystemIcon,
  Code as ComponentIcon,
  Cloud as DeploymentIcon,
  People as UsersIcon,
} from '@mui/icons-material'

const DELETE_MAQUINA_MUTATION = gql`
  mutation DeleteMaquinaMutation($id: Int!) {
    deleteMaquina(id: $id) {
      id
    }
  }
`

const GET_SERVIDOR_QUERY = gql`
  query ServidorQuery($id: Int!) {
    maquina(id: $id) {
      asignacion_servidor_maquina {
        id
        servidores {
          id
          nombre
          data_center {
            id
            nombre
          }
        }
      }
    }
  }
`

const GET_CLUSTERS_QUERY = gql`
  query ClustersQuery($id: Int!) {
    maquina(id: $id) {
      asignacion_servidor_maquina {
        id
        clusters {
          id
          nombre
          cod_tipo_cluster
          descripcion
          estado
        }
      }
    }
  }
`

const GET_USUARIOS_QUERY = gql`
  query UsuariosQuery_fromMaquinainfo($id: Int!) {
    maquina(id: $id) {
      usuario_roles {
        id
        usuarios {
          id
          nombres
          primer_apellido
          segundo_apellido
        }
        roles {
          id
          nombre
        }
      }
    }
  }
`

const GET_DESPLIEGUES_QUERY = gql`
  query DesplieguesQuery($id: Int!) {
    maquina(id: $id) {
      despliegue {
        id
        fecha_despliegue
        estado_despliegue
        componentes {
          id
          nombre
          sistemas {
            id
            nombre
          }
        }
      }
    }
  }
`

const GET_SISTEMAS_QUERY = gql`
  query SistemasQuery($id: Int!) {
    maquina(id: $id) {
      despliegue {
        id
        componentes {
          id
          nombre
          sistemas {
            id
            nombre
            sigla
            descripcion
            estado
            componentes {
              id
              nombre
              dominio
              estado
            }
          }
        }
      }
    }
  }
`

const GET_PLATAFORMA_QUERY = gql`
  query PlataformaQuery($codigo: String!) {
  parametros {
    id
    nombre
    codigo
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

const Maquina = ({ maquina }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [deleteMaquina] = useMutation(DELETE_MAQUINA_MUTATION, {
    onCompleted: () => {
      toast.success('Máquina eliminada correctamente')
      navigate(routes.maquinas())
    },
    onError: (error) => {
      toast.error(`Error al eliminar máquina: ${error.message}`)
    },
  })

  const { data: servidorData } = useQuery(GET_SERVIDOR_QUERY, {
    variables: { id: maquina.id }
  })

  const { data: clustersData } = useQuery(GET_CLUSTERS_QUERY, {
    variables: { id: maquina.id }
  })

  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY, {
    variables: { id: maquina.id }
  })

  const { data: desplieguesData } = useQuery(GET_DESPLIEGUES_QUERY, {
    variables: { id: maquina.id }
  })

  const { data: sistemasData } = useQuery(GET_SISTEMAS_QUERY, {
    variables: { id: maquina.id }
  })

  const { data: plataformaData } = useQuery(GET_PLATAFORMA_QUERY, {
    variables: { codigo: maquina.cod_plataforma },
    skip: !maquina.cod_plataforma
  })

  const { data: userCreacionData } = useQuery(GET_USER_CREACION_QUERY, {
    variables: { id: maquina.usuario_creacion },
    skip: !maquina.usuario_creacion
  })

  const { data: userModificacionData } = useQuery(GET_USER_MODIFICACION_QUERY, {
    variables: { id: maquina.usuario_modificacion },
    skip: !maquina.usuario_modificacion
  })

  // Extraer datos de las consultas
  const servidor =
    Array.isArray(servidorData?.maquina?.asignacion_servidor_maquina) &&
      servidorData.maquina.asignacion_servidor_maquina.length > 0
      ? servidorData.maquina.asignacion_servidor_maquina[0].servidores
      : null
  const dataCenter = servidor?.data_center
  const clusters = clustersData?.maquina?.asignacion_servidor_maquina?.filter(a => a.clusters) || []
  const usuarios = usuariosData?.maquina?.usuario_roles || []
  const despliegues = desplieguesData?.maquina?.despliegue || []
  const sistemas = sistemasData?.maquina?.despliegue?.flatMap(d =>
    d.componentes.sistemas
  ) || []
  const plataformaNombre = plataformaData?.parametroByCodigo?.nombre || maquina.cod_plataforma

  // Formatear nombres de usuarios
  const formatUserName = (user) => {
    if (!user) return 'N/A'
    return `${user.nombres || ''} ${user.primer_apellido || ''} ${user.segundo_apellido || ''}`.trim()
  }

  const usuarioCreacionNombre = formatUserName(userCreacionData?.usuario)
  const usuarioModificacionNombre = formatUserName(userModificacionData?.usuario)

  // Formatear almacenamiento
  const formatAlmacenamiento = (almacenamiento) => {
    if (!almacenamiento) return 'No especificado'

    try {
      const discs = Array.isArray(almacenamiento)
        ? almacenamiento
        : JSON.parse(almacenamiento)

      return (
        <Stack spacing={0.5}>
          {discs.map((disc, index) => (
            <div key={index}>
              <strong>Disco {disc.Disco}:</strong> {disc.Valor} GB
            </div>
          ))}
        </Stack>
      )
    } catch (e) {
      return 'Formato inválido'
    }
  }

  const onDeleteClick = (id) => {
    if (confirm(`¿Está seguro que desea eliminar la máquina ${maquina.nombre} (ID: ${id})?`)) {
      deleteMaquina({ variables: { id } })
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const getEstadoColor = (estado) => {
    return estado === 'ACTIVO' ? theme.palette.success.main : theme.palette.error.main
  }

  // Eliminar duplicados de sistemas
  const sistemasUnicos = sistemas.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id)
    if (!x) {
      return acc.concat([current])
    } else {
      return acc
    }
  }, [])

  return (
    <Box sx={{ p: 3 }}>
      {/* acciones */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Volver a la lista">
          <IconButton
            onClick={() => navigate(routes.maquinas())}
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
          {maquina.nombre}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editMaquina({ id: maquina.id })}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Editar Máquina
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteClick(maquina.id)}
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
              <MachineIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {maquina?.nombre || 'Nombre no disponible'}
              <Chip
                label={maquina?.es_virtual ? 'VIRTUAL' : 'FÍSICA'}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: maquina?.es_virtual ? colors.purple[500] : colors.blue[500],
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
                {maquina?.ip || 'IP no disponible'} - {maquina?.so || 'SO no disponible'}
              </Typography>
              <Chip
                label={formatEnum(maquina?.estado)}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(maquina?.estado),
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
                      {maquina?.ram ? `${maquina.ram} GB` : 'No especificado'}
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
                      {formatAlmacenamiento(maquina?.almacenamiento)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Codigo</TableCell>
                      <TableCell>{maquina?.codigo ? `${maquina.codigo}` : '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>IP de la maquina</TableCell>
                      <TableCell>{maquina?.ip ? `${maquina.ip}` : '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>Sistema Operativo</TableCell>
                      <TableCell>{maquina?.so || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Núcleos de CPU</TableCell>
                      <TableCell>{maquina?.cpu ? `${maquina.cpu} cores` : '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Plataforma</TableCell>
                      <TableCell>{plataformaNombre || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Servidor</TableCell>
                      <TableCell>
                        {servidor ? (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ServerIcon fontSize="small" color="action" />
                            <Link to={routes.servidor({ id: servidor.id })} style={{ textDecoration: 'none' }}>
                              <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                                {servidor.nombre}
                              </Typography>
                            </Link>
                          </Stack>
                        ) : 'No asignado'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Data Center</TableCell>
                      <TableCell>
                        {dataCenter ? (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <DataCenterIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {dataCenter.nombre}
                            </Typography>
                          </Stack>
                        ) : 'No asignado'}
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
                      {formatDateTime(maquina?.fecha_creacion)}
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
                      {formatDateTime(maquina?.fecha_modificacion)}
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
                {maquina?.descripcion || 'No hay descripción adicional para esta máquina.'}
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
                <UsersIcon fontSize="small" />
                <span>Usuarios</span>
                <Chip
                  label={usuarios.length}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <DeploymentIcon fontSize="small" />
                <span>Despliegues</span>
                <Chip
                  label={despliegues.length}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <SystemIcon fontSize="small" />
                <span>Sistemas</span>
                <Chip
                  label={sistemasUnicos.length}
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
                Clusters asociados a esta máquina
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
                                  backgroundColor: getEstadoColor(asignacion.clusters.estado),
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
                    Esta máquina no participa en ningún cluster.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Usuarios asociados a esta máquina
              </Typography>
              {usuarios.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usuarios.map((usuarioRol) => (
                        <TableRow key={usuarioRol.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {`${usuarioRol.usuarios?.nombres || ''} ${usuarioRol.usuarios?.primer_apellido || ''} ${usuarioRol.usuarios?.segundo_apellido || ''}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {usuarioRol.roles?.nombre || 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <UsersIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay usuarios asociados a esta máquina.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 2 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Despliegues asociados a esta máquina
              </Typography>
              {despliegues.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Componente</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Sistema</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Fecha Despliegue</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {despliegues.map((despliegue) => (
                        <TableRow key={despliegue.id} hover>
                          <TableCell>
                            <Link
                              to={routes.componente({ id: despliegue.componentes.id })}
                              style={{ textDecoration: 'none' }}
                            >
                              <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                                {despliegue.componentes.nombre}
                              </Typography>
                            </Link>
                          </TableCell>
                          <TableCell>
                            {despliegue.componentes.sistemas ? (
                              <Link
                                to={routes.sistema({ id: despliegue.componentes.sistemas.id })}
                                style={{ textDecoration: 'none' }}
                              >
                                <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                                  {despliegue.componentes.sistemas.nombre}
                                </Typography>
                              </Link>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(despliegue.fecha_despliegue)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={despliegue.estado_despliegue || 'N/A'}
                              size="small"
                              sx={{
                                backgroundColor: despliegue.estado_despliegue === 'ACTIVO' ?
                                  theme.palette.success.main : theme.palette.error.main,
                                color: 'white',
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <DeploymentIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay despliegues asociados a esta máquina.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 3 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Sistemas asociados a esta máquina
              </Typography>
              {sistemasUnicos.length > 0 ? (
                <Box>
                  {sistemasUnicos.map((sistema) => (
                    <Paper key={sistema.id} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            <SystemIcon />
                          </Avatar>
                        }
                        title={
                          <Link
                            to={routes.sistema({ id: sistema.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                              {sistema.nombre}
                              {sistema.sigla && ` (${sistema.sigla})`}
                            </Typography>
                          </Link>
                        }
                        subheader={
                          <Typography variant="body2" color="text.secondary">
                            {sistema.descripcion?.substring(0, 100) || 'Sin descripción'}
                            {sistema.descripcion?.length > 100 ? '...' : ''}
                          </Typography>
                        }
                        action={
                          <Chip
                            label={sistema.estado}
                            size="small"
                            sx={{
                              backgroundColor: getEstadoColor(sistema.estado),
                              color: 'white',
                              fontSize: '0.7rem',
                            }}
                          />
                        }
                      />
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Componentes:
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Dominio</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sistema.componentes.map((componente) => (
                                <TableRow key={componente.id} hover>
                                  <TableCell>
                                    <Link
                                      to={routes.componente({ id: componente.id })}
                                      style={{ textDecoration: 'none' }}
                                    >
                                      <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                                        {componente.nombre}
                                      </Typography>
                                    </Link>
                                  </TableCell>
                                  <TableCell>{componente.dominio}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={componente.estado}
                                      size="small"
                                      sx={{
                                        backgroundColor: getEstadoColor(componente.estado),
                                        color: 'white',
                                        fontSize: '0.7rem',
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <SystemIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay sistemas asociados a esta máquina.
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

export default Maquina
