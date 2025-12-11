import React, { useState, useEffect, useMemo } from 'react'
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
  CircularProgress,
  Alert
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  AddCircle as AddIcon,
  ErrorOutline as ErrorOutlineIcon,
  Event as EventIcon,
  Info as InfoIcon,
  Description as DescIcon,
  People as PeopleIcon,
  Assignment as CiteIcon,
  Person as PersonIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. QUERIES
 * --------------------------------------------- */
const GET_DATA_FORM = gql`
  query GetDataEvento {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
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
const EventoForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.evento?.id)
  
  const [codigoGenerado, setCodigoGenerado] = useState(props.evento?.cod_evento || '')

  const { data, loading: loadingData } = useQuery(GET_DATA_FORM, {
    skip: Boolean(props.usuarios && props.parametros)
  })

  const usuarios = props.usuarios || data?.usuarios || []
  const allParametros = props.parametros || data?.parametros || []

  // Preparación de Opciones
  const usuariosOptions = useMemo(() => {
    if (!usuarios) return []
    return usuarios.map(u => ({
      id: u.id,
      label: `${u.nombres} ${u.primer_apellido} ${u.segundo_apellido || ''}`.trim()
    })).sort((a, b) => a.label.localeCompare(b.label))
  }, [usuarios])

  const tipoEventoOptions = useMemo(() => 
    allParametros?.filter(p => p.grupo === 'TIPO_EVENTO') || [], 
  [allParametros])

  const estadoEventoOptions = useMemo(() => 
    allParametros?.filter(p => p.grupo === 'E_EVENTO_DESPLIEGUE') || [], 
  [allParametros])

  // Configuración del Formulario
  const formMethods = useForm({
    defaultValues: {
      cod_tipo_evento: props.evento?.cod_tipo_evento || null,
      estado_evento: props.evento?.estado_evento || null,
      fecha_evento: props.evento?.fecha_evento ? dayjs(props.evento.fecha_evento) : null,
      descripcion: props.evento?.descripcion || '',
      cite: props.evento?.cite || '',
      solicitante: props.evento?.solicitante || '',
      responsables: props.evento?.responsables || [], // Array de IDs
    },
  })

  const { control, handleSubmit, watch, formState: { errors } } = formMethods
  const watchedTipoEvento = watch('cod_tipo_evento')

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      fecha_evento: formData.fecha_evento ? formData.fecha_evento.toISOString() : null,
      estado: 'ACTIVO',
    }

    try {
      const resultado = await props.onSave(payload, props?.evento?.id)
      
      if (!isEdit && resultado?.cod_evento) {
        setCodigoGenerado(resultado.cod_evento)
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (loadingData) {
    return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                    width: 48, height: 48, // Ajustado a 48px
                    background: 'linear-gradient(135deg, #1565C0, #7B1FA2)', color: 'white', boxShadow: 3
                  }}>
                {isEdit ? <EditIcon /> : <AddIcon />}
              </Avatar>
              
              <Box>
                <Typography 
                  variant="h5" 
                  fontWeight={800} 
                  sx={{
                    lineHeight: 1.2,
                    // GRADIENTE EN TEXTO
                    background: 'linear-gradient(90deg, #1565C0 0%, #7B1FA2 100%)',
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}>
                  {isEdit ? 'Editar Evento' : 'Nuevo Evento'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isEdit ? 'Actualizar detalles del evento' : 'Registrar nuevo evento en el sistema'}
                </Typography>
              </Box>
          </Box>

          {/* CONTENIDO */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ px: 5, pb: 5, pt: 0 }}>
            
            {props.error && (
              <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#fff4f4', borderColor: 'error.main', color: 'error.main', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                <ErrorOutlineIcon color="error" />
                <Typography variant="body2" fontWeight={600}>{props.error.message}</Typography>
              </Paper>
            )}

            {/* ALERTA CÓDIGO GENERADO */}
            {codigoGenerado && (
              <Alert severity="success" sx={{ mb: 4 }}>
                <Typography variant="subtitle2">
                  Código del Evento: <strong>{codigoGenerado}</strong>
                </Typography>
              </Alert>
            )}

            {/* GRID DE 3 COLUMNAS */}
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'start'
            }}>
                
                {/* --- CARD 1: IDENTIFICACIÓN (AZUL PRIMARIO) --- */}
                <SectionCard 
                  icon={<EventIcon sx={{ fontSize: 20 }} />} 
                  title="Identificación del Evento"
                  bgcolor={theme.palette.primary.main}
                >
                  <Stack spacing={2.5}>
                    
                    {/* Tipo de Evento */}
                    <FormControl fullWidth error={!!errors.cod_tipo_evento}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Tipo de Evento *</FormLabel>
                      <Controller
                        name="cod_tipo_evento"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field: { onChange, value } }) => (
                          <Autocomplete
                            options={tipoEventoOptions}
                            getOptionLabel={(option) => option.nombre}
                            value={tipoEventoOptions.find(t => t.codigo === value) || null}
                            onChange={(_, newValue) => onChange(newValue ? newValue.codigo : null)}
                            renderInput={(params) => (
                              <TextField {...params} size="small" placeholder="Seleccionar tipo..." error={!!errors.cod_tipo_evento} />
                            )}
                            disabled={isEdit} 
                          />
                        )}
                      />
                    </FormControl>

                    {/* Estado del Evento */}
                    <FormControl fullWidth error={!!errors.estado_evento}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Estado *</FormLabel>
                      <Controller
                        name="estado_evento"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field: { onChange, value } }) => (
                          <Autocomplete
                            options={estadoEventoOptions}
                            getOptionLabel={(option) => option.nombre}
                            value={estadoEventoOptions.find(e => e.codigo === value) || null}
                            onChange={(_, newValue) => onChange(newValue ? newValue.codigo : null)}
                            renderInput={(params) => (
                              <TextField {...params} size="small" placeholder="Seleccionar estado..." error={!!errors.estado_evento} />
                            )}
                          />
                        )}
                      />
                    </FormControl>

                    {/* Info Código */}
                    {!isEdit && watchedTipoEvento && (
                      <Alert severity="info" icon={<InfoIcon fontSize="inherit" />}>
                        Se generará código: <strong>{watchedTipoEvento}-XXX</strong>
                      </Alert>
                    )}

                  </Stack>
                </SectionCard>

                {/* --- CARD 2: DETALLES (CYAN/SECUNDARIO) --- */}
                <SectionCard 
                  icon={<DescIcon sx={{ fontSize: 20 }} />} 
                  title="Detalles del Evento"
                  bgcolor={theme.palette.secondary.main}
                >
                  <Stack spacing={2.5}>
                    
                    {/* Fecha */}
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Fecha y Hora *</FormLabel>
                      <Controller
                        name="fecha_evento"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field }) => (
                          <DateTimePicker 
                            {...field}
                            slotProps={{ textField: { size: 'small', error: !!errors.fecha_evento } }}
                          />
                        )}
                      />
                    </FormControl>

                    {/* Cite */}
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>CITE / Referencia</FormLabel>
                      <Controller
                        name="cite"
                        control={control}
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            size="small" 
                            placeholder="Ej. AGETIC/CITE/2023-001" 
                            InputProps={{ startAdornment: <CiteIcon fontSize="small" color="action" sx={{ mr: 1 }} /> }}
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
                            rows={3} 
                            size="small" 
                            placeholder="Detalles del evento..." 
                            error={!!errors.descripcion}
                          />
                        )}
                      />
                    </FormControl>

                  </Stack>
                </SectionCard>

                {/* --- CARD 3: INVOLUCRADOS (VERDE) --- */}
                <SectionCard 
                  icon={<PeopleIcon sx={{ fontSize: 20 }} />} 
                  title="Responsables"
                  bgcolor="#2e7d32"
                >
                  <Stack spacing={2.5}>
                    
                    {/* Solicitante */}
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Solicitante</FormLabel>
                      <Controller
                        name="solicitante"
                        control={control}
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            size="small" 
                            placeholder="Persona que solicita" 
                            InputProps={{ startAdornment: <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} /> }}
                          />
                        )}
                      />
                    </FormControl>

                    {/* Responsables (Multi Select) */}
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Responsables Asignados</FormLabel>
                      <Controller
                        name="responsables"
                        control={control}
                        render={({ field: { onChange, value } }) => {
                          const selected = usuariosOptions.filter(u => value?.includes(u.id))
                          return (
                            <Autocomplete
                              multiple
                              options={usuariosOptions}
                              getOptionLabel={(option) => option.label}
                              value={selected}
                              onChange={(_, newValue) => onChange(newValue.map(v => v.id))}
                              renderInput={(params) => (
                                <TextField 
                                  {...params} 
                                  size="small" 
                                  placeholder="Seleccionar usuarios..." 
                                />
                              )}
                              filterSelectedOptions
                            />
                          )
                        }}
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
                  onClick={() => navigate(routes.eventos())}
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
                  {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Guardar Evento')}
                </LoadingButton>
              </Box>

            </Box>
          </Card>
      </Box>
    </LocalizationProvider>
  )
}

export default EventoForm