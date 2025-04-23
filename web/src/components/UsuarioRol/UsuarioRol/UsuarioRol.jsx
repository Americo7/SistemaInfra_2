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
  Person as UserIcon,
  VerifiedUser as RoleIcon,
  Computer as MachineIcon,
  Dns as SystemIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material'

const DELETE_USUARIO_ROL_MUTATION = gql`
  mutation DeleteUsuarioRolMutation($id: Int!) {
    deleteUsuarioRol(id: $id) {
      id
    }
  }
`

const GET_USUARIO_QUERY = gql`
  query GetUsuario($id: Int!) {
    usuario(id: $id) {
      id
      nombres
      primer_apellido
    }
  }
`

const GET_ROL_QUERY = gql`
  query GetRol($id: Int!) {
    role(id: $id) {
      id
      nombre
      descripcion
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

const GET_SISTEMA_QUERY = gql`
  query GetSistema($id: Int!) {
    sistema(id: $id) {
      id
      nombre
    }
  }
`

const GET_USUARIOS_QUERY = gql`
  query GetUsuarios {
    usuarios {
      id
      nombres
      primer_apellido
    }
  }
`

const UsuarioRol = ({ usuarioRol }) => {
  const theme = useTheme()

  const [deleteUsuarioRol] = useMutation(DELETE_USUARIO_ROL_MUTATION, {
    onCompleted: () => {
      toast.success('Asignación de rol eliminada correctamente')
      navigate(routes.usuarioRols())
    },
    onError: (error) => {
      toast.error(`Error al eliminar: ${error.message}`)
    },
  })

  // Consultas para las asociaciones
  const { data: usuarioData } = useQuery(GET_USUARIO_QUERY, {
    variables: { id: usuarioRol.id_usuario },
    skip: !usuarioRol.id_usuario
  })

  const { data: rolData } = useQuery(GET_ROL_QUERY, {
    variables: { id: usuarioRol.id_rol },
    skip: !usuarioRol.id_rol
  })

  const { data: maquinaData } = useQuery(GET_MAQUINA_QUERY, {
    variables: { id: usuarioRol.id_maquina },
    skip: !usuarioRol.id_maquina
  })

  const { data: sistemaData } = useQuery(GET_SISTEMA_QUERY, {
    variables: { id: usuarioRol.id_sistema },
    skip: !usuarioRol.id_sistema
  })

  // Consulta para los usuarios (para usuario_creacion/modificacion)
  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)

  // Mapa de IDs a nombres completos
  const usuariosMap = usuariosData?.usuarios?.reduce((map, usuario) => {
    map[usuario.id] = `${usuario.nombres} ${usuario.primer_apellido}`
    return map
  }, {}) || {}

  const onDeleteClick = (id) => {
    if (confirm(`¿Está seguro que desea eliminar esta asignación de rol (ID: ${id})?`)) {
      deleteUsuarioRol({ variables: { id } })
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
            onClick={() => navigate(routes.usuarioRols())}
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
          Asignación Rol-Usuario #{usuarioRol.id}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editUsuarioRol({ id: usuarioRol.id })}
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
            onClick={() => onDeleteClick(usuarioRol.id)}
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
              <RoleIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Asignación #{usuarioRol.id}
              <Chip
                label={usuarioRol.estado}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(usuarioRol.estado),
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
                Creada el {formatDate(usuarioRol.fecha_creacion)}
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
                      <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                      <TableCell>
                        {usuarioData?.usuario ? (
                          <Link
                            to={routes.usuario({ id: usuarioData.usuario.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <UserIcon fontSize="small" color="action" />
                              <span style={{ color: theme.palette.primary.main }}>
                                {`${usuarioData.usuario.nombres} ${usuarioData.usuario.primer_apellido}`}
                              </span>
                            </Stack>
                          </Link>
                        ) : usuarioRol.id_usuario ? usuarioRol.id_usuario : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                      <TableCell>
                        {rolData?.role ? (
                          <Link
                            to={routes.role({ id: rolData.role.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <RoleIcon fontSize="small" color="action" />
                              <span style={{ color: theme.palette.primary.main }}>
                                {rolData.role.nombre}
                              </span>
                            </Stack>
                          </Link>
                        ) : usuarioRol.id_rol ? usuarioRol.id_rol : 'N/A'}
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
                        ) : usuarioRol.id_maquina ? usuarioRol.id_maquina : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Sistema</TableCell>
                      <TableCell>
                        {sistemaData?.sistema ? (
                          <Link
                            to={routes.sistema({ id: sistemaData.sistema.id })}
                            style={{ textDecoration: 'none' }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <SystemIcon fontSize="small" color="action" />
                              <span style={{ color: theme.palette.primary.main }}>
                                {sistemaData.sistema.nombre}
                              </span>
                            </Stack>
                          </Link>
                        ) : usuarioRol.id_sistema ? usuarioRol.id_sistema : 'N/A'}
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
                      <UserIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Creado por
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {usuariosMap[usuarioRol.usuario_creacion] || usuarioRol.usuario_creacion || 'N/A'}
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
                      {formatDate(usuarioRol.fecha_creacion)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <UserIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Modificado por
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {usuariosMap[usuarioRol.usuario_modificacion] || usuarioRol.usuario_modificacion || 'N/A'}
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
                      {formatDate(usuarioRol.fecha_modificacion)}
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
                Estado
              </Typography>
              <Chip
                label={usuarioRol.estado}
                sx={{
                  backgroundColor: getEstadoColor(usuarioRol.estado),
                  color: 'white',
                  fontSize: '1rem',
                  padding: '0.5rem',
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default UsuarioRol
