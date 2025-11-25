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
  Person as PersonIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  Event as EventIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
  Badge as RoleIcon,
  Apps as SystemIcon,
  Computer as MachineIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Fingerprint as FingerprintIcon,
  Lock as PasswordIcon,
  AssignmentInd as DocumentIcon,
  Event as CalendarIcon,
} from '@mui/icons-material'

const DELETE_USUARIO_MUTATION = gql`
  mutation DeleteUsuarioMutation($id: Int!) {
    deleteUsuario(id: $id) {
      id
    }
  }
`

const GET_ROLES_QUERY = gql`
  query RolesUsuarioQuery($id: Int!) {
    usuario(id: $id) {
      usuario_roles {
        id
        roles {
          id
          nombre
          cod_tipo_rol
          descripcion
          estado
        }
      }
    }
  }
`

const GET_SISTEMAS_QUERY = gql`
  query SistemasUsuarioQuery($id: Int!) {
    usuario(id: $id) {
      usuario_roles {
        id
        sistemas {
          id
          nombre
          sigla
          descripcion
          estado
        }
      }
    }
  }
`

const GET_MAQUINAS_QUERY = gql`
  query MaquinasUsuarioQuery($id: Int!) {
    usuario(id: $id) {
      usuario_roles {
        id
        maquinas {
          id
          nombre
          ip
          so
          estado
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

const Usuario = ({ usuario }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [deleteUsuario] = useMutation(DELETE_USUARIO_MUTATION, {
    onCompleted: () => {
      toast.success('Usuario eliminado correctamente')
      navigate(routes.usuarios())
    },
    onError: (error) => {
      toast.error(`Error al eliminar usuario: ${error.message}`)
    },
  })

  const { data: rolesData } = useQuery(GET_ROLES_QUERY, {
    variables: { id: usuario.id }
  })

  const { data: sistemasData } = useQuery(GET_SISTEMAS_QUERY, {
    variables: { id: usuario.id }
  })

  const { data: maquinasData } = useQuery(GET_MAQUINAS_QUERY, {
    variables: { id: usuario.id }
  })

  const { data: userCreacionData } = useQuery(GET_USER_CREACION_QUERY, {
    variables: { id: usuario.usuario_creacion },
    skip: !usuario.usuario_creacion
  })

  const { data: userModificacionData } = useQuery(GET_USER_MODIFICACION_QUERY, {
    variables: { id: usuario.usuario_modificacion },
    skip: !usuario.usuario_modificacion
  })

  // Extraer datos de las consultas
  const roles = rolesData?.usuario?.usuario_roles || []
  const sistemas = sistemasData?.usuario?.usuario_roles || []
  const maquinas = maquinasData?.usuario?.usuario_roles || []

  // Eliminar duplicados de sistemas y máquinas
  const sistemasUnicos = sistemas.reduce((acc, current) => {
    if (current.sistemas) {
      const x = acc.find(item => item.sistemas?.id === current.sistemas?.id)
      if (!x) {
        return acc.concat([current])
      }
    }
    return acc
  }, [])

  const maquinasUnicas = maquinas.reduce((acc, current) => {
    if (current.maquinas) {
      const x = acc.find(item => item.maquinas?.id === current.maquinas?.id)
      if (!x) {
        return acc.concat([current])
      }
    }
    return acc
  }, [])

  // Formatear nombres de usuarios
  const formatUserName = (user) => {
    if (!user) return 'N/A'
    return `${user.nombres || ''} ${user.primer_apellido || ''} ${user.segundo_apellido || ''}`.trim()
  }

  const usuarioCreacionNombre = formatUserName(userCreacionData?.usuario)
  const usuarioModificacionNombre = formatUserName(userModificacionData?.usuario)

  const onDeleteClick = (id) => {
    if (confirm(`¿Está seguro que desea eliminar el usuario ${usuario.nombres} ${usuario.primer_apellido} (ID: ${id})?`)) {
      deleteUsuario({ variables: { id } })
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
            onClick={() => navigate(routes.usuarios())}
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
          {usuario.nombres} {usuario.primer_apellido} {usuario.segundo_apellido}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editUsuario({ id: usuario.id })}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Editar Usuario
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteClick(usuario.id)}
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
              <PersonIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {usuario.nombres} {usuario.primer_apellido} {usuario.segundo_apellido}
              <Chip
                label={formatEnum(usuario.estado)}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(usuario.estado),
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
                {usuario.nombre_usuario} - {usuario.email}
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
            {/* Left column - User info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Información Personal
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>Nombre de Usuario</TableCell>
                      <TableCell>{usuario.nombre_usuario}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Nombre(s)</TableCell>
                      <TableCell>{usuario.nombres}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Primer Apellido</TableCell>
                      <TableCell>{usuario.primer_apellido}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Segundo Apellido</TableCell>
                      <TableCell>{usuario.segundo_apellido}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>ID Ciudadano Digital</TableCell>
                      <TableCell>{usuario.id_ciudadano_digital || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Número de Documento</TableCell>
                      <TableCell>{usuario.nro_documento}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Correo Electrónico</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {usuario.email}
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Teléfono Celular</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {usuario.celular}
                          </Typography>
                        </Stack>
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
                <EventIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
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
                      {formatDateTime(usuario.fecha_creacion)}
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
                      {formatDateTime(usuario.fecha_modificacion)}
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
                  label={formatEnum(usuario.estado)}
                  size="small"
                  sx={{
                    backgroundColor: getEstadoColor(usuario.estado),
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
                <RoleIcon fontSize="small" />
                <span>Roles</span>
                <Chip
                  label={roles.length}
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
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <MachineIcon fontSize="small" />
                <span>Máquinas</span>
                <Chip
                  label={maquinasUnicas.length}
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
                Roles asignados a este usuario
              </Typography>
              {roles.length > 0 ? (
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
                      {roles.map((usuarioRol) => (
                        usuarioRol.roles && (
                          <TableRow key={usuarioRol.id} hover>
                            <TableCell>
                              <Link
                                to={routes.role({ id: usuarioRol.roles.id })}
                                style={{ textDecoration: 'none' }}
                              >
                                <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                                  {usuarioRol.roles.nombre}
                                </Typography>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={usuarioRol.roles.cod_tipo_rol || 'N/A'}
                                size="small"
                                sx={{
                                  backgroundColor: theme.palette.grey[200],
                                  fontSize: '0.7rem',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {usuarioRol.roles.descripcion?.substring(0, 50) || 'N/A'}
                                {usuarioRol.roles.descripcion?.length > 50 ? '...' : ''}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={formatEnum(usuarioRol.roles.estado)}
                                size="small"
                                sx={{
                                  backgroundColor: getEstadoColor(usuarioRol.roles.estado),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <RoleIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    Este usuario no tiene roles asignados.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Sistemas asociados a este usuario
              </Typography>
              {sistemasUnicos.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Sigla</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>


                      </TableRow>

                    </TableHead>
                    <TableBody>
                      {sistemasUnicos.map((usuarioRol) => (
                        usuarioRol.sistemas && (
                          <TableRow key={usuarioRol.id} hover>
                            <TableCell>
                              <Link
                                to={routes.sistema({ id: usuarioRol.sistemas.id })}
                                style={{ textDecoration: 'none' }}
                              >
                                <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                                  {usuarioRol.sistemas.nombre}
                                </Typography>
                              </Link>
                            </TableCell>
                            <TableCell>{usuarioRol.sistemas.sigla || 'N/A'}</TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {usuarioRol.sistemas.descripcion?.substring(0, 50) || 'N/A'}
                                {usuarioRol.sistemas.descripcion?.length > 50 ? '...' : ''}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={formatEnum(usuarioRol.sistemas.estado)}
                                size="small"
                                sx={{
                                  backgroundColor: getEstadoColor(usuarioRol.sistemas.estado),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <SystemIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    Este usuario no está asociado a ningún sistema.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 2 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Máquinas asociadas a este usuario
              </Typography>
              {maquinasUnicas.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Sistema Operativo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>

                      </TableRow>

                    </TableHead>
                    <TableBody>
                      {maquinasUnicas.map((usuarioRol) => (
                        usuarioRol.maquinas && (
                          <TableRow key={usuarioRol.id} hover>
                            <TableCell>
                              <Link
                                to={routes.maquina({ id: usuarioRol.maquinas.id })}
                                style={{ textDecoration: 'none' }}
                              >
                                <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                                  {usuarioRol.maquinas.nombre}
                                </Typography>
                              </Link>
                            </TableCell>
                            <TableCell>{usuarioRol.maquinas.ip}</TableCell>
                            <TableCell>{usuarioRol.maquinas.so}</TableCell>
                            <TableCell>
                              <Chip
                                label={formatEnum(usuarioRol.maquinas.estado)}
                                size="small"
                                sx={{
                                  backgroundColor: getEstadoColor(usuarioRol.maquinas.estado),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
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
                    Este usuario no tiene máquinas asignadas.
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </CardContent>
      </Card >
    </Box >
  )
}

export default Usuario
