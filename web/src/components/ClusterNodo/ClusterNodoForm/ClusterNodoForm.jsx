import { useEffect, useState, useMemo } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { useForm, Controller } from 'react-hook-form'
import { Form, FormError } from '@redwoodjs/forms'

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
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  CircularProgress,
  Stack,
  Avatar,
  Paper,
  Select,
  MenuItem,
  useTheme
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Hub as ClusterIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  Settings as ConfigIcon,
  Memory as ResourceIcon
} from '@mui/icons-material'
import { navigate, routes } from '@redwoodjs/router'

// 1. QUERY PARA DATOS (Incluyendo Parametros)
const GET_FORM_DATA = gql`
  query GetFormData {
    clusters {
      id
      nombre
      cod_tipo_cluster
    }
    maquinas {
      id
      nombre
      ip
    }
    servidores {
      id
      nombre
      ip_primaria
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
const ClusterNodoForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.clusterNodo?.id)

  const { data, loading: loadingData } = useQuery(GET_FORM_DATA)

  // Preparar opciones de Rol
  const opcionesRol = useMemo(() => {
    if (!data?.parametros) return []
    return data.parametros.filter(p => p.grupo === 'NODO_ROL')
  }, [data])

  const formMethods = useForm({
    defaultValues: {
      clusterId: props.clusterNodo?.clusterId || '',
      nombre: props.clusterNodo?.nombre || '',
      nodoTipo: props.clusterNodo?.nodoTipo || 'VIRTUAL',
      maquinaId: props.clusterNodo?.maquinaId || null,
      servidorId: props.clusterNodo?.servidorId || null,
      rol: props.clusterNodo?.rol || '',
      identity_key: props.clusterNodo?.identity_key || '',
    },
  })

  const { control, handleSubmit, watch, setValue, formState: { errors } } = formMethods
  const watchedNodoTipo = watch('nodoTipo')

  useEffect(() => {
    if (watchedNodoTipo === 'VIRTUAL') {
      setValue('servidorId', null)
    } else {
      setValue('maquinaId', null)
    }
  }, [watchedNodoTipo, setValue])

  const onSubmit = (data) => {
    const inputData = {
      ...data,
      estado: 'ACTIVO',
      usuario_creacion: props.clusterNodo ? props.clusterNodo.usuario_creacion : 1,
      usuario_modificacion: 1,
    }
    props.onSave(inputData, props?.clusterNodo?.id)
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
                {isEdit ? 'Editar Nodo' : 'Nuevo Nodo'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? 'Modificar datos del nodo de cluster' : 'Registrar nuevo nodo en el cluster'}
              </Typography>
            </Box>
        </Box>

        {/* CONTENIDO */}
        <Box sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          <Form formMethods={formMethods} onSubmit={onSubmit} error={props.error}>
            
            <FormError error={props.error} wrapperClassName="rw-form-error-wrapper" titleClassName="rw-form-error-title" listClassName="rw-form-error-list" />
            
            {/* GRID LAYOUT */}
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              alignItems: 'start'
            }}>
              
              {/* --- CARD 1: DATOS GENERALES --- */}
              <SectionCard 
                icon={<ClusterIcon sx={{ fontSize: 20 }} />} 
                title="Datos Generales"
                bgcolor={theme.palette.primary.main}
              >
                <Stack spacing={2.5}>
                  {/* CLUSTER */}
                  <FormControl fullWidth error={!!errors.clusterId}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Cluster Perteneciente *</FormLabel>
                    <Controller
                      name="clusterId"
                      control={control}
                      rules={{ required: 'El Cluster es obligatorio' }}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          options={data?.clusters || []}
                          getOptionLabel={(option) => `${option.nombre} (${option.cod_tipo_cluster})`}
                          value={data?.clusters.find((c) => c.id === value) || null}
                          onChange={(_, newValue) => onChange(newValue ? newValue.id : '')}
                          renderInput={(params) => (
                            <TextField {...params} placeholder="Seleccionar Cluster..." size="small" error={!!errors.clusterId} />
                          )}
                        />
                      )}
                    />
                  </FormControl>

                  {/* NOMBRE */}
                  <FormControl fullWidth error={!!errors.nombre}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre del Nodo *</FormLabel>
                    <Controller
                      name="nombre"
                      control={control}
                      rules={{ required: 'El nombre es obligatorio' }}
                      render={({ field }) => (
                        <TextField {...field} size="small" fullWidth placeholder="Ej. worker-node-01" error={!!errors.nombre} />
                      )}
                    />
                  </FormControl>
                </Stack>
              </SectionCard>

              {/* --- CARD 2: RECURSO ASOCIADO --- */}
              <SectionCard 
                icon={<ResourceIcon sx={{ fontSize: 20 }} />} 
                title="Recurso de Infraestructura"
                bgcolor={theme.palette.secondary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* TIPO DE NODO */}
                  <FormControl component="fieldset">
                     <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Tipo de Infraestructura *</FormLabel>
                     <Controller
                      name="nodoTipo"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup {...field} row>
                          <FormControlLabel value="VIRTUAL" control={<Radio size="small" />} label="Virtual (VM)" sx={{ mr: 2 }} />
                          <FormControlLabel value="FISICO" control={<Radio size="small" />} label="Físico" />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>

                  {/* SELECTOR CONDICIONAL */}
                  <Box>
                    {watchedNodoTipo === 'VIRTUAL' ? (
                      <FormControl fullWidth error={!!errors.maquinaId}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Máquina Virtual Vinculada *</FormLabel>
                        <Controller
                          name="maquinaId"
                          control={control}
                          rules={{ required: watchedNodoTipo === 'VIRTUAL' ? 'Requerido' : false }}
                          render={({ field: { onChange, value } }) => (
                            <Autocomplete
                              options={data?.maquinas || []}
                              getOptionLabel={(option) => `${option.nombre} - IP: ${option.ip || 'N/A'}`}
                              value={data?.maquinas.find((m) => m.id === value) || null}
                              onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                              renderInput={(params) => (
                                <TextField {...params} size="small" placeholder="Buscar por nombre o IP..." error={!!errors.maquinaId} />
                              )}
                            />
                          )}
                        />
                      </FormControl>
                    ) : (
                      <FormControl fullWidth error={!!errors.servidorId}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Servidor Físico Vinculado *</FormLabel>
                        <Controller
                          name="servidorId"
                          control={control}
                          rules={{ required: watchedNodoTipo === 'FISICO' ? 'Requerido' : false }}
                          render={({ field: { onChange, value } }) => (
                            <Autocomplete
                              options={data?.servidores || []}
                              getOptionLabel={(option) => `${option.nombre} - IP: ${option.ip_primaria || 'N/A'}`}
                              value={data?.servidores.find((s) => s.id === value) || null}
                              onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                              renderInput={(params) => (
                                <TextField {...params} size="small" placeholder="Buscar servidor..." error={!!errors.servidorId} />
                              )}
                            />
                          )}
                        />
                      </FormControl>
                    )}
                  </Box>
                </Stack>
              </SectionCard>

              {/* --- CARD 3: CONFIGURACIÓN TÉCNICA --- */}
              <SectionCard 
                icon={<ConfigIcon sx={{ fontSize: 20 }} />} 
                title="Configuración Técnica"
                bgcolor="#2e7d32"
              >
                <Stack spacing={2.5}>
                  
                  {/* K8S UID */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Identificador</FormLabel>
                    <Controller
                      name="identity_key"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} size="small" fullWidth placeholder="Identificador único" />
                      )}
                    />
                  </FormControl>

                  {/* ROL (Ahora es Select) */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Rol en el Cluster</FormLabel>
                    <Controller
                      name="rol"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          size="small"
                          fullWidth
                          displayEmpty
                        >
                          <MenuItem value=""><em>Seleccionar rol...</em></MenuItem>
                          {opcionesRol.map((op) => (
                            <MenuItem key={op.id} value={op.codigo}>
                              {op.nombre}
                            </MenuItem>
                          ))}
                        </Select>
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
                onClick={() => navigate(routes.clusterNodos())}
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
                {props.loading ? 'Guardando...' : 'Guardar'}
              </LoadingButton>
            </Box>

          </Form>
        </Box>
      </Card>
    </Box>
  )
}

export default ClusterNodoForm