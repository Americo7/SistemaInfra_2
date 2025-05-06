import { useState } from 'react'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
} from '@redwoodjs/forms'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  useTheme,
  IconButton,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  CheckCircleOutline,
  Person,
  Email,
  Phone,
  Badge,
  AccountCircle,
  Lock,
  Assignment,
  DriveFileRenameOutline,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import { useAuth } from 'src/auth'

const UsuarioForm = (props) => {
  const theme = useTheme()
  const { currentUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const onSubmit = (data) => {
    const formData = {
      ...data,
      estado: 'ACTIVO',
      usuario_creacion: props.usuario?.id ? props.usuario.usuario_creacion : currentUser?.id,
      usuario_modificacion: currentUser?.id
    }
    props.onSave(formData, props?.usuario?.id)
  }

  return (
    <Card
      sx={{
        maxWidth: '1000px',
        margin: 'auto',
        boxShadow: theme.shadows[6],
        borderRadius: '12px',
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 3,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          marginTop: '-1px',
        }}
      >
        <Typography variant="h5" fontWeight="600">
          {props.usuario?.id ? 'Editar Usuario' : 'Nuevo Usuario'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {props.usuario?.id
            ? 'Actualice la información del usuario'
            : 'Complete la información para crear un nuevo usuario'}
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Form onSubmit={onSubmit} error={props.error} autoComplete="off">
          <FormError
            error={props.error}
            wrapperStyle={{
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.contrastText,
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            titleStyle={{
              fontWeight: '600',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            listStyle={{
              listStyleType: 'none',
              padding: 0,
              margin: 0,
            }}
          />

          {/* Sección de acceso */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: theme.palette.primary.dark,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '1rem'
              }}
            >
              <AccountCircle />
              Información de Acceso
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Label
                  name="nombre_usuario"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                >
                  <AccountCircle fontSize="small" sx={{ mr: 1 }} />
                  Nombre Usuario
                </Label>
                <TextField
                  name="nombre_usuario"
                  defaultValue={props.usuario?.nombre_usuario || ''}
                  validation={{ required: true }}
                  autoComplete="off"
                  style={{
                    minHeight: '50px',
                    borderRadius: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '0.9375rem',
                  }}
                  errorStyle={{
                    border: `1px solid ${theme.palette.error.main}`,
                    backgroundColor: theme.palette.error.light,
                  }}
                />
                <FieldError
                  name="nombre_usuario"
                  style={{
                    color: theme.palette.error.main,
                    fontSize: '0.75rem',
                    marginTop: '4px',
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Label
                  name="contrasena"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                >
                  <Lock fontSize="small" sx={{ mr: 1 }} />
                  Contraseña
                </Label>
                <div style={{ position: 'relative' }}>
                  <TextField
                    name="contrasena"
                    defaultValue={props.usuario?.contrasena || ''}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    style={{
                      minHeight: '50px',
                      borderRadius: '8px',
                      width: '100%',
                      padding: '12px 16px',
                      paddingRight: '48px', // Espacio para el icono
                      border: `1px solid ${theme.palette.divider}`,
                      fontSize: '0.9375rem',
                    }}
                    errorStyle={{
                      border: `1px solid ${theme.palette.error.main}`,
                      backgroundColor: theme.palette.error.light,
                    }}
                  />
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </div>
                <FieldError
                  name="contrasena"
                  style={{
                    color: theme.palette.error.main,
                    fontSize: '0.75rem',
                    marginTop: '4px',
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Sección de identificación */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: theme.palette.primary.dark,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '1rem'
              }}
            >
              <Badge />
              Identificación
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Label
                  name="id_ciudadano_digital"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                >
                  <Assignment fontSize="small" sx={{ mr: 1 }} />
                  ID Ciudadano Digital
                </Label>
                <TextField
                  name="id_ciudadano_digital"
                  defaultValue={props.usuario?.id_ciudadano_digital || ''}
                  style={{
                    minHeight: '50px',
                    borderRadius: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '0.9375rem',
                  }}
                  errorStyle={{
                    border: `1px solid ${theme.palette.error.main}`,
                    backgroundColor: theme.palette.error.light,
                  }}
                />
                <FieldError
                  name="id_ciudadano_digital"
                  style={{
                    color: theme.palette.error.main,
                    fontSize: '0.75rem',
                    marginTop: '4px',
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Label
                  name="nro_documento"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                >
                  <Badge fontSize="small" sx={{ mr: 1 }} />
                  Nro. Documento
                </Label>
                <TextField
                  name="nro_documento"
                  defaultValue={props.usuario?.nro_documento || ''}
                  validation={{ required: true }}
                  style={{
                    minHeight: '50px',
                    borderRadius: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '0.9375rem',
                  }}
                  errorStyle={{
                    border: `1px solid ${theme.palette.error.main}`,
                    backgroundColor: theme.palette.error.light,
                  }}
                />
                <FieldError
                  name="nro_documento"
                  style={{
                    color: theme.palette.error.main,
                    fontSize: '0.75rem',
                    marginTop: '4px',
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Sección datos personales */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: theme.palette.primary.dark,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '1rem'
              }}
            >
              <Person />
              Datos Personales
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Label
                  name="nombres"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                >
                  <DriveFileRenameOutline fontSize="small" sx={{ mr: 1 }} />
                  Nombres
                </Label>
                <TextField
                  name="nombres"
                  defaultValue={props.usuario?.nombres || ''}
                  validation={{ required: true }}
                  style={{
                    minHeight: '50px',
                    borderRadius: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '0.9375rem',
                  }}
                  errorStyle={{
                    border: `1px solid ${theme.palette.error.main}`,
                    backgroundColor: theme.palette.error.light,
                  }}
                />
                <FieldError
                  name="nombres"
                  style={{
                    color: theme.palette.error.main,
                    fontSize: '0.75rem',
                    marginTop: '4px',
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Label
                  name="primer_apellido"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                >
                  <DriveFileRenameOutline fontSize="small" sx={{ mr: 1 }} />
                  Primer Apellido
                </Label>
                <TextField
                  name="primer_apellido"
                  defaultValue={props.usuario?.primer_apellido || ''}
                  validation={{ required: true }}
                  style={{
                    minHeight: '50px',
                    borderRadius: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '0.9375rem',
                  }}
                  errorStyle={{
                    border: `1px solid ${theme.palette.error.main}`,
                    backgroundColor: theme.palette.error.light,
                  }}
                />
                <FieldError
                  name="primer_apellido"
                  style={{
                    color: theme.palette.error.main,
                    fontSize: '0.75rem',
                    marginTop: '4px',
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Label
                  name="segundo_apellido"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                >
                  <DriveFileRenameOutline fontSize="small" sx={{ mr: 1 }} />
                  Segundo Apellido
                </Label>
                <TextField
                  name="segundo_apellido"
                  defaultValue={props.usuario?.segundo_apellido || ''}
                  validation={{ required: true }}
                  style={{
                    minHeight: '50px',
                    borderRadius: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '0.9375rem',
                  }}
                  errorStyle={{
                    border: `1px solid ${theme.palette.error.main}`,
                    backgroundColor: theme.palette.error.light,
                  }}
                />
                <FieldError
                  name="segundo_apellido"
                  style={{
                    color: theme.palette.error.main,
                    fontSize: '0.75rem',
                    marginTop: '4px',
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Sección de contacto */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: theme.palette.primary.dark,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '1rem'
              }}
            >
              <Phone />
              Información de Contacto
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Label
                  name="celular"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                >
                  <Phone fontSize="small" sx={{ mr: 1 }} />
                  Celular
                </Label>
                <TextField
                  name="celular"
                  defaultValue={props.usuario?.celular || ''}
                  validation={{ required: true }}
                  style={{
                    minHeight: '50px',
                    borderRadius: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '0.9375rem',
                  }}
                  errorStyle={{
                    border: `1px solid ${theme.palette.error.main}`,
                    backgroundColor: theme.palette.error.light,
                  }}
                />
                <FieldError
                  name="celular"
                  style={{
                    color: theme.palette.error.main,
                    fontSize: '0.75rem',
                    marginTop: '4px',
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Label
                  name="email"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                >
                  <Email fontSize="small" sx={{ mr: 1 }} />
                  Email
                </Label>
                <TextField
                  name="email"
                  defaultValue={props.usuario?.email || ''}
                  validation={{ required: true }}
                  style={{
                    minHeight: '50px',
                    borderRadius: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '0.9375rem',
                  }}
                  errorStyle={{
                    border: `1px solid ${theme.palette.error.main}`,
                    backgroundColor: theme.palette.error.light,
                  }}
                />
                <FieldError
                  name="email"
                  style={{
                    color: theme.palette.error.main,
                    fontSize: '0.75rem',
                    marginTop: '4px',
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={props.loading}
              loadingPosition="start"
              startIcon={props.loading ? null : <CheckCircleOutline fontSize="small" />}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '0.9375rem',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {props.loading ? 'Guardando...' : 'Guardar Usuario'}
            </LoadingButton>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UsuarioForm
