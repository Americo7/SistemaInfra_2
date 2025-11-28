import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Paper,
  useTheme
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { navigate, routes } from '@redwoodjs/router'

// Iconos
import {
  Business as DataCenterIcon,
  Place as PlaceIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ErrorOutline as ErrorIcon,
  Edit as EditIcon,
  AddCircle as AddIcon,
  Info as InfoIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. VALORES POR DEFECTO
 * --------------------------------------------- */
const getDefaultValues = () => ({
  nombre: '',
  ubicacion: '',
})

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
        height: '100%'
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: activeColor, width: 32, height: 32 }}>
            {icon}
          </Avatar>
        }
        title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1rem' }}>{title}</Typography>}
        sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  )
}

/* ---------------------------------------------
 * 3. COMPONENTE PRINCIPAL: DataCenterForm
 * --------------------------------------------- */
export default function DataCenterForm({ dataCenter, onSave, loading, error }) {
  const theme = useTheme()
  const isEdit = Boolean(dataCenter?.id)

  // --- ESTADOS ---
  const [form, setForm] = useState(getDefaultValues())
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // --- EFECTO: CARGAR DATOS EN EDICIÓN ---
  useEffect(() => {
    if (isEdit && dataCenter) {
      setForm({
        nombre: dataCenter.nombre ?? '',
        ubicacion: dataCenter.ubicacion ?? '',
      })
    }
  }, [dataCenter, isEdit])

  // --- MANEJADORES ---
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.ubicacion.trim()) e.ubicacion = 'La ubicación es obligatoria'

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
      estado: 'ACTIVO',
      usuario_modificacion: isEdit ? 1 : undefined,
      usuario_creacion: isEdit ? undefined : 1,
    }

    try {
      await onSave(payload, dataCenter?.id)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', p: 2 }}>
      
      {/* 1. CARD PRINCIPAL CONTENEDOR */}
      <Card 
        elevation={3} 
        sx={{ 
          borderRadius: 4, // Bordes más redondeados
          overflow: 'hidden' // Corta el contenido para respetar los bordes
        }}
      >
        
        {/* HEADER UNIFICADO (Sin línea, fondo blanco) */}
        <Box sx={{ 
            px: 5,
            py: 4,
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            bgcolor: '#fff', // Fondo blanco igual que el cuerpo
            // borderBottom eliminado para continuidad
          }}>
            <Avatar
              sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #1565C0, #7B1FA2)',
                  color: 'white',
                  boxShadow: 3
                }}
              >
              {isEdit ? <EditIcon /> : <AddIcon />}
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
                {isEdit ? 'Editar Data Center' : 'Nuevo Data Center'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? 'Modificar información de la ubicación' : 'Registrar nueva ubicación física'}
              </Typography>
            </Box>
        </Box>

        {/* CONTENIDO DEL FORMULARIO */}
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          noValidate 
          sx={{ 
            px: 5, 
            pb: 5, 
            pt: 0, // Sin padding superior para unirlo visualmente al header
            bgcolor: '#fff' // Fondo blanco continuo
          }}
        >
          
          {/* Mensaje de Error */}
          {error && (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, mb: 3, 
                bgcolor: '#fff4f4', 
                borderColor: '#ffcdd2',
                color: '#c62828', 
                display: 'flex', 
                gap: 1.5, 
                alignItems: 'center',
                borderRadius: 2
              }}
            >
              <ErrorIcon color="error" />
              <Typography variant="body2" fontWeight={600}>{error?.message || 'Error al guardar el registro'}</Typography>
            </Paper>
          )}

          {/* CARD DE CAMPOS INTERNO */}
          <SectionCard 
            icon={<InfoIcon sx={{ fontSize: 20 }} />} 
            title="Información General"
            bgcolor={theme.palette.primary.main}
          >
            {/* STACK VERTICAL */}
            <Stack spacing={3}>
              
              {/* CAMPO 1: NOMBRE */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                  Nombre del Data Center
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Ej. Data Center Central - Bloque A"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  InputProps={{
                    startAdornment: <DataCenterIcon color="action" sx={{ mr: 1, opacity: 0.7 }} />,
                  }}
                />
              </Box>

              {/* CAMPO 2: UBICACIÓN */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                  Ubicación Física
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Ej. Av. Principal #123, Piso 3"
                  value={form.ubicacion}
                  onChange={(e) => handleChange('ubicacion', e.target.value)}
                  error={!!errors.ubicacion}
                  helperText={errors.ubicacion}
                  InputProps={{
                    startAdornment: <PlaceIcon color="action" sx={{ mr: 1, opacity: 0.7 }} />,
                  }}
                />
              </Box>

            </Stack>
          </SectionCard>

          {/* BOTONES DE ACCIÓN */}
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="inherit" 
              startIcon={<CancelIcon />}
              onClick={() => navigate(routes.dataCenters())}
              sx={{ 
                minWidth: 140,
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'rgba(0, 0, 0, 0.23)'
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
                background: 'linear-gradient(135deg, #1565C0 0%, #7B1FA2 100%)',
                boxShadow: 4,
                px: 3,
                minWidth: 160,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700
              }}
            >
              {isEdit ? 'Guardar Cambios' : 'Registrar'}
            </LoadingButton>
          </Box>

        </Box>
      </Card>
    </Box>
  )
}