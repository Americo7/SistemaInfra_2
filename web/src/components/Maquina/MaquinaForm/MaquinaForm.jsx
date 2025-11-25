import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import {
  Box, Paper, Typography, TextField, Select, MenuItem,
  FormControl, FormLabel, FormHelperText, InputAdornment,
  IconButton, Chip, Avatar, Button, Stack, Divider, useTheme,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import ComputerIcon from '@mui/icons-material/Computer'
import MemoryIcon from '@mui/icons-material/Memory'
import StorageIcon from '@mui/icons-material/Storage'
import DnsIcon from '@mui/icons-material/Dns'
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DevicesOtherIcon from '@mui/icons-material/DevicesOther'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import LinkIcon from '@mui/icons-material/Link'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import Storage from '@mui/icons-material/Storage'

// El Query de Parámetros ya no es necesario aquí porque se pasan como props
// desde el EditMaquinaCell / NewMaquinaCell.
// Pero si lo necesitas por alguna razón local:
const GET_ESTADOS = gql`
  query GetEstadosEnum {
    __type(name: "estado") {
      enumValues { name }
    }
  }
`

const SectionCard = ({ title, icon, children }) => (
  <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
      {icon}
      <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
    </Box>
    {children}
  </Paper>
)

const DiscosEditor = ({ discos, onAdd, onDelete, onUpdate, error }) => {
  const theme = useTheme()
  const sanitizeInput = (v) => {
    if (v === '') return ''
    const digits = String(v).replace(/\D/g, '')
    return digits === '' ? '' : String(Number(digits))
  }

  return (
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
      {discos.map((d, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: i < discos.length - 1 ? 1 : 0 }}>
          <Chip
            avatar={<Avatar sx={{ bgcolor: theme.palette.primary.main, color: '#fff' }}>{d.Disco}</Avatar>}
            label={`Disco ${d.Disco}`}
            size="small"
            sx={{ width: 100 }}
          />
          <TextField
            size="small"
            type="text"
            value={d.Valor === 0 ? '' : d.Valor}
            onChange={(e) => onUpdate(i, sanitizeInput(e.target.value))}
            placeholder="0"
            InputProps={{
              startAdornment: <InputAdornment position="start"><StorageIcon /></InputAdornment>,
              endAdornment: <InputAdornment position="end">GB</InputAdornment>,
            }}
            sx={{ flex: 1 }}
          />
          {discos.length > 1 && (
            <IconButton size="small" color="error" onClick={() => onDelete(i)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ))}
      <Box sx={{ mt: 1 }}>
        <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={onAdd}>
          Añadir disco
        </Button>
        {error && <FormHelperText error>{error}</FormHelperText>}
      </Box>
    </Paper>
  )
}

// Valores iniciales por defecto
const getDefaultFormValues = () => ({
  nombre: '',
  ip: '',
  so: '',
  ram: '',
  cpu: '',
  cod_plataforma: '',
  estado: 'ACTIVO',
  id_servidor: '', // String vacío para el select

  // Campos nuevos
  proxmox_vmid: '',
  uuid: '',
  mac_address: ''
})

const MaquinaForm = ({ maquina, onSave, loading, error, servidores = [], parametros = [] }) => {
  const theme = useTheme()
  const isEditMode = Boolean(maquina?.id)

  const [formValues, setFormValues] = useState(getDefaultFormValues())
  const [selectedSO, setSelectedSO] = useState('')
  const [soVersion, setSoVersion] = useState('')
  const [discos, setDiscos] = useState([{ Disco: 1, Valor: '' }])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const { data: estadosData, loading: estadosLoading } = useQuery(GET_ESTADOS)

  const estadosEnum = useMemo(
    () => estadosData?.__type?.enumValues?.map((e) => e.name) || [],
    [estadosData]
  )

  // Filtrar plataformas desde las props
  const plataformas = useMemo(
    () => parametros.filter(p => p.grupo === 'PLATAFORMA'),
    [parametros]
  )

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    setFormValues(getDefaultFormValues())
    setSelectedSO('')
    setSoVersion('')
    setDiscos([{ Disco: 1, Valor: '' }])
    setErrors({})
  }, [])

  // Cargar datos cuando esté en edición
  useEffect(() => {
    if (estadosLoading) return

    if (!isEditMode) {
      if (!isInitialized) {
        resetForm()
        setIsInitialized(true)
      }
      return
    }

    // Modo edición: cargar datos de la máquina
    setFormValues({
      nombre: maquina.nombre ?? '',
      ip: maquina.ip ?? '',
      so: maquina.so ?? '',
      ram: maquina.ram ?? '',
      cpu: maquina.cpu ?? '',
      cod_plataforma: maquina.cod_plataforma ?? '',
      estado: maquina.estado ?? 'ACTIVO',
      id_servidor: maquina.id_servidor ?? '',

      // Cargar campos nuevos
      proxmox_vmid: maquina.proxmox_vmid ?? '',
      uuid: maquina.uuid ?? '',
      mac_address: maquina.mac_address ?? ''
    })

    // Split SO -> selectedSO + soVersion
    if (maquina.so) {
      const parts = String(maquina.so).split(' ')
      setSelectedSO(parts[0] ?? '')
      setSoVersion(parts.slice(1).join(' ') ?? '')
    } else {
      setSelectedSO('')
      setSoVersion('')
    }

    // Almacenamiento
    let discosInput = maquina.almacenamiento
    if (typeof discosInput === 'string') {
      try { discosInput = JSON.parse(discosInput) } catch { discosInput = [] }
    }
    if (!Array.isArray(discosInput)) discosInput = []

    setDiscos(
      discosInput.length > 0
        ? discosInput.map((d, idx) => ({
            Disco: d?.Disco ?? idx + 1,
            Valor: d?.Valor != null ? String(d.Valor) : '',
          }))
        : [{ Disco: 1, Valor: '' }]
    )

    setIsInitialized(true)
  }, [maquina, estadosLoading, isEditMode, resetForm, isInitialized])

  // Reset isInitialized cuando cambia maquina
  useEffect(() => {
    setIsInitialized(false)
  }, [maquina?.id])

  const cleanNombre = (v) => (v || '').trim().replace(/[\u200B-\u200D\uFEFF]/g, '').slice(0, 50)

  const validateIP = (ip) => {
    if (!ip) return '' // IP es opcional ahora
    const ipv4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipv4.test(ip) ? '' : 'IP inválida'
  }

  const validateForm = () => {
    const e = {}
    if (!formValues.nombre?.trim()) e.nombre = 'El nombre es requerido'
    if ((formValues.nombre || '').length > 50) e.nombre = 'Máximo 50 caracteres'

    const ipErr = validateIP(formValues.ip)
    if (ipErr) e.ip = ipErr

    const soFull = selectedSO && soVersion ? `${selectedSO} ${soVersion}` : ''
    if (!soFull) e.so = 'El sistema operativo es requerido'

    if (!formValues.ram) e.ram = 'La RAM es requerida'
    if (!formValues.cpu) e.cpu = 'Los CPUs son requeridos'
    if (!formValues.cod_plataforma) e.cod_plataforma = 'La plataforma es requerida'
    if (!formValues.id_servidor) e.id_servidor = 'El servidor host es requerido'

    const discosInvalidos = discos.some((d) => d.Valor === '' || Number(d.Valor) < 1)
    if (discosInvalidos) e.discos = 'Todos los discos deben tener un valor mayor a 0'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const agregarDisco = () => setDiscos((d) => [...d, { Disco: d.length + 1, Valor: '' }])
  const eliminarDisco = (idx) => setDiscos((d) => {
    if (d.length <= 1) return d
    return d.filter((_, i) => i !== idx).map((x, i) => ({ ...x, Disco: i + 1 }))
  })
  const actualizarDisco = (idx, val) => setDiscos((d) => d.map((x, i) => (i === idx ? { ...x, Valor: val } : x)))

  const handleFieldChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
    if (name === 'ip') {
      setErrors((prev) => ({ ...prev, ip: validateIP(value) }))
    }
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (!validateForm()) {
        setIsSubmitting(false)
        return
      }

      const almacenamientoNormalizado = discos
        .filter((d) => d.Valor !== '' && Number(d.Valor) > 0)
        .map((d, idx) => ({ Disco: idx + 1, Valor: Number(d.Valor) }))

      // Payload FINAL
      const payload = {
        // ❌ Eliminado: codigo
        nombre: cleanNombre(formValues.nombre),
        ip: formValues.ip || null,
        so: `${selectedSO} ${soVersion}`.trim(),
        ram: Number(formValues.ram),
        cpu: Number(formValues.cpu),
        cod_plataforma: formValues.cod_plataforma,
        estado: formValues.estado || 'ACTIVO',
        almacenamiento: almacenamientoNormalizado,
        // ❌ Eliminado: es_virtual (Siempre true implícitamente en backend si se necesita)
        id_servidor: formValues.id_servidor ? Number(formValues.id_servidor) : null,

        // ✔ Campos Nuevos
        proxmox_vmid: formValues.proxmox_vmid ? Number(formValues.proxmox_vmid) : null,
        uuid: formValues.uuid || null,
        mac_address: formValues.mac_address || null,
      }

      if (typeof onSave === 'function') {
        if (isEditMode) {
          payload.usuario_modificacion = 1 // O el ID del usuario actual
          await onSave(payload, maquina.id)
        } else {
          payload.usuario_creacion = 1 // O el ID del usuario actual
          await onSave(payload)
        }
      }
    } catch (err) {
      console.error('Error al guardar:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (estadosLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Cargando formulario...</Typography>
      </Paper>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Paper elevation={2} sx={{ p: 3, px: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          {isEditMode ? (
            <DevicesOtherIcon fontSize="large" color="primary" />
          ) : (
            <AddCircleOutlineIcon fontSize="large" color="primary" />
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {isEditMode ? `Editar Máquina: ${maquina.nombre || ''}` : 'Crear Máquina'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete los datos de la VM y su vinculación
            </Typography>
          </Box>
        </Box>

        {error && (
          <Paper variant="outlined" sx={{ p: 1, mb: 2, backgroundColor: theme.palette.error.light, color: theme.palette.error.contrastText, display: 'flex', gap: 1, alignItems: 'center' }}>
            <ErrorOutlineIcon />
            <Typography variant="body2">{error?.message || String(error)}</Typography>
          </Paper>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, '@media(max-width:1100px)': { gridTemplateColumns: '1fr' } }}>

          {/* Columna 1: Información Básica e Identidad */}
          <SectionCard title="Información e Identidad" icon={<ComputerIcon />}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>

              {/* Nombre */}
              <FormControl fullWidth error={!!errors.nombre}>
                <FormLabel>Nombre VM *</FormLabel>
                <TextField name="nombre" size="small" value={formValues.nombre} onChange={(e) => handleFieldChange('nombre', e.target.value)} />
                {errors.nombre && <FormHelperText error>{errors.nombre}</FormHelperText>}
              </FormControl>

              {/* Servidor Host */}
              <FormControl fullWidth error={!!errors.id_servidor}>
                <FormLabel>Servidor Físico (Host) *</FormLabel>
                <Select
                  size="small"
                  value={formValues.id_servidor || ''}
                  onChange={(e) => handleFieldChange('id_servidor', e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">Seleccionar Host...</MenuItem>
                  {servidores.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
                  ))}
                </Select>
                {errors.id_servidor && <FormHelperText error>{errors.id_servidor}</FormHelperText>}
              </FormControl>

              {/* Identificadores de Sync */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <FormControl fullWidth>
                  <FormLabel>Proxmox ID</FormLabel>
                  <TextField size="small" type="number" value={formValues.proxmox_vmid} onChange={(e) => handleFieldChange('proxmox_vmid', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><DnsIcon fontSize="small" /></InputAdornment> }}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <FormLabel>MAC Address</FormLabel>
                  <TextField size="small" value={formValues.mac_address} onChange={(e) => handleFieldChange('mac_address', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon fontSize="small" /></InputAdornment> }}
                  />
                </FormControl>
              </Box>

              <FormControl fullWidth>
                <FormLabel>UUID</FormLabel>
                <TextField size="small" value={formValues.uuid} onChange={(e) => handleFieldChange('uuid', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><VpnKeyIcon fontSize="small" /></InputAdornment> }}
                />
              </FormControl>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <FormControl fullWidth error={!!errors.estado}>
                  <FormLabel>Estado</FormLabel>
                  <Select size="small" value={formValues.estado || ''} onChange={(e) => handleFieldChange('estado', e.target.value)}>
                    {estadosEnum.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl fullWidth error={!!errors.cod_plataforma}>
                  <FormLabel>Plataforma *</FormLabel>
                  <Select name="cod_plataforma" size="small" value={formValues.cod_plataforma || ''} onChange={(e) => handleFieldChange('cod_plataforma', e.target.value)}>
                    <MenuItem value="">Seleccionar…</MenuItem>
                    {plataformas.map((p) => (
                      <MenuItem key={p.codigo} value={p.codigo}>{p.nombre}</MenuItem>
                    ))}
                  </Select>
                  {errors.cod_plataforma && <FormHelperText error>{errors.cod_plataforma}</FormHelperText>}
                </FormControl>
              </Box>

            </Box>
          </SectionCard>

          {/* Columna 2: Especificaciones */}
          <SectionCard title="Recursos y Red" icon={<MemoryIcon />}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>

              <FormControl fullWidth error={!!errors.ip}>
                <FormLabel>Dirección IP</FormLabel>
                <TextField name="ip" size="small" value={formValues.ip} onChange={(e) => handleFieldChange('ip', e.target.value)} placeholder="192.168.x.x"
                  InputProps={{ startAdornment: <InputAdornment position="start"><NetworkCheckIcon /></InputAdornment> }}
                />
                {errors.ip && <FormHelperText error>{errors.ip}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth error={!!errors.so}>
                <FormLabel>Sistema operativo *</FormLabel>
                <Box sx={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr', gap: 1 }}>
                  <Select size="small" value={selectedSO} onChange={(e) => setSelectedSO(e.target.value)} displayEmpty>
                    <MenuItem value="">Seleccionar</MenuItem>
                    <MenuItem value="Debian">Debian</MenuItem>
                    <MenuItem value="Ubuntu">Ubuntu</MenuItem>
                    <MenuItem value="CentOS">CentOS</MenuItem>
                    <MenuItem value="RedHat">RedHat</MenuItem>
                    <MenuItem value="Windows">Windows</MenuItem>
                  </Select>
                  <TextField size="small" placeholder="Versión (ej: 22.04)" value={soVersion} onChange={(e) => setSoVersion(e.target.value)} />
                </Box>
                {errors.so && <FormHelperText error>{errors.so}</FormHelperText>}
              </FormControl>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <FormControl fullWidth error={!!errors.cpu}>
                  <FormLabel>vCPUs *</FormLabel>
                  <TextField name="cpu" type="number" size="small" value={formValues.cpu} onChange={(e) => handleFieldChange('cpu', e.target.value)} InputProps={{ inputProps: { min: 1 } }} />
                  {errors.cpu && <FormHelperText error>{errors.cpu}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={!!errors.ram}>
                  <FormLabel>RAM (GB) *</FormLabel>
                  <TextField name="ram" type="number" size="small" value={formValues.ram} onChange={(e) => handleFieldChange('ram', e.target.value)} InputProps={{ inputProps: { min: 1 } }} />
                  {errors.ram && <FormHelperText error>{errors.ram}</FormHelperText>}
                </FormControl>
              </Box>

              <Divider sx={{ my: 1 }} />
              <FormLabel sx={{ mb: 1 }}>Discos Virtuales</FormLabel>
              <DiscosEditor discos={discos} onAdd={agregarDisco} onDelete={eliminarDisco} onUpdate={actualizarDisco} error={errors.discos} />
            </Box>
          </SectionCard>
        </Box>

        {/* Botonera */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <LoadingButton type="submit" variant="contained" startIcon={<CheckCircleOutlineIcon />} loading={loading || isSubmitting} sx={{ textTransform: 'none', fontWeight: 700 }}>
            {loading || isSubmitting ? 'Guardando…' : 'Guardar'}
          </LoadingButton>
          <Button variant="outlined" onClick={resetForm}>Reset</Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default MaquinaForm