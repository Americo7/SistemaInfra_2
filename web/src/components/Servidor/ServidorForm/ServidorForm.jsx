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
  Paper,
  useTheme,
  CircularProgress,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { navigate, routes } from '@redwoodjs/router'
import { useQuery, gql } from '@redwoodjs/web'

// ICONOS
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

/* ----------------------------------------------------------
 * 1. QUERIES FALLBACK (solo si no vienen desde el CELL)
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
 * 2. VALORES POR DEFECTO
 * ---------------------------------------------------------- */
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

/* ----------------------------------------------------------
 * SectionCard
 * ---------------------------------------------------------- */
const SectionCard = ({ title, icon, children, color }) => {
  const theme = useTheme()
  const activeColor = color || theme.palette.primary.main

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderTop: `3px solid ${activeColor}`,
        height: '100%',
      }}
    >
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: activeColor, width: 32, height: 32 }}>{icon}</Avatar>}
        title={<Typography sx={{ fontWeight: 700 }}>{title}</Typography>}
      />
      <CardContent sx={{ p: 2.5 }}>{children}</CardContent>
    </Card>
  )
}

/* ----------------------------------------------------------
 * Form Principal (MODO HÍBRIDO)
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

  /* FALLBACK QUERIES */
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

  /* ----------------------------------------------------------
   * Mapeo desde el CELL al formulario en modo edición
   * ---------------------------------------------------------- */
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
        estado_operativo: servidor.estadoOperativoInfo?.codigo ?? servidor.estado_operativo ?? '',
        id_data_center: servidor.id_data_center ?? '',
        id_padre: servidor.id_padre ?? '',
        estado: servidor.estado ?? 'ACTIVO',
      })
    }
  }, [servidor, isEdit])

  /* ----------------------------------------------------------
   * Parámetros
   * ---------------------------------------------------------- */
  const opcionesTipoServidor = finalParametros.filter(
    (p) => p.grupo === 'TIPO_SERVIDOR'
  )
  const opcionesEstadoOperativo = finalParametros.filter(
    (p) => p.grupo === 'ESTADO_OPERATIVO'
  )

  /* ----------------------------------------------------------
   * Servidores Padre filtrados por DataCenter
   * ---------------------------------------------------------- */
  const opcionesPadre = useMemo(() => {
    if (!form.id_data_center) return []
    return finalServidores.filter(
      (s) =>
        s.id !== servidor?.id &&
        s.estado === 'ACTIVO' &&
        s.id_data_center === parseInt(form.id_data_center)
    )
  }, [form.id_data_center, finalServidores, servidor])

  /* ----------------------------------------------------------
   * Handlers
   * ---------------------------------------------------------- */
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'id_data_center' ? { id_padre: '' } : {}),
    }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.ip_primaria.trim()) e.ip_primaria = 'La IP es obligatoria'
    if (!form.estado_operativo) e.estado_operativo = 'Seleccione un estado operativo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return

    setSubmitting(true)

    const payload = {
      ...form,
      id_data_center: parseInt(form.id_data_center),
      id_padre: form.id_padre ? parseInt(form.id_padre) : null,
      ram: form.ram ? parseInt(form.ram) : null,
      almacenamiento: form.almacenamiento ? parseInt(form.almacenamiento) : null,
      identity_key: undefined, // JAMÁS se envía
    }

    try {
      await onSave(payload, servidor?.id)
    } finally {
      setSubmitting(false)
    }
  }

  /* LOADING */
  if (isLoadingData && !servidor) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  /* ----------------------------------------------------------
   * FORMULARIO RENDER (NO SE TOCA ESTILO)
   * ---------------------------------------------------------- */
  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: 2 }}>
      <Card elevation={3} sx={{ borderRadius: 4 }}>
        
        {/* HEADER */}
        <Box
          sx={{
            px: 5,
            py: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #1565C0, #7B1FA2)',
              color: 'white',
            }}
          >
            {isEdit ? <EditIcon /> : <AddCircleOutlineIcon />}
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight={800}>
              {isEdit ? 'Editar Servidor' : 'Registrar Servidor'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Modificar equipo físico' : 'Registrar hardware en inventario'}
            </Typography>
          </Box>
        </Box>

        {/* FORMULARIO */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 5, pb: 5 }}>
          
          {/* ERROR */}
          {error && (
            <Paper
              sx={{
                p: 2,
                mb: 4,
                bgcolor: '#fff4f4',
                borderColor: '#ffcdd2',
                color: '#c62828',
                display: 'flex',
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              <ErrorOutlineIcon />
              <Typography>{error.message}</Typography>
            </Paper>
          )}

          {/* GRID PRINCIPAL */}
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            }}
          >
            {/* CARD 1 */}
            <SectionCard title="Ubicación y Jerarquía" icon={<DnsIcon />}>
              <Stack spacing={2.5}>
                
                {/* DATA CENTER */}
                <FormControl fullWidth error={!!errors.id_data_center}>
                  <FormLabel>Data Center</FormLabel>
                  <TextField
                    select
                    size="small"
                    value={form.id_data_center}
                    onChange={(e) => handleChange('id_data_center', e.target.value)}
                  >
                    <MenuItem value="">Seleccione…</MenuItem>
                    {finalDataCenters.map((dc) => (
                      <MenuItem key={dc.id} value={dc.id}>
                        {dc.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                  {errors.id_data_center && <FormHelperText>{errors.id_data_center}</FormHelperText>}
                </FormControl>

                {/* NOMBRE */}
                <FormControl fullWidth error={!!errors.nombre}>
                  <FormLabel>Nombre del Servidor *</FormLabel>
                  <TextField
                    size="small"
                    value={form.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ComputerIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {errors.nombre && <FormHelperText>{errors.nombre}</FormHelperText>}
                </FormControl>

                {/* TIPO + PADRE */}
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                  <FormControl fullWidth error={!!errors.cod_tipo_servidor}>
                    <FormLabel>Tipo</FormLabel>
                    <TextField
                      select
                      size="small"
                      value={form.cod_tipo_servidor}
                      onChange={(e) => handleChange('cod_tipo_servidor', e.target.value)}
                    >
                      <MenuItem value="">Seleccione…</MenuItem>
                      {opcionesTipoServidor.map((op) => (
                        <MenuItem key={op.id} value={op.codigo}>
                          {op.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                    {errors.cod_tipo_servidor && (
                      <FormHelperText>{errors.cod_tipo_servidor}</FormHelperText>
                    )}
                  </FormControl>

                  <FormControl fullWidth>
                    <FormLabel>Servidor Padre</FormLabel>
                    <TextField
                      select
                      size="small"
                      value={form.id_padre}
                      disabled={!form.id_data_center}
                      onChange={(e) => handleChange('id_padre', e.target.value)}
                    >
                      <MenuItem value="">Ninguno</MenuItem>
                      {opcionesPadre.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Box>
              </Stack>
            </SectionCard>

            {/* CARD 2 */}
            <SectionCard title="Identificación Física" icon={<BusinessIcon />}>
              <Stack spacing={2.5}>
                
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                  <FormControl fullWidth>
                    <FormLabel>Marca</FormLabel>
                    <TextField size="small" value={form.marca} onChange={(e) => handleChange('marca', e.target.value)} />
                  </FormControl>

                  <FormControl fullWidth>
                    <FormLabel>Modelo</FormLabel>
                    <TextField size="small" value={form.modelo} onChange={(e) => handleChange('modelo', e.target.value)} />
                  </FormControl>
                </Box>

                <FormControl fullWidth>
                  <FormLabel>Nº Serie</FormLabel>
                  <TextField
                    size="small"
                    value={form.serie}
                    onChange={(e) => handleChange('serie', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <QrCodeIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                  <FormControl fullWidth>
                    <FormLabel>Código Inventario</FormLabel>
                    <TextField size="small" value={form.cod_inventario_agetic} onChange={(e) => handleChange('cod_inventario_agetic', e.target.value)} />
                  </FormControl>

                  <FormControl fullWidth error={!!errors.estado_operativo}>
                    <FormLabel>Estado Operativo *</FormLabel>
                    <TextField
                      select
                      size="small"
                      value={form.estado_operativo}
                      onChange={(e) => handleChange('estado_operativo', e.target.value)}
                    >
                      <MenuItem value="">Seleccione…</MenuItem>
                      {opcionesEstadoOperativo.map((op) => (
                        <MenuItem key={op.id} value={op.codigo}>
                          {op.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                    {errors.estado_operativo && (
                      <FormHelperText>{errors.estado_operativo}</FormHelperText>
                    )}
                  </FormControl>
                </Box>
              </Stack>
            </SectionCard>

            {/* CARD 3 */}
            <SectionCard title="Red y Recursos" icon={<SettingsEthernetIcon />} color="#2e7d32">
              <Stack spacing={2.5}>
                <FormControl fullWidth error={!!errors.ip_primaria}>
                  <FormLabel>IP Primaria *</FormLabel>
                  <TextField
                    size="small"
                    value={form.ip_primaria}
                    onChange={(e) => handleChange('ip_primaria', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LanIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {errors.ip_primaria && (
                    <FormHelperText>{errors.ip_primaria}</FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth>
                  <FormLabel>Sistema Operativo</FormLabel>
                  <TextField
                    size="small"
                    value={form.sistema_operativo}
                    onChange={(e) => handleChange('sistema_operativo', e.target.value)}
                  />
                </FormControl>

                {/* OCULTAR RAM Y STORAGE SI ES CHASIS */}
                {form.cod_tipo_servidor !== 'CHASIS' && (
                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                    <FormControl fullWidth>
                      <FormLabel>RAM (GB)</FormLabel>
                      <TextField
                        type="number"
                        size="small"
                        value={form.ram}
                        onChange={(e) => handleChange('ram', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MemoryIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>

                    <FormControl fullWidth>
                      <FormLabel>Storage (GB)</FormLabel>
                      <TextField
                        type="number"
                        size="small"
                        value={form.almacenamiento}
                        onChange={(e) => handleChange('almacenamiento', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <StorageIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  </Box>
                )}
              </Stack>
            </SectionCard>
          </Box>

          {/* BOTONES */}
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CancelIcon />}
              onClick={() => navigate(routes.servidors())}
            >
              Cancelar
            </Button>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={loading || submitting}
              startIcon={<SaveIcon />}
            >
              {isEdit ? 'Guardar Cambios' : 'Guardar Servidor'}
            </LoadingButton>
          </Box>

        </Box>
      </Card>
    </Box>
  )
}
