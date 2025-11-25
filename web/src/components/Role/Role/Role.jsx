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
  Badge as RoleIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  Event as CalendarIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
  People as UsersIcon,
  Email as EmailIcon,
} from '@mui/icons-material'

const DELETE_ROLE_MUTATION = gql`
  mutation DeleteRoleMutation($id: Int!) {
    deleteRole(id: $id) {
      id
    }
  }
`

const GET_USUARIOS_QUERY = gql`
  query UsuariosPorRolQuery($id: Int!) {
    role(id: $id) {
      usuario_roles {
        id
        usuarios {
          id
          nombres
          primer_apellido
          segundo_apellido
          email
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

const Role = ({ role }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [deleteRole] = useMutation(DELETE_ROLE_MUTATION, {
    onCompleted: () => {
      toast.success('Rol eliminado correctamente')
      navigate(routes.roles())
    },
    onError: (error) => {
      toast.error(`Error al eliminar rol: ${error.message}`)
    },
  })

  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY, {
    variables: { id: role.id }
  })

  const { data: userCreacionData } = useQuery(GET_USER_CREACION_QUERY, {
    variables: { id: role.usuario_creacion },
    skip: !role.usuario_creacion
  })

  const { data: userModificacionData } = useQuery(GET_USER_MODIFICACION_QUERY, {
    variables: { id: role.usuario_modificacion },
    skip: !role.usuario_modificacion
  })

  // Extraer datos de las consultas
  const usuarios = usuariosData?.role?.usuario_roles || []

  // Formatear nombres de usuarios
  const formatUserName = (user) => {
    if (!user) return 'N/A'
    return `${user.nombres || ''} ${user.primer_apellido || ''} ${user.segundo_apellido || ''}`.trim()
  }

  const usuarioCreacionNombre = formatUserName(userCreacionData?.usuario)
  const usuarioModificacionNombre = formatUserName(userModificacionData?.usuario)

  const onDeleteClick = (id) => {
    if (confirm(`¿Está seguro que desea eliminar el rol "${role.nombre}" (ID: ${id})?`)) {
      deleteRole({ variables: { id } })
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
            onClick={() => navigate(routes.roles())}
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
          {role.nombre}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editRole({ id: role.id })}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Editar Rol
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteClick(role.id)}
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
              <RoleIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {role.nombre}
              <Chip
                label={formatEnum(role.estado)}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(role.estado),
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
                {role.cod_tipo_rol}
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
            {/* Left column - Role info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Información del Rol
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>Tipo de Rol</TableCell>
                      <TableCell>{role.cod_tipo_rol}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                      <TableCell>{role.descripcion || 'N/A'}</TableCell>
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
                      {formatDateTime(role.fecha_creacion)}
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
                      {formatDateTime(role.fecha_modificacion)}
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
                  label={formatEnum(role.estado)}
                  size="small"
                  sx={{
                    backgroundColor: getEstadoColor(role.estado),
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
        </Tabs>

        <CardContent>
          {activeTab === 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Usuarios con este rol asignado
              </Typography>
              {usuarios.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usuarios.map((usuarioRol) => (
                        usuarioRol.usuarios && (
                          <TableRow key={usuarioRol.id} hover>
                            <TableCell>
                              <Link
                                to={routes.usuario({ id: usuarioRol.usuarios.id })}
                                style={{ textDecoration: 'none' }}
                              >
                                <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                                  {`${usuarioRol.usuarios.nombres} ${usuarioRol.usuarios.primer_apellido} ${usuarioRol.usuarios.segundo_apellido}`}
                                </Typography>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {usuarioRol.usuarios.email}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={formatEnum(usuarioRol.usuarios.estado)}
                                size="small"
                                sx={{
                                  backgroundColor: getEstadoColor(usuarioRol.usuarios.estado),
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
                  <UsersIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay usuarios con este rol asignado.
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

export default Role
