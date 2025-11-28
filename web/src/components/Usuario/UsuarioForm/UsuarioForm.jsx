import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { navigate, routes } from '@redwoodjs/router'

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  Stack,
  Avatar,
  Button,
  IconButton,
  InputAdornment,
  useTheme,
  Paper
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos CORREGIDOS
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  ErrorOutline as ErrorIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as SecurityIcon,
  Badge as IdIcon, // Importamos Badge correctamente (Mayúscula)
  ContactPhone as ContactIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. COMPONENTE HELPER: SectionCard
 * --------------------------------------------- */
const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  const activeColor = bgcolor || theme.palette.primary.main
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `3px solid ${activeColor}`,
        bgcolor: 'background.paper',
        height: '100%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: activeColor, width: 32, height: 32 }}>
            {icon}
          </Avatar>
        }
        title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</Typography>}
        sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>{children}</CardContent>
    </Card>
  )
}

/* ---------------------------------------------
 * 2. COMPONENTE PRINCIPAL
 * --------------------------------------------- */
const UsuarioForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.usuario?.id)
  const [showPassword, setShowPassword] = useState(false)

  // Configuración del Formulario
  const formMethods = useForm({
    defaultValues: {
      nombre_usuario: props.usuario?.nombre_usuario || '',
      contrasena: props.usuario?.contrasena || '',
      email: props.usuario?.email || '',
      nombres: props.usuario?.nombres || '',
      primer_apellido: props.usuario?.primer_apellido || '',
      segundo_apellido: props.usuario?.segundo_apellido || '',
      celular: props.usuario?.celular || '',
      nro_documento: props.usuario?.nro_documento || '',
      id_ciudadano_digital: props.usuario?.id_ciudadano_digital || '',
    },
  })

  const { control, handleSubmit, formState: { errors } } = formMethods

  const onSubmit = (data) => {
    const formData = {
      ...data,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: isEdit ? undefined : 3,
    }
    props.onSave(formData, props?.usuario?.id)
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: 2 }}>
      
      {/* CONTENEDOR PRINCIPAL */}
      <Card elevation={3} sx={{ borderRadius: 4, overflow: 'visible' }}>
        
        {/* HEADER */}
        <Box sx={{ 
            px: 5, py: 4, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff',
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
          }}>
            <Avatar sx={{
                  width: 48, height: 48,
                  background: 'linear-gradient(135deg, #1565C0, #7B1FA2)', color: 'white', boxShadow: 3
                }}>
              {isEdit ? <EditIcon /> : <AddIcon />}
            </Avatar>
            
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{
                  lineHeight: 1.2,
                  background: 'linear-gradient(90deg, #1565C0 0%, #7B1FA2 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? 'Actualice la información del usuario' : 'Complete la información para crear un nuevo usuario'}
              </Typography>
            </Box>
        </Box>

        {/* CONTENIDO */}
        <Box sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            
            {/* Mensaje de Error */}
            {props.error && (
              <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                <ErrorOutlineIcon color="error" />
                <Typography variant="body2" fontWeight={600}>{props.error.message}</Typography>
              </Paper>
            )}

            {/* GRID DE 3 COLUMNAS */}
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              alignItems: 'start'
            }}>
              
              {/* --- CARD 1: CREDENCIALES Y ACCESO --- */}
              <SectionCard 
                icon={<SecurityIcon sx={{ fontSize: 20 }} />} 
                title="Credenciales y Acceso"
                bgcolor={theme.palette.primary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Nombre Usuario */}
                  <FormControl fullWidth error={!!errors.nombre_usuario}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre de Usuario *</FormLabel>
                    <Controller
                      name="nombre_usuario"
                      control={control}
                      rules={{ required: 'Requerido' }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="Ej. jdoe" 
                          error={!!errors.nombre_usuario}
                          helperText={errors.nombre_usuario?.message}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Contraseña */}
                  <FormControl fullWidth error={!!errors.contrasena}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Contraseña {isEdit ? '(Opcional)' : '*'}</FormLabel>
                    <Controller
                      name="contrasena"
                      control={control}
                      rules={{ required: isEdit ? false : 'Requerido' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••"
                          error={!!errors.contrasena}
                          helperText={errors.contrasena?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  size="small"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Email */}
                  <FormControl fullWidth error={!!errors.email}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Correo Electrónico *</FormLabel>
                    <Controller
                      name="email"
                      control={control}
                      rules={{ 
                        required: 'Requerido',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email inválido"
                        }
                      }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="ejemplo@agetic.gob.bo" 
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                      )}
                    />
                  </FormControl>

                </Stack>
              </SectionCard>

              {/* --- CARD 2: DATOS PERSONALES --- */}
              <SectionCard 
                icon={<PersonIcon sx={{ fontSize: 20 }} />} 
                title="Datos Personales"
                bgcolor={theme.palette.secondary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Nombres */}
                  <FormControl fullWidth error={!!errors.nombres}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombres *</FormLabel>
                    <Controller
                      name="nombres"
                      control={control}
                      rules={{ required: 'Requerido' }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="Ej. Juan Carlos" 
                          error={!!errors.nombres}
                          helperText={errors.nombres?.message}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Primer Apellido */}
                  <FormControl fullWidth error={!!errors.primer_apellido}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Primer Apellido *</FormLabel>
                    <Controller
                      name="primer_apellido"
                      control={control}
                      rules={{ required: 'Requerido' }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="Ej. Perez" 
                          error={!!errors.primer_apellido}
                          helperText={errors.primer_apellido?.message}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Segundo Apellido */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Segundo Apellido</FormLabel>
                    <Controller
                      name="segundo_apellido"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="Ej. Mamani" 
                        />
                      )}
                    />
                  </FormControl>

                </Stack>
              </SectionCard>

              {/* --- CARD 3: IDENTIFICACIÓN Y CONTACTO --- */}
              <SectionCard 
                icon={<ContactIcon sx={{ fontSize: 20 }} />} 
                title="Identificación y Contacto"
                bgcolor="#2e7d32"
              >
                <Stack spacing={2.5}>
                  
                  {/* Celular */}
                  <FormControl fullWidth error={!!errors.celular}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Celular *</FormLabel>
                    <Controller
                      name="celular"
                      control={control}
                      rules={{ required: 'Requerido' }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="Ej. 77712345" 
                          error={!!errors.celular}
                          helperText={errors.celular?.message}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Nro Documento */}
                  <FormControl fullWidth error={!!errors.nro_documento}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nro. Documento *</FormLabel>
                    <Controller
                      name="nro_documento"
                      control={control}
                      rules={{ required: 'Requerido' }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="Ej. 1234567 LP" 
                          error={!!errors.nro_documento}
                          helperText={errors.nro_documento?.message}
                          InputProps={{ startAdornment: <InputAdornment position="start"><IdIcon fontSize="small" /></InputAdornment> }}
                        />
                      )}
                    />
                  </FormControl>

                  {/* ID Ciudadano Digital */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>ID Ciudadano Digital</FormLabel>
                    <Controller
                      name="id_ciudadano_digital"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="UUID o Identificador" 
                        />
                      )}
                    />
                  </FormControl>

                </Stack>
              </SectionCard>

            </Box>

            {/* BOTONES */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined" color="inherit" startIcon={<CancelIcon />}
                onClick={() => navigate(routes.usuarios())} // Asumiendo ruta
                sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(0, 0, 0, 0.23)' }}
              >
                Cancelar
              </Button>

              <LoadingButton
                type="submit"
                variant="contained"
                loading={props.loading}
                startIcon={<SaveIcon />}
                sx={{ 
                  background: 'linear-gradient(135deg, #1565C0 0%, #7B1FA2 100%)', 
                  boxShadow: 4, 
                  px: 4, 
                  minWidth: 160, 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 700 
                }}
              >
                {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Guardar Usuario')}
              </LoadingButton>
            </Box>

          </form>
        </Box>
      </Card>
    </Box>
  )
}

export default UsuarioForm