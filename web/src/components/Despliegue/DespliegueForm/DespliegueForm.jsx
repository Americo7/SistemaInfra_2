import React, { useEffect, useMemo } from 'react'
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
  createFilterOptions,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Avatar,
  Button,
  useTheme,
  CircularProgress,
  Paper,
  InputAdornment,
  FormHelperText
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'

// Iconos
import {
  Cancel as CancelIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  ErrorOutline as ErrorIcon,
  RocketLaunch as DeployIcon,
  Computer as InfraIcon,
  CalendarMonth as DateIcon,
  Description as DetailsIcon,
  Storage as ServerIcon,
  Cloud as VirtualIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. QUERIES (Respaldo por si se usa Standalone)
 * --------------------------------------------- */
const GET_DATA_FORM = gql`
  query GetDataFormDespliegue {
    componentes {
      id
      nombre
      estado
      sistemas {
        id
        sigla
        nombre
      }
    }
    maquinas {
      id
      nombre
      estado
      ip  
    }
    servidores {
      id
      nombre
      estado
      ip_primaria
    }
    parametros: parametrosFormularioDespliegue {
      id
      codigo
      nombre
      grupo
    }
  }
`

/* ---------------------------------------------
 * 2. COMPONENTE VISUAL: SectionCard
 * --------------------------------------------- */
const SectionCard = ({ icon, title, children, color }) => {
  const theme = useTheme()
  const activeColor = color || theme.palette.primary.main
  
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `3px solid ${activeColor}`,
        bgcolor: 'background.paper',
        // CORRECCIÓN: Quitamos height: '100%' para evitar espacios vacíos innecesarios
        height: 'auto', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: activeColor, width: 32, height: 32 }}>
            {icon}
          </Avatar>
        }
        title={
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {title}
          </Typography>
        }
        sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>{children}</CardContent>
    </Card>
  )
}

/* ---------------------------------------------
 * CONFIGURACIÓN DE FILTROS DE BÚSQUEDA
 * --------------------------------------------- */
const filterComponentes = createFilterOptions({
  stringify: (option) => `${option.nombre} ${option.sistemas?.nombre || ''} ${option.sistemas?.sigla || ''}`,
})

const filterMaquinas = createFilterOptions({
  stringify: (option) => `${option.nombre} ${option.ip || ''}`,
})

const filterServidores = createFilterOptions({
  stringify: (option) => `${option.nombre} ${option.ip_primaria || ''}`,
})

/* ---------------------------------------------
 * 3. FORMULARIO PRINCIPAL
 * --------------------------------------------- */
const DespliegueForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.despliegue?.id)

  // --- Carga de Datos ---
  const { data, loading: loadingData } = useQuery(GET_DATA_FORM, {
    skip: Boolean(props.componentes && props.maquinas && props.servidores && props.parametros)
  })

  const componentes = props.componentes || data?.componentes || []
  const maquinas = props.maquinas || data?.maquinas || []
  const servidores = props.servidores || data?.servidores || []
  const parametros = props.parametros || data?.parametros || []
  
  const isLoadingCatalogs = !props.componentes && loadingData

  // --- Listas Filtradas (Solo Activos) ---
  const componentesOptions = useMemo(() => componentes?.filter(c => c.estado === 'ACTIVO') || [], [componentes])
  const maquinasOptions = useMemo(() => maquinas?.filter(m => m.estado === 'ACTIVO') || [], [maquinas])
  const servidoresOptions = useMemo(() => servidores?.filter(s => s.estado === 'ACTIVO') || [], [servidores])

  const unidadesOptions = useMemo(() => parametros.filter(p => p.grupo === 'UNIDAD_AGETIC'), [parametros])
  const tipoRespaldoOptions = useMemo(() => parametros.filter(p => p.grupo === 'TIPO_RESPALDO'), [parametros])
  const estadoDespliegueOptions = useMemo(() => parametros.filter(p => p.grupo === 'E_EVENTO_DESPLIEGUE'), [parametros])

  // --- React Hook Form ---
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      id_componente: props.despliegue?.id_componente || null,
      tipo_infra: props.despliegue?.id_servidor ? 'FISICO' : 'VIRTUAL',
      id_maquina: props.despliegue?.id_maquina || null,
      id_servidor: props.despliegue?.id_servidor || null,
      
      unidad_solicitante: props.despliegue?.unidad_solicitante || '',
      solicitante: props.despliegue?.solicitante || '',
      fecha_solicitud: props.despliegue?.fecha_solicitud ? dayjs(props.despliegue.fecha_solicitud) : dayjs(),
      fecha_despliegue: props.despliegue?.fecha_despliegue ? dayjs(props.despliegue.fecha_despliegue) : dayjs(),

      estado_despliegue: props.despliegue?.estado_despliegue || '',
      cod_tipo_respaldo: props.despliegue?.cod_tipo_respaldo || '',
      referencia_respaldo: props.despliegue?.referencia_respaldo || '',
      descripcion: props.despliegue?.descripcion || '',
    },
  })

  // --- Lógica Virtual/Físico ---
  const watchedTipoInfra = watch('tipo_infra')

  useEffect(() => {
    if (watchedTipoInfra === 'VIRTUAL') {
      setValue('id_servidor', null)
    } else {
      setValue('id_maquina', null)
    }
  }, [watchedTipoInfra, setValue])

  // --- Submit ---
  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      // Se asegura que las fechas se envíen como ISO string para el backend
      fecha_despliegue: formData.fecha_despliegue ? formData.fecha_despliegue.toISOString() : null,
      fecha_solicitud: formData.fecha_solicitud ? formData.fecha_solicitud.toISOString() : null,
      estado: 'ACTIVO',
      tipo_infra: undefined // No se envía al backend
    } 

    props.onSave(payload, props?.despliegue?.id)
  }

  if (isLoadingCatalogs) {
    return <Box display="flex" justifyContent="center" p={8}><CircularProgress /></Box>
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              <Avatar
                sx={{
                    width: 38, height: 38,
                    background: 'linear-gradient(135deg, #1565C0, #7B1FA2)',
                    color: 'white', boxShadow: 3
                  }}
                >
                {isEdit ? <EditIcon /> : <AddIcon />}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, color: '#000', mb: 0.5 }}>
                  {isEdit ? 'Editar Despliegue' : 'Registrar Nuevo Despliegue'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isEdit ? 'Actualizar información del pase a producción' : 'Documentar el despliegue de un componente en infraestructura'}
                </Typography>
              </Box>
          </Box>

          {/* CONTENIDO PRINCIPAL */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
            
            {props.error && (
              <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                <ErrorIcon color="error" />
                <Typography variant="body2" fontWeight={600}>{props.error.message}</Typography>
              </Paper>
            )}

            {/* GRID LAYOUT (3 Columnas) */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: 3,
              alignItems: 'start'
            }}>

              {/* --- COLUMNA 1: INFRAESTRUCTURA --- */}
              <SectionCard 
                title="Componente e Infraestructura" 
                icon={<InfraIcon />} 
                color={theme.palette.primary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Selección de Componente */}
                  <FormControl fullWidth error={!!errors.id_componente}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Componente de Software *</FormLabel>
                    <Controller
                      name="id_componente"
                      control={control}
                      rules={{ required: 'Seleccione un componente' }}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          options={componentesOptions}
                          filterOptions={filterComponentes}
                          getOptionLabel={(option) => option.nombre || ''}
                          renderOption={(props, option) => {
                            const { key, ...optionProps } = props
                            return (
                                <li key={key} {...optionProps}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="body2" fontWeight={600}>{option.nombre}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {option.sistemas?.sigla ? `[${option.sistemas.sigla}] ` : ''} 
                                            {option.sistemas?.nombre || 'Sin sistema'}
                                        </Typography>
                                    </Box>
                                </li>
                            )
                          }}
                          value={componentesOptions.find(c => c.id === value) || null}
                          onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                          renderInput={(params) => (
                            <TextField 
                                {...params} 
                                size="small" 
                                placeholder="Buscar por nombre, sistema o sigla..." 
                                error={!!errors.id_componente}
                            />
                          )}
                          noOptionsText="Sin resultados"
                        />
                      )}
                    />
                    {errors.id_componente && <FormHelperText>{errors.id_componente.message}</FormHelperText>}
                  </FormControl>

                  {/* Radio Switch: Virtual vs Físico */}
                  <FormControl component="fieldset">
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Destino del Despliegue</FormLabel>
                    <Controller
                      name="tipo_infra"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup {...field} row>
                          <FormControlLabel 
                            value="VIRTUAL" 
                            control={<Radio size="small" />} 
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <VirtualIcon fontSize="small" color="action" />
                                    <Typography variant="body2">Virtual (VM)</Typography>
                                </Box>
                            } 
                            sx={{ mr: 2 }} 
                          />
                          <FormControlLabel 
                            value="FISICO" 
                            control={<Radio size="small" />} 
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <ServerIcon fontSize="small" color="action" />
                                    <Typography variant="body2">Físico</Typography>
                                </Box>
                            } 
                          />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>

                  {/* Selector Dinámico */}
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
                              filterOptions={filterMaquinas}
                              getOptionLabel={(option) => option.nombre || ''}
                              
                              renderOption={(props, option) => {
                                const { key, ...optionProps } = props
                                return (
                                    <li key={key} {...optionProps}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {option.nombre}
                                            </Typography>
                                            {option.ip && (
                                              <Typography variant="caption" color="text.secondary">
                                                  IP: {option.ip}
                                              </Typography>
                                            )}
                                        </Box>
                                    </li>
                                )
                              }}

                              value={maquinasOptions.find(m => m.id === value) || null}
                              onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                              renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    size="small" 
                                    placeholder="Buscar por Nombre o IP..." 
                                    error={!!errors.id_maquina} 
                                />
                              )}
                              noOptionsText="No encontrada"
                            />
                          )}
                        />
                        {errors.id_maquina && <FormHelperText>Seleccione la VM destino</FormHelperText>}
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
                              filterOptions={filterServidores}
                              getOptionLabel={(option) => option.nombre || ''}
                              
                              renderOption={(props, option) => {
                                const { key, ...optionProps } = props
                                return (
                                    <li key={key} {...optionProps}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {option.nombre}
                                            </Typography>
                                            {option.ip_primaria && (
                                              <Typography variant="caption" color="text.secondary">
                                                  IP: {option.ip_primaria}
                                              </Typography>
                                            )}
                                        </Box>
                                    </li>
                                )
                              }}

                              value={servidoresOptions.find(s => s.id === value) || null}
                              onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                              renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    size="small" 
                                    placeholder="Buscar por Nombre o IP..." 
                                    error={!!errors.id_servidor} 
                                />
                              )}
                              noOptionsText="No encontrado"
                            />
                          )}
                        />
                        {errors.id_servidor && <FormHelperText>Seleccione el servidor físico</FormHelperText>}
                      </FormControl>
                    )}
                  </Box>

                </Stack>
              </SectionCard>

              {/* --- COLUMNA 2: DATOS SOLICITUD --- */}
              <SectionCard 
                title="Datos de la Solicitud" 
                icon={<DateIcon />} 
                color={theme.palette.secondary.main}
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
                            <TextField {...params} size="small" placeholder="Buscar unidad..." error={!!errors.unidad_solicitante} />
                          )}
                        />
                      )}
                    />
                    {errors.unidad_solicitante && <FormHelperText>Unidad que requiere el pase</FormHelperText>}
                  </FormControl>

                  {/* Persona Solicitante */}
                  <FormControl fullWidth error={!!errors.solicitante}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Persona Solicitante *</FormLabel>
                    <Controller
                      name="solicitante"
                      control={control}
                      rules={{ required: 'Requerido' }}
                      render={({ field }) => (
                        <TextField {...field} size="small" placeholder="Nombre del responsable" error={!!errors.solicitante} />
                      )}
                    />
                  </FormControl>

                  {/* Fechas (CORREGIDO PARA CAMBIAR EL VALOR Y EL FORMATO) */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    
                    {/* Fecha Solicitud */}
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Fecha Solicitud</FormLabel>
                      <Controller
                        name="fecha_solicitud"
                        control={control}
                        render={({ field: { onChange, value } }) => ( // <- CORRECCIÓN: Desestructuramos onChange y value
                          <DateTimePicker 
                            value={value} // <- CORRECCIÓN: Usamos el value de RHF
                            onChange={onChange} // <- CORRECCIÓN: Pasamos el Dayjs object a RHF
                            format="DD/MM/YYYY HH:mm" // <- CAMBIO: Aplicamos el nuevo formato
                            slotProps={{ textField: { size: 'small' } }} 
                          />
                        )}
                      />
                    </FormControl>

                    {/* Fecha Despliegue */}
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Fecha Despliegue</FormLabel>
                      <Controller
                        name="fecha_despliegue"
                        control={control}
                        render={({ field: { onChange, value } }) => ( // <- CORRECCIÓN: Desestructuramos onChange y value
                          <DateTimePicker 
                            value={value} // <- CORRECCIÓN: Usamos el value de RHF
                            onChange={onChange} // <- CORRECCIÓN: Pasamos el Dayjs object a RHF
                            format="DD/MM/YYYY HH:mm" // <- CAMBIO: Aplicamos el nuevo formato
                            slotProps={{ textField: { size: 'small' } }} 
                          />
                        )}
                      />
                    </FormControl>
                  </Box>

                </Stack>
              </SectionCard>

              {/* --- COLUMNA 3: ESTADO Y RESPALDO --- */}
              <SectionCard 
                title="Respaldo y Estado" 
                icon={<DetailsIcon />} 
                color="#2e7d32" 
              >
                <Stack spacing={2.5}>
                  
                  {/* Fila: Estado + Tipo Respaldo */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      
                      <FormControl fullWidth error={!!errors.estado_despliegue}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Estado *</FormLabel>
                        <Controller
                            name="estado_despliegue"
                            control={control}
                            rules={{ required: 'Requerido' }}
                            render={({ field }) => (
                            <Select {...field} size="small" displayEmpty>
                                <MenuItem value=""><em>...</em></MenuItem>
                                {estadoDespliegueOptions.map(opt => (
                                <MenuItem key={opt.id} value={opt.codigo}>{opt.nombre}</MenuItem>
                                ))}
                            </Select>
                            )}
                        />
                      </FormControl>

                      <FormControl fullWidth error={!!errors.cod_tipo_respaldo}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Tipo Respaldo *</FormLabel>
                        <Controller
                            name="cod_tipo_respaldo"
                            control={control}
                            rules={{ required: 'Requerido' }}
                            render={({ field }) => (
                            <Select {...field} size="small" displayEmpty>
                                <MenuItem value=""><em>...</em></MenuItem>
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
                        <TextField 
                            {...field} 
                            size="small" 
                            placeholder="Nro de Hoja de Ruta o Ticket" 
                            InputProps={{
                                startAdornment: <InputAdornment position="start">#</InputAdornment>,
                            }}
                        />
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
                        <TextField {...field} multiline rows={4} size="small" placeholder="Detalles técnicos adicionales..." />
                      )}
                    />
                  </FormControl>

                </Stack>
              </SectionCard>

            </Box>

            {/* BOTONES DE ACCIÓN */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={() => navigate(routes.despliegues())}
                sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(0, 0, 0, 0.23)' }}
              >
                Cancelar
              </Button>

              <LoadingButton
                type="submit"
                variant="contained"
                loading={props.loading}
                startIcon={<DeployIcon />}
                sx={{ 
                  background: 'linear-gradient(135deg, #1565C0 0%, #7B1FA2 100%)',
                  boxShadow: 4, px: 4, minWidth: 160, borderRadius: 2, textTransform: 'none', fontWeight: 700
                }}
              >
                {isEdit ? 'Guardar Cambios' : 'Registrar Despliegue'}
              </LoadingButton>
            </Box>

          </Box>
        </Card>
      </Box>
    </LocalizationProvider>
  )
}

export default DespliegueForm