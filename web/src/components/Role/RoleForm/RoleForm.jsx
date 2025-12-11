import React, { useMemo } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
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
  Autocomplete,
  Stack,
  Avatar,
  Button,
  useTheme,
  Paper,
  CircularProgress
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  ErrorOutline as ErrorIcon,
  Badge as RoleIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. QUERIES
 * --------------------------------------------- */
const GET_PARAMETROS = gql`
  query GetParametrosRoles {
    parametros {
      id
      codigo
      nombre
      grupo
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
const RoleForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.role?.id)

  // Carga de datos
  const { data: parametrosData, loading: parametrosLoading } = useQuery(GET_PARAMETROS, {
    skip: Boolean(props.parametros)
  })

  const allParametros = props.parametros || parametrosData?.parametros || []

  // Opciones de Tipo de Rol
  const tipoRolOptions = useMemo(() => {
    if (!allParametros) return []
    return allParametros
      .filter((p) => p.grupo === 'TIPO_ROL')
      .map((p) => ({
        value: p.codigo,
        label: p.nombre,
      }))
  }, [allParametros])

  // Configuración del Formulario
  const formMethods = useForm({
    defaultValues: {
      nombre: props.role?.nombre || '',
      cod_tipo_rol: props.role?.cod_tipo_rol || '',
      descripcion: props.role?.descripcion || '',
    },
  })

  const { control, handleSubmit, formState: { errors } } = formMethods

  const onSubmit = (data) => {
    const formData = {
      ...data,
      estado: props.role?.id ? props.role.estado : 'ACTIVO',
    }
    props.onSave(formData, props?.role?.id)
  }

  if (parametrosLoading) {
    return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
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
                {isEdit ? 'Editar Rol' : 'Nuevo Rol'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? 'Actualice la información del rol' : 'Complete la información para crear un nuevo rol'}
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

            {/* GRID LAYOUT DE 2 COLUMNAS */}
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              alignItems: 'start'
            }}>
              
              {/* --- CARD 1: IDENTIFICACIÓN (AZUL PRIMARIO) --- */}
              <SectionCard 
                icon={<RoleIcon sx={{ fontSize: 20 }} />} 
                title="Identificación del Rol"
                bgcolor={theme.palette.primary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Nombre */}
                  <FormControl fullWidth error={!!errors.nombre}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre del Rol *</FormLabel>
                    <Controller
                      name="nombre"
                      control={control}
                      rules={{ required: 'El nombre es requerido' }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="Ej. Administrador de Sistemas" 
                          error={!!errors.nombre}
                          helperText={errors.nombre?.message}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Tipo de Rol */}
                  <FormControl fullWidth error={!!errors.cod_tipo_rol}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Tipo de Rol *</FormLabel>
                    <Controller
                      name="cod_tipo_rol"
                      control={control}
                      rules={{ required: 'Seleccione un tipo' }}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          options={tipoRolOptions}
                          getOptionLabel={(option) => option.label}
                          value={tipoRolOptions.find(opt => opt.value === value) || null}
                          onChange={(_, newValue) => onChange(newValue ? newValue.value : '')}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              size="small" 
                              placeholder="Seleccionar tipo..." 
                              error={!!errors.cod_tipo_rol}
                              helperText={errors.cod_tipo_rol?.message}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    <CategoryIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                                    {params.InputProps.startAdornment}
                                  </>
                                )
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  </FormControl>

                </Stack>
              </SectionCard>

              {/* --- CARD 2: DETALLES (CYAN/SECUNDARIO) --- */}
              <SectionCard 
                icon={<DescriptionIcon sx={{ fontSize: 20 }} />} 
                title="Descripción"
                bgcolor={theme.palette.secondary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Descripción */}
                  <FormControl fullWidth error={!!errors.descripcion}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Descripción Detallada </FormLabel>
                    <Controller
                      name="descripcion"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          multiline
                          rows={4}
                          size="small" 
                          placeholder="Describa las responsabilidades y alcance de este rol..." 
                          error={!!errors.descripcion}
                          helperText={errors.descripcion?.message}
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
                onClick={() => navigate(routes.roles())} // Asumiendo ruta
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
                {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Guardar Rol')}
              </LoadingButton>
            </Box>

          </form>
        </Box>
      </Card>
    </Box>
  )
}

export default RoleForm