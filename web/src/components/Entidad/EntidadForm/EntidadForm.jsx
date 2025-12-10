import React from 'react'
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
  Paper
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  ErrorOutline as ErrorIcon,
  Business as EntityIcon,
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
      <CardContent sx={{ p: 3, flexGrow: 1 }}>{children}</CardContent>
    </Card>
  )
}

/* ---------------------------------------------
 * 2. COMPONENTE PRINCIPAL
 * --------------------------------------------- */
const EntidadForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.entidad?.id)

  // Configuración del Formulario
  const formMethods = useForm({
    defaultValues: {
      codigo: props.entidad?.codigo || '',
      sigla: props.entidad?.sigla || '',
      nombre: props.entidad?.nombre || '',
    },
  })

  const { control, handleSubmit, formState: { errors } } = formMethods

  const onSubmit = (data) => {
    const formData = {
      ...data,
      estado: 'ACTIVO',
    }
    props.onSave(formData, props?.entidad?.id)
  }

  return (
    // CARD PRINCIPAL: Ocupa el ancho disponible del Layout (hasta 1500px)
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
        
        {/* HEADER DEL CARD PRINCIPAL */}
        {/* El fondo blanco (bgcolor) ocupa todo el ancho, pero el contenido interno se alinea al centro */}
        <Box sx={{ 
            px: 5, py: 4, bgcolor: '#fff',
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
          }}>
            <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                    width: 38, height: 38,
                    background: 'linear-gradient(135deg, #1565C0, #7B1FA2)', color: 'white', boxShadow: 3
                  }}>
                {isEdit ? <EditIcon /> : <AddIcon />}
              </Avatar>
              
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, color: '#000', mb: 0.5 }}>
                  {isEdit ? 'Editar Entidad' : 'Nueva Entidad'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isEdit ? 'Modificar datos de la institución' : 'Registrar nueva institución en el sistema'}
                </Typography>
              </Box>
            </Box>
        </Box>

        {/* CONTENIDO DEL CARD PRINCIPAL */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          
          {/* WRAPPER CENTRADO: Limita el ancho a 800px para alinear con el header */}
          <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>

            {/* Mensaje de Error */}
            {props.error && (
              <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                <ErrorIcon color="error" />
                <Typography variant="body2" fontWeight={600}>{props.error.message}</Typography>
              </Paper>
            )}

            {/* CARD SECUNDARIO (Información) */}
            <SectionCard 
              icon={<EntityIcon sx={{ fontSize: 20 }} />} 
              title="Información de la Entidad"
              bgcolor={theme.palette.primary.main}
            >
              <Stack spacing={3}>
                
                {/* Nombre */}
                <FormControl fullWidth error={!!errors.nombre}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre Completo *</FormLabel>
                  <Controller
                    name="nombre"
                    control={control}
                    rules={{ required: 'El nombre es requerido' }}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        size="small" 
                        fullWidth 
                        placeholder="Ej. Agencia de Gobierno Electrónico y Tecnologías de Información y Comunicación" 
                        error={!!errors.nombre}
                        helperText={errors.nombre?.message}
                        multiline
                        rows={2}
                      />
                    )}
                  />
                </FormControl>

                {/* Código */}
                <FormControl fullWidth error={!!errors.codigo}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Código Institucional *</FormLabel>
                  <Controller
                    name="codigo"
                    control={control}
                    rules={{ required: 'El código es requerido' }}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        size="small" 
                        placeholder="Ej. ENT-001" 
                        error={!!errors.codigo}
                        helperText={errors.codigo?.message}
                      />
                    )}
                  />
                </FormControl>

                {/* Sigla */}
                <FormControl fullWidth error={!!errors.sigla}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Sigla *</FormLabel>
                  <Controller
                    name="sigla"
                    control={control}
                    rules={{ required: 'La sigla es requerida' }}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        size="small" 
                        placeholder="Ej. AGETIC" 
                        error={!!errors.sigla} 
                        helperText={errors.sigla?.message}
                      />
                    )}
                  />
                </FormControl>

              </Stack>
            </SectionCard>

            {/* BOTONES */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined" color="inherit" startIcon={<CancelIcon />}
                onClick={() => navigate(routes.entidades())}
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
                {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Guardar Entidad')}
              </LoadingButton>
            </Box>

          </Box> {/* Fin Wrapper Centrado */}

        </Box>
      </Card>
    </Box>
  )
}

export default EntidadForm