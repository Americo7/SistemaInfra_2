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
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress,
  Paper
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
  AddCircle as AddIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  ErrorOutline as ErrorIcon,
  Computer as InfraIcon,
  CalendarToday as DateIcon,
  Description as DetailsIcon,
  RocketLaunch as DeployIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. QUERIES
 * --------------------------------------------- */
const GET_DATA_FORM = gql`
  query GetDataFormDespliegue {
    componentes {
      id
      nombre
      estado
    }
    maquinas {
      id
      nombre
      estado
    }
    servidores {
      id
      nombre
      estado
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
const DespliegueForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.despliegue?.id)

  // Carga de datos
  const { data, loading: loadingData } = useQuery(GET_DATA_FORM)

  // Filtrado de listas
  const componentesOptions = useMemo(() => 
    data?.componentes?.filter(c => c.estado === 'ACTIVO') || [], [data])
  
  const maquinasOptions = useMemo(() => 
    data?.maquinas?.filter(m => m.estado === 'ACTIVO') || [], [data])
  
  const servidoresOptions = useMemo(() => 
    data?.servidores?.filter(s => s.estado === 'ACTIVO') || [], [data])

  const parametros = data?.parametros || []
  
  const unidadesOptions = useMemo(() => 
    parametros.filter(p => p.grupo === 'UNIDAD_AGETIC'), [parametros])

  const tipoRespaldoOptions = useMemo(() => 
    parametros.filter(p => p.grupo === 'TIPO_RESPALDO'), [parametros])

  const estadoDespliegueOptions = useMemo(() => 
    parametros.filter(p => p.grupo === 'E_EVENTO_DESPLIEGUE'), [parametros])

  // Configuración del Formulario
  const formMethods = useForm({
    defaultValues: {
      id_componente: props.despliegue?.id_componente || null,
      tipo_infra: props.despliegue?.id_servidor ? 'FISICO' : 'VIRTUAL',
      id_maquina: props.despliegue?.id_maquina || null,
      id_servidor: props.despliegue?.id_servidor || null,
      
      unidad_solicitante: props.despliegue?.unidad_solicitante || '',
      solicitante: props.despliegue?.solicitante || '',
      fecha_solicitud: props.despliegue?.fecha_solicitud ? dayjs(props.despliegue.fecha_solicitud) : null,
      fecha_despliegue: props.despliegue?.fecha_despliegue ? dayjs(props.despliegue.fecha_despliegue) : null,

      estado_despliegue: props.despliegue?.estado_despliegue || '',
      cod_tipo_respaldo: props.despliegue?.cod_tipo_respaldo || '',
      referencia_respaldo: props.despliegue?.referencia_respaldo || '',
      descripcion: props.despliegue?.descripcion || '',
    },
  })

  const { control, handleSubmit, watch, setValue, formState: { errors } } = formMethods

  // Lógica para alternar VM / Servidor
  const watchedTipoInfra = watch('tipo_infra')

  useEffect(() => {
    if (watchedTipoInfra === 'VIRTUAL') {
      setValue('id_servidor', null)
    } else {
      setValue('id_maquina', null)
    }
  }, [watchedTipoInfra, setValue])

  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      fecha_despliegue: formData.fecha_despliegue ? formData.fecha_despliegue.toISOString() : null,
      fecha_solicitud: formData.fecha_solicitud ? formData.fecha_solicitud.toISOString() : null,
      estado: 'ACTIVO',
      usuario_creacion: 2,
      tipo_infra: undefined 
    }
    
    if (!isEdit) payload.usuario_creacion = 2

    props.onSave(payload, props?.despliegue?.id)
  }

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                  {isEdit ? 'Editar Despliegue' : 'Nuevo Despliegue'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isEdit ? 'Actualizar registro de pase a producción' : 'Registrar nuevo despliegue de componente'}
                </Typography>
              </Box>
          </Box>

          {/* CONTENIDO */}
          <Box sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              
              {props.error && (
                <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                  <ErrorIcon color="error" />
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

                {/* --- CARD 1: INFRAESTRUCTURA --- */}
                <SectionCard 
                  icon={<InfraIcon sx={{ fontSize: 20 }} />} 
                  title="Componente e Infraestructura"
                  bgcolor={theme.palette.primary.main}
                >
                  <Stack spacing={2.5}>
                    
                    {/* Componente */}
                    <FormControl fullWidth error={!!errors.id_componente}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Componente *</FormLabel>
                      <Controller
                        name="id_componente"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field: { onChange, value } }) => (
                          <Autocomplete
                            options={componentesOptions}
                            getOptionLabel={(option) => option.nombre}
                            value={componentesOptions.find(c => c.id === value) || null}
                            onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                            renderInput={(params) => (
                              <TextField {...params} size="small" placeholder="Buscar componente..." error={!!errors.id_componente} />
                            )}
                          />
                        )}
                      />
                    </FormControl>

                    {/* Radio: VM vs Físico */}
                    <FormControl component="fieldset">
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Destino del Despliegue</FormLabel>
                      <Controller
                        name="tipo_infra"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup {...field} row>
                            <FormControlLabel value="VIRTUAL" control={<Radio size="small" />} label="Máquina Virtual" sx={{ mr: 2 }} />
                            <FormControlLabel value="FISICO" control={<Radio size="small" />} label="Servidor Físico" />
                          </RadioGroup>
                        )}
                      />
                    </FormControl>

                    {/* Selector Condicional */}
                    <Box>
                      {watchedTipoInfra === 'VIRTUAL' ? (
                        <FormControl fullWidth error={!!errors.id_maquina}>
                          <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Máquina Virtual *</FormLabel>
                          <Controller
                            name="id_maquina"
                            control={control}
                            rules={{ required: watchedTipoInfra === 'VIRTUAL' ? 'Requerido' : false }}
                            render={({ field: { onChange, value } }) => (
                              <Autocomplete
                                options={maquinasOptions}
                                getOptionLabel={(option) => option.nombre}
                                value={maquinasOptions.find(m => m.id === value) || null}
                                onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                                renderInput={(params) => (
                                  <TextField {...params} size="small" placeholder="Seleccionar VM..." error={!!errors.id_maquina} />
                                )}
                              />
                            )}
                          />
                        </FormControl>
                      ) : (
                        <FormControl fullWidth error={!!errors.id_servidor}>
                          <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Servidor Físico *</FormLabel>
                          <Controller
                            name="id_servidor"
                            control={control}
                            rules={{ required: watchedTipoInfra === 'FISICO' ? 'Requerido' : false }}
                            render={({ field: { onChange, value } }) => (
                              <Autocomplete
                                options={servidoresOptions}
                                getOptionLabel={(option) => option.nombre}
                                value={servidoresOptions.find(s => s.id === value) || null}
                                onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                                renderInput={(params) => (
                                  <TextField {...params} size="small" placeholder="Seleccionar Servidor..." error={!!errors.id_servidor} />
                                )}
                              />
                            )}
                          />
                        </FormControl>
                      )}
                    </Box>

                  </Stack>
                </SectionCard>

                {/* --- CARD 2: SOLICITUD --- */}
                <SectionCard 
                  icon={<DateIcon sx={{ fontSize: 20 }} />} 
                  title="Datos de Solicitud"
                  bgcolor={theme.palette.secondary.main}
                >
                  <Stack spacing={2.5}>
                    
                    {/* Unidad Solicitante */}
                    <FormControl fullWidth error={!!errors.unidad_solicitante}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Unidad Solicitante *</FormLabel>
                      <Controller
                        name="unidad_solicitante"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field: { onChange, value } }) => (
                          <Autocomplete
                            options={unidadesOptions}
                            getOptionLabel={(option) => `${option.codigo} - ${option.nombre}`}
                            value={unidadesOptions.find(u => u.codigo === value) || null}
                            onChange={(_, newValue) => onChange(newValue ? newValue.codigo : '')}
                            renderInput={(params) => (
                              <TextField {...params} size="small" placeholder="Seleccionar unidad..." error={!!errors.unidad_solicitante} />
                            )}
                          />
                        )}
                      />
                    </FormControl>

                    {/* Solicitante */}
                    <FormControl fullWidth error={!!errors.solicitante}>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Persona Solicitante *</FormLabel>
                      <Controller
                        name="solicitante"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field }) => (
                          <TextField {...field} size="small" placeholder="Nombre completo" error={!!errors.solicitante} />
                        )}
                      />
                    </FormControl>

                    {/* Fechas */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <FormControl fullWidth>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Fecha Solicitud</FormLabel>
                        <Controller
                          name="fecha_solicitud"
                          control={control}
                          render={({ field }) => (
                            <DateTimePicker 
                              {...field}
                              slotProps={{ textField: { size: 'small' } }} 
                            />
                          )}
                        />
                      </FormControl>

                      <FormControl fullWidth>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Fecha Despliegue</FormLabel>
                        <Controller
                          name="fecha_despliegue"
                          control={control}
                          render={({ field }) => (
                            <DateTimePicker 
                              {...field} 
                              slotProps={{ textField: { size: 'small' } }} 
                            />
                          )}
                        />
                      </FormControl>
                    </Box>

                  </Stack>
                </SectionCard>

                {/* --- CARD 3: AUDITORÍA Y RESPALDO --- */}
                <SectionCard 
                  icon={<DetailsIcon sx={{ fontSize: 20 }} />} 
                  title="Respaldo y Estado"
                  bgcolor="#2e7d32"
                >
                  <Stack spacing={2.5}>
                    
                    {/* FILA COMPARTIDA: Estado + Tipo Respaldo */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {/* Estado Despliegue */}
                        <FormControl fullWidth error={!!errors.estado_despliegue}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Estado Despliegue *</FormLabel>
                        <Controller
                            name="estado_despliegue"
                            control={control}
                            rules={{ required: 'Requerido' }}
                            render={({ field }) => (
                            <Select {...field} size="small" displayEmpty>
                                <MenuItem value=""><em>Seleccionar...</em></MenuItem>
                                {estadoDespliegueOptions.map(opt => (
                                <MenuItem key={opt.id} value={opt.codigo}>{opt.nombre}</MenuItem>
                                ))}
                            </Select>
                            )}
                        />
                        </FormControl>

                        {/* Tipo Respaldo */}
                        <FormControl fullWidth error={!!errors.cod_tipo_respaldo}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Tipo Respaldo *</FormLabel>
                        <Controller
                            name="cod_tipo_respaldo"
                            control={control}
                            rules={{ required: 'Requerido' }}
                            render={({ field }) => (
                            <Select {...field} size="small" displayEmpty>
                                <MenuItem value=""><em>Seleccionar...</em></MenuItem>
                                {tipoRespaldoOptions.map(opt => (
                                <MenuItem key={opt.id} value={opt.codigo}>{opt.nombre}</MenuItem>
                                ))}
                            </Select>
                            )}
                        />
                        </FormControl>
                    </Box>

                    {/* Referencia Respaldo */}
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Referencia (Ticket/Doc)</FormLabel>
                      <Controller
                        name="referencia_respaldo"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} size="small" placeholder="Nro de Hoja de Ruta o Ticket" />
                        )}
                      />
                    </FormControl>

                    {/* Descripción */}
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Observaciones</FormLabel>
                      <Controller
                        name="descripcion"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} multiline rows={3} size="small" placeholder="Detalles adicionales..." />
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
                  onClick={props.onCancel} 
                  sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(0, 0, 0, 0.23)' }}
                >
                  Cancelar
                </Button>

                <LoadingButton
                  type="submit" variant="contained" loading={props.loading} startIcon={<DeployIcon />}
                  sx={{ 
                    background: 'linear-gradient(135deg, #1565C0 0%, #7B1FA2 100%)', boxShadow: 4, px: 4, minWidth: 160, borderRadius: 2, textTransform: 'none', fontWeight: 700
                  }}
                >
                  {isEdit ? 'Guardar Cambios' : 'Registrar Despliegue'}
                </LoadingButton>
              </Box>

            </form>
          </Box>
        </Card>
      </Box>
    </LocalizationProvider>
  )
}

export default DespliegueForm