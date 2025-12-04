import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { navigate, routes } from '@redwoodjs/router'
import { useAuth } from 'src/auth'

import {
  Box,
  Card,
  CardHeader,
// ... (otras importaciones de MUI)
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Button,
  Stack,
  Divider,
  Paper,
  Autocomplete,
  useTheme,
  CircularProgress,
  CardContent
} from '@mui/material'

import { LoadingButton } from '@mui/lab'

// Iconos
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet'
import MemoryIcon from '@mui/icons-material/Memory'
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import EditIcon from '@mui/icons-material/Edit'
import StorageIcon from '@mui/icons-material/Storage'
import LockIcon from '@mui/icons-material/Lock'

/* ---------------------------------------------
 * 1. QUERIES (Unificadas)
 * --------------------------------------------- */
const GET_FORM_DATA = gql`
  query GetFormDatos {
    servidores {
      id
      nombre
    }
    parametros {
      id
      codigo
      nombre
      grupo
      descripcion
    }
  }
`

/* ----- COMPONENTES AUXILIARES ----- */

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
        title={
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {title}
          </Typography>
        }
        sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent sx={{ p: 2.5 }}>{children}</CardContent>
    </Card>
  )
}

const DiscosEditor = ({ discos, onAdd, onDelete, onUpdate, error }) => {
  const theme = useTheme()
  const sanitizeInput = (v) => (v === '' ? '' : String(Number(String(v).replace(/\D/g, ''))))

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}>
      <Stack spacing={1.5}>
        {discos.map((d, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={<StorageIcon style={{ fontSize: 16, color: 'white' }} />}
              label={`#${d.Disco}`}
              size="small"
              sx={{ 
                minWidth: 60, 
                fontWeight: 700, 
                bgcolor: theme.palette.text.secondary, 
                color: 'white' 
              }}
            />

            <TextField
              size="small"
              type="text"
              value={d.Valor === 0 ? '' : d.Valor}
              onChange={(e) => onUpdate(i, sanitizeInput(e.target.value))}
              placeholder="0"
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ fontWeight: 'bold' }}>GB</Typography></InputAdornment>,
              }}
              sx={{ bgcolor: '#fff' }}
            />

            {discos.length > 1 && (
              <IconButton size="small" color="error" onClick={() => onDelete(i)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
      </Stack>

      <Button 
          fullWidth
          size="small" 
          startIcon={<AddCircleOutlineIcon />} 
          onClick={onAdd}
          sx={{ mt: 1.5, textTransform: 'none', borderStyle: 'dashed' }}
          variant="outlined"
      >
        Añadir Disco
      </Button>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Paper>
  )
}

/* ----- VALORES INICIALES ----- */
const getDefaultFormValues = () => ({
  nombre: '',
  ip: '',
  so: '',
  ram: '',
  cpu: '',
  cod_plataforma: '',
  estado: 'ACTIVO',
  estado_operativo: '', 
  id_servidor: '',
  proxmox_vmid: '',
  uuid: '',
  identity_key: '',
})

/* ----- FORM PRINCIPAL ----- */
const MaquinaForm = ({ maquina, onSave, loading: loadingSave, error: errorSave }) => {
  const theme = useTheme()
  const isEditMode = Boolean(maquina?.id)
  const { currentUser } = useAuth() // <-- USAR useAuth PARA OBTENER EL USUARIO LOGUEADO

  // Determinar el ID del usuario actual. Usamos 1 como fallback si no hay usuario (solo para desarrollo/testing).
  const currentUserId = currentUser?.id ? Number(currentUser.id) : 1
  

  // --- 1. CARGA DE DATOS ---
  const { data: remoteData, loading: loadingData } = useQuery(GET_FORM_DATA)
  
  const listaServidores = remoteData?.servidores || []
  const listaParametros = remoteData?.parametros || []

  // --- 2. FILTROS ---
  const plataformas = useMemo(() => 
    listaParametros.filter((p) => p.grupo === 'PLATAFORMA'), 
  [listaParametros])

  const estadosOperativos = useMemo(() => 
    listaParametros.filter((p) => p.grupo === 'ESTADO_OPERATIVO'), 
  [listaParametros])


  // --- ESTADOS LOCALES ---
  const [formValues, setFormValues] = useState(getDefaultFormValues())
  const [selectedSO, setSelectedSO] = useState('')
  const [soVersion, setSoVersion] = useState('')
  const [discos, setDiscos] = useState([{ Disco: 1, Valor: '' }])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // --- LÓGICA DE IDENTIFICADOR BLOQUEADO ---
  const isIdentityLocked = useMemo(() => {
    if (!formValues.identity_key) return false
    return formValues.identity_key.startsWith('proxmox:') || formValues.identity_key.startsWith('sync:')
  }, [formValues.identity_key])

  /* ----- RESET & INIT ----- */
  const resetForm = useCallback(() => {
    setFormValues(getDefaultFormValues())
    setSelectedSO('')
    setSoVersion('')
    setDiscos([{ Disco: 1, Valor: '' }])
    setErrors({})
  }, [])

  useEffect(() => {
    if (!isEditMode) {
      if (!isInitialized) {
        resetForm()
        setIsInitialized(true)
      }
      return
    }

    setFormValues({
      nombre: maquina.nombre ?? '',
      ip: maquina.ip ?? '',
      so: maquina.so ?? '',
      ram: maquina.ram ?? '',
      cpu: maquina.cpu ?? '',
      cod_plataforma: maquina.cod_plataforma ?? '',
      estado: maquina.estado ?? 'ACTIVO',
      estado_operativo: maquina.estado_operativo ?? '',
      id_servidor: maquina.id_servidor ?? '',
      proxmox_vmid: maquina.proxmox_vmid ?? '',
      uuid: maquina.uuid ?? '',
      identity_key: maquina.identity_key ?? '',
    })

    if (maquina.so) {
      const parts = String(maquina.so).split(' ')
      setSelectedSO(parts[0])
      setSoVersion(parts.slice(1).join(' '))
    }

    let discosInput = maquina.almacenamiento
    if (typeof discosInput === 'string') {
      try { discosInput = JSON.parse(discosInput) } catch { discosInput = [] }
    }
    if (!Array.isArray(discosInput)) discosInput = []

    setDiscos(
      discosInput.length > 0
        ? discosInput.map((d, idx) => ({
            Disco: d.Disco ?? idx + 1,
            Valor: d.Valor != null ? String(d.Valor) : '',
          }))
        : [{ Disco: 1, Valor: '' }]
    )

    setIsInitialized(true)
  }, [maquina, isEditMode, isInitialized, resetForm])

  /* ----- HANDLERS ----- */
  const validateIP = (ip) => {
    if (!ip) return ''
    const ipv4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipv4.test(ip) ? '' : 'IP inválida'
  }

  const validateForm = () => {
    const e = {}
    if (!formValues.nombre.trim()) e.nombre = 'Requerido'
    if (!formValues.cod_plataforma) e.cod_plataforma = 'Requerido'
    if (!formValues.cpu) e.cpu = 'Requerido'
    if (!formValues.ram) e.ram = 'Requerido'
    const ipErr = validateIP(formValues.ip)
    if (ipErr) e.ip = ipErr
    const soFull = `${selectedSO} ${soVersion}`.trim()
    if (!soFull) e.so = 'Requerido'
    if (discos.some((d) => !d.Valor || Number(d.Valor) < 1)) e.discos = 'Tamaño inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleFieldChange = (field, value) => {
    // Si la clave no es identity_key, se permite actualizar el estado
    if (field !== 'identity_key') {
        setFormValues((prev) => ({ ...prev, [field]: value }))
    }
    
    // Lógica de errores
    if (field === 'ip') setErrors((prev) => ({ ...prev, ip: validateIP(value) }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // Funciones Discos
  const agregarDisco = () => setDiscos((prev) => [...prev, { Disco: prev.length + 1, Valor: '' }])
  const eliminarDisco = (idx) => setDiscos((prev) => prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, Disco: i + 1 })))
  const actualizarDisco = (idx, val) => setDiscos((prev) => prev.map((d, i) => (i === idx ? { ...d, Valor: val } : d)))

  /**
   * CORRECCIÓN PRINCIPAL
   * 1. Asegura que identity_key sea una cadena vacía en modo creación (para satisfacer String!).
   * 2. Usa currentUserId para los campos de auditoría.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
        const almacenamiento = discos.map((d, idx) => ({ Disco: idx + 1, Valor: Number(d.Valor) }))
        
        // 1. Aseguramos que identity_key sea una cadena vacía si no estamos editand

        const payload = {
            ...formValues,

            nombre: formValues.nombre.trim(),
            ram: Number(formValues.ram),
            cpu: Number(formValues.cpu),
            so: `${selectedSO} ${soVersion}`.trim(),
            almacenamiento,
            id_servidor: formValues.id_servidor ? Number(formValues.id_servidor) : null,
            proxmox_vmid: formValues.proxmox_vmid ? Number(formValues.proxmox_vmid) : null,
            
            // 2. INCLUIR USUARIO LOGUEADO
            usuario_modificacion: isEditMode ? currentUserId : undefined,
            usuario_creacion: isEditMode ? undefined : currentUserId,
        }
        
        await onSave(payload, isEditMode ? maquina.id : undefined)
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <Box sx={{  width: '100%', maxWidth: 1500, mx: 'auto' }}>
      
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderTop: 'none',
          borderRadius:2,
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
              {isEditMode ? <EditIcon /> : <AddCircleOutlineIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, color: '#000', mb: 0.5 }}>
                {isEditMode ? 'Editar Máquina Virtual' : 'Crear Máquina Virtual'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditMode ? 'Modificar parámetros de la VM' : 'Provisionamiento de nueva infraestructura'}
              </Typography>
            </Box>
        </Box>

        {/* CONTENIDO PRINCIPAL */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>

          {(errorSave) && (
            <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
              <ErrorOutlineIcon color="error" />
              <Typography variant="body2" fontWeight={600}>{String(errorSave)}</Typography>
            </Paper>
          )}

          {/* GRID DE 3 COLUMNAS */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: 3,
            alignItems: 'start'
          }}>

            {/* --- CARD 1: IDENTIFICACIÓN --- */}
            <SectionCard title="Identificación y Host" icon={<FingerprintIcon />} color={theme.palette.primary.main}>
              <Stack spacing={2.5}>
                
                <FormControl fullWidth error={!!errors.nombre}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre de la VM *</FormLabel>
                  <TextField 
                    size="small" 
                    value={formValues.nombre} 
                    onChange={(e) => handleFieldChange('nombre', e.target.value)}
                    placeholder="Ej. SRV-WEB-01" 
                  />
                  {errors.nombre && <FormHelperText>{errors.nombre}</FormHelperText>}
                </FormControl>

                {/* FILA: SERVIDOR + VMID */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
                    
                    <FormControl fullWidth error={!!errors.id_servidor}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Servidor Host *</FormLabel>
                        <Autocomplete
                            disablePortal
                            id="combo-box-servidores"
                            options={listaServidores}
                            getOptionLabel={(option) => option.nombre || ''}
                            loading={loadingData}
                            value={listaServidores.find(s => s.id === formValues.id_servidor) || null}
                            onChange={(event, newValue) => {
                                handleFieldChange('id_servidor', newValue ? newValue.id : '')
                            }}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    size="small" 
                                    placeholder={loadingData ? "Cargando..." : "Buscar servidor..."}
                                    error={!!errors.id_servidor}
                                    InputProps={{
                                      ...params.InputProps,
                                      endAdornment: (
                                        <>
                                          {loadingData ? <CircularProgress color="inherit" size={20} /> : null}
                                          {params.InputProps.endAdornment}
                                        </>
                                      ),
                                    }}
                                />
                            )}
                            noOptionsText="Sin resultados"
                        />
                        {errors.id_servidor && <FormHelperText>{errors.id_servidor}</FormHelperText>}
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>VMID</FormLabel>
                        <TextField 
                          size="small" 
                          type="number" 
                          value={formValues.proxmox_vmid} 
                          onChange={(e) => handleFieldChange('proxmox_vmid', e.target.value)}
                        />
                    </FormControl>
                </Box>

                {/* IDENTIFICADOR (SOLO LECTURA) */}
                <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Identificador (Key)</FormLabel>
                    <TextField 
                      size="small" 
                      value={formValues.identity_key || (isEditMode ? 'No disponible' : 'Se generará al guardar...')} 
                      // Se desactiva y se pone en modo solo lectura
                      disabled={true} 
                      InputProps={{ 
                        readOnly: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                {isIdentityLocked ? <LockIcon fontSize="small" color="disabled" /> : <LinkIcon fontSize="small" color="disabled" />}
                            </InputAdornment>
                        ),
                        // Estilo visual de solo lectura
                        style: { backgroundColor: '#f5f5f5', color: '#777' }
                      }} 
                      helperText={
                        isEditMode 
                          ? (isIdentityLocked ? "Clave de sincronización externa (No editable)." : "Clave única generada por la base de datos (No editable).") 
                          : "La clave final (manual:nombre:id) se genera automáticamente al guardar."
                      }
                    />
                </FormControl>

              </Stack>
            </SectionCard>

            {/* --- CARD 2: SISTEMA Y RED --- */}
            <SectionCard title="Sistema y Red" icon={<SettingsEthernetIcon />} color={theme.palette.secondary.main}>
              <Stack spacing={2.5}>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <FormControl fullWidth error={!!errors.cod_plataforma}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Plataforma *</FormLabel>
                        <Select
                          size="small"
                          value={formValues.cod_plataforma}
                          onChange={(e) => handleFieldChange('cod_plataforma', e.target.value)}
                          displayEmpty
                          disabled={loadingData}
                        >
                          <MenuItem value="">
                            <em>{loadingData ? 'Cargando...' : 'Seleccionar...'}</em>
                          </MenuItem>
                          {plataformas.map((p) => (
                            <MenuItem key={p.codigo} value={p.codigo}>{p.nombre}</MenuItem>
                          ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Estado Operativo</FormLabel>
                        <Select
                          size="small"
                          value={formValues.estado_operativo}
                          onChange={(e) => handleFieldChange('estado_operativo', e.target.value)}
                          displayEmpty
                          disabled={loadingData}
                        >
                          <MenuItem value="">
                            <em>{loadingData ? 'Cargando...' : 'Seleccionar...'}</em>
                          </MenuItem>
                          {estadosOperativos.map((estado) => (
                            <MenuItem key={estado.codigo} value={estado.codigo}>
                                {estado.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                    </FormControl>
                </Box>
                
                <FormControl fullWidth error={!!errors.ip}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Dirección IP</FormLabel>
                  <TextField
                    size="small"
                    value={formValues.ip}
                    onChange={(e) => handleFieldChange('ip', e.target.value)}
                    placeholder="192.168.x.x"
                    InputProps={{ startAdornment: <InputAdornment position="start"><NetworkCheckIcon fontSize="small" /></InputAdornment> }}
                  />
                  {errors.ip && <FormHelperText>{errors.ip}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={!!errors.so}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Sistema Operativo *</FormLabel>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Select sx={{ width: '40%' }} size="small" value={selectedSO} onChange={(e) => setSelectedSO(e.target.value)} displayEmpty>
                      <MenuItem value=""><em>SO...</em></MenuItem>
                      <MenuItem value="Debian">Debian</MenuItem>
                      <MenuItem value="Ubuntu">Ubuntu</MenuItem>
                      <MenuItem value="CentOS">CentOS</MenuItem>
                      <MenuItem value="Windows">Windows</MenuItem>
                    </Select>

                    <TextField
                      sx={{ width: '60%' }}
                      size="small"
                      placeholder="Ver."
                      value={soVersion}
                      onChange={(e) => setSoVersion(e.target.value)}
                    />
                  </Box>
                  {errors.so && <FormHelperText>{errors.so}</FormHelperText>}
                </FormControl>

              </Stack>
            </SectionCard>

            {/* --- CARD 3: HARDWARE --- */}
            <SectionCard title="Hardware y Storage" icon={<MemoryIcon />} color="#2e7d32">
              <Stack spacing={2.5}>

                {/* CPU y RAM lado a lado */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    
                    <FormControl fullWidth error={!!errors.cpu}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>vCPUs *</FormLabel>
                        <TextField 
                            type="number" 
                            size="small" 
                            value={formValues.cpu} 
                            onChange={(e) => handleFieldChange('cpu', e.target.value)} 
                        />
                    </FormControl>

                    <FormControl fullWidth error={!!errors.ram}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>RAM (GB) *</FormLabel>
                        <TextField 
                            type="number" 
                            size="small" 
                            value={formValues.ram} 
                            onChange={(e) => handleFieldChange('ram', e.target.value)} 
                        />
                    </FormControl>

                </Box>

                <Divider />

                <Box>
                  <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 600 }}>Discos Virtuales *</FormLabel>
                  <DiscosEditor discos={discos} onAdd={agregarDisco} onDelete={eliminarDisco} onUpdate={actualizarDisco} error={errors.discos} />
                </Box>

              </Stack>
            </SectionCard>

          </Box>

          {/* BOTONES ACCIÓN */}
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CancelIcon />}
              onClick={() => navigate(routes.maquinas())}
              sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(0, 0, 0, 0.23)' }}
            >
              Cancelar
            </Button>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={loadingSave || isSubmitting}
              startIcon={<SaveIcon />}
              sx={{ 
                background: 'linear-gradient(135deg, #1565C0 0%, #7B1FA2 100%)',
                boxShadow: 4, px: 4, minWidth: 160, borderRadius: 2, textTransform: 'none', fontWeight: 700
              }}
            >
              {isEditMode ? 'Guardar Cambios' : 'Registrar Máquina'}
            </LoadingButton>
          </Box>

        </Box>
      </Card>
    </Box>
  )
}

export default MaquinaForm