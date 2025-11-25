import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { navigate, routes } from '@redwoodjs/router'

import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
  IconButton,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

import {
  Cloud as CloudIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Visibility,
  VisibilityOff,
  Cancel as CancelIcon,
  Save as SaveIcon,
} from '@mui/icons-material'

const K8sEndpointForm = ({ k8SEndpoint, onSave, loading, error }) => {
  const isEdit = Boolean(k8SEndpoint?.id)
  const [showToken, setShowToken] = useState(false)

  // Configuración del formulario con React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: k8SEndpoint?.nombre || '',
      url_api: k8SEndpoint?.url_api || '',
      token_bearer: k8SEndpoint?.token_bearer || '',
      descripcion: k8SEndpoint?.descripcion || '',
      estado: k8SEndpoint?.estado || 'ACTIVO',
    },
  })

  const onSubmit = (data) => {
    // Preparar payload
    const payload = {
      ...data,
      // TODO: Usar contexto de autenticación real
      usuario_creacion: isEdit ? undefined : 1,
      usuario_modificacion: isEdit ? 1 : undefined,
    }

    // Enviar al componente padre
    onSave(payload, k8SEndpoint?.id)
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ maxWidth: 900, mx: 'auto' }}>

      {/* Mensaje de error general del servidor */}
      {error && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            borderColor: 'error.main',
            bgcolor: '#FFF5F5',
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="body2" fontWeight="bold">Error:</Typography>
          <Typography variant="body2">{error.message}</Typography>
        </Paper>
      )}

      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardHeader
          avatar={<CloudIcon color="primary" fontSize="large" />}
          title={
            <Typography variant="h6" fontWeight={700}>
              {isEdit ? 'Editar Endpoint Kubernetes' : 'Nuevo Endpoint Kubernetes'}
            </Typography>
          }
          subheader="Configure la conexión al clúster K8s"
          sx={{ bgcolor: 'grey.50', borderBottom: '1px solid #e0e0e0' }}
        />

        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>

            {/* SECCIÓN 1: IDENTIFICACIÓN */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                DATOS DE CONEXIÓN
              </Typography>
            </Grid>

            {/* NOMBRE */}
            <Grid item xs={12} md={6}>
              <Controller
                name="nombre"
                control={control}
                rules={{ required: 'El nombre es obligatorio' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre del Endpoint *"
                    placeholder="Ej: Cluster Producción"
                    fullWidth
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                  />
                )}
              />
            </Grid>

            {/* URL API */}
            <Grid item xs={12} md={6}>
              <Controller
                name="url_api"
                control={control}
                rules={{
                  required: 'La URL es obligatoria',
                  pattern: {
                    value: /^https?:\/\/.+/i,
                    message: 'Debe ser una URL válida (http/https)',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="URL API *"
                    placeholder="https://192.168.1.10:6443"
                    fullWidth
                    error={!!errors.url_api}
                    helperText={errors.url_api?.message}
                  />
                )}
              />
            </Grid>

            {/* TOKEN BEARER */}
            <Grid item xs={12}>
              <Controller
                name="token_bearer"
                control={control}
                rules={{ required: 'El Token Bearer es obligatorio' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Token Bearer (Service Account) *"
                    fullWidth
                    type={showToken ? 'text' : 'password'}
                    multiline={showToken} // Si se muestra, permitir ver múltiples líneas
                    rows={showToken ? 4 : 1}
                    error={!!errors.token_bearer}
                    helperText={errors.token_bearer?.message || "Token de autenticación para la API de K8s"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowToken(!showToken)}
                            edge="end"
                          >
                            {showToken ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* SECCIÓN 2: METADATOS */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                DETALLES Y ESTADO
              </Typography>
            </Grid>

            {/* DESCRIPCIÓN */}
            <Grid item xs={12} md={8}>
              <Controller
                name="descripcion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descripción"
                    placeholder="Detalles adicionales sobre este clúster..."
                    multiline
                    rows={2}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* ESTADO */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <FormLabel sx={{ mb: 0.5, fontSize: '0.875rem' }}>Estado</FormLabel>
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} fullWidth size="medium">
                      <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                      <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

          </Grid>
        </CardContent>

        {/* ACTIONS */}
        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: 'grey.50' }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CancelIcon />}
            onClick={() => navigate(routes.k8SEndpoints())}
          >
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            loading={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </LoadingButton>
        </Box>
      </Card>
    </Box>
  )
}

export default K8sEndpointForm