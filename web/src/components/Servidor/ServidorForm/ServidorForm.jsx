import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
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
  MenuItem,
  InputAdornment,
  FormHelperText,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import DnsIcon from '@mui/icons-material/Dns'
import StorageIcon from '@mui/icons-material/Storage'
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import QrCodeIcon from '@mui/icons-material/QrCode'
import BusinessIcon from '@mui/icons-material/Business'
import MemoryIcon from '@mui/icons-material/Memory'
import LanIcon from '@mui/icons-material/Lan'
import ComputerIcon from '@mui/icons-material/Computer'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import LinkIcon from '@mui/icons-material/Link' // Usado en MaquinaForm, se mantiene si es necesario
import LockIcon from '@mui/icons-material/Lock' // Usado en MaquinaForm, se mantiene si es necesario


/* ----------------------------------------------------------
 * DATOS RELACIONADOS (SO -> VERSIONES)
 * ---------------------------------------------------------- */
const OS_DATA = {
  'Ubuntu Server': ['24.04 LTS', '22.04 LTS', '20.04 LTS', '18.04 LTS'],
  'Windows Server': ['2022', '2019', '2016', '2012 R2'],
  'Red Hat Enterprise Linux': ['9.3', '9.0', '8.9', '8.0', '7.9'],
  'Debian': ['12 (Bookworm)', '11 (Bullseye)', '10 (Buster)'],
  'CentOS': ['7', 'Stream 8', 'Stream 9'],
  'Rocky Linux': ['9', '8'],
  'AlmaLinux': ['9', '8'],
  'VMware ESXi': ['8.0', '7.0', '6.7'],
  'Proxmox VE': ['8.1', '8.0', '7.4', '7.0'],
  'Fedora Server': ['39', '38', '37'],
  'FreeBSD': ['14.0', '13.2'],
}

const COMMON_BRANDS = [
  'HP Enterprise',
  'Dell',
  'Lenovo',
  'Cisco',
  'Supermicro',
  'Huawei',
  'IBM',
  'Fujitsu',
  'Oracle',
]

const COMMON_IPS = [
  '192.168.1.',
  '192.168.0.',
  '192.168.100.',
  '10.0.0.',
  '10.10.10.',
  '172.16.0.',
  '127.0.0.1',
]

/* ----------------------------------------------------------
 * QUERIES
 * ---------------------------------------------------------- */
const GET_DATA_CENTERS = gql`
  query GetDataCenters {
    dataCenters {
      id
      nombre
    }
  }
`

const GET_SERVIDORES = gql`
  query GetServidores {
    servidores {
      id
      nombre
      estado
      id_data_center
    }
  }
`

const GET_PARAMETROS = gql`
  query GetParametros {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`

/* ----------------------------------------------------------
 * VALORES POR DEFECTO
 * ---------------------------------------------------------- */
const getDefaultValues = () => ({
  nombre: '',
  cod_inventario_agetic: '',
  serie: '',
  marca: '',
  modelo: '',
  ip_primaria: '',
  os_base: '',
  os_version: '',
  ram: '',
  almacenamiento: '',
  cod_tipo_servidor: '',
  estado_operativo: '',
  id_data_center: '',
  id_padre: '',
  estado: 'ACTIVO',
  identity_key: '',
})

/* ----------------------------------------------------------
 * COMPONENTE VISUAL: SectionCard (Estandarizado)
 * ---------------------------------------------------------- */
const SectionCard = ({ title, icon, children, color }) => {
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
        // Color de fondo adaptado
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
      <CardContent sx={{ p: 2.5 }}>{children}</CardContent>
    </Card>
  )
}

/* ----------------------------------------------------------
 * COMPONENTE PRINCIPAL: ServidorForm
 * ---------------------------------------------------------- */
export default function ServidorForm({
  servidor,
  dataCenters,
  servidores,
  parametros,
  onSave,
  loading,
  error,
}) {
  const theme = useTheme()
  const isEdit = Boolean(servidor?.id)

  const [form, setForm] = useState(getDefaultValues())
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  /* --- DATA FETCHING --- */
  const { data: dcData, loading: dcLoading } = useQuery(GET_DATA_CENTERS, {
    skip: Boolean(dataCenters),
  })
  const { data: srvData, loading: srvLoading } = useQuery(GET_SERVIDORES, {
    skip: Boolean(servidores),
  })
  const { data: paramData, loading: paramLoading } = useQuery(GET_PARAMETROS, {
    skip: Boolean(parametros),
  })

  const finalDataCenters = dataCenters || dcData?.dataCenters || []
  const finalServidores = servidores || srvData?.servidores || []
  const finalParametros = parametros || paramData?.parametros || []

  const isLoadingData =
    (!dataCenters && dcLoading) ||
    (!servidores && srvLoading) ||
    (!parametros && paramLoading)

  /* --- MAPEO EN EDICIÓN --- */
  const resetForm = useCallback(() => {
    setForm(getDefaultValues());
    // No hay necesidad de manejar OS versión/base aquí si el useEffect maneja la carga
  }, []);
  
  useEffect(() => {
    if (!isEdit) {
      // Usar lógica de inicialización en la práctica si fuera necesario
      return
    }

    // Lógica de carga de edición
    let loadedOsBase = ''
    let loadedOsVersion = ''
    const fullOs = servidor.sistema_operativo || ''

    const knownOS = Object.keys(OS_DATA).find(os => fullOs.startsWith(os));
    
    if (knownOS) {
        loadedOsBase = knownOS;
        loadedOsVersion = fullOs.replace(knownOS, '').trim();
    } else {
        const lastSpace = fullOs.lastIndexOf(' ')
        if (lastSpace !== -1) {
          loadedOsBase = fullOs.substring(0, lastSpace)
          loadedOsVersion = fullOs.substring(lastSpace + 1)
        } else {
          loadedOsBase = fullOs
        }
    }

    setForm({
      nombre: servidor.nombre ?? '',
      cod_inventario_agetic: servidor.cod_inventario_agetic ?? '',
      serie: servidor.serie ?? '',
      marca: servidor.marca ?? '',
      modelo: servidor.modelo ?? '',
      ip_primaria: servidor.ip_primaria ?? '',
      os_base: loadedOsBase,
      os_version: loadedOsVersion,
      ram: servidor.ram ?? '',
      almacenamiento: servidor.almacenamiento ?? '',
      cod_tipo_servidor: servidor.cod_tipo_servidor ?? '',
      estado_operativo:
        servidor.estadoOperativoInfo?.codigo ??
        servidor.estado_operativo ??
        '',
      id_data_center: servidor.id_data_center ?? '',
      id_padre: servidor.id_padre ?? '',
      estado: servidor.estado ?? 'ACTIVO',
      identity_key: servidor.identity_key ?? '',
    })

  }, [servidor, isEdit])

  /* --- LISTAS FILTRADAS --- */
  const opcionesTipoServidor = finalParametros.filter(
    (p) => p.grupo === 'TIPO_SERVIDOR'
  )
  const opcionesEstadoOperativo = finalParametros.filter(
    (p) => p.grupo === 'ESTADO_OPERATIVO'
  )

  const opcionesPadre = useMemo(() => {
    if (!form.id_data_center) return []
    return finalServidores.filter(
      (s) =>
        s.id !== servidor?.id &&
        s.estado === 'ACTIVO' &&
        s.id_data_center === parseInt(form.id_data_center)
    )
  }, [form.id_data_center, finalServidores, servidor])

  // LÓGICA DE FILTRADO DE VERSIONES
  const currentVersions = useMemo(() => {
    if (!form.os_base) return []
    return OS_DATA[form.os_base] || []
  }, [form.os_base])

  /* --- HANDLERS --- */
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'id_data_center' ? { id_padre: '' } : {}),
    }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))

    // Lógica de OS: si cambia la base, se limpia la versión.
    if (field === 'os_base') {
      setForm((prev) => ({ ...prev, os_version: '' }));
    }
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (form.cod_tipo_servidor !== 'CHASIS' && !form.ip_primaria.trim()) {
      e.ip_primaria = 'La IP es obligatoria'
    }
    if (!form.estado_operativo)
      e.estado_operativo = 'Seleccione un estado operativo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return

    setSubmitting(true)

    // Concatenar SO + Versión
    const fullOS =
      form.os_base && form.os_version
        ? `${form.os_base} ${form.os_version}`.trim()
        : form.os_base || ''

    const cleanIp =
      form.cod_tipo_servidor === 'CHASIS' || !form.ip_primaria.trim()
        ? null
        : form.ip_primaria

    const payload = {
      ...form,
      id_data_center: form.id_data_center ? parseInt(form.id_data_center) : null,
      id_padre: form.id_padre ? parseInt(form.id_padre) : null,
      ip_primaria: cleanIp,
      sistema_operativo: form.cod_tipo_servidor === 'CHASIS' ? '' : fullOS,
      ram:
        form.cod_tipo_servidor === 'CHASIS' || !form.ram
          ? null
          : parseInt(form.ram),
      almacenamiento:
        form.cod_tipo_servidor === 'CHASIS' || !form.almacenamiento
          ? null
          : parseInt(form.almacenamiento),
      // Campos a excluir
      identity_key: undefined,
      os_base: undefined,
      os_version: undefined,
    }

    try {
      await onSave(payload, servidor?.id)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoadingData && !servidor) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  /* ----------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------- */
  return (
    <Box sx={{ width: '100%', maxWidth: 1500, mx: 'auto' }}>
      <Card
        elevation={0} // Cambiado de 3 a 0
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderTop: 'none',
          borderRadius: 2,
          borderTopLeftRadius: '0 !important',
          borderTopRightRadius: '0 !important',
          mb: 3,
          bgcolor: theme.palette.background.paper, // Soporte Dark Mode
        }}
      >
        {/* HEADER (Estilo Estandarizado) */}
        <Box sx={{ 
          px: 5, py: 4, display: 'flex', alignItems: 'center', gap: 2, 
          bgcolor: theme.palette.background.paper, // Soporte Dark Mode
          borderTopLeftRadius: 16, borderTopRightRadius: 16,
        }}>
          <Avatar
            sx={{
              width: 48, // Estandarizado
              height: 48,
              background: 'linear-gradient(135deg, #1565C0, #7B1FA2)',
              color: 'white',
              boxShadow: 3,
            }}
          >
            {isEdit ? <EditIcon /> : <AddCircleOutlineIcon />}
          </Avatar>
          <Box>
            <Typography 
              variant="h5" 
              fontWeight={800} 
              sx={{ 
                lineHeight: 1.2, 
                // GRADIENTE EN TEXTO
                background: 'linear-gradient(90deg, #1565C0 0%, #7B1FA2 100%)',
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                mb: 0.5 
              }}
            >
              {isEdit ? 'Editar Servidor' : 'Registrar Servidor'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Modificar equipo físico' : 'Registrar hardware en inventario'}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 5, pb: 5, pt: 0 }}>
          {/* Mensaje de Error (Dark Mode Friendly) */}
          {error && (
            <Paper
              sx={{
                p: 2, mb: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#fff4f4', borderColor: 'error.main',
                color: 'error.main', display: 'flex', gap: 1.5, alignItems: 'center',
              }}
            >
              <ErrorOutlineIcon color="error" />
              <Typography variant="body2" fontWeight={600}>{error.message}</Typography>
            </Paper>
          )}

          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            
            {/* 1. UBICACIÓN (AZUL PRIMARIO) */}
            <SectionCard title="Ubicación y Jerarquía" icon={<DnsIcon />} color={theme.palette.primary.main}>
              <Stack spacing={2.5}>
                <FormControl fullWidth error={!!errors.id_data_center}>
                  <FormLabel sx={{ fontWeight: 600 }}>Data Center</FormLabel>
                  <TextField
                    select
                    size="small"
                    value={form.id_data_center}
                    onChange={(e) => handleChange('id_data_center', e.target.value)}
                  >
                    <MenuItem value="">Seleccione…</MenuItem>
                    {finalDataCenters.map((dc) => (
                      <MenuItem key={dc.id} value={dc.id}>{dc.nombre}</MenuItem>
                    ))}
                  </TextField>
                  {errors.id_data_center && <FormHelperText>{errors.id_data_center}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={!!errors.nombre}>
                  <FormLabel sx={{ fontWeight: 600 }}>Nombre del Servidor *</FormLabel>
                  <TextField
                    size="small"
                    value={form.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><ComputerIcon fontSize="small" /></InputAdornment>
                      ),
                    }}
                  />
                  {errors.nombre && <FormHelperText>{errors.nombre}</FormHelperText>}
                </FormControl>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                  <FormControl fullWidth error={!!errors.cod_tipo_servidor}>
                    <FormLabel sx={{ fontWeight: 600 }}>Tipo</FormLabel>
                    <TextField
                      select
                      size="small"
                      value={form.cod_tipo_servidor}
                      onChange={(e) => handleChange('cod_tipo_servidor', e.target.value)}
                    >
                      <MenuItem value="">Seleccione…</MenuItem>
                      {opcionesTipoServidor.map((op) => (
                        <MenuItem key={op.id} value={op.codigo}>{op.nombre}</MenuItem>
                      ))}
                    </TextField>
                    {errors.cod_tipo_servidor && <FormHelperText>{errors.cod_tipo_servidor}</FormHelperText>}
                  </FormControl>

                  <FormControl fullWidth>
                    <FormLabel sx={{ fontWeight: 600 }}>Servidor Padre</FormLabel>
                    <TextField
                      select
                      size="small"
                      value={form.id_padre}
                      disabled={!form.id_data_center}
                      onChange={(e) => handleChange('id_padre', e.target.value)}
                    >
                      <MenuItem value="">Ninguno</MenuItem>
                      {opcionesPadre.map((s) => (
                        <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Box>
              </Stack>
            </SectionCard>

            {/* 2. IDENTIFICACIÓN FÍSICA (CYAN/SECUNDARIO) */}
            <SectionCard title="Identificación Física" icon={<BusinessIcon />} color={theme.palette.secondary.main}>
              <Stack spacing={2.5}>
                
                {isEdit && (
                  <FormControl fullWidth>
                    <FormLabel sx={{ color: 'text.secondary', fontWeight: 600 }}>Identificador (Generado)</FormLabel>
                    <TextField
                      size="small"
                      value={form.identity_key}
                      variant="filled"
                      InputProps={{
                        readOnly: true,
                        startAdornment: <InputAdornment position="start"><VpnKeyIcon fontSize="small" /></InputAdornment>,
                        sx: { 
                          bgcolor: theme.palette.action.hover, // Fondo adaptado para disabled
                          '& .MuiInputBase-input': { color: theme.palette.text.secondary } // Texto más suave
                        }
                      }}
                    />
                  </FormControl>
                )}

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ fontWeight: 600 }}>Marca</FormLabel>
                    <Autocomplete
                      freeSolo
                      options={COMMON_BRANDS}
                      value={form.marca}
                      onInputChange={(_, newVal) => handleChange('marca', newVal)}
                      renderInput={(params) => (
                        <TextField {...params} size="small" placeholder="Ej: Dell" />
                      )}
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <FormLabel sx={{ fontWeight: 600 }}>Modelo</FormLabel>
                    <TextField
                      size="small"
                      value={form.modelo}
                      onChange={(e) => handleChange('modelo', e.target.value)}
                    />
                  </FormControl>
                </Box>

                <FormControl fullWidth>
                  <FormLabel sx={{ fontWeight: 600 }}>Nº Serie</FormLabel>
                  <TextField
                    size="small"
                    value={form.serie}
                    onChange={(e) => handleChange('serie', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><QrCodeIcon fontSize="small" /></InputAdornment>,
                    }}
                  />
                </FormControl>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ fontWeight: 600 }}>Código Inventario</FormLabel>
                    <TextField
                      size="small"
                      value={form.cod_inventario_agetic}
                      onChange={(e) => handleChange('cod_inventario_agetic', e.target.value)}
                    />
                  </FormControl>

                  <FormControl fullWidth error={!!errors.estado_operativo}>
                    <FormLabel sx={{ fontWeight: 600 }}>Estado Operativo *</FormLabel>
                    <TextField
                      select
                      size="small"
                      value={form.estado_operativo}
                      onChange={(e) => handleChange('estado_operativo', e.target.value)}
                    >
                      <MenuItem value="">Seleccione…</MenuItem>
                      {opcionesEstadoOperativo.map((op) => (
                        <MenuItem key={op.id} value={op.codigo}>{op.nombre}</MenuItem>
                      ))}
                    </TextField>
                    {errors.estado_operativo && <FormHelperText>{errors.estado_operativo}</FormHelperText>}
                  </FormControl>
                </Box>
              </Stack>
            </SectionCard>

            {/* 3. RED Y RECURSOS (VERDE) */}
            <SectionCard title="Red y Recursos" icon={<SettingsEthernetIcon />} color="#2e7d32">
              <Stack spacing={2.5}>
                {form.cod_tipo_servidor !== 'CHASIS' && (
                  <>
                    <FormControl fullWidth error={!!errors.ip_primaria}>
                      <FormLabel sx={{ fontWeight: 600 }}>IP Primaria *</FormLabel>
                      <Autocomplete
                        freeSolo
                        options={COMMON_IPS}
                        value={form.ip_primaria}
                        onInputChange={(_, newVal) => handleChange('ip_primaria', newVal)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Ej: 192.168.1.10"
                            error={!!errors.ip_primaria}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start"><LanIcon fontSize="small" /></InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                      {errors.ip_primaria && <FormHelperText>{errors.ip_primaria}</FormHelperText>}
                    </FormControl>

                    {/* --- SISTEMA OPERATIVO Y VERSIÓN CON FILTRO DINÁMICO --- */}
                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '2fr 1fr' }}>
                      <FormControl fullWidth>
                        <FormLabel sx={{ fontWeight: 600 }}>Sistema Operativo</FormLabel>
                        <Autocomplete
                          freeSolo
                          options={Object.keys(OS_DATA)} // Muestra solo las claves (nombres de SO)
                          value={form.os_base}
                          onInputChange={(_, newVal) => {
                            handleChange('os_base', newVal)
                            // IMPORTANTE: Limpiar versión si cambiamos el SO
                            handleChange('os_version', '')
                          }}
                          renderInput={(params) => (
                            <TextField {...params} size="small" placeholder="Ej: Ubuntu Server" />
                          )}
                        />
                      </FormControl>
                      
                      <FormControl fullWidth>
                        <FormLabel sx={{ fontWeight: 600 }}>Versión</FormLabel>
                        <Autocomplete
                          freeSolo
                          options={currentVersions}
                          disabled={!form.os_base} 
                          value={form.os_version}
                          onInputChange={(_, newVal) => handleChange('os_version', newVal)}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              size="small" 
                              placeholder={currentVersions.length > 0 ? "Seleccione..." : "Escriba..."} 
                            />
                          )}
                        />
                      </FormControl>
                    </Box>
                  </>
                )}

                {form.cod_tipo_servidor !== 'CHASIS' && (
                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ fontWeight: 600 }}>RAM (GB)</FormLabel>
                      <TextField
                        type="number"
                        size="small"
                        value={form.ram}
                        onChange={(e) => handleChange('ram', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><MemoryIcon fontSize="small" /></InputAdornment>,
                        }}
                      />
                    </FormControl>

                    <FormControl fullWidth>
                      <FormLabel sx={{ fontWeight: 600 }}>Storage (GB)</FormLabel>
                      <TextField
                        type="number"
                        size="small"
                        value={form.almacenamiento}
                        onChange={(e) => handleChange('almacenamiento', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><StorageIcon fontSize="small" /></InputAdornment>,
                        }}
                      />
                    </FormControl>
                  </Box>
                )}

                {form.cod_tipo_servidor === 'CHASIS' && (
                  <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100], borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      La configuración de red y recursos no aplica para servidores tipo Chasis.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </SectionCard>
          </Box>

          {/* BOTONES ACCIÓN (Estilo Pill + Violeta) */}
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<CancelIcon />} 
              onClick={() => navigate(routes.servidors())}
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
              loading={loading || submitting} 
              startIcon={<SaveIcon />}
              sx={{ 
                // GRADIENTE
                background: 'linear-gradient(135deg, #1565C0 0%, #7B1FA2 100%)',
                boxShadow: 4, px: 4, minWidth: 160, 
                borderRadius: 50, // Pill Shape
                textTransform: 'none', fontWeight: 700
              }}
            >
              {isEdit ? 'Guardar Cambios' : 'Guardar Servidor'}
            </LoadingButton>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}