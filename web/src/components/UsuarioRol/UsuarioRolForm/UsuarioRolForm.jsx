import React, { useMemo, useEffect } from 'react'
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
  Info as InfoIcon
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
      nro_documento
      estado
    }
    roles {
      id
      nombre
      cod_tipo_rol
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
    # Necesario para saber qué filtrar
    usuarioRols {
      id
      id_usuario
      id_rol
      id_maquina
      id_sistema
      estado
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
      <CardContent sx={{ p: 3, flexGrow: 1 }}>{children}</CardContent>
    </Card>
  )
}

/* ---------------------------------------------
 * 3. COMPONENTE PRINCIPAL
 * --------------------------------------------- */
const UsuarioRolForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.usuarioRol?.id)

  // 1. Carga de datos
  const { data, loading: loadingData } = useQuery(GET_DATA_FORM)

  // 2. Inicializamos useForm
  const formMethods = useForm({
    defaultValues: {
      id_usuario: props.usuarioRol?.id_usuario || null,
      id_rol: props.usuarioRol?.id_rol || null,
      id_maquina: props.usuarioRol?.id_maquina || null, 
      id_sistema: props.usuarioRol?.id_sistema || null,
    },
  })

  const { control, handleSubmit, formState: { errors }, watch, setValue } = formMethods
  
  const selectedUserId = watch('id_usuario')
  const selectedRoleId = watch('id_rol')

  // --- LÓGICA DE FILTRADO DINÁMICO (Máquinas) ---
  const maquinasOptions = useMemo(() => {
    if (!data?.maquinas) return []
    let available = data.maquinas.filter(m => m.estado === 'ACTIVO')

    if (selectedUserId && selectedRoleId) {
        available = available.filter(machine => {
            const isAssigned = (data.usuarioRols || []).some(assignment => 
                assignment.id_usuario === selectedUserId &&
                assignment.id_rol === selectedRoleId &&
                assignment.id_maquina === machine.id &&
                assignment.estado === 'ACTIVO'
            )
            
            if (isEdit && props.usuarioRol?.id_maquina === machine.id) return true
            return !isAssigned
        })
    }

    return available.map(m => ({
      id: m.id,
      label: `${m.nombre} (${m.ip})`
    })).sort((a, b) => a.label.localeCompare(b.label))
  }, [data, selectedUserId, selectedRoleId, isEdit, props.usuarioRol])


  // --- LÓGICA DE FILTRADO DINÁMICO (Sistemas) ---
  const sistemasOptions = useMemo(() => {
    if (!data?.sistemas) return []
    let available = data.sistemas.filter(s => s.estado === 'ACTIVO')

    if (selectedUserId && selectedRoleId) {
        available = available.filter(system => {
            const isAssigned = (data.usuarioRols || []).some(assignment => 
                assignment.id_usuario === selectedUserId &&
                assignment.id_rol === selectedRoleId &&
                assignment.id_sistema === system.id &&
                assignment.estado === 'ACTIVO'
            )

            if (isEdit && props.usuarioRol?.id_sistema === system.id) return true
            return !isAssigned
        })
    }

    return available.sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [data, selectedUserId, selectedRoleId, isEdit, props.usuarioRol])


  // --- OPCIONES ESTÁTICAS (Usuarios y Roles) ---
  const usuariosOptions = useMemo(() => {
    if (!data?.usuarios) return []
    return data.usuarios
      .filter(u => u.estado === 'ACTIVO')
      .map(u => {
        const nombreCompleto = `${u.primer_apellido} ${u.segundo_apellido || ''}, ${u.nombres}`.trim()
        const ciInfo = u.nro_documento ? ` - CI: ${u.nro_documento}` : ''
        return {
            id: u.id,
            label: `${nombreCompleto}${ciInfo}`, 
            rawName: nombreCompleto,
            ci: u.nro_documento || '-'
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [data])

  const rolesOptions = useMemo(() => 
    data?.roles?.filter(r => r.estado === 'ACTIVO').sort((a, b) => a.nombre.localeCompare(b.nombre)) || [], 
  [data])

  
  // --- LÓGICA DE PERMISOS ---
  const rolAccessMap = useMemo(() => {
    return (data?.roles || []).reduce((map, rol) => {
      const cod = rol.cod_tipo_rol.toUpperCase()
      let allowsMachine = false
      let allowsSystem = false
      // Se asume la lógica de negocio basada en el código (cod_tipo_rol)
      if (cod.startsWith('INFRA_') || cod.startsWith('SO_')) allowsMachine = true
      else if (cod.startsWith('DB_')) allowsSystem = true
      else if (cod.startsWith('SI_')) {
        if (cod === 'SI_SUPERADM' || cod === 'SI_OPS') { allowsMachine = true; allowsSystem = true }
      }
      map[rol.id] = { allowsMachine, allowsSystem }
      return map
    }, {})
  }, [data])

  const currentAccess = rolAccessMap[selectedRoleId] || { allowsMachine: false, allowsSystem: false }
  const canAssignMachine = currentAccess.allowsMachine
  const canAssignSystem = currentAccess.allowsSystem
  
  useEffect(() => {
    // Si el rol ya no permite asignar el recurso, limpiamos el campo
    if (selectedRoleId && !canAssignMachine && watch('id_maquina')) setValue('id_maquina', null)
    if (selectedRoleId && !canAssignSystem && watch('id_sistema')) setValue('id_sistema', null)
  }, [selectedRoleId, canAssignMachine, canAssignSystem, setValue, watch])


  // --- ONSUBMIT ---
  const onSubmit = async (formData) => {
    const basePayload = {
      id_usuario: formData.id_usuario,
      id_rol: formData.id_rol,
      estado: 'ACTIVO',
    }
    
    const maquinaSeleccionada = formData.id_maquina
    const sistemaSeleccionado = formData.id_sistema
    const roleRequiresAssignment = canAssignMachine || canAssignSystem
    const hasSelections = !!maquinaSeleccionada || !!sistemaSeleccionado


    // 1. Validación Requerida por Rol
    if (roleRequiresAssignment && !hasSelections) {
      alert("El rol seleccionado requiere que asigne al menos una Máquina o un Sistema.")
      return
    }

    // 2. Chequeo de duplicados (versión simplificada y segura)
    const checkDuplicate = (mId, sId) => {
       return (data?.usuarioRols || []).some(registro => {
        if (isEdit && registro.id === props.usuarioRol.id) return false
        if (registro.estado !== 'ACTIVO') return false
        return (
          registro.id_usuario === formData.id_usuario &&
          registro.id_rol === formData.id_rol &&
          registro.id_maquina === (mId || null) &&
          registro.id_sistema === (sId || null)
        )
      })
    }
    
    // 3. Lógica de guardado basado en el recurso asignado
    let payloadToSend = null;

    if (sistemaSeleccionado && canAssignSystem) {
      if (checkDuplicate(null, sistemaSeleccionado)) { alert('Error: Asignación de Sistema duplicada.'); return; }
      payloadToSend = { ...basePayload, id_sistema: sistemaSeleccionado, id_maquina: null };
    } else if (maquinaSeleccionada && canAssignMachine) {
        if (checkDuplicate(maquinaSeleccionada, null)) { alert('Error: Asignación de Máquina duplicada.'); return; }
        payloadToSend = { ...basePayload, id_maquina: maquinaSeleccionada, id_sistema: null };
    } else if (!roleRequiresAssignment && !hasSelections) {
         // Rol sin recurso asociado (Rol puro)
         if (checkDuplicate(null, null)) { alert('El usuario ya tiene este rol (sin recurso).'); return; }
         payloadToSend = { ...basePayload, id_maquina: null, id_sistema: null };
    } else {
        // No se seleccionó nada válido (aunque la validación inicial ya lo debería haber capturado)
        alert('Debe asignar un recurso válido o el rol no permite recursos.');
        return;
    }
    
    // 4. Ejecutar guardado
    await props.onSave(payloadToSend, isEdit ? props.usuarioRol.id : undefined)
  }

  if (loadingData) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
  
  return (
    <Box sx={{ width: '100%', maxWidth: 1500, mx: 'auto' }}>
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
        {/* HEADER */}
        <Box sx={{ 
            px: 5, py: 4, 
            bgcolor: theme.palette.background.paper, // Soporte Dark Mode
            borderTopLeftRadius: 16, borderTopRightRadius: 16
          }}>
            <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
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
                  {isEdit ? 'Editar Asignación' : 'Nueva Asignación'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                   Asignar rol y recurso (Filtrado inteligente)
                </Typography>
              </Box>
            </Box>
        </Box>

        <Box 
          component="form" 
          onSubmit={handleSubmit(onSubmit)} 
          noValidate 
          sx={{ 
            px: 5, pb: 5, pt: 0
          }}
        >
          <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
            {props.error && (
                <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#fff4f4', borderColor: 'error.main', color: 'error.main', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                    <ErrorIcon color="error" />
                    <Typography variant="body2" fontWeight={600}>{props.error.message}</Typography>
                </Paper>
            )}

            <SectionCard 
                icon={<InfoIcon sx={{ fontSize: 20 }} />} 
                title="Información de Asignación"
                bgcolor={theme.palette.primary.main}
            >
                <Stack spacing={4}>
                    {/* USUARIO */}
                    <Box>
                         <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary' }}>
                            Usuario *
                         </Typography>
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
                                    autoHighlight
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            size="small"
                                            placeholder="Buscar por nombre o CI..." 
                                            error={!!errors.id_usuario}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <>
                                                        <PersonIcon color="action" fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                                        {params.InputProps.startAdornment}
                                                    </>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            )}
                        />
                    </Box>

                    {/* ROL */}
                    <Box>
                         <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary' }}>
                            Rol a Asignar *
                         </Typography>
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
                                                        <RoleIcon color="action" fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                                        {params.InputProps.startAdornment}
                                                    </>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            )}
                        />
                    </Box>

                    <Divider />

                    {/* SISTEMA */}
                    {canAssignSystem && (
                        <Box>
                             <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary' }}>
                                Acceso a Sistema
                             </Typography>
                             <Controller
                                name="id_sistema"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Autocomplete
                                        options={sistemasOptions}
                                        getOptionLabel={(option) => option.nombre}
                                        value={sistemasOptions.find(s => s.id === value) || null}
                                        onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                                        noOptionsText={sistemasOptions.length === 0 && data?.sistemas?.length > 0 ? "Sin sistemas disponibles (Asignados)" : "Sin opciones"}
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                size="small"
                                                placeholder="Seleccionar un sistema..."
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <>
                                                            <SystemIcon color="action" fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                                            {params.InputProps.startAdornment}
                                                        </>
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Box>
                    )}

                    {/* MÁQUINA */}
                    {canAssignMachine && (
                        <Box>
                             <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary' }}>
                                Acceso a Máquina
                             </Typography>
                             <Controller
                                name="id_maquina"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Autocomplete
                                        options={maquinasOptions}
                                        getOptionLabel={(option) => option.label}
                                        value={maquinasOptions.find(m => m.id === value) || null}
                                        onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                                        noOptionsText={maquinasOptions.length === 0 && data?.maquinas?.length > 0 ? "Sin máquinas disponibles (Asignadas)" : "Sin opciones"}
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                size="small"
                                                placeholder="Seleccionar una máquina..."
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <>
                                                            <MachineIcon color="action" fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                                            {params.InputProps.startAdornment}
                                                        </>
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Box>
                    )}
                    
                    {/* INFO ALERTA */}
                    {!selectedRoleId && (
                        <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                            Seleccione un <strong>Rol</strong> para visualizar los campos de recursos disponibles.
                        </Alert>
                    )}

                </Stack>
            </SectionCard>

            {/* BOTONES (Pill Shape + Colores Estandarizados) */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                    variant="outlined" 
                    startIcon={<CancelIcon />}
                    onClick={() => navigate(routes.usuarioRols())}
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
                    {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Guardar Asignación')}
                </LoadingButton>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

export default UsuarioRolForm