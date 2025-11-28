import { useEffect, useMemo } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { useForm, Controller } from 'react-hook-form'
import { Form, FormError } from '@redwoodjs/forms'
import { navigate, routes } from '@redwoodjs/router'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  FormControl,
  FormLabel,
  Autocomplete,
  Typography,
  CircularProgress,
  Stack,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountTree as HierarchyIcon, // Para Jerarquía
  Badge as IdIcon, // Para Identificación
  Description as DetailsIcon, // Para Detalles
  AddCircle as AddIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. QUERIES
 * --------------------------------------------- */
const OBTENER_DATA_FORM = gql`
  query ObtenerDataForm {
    sistemas {
      id
      nombre
      estado
    }
    entidads {
      id
      nombre
      estado
    }
  }
`

/* ---------------------------------------------
 * 2. COMPONENTE HELPER: SectionCard
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
 * 3. COMPONENTE PRINCIPAL
 * --------------------------------------------- */
const SistemaForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.sistema?.id)

  // Carga de datos auxiliares (Sistemas padres y Entidades)
  const { data, loading: loadingData } = useQuery(OBTENER_DATA_FORM)

  // Preparar opciones filtradas
  const sistemasOptions = useMemo(() => 
    data?.sistemas?.filter((s) => s.estado === 'ACTIVO') || [], 
  [data])

  const entidadesOptions = useMemo(() => 
    data?.entidads?.filter((e) => e.estado === 'ACTIVO') || [], 
  [data])

  // Configuración del Formulario
  const formMethods = useForm({
    defaultValues: {
      id_padre: props.sistema?.id_padre || null,
      id_entidad: props.sistema?.id_entidad || null,
      codigo: props.sistema?.codigo || '',
      sigla: props.sistema?.sigla || '',
      nombre: props.sistema?.nombre || '',
      ra_creacion: props.sistema?.ra_creacion || '',
      descripcion: props.sistema?.descripcion || '',
    },
  })

  const { control, handleSubmit, formState: { errors } } = formMethods

  // Manejador de envío
  const onSubmit = (data) => {
    const formData = {
      ...data,
      estado: 'ACTIVO',
      usuario_modificacion: 2, // Ajustar según lógica de auth real
      usuario_creacion: props.sistema ? undefined : 3,
    }

    if (props?.sistema?.id) {
      props.onSave(formData, props.sistema.id)
    } else {
      props.onSave(formData)
    }
  }

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <CircularProgress />
      </Box>
    )
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
                {isEdit ? 'Editar Sistema' : 'Nuevo Sistema'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? 'Modificar datos del sistema' : 'Registrar nuevo sistema en el catálogo'}
              </Typography>
            </Box>
        </Box>

        {/* CONTENIDO */}
        <Box sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          
          {/* Wrapper para manejo de errores de Redwood */}
          <Form onSubmit={handleSubmit(onSubmit)} error={props.error}>
             {props.error && (
                <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                  <ErrorIcon color="error" />
                  <Typography variant="body2" fontWeight={600}>{props.error.message}</Typography>
                </Paper>
              )}
            
            {/* GRID LAYOUT DE 3 COLUMNAS */}
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              alignItems: 'start'
            }}>
              
              {/* --- CARD 1: JERARQUÍA Y ENTIDAD --- */}
              <SectionCard 
                icon={<HierarchyIcon sx={{ fontSize: 20 }} />} 
                title="Jerarquía y Pertenencia"
                bgcolor={theme.palette.primary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Sistema Padre */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Sistema Padre (Opcional)</FormLabel>
                    <Controller
                      name="id_padre"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          options={sistemasOptions}
                          getOptionLabel={(option) => option.nombre}
                          value={sistemasOptions.find((s) => s.id === value) || null}
                          onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                          renderInput={(params) => (
                            <TextField {...params} size="small" placeholder="Buscar sistema padre..." />
                          )}
                          noOptionsText="Sin resultados"
                        />
                      )}
                    />
                  </FormControl>

                  {/* Entidad */}
                  <FormControl fullWidth error={!!errors.id_entidad}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Entidad *</FormLabel>
                    <Controller
                      name="id_entidad"
                      control={control}
                      rules={{ required: 'La entidad es requerida' }}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          options={entidadesOptions}
                          getOptionLabel={(option) => option.nombre}
                          value={entidadesOptions.find((e) => e.id === value) || null}
                          onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              size="small" 
                              placeholder="Seleccionar entidad..." 
                              error={!!errors.id_entidad}
                              helperText={errors.id_entidad?.message}
                            />
                          )}
                          noOptionsText="Sin entidades"
                        />
                      )}
                    />
                  </FormControl>

                </Stack>
              </SectionCard>

              {/* --- CARD 2: IDENTIFICACIÓN --- */}
              <SectionCard 
                icon={<IdIcon sx={{ fontSize: 20 }} />} 
                title="Identificación del Sistema"
                bgcolor={theme.palette.secondary.main}
              >
                <Stack spacing={2.5}>
                  
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
                          placeholder="Ej. Sistema de Gestión Documental" 
                          error={!!errors.nombre}
                          helperText={errors.nombre?.message}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Código y Sigla (Fila compartida) */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <FormControl fullWidth error={!!errors.codigo}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Código *</FormLabel>
                      <Controller
                        name="codigo"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field }) => (
                          <TextField {...field} size="small" placeholder="Ej. SIS-001" error={!!errors.codigo} />
                        )}
                      />
                    </FormControl>

                    <FormControl fullWidth error={!!errors.sigla}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Sigla *</FormLabel>
                      <Controller
                        name="sigla"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field }) => (
                          <TextField {...field} size="small" placeholder="Ej. SGD" error={!!errors.sigla} />
                        )}
                      />
                    </FormControl>
                  </Box>

                </Stack>
              </SectionCard>

              {/* --- CARD 3: DETALLES Y AUDITORÍA --- */}
              <SectionCard 
                icon={<DetailsIcon sx={{ fontSize: 20 }} />} 
                title="Detalles y Auditoría"
                bgcolor="#2e7d32" // Verde
              >
                <Stack spacing={2.5}>
                  
                  {/* RA Creación */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>RA Creación</FormLabel>
                    <Controller
                      name="ra_creacion"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} size="small" fullWidth placeholder="Resolución Administrativa..." />
                      )}
                    />
                  </FormControl>

                  {/* Descripción */}
                  <FormControl fullWidth error={!!errors.descripcion}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Descripción *</FormLabel>
                    <Controller
                      name="descripcion"
                      control={control}
                      rules={{ required: 'La descripción es requerida' }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          multiline
                          rows={3}
                          size="small" 
                          fullWidth 
                          placeholder="Breve descripción del propósito del sistema..." 
                          error={!!errors.descripcion}
                          helperText={errors.descripcion?.message}
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
                onClick={() => navigate(routes.sistemas())} // Asumiendo ruta
                sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(0, 0, 0, 0.23)' }}
              >
                Cancelar
              </Button>
              <LoadingButton
                type="submit" variant="contained" loading={props.loading} startIcon={<SaveIcon />}
                sx={{ 
                  background: 'linear-gradient(135deg, #1565C0 0%, #7B1FA2 100%)', boxShadow: 4, px: 4, minWidth: 160, borderRadius: 2, textTransform: 'none', fontWeight: 700
                }}
              >
                {props.loading ? 'Guardando...' : 'Guardar Sistema'}
              </LoadingButton>
            </Box>

          </Form>
        </Box>
      </Card>
    </Box>
  )
}

export default SistemaForm