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
  Collapse,
  Alert, 
  Divider,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  ErrorOutline as ErrorIcon,
  Storage as DataCenterIcon,
  Computer as VmIcon,
  Dns as ServerIcon,
  Event as EventIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. QUERIES
 * --------------------------------------------- */
const GET_DATA_INFRA = gql`
  query GetDataInfraAfectada {
    eventos {
      id
      cod_evento
      cod_tipo_evento
      descripcion
      estado
      fecha_evento
      tipoEventoInfo {
        nombre
        codigo
      }
    }
    dataCenters {
      id
      nombre
      estado
    }
    servidores {
      id
      nombre  
      serie
      modelo
      marca
      cod_tipo_servidor
      estado
      estado_operativo
    }
    maquinas {
      id
      nombre
      estado
    }
  }
`

/* ---------------------------------------------
 * 2. COMPONENTE HELPER: SectionCard (Estandarizado)
 * --------------------------------------------- */
const SectionCard = ({ icon, title, children, bgcolor, visible = true }) => {
  const theme = useTheme()
  const activeColor = bgcolor || theme.palette.primary.main
  
  if (!visible) return null;

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
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        animation: 'fadeIn 0.4s ease'
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
const InfraAfectadaForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.infraAfectada?.id)

  const { data, loading: loadingData } = useQuery(GET_DATA_INFRA)

  const [showFilters, setShowFilters] = useState(false)
  const [serverFilters, setServerFilters] = useState({ marca: '', tipo: '' })
  
  const [visibilidad, setVisibilidad] = useState({ dc: true, server: true, vm: true })
  const [forzarVerTodo, setForzarVerTodo] = useState(false)

  const formMethods = useForm({
    defaultValues: {
      id_evento: props.infraAfectada?.id_evento || null,
      id_data_center: props.infraAfectada?.id_data_center || null,
      id_maquina: props.infraAfectada?.id_maquina || null,
      id_servidor: props.infraAfectada?.id_servidor || null,
    },
  })

  const { control, handleSubmit, watch, setValue, formState: { errors } } = formMethods
  
  const watchedEventoId = watch('id_evento')

  // --- LÓGICA DE VISIBILIDAD DINÁMICA ---
  useEffect(() => {
    if (!watchedEventoId || !data?.eventos) {
        setVisibilidad({ dc: true, server: true, vm: true })
        return
    }

    const eventoSeleccionado = data.eventos.find(e => e.id === watchedEventoId)
    if (!eventoSeleccionado) return

    const codigoTipo = eventoSeleccionado.cod_tipo_evento || eventoSeleccionado.cod_evento
    const codigoUpper = codigoTipo?.toUpperCase() || ''

    if (codigoUpper.includes('CORTE_ENERGIA')) {
        setVisibilidad({ dc: true, server: false, vm: false })
    } 
    else if (codigoUpper.includes('HW') || codigoUpper.includes('HARDWARE')) {
        setVisibilidad({ dc: false, server: true, vm: false })
    } 
    else if (codigoUpper.includes('SW') || codigoUpper.includes('SOFTWARE')) {
        setVisibilidad({ dc: false, server: true, vm: true })
    } 
    else {
        setVisibilidad({ dc: true, server: true, vm: true })
    }

  }, [watchedEventoId, data])


  // --- PREPARACIÓN DE OPCIONES ---
  const eventosOptions = useMemo(() => 
    data?.eventos?.filter(e => e.estado === 'ACTIVO').map(e => {
      
      let fechaStr = '';
      if (e.fecha_evento) {
        const d = new Date(e.fecha_evento);
        if (!isNaN(d.getTime())) {
            fechaStr = d.toLocaleDateString('es-ES');
        } else {
            fechaStr = e.fecha_evento; 
        }
      }

      const label = [
          e.cod_evento, 
          e.descripcion, 
          fechaStr ? `(${fechaStr})` : null
      ].filter(Boolean).join(' - ')

      return {
        id: e.id,
        label: label,
        raw: e
      }
    }) || [], 
  [data])

  const dcOptions = useMemo(() => 
    data?.dataCenters?.filter(d => d.estado === 'ACTIVO').map(d => ({
      id: d.id,
      label: d.nombre
    })) || [], 
  [data])

  const maquinaOptions = useMemo(() => 
    data?.maquinas?.filter(m => m.estado === 'ACTIVO').map(m => ({
      id: m.id,
      label: m.nombre
    })) || [], 
  [data])

  const servidoresBase = useMemo(() => 
    data?.servidores?.filter(s => s.estado === 'ACTIVO') || [], 
  [data])

  const marcasUnicas = useMemo(() => [...new Set(servidoresBase.map(s => s.marca))].filter(Boolean).sort(), [servidoresBase])
  const tiposUnicos = useMemo(() => [...new Set(servidoresBase.map(s => s.cod_tipo_servidor))].filter(Boolean).sort(), [servidoresBase])

  const servidoresFiltrados = useMemo(() => {
    return servidoresBase.filter(s => {
      const matchMarca = serverFilters.marca ? s.marca === serverFilters.marca : true
      const matchTipo = serverFilters.tipo ? s.cod_tipo_servidor === serverFilters.tipo : true
      return matchMarca && matchTipo
    }).map(s => {
      const parts = [s.nombre, s.marca].filter(Boolean).join(' - ');
      const tipoPart = s.cod_tipo_servidor ? `(${s.cod_tipo_servidor})` : '';
      return {
        id: s.id,
        label: `${parts} ${tipoPart}`.trim() || 'Servidor sin ID',
      }
    })
  }, [servidoresBase, serverFilters])


  const onSubmit = (formData) => {
    const hayDc = (visibilidad.dc || forzarVerTodo) && formData.id_data_center
    const hayServer = (visibilidad.server || forzarVerTodo) && formData.id_servidor
    const hayVm = (visibilidad.vm || forzarVerTodo) && formData.id_maquina

    if (!hayDc && !hayServer && !hayVm) {
        alert("Debe seleccionar al menos un componente afectado.")
        return
    }

    const payload = {
      ...formData,
      id_data_center: (visibilidad.dc || forzarVerTodo) ? formData.id_data_center : null,
      id_servidor: (visibilidad.server || forzarVerTodo) ? formData.id_servidor : null,
      id_maquina: (visibilidad.vm || forzarVerTodo) ? formData.id_maquina : null,
      estado: 'ACTIVO',
    }
    props.onSave(payload, props?.infraAfectada?.id)
  }

  const handleCancel = () => {
    try {
        navigate(routes.infraAfectadas()) 
    } catch (e) {
        console.error("No se encontró la ruta 'infraAfectadas'. Verifica tus rutas en routes.js", e)
        if(props.onCancel) props.onCancel();
    }
  }

  if (loadingData) {
    return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
  }

  const showDC = visibilidad.dc || forzarVerTodo;
  const showServer = visibilidad.server || forzarVerTodo;
  const showVM = visibilidad.vm || forzarVerTodo;
  const showRightCard = showServer || showVM;

  return (
    // AJUSTE: El padding lateral del Box principal es 5 para dar espacio al Layout
    <Box sx={{ width: '100%', maxWidth: 1500, mx: 'auto' }}>
      
      <Card 
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderTop: 'none',
          borderRadius: 2,
          mb: 3,
          bgcolor: theme.palette.background.paper,
        }}
      >
        
        {/* HEADER (Estilo Estandarizado) */}
        <Box sx={{ 
            px: 5, py: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            bgcolor: theme.palette.background.paper, // Soporte Dark Mode
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
          }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{
                    width: 48, height: 48, // Estandarizado a 48px
                    background: 'linear-gradient(135deg, #1565C0, #7B1FA2)', color: 'white', boxShadow: 3
                  }}>
                {isEdit ? <EditIcon /> : <AddIcon />}
              </Avatar>
              
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{
                    lineHeight: 1.2, mb: 0.5,
                    // GRADIENTE EN TEXTO
                    background: 'linear-gradient(90deg, #1565C0 0%, #7B1FA2 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                  {isEdit ? 'Editar Afectación' : 'Registrar Afectación'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seleccione el evento para ver los recursos disponibles
                </Typography>
              </Box>
            </Box>

            {/* SWITCH MANUAL DE VISIBILIDAD */}
            {watchedEventoId && (
              <FormControlLabel 
                control={<Switch size="small" checked={forzarVerTodo} onChange={(e) => setForzarVerTodo(e.target.checked)} />}
                label={<Typography variant="caption" color="text.secondary">Mostrar todos los recursos</Typography>}
              />
            )}
        </Box>

        {/* CONTENIDO */}
        <Box sx={{ px: 5, pb: 5, pt: 0 }}>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {props.error && (
              <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#fff4f4', borderColor: 'error.main', color: 'error.main', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                <ErrorIcon color="error" />
                <Typography variant="body2" fontWeight={600}>{props.error.message}</Typography>
              </Paper>
            )}

            {/* GRID PRINCIPAL */}
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: showRightCard ? 'repeat(auto-fit, minmax(350px, 1fr))' : '1fr', // Ajustado minmax para mejor responsividad
              alignItems: 'start',
              transition: 'all 0.3s ease'
            }}>
              
              {/* --- CARD 1: EVENTO Y DATACENTER (AZUL PRIMARIO) --- */}
              <SectionCard 
                icon={<EventIcon sx={{ fontSize: 20 }} />} 
                title="Evento y Data Center"
                bgcolor={theme.palette.primary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Evento */}
                  <FormControl fullWidth error={!!errors.id_evento}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Evento Asociado *</FormLabel>
                    <Controller
                      name="id_evento"
                      control={control}
                      rules={{ required: 'Seleccione un evento' }}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          options={eventosOptions}
                          getOptionLabel={(option) => option.label}
                          value={eventosOptions.find(e => e.id === value) || null}
                          onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                          renderInput={(params) => (
                            <TextField 
                                {...params} 
                                size="small" 
                                placeholder="Buscar evento..." 
                                error={!!errors.id_evento}
                                helperText={errors.id_evento?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Data Center */}
                  <Collapse in={showDC} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 1 }} />
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                          <DataCenterIcon fontSize="small" sx={{ mr: 1 }} /> 
                          Data Center Afectado
                      </FormLabel>
                      <Controller
                        name="id_data_center"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Autocomplete
                            options={dcOptions}
                            getOptionLabel={(option) => option.label}
                            value={dcOptions.find(d => d.id === value) || null}
                            onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                            renderInput={(params) => (
                              <TextField {...params} size="small" placeholder="Seleccionar DC..." />
                            )}
                          />
                        )}
                      />
                    </FormControl>
                  </Collapse>

                </Stack>
              </SectionCard>

              {/* --- CARD 2: RECURSOS TI (CYAN/SECUNDARIO) --- */}
              <SectionCard 
                icon={<ServerIcon sx={{ fontSize: 20 }} />} 
                title="Recursos Informáticos"
                bgcolor={theme.palette.secondary.main}
                visible={showRightCard}
              >
                <Stack spacing={2.5}>
                  
                  {/* SERVIDOR FÍSICO */}
                  <Collapse in={showServer} timeout="auto" unmountOnExit>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <FormLabel sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                <ServerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> 
                                Servidor Físico
                            </FormLabel>
                        </Box>

                        {/* FILTROS */}
                        <Collapse in={showFilters}>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : theme.palette.grey[50] }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <TextField select label="Marca" size="small" value={serverFilters.marca} onChange={(e) => setServerFilters(prev => ({ ...prev, marca: e.target.value }))}>
                                        <MenuItem value=""><em>Todas</em></MenuItem>
                                        {marcasUnicas.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                    </TextField>
                                    <TextField select label="Tipo" size="small" value={serverFilters.tipo} onChange={(e) => setServerFilters(prev => ({ ...prev, tipo: e.target.value }))}>
                                        <MenuItem value=""><em>Todos</em></MenuItem>
                                        {tiposUnicos.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                    </TextField>
                                </Box>
                            </Paper>
                        </Collapse>

                        <Controller
                        name="id_servidor"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Autocomplete
                            options={servidoresFiltrados}
                            getOptionLabel={(option) => option.label}
                            value={servidoresFiltrados.find(s => s.id === value) || null}
                            onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                            renderInput={(params) => (
                                <TextField {...params} size="small" placeholder="Buscar servidor..." />
                            )}
                            noOptionsText="No se encontraron servidores"
                            />
                        )}
                        />
                    </Box>
                  </Collapse>

                  {/* DIVIDER */}
                  {showServer && showVM && <Divider />}

                  {/* MÁQUINA VIRTUAL */}
                  <Collapse in={showVM} timeout="auto" unmountOnExit>
                    <FormControl fullWidth>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            <VmIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> 
                            Máquina Virtual
                        </FormLabel>
                        <Controller
                        name="id_maquina"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Autocomplete
                            options={maquinaOptions}
                            getOptionLabel={(option) => option.label}
                            value={maquinaOptions.find(m => m.id === value) || null}
                            onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                            renderInput={(params) => (
                                <TextField {...params} size="small" placeholder="Buscar VM..." />
                            )}
                            />
                        )}
                        />
                    </FormControl>
                  </Collapse>

                </Stack>
              </SectionCard>

            </Box>

            {/* BOTONES (Pill Shape + Colores Estandarizados) */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                type="button" 
                variant="outlined" 
                startIcon={<CancelIcon />}
                onClick={handleCancel}
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
                {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Guardar Afectación')}
              </LoadingButton>
            </Box>

          </form>
        </Box>
      </Card>
    </Box>
  )
}

export default InfraAfectadaForm