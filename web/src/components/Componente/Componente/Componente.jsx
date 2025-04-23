import { useState } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

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
  Code as ComponentIcon,
  Storage as ServerIcon,
  Computer as MachineIcon,
  Dns as SystemIcon,
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
  Cloud as DeployIcon,
  Lan as NetworkIcon,
  OpenInNew as OpenInNewIcon,
  Code as CodeIcon,
} from '@mui/icons-material'

const DELETE_COMPONENTE_MUTATION = gql`
  mutation DeleteComponenteMutation($id: Int!) {
    deleteComponente(id: $id) {
      id
    }
  }
`

const GET_USUARIOS_QUERY = gql`
  query FindUsuarios_fromComponenteVista {
    usuarios {
      id
      nombres
      primer_apellido
    }
  }
`

const GET_DESPLEGUES_QUERY = gql`
  query FindDesplieguesByComponente($id: Int!) {
    componente(id: $id) {
      despliegue {
        id
        fecha_despliegue
        estado_despliegue
        solicitante
        cod_tipo_respaldo
        descripcion
        maquinas {
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
    }
  }
`

const GET_SISTEMA_QUERY = gql`
  query FindSistemaById_fromComponenteVista($id: Int!) {
    sistema(id: $id) {
      id
      nombre
      codigo
      sigla
      descripcion
      estado
    }
  }
`

const GET_MAQUINAS_QUERY = gql`
  query FindMaquinasByComponente($id: Int!) {
    componente(id: $id) {
      despliegue {
        maquinas {
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
    }
  }
`

const Componente = ({ componente }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)

  const [deleteComponente] = useMutation(DELETE_COMPONENTE_MUTATION, {
    onCompleted: () => {
      toast.success('Componente eliminado correctamente')
      navigate(routes.componentes())
    },
    onError: (error) => {
      toast.error(`Error al eliminar componente: ${error.message}`)
    },
  })

  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)
  const { data: desplieguesData } = useQuery(GET_DESPLEGUES_QUERY, {
    variables: { id: componente.id }
  })
  const { data: sistemaData } = useQuery(GET_SISTEMA_QUERY, {
    variables: { id: componente.id_sistema }
  })
  const { data: maquinasData } = useQuery(GET_MAQUINAS_QUERY, {
    variables: { id: componente.id }
  })

  const usuariosMap = usuariosData?.usuarios?.reduce((map, usuario) => {
    map[usuario.id] = `${usuario.nombres} ${usuario.primer_apellido}`
    return map
  }, {}) || {}

  const onDeleteClick = (id) => {
    if (confirm(`¿Está seguro que desea eliminar el componente ${componente.nombre} (ID: ${id})?`)) {
      deleteComponente({ variables: { id } })
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

  // Función mejorada para formatear la tecnología
  const formatTecnologia = (tecnologia) => {
    if (!tecnologia) {
      return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No hay información de tecnología registrada
          </Typography>
        </Paper>
      )
    }

    try {
      // Intenta parsear si es string
      let techData = typeof tecnologia === 'string' ? JSON.parse(tecnologia) : tecnologia

      // Si es array
      if (Array.isArray(techData)) {
        return (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {techData.map((tech, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CodeIcon fontSize="small" color="primary" />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {tech.nombre || 'Tecnología no especificada'}
                    </Typography>
                    {tech.version && (
                      <Typography variant="body2" color="text.secondary">
                        Versión: {tech.version}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )
      }
      // Si es objeto
      else if (typeof techData === 'object' && techData !== null) {
        return (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CodeIcon fontSize="small" color="primary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {techData.nombre || 'Tecnología no especificada'}
                </Typography>
                {techData.version && (
                  <Typography variant="body2" color="text.secondary">
                    Versión: {techData.version}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>
        )
      }
    } catch (e) {
      console.error('Error al parsear tecnología:', e)
    }

    // Si no coincide con ningún formato esperado
    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
        <Typography variant="body2">
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(tecnologia, null, 2)}
          </pre>
        </Typography>
      </Paper>
    )
  }

  // Procesar datos de las consultas
  const despliegues = desplieguesData?.componente?.despliegue || []
  const sistema = sistemaData?.sistema || null
  const maquinas = maquinasData?.componente?.despliegue?.flatMap(d => d.maquinas) || []

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Volver a la lista">
          <IconButton
            onClick={() => navigate(routes.componentes())}
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
          {componente.nombre}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editComponente({ id: componente.id })}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Editar Componente
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteClick(componente.id)}
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
              <ComponentIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {componente.nombre}
              <Chip
                label={componente.estado}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(componente.estado),
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
                {componente.dominio} • {componente.cod_entorno}
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
            {/* Columna izquierda - Detalles del componente */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Detalles del Componente
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>Dominio</TableCell>
                      <TableCell>
                        {componente.dominio ? (
                          <MuiLink
                            href={`https://${componente.dominio}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            {componente.dominio}
                            <OpenInNewIcon fontSize="small" sx={{ ml: 1 }} />
                          </MuiLink>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Entorno</TableCell>
                      <TableCell>{componente.cod_entorno || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Categoría</TableCell>
                      <TableCell>{componente.cod_categoria || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Repositorio GitLab</TableCell>
                      <TableCell>
                        {componente.gitlab_repo ? (
                          <MuiLink
                            href={componente.gitlab_repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            {componente.gitlab_repo}
                            <OpenInNewIcon fontSize="small" sx={{ ml: 1 }} />
                          </MuiLink>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Rama GitLab</TableCell>
                      <TableCell>
                        {componente.gitlab_rama ? (
                          <MuiLink
                            href={`${componente.gitlab_repo}/tree/${componente.gitlab_rama}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            {componente.gitlab_rama}
                            <OpenInNewIcon fontSize="small" sx={{ ml: 1 }} />
                          </MuiLink>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Sistema</TableCell>
                      <TableCell>
                        {sistema ? (
                          <Link to={routes.sistema({ id: sistema.id })} style={{ textDecoration: 'none' }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <SystemIcon fontSize="small" color="action" />
                              <span style={{ color: theme.palette.primary.main }}>
                                {sistema.nombre}
                              </span>
                            </Stack>
                          </Link>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" sx={{
                mt: 3,
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <MotherboardIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Tecnología
              </Typography>
              {formatTecnologia(componente.tecnologia)}
            </Grid>

            {/* Columna derecha - Estado y auditoría */}
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
                      {usuariosMap[componente.usuario_creacion] || 'N/A'}
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
                      {formatDate(componente.fecha_creacion)}
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
                      {usuariosMap[componente.usuario_modificacion] || 'N/A'}
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
                      {formatDate(componente.fecha_modificacion)}
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
                Descripción
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {componente.descripcion || 'No hay descripción adicional para este componente.'}
              </Typography>
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
                <DeployIcon fontSize="small" />
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
                <span>Sistema</span>
              </Stack>
            }
          />
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
        </Tabs>

        <CardContent>
          {activeTab === 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Historial de despliegues de este componente
              </Typography>
              {despliegues.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Máquina</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Solicitante</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tipo Respaldo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {despliegues.map((despliegue) => (
                        <TableRow key={despliegue.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(despliegue.fecha_despliegue)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={despliegue.estado_despliegue}
                              size="small"
                              sx={{
                                backgroundColor:
                                  despliegue.estado_despliegue === 'EXITOSO' ? theme.palette.success.main :
                                  despliegue.estado_despliegue === 'FALLIDO' ? theme.palette.error.main :
                                  theme.palette.warning.main,
                                color: 'white',
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {despliegue.maquinas ? (
                              <Link
                                to={routes.maquina({ id: despliegue.maquinas.id })}
                                style={{ textDecoration: 'none' }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <MachineIcon fontSize="small" color="action" />
                                  <span style={{ color: theme.palette.primary.main }}>
                                    {despliegue.maquinas.nombre || 'N/A'}
                                  </span>
                                </Stack>
                              </Link>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {despliegue.solicitante || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {despliegue.cod_tipo_respaldo || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {despliegue.descripcion?.substring(0, 60) || 'N/A'}
                              {despliegue.descripcion?.length > 60 ? '...' : ''}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <DeployIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay despliegues registrados para este componente.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Sistema al que pertenece este componente
              </Typography>
              {sistema ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Sigla</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell>
                          <Link
                            to={routes.sistema({ id: sistema.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <SystemIcon fontSize="small" color="action" />
                              <span style={{ color: theme.palette.primary.main }}>
                                {sistema.nombre}
                              </span>
                            </Stack>
                          </Link>
                        </TableCell>
                        <TableCell>{sistema.codigo || '-'}</TableCell>
                        <TableCell>{sistema.sigla || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={sistema.estado}
                            size="small"
                            sx={{
                              backgroundColor: getEstadoColor(sistema.estado),
                              color: 'white',
                              fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {sistema.descripcion?.substring(0, 60) || 'N/A'}
                            {sistema.descripcion?.length > 60 ? '...' : ''}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <SystemIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    Este componente no está asociado a ningún sistema.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 2 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Máquinas donde está desplegado este componente
              </Typography>
              {maquinas.length > 0 ? (
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
                      {maquinas.map((maquina) => (
                        <TableRow key={maquina.id} hover>
                          <TableCell>
                            <Link
                              to={routes.maquina({ id: maquina.id })}
                              style={{ textDecoration: 'none' }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                                {maquina.nombre || 'N/A'}
                              </Typography>
                            </Link>
                          </TableCell>
                          <TableCell>{maquina.ip || 'N/A'}</TableCell>
                          <TableCell>{maquina.so || 'N/A'}</TableCell>
                          <TableCell>
                            {maquina.ram ? `${maquina.ram} GB` : '-'}
                          </TableCell>
                          <TableCell>
                            {maquina.cpu ? `${maquina.cpu} cores` : '-'}
                          </TableCell>
                          <TableCell>
                            {maquina.cod_plataforma || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {maquina.estado ? (
                              <Chip
                                label={maquina.estado}
                                size="small"
                                sx={{
                                  backgroundColor: getEstadoColor(maquina.estado),
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
                    Este componente no está desplegado en ninguna máquina.
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

export default Componente
