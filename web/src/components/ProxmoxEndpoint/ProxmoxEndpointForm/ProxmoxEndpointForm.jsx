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
  useTheme,
  Paper,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  ErrorOutline as ErrorIcon,
  Lan as ConnectionIcon,
  VpnKey as AuthIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. COMPONENTE HELPER: SectionCard (Estandarizado)
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
        bgcolor: 'background.paper', // Soporte Dark Mode
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
const ProxmoxEndpointForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.proxmoxEndpoint?.id)
  const [showSecret, setShowSecret] = useState(false)

  // Configuración del Formulario
  const formMethods = useForm({
    defaultValues: {
      nombre: props.proxmoxEndpoint?.nombre || '',
      dominio: props.proxmoxEndpoint?.dominio || '',
      ip: props.proxmoxEndpoint?.ip || '',
      puerto: props.proxmoxEndpoint?.puerto || '8006',
      ssl: props.proxmoxEndpoint?.ssl ?? true,
      usuario: props.proxmoxEndpoint?.usuario || 'root@pam',
      token_id: props.proxmoxEndpoint?.token_id || '',
      token_secret: props.proxmoxEndpoint?.token_secret || '',
      descripcion: props.proxmoxEndpoint?.descripcion || '',
      estado: props.proxmoxEndpoint?.estado || 'ACTIVO',
    },
  })

  const { control, handleSubmit, formState: { errors } } = formMethods

  const onSubmit = (data) => {
    const formData = {
      ...data,
      puerto: Number(data.puerto),
    }
    props.onSave(formData, props?.proxmoxEndpoint?.id)
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1500, mx: 'auto' }}>
      
      {/* CONTENEDOR PRINCIPAL */}
      <Card 
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderTop: 'none',
          borderRadius: 2,
          mb: 3,
          bgcolor: theme.palette.background.paper, // Soporte Dark Mode
        }}
      >
        
        {/* HEADER (Estilo Estandarizado) */}
        <Box sx={{ 
            px: 5, py: 4, display: 'flex', alignItems: 'center', gap: 2, 
            bgcolor: theme.palette.background.paper, // Soporte Dark Mode
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
          }}>
            <Avatar sx={{
                  width: 48, height: 48, // Estandarizado a 48px
                  background: 'linear-gradient(135deg, #1565C0, #7B1FA2)', color: 'white', boxShadow: 3
                }}>
              {isEdit ? <EditIcon /> : <AddIcon />}
            </Avatar>
            
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{
                  lineHeight: 1.2,
                  // GRADIENTE EN TEXTO
                  background: 'linear-gradient(90deg, #1565C0 0%, #7B1FA2 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                {isEdit ? 'Editar Endpoint' : 'Nuevo Endpoint Proxmox'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? 'Modificar datos de conexión al cluster' : 'Registrar nuevo punto de conexión Proxmox'}
              </Typography>
            </Box>
        </Box>

        {/* CONTENIDO */}
        <Box sx={{ px: 5, pb: 5, pt: 0 }}>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* Mensaje de Error (Dark Mode Friendly) */}
            {props.error && (
              <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#fff4f4', borderColor: 'error.main', color: 'error.main', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                <ErrorIcon color="error" />
                <Typography variant="body2" fontWeight={600}>{props.error.message}</Typography>
              </Paper>
            )}

            {/* GRID DE 2 COLUMNAS */}
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              alignItems: 'start'
            }}>
              
              {/* --- CARD 1: CONEXIÓN + DESCRIPCIÓN (AZUL PRIMARIO) --- */}
              <SectionCard 
                icon={<ConnectionIcon sx={{ fontSize: 20 }} />} 
                title="Datos Generales y Conexión"
                bgcolor={theme.palette.primary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* FILA 1: Nombre y Dominio */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <FormControl fullWidth error={!!errors.nombre}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre del endpoint *</FormLabel>
                      <Controller
                        name="nombre"
                        control={control}
                        rules={{ required: 'El nombre es obligatorio' }}
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            size="small" 
                            placeholder="Ej. PVE-Cluster-01" 
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                          />
                        )}
                      />
                    </FormControl>

                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Dominio (FQDN)</FormLabel>
                      <Controller
                        name="dominio"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} size="small" placeholder="Ej. pve.midominio.com" />
                        )}
                      />
                    </FormControl>
                  </Box>

                  {/* Descripción */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Descripción</FormLabel>
                    <Controller
                      name="descripcion"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          multiline 
                          rows={2}
                          size="small" 
                          placeholder="Notas adicionales sobre este endpoint..." 
                        />
                      )}
                    />
                  </FormControl>

                  {/* FILA: IP y Puerto */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
                    <FormControl fullWidth error={!!errors.ip}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Dirección IP *</FormLabel>
                      <Controller
                        name="ip"
                        control={control}
                        rules={{ 
                          required: 'IP requerida',
                          pattern: {
                            value: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                            message: "IP inválida"
                          }
                        }}
                        render={({ field }) => (
                          <TextField {...field} size="small" placeholder="192.168.x.x" error={!!errors.ip} />
                        )}
                      />
                    </FormControl>

                    <FormControl fullWidth error={!!errors.puerto}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Puerto *</FormLabel>
                      <Controller
                        name="puerto"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field }) => (
                          <TextField {...field} size="small" type="number" placeholder="8006" error={!!errors.puerto} />
                        )}
                      />
                    </FormControl>
                  </Box>

                  {/* SSL Checkbox */}
                  <FormControlLabel
                    control={
                      <Controller
                        name="ssl"
                        control={control}
                        render={({ field }) => (
                          <Checkbox {...field} checked={field.value} />
                        )}
                      />
                    }
                    label={<Typography variant="body2">Habilitar conexión SSL (HTTPS)</Typography>}
                  />

                </Stack>
              </SectionCard>

              {/* --- CARD 2: AUTENTICACIÓN (CYAN/SECUNDARIO) --- */}
              <SectionCard 
                icon={<AuthIcon sx={{ fontSize: 20 }} />} 
                title="Autenticación API"
                bgcolor={theme.palette.secondary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Usuario */}
                  <FormControl fullWidth error={!!errors.usuario}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Usuario API *</FormLabel>
                    <Controller
                      name="usuario"
                      control={control}
                      rules={{ required: 'Usuario requerido' }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="Ej. root@pam" 
                          error={!!errors.usuario}
                          helperText={errors.usuario?.message}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Token ID */}
                  <FormControl fullWidth error={!!errors.token_id}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Token ID *</FormLabel>
                    <Controller
                      name="token_id"
                      control={control}
                      rules={{ required: 'Token ID requerido' }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="Ej. mytoken" 
                          error={!!errors.token_id}
                          helperText={errors.token_id?.message}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Token Secret */}
                  <FormControl fullWidth error={!!errors.token_secret}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Token Secret *</FormLabel>
                    <Controller
                      name="token_secret"
                      control={control}
                      rules={{ required: 'Token Secret requerido' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          type={showSecret ? 'text' : 'password'}
                          placeholder="••••••••-••••-••••-••••-••••••••••••"
                          error={!!errors.token_secret}
                          helperText={errors.token_secret?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle secret visibility"
                                  onClick={() => setShowSecret(!showSecret)}
                                  edge="end"
                                  size="small"
                                >
                                  {showSecret ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </FormControl>

                </Stack>
              </SectionCard>

            </Box>

            {/* BOTONES (Pill Shape + Colores Estandarizados) */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined" 
                startIcon={<CancelIcon />}
                onClick={() => navigate(routes.proxmoxEndpoints())}
                sx={{ 
                  minWidth: 140, 
                  borderRadius: 50, // Pill Shape
                  textTransform: 'none', 
                  // COLOR VIOLETA
                  borderColor: '#7B1FA2', 
                  color: '#7B1FA2',
                  '&:hover': {
                    borderColor: '#4A148C',
                    color: '#4A148C',
                    bgcolor: 'rgba(123, 31, 162, 0.04)'
                  }
                }}
              >
                Cancelar
              </Button>

              <LoadingButton
                type="submit"
                variant="contained"
                loading={props.loading}
                startIcon={<SaveIcon />}
                sx={{ 
                  // GRADIENTE
                  background: 'linear-gradient(135deg, #1565C0 0%, #7B1FA2 100%)', 
                  boxShadow: 4, 
                  px: 4, 
                  minWidth: 160, 
                  borderRadius: 50, // Pill Shape
                  textTransform: 'none', 
                  fontWeight: 700 
                }}
              >
                {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Guardar Endpoint')}
              </LoadingButton>
            </Box>

          </form>
        </Box>
      </Card>
    </Box>
  )
}

export default ProxmoxEndpointForm