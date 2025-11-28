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
  useTheme,
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
} from '@mui/icons-material'
import { useQuery } from '@redwoodjs/web'
import { gql } from 'graphql-tag'

/* --------------------------------------------------------
 * QUERY
 * -------------------------------------------------------- */
const GET_PARAMETROS = gql`
  query GetParametrosCluster {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`

/* --------------------------------------------------------
 * SectionCard (Card interno - Estilo preservado)
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
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: activeColor, width: 32, height: 32 }}>{icon}</Avatar>
        }
        title={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{title}</Typography>}
        sx={{ py: 1.5, px: 2, borderBottom: (t) => `1px solid ${t.palette.divider}` }}
      />
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  )
}

/* --------------------------------------------------------
 * ClusterForm
 * -------------------------------------------------------- */
const ClusterForm = ({ cluster = null, proxmoxEndpoints = [], k8sEndpoints = [], onSave, loading, error }) => {
  const theme = useTheme()
  const isEdit = Boolean(cluster?.id)

  const { data: parametrosData, loading: loadingParametros } = useQuery(GET_PARAMETROS)

  // form state
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    cod_tipo_cluster: null,
    id_proxmox_endpoint: null,
    id_k8s_endpoint: null,
  })

  // select states
  const [selectedTipoCluster, setSelectedTipoCluster] = useState(null)
  const [selectedProxmoxEndpoint, setSelectedProxmoxEndpoint] = useState(null)
  const [selectedK8sEndpoint, setSelectedK8sEndpoint] = useState(null)

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loadingParametros && cluster) {
      setForm((prev) => ({
        ...prev,
        nombre: cluster.nombre ?? '',
        descripcion: cluster.descripcion ?? '',
        cod_tipo_cluster: cluster.cod_tipo_cluster ?? null,
        id_proxmox_endpoint: cluster.id_proxmox_endpoint ?? null,
        id_k8s_endpoint: cluster.id_k8s_endpoint ?? null,
      }))

      if (cluster.cod_tipo_cluster && parametrosData?.parametros) {
        const match = parametrosData.parametros.find(
          (p) => p.grupo === 'TIPO_CLUSTER' && p.codigo === cluster.cod_tipo_cluster
        )
        if (match) setSelectedTipoCluster({ value: match.codigo, label: match.nombre })
      }

      if (cluster.id_proxmox_endpoint && proxmoxEndpoints) {
        const m = proxmoxEndpoints.find((p) => p.id === cluster.id_proxmox_endpoint)
        if (m) setSelectedProxmoxEndpoint({ value: m.id, label: `${m.nombre} (${m.ip || m.dominio})` })
      }

      if (cluster.id_k8s_endpoint && k8sEndpoints) {
        const k = k8sEndpoints.find((k) => k.id === cluster.id_k8s_endpoint)
        if (k) setSelectedK8sEndpoint({ value: k.id, label: k.nombre })
      }
    }
  }, [loadingParametros, parametrosData, cluster, proxmoxEndpoints, k8sEndpoints])

  const tipoClusterOptions =
    parametrosData?.parametros?.filter((p) => p.grupo === 'TIPO_CLUSTER')?.map((p) => ({ value: p.codigo, label: p.nombre })) || []

  const proxmoxOptions = proxmoxEndpoints?.map((p) => ({ value: p.id, label: `${p.nombre} (${p.ip || p.dominio})` })) || []
  const k8sOptions = k8sEndpoints?.map((k) => ({ value: k.id, label: k.nombre })) || []

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 50,
      borderRadius: 8,
      borderColor: state.isFocused ? theme.palette.primary.main : theme.palette.divider,
      boxShadow: state.isFocused ? `0 0 0 1px ${theme.palette.primary.main}` : 'none',
      '&:hover': { borderColor: theme.palette.primary.main },
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
    if (!selectedTipoCluster?.value) e.cod_tipo_cluster = 'Selecciona el tipo de cluster'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!validate()) return
    setSubmitting(true)

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      cod_tipo_cluster: selectedTipoCluster?.value || null,
      id_proxmox_endpoint: selectedTipoCluster?.value === 'PX' ? selectedProxmoxEndpoint?.value || null : null,
      id_k8s_endpoint: selectedTipoCluster?.value === 'K8S' ? selectedK8sEndpoint?.value || null : null,
      estado: 'ACTIVO',
    }

    try {
      await onSave(payload, cluster?.id)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingParametros) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography>Cargando parámetros...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', p: 2 }}>
      
      {/* CARD PRINCIPAL */}
      <Card 
        elevation={3} 
        sx={{ 
          borderRadius: 4, // Bordes más redondeados
          overflow: 'hidden' // Asegura que el contenido respete los bordes redondeados
        }}
      >
        
        {/* HEADER MODIFICADO: Fondo blanco y sin línea */}
        <Box sx={{
          px: 4,
          py: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: '#fff', // Fondo blanco
          // Sin borderBottom
        }}>
          <Avatar sx={{ 
            width: 48, 
            height: 48, 
            background: 'linear-gradient(135deg, #1565C0, #7B1FA2)', 
            color: 'white', 
            boxShadow: 3 
          }}>
            {isEdit ? <EditIcon /> : <AddIcon />}
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight={800} sx={{
              lineHeight: 1.2,
              background: 'linear-gradient(90deg, #1565C0 0%, #7B1FA2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              {isEdit ? 'Editar Cluster' : 'Registro de Cluster'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestión de clústeres de infraestructura
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: 5, pb: 5, pt: 0, bgcolor: '#fff' }}>
          
          {/* Mensaje de Error */}
          {error && (
            <Paper sx={{
              p: 2, mb: 3, bgcolor: '#fff4f4', borderColor: '#ffcdd2',
              color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2
            }}>
              <ErrorIcon color="error" />
              <Typography variant="body2" fontWeight={600}>{error?.message || 'Error al guardar el registro'}</Typography>
            </Paper>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            
            {/* SectionCard Único con Stack vertical */}
            <SectionCard icon={<InfoIcon />} title="Información" bgcolor={theme.palette.primary.main}>
              <Stack spacing={3}>
                
                {/* Nombre */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                    Nombre del Cluster *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej. cluster-production"
                    value={form.nombre}
                    onChange={(ev) => handleChange('nombre', ev.target.value)}
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                    InputProps={{ startAdornment: <ClusterIcon color="action" sx={{ mr: 1, opacity: 0.7 }} /> }}
                  />
                </Box>

                {/* Tipo */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                    Tipo de Cluster *
                  </Typography>
                  <Select
                    value={selectedTipoCluster}
                    onChange={(v) => {
                      setSelectedTipoCluster(v)
                      setSelectedProxmoxEndpoint(null)
                      setSelectedK8sEndpoint(null)
                    }}
                    options={tipoClusterOptions}
                    styles={customSelectStyles}
                    placeholder="Seleccionar tipo..."
                  />
                  {errors.cod_tipo_cluster && <Typography color="error" variant="caption" sx={{ ml: 1, mt: 0.5, display: 'block' }}>{errors.cod_tipo_cluster}</Typography>}
                </Box>

                {/* Descripción */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                    Descripción
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Descripción breve del cluster"
                    value={form.descripcion}
                    onChange={(ev) => handleChange('descripcion', ev.target.value)}
                    error={!!errors.descripcion}
                    helperText={errors.descripcion}
                    InputProps={{ startAdornment: <DescIcon color="action" sx={{ mr: 1, opacity: 0.7 }} /> }}
                  />
                </Box>

                {/* Endpoint Proxmox (Condicional) */}
                {selectedTipoCluster?.value === 'PX' && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                      Endpoint Proxmox
                    </Typography>
                    <Select
                      value={selectedProxmoxEndpoint}
                      onChange={setSelectedProxmoxEndpoint}
                      options={proxmoxOptions}
                      styles={customSelectStyles}
                      placeholder="Seleccionar endpoint Proxmox..."
                      isClearable
                    />
                    {errors.id_proxmox_endpoint && <Typography color="error" variant="caption" sx={{ ml: 1, mt: 0.5, display: 'block' }}>{errors.id_proxmox_endpoint}</Typography>}
                  </Box>
                )}

                {/* Endpoint K8s (Condicional) */}
                {selectedTipoCluster?.value === 'K8S' && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                      Endpoint Kubernetes
                    </Typography>
                    <Select
                      value={selectedK8sEndpoint}
                      onChange={setSelectedK8sEndpoint}
                      options={k8sOptions}
                      styles={customSelectStyles}
                      placeholder="Seleccionar API K8s..."
                      isClearable
                    />
                    {errors.id_k8s_endpoint && <Typography color="error" variant="caption" sx={{ ml: 1, mt: 0.5, display: 'block' }}>{errors.id_k8s_endpoint}</Typography>}
                  </Box>
                )}
              </Stack>
            </SectionCard>

            {/* Botones de Acción */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={() => navigate(routes.clusters())}
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
                  minWidth: 160,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700
                }}
              >
                {isEdit ? 'Guardar Cambios' : 'Guardar Cluster'}
              </LoadingButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ClusterForm