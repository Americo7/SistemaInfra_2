import { useState } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { gql } from '@apollo/client'

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
  Stack,
  Tooltip,
  useTheme,
  Link as MuiLink,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cloud as DeployIcon,
  Computer as MachineIcon,
  Dns as SystemIcon,
  Event as EventIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
  Storage as ServerIcon,
  DeveloperBoard as ComponentIcon,
  OpenInNew as OpenInNewIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Assignment as LogIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
} from '@mui/icons-material'

const DELETE_DESPLIEGUE_MUTATION = gql`
  mutation DeleteDespliegueMutation($id: Int!) {
    deleteDespliegue(id: $id) {
      id
    }
  }
`

const GET_USUARIOS_QUERY = gql`
  query FindUsuarios_fromDespliegueVista {
    usuarios {
      id
      nombres
      primer_apellido
    }
  }
`

const GET_COMPONENTE_QUERY = gql`
  query FindComponenteById_fromDespliegueVista($id: Int!) {
    componente(id: $id) {
      id
      nombre
      dominio
      cod_entorno
      cod_categoria
      gitlab_repo
      gitlab_rama
      tecnologia
      descripcion
      estado
      sistemas {
        id
        nombre
        codigo
        sigla
        descripcion
        estado
      }
    }
  }
`

const GET_MAQUINA_QUERY = gql`
  query FindMaquinaById_fromDespliegueVista($id: Int!) {
    maquina(id: $id) {
      id
      nombre
      ip
      so
      ram
      cpu
      cod_plataforma
      estado
      es_virtual
      asignacion_servidor_maquina {
        id
        servidores {
          id
          nombre
          cod_inventario_agetic
          serie
          marca
          modelo
          estado
          data_center {
            id
            nombre
            ubicacion
          }
        }
      }
    }
  }
`

const GET_BITACORA_QUERY = gql`
  query FindBitacoraByDespliegueId($id: Int!) {
    despliegueBitacora(id: $id) {
      id
      estado_anterior
      estado_actual
      fecha_creacion
      usuario_creacion
      descripcion
    }
  }
`

const Despliegue = ({ despliegue }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)

  const [deleteDespliegue] = useMutation(DELETE_DESPLIEGUE_MUTATION, {
    onCompleted: () => {
      toast.success('Despliegue eliminado correctamente')
      navigate(routes.despliegues())
    },
    onError: (error) => {
      toast.error(`Error al eliminar despliegue: ${error.message}`)
    },
  })

  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)
  const { data: componenteData } = useQuery(GET_COMPONENTE_QUERY, {
    variables: { id: despliegue.id_componente },
    skip: !despliegue.id_componente
  })
  const { data: maquinaData } = useQuery(GET_MAQUINA_QUERY, {
    variables: { id: despliegue.id_maquina },
    skip: !despliegue.id_maquina
  })
  const { data: bitacoraData, loading: loadingBitacora } = useQuery(GET_BITACORA_QUERY, {
    variables: { id: despliegue.id }
  })

  const usuariosMap = usuariosData?.usuarios?.reduce((map, usuario) => {
    map[usuario.id] = `${usuario.nombres} ${usuario.primer_apellido}`
    return map
  }, {}) || {}

  const onDeleteClick = (id) => {
    if (confirm(`¿Está seguro que desea eliminar el despliegue ${id}?`)) {
      deleteDespliegue({ variables: { id } })
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ACTIVO':
      case 'EXITOSO':
        return theme.palette.success.main
      case 'INACTIVO':
      case 'FALLIDO':
        return theme.palette.error.main
      case 'PENDIENTE':
        return theme.palette.warning.main
      default:
        return theme.palette.grey[500]
    }
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

  // Datos relacionados
  const componente = componenteData?.componente || null
  const maquina = maquinaData?.maquina || null
  const sistema = componente?.sistemas || null
  const servidor = maquina?.asignacion_servidor_maquina?.[0]?.servidores || null
  const dataCenter = servidor?.data_center || null
  const bitacoras = bitacoraData?.despliegueBitacora || []

  const renderMaquinaTab = () => (
    <>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Máquina donde se desplegó este componente
      </Typography>

      {maquina ? (
        <Grid container spacing={3}>
          {/* Detalles de la Máquina */}
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 600, textAlign: 'center' }}>
                      Detalles de la Máquina
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: '40%' }}>Nombre</TableCell>
                    <TableCell>{maquina.nombre}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                    <TableCell>{maquina.ip}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Sistema Operativo</TableCell>
                    <TableCell>{maquina.so}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>RAM (GB)</TableCell>
                    <TableCell>{maquina.ram}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>CPU (Cores)</TableCell>
                    <TableCell>{maquina.cpu}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Plataforma</TableCell>
                    <TableCell>{maquina.cod_plataforma}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Es Virtual</TableCell>
                    <TableCell>{maquina.es_virtual ? 'Sí' : 'No'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell>
                      <Chip
                        label={maquina.estado}
                        size="small"
                        sx={{
                          backgroundColor: getEstadoColor(maquina.estado),
                          color: 'white',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Detalles del Servidor Asociado */}
          <Grid item xs={12} md={6}>
            {servidor ? (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 600, textAlign: 'center' }}>
                        Servidor Asociado
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>Nombre</TableCell>
                      <TableCell>
                        <Link to={routes.servidor({ id: servidor.id })} style={{ textDecoration: 'none' }}>
                          <Typography sx={{ color: theme.palette.primary.main }}>
                            {servidor.nombre}
                          </Typography>
                        </Link>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Código Inventario</TableCell>
                      <TableCell>{servidor.cod_inventario_agetic || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Marca/Modelo</TableCell>
                      <TableCell>{servidor.marca} {servidor.modelo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Serie</TableCell>
                      <TableCell>{servidor.serie || '-'}</TableCell>
                    </TableRow>
                    {dataCenter && (
                      <>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Data Center</TableCell>
                          <TableCell>{dataCenter.nombre}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
                          <TableCell>{dataCenter.ubicacion}</TableCell>
                        </TableRow>
                      </>
                    )}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      <TableCell>
                        <Chip
                          label={servidor.estado}
                          size="small"
                          sx={{
                            backgroundColor: getEstadoColor(servidor.estado),
                            color: 'white',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <ServerIcon sx={{ color: theme.palette.text.disabled, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Esta máquina no tiene servidor asociado
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <MachineIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No hay máquina asociada a este despliegue.
          </Typography>
        </Paper>
      )}
    </>
  )

  const renderBitacoraTab = () => (
    <>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Historial de cambios en el despliegue
      </Typography>

      {loadingBitacora ? (
        <LinearProgress />
      ) : bitacoras.length > 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <List sx={{ p: 0 }}>
            {bitacoras.map((bitacora, index) => (
              <Box key={bitacora.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{
                      bgcolor: getEstadoColor(bitacora.estado_actual),
                      width: 40,
                      height: 40,
                    }}>
                      {bitacora.estado_actual === 'EXITOSO' && <SuccessIcon />}
                      {bitacora.estado_actual === 'FALLIDO' && <ErrorIcon />}
                      {bitacora.estado_actual === 'PENDIENTE' && <PendingIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <>
                        <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                          Cambio de estado: {bitacora.estado_anterior} → {bitacora.estado_actual}
                        </Typography>
                        <Chip
                          label={formatDate(bitacora.fecha_creacion)}
                          size="small"
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      </>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" display="block">
                          {bitacora.descripcion || 'Sin descripción disponible'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Registrado por: {usuariosMap[bitacora.usuario_creacion] || 'N/A'}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Ver detalles">
                      <IconButton edge="end" size="small">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < bitacoras.length - 1 && <Divider variant="inset" component="li" />}
              </Box>
            ))}
          </List>
        </Card>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <HistoryIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No hay registros en la bitácora para este despliegue.
          </Typography>
        </Paper>
      )}
    </>
  )

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Volver a la lista">
          <IconButton
            onClick={() => navigate(routes.despliegues())}
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
          Despliegue #{despliegue.id}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editDespliegue({ id: despliegue.id })}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Editar Despliegue
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteClick(despliegue.id)}
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
              <DeployIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Despliegue #{despliegue.id}
              <Chip
                label={despliegue.estado_despliegue}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(despliegue.estado_despliegue),
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
                {formatDate(despliegue.fecha_despliegue)} • {despliegue.descripcion}
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
            {/* Columna izquierda - Detalles del despliegue */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Detalles del Despliegue
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>Fecha Despliegue</TableCell>
                      <TableCell>{formatDate(despliegue.fecha_despliegue)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha Solicitud</TableCell>
                      <TableCell>{formatDate(despliegue.fecha_solicitud)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      <TableCell>
                        <Chip
                          label={despliegue.estado_despliegue}
                          size="small"
                          sx={{
                            backgroundColor: getEstadoColor(despliegue.estado_despliegue),
                            color: 'white',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Solicitante</TableCell>
                      <TableCell>{despliegue.solicitante || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Unidad Solicitante</TableCell>
                      <TableCell>{despliegue.unidad_solicitante || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo Respaldo</TableCell>
                      <TableCell>{despliegue.cod_tipo_respaldo || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Referencia Respaldo</TableCell>
                      <TableCell>{despliegue.referencia_respaldo || '-'}</TableCell>
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
                <DescriptionIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Descripción
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  {despliegue.descripcion || 'No hay descripción disponible para este despliegue.'}
                </Typography>
              </Paper>
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
                      {usuariosMap[despliegue.usuario_creacion] || 'N/A'}
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
                      {formatDate(despliegue.fecha_creacion)}
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
                      {usuariosMap[despliegue.usuario_modificacion] || 'N/A'}
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
                      {formatDate(despliegue.fecha_modificacion)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                Información Adicional
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {despliegue.observaciones || 'No hay observaciones adicionales para este despliegue.'}
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
                <ComponentIcon fontSize="small" />
                <span>Componente</span>
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <MachineIcon fontSize="small" />
                <span>Máquina</span>
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
                <ServerIcon fontSize="small" />
                <span>Servidor</span>
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <HistoryIcon fontSize="small" />
                <span>Bitácora</span>
                {bitacoras.length > 0 && (
                  <Chip
                    label={bitacoras.length}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      minWidth: 20,
                    }}
                  />
                )}
              </Stack>
            }
          />
        </Tabs>

        <CardContent>
          {activeTab === 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Componente asociado a este despliegue
              </Typography>
              {componente ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Dominio</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Entorno</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Categoría</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell>
                          <Link
                            to={routes.componente({ id: componente.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <ComponentIcon fontSize="small" color="action" />
                              <span style={{ color: theme.palette.primary.main }}>
                                {componente.nombre}
                              </span>
                            </Stack>
                          </Link>
                        </TableCell>
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
                        <TableCell>{componente.cod_entorno || '-'}</TableCell>
                        <TableCell>{componente.cod_categoria || '-'}</TableCell>
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
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <ComponentIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay componente asociado a este despliegue.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 1 && renderMaquinaTab()}

          {activeTab === 2 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Sistema al que pertenece este despliegue
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
                    No hay sistema asociado a este despliegue.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 3 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Servidor asociado a este despliegue
              </Typography>
              {servidor ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Código Inventario</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Marca/Modelo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Data Center</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell>
                          <Link
                            to={routes.servidor({ id: servidor.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                              {servidor.nombre}
                            </Typography>
                          </Link>
                        </TableCell>
                        <TableCell>{servidor.cod_inventario_agetic || '-'}</TableCell>
                        <TableCell>
                          {servidor.marca} {servidor.modelo}
                        </TableCell>
                        <TableCell>
                          {dataCenter?.nombre || '-'}
                          {dataCenter?.ubicacion && ` (${dataCenter.ubicacion})`}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={servidor.estado}
                            size="small"
                            sx={{
                              backgroundColor: getEstadoColor(servidor.estado),
                              color: 'white',
                              fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <ServerIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    {maquina ? 'Esta máquina no tiene servidor asociado' : 'No hay servidor asociado a este despliegue'}
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 4 && renderBitacoraTab()}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Despliegue
