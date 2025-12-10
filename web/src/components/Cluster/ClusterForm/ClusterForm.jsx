import React, { useState, useEffect, useMemo } from 'react'
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
  useTheme,
  InputAdornment,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import Select from 'react-select'
import { navigate, routes } from '@redwoodjs/router'
import {
  Info as InfoIcon,
  Dns as ClusterIcon,
  Description as DescIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  ErrorOutline as ErrorIcon,
  Lock as LockIcon,
  Link as LinkIcon,
  VpnKey as KeyIcon
} from '@mui/icons-material'
import { useQuery, gql } from '@redwoodjs/web'

/* --------------------------------------------------------
 * QUERY AUXILIAR
 * -------------------------------------------------------- */
const GET_FORM_DATA = gql`
  query GetClusterFormData {
    parametros: parametrosFormularioCluster {
      id
      codigo
      nombre
      grupo
    }
  }
`

/* --------------------------------------------------------
 * COMPONENTE CARD SECCIÓN (Helper)
 * -------------------------------------------------------- */
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

/* --------------------------------------------------------
 * FORMULARIO PRINCIPAL
 * -------------------------------------------------------- */
const ClusterForm = ({ cluster = null, onSave, loading, error }) => {
  const theme = useTheme()
  const isEdit = Boolean(cluster?.id)

  const { data, loading: loadingData } = useQuery(GET_FORM_DATA)
  const listaParametros = data?.parametros || []

  // --- ESTADOS ---
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    cod_tipo_cluster: null,
    identity_key: '',
  })

  const [selectedTipoCluster, setSelectedTipoCluster] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // --- EFECTO CARGA DE DATOS ---
  useEffect(() => {
    if (!loadingData && cluster) {
      setForm({
        nombre: cluster.nombre ?? '',
        descripcion: cluster.descripcion ?? '',
        cod_tipo_cluster: cluster.cod_tipo_cluster ?? null,
        identity_key: cluster.identity_key ?? '',
      })

      const match = listaParametros.find(
        (p) => p.grupo === 'TIPO_CLUSTER' && p.codigo === cluster.cod_tipo_cluster
      )
      if (match) {
        setSelectedTipoCluster({ value: match.codigo, label: match.nombre })
      }
    }
  }, [cluster, loadingData, listaParametros])

  // --- OPCIONES SELECT ---
  const tipoClusterOptions = useMemo(
    () =>
      listaParametros
        .filter((p) => p.grupo === 'TIPO_CLUSTER')
        .map((p) => ({ value: p.codigo, label: p.nombre })),
    [listaParametros]
  )

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: 8, // Coincide con MUI size="small" aprox
      minHeight: 40,
      borderColor: state.isFocused
        ? theme.palette.primary.main
        : 'rgba(0, 0, 0, 0.23)', // Borde estándar de MUI
      boxShadow: state.isFocused
        ? `0 0 0 1px ${theme.palette.primary.main}`
        : 'none',
      '&:hover': { borderColor: theme.palette.text.primary },
    }),
    menu: (base) => ({ ...base, zIndex: 999999 }),
    valueContainer: (base) => ({...base, padding: '2px 8px'}),
  }

  // --- VALIDACIÓN ---
  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!selectedTipoCluster?.value)
      e.cod_tipo_cluster = 'Selecciona el tipo de cluster'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      cod_tipo_cluster: selectedTipoCluster?.value || null,
      id_proxmox_endpoint: null, // Campos ocultos/future
      id_k8s_endpoint: null,
      estado: 'ACTIVO',
    }

    setSubmitting(true)
    try {
      await onSave(payload, cluster?.id)
    } finally {
      setSubmitting(false)
    }
  }

  // --- LOGICA VISUAL IDENTITY KEY ---
  const isIdentityLocked = useMemo(() => {
    const key = form.identity_key
    return key?.startsWith('manual:') || key?.startsWith('sync:')
  }, [form.identity_key])

  return (
    // CARD PRINCIPAL: Ancho completo según Layout
    <Box sx={{ width: '100%', maxWidth: 1500, mx: 'auto' }}>
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
          px: 5, py: 4, bgcolor: '#fff',
          borderTopLeftRadius: 16, borderTopRightRadius: 16,
        }}>
          {/* Wrapper centrado para alinear con el formulario */}
          <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 38, height: 38,
                background: 'linear-gradient(135deg, #1565C0, #7B1FA2)',
                color: 'white', boxShadow: 3
              }}
            >
              {isEdit ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, color: '#000', mb: 0.5 }}>
                {isEdit ? 'Editar Cluster' : 'Crear Cluster'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? 'Modificar información del cluster' : 'Registro de nuevo cluster'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* CONTENIDO DEL FORMULARIO */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          
          {/* WRAPPER CENTRADO: Limita el ancho a 800px */}
          <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>

            {/* Mensaje de Error */}
            {error && (
              <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                <ErrorIcon color="error" />
                <Typography variant="body2" fontWeight={600}>{String(error)}</Typography>
              </Paper>
            )}

            {/* CARD UNIFICADO: INFORMACIÓN GENERAL */}
            <SectionCard title="Información General" icon={<InfoIcon sx={{ fontSize: 20 }} />} bgcolor={theme.palette.primary.main}>
              <Stack spacing={3}>

                {/* FILA 1: NOMBRE */}
                <FormControl fullWidth error={!!errors.nombre}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre del Cluster *</FormLabel>
                  <TextField
                    size="small"
                    placeholder="Ej. cluster-production-01"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ClusterIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

                {/* FILA 2: TIPO CLUSTER + IDENTIFICADOR (Lado a lado) */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
                    
                    {/* COL 1: TIPO DE CLUSTER */}
                    <FormControl fullWidth error={!!errors.cod_tipo_cluster}>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Tipo de Cluster *</FormLabel>
                        <Box>
                            <Select
                                value={selectedTipoCluster}
                                onChange={setSelectedTipoCluster}
                                options={tipoClusterOptions}
                                styles={customSelectStyles}
                                placeholder="Seleccionar..."
                                isLoading={loadingData}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                            />
                            {errors.cod_tipo_cluster && (
                                <FormHelperText error>{errors.cod_tipo_cluster}</FormHelperText>
                            )}
                        </Box>
                    </FormControl>

                    {/* COL 2: IDENTITY KEY */}
                    <FormControl fullWidth>
                        <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Identity Key (Auto)</FormLabel>
                        <TextField
                            size="small"
                            value={form.identity_key || (isEdit ? 'No asignado' : 'Generado al guardar...')}
                            disabled
                            InputProps={{
                                readOnly: true,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {isIdentityLocked ? <LockIcon fontSize="small" /> : <KeyIcon fontSize="small" />}
                                    </InputAdornment>
                                ),
                                style: { backgroundColor: theme.palette.action.hover, color: theme.palette.text.secondary, fontSize: '0.85rem' }
                            }}
                        />
                    </FormControl>

                </Box>

                {/* FILA 3: DESCRIPCIÓN */}
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Descripción</FormLabel>
                  <TextField
                    size="small"
                    placeholder="Detalles adicionales del cluster..."
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mt: 1, alignSelf: 'flex-start' }}>
                          <DescIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

              </Stack>
            </SectionCard>

            {/* BOTONES */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={() => navigate(routes.clusters())}
                sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(0, 0, 0, 0.23)' }}
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
                    boxShadow: 4, px: 4, minWidth: 160, borderRadius: 2, textTransform: 'none', fontWeight: 700
                }}
                >
                {isEdit ? 'Guardar Cambios' : 'Registrar Cluster'}
                </LoadingButton>
            </Box>

          </Box> {/* Fin Wrapper Centrado */}

        </Box>
      </Card>
    </Box>
  )
}

export default ClusterForm