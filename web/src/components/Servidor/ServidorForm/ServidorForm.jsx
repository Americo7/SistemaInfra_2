import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
  Avatar,
  Button,
  Stack,
  Divider,
  Paper,
  useTheme,
  CircularProgress,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useQuery, gql } from '@redwoodjs/web'
import { navigate, routes } from '@redwoodjs/router'

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

/* ---------------------------------------------
 * 1. DEFINICIÓN DE QUERIES
 * --------------------------------------------- */
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
      marca
      modelo
      serie
      estado
      cod_tipo_servidor
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

/* ---------------------------------------------
 * 2. VALORES POR DEFECTO
 * --------------------------------------------- */
const getDefaultValues = () => ({
  nombre: '',
  cod_inventario_agetic: '',
  serie: '',
  marca: '',
  modelo: '',
  ip_primaria: '',
  sistema_operativo: '',
  ram: '',
  almacenamiento: '',
  cod_tipo_servidor: '',
  estado_operativo: '',
  id_data_center: '',
  id_padre: '',
  estado: 'ACTIVO',
})

/* ---------------------------------------------
 * 3. COMPONENTE UI AUXILIAR (SectionCard)
 * --------------------------------------------- */
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
        bgcolor: 'background.paper',
        height: '100%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
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

/* ---------------------------------------------
 * 4. COMPONENTE PRINCIPAL
 * --------------------------------------------- */
export default function ServidorForm({ servidor, dataCenters, servidores, parametros, onSave, loading, error }) {
  const theme = useTheme()
  const isEdit = Boolean(servidor?.id)
  
  // --- ESTADOS ---
  const [form, setForm] = useState(getDefaultValues())
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // --- CARGA DE DATOS (LEGACY: si no vienen del cell) ---
  const { data: dcData, loading: dcLoading } = useQuery(GET_DATA_CENTERS, {
    skip: Boolean(dataCenters && dataCenters.length > 0)
  })
  const { data: srvData, loading: srvLoading } = useQuery(GET_SERVIDORES, {
    skip: Boolean(servidores && servidores.length > 0)
  })
  const { data: paramData, loading: paramLoading } = useQuery(GET_PARAMETROS, {
    skip: Boolean(parametros && parametros.length > 0)
  })

  // Usar datos del cell si existen, si no usar del query
  const finalDataCenters = dataCenters || dcData?.dataCenters || []
  const finalServidores = servidores || srvData?.servidores || []
  const finalParametros = parametros || paramData?.parametros || []
  
  const isLoadingData = (!dataCenters && dcLoading) || (!servidores && srvLoading) || (!parametros && paramLoading)

  // --- EFECTO: CARGAR DATOS EN EDICIÓN ---
  useEffect(() => {
    if (isEdit && servidor) {
      setForm({
        nombre: servidor.nombre ?? '',
        cod_inventario_agetic: servidor.cod_inventario_agetic ?? '',
        serie: servidor.serie ?? '',
        marca: servidor.marca ?? '',
        modelo: servidor.modelo ?? '',
        ip_primaria: servidor.ip_primaria ?? '',
        sistema_operativo: servidor.sistema_operativo ?? '',
        ram: servidor.ram ?? '',
        almacenamiento: servidor.almacenamiento ?? '',
        cod_tipo_servidor: servidor.cod_tipo_servidor ?? '',
        estado_operativo: servidor.estado_operativo ?? '',
        id_data_center: servidor.id_data_center ?? '',
        id_padre: servidor.id_padre ?? '',
        estado: servidor.estado ?? 'ACTIVO',
      })
    }
  }, [servidor, isEdit])

  // --- PREPARACIÓN DE LISTAS ---
  const listDataCenters = finalDataCenters || []
  const listParametros = finalParametros || []
  
  const opcionesTipoServidor = listParametros.filter(p => p.grupo === 'TIPO_SERVIDOR')
  const opcionesEstadoOperativo = listParametros.filter(p => p.grupo === 'ESTADO_OPERATIVO')

  // Filtrar servidores padre
  const opcionesPadre = useMemo(() => {
    if (!form.id_data_center || !finalServidores) return []
    return finalServidores.filter(s => 
      s.id !== servidor?.id && 
      s.estado === 'ACTIVO' &&
      s.id_data_center === parseInt(form.id_data_center)
    )
  }, [finalServidores, form.id_data_center, servidor])


  // --- MANEJADORES ---
  const handleChange = (field, value) => {
    setForm(prev => {
      const newState = { ...prev, [field]: value }
      if (field === 'id_data_center') {
        newState.id_padre = ''
      }
      return newState
    })
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.id_data_center) e.id_data_center = 'Seleccione un Data Center'
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.cod_tipo_servidor) e.cod_tipo_servidor = 'El tipo es obligatorio'
    if (!form.ip_primaria.trim()) e.ip_primaria = 'La IP es obligatoria'
    if (!form.estado_operativo) e.estado_operativo = 'El estado es obligatorio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!validate()) return
    setSubmitting(true)
    
    const payload = {
      ...form,
      id_data_center: parseInt(form.id_data_center),
      id_padre: form.id_padre ? parseInt(form.id_padre) : null,
      ram: form.ram ? parseInt(form.ram) : null,
      almacenamiento: form.almacenamiento ? parseInt(form.almacenamiento) : null,
      usuario_modificacion: isEdit ? 1 : undefined,
      usuario_creacion: isEdit ? undefined : 1,
    }

    try {
      await onSave(payload, servidor?.id)
    } finally {
      setSubmitting(false)
    }
  }

  // --- RENDERIZADO ---
  if (isLoadingData && !servidor) {
    return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, margin: '0 auto', p: 2 }}>
      
      {/* CARD PRINCIPAL */}
      <Card elevation={3} sx={{ borderRadius: 4, overflow: 'visible' }}>

        {/* 1. Header Unificado */}
        <Box sx={{ 
            px: 5, py: 4, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff',
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
          }}>
            <Avatar
              sx={{
                  width: 48, height: 48,
                  background: 'linear-gradient(135deg, #1565C0, #7B1FA2)',
                  color: 'white', boxShadow: 3
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
                  background: 'linear-gradient(90deg, #1565C0 0%, #7B1FA2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                {isEdit ? 'Editar Servidor' : 'Registrar Nuevo Servidor'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? 'Modificar datos del equipo físico' : 'Ingreso de nuevo hardware al inventario'}
              </Typography>
            </Box>
        </Box>

        {/* 2. Contenido del Formulario */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>

          {/* Mensaje de Error */}
          {error && (
            <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
              <ErrorOutlineIcon color="error" />
              <Typography variant="body2" fontWeight={600}>{error?.message || 'Ocurrió un error al guardar'}</Typography>
            </Paper>
          )}

          {/* Grid de 3 Columnas */}
          <Box sx={{ 
            display: 'grid', 
            gap: 3, 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'start' // Alineación superior para evitar estiramientos raros
          }}>

            {/* --- CARD 1: Ubicación y Jerarquía --- */}
            <SectionCard title="Ubicación y Jerarquía" icon={<DnsIcon />} color={theme.palette.primary.main}>
              <Stack spacing={2.5}>
                
                {/* 1. Data Center */}
                <FormControl fullWidth error={!!errors.id_data_center}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Data Center *</FormLabel>
                  <TextField
                    select
                    size="small"
                    value={form.id_data_center}
                    onChange={(e) => handleChange('id_data_center', e.target.value)}
                  >
                    <MenuItem value=""><em>Seleccione...</em></MenuItem>
                    {listDataCenters.map(dc => (
                      <MenuItem key={dc.id} value={dc.id}>{dc.nombre}</MenuItem>
                    ))}
                  </TextField>
                  {errors.id_data_center && <FormHelperText>{errors.id_data_center}</FormHelperText>}
                </FormControl>

                {/* 2. Nombre del Servidor (Movido arriba) */}
                <FormControl fullWidth error={!!errors.nombre}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre del Servidor *</FormLabel>
                  <TextField
                    size="small"
                    value={form.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Ej. SRV-PROD-01"
                    InputProps={{ startAdornment: <InputAdornment position="start"><ComputerIcon fontSize="small" /></InputAdornment> }}
                  />
                  {errors.nombre && <FormHelperText>{errors.nombre}</FormHelperText>}
                </FormControl>
                {/* 3. Fila: Tipo de Servidor + Servidor Padre */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    
                    {/* Movido desde Card 3 */}
                    <FormControl fullWidth error={!!errors.cod_tipo_servidor}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Tipo de Servidor *</FormLabel>
                        <TextField
                            select
                            size="small"
                            value={form.cod_tipo_servidor}
                            onChange={(e) => handleChange('cod_tipo_servidor', e.target.value)}
                        >
                            <MenuItem value=""><em>Seleccione...</em></MenuItem>
                            {opcionesTipoServidor.map(op => (
                            <MenuItem key={op.id} value={op.codigo}>{op.nombre}</MenuItem>
                            ))}
                        </TextField>
                        {errors.cod_tipo_servidor && <FormHelperText>{errors.cod_tipo_servidor}</FormHelperText>}
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Servidor Padre (Op)</FormLabel>
                        <TextField
                            select
                            size="small"
                            value={form.id_padre}
                            onChange={(e) => handleChange('id_padre', e.target.value)}
                            disabled={!form.id_data_center || opcionesPadre.length === 0}
                            helperText={!form.id_data_center ? "Elija DC primero" : ""}
                        >
                            <MenuItem value=""><em>Ninguno (Raíz)</em></MenuItem>
                            {opcionesPadre.map(s => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.nombre}
                            </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>
                </Box>

              </Stack>
            </SectionCard>


            {/* --- CARD 2: Identificación Física --- */}
            <SectionCard title="Identificación Física" icon={<BusinessIcon />} color={theme.palette.secondary.main}>
              <Stack spacing={2.5}>
                
                {/* Marca / Modelo */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Marca</FormLabel>
                    <TextField size="small" value={form.marca} onChange={(e) => handleChange('marca', e.target.value)} />
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Modelo</FormLabel>
                    <TextField size="small" value={form.modelo} onChange={(e) => handleChange('modelo', e.target.value)} />
                  </FormControl>
                </Box>

                {/* Serie */}
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Número de Serie</FormLabel>
                  <TextField 
                    size="small" 
                    value={form.serie} 
                    onChange={(e) => handleChange('serie', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><QrCodeIcon fontSize="small" /></InputAdornment> }}
                  />
                </FormControl>

                {/* Fila: Cod Inventario + Estado Operativo */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <FormControl fullWidth>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Código Inventario</FormLabel>
                        <TextField size="small" value={form.cod_inventario_agetic} onChange={(e) => handleChange('cod_inventario_agetic', e.target.value)} />
                    </FormControl>

                    <FormControl fullWidth error={!!errors.estado_operativo}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Estado Operativo *</FormLabel>
                        <TextField
                            select
                            size="small"
                            value={form.estado_operativo}
                            onChange={(e) => handleChange('estado_operativo', e.target.value)}
                        >
                            <MenuItem value=""><em>Seleccione...</em></MenuItem>
                            {opcionesEstadoOperativo.map(op => (
                            <MenuItem key={op.id} value={op.codigo}>{op.nombre}</MenuItem>
                            ))}
                        </TextField>
                        {errors.estado_operativo && <FormHelperText>{errors.estado_operativo}</FormHelperText>}
                    </FormControl>
                </Box>

              </Stack>
            </SectionCard>


            {/* --- CARD 3: Red y Recursos --- */}
            <SectionCard title="Red y Recursos" icon={<SettingsEthernetIcon />} color="#2e7d32">
              <Stack spacing={2.5}>
                
                {/* Tipo de Servidor se movió al Card 1 */}

                <FormControl fullWidth error={!!errors.ip_primaria}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>IP Primaria *</FormLabel>
                  <TextField
                    size="small"
                    value={form.ip_primaria}
                    onChange={(e) => handleChange('ip_primaria', e.target.value)}
                    placeholder="192.168.x.x"
                    InputProps={{ startAdornment: <InputAdornment position="start"><LanIcon fontSize="small" /></InputAdornment> }}
                  />
                  {errors.ip_primaria && <FormHelperText>{errors.ip_primaria}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Sistema Operativo</FormLabel>
                  <TextField size="small" value={form.sistema_operativo} onChange={(e) => handleChange('sistema_operativo', e.target.value)} />
                </FormControl>

                {/* Ocultar RAM/Storage si es CHASIS */}
                {form.cod_tipo_servidor !== 'CHASIS' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>RAM (GB)</FormLabel>
                      <TextField 
                        type="number" 
                        size="small" 
                        value={form.ram} 
                        onChange={(e) => handleChange('ram', e.target.value)} 
                        InputProps={{ startAdornment: <InputAdornment position="start"><MemoryIcon fontSize="small" /></InputAdornment> }}
                      />
                    </FormControl>

                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Storage (GB)</FormLabel>
                      <TextField 
                        type="number" 
                        size="small" 
                        value={form.almacenamiento} 
                        onChange={(e) => handleChange('almacenamiento', e.target.value)} 
                        InputProps={{ startAdornment: <InputAdornment position="start"><StorageIcon fontSize="small" /></InputAdornment> }}
                      />
                    </FormControl>
                  </Box>
                )}
              </Stack>
            </SectionCard>

          </Box>

          {/* 4. Botones de Acción */}
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CancelIcon />}
              onClick={() => navigate(routes.servidors())}
              sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(0, 0, 0, 0.23)' }}
            >
              Cancelar
            </Button>

            <LoadingButton
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              loading={loading || submitting}
              sx={{ 
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                boxShadow: 4, px: 4, minWidth: 160, borderRadius: 2, textTransform: 'none', fontWeight: 700 
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