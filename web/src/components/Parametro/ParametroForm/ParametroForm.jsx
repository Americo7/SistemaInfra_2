import React, { useState, useMemo } from 'react'
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
  ErrorOutline,
  Settings as ParamIcon,
  Category as GroupIcon,
  Code as CodeIcon,
  Description as DescIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. QUERIES
 * --------------------------------------------- */
const PARAMETROS_QUERY = gql`
  query ParametrosGrupos {
    parametros {
      grupo
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
const ParametroForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.parametro?.id)

  // Carga de grupos existentes
  const { data, loading: loadingData } = useQuery(PARAMETROS_QUERY)

  // Extraer y ordenar grupos únicos
  const gruposExistentes = useMemo(() => {
    if (!data?.parametros) return []
    return [...new Set(data.parametros.map(p => p.grupo))]
      .filter(Boolean)
      .sort()
  }, [data])

  // Configuración del Formulario
  const formMethods = useForm({
    defaultValues: {
      codigo: props.parametro?.codigo || '',
      nombre: props.parametro?.nombre || '',
      grupo: props.parametro?.grupo || '',
      descripcion: props.parametro?.descripcion || '',
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
    props.onSave(formData, props?.parametro?.id)
  }

  /* -----------------------------------------------------------------------
   * FUNCIÓN PARA EXTRAER EL ERROR REAL DE GRAPHQL/PRISMA
   * ----------------------------------------------------------------------- */
  const getErrorMessage = (error) => {
    if (!error) return null

    // 1. Buscamos errores dentro de graphQLErrors (donde Prisma esconde los detalles)
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      for (let graphQLError of error.graphQLErrors) {
        // Verificar mensaje directo o mensaje original de la base de datos
        const message = graphQLError.message || ''
        // A veces el error viene anidado en extensions.originalError.message
        const originalMessage = graphQLError.extensions?.originalError?.message || '' 

        if (message.includes('Unique constraint') || originalMessage.includes('Unique constraint')) {
          return 'El CÓDIGO ingresado ya existe. Por favor, utilice un código único.'
        }
      }
    }

    // 2. Si no es constraint, devolvemos el mensaje genérico pero quitando el prefijo "GraphQLError: " si existe
    return error.message?.replace('GraphQLError: ', '') || 'Ocurrió un error inesperado.'
  }

  const errorMessage = getErrorMessage(props.error)

  if (loadingData) {
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
                {isEdit ? 'Editar Parámetro' : 'Nuevo Parámetro'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? 'Modificar configuración del sistema' : 'Registrar nueva variable de configuración'}
              </Typography>
            </Box>
        </Box>

        {/* CONTENIDO */}
        <Box sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* --- BLOQUE DE ERROR MEJORADO --- */}
            {errorMessage && (
              <Paper variant="outlined" sx={{ 
                p: 2, 
                mb: 4, 
                bgcolor: '#fff4f4', 
                borderColor: '#ffcdd2', 
                color: '#c62828', 
                display: 'flex', 
                gap: 1.5, 
                alignItems: 'center', 
                borderRadius: 2 
              }}>
                <ErrorOutline color="error" />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>No se pudo guardar</Typography>
                  <Typography variant="body2">{errorMessage}</Typography>
                </Box>
              </Paper>
            )}

            {/* GRID LAYOUT DE 2 COLUMNAS */}
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'start'
            }}>
              
              {/* --- CARD 1: IDENTIFICACIÓN Y GRUPO --- */}
              <SectionCard 
                icon={<ParamIcon sx={{ fontSize: 20 }} />} 
                title="Identificación y Clasificación"
                bgcolor={theme.palette.primary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Código */}
                  <FormControl fullWidth error={!!errors.codigo}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Código Único *</FormLabel>
                    <Controller
                      name="codigo"
                      control={control}
                      rules={{ 
                        required: 'El código es obligatorio',
                        pattern: {
                          value: /^[A-Z0-9_]{1,50}$/,
                          message: 'Solo mayúsculas, números y guiones bajos'
                        }
                      }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="Ej. TIPO_DOCUMENTO_CI" 
                          error={!!errors.codigo}
                          helperText={errors.codigo?.message || 'Identificador único en mayúsculas'}
                          InputProps={{ startAdornment: <CodeIcon fontSize="small" color="action" sx={{ mr: 1 }} /> }}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Grupo (Autocomplete con FreeSolo para crear nuevos) */}
                  <FormControl fullWidth error={!!errors.grupo}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Grupo *</FormLabel>
                    <Controller
                      name="grupo"
                      control={control}
                      rules={{ required: 'El grupo es obligatorio' }}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          freeSolo
                          options={gruposExistentes}
                          value={value}
                          onChange={(event, newValue) => {
                            onChange(newValue)
                          }}
                          onInputChange={(event, newInputValue) => {
                            onChange(newInputValue)
                          }}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              size="small" 
                              placeholder="Seleccionar o escribir nuevo grupo..." 
                              error={!!errors.grupo}
                              helperText={errors.grupo?.message || 'Agrupa parámetros relacionados'}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: <GroupIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  </FormControl>

                </Stack>
              </SectionCard>

              {/* --- CARD 2: DETALLES --- */}
              <SectionCard 
                icon={<DescIcon sx={{ fontSize: 20 }} />} 
                title="Detalles del Parámetro"
                bgcolor={theme.palette.secondary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Nombre */}
                  <FormControl fullWidth error={!!errors.nombre}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre Visible *</FormLabel>
                    <Controller
                      name="nombre"
                      control={control}
                      rules={{ required: 'El nombre es obligatorio' }}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          size="small" 
                          placeholder="Ej. Cédula de Identidad" 
                          error={!!errors.nombre}
                          helperText={errors.nombre?.message}
                        />
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
                          rows={4}
                          size="small" 
                          placeholder="Descripción del propósito de este parámetro..." 
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
                onClick={() => navigate(routes.parametros())}
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
                {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Guardar Parámetro')}
              </LoadingButton>
            </Box>

          </form>
        </Box>
      </Card>
    </Box>
  )
}

export default ParametroForm