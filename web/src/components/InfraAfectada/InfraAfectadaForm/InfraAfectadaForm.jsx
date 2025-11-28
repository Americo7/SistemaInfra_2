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
  IconButton,
  Tooltip,
  useTheme,
  Paper,
  CircularProgress,
  Collapse,
  Alert, // <--- AQUI ESTABA EL ERROR, AHORA ESTÁ IMPORTADO
  Divider,
  MenuItem
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  ErrorOutline as ErrorIcon,
  Event as EventIcon,
  Storage as DataCenterIcon,
  Computer as VmIcon,
  Dns as ServerIcon,
  FilterAlt as FilterIcon,
  FilterAltOff as FilterOffIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. QUERIES
 * --------------------------------------------- */
const GET_DATA_INFRA = gql`
  query GetDataInfraAfectada {
    eventos {
      id
      cod_evento
      descripcion
      estado
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
        action={null}
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

  // Carga de datos
  const { data, loading: loadingData } = useQuery(GET_DATA_INFRA)

  // Filtros locales para Servidores
  const [showFilters, setShowFilters] = useState(false)
  const [serverFilters, setServerFilters] = useState({ marca: '', tipo: '' })

  // Preparación de Opciones
  const eventosOptions = useMemo(() => 
    data?.eventos?.filter(e => e.estado === 'ACTIVO').map(e => ({
      id: e.id,
      label: `${e.cod_evento} - ${e.descripcion}`
    })) || [], 
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

  // Lógica de Servidores
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
      // Construimos: Nombre - Marca (Tipo)
      const parts = [s.nombre, s.marca].filter(Boolean).join(' - ');
      const tipoPart = s.cod_tipo_servidor ? `(${s.cod_tipo_servidor})` : '';
      const labelFinal = `${parts} ${tipoPart}`.trim();

      return {
        id: s.id,
        label: labelFinal || 'Servidor sin identificación',
      }
    })
  }, [servidoresBase, serverFilters])


  // Configuración del Formulario
  const formMethods = useForm({
    defaultValues: {
      id_evento: props.infraAfectada?.id_evento || null,
      id_data_center: props.infraAfectada?.id_data_center || null,
      id_maquina: props.infraAfectada?.id_maquina || null,
      id_servidor: props.infraAfectada?.id_servidor || null,
    },
  })

  const { control, handleSubmit, watch, formState: { errors } } = formMethods

  const onSubmit = (formData) => {
    if (!formData.id_data_center && !formData.id_maquina && !formData.id_servidor) {
        alert("Debe seleccionar al menos un componente afectado (Data Center, Servidor o VM).")
        return
    }

    const payload = {
      ...formData,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: isEdit ? undefined : 3,
    }
    props.onSave(payload, props?.infraAfectada?.id)
  }

  if (loadingData) {
    return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
      
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
                {isEdit ? 'Editar Afectación' : 'Registrar Afectación'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vincular recursos de infraestructura a un evento específico
              </Typography>
            </Box>
        </Box>

        {/* CONTENIDO */}
        <Box sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {props.error && (
              <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                <ErrorOutlineIcon color="error" />
                <Typography variant="body2" fontWeight={600}>{props.error.message}</Typography>
              </Paper>
            )}

            {/* GRID DE 2 COLUMNAS */}
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
              alignItems: 'start'
            }}>
              
              {/* --- CARD 1: EVENTO Y UBICACIÓN --- */}
              <SectionCard 
                icon={<EventIcon sx={{ fontSize: 20 }} />} 
                title="Evento y Ubicación"
                bgcolor={theme.palette.primary.main}
              >
                <Stack spacing={3}>
                  
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

                  <Divider />

                  {/* Data Center */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <DataCenterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> 
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

                </Stack>
              </SectionCard>

              {/* --- CARD 2: RECURSOS FÍSICOS Y VIRTUALES --- */}
              <SectionCard 
                icon={<ServerIcon sx={{ fontSize: 20 }} />} 
                title="Recursos Afectados"
                bgcolor={theme.palette.secondary.main}
              >
                <Stack spacing={3}>
                  
                  {/* SERVIDOR FÍSICO */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <FormLabel sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            <ServerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> 
                            Servidor Físico
                        </FormLabel>
                        <Tooltip title="Filtrar servidores">
                            <IconButton size="small" onClick={() => setShowFilters(!showFilters)} color={showFilters ? 'primary' : 'default'}>
                                {showFilters ? <FilterOffIcon fontSize="small" /> : <FilterIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Filtros Colapsables */}
                    <Collapse in={showFilters}>
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#fafafa' }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <TextField 
                                    select 
                                    label="Marca" 
                                    size="small" 
                                    value={serverFilters.marca}
                                    onChange={(e) => setServerFilters(prev => ({ ...prev, marca: e.target.value }))}
                                >
                                    <MenuItem value=""><em>Todas</em></MenuItem>
                                    {marcasUnicas.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                </TextField>
                                <TextField 
                                    select 
                                    label="Tipo" 
                                    size="small" 
                                    value={serverFilters.tipo}
                                    onChange={(e) => setServerFilters(prev => ({ ...prev, tipo: e.target.value }))}
                                >
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
                            <TextField 
                                {...params} 
                                size="small" 
                                placeholder="Buscar servidor..." 
                                helperText={value ? "Servidor seleccionado" : "Opcional"}
                            />
                          )}
                          noOptionsText="No se encontraron servidores"
                        />
                      )}
                    />
                  </Box>

                  <Divider />

                  {/* MÁQUINA VIRTUAL */}
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
                            <TextField {...params} size="small" placeholder="Buscar VM..." helperText={value ? "VM seleccionada" : "Opcional"} />
                          )}
                        />
                      )}
                    />
                  </FormControl>

                  <Alert severity="info" sx={{ fontSize: '0.8rem', py: 0 }}>
                    Puede seleccionar múltiples recursos si todos fueron afectados por el mismo evento.
                  </Alert>

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