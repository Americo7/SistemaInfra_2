import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  FormHelperText,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

import LanIcon from '@mui/icons-material/Lan'
import TokenIcon from '@mui/icons-material/VpnKey'
import InfoIcon from '@mui/icons-material/Info'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

/* ---------------------------------------------
 * Default form values
 * --------------------------------------------- */
const getDefaultValues = () => ({
  nombre: '',
  dominio: '',
  ip: '',
  puerto: '',
  ssl: true,
  usuario: '',
  token_id: '',
  token_secret: '',
  descripcion: '',
  estado: 'ACTIVO',
})

/* ---------------------------------------------
 * Section Card UI
 * --------------------------------------------- */
const SectionCard = ({ title, icon, children }) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {icon}
      <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
    </Box>
    {children}
  </Paper>
)

/* ---------------------------------------------
 * MAIN COMPONENT
 * --------------------------------------------- */
export default function ProxmoxEndpointForm({ proxmoxEndpoint, onSave, loading, error }) {
  const isEdit = Boolean(proxmoxEndpoint?.id)
  const [form, setForm] = useState(getDefaultValues())
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  /* Cargar datos en modo edición */
  useEffect(() => {
    if (isEdit) {
      setForm({
        nombre: proxmoxEndpoint.nombre ?? '',
        dominio: proxmoxEndpoint.dominio ?? '',
        ip: proxmoxEndpoint.ip ?? '',
        puerto: proxmoxEndpoint.puerto ?? '',
        ssl: proxmoxEndpoint.ssl ?? true,
        usuario: proxmoxEndpoint.usuario ?? '',
        token_id: proxmoxEndpoint.token_id ?? '',
        token_secret: proxmoxEndpoint.token_secret ?? '',
        descripcion: proxmoxEndpoint.descripcion ?? '',
        estado: proxmoxEndpoint.estado ?? 'ACTIVO',
      })
    }
  }, [proxmoxEndpoint, isEdit])

  /* Helper para actualizar campos */
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  /* Validación */
  const validate = () => {
    const e = {}

    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.usuario.trim()) e.usuario = 'Usuario API requerido'
    if (!form.token_id.trim()) e.token_id = 'Token ID requerido'
    if (!form.token_secret.trim()) e.token_secret = 'Token Secret requerido'

    const ipv4 =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

    if (!form.ip.trim() || !ipv4.test(form.ip)) e.ip = 'IP inválida'

    if (!form.puerto || Number(form.puerto) <= 0) e.puerto = 'Puerto inválido'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    if (!validate()) return

    const payload = {
      ...form,
      puerto: Number(form.puerto),
      ssl: Boolean(form.ssl),
      estado: form.estado,
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        payload.usuario_modificacion = 1 // usar currentUser.id
        await onSave(payload, proxmoxEndpoint.id)
      } else {
        payload.usuario_creacion = 1
        await onSave(payload)
      }
    } finally {
      setSubmitting(false)
    }
  }

  /* ---------------------------------------------
   * RENDER
   * --------------------------------------------- */
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <LanIcon fontSize="large" color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {isEdit ? `Editar Endpoint Proxmox` : 'Crear Endpoint Proxmox'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete los campos obligatorios marcados con *
            </Typography>
          </Box>
        </Box>

        {/* Error global */}
        {error && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: '#ffe5e5',
              color: '#b71c1c',
              display: 'flex',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <ErrorOutlineIcon />
            <Typography>{error?.message || String(error)}</Typography>
          </Paper>
        )}

        {/* GRID DE 3 COLUMNAS */}
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: '1fr 1fr 1fr',
            '@media (max-width: 1400px)': { gridTemplateColumns: '1fr 1fr' },
            '@media (max-width: 900px)': { gridTemplateColumns: '1fr' },
          }}
        >
          {/* Datos del servidor */}
          <SectionCard title="Datos del Servidor" icon={<LanIcon />}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <FormControl fullWidth error={!!errors.nombre}>
                <FormLabel>Nombre *</FormLabel>
                <TextField
                  size="small"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                />
                {errors.nombre && <FormHelperText>{errors.nombre}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth error={!!errors.ip}>
                <FormLabel>IP *</FormLabel>
                <TextField
                  size="small"
                  value={form.ip}
                  onChange={(e) => handleChange('ip', e.target.value)}
                />
                {errors.ip && <FormHelperText>{errors.ip}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth error={!!errors.puerto}>
                <FormLabel>Puerto *</FormLabel>
                <TextField
                  type="number"
                  size="small"
                  value={form.puerto}
                  onChange={(e) => handleChange('puerto', e.target.value)}
                />
                {errors.puerto && <FormHelperText>{errors.puerto}</FormHelperText>}
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.ssl}
                    onChange={(e) => handleChange('ssl', e.target.checked)}
                  />
                }
                label="SSL Habilitado"
              />
            </Box>
          </SectionCard>

          {/* Autenticación */}
          <SectionCard title="Autenticación API" icon={<TokenIcon />}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <FormControl fullWidth error={!!errors.usuario}>
                <FormLabel>Usuario *</FormLabel>
                <TextField
                  size="small"
                  value={form.usuario}
                  onChange={(e) => handleChange('usuario', e.target.value)}
                />
                {errors.usuario && <FormHelperText>{errors.usuario}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth error={!!errors.token_id}>
                <FormLabel>Token ID *</FormLabel>
                <TextField
                  size="small"
                  value={form.token_id}
                  onChange={(e) => handleChange('token_id', e.target.value)}
                />
                {errors.token_id && <FormHelperText>{errors.token_id}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth error={!!errors.token_secret}>
                <FormLabel>Token Secret *</FormLabel>
                <TextField
                  type="password"
                  size="small"
                  value={form.token_secret}
                  onChange={(e) => handleChange('token_secret', e.target.value)}
                />
                {errors.token_secret && <FormHelperText>{errors.token_secret}</FormHelperText>}
              </FormControl>
            </Box>
          </SectionCard>

          {/* Info adicional */}
          <SectionCard title="Información Adicional" icon={<InfoIcon />}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <FormControl fullWidth>
                <FormLabel>Dominio</FormLabel>
                <TextField
                  size="small"
                  value={form.dominio}
                  onChange={(e) => handleChange('dominio', e.target.value)}
                />
              </FormControl>

              <FormControl fullWidth>
                <FormLabel>Descripción</FormLabel>
                <TextField
                  multiline
                  rows={2}
                  size="small"
                  value={form.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                />
              </FormControl>

              <FormControl fullWidth>
                <FormLabel>Estado</FormLabel>
                <Select
                  size="small"
                  value={form.estado}
                  onChange={(e) => handleChange('estado', e.target.value)}
                >
                  <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                  <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </SectionCard>
        </Box>

        {/* Botón Guardar */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <LoadingButton
            type="submit"
            variant="contained"
            startIcon={<CheckCircleOutlineIcon />}
            loading={loading || submitting}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {loading || submitting ? 'Guardando…' : 'Guardar'}
          </LoadingButton>
        </Box>
      </Paper>
    </Box>
  )
}
