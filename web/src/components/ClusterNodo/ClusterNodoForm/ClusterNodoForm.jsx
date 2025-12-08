import { useEffect, useMemo } from 'react'
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
  Stack,
  Avatar,
  Select,
  MenuItem,
  useTheme,
  InputAdornment,
  Alert
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Hub as ClusterIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  Settings as ConfigIcon,
  Memory as ResourceIcon,
  Lock as LockIcon
} from '@mui/icons-material'
import { navigate, routes } from '@redwoodjs/router'

/* ---------------------------------------------
 * HELPER: Tarjeta de Sección
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

const ClusterNodoForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.clusterNodo?.id)

  /* ============================================================
     1. LOGICA DE PERMISOS Y SEGURIDAD
  ============================================================ */
  const identityKey = props.clusterNodo?.identity_key || ''
  const isManualNode = identityKey.startsWith('manual:')
  const canEdit = !isEdit || isManualNode

  const sanitizeInput = (value) => {
    if (!value) return ''
    return value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
  }

  /* ============================================================
     2. PREPARACIÓN DE DATOS (Mapeos y Listas)
  ============================================================ */
  
  // A. Mapa Dinámico para Tipos de Cluster
  const mapaTiposCluster = useMemo(() => {
    if (!props.parametros) return {}
    const mapa = {}
    props.parametros.forEach((p) => {
      if (p.grupo === 'TIPO_CLUSTER') {
        mapa[p.codigo] = p.nombre
      }
    })
    return mapa
  }, [props.parametros])

  // B. Lista de Roles (NODO_ROL)
  const opcionesRol = useMemo(() => {
    if (!props.parametros) return []
    return props.parametros.filter(p => p.grupo === 'NODO_ROL')
  }, [props.parametros])

  /* ============================================================
     3. CONFIGURACIÓN DEL FORMULARIO
  ============================================================ */
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

  const { control, watch, setValue, formState: { errors } } = formMethods
  const watchedNodoTipo = watch('nodoTipo')

  useEffect(() => {
    if (canEdit) {
      if (watchedNodoTipo === 'VIRTUAL') {
        setValue('servidorId', null)
      } else {
        setValue('maquinaId', null)
      }
    }
  }, [watchedNodoTipo, setValue, canEdit])

  // --- CORRECCIÓN AQUÍ ---
  const onSubmit = (data) => {
    // 1. Copiamos los datos del formulario
    const inputData = {
      ...data,
      estado: 'ACTIVO', 
    }
    
    // 2. Limpieza de datos
    // No enviamos usuario_creacion ni usuario_modificacion.
    // El backend (service) los obtiene de context.currentUser.
    
    if (!isEdit) {
       // Si es nuevo, borramos identity_key para que el backend la genere
       // (a menos que el usuario haya escrito una manual, pero el campo está disabled en el form)
       delete inputData.identity_key 
    } else {
       // Si es edición, nos aseguramos de no mandar campos que no existen en UpdateInput
       // Por ejemplo, usuario_creacion nunca debe ir en un update.
       delete inputData.usuario_creacion
    }

    props.onSave(inputData, props?.clusterNodo?.id)
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: 2 }}>
      
      <Card elevation={3} sx={{ borderRadius: 4, overflow: 'visible' }}>
        
        {/* --- HEADER --- */}
        <Box sx={{ 
            px: 5, py: 4, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff',
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
          }}>
            <Avatar sx={{
                  width: 48, height: 48,
                  background: canEdit 
                    ? 'linear-gradient(135deg, #1565C0, #7B1FA2)' 
                    : 'linear-gradient(135deg, #757575, #9E9E9E)',
                  color: 'white', boxShadow: 3
                }}>
              {!canEdit ? <LockIcon /> : (isEdit ? <EditIcon /> : <AddIcon />)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight={800} sx={{
                  lineHeight: 1.2,
                  background: canEdit 
                    ? 'linear-gradient(90deg, #1565C0 0%, #7B1FA2 100%)'
                    : 'linear-gradient(90deg, #616161 0%, #9e9e9e 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                {isEdit ? 'Editar Nodo' : 'Nuevo Nodo'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {!canEdit 
                  ? 'Este nodo es gestionado automáticamente por el sistema y no puede ser modificado.' 
                  : (isEdit ? 'Modificar configuración del nodo' : 'Registrar nuevo nodo en el cluster')}
              </Typography>
            </Box>
        </Box>

        {/* --- ALERTA DE MODO LECTURA --- */}
        {!canEdit && (
          <Box sx={{ px: 5, pb: 2 }}>
            <Alert severity="info" variant="outlined" icon={<LockIcon fontSize="inherit" />}>
              <strong>Modo Lectura:</strong> Este registro no posee la llave <em>"manual:"</em>. Su edición está restringida para proteger la integridad del Cluster.
            </Alert>
          </Box>
        )}

        {/* --- CONTENIDO DEL FORMULARIO --- */}
        <Box sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          <Form formMethods={formMethods} onSubmit={onSubmit} error={props.error}>
            
            <FormError error={props.error} wrapperClassName="rw-form-error-wrapper" titleClassName="rw-form-error-title" listClassName="rw-form-error-list" />
            
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
                          disabled={!canEdit}
                          options={props.clusters || []} 
                          
                          getOptionLabel={(option) => {
                            const codigo = option.cod_tipo_cluster
                            const nombreTipo = mapaTiposCluster[codigo]
                            return nombreTipo 
                              ? `${option.nombre} (${nombreTipo})` 
                              : `${option.nombre} (${codigo})`
                          }}

                          value={props.clusters?.find((c) => c.id === value) || null}
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
                      render={({ field: { onChange, value, ...field } }) => (
                        <TextField 
                            {...field}
                            value={value}
                            disabled={!canEdit}
                            onChange={(e) => onChange(sanitizeInput(e.target.value))}
                            size="small" 
                            fullWidth 
                            placeholder="Ej. worker-node-01" 
                            error={!!errors.nombre}
                            helperText={canEdit ? "Solo letras minúsculas, números y guiones" : ""} 
                        />
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
                  
                  {/* TIPO */}
                  <FormControl component="fieldset">
                     <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Tipo de Infraestructura *</FormLabel>
                     <Controller
                      name="nodoTipo"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup {...field} row>
                          <FormControlLabel 
                            disabled={!canEdit}
                            value="VIRTUAL" 
                            control={<Radio size="small" />} 
                            label="Virtual (VM)" 
                            sx={{ mr: 2 }} 
                          />
                          <FormControlLabel 
                            disabled={!canEdit}
                            value="FISICO" 
                            control={<Radio size="small" />} 
                            label="Físico" 
                          />
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
                              disabled={!canEdit}
                              options={props.maquinas || []}
                              getOptionLabel={(option) => `${option.nombre} - IP: ${option.ip || 'N/A'}`}
                              value={props.maquinas?.find((m) => m.id === value) || null}
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
                              disabled={!canEdit}
                              options={props.servidores || []}
                              getOptionLabel={(option) => `${option.nombre} - IP: ${option.ip_primaria || 'N/A'}`}
                              value={props.servidores?.find((s) => s.id === value) || null}
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
                  
                  {/* IDENTITY KEY */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Identificador (Identity Key)</FormLabel>
                    <Controller
                      name="identity_key"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                            {...field}
                            disabled={true} 
                            size="small" 
                            fullWidth 
                            placeholder={isEdit ? "" : "Se generará automáticamente al guardar"}
                            InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon fontSize="small" color="disabled" />
                                  </InputAdornment>
                                ),
                            }}
                            sx={{ 
                                bgcolor: 'action.hover',
                                '& .MuiInputBase-input': { color: 'text.secondary' }
                            }}
                        />
                      )}
                    />
                  </FormControl>

                  {/* ROL */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Rol en el Cluster</FormLabel>
                    <Controller
                      name="rol"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          disabled={!canEdit}
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

            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined" color="inherit" startIcon={<CancelIcon />}
                onClick={() => navigate(routes.clusterNodos())}
                sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(0, 0, 0, 0.23)' }}
              >
                {canEdit ? 'Cancelar' : 'Volver'}
              </Button>
              
              {canEdit && (
                <LoadingButton
                  type="submit" variant="contained" loading={props.loading} startIcon={<SaveIcon />}
                  sx={{ 
                    background: 'linear-gradient(135deg, #1565C0 0%, #7B1FA2 100%)', boxShadow: 4, px: 4, minWidth: 160, borderRadius: 2, textTransform: 'none', fontWeight: 700
                  }}
                >
                  {props.loading ? 'Guardando...' : 'Guardar'}
                </LoadingButton>
              )}
            </Box>

          </Form>
        </Box>
      </Card>
    </Box>
  )
}

export default ClusterNodoForm