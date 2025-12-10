import React, { useState, useEffect } from 'react'
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
  InputAdornment,
  IconButton,
  Stack,
  Avatar,
  Button,
  useTheme,
  Paper
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  ErrorOutline as ErrorOutlineIcon,
  Cloud as CloudIcon,
  Visibility,
  VisibilityOff,
  RestartAlt as ResetIcon,
  Key as TokenIcon,
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
const K8sEndpointForm = ({ k8SEndpoint, onSave, loading, error }) => {
  const theme = useTheme()
  const isEdit = Boolean(k8SEndpoint?.id)
  const [showToken, setShowToken] = useState(false)

  // Configuración del Formulario
  const formMethods = useForm({
    defaultValues: {
      nombre: k8SEndpoint?.nombre || '',
      url_api: k8SEndpoint?.url_api || '',
      descripcion: k8SEndpoint?.descripcion || '',
      estado: k8SEndpoint?.estado || 'ACTIVO',
      token_bearer: k8SEndpoint?.token_bearer || '',
    },
  })

  const { control, handleSubmit, reset, formState: { errors } } = formMethods

  useEffect(() => {
    if (k8SEndpoint) {
      reset({
        nombre: k8SEndpoint.nombre,
        url_api: k8SEndpoint.url_api,
        descripcion: k8SEndpoint.descripcion,
        estado: k8SEndpoint.estado,
        token_bearer: k8SEndpoint.token_bearer,
      })
    }
  }, [k8SEndpoint, reset])

  const onSubmit = (data) => {
    const formData = {
      ...data,
      usuario_creacion: isEdit ? undefined : 1, 
      usuario_modificacion: isEdit ? 1 : undefined,
    }
    onSave(formData, k8SEndpoint?.id)
  }

  const handleReset = () => {
    reset({
      nombre: '',
      url_api: '',
      descripcion: '',
      estado: 'ACTIVO',
      token_bearer: '',
    })
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1500, mx: 'auto' }}>
      
      <Card 
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderTop: 'none',
          borderRadius: 2,
          borderTopLeftRadius: '0 !important',
          borderTopRightRadius: '0 !important',
          mb: 3,
          bgcolor: theme.palette.background.paper,
        }}
      >
        
        {/* HEADER */}
        <Box sx={{ 
            px: 5, py: 4, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff',
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
          }}>
            <Avatar sx={{
                  width: 38, height: 38,
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
                {isEdit ? 'Editar Endpoint K8s' : 'Nuevo Endpoint K8s'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure la conexión al clúster Kubernetes
              </Typography>
            </Box>
        </Box>

        {/* CONTENIDO */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          
          {/* Mensaje de Error */}
          {error && (
            <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
              <ErrorOutlineIcon color="error" />
              <Typography variant="body2" fontWeight={600}>{error.message}</Typography>
            </Paper>
          )}

          <Stack spacing={3}>
            
            {/* --- CARD 1: INFORMACIÓN DEL CLUSTER --- */}
            <SectionCard 
              icon={<CloudIcon sx={{ fontSize: 20 }} />} 
              title="Información del Cluster"
              bgcolor={theme.palette.primary.main}
            >
               {/* GRID: 3 COLUMNAS EN UNA FILA */}
               <Box sx={{ 
                 display: 'grid', 
                 gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                 gap: 2 
               }}>
                    
                    {/* 1. Nombre */}
                    <FormControl fullWidth error={!!errors.nombre}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre del Cluster *</FormLabel>
                      <Controller
                        name="nombre"
                        control={control}
                        rules={{ required: 'El nombre es obligatorio' }}
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            size="small" 
                            placeholder="Ej. K8s-Prod-01" 
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                          />
                        )}
                      />
                    </FormControl>

                    {/* 2. URL API */}
                    <FormControl fullWidth error={!!errors.url_api}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>URL API Kubernetes *</FormLabel>
                      <Controller
                        name="url_api"
                        control={control}
                        rules={{ 
                          required: 'La URL es obligatoria',
                          pattern: { value: /^https?:\/\/.+/i, message: 'Debe comenzar con http:// o https://' }
                        }}
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            size="small" 
                            placeholder="https://192.168.1.100:6443" 
                            error={!!errors.url_api}
                            helperText={errors.url_api?.message}
                          />
                        )}
                      />
                    </FormControl>

                    {/* 3. Descripción */}
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Descripción</FormLabel>
                      <Controller
                        name="descripcion"
                        control={control}
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            size="small" 
                            placeholder="Detalles adicionales..." 
                          />
                        )}
                      />
                    </FormControl>

                  </Box>
              </SectionCard>

              {/* --- CARD 2: TOKEN --- */}
              <SectionCard 
                icon={<TokenIcon sx={{ fontSize: 20 }} />} 
                title="Autenticación (Service Account Token)"
                bgcolor="#2e7d32"
              >
                <FormControl fullWidth error={!!errors.token_bearer}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Token Bearer *</FormLabel>
                  <Controller
                    name="token_bearer"
                    control={control}
                    rules={{ required: 'El token es obligatorio' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={5}
                        placeholder="Pegue aquí el token completo del Service Account..."
                        type={showToken ? 'text' : 'password'}
                        error={!!errors.token_bearer}
                        helperText={errors.token_bearer?.message}
                        InputProps={{
                          sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
                          endAdornment: (
                            <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                              <IconButton onClick={() => setShowToken(!showToken)} edge="end">
                                {showToken ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </FormControl>
              </SectionCard>

            </Stack>

            {/* BOTONES */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined" color="inherit" startIcon={<CancelIcon />}
                onClick={() => navigate(routes.k8SEndpoints())}
                sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(0, 0, 0, 0.23)' }}
              >
                Cancelar
              </Button>

              <Button
                variant="outlined" color="warning" startIcon={<ResetIcon />}
                onClick={handleReset}
                sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none' }}
              >
                Reset
              </Button>

              <LoadingButton
                type="submit"
                variant="contained"
                loading={loading}
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
                {isEdit ? 'Guardar Cambios' : 'Guardar Endpoint'}
              </LoadingButton>
            </Box>

        </Box>
      </Card>
    </Box>
  )
}

export default K8sEndpointForm