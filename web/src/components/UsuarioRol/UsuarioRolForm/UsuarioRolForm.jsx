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
  CircularProgress,
  Divider,
  Alert
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  AddCircle as AddIcon,
  ErrorOutline as ErrorIcon,
  Person as PersonIcon,
  Badge as RoleIcon,
  Computer as MachineIcon,
  Apps as SystemIcon,
  AdminPanelSettings as AssignIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. QUERIES
 * --------------------------------------------- */
const GET_DATA_FORM = gql`
  query GetDataUsuarioRol {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
      estado
    }
    roles {
      id
      nombre
      estado
    }
    maquinas {
      id
      nombre
      ip
      estado
    }
    sistemas {
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
      />
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>{children}</CardContent>
    </Card>
  )
}

/* ---------------------------------------------
 * 3. COMPONENTE PRINCIPAL
 * --------------------------------------------- */
const UsuarioRolForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.usuarioRol?.id)

  // Carga de datos
  const { data, loading: loadingData } = useQuery(GET_DATA_FORM)

  // Preparación de Opciones
  const usuariosOptions = useMemo(() => {
    if (!data?.usuarios) return []
    return data.usuarios
      .filter(u => u.estado === 'ACTIVO')
      .map(u => ({
        id: u.id,
        label: `${u.primer_apellido} ${u.segundo_apellido || ''}, ${u.nombres}`.trim()
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [data])

  const rolesOptions = useMemo(() => 
    data?.roles?.filter(r => r.estado === 'ACTIVO').sort((a, b) => a.nombre.localeCompare(b.nombre)) || [], 
  [data])

  const maquinasOptions = useMemo(() => 
    data?.maquinas?.filter(m => m.estado === 'ACTIVO').map(m => ({
      id: m.id,
      label: `${m.nombre} (${m.ip})`
    })).sort((a, b) => a.label.localeCompare(b.label)) || [], 
  [data])

  const sistemasOptions = useMemo(() => 
    data?.sistemas?.filter(s => s.estado === 'ACTIVO').sort((a, b) => a.nombre.localeCompare(b.nombre)) || [], 
  [data])

  // Configuración del Formulario
  const formMethods = useForm({
    defaultValues: {
      id_usuario: props.usuarioRol?.id_usuario || null,
      id_rol: props.usuarioRol?.id_rol || null,
      // Manejo de array para múltiples máquinas
      maquinas: props.usuarioRol?.id_maquina 
        ? [props.usuarioRol.id_maquina] 
        : (props.usuarioRol?.maquinas?.map(m => m.id) || []), 
      id_sistema: props.usuarioRol?.id_sistema || null,
    },
  })

  const { control, handleSubmit, formState: { errors } } = formMethods

  // Manejador de Envío
  const onSubmit = async (formData) => {
    const basePayload = {
      id_usuario: formData.id_usuario,
      id_rol: formData.id_rol,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: isEdit ? undefined : 3,
    }

    const maquinasSeleccionadas = formData.maquinas || []
    const sistemaSeleccionado = formData.id_sistema

    // Validación custom: Debe haber al menos un recurso seleccionado
    if (maquinasSeleccionadas.length === 0 && !sistemaSeleccionado) {
      alert("Debe asignar al menos una Máquina o un Sistema.")
      return
    }

    // 1. Guardar Asignación de Sistema (si existe)
    if (sistemaSeleccionado) {
      const payloadSistema = {
        ...basePayload,
        id_sistema: sistemaSeleccionado,
        id_maquina: null,
      }
      await props.onSave(payloadSistema, isEdit && !maquinasSeleccionadas.length ? props.usuarioRol.id : undefined)
    }

    // 2. Guardar Asignaciones de Máquinas (si existen)
    // Nota: Esto creará múltiples registros.
    if (maquinasSeleccionadas.length > 0) {
      for (const maquinaId of maquinasSeleccionadas) {
        const payloadMaquina = {
          ...basePayload,
          id_maquina: maquinaId,
          id_sistema: null
        }
        // En edición simple, usamos el ID existente solo para el primer elemento si coincide,
        // pero para asignación masiva suele ser mejor tratarlo como creaciones nuevas o lógica específica de backend.
        // Aquí enviamos undefined en ID si estamos en un bucle para forzar creaciones nuevas salvo que sea edición unitaria.
        await props.onSave(payloadMaquina, undefined) 
      }
    }
    
    // Si es edición unitaria de un solo registro existente que tenía máquina y ahora cambiamos, 
    // la lógica anterior podría crear nuevos. Esto depende de cómo tu `onSave` maneje el retorno.
  }

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
                {isEdit ? 'Editar Asignación' : 'Nueva Asignación'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Asignar roles y recursos (Máquinas y/o Sistemas)
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

            {/* GRID LAYOUT DE 2 COLUMNAS */}
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              alignItems: 'start'
            }}>
              
              {/* --- CARD 1: USUARIO Y ROL --- */}
              <SectionCard 
                icon={<PersonIcon sx={{ fontSize: 20 }} />} 
                title="Usuario y Rol"
                bgcolor={theme.palette.primary.main}
              >
                <Stack spacing={3}>
                  
                  {/* Usuario */}
                  <FormControl fullWidth error={!!errors.id_usuario}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Usuario *</FormLabel>
                    <Controller
                      name="id_usuario"
                      control={control}
                      rules={{ required: 'Seleccione un usuario' }}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          options={usuariosOptions}
                          getOptionLabel={(option) => option.label}
                          value={usuariosOptions.find(u => u.id === value) || null}
                          onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                          renderInput={(params) => (
                            <TextField {...params} size="small" placeholder="Buscar usuario..." error={!!errors.id_usuario} />
                          )}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Rol */}
                  <FormControl fullWidth error={!!errors.id_rol}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Rol a Asignar *</FormLabel>
                    <Controller
                      name="id_rol"
                      control={control}
                      rules={{ required: 'Seleccione un rol' }}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          options={rolesOptions}
                          getOptionLabel={(option) => option.nombre}
                          value={rolesOptions.find(r => r.id === value) || null}
                          onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              size="small" 
                              placeholder="Seleccionar rol..." 
                              error={!!errors.id_rol}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    <RoleIcon color="action" fontSize="small" sx={{ mr: 1 }} />
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

                  <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                    Seleccione un usuario y un rol, luego asigne los recursos necesarios a la derecha.
                  </Alert>

                </Stack>
              </SectionCard>

              {/* --- CARD 2: RECURSOS ASIGNADOS --- */}
              <SectionCard 
                icon={<AssignIcon sx={{ fontSize: 20 }} />} 
                title="Recursos Disponibles"
                bgcolor={theme.palette.secondary.main}
              >
                <Stack spacing={3}>
                  
                  {/* SECCIÓN SISTEMAS */}
                  <Box>
                    <FormControl fullWidth>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            <SystemIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> 
                            Acceso a Sistema (Opcional)
                        </FormLabel>
                        <Controller
                        name="id_sistema"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Autocomplete
                            options={sistemasOptions}
                            getOptionLabel={(option) => option.nombre}
                            value={sistemasOptions.find(s => s.id === value) || null}
                            onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                            renderInput={(params) => (
                                <TextField 
                                {...params} 
                                size="small" 
                                placeholder="Seleccionar sistema..." 
                                />
                            )}
                            />
                        )}
                        />
                    </FormControl>
                  </Box>

                  <Divider>O</Divider>

                  {/* SECCIÓN MÁQUINAS */}
                  <Box>
                    <FormControl fullWidth>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            <MachineIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> 
                            Acceso a Máquinas (Opcional)
                        </FormLabel>
                        <Controller
                        name="maquinas"
                        control={control}
                        render={({ field: { onChange, value } }) => {
                            const selectedValues = maquinasOptions.filter(m => value.includes(m.id))
                            return (
                            <Autocomplete
                                multiple
                                limitTags={3}
                                options={maquinasOptions}
                                getOptionLabel={(option) => option.label}
                                value={selectedValues}
                                onChange={(_, newValue) => {
                                onChange(newValue.map(v => v.id))
                                }}
                                renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    size="small" 
                                    placeholder={selectedValues.length === 0 ? "Seleccionar máquinas..." : ""}
                                />
                                )}
                                filterSelectedOptions
                            />
                            )
                        }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Puede seleccionar múltiples máquinas simultáneamente.
                        </Typography>
                    </FormControl>
                  </Box>

                </Stack>
              </SectionCard>

            </Box>

            {/* BOTONES */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined" color="inherit" startIcon={<CancelIcon />}
                onClick={() => navigate(routes.usuarioRols())}
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
                {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Guardar Asignación')}
              </LoadingButton>
            </Box>

          </form>
        </Box>
      </Card>
    </Box>
  )
}

export default UsuarioRolForm