import { useEffect, useMemo } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { useForm, Controller } from 'react-hook-form'
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
  useTheme,
  FormHelperText
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountTree as HierarchyIcon,
  Badge as IdIcon,
  Description as DetailsIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
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
 * 2. COMPONENTE HELPER: SectionCard (Estandarizado)
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
 * 3. COMPONENTE PRINCIPAL
 * --------------------------------------------- */
const SistemaForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.sistema?.id)

  // Carga de datos auxiliares
  const { data, loading: loadingData } = useQuery(OBTENER_DATA_FORM, {
    skip: Boolean(props.sistemas && props.entidads)
  })

  const sistemas = props.sistemas || data?.sistemas || []
  const entidads = props.entidads || data?.entidads || []

  // Preparar opciones filtradas
  const sistemasOptions = useMemo(() => 
    sistemas?.filter((s) => s.estado === 'ACTIVO') || [], 
  [sistemas])

  const entidadesOptions = useMemo(() => 
    entidads?.filter((e) => e.estado === 'ACTIVO') || [], 
  [entidads])

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
    <Box sx={{ width: '100%', maxWidth: 1500, mx: 'auto' }}>
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
          <Avatar
            sx={{
              width: 48, height: 48, // Estandarizado a 48px
              background: 'linear-gradient(135deg, #1565C0, #7B1FA2)',
              color: 'white', boxShadow: 3
            }}
          >
            {isEdit ? <EditIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ 
              lineHeight: 1.2, mb: 0.5,
              // GRADIENTE EN TEXTO
              background: 'linear-gradient(90deg, #1565C0 0%, #7B1FA2 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {isEdit ? 'Editar Sistema' : 'Crear Sistema'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Modificar información del sistema' : 'Registrar nuevo sistema en el catálogo'}
            </Typography>
          </Box>
        </Box>

        {/* CONTENIDO PRINCIPAL */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ px: 5, pb: 5, pt: 0 }}>

          {props.error && (
            <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#fff4f4', borderColor: 'error.main', color: 'error.main', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
              <ErrorIcon color="error" />
              <Typography variant="body2" fontWeight={600}>{String(props.error)}</Typography>
            </Paper>
          )}

          {/* GRID DE 3 COLUMNAS */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 3,
            alignItems: 'start'
          }}>

            {/* --- CARD 1: JERARQUÍA Y ENTIDAD (AZUL PRIMARIO) --- */}
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
                          />
                        )}
                        noOptionsText="Sin entidades"
                      />
                    )}
                  />
                  {errors.id_entidad && <FormHelperText>{errors.id_entidad?.message}</FormHelperText>}
                </FormControl>

              </Stack>
            </SectionCard>

            {/* --- CARD 2: IDENTIFICACIÓN (CYAN/SECUNDARIO) --- */}
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
                        placeholder="Ej. Sistema de Gestión Documental"
                        error={!!errors.nombre}
                      />
                    )}
                  />
                  {errors.nombre && <FormHelperText>{errors.nombre?.message}</FormHelperText>}
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
                    {errors.codigo && <FormHelperText>{errors.codigo?.message}</FormHelperText>}
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
                    {errors.sigla && <FormHelperText>{errors.sigla?.message}</FormHelperText>}
                  </FormControl>
                </Box>

              </Stack>
            </SectionCard>

            {/* --- CARD 3: DETALLES Y AUDITORÍA (VERDE) --- */}
            <SectionCard
              icon={<DetailsIcon sx={{ fontSize: 20 }} />}
              title="Detalles y Auditoría"
              bgcolor="#2e7d32"
            >
              <Stack spacing={2.5}>

                {/* RA Creación */}
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>RA Creación</FormLabel>
                  <Controller
                    name="ra_creacion"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} size="small" placeholder="Resolución Administrativa..." />
                    )}
                  />
                </FormControl>

                {/* Descripción */}
                <FormControl fullWidth error={!!errors.descripcion}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Descripción</FormLabel>
                  <Controller
                    name="descripcion"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={3}
                        size="small"
                        placeholder="Breve descripción del propósito del sistema..."
                        error={!!errors.descripcion}
                      />
                    )}
                  />
                  {errors.descripcion && <FormHelperText>{errors.descripcion?.message}</FormHelperText>}
                </FormControl>

              </Stack>
            </SectionCard>

          </Box>

          {/* BOTONES (Pill Shape + Colores Estandarizados) */}
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate(routes.sistemas())}
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
                boxShadow: 4, px: 4, minWidth: 160, 
                borderRadius: 50, // Pill Shape
                textTransform: 'none', fontWeight: 700
              }}
            >
              {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Registrar Sistema')}
            </LoadingButton>
          </Box>

        </Box>
      </Card>
    </Box>
  )
}

export default SistemaForm