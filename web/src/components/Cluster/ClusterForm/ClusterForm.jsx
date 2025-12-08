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
  FormControl
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
  Link as LinkIcon
} from '@mui/icons-material'
import { useQuery, gql } from '@redwoodjs/web'

/* --------------------------------------------------------
 * 1. QUERY INTERNA (El Form carga sus propias listas)
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
 * Componentes Auxiliares
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
 * ClusterForm Principal
 * -------------------------------------------------------- */
const ClusterForm = ({ cluster = null, onSave, loading, error }) => {
  const theme = useTheme()
  const isEdit = Boolean(cluster?.id)

  // 1. CARGA DE DATOS AUXILIARES
  const { data: remoteData, loading: loadingData } = useQuery(GET_FORM_DATA)
  
  const listaParametros = remoteData?.parametros || []

  // Estados del Formulario
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    cod_tipo_cluster: null,
    identity_key: '',
  })

  // Estados de Selects
  const [selectedTipoCluster, setSelectedTipoCluster] = useState(null)

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // 2. EFECTO PARA CARGAR DATOS EN EDICIÓN
  useEffect(() => {
    // Si estamos editando y ya llegaron los datos de la query interna
    if (!loadingData && cluster) {
      setForm({
        nombre: cluster.nombre ?? '',
        descripcion: cluster.descripcion ?? '',
        cod_tipo_cluster: cluster.cod_tipo_cluster ?? null,
        identity_key: cluster.identity_key ?? '',
      })

      // Mapear Tipo Cluster
      if (cluster.cod_tipo_cluster && listaParametros.length > 0) {
        const match = listaParametros.find(
          (p) => p.grupo === 'TIPO_CLUSTER' && p.codigo === cluster.cod_tipo_cluster
        )
        if (match) setSelectedTipoCluster({ value: match.codigo, label: match.nombre })
      }
    }
  }, [cluster, loadingData, listaParametros])

  // 3. PREPARAR OPCIONES PARA SELECTS
  const tipoClusterOptions = useMemo(() => 
    listaParametros
      .filter((p) => p.grupo === 'TIPO_CLUSTER')
      .map((p) => ({ value: p.codigo, label: p.nombre })), 
  [listaParametros])

  // Estilos Select
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

  // Handlers
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
      // Endpoints gestionados por backend (setup-calico-ipam.sh)
      id_proxmox_endpoint: null,
      id_k8s_endpoint: null,
      estado: 'ACTIVO',
    }

    try {
      await onSave(payload, cluster?.id)
    } finally {
      setSubmitting(false)
    }
  }

  // Helper visual para identity_key
  const isIdentityLocked = useMemo(() => {
    if (!form.identity_key) return false
    return form.identity_key.startsWith('manual:') || form.identity_key.startsWith('sync:')
  }, [form.identity_key])

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', p: 2 }}>
      <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        
        {/* HEADER */}
        <Box sx={{ px: 4, py: 4, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff' }}>
          <Avatar sx={{ 
            width: 48, height: 48, 
            background: 'linear-gradient(135deg, #1565C0, #7B1FA2)', 
            color: 'white', boxShadow: 3 
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
          {error && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
              <ErrorIcon color="error" />
              <Typography variant="body2" fontWeight={600}>{error?.message || 'Error al guardar el registro'}</Typography>
            </Paper>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
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

                {/* Tipo de Cluster */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                    Tipo de Cluster *
                  </Typography>
                  <Select
                    value={selectedTipoCluster}
                    onChange={(v) => {
                      setSelectedTipoCluster(v)
                    }}
                    options={tipoClusterOptions}
                    styles={customSelectStyles}
                    placeholder={loadingData ? "Cargando..." : "Seleccionar tipo..."}
                    isLoading={loadingData}
                  />
                  {errors.cod_tipo_cluster && <Typography color="error" variant="caption" sx={{ ml: 1, mt: 0.5, display: 'block' }}>{errors.cod_tipo_cluster}</Typography>}
                </Box>

                {/* Identity Key (Read-only) */}
                <FormControl fullWidth>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                      Identificador (Key)
                    </Typography>
                    <TextField 
                      size="small" 
                      value={form.identity_key || (isEdit ? 'No disponible' : 'Se generará automáticamente...')} 
                      disabled={true} 
                      InputProps={{ 
                        readOnly: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                {isIdentityLocked ? <LockIcon fontSize="small" color="disabled" /> : <LinkIcon fontSize="small" color="disabled" />}
                            </InputAdornment>
                        ),
                        style: { backgroundColor: '#f5f5f5', color: '#777' }
                      }} 
                      helperText={
                        isEdit 
                          ? "Clave gestionada por el sistema (No editable)." 
                          : "La clave se asignará al guardar."
                      }
                    />
                </FormControl>

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

              </Stack>
            </SectionCard>

            {/* Botones */}
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
                  boxShadow: 4, minWidth: 160, borderRadius: 2, textTransform: 'none', fontWeight: 700
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