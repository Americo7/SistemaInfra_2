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
 * COMPONENTE CARD SECCIÓN
 * -------------------------------------------------------- */
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

/* --------------------------------------------------------
 * FORMULARIO PRINCIPAL
 * -------------------------------------------------------- */
const ClusterForm = ({ cluster = null, onSave, loading, error }) => {
  const theme = useTheme()
  const isEdit = Boolean(cluster?.id)

  const { data, loading: loadingData } = useQuery(GET_FORM_DATA)
  const listaParametros = data?.parametros || []

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    cod_tipo_cluster: null,
    identity_key: '',
  })

  const [selectedTipoCluster, setSelectedTipoCluster] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  /* ------------------ CARGA DATOS EN EDICIÓN ------------------ */
  useEffect(() => {
    if (!loadingData && cluster) {
      setForm({
        nombre: cluster.nombre ?? '',
        descripcion: cluster.descripcion ?? '',
        cod_tipo_cluster: cluster.cod_tipo_cluster ?? null,
        identity_key: cluster.identity_key ?? '',
      })

      const match = listaParametros.find(
        (p) =>
          p.grupo === 'TIPO_CLUSTER' &&
          p.codigo === cluster.cod_tipo_cluster
      )
      if (match) {
        setSelectedTipoCluster({ value: match.codigo, label: match.nombre })
      }
    }
  }, [cluster, loadingData, listaParametros])

  /* ------------------ OPCIONES SELECT ------------------ */
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
      borderRadius: 8,
      minHeight: 50,
      borderColor: state.isFocused
        ? theme.palette.primary.main
        : theme.palette.divider,
      boxShadow: state.isFocused
        ? `0 0 0 1px ${theme.palette.primary.main}`
        : 'none',
      '&:hover': { borderColor: theme.palette.primary.main },
    }),
    menu: (base) => ({ ...base, zIndex: 999999 }),
  }

  /* ------------------ VALIDACIÓN ------------------ */
  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!selectedTipoCluster?.value)
      e.cod_tipo_cluster = 'Selecciona el tipo de cluster'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ------------------ GUARDAR ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      cod_tipo_cluster: selectedTipoCluster?.value || null,
      id_proxmox_endpoint: null,
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

  /* ------------------ CONTROL DE KEY ------------------ */
  const isIdentityLocked = useMemo(() => {
    const key = form.identity_key
    return key?.startsWith('manual:') || key?.startsWith('sync:')
  }, [form.identity_key])

  /* --------------------------------------------------------
   * RENDER DEL FORMULARIO
   * -------------------------------------------------------- */
  return (
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

        {/* CONTENIDO PRINCIPAL */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>

          {error && (
            <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
              <ErrorIcon color="error" />
              <Typography variant="body2" fontWeight={600}>{String(error)}</Typography>
            </Paper>
          )}

          {/* GRID DE SECCIONES */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 3,
            alignItems: 'start'
          }}>

            {/* CARD: INFORMACIÓN GENERAL */}
            <SectionCard title="Información General" icon={<InfoIcon />} color={theme.palette.primary.main}>
              <Stack spacing={2.5}>

                <FormControl fullWidth error={!!errors.nombre}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre del Cluster *</FormLabel>
                  <TextField
                    size="small"
                    placeholder="Ej. cluster-production"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ClusterIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {errors.nombre && <FormHelperText>{errors.nombre}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={!!errors.cod_tipo_cluster}>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Tipo de Cluster *</FormLabel>
                  <Box sx={{ width: '100%' }}>
                    <Select
                      value={selectedTipoCluster}
                      onChange={setSelectedTipoCluster}
                      options={tipoClusterOptions}
                      styles={customSelectStyles}
                      placeholder="Seleccionar tipo…"
                      isLoading={loadingData}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </Box>
                  {errors.cod_tipo_cluster && <FormHelperText>{errors.cod_tipo_cluster}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Descripción</FormLabel>
                  <TextField
                    size="small"
                    placeholder="Descripción breve del cluster"
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

              </Stack>
            </SectionCard>

            {/* CARD: IDENTIFICADOR */}
            <SectionCard title="Identificador" icon={<LinkIcon />} color={theme.palette.secondary.main}>
              <Stack spacing={2.5}>

                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Identity Key</FormLabel>
                  <TextField
                    size="small"
                    value={
                      form.identity_key ||
                      (isEdit ? 'No disponible' : 'Se generará al guardar...')
                    }
                    disabled={true}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          {isIdentityLocked ? (
                            <LockIcon fontSize="small" color="disabled" />
                          ) : (
                            <LinkIcon fontSize="small" color="disabled" />
                          )}
                        </InputAdornment>
                      ),
                      style: { backgroundColor: '#f5f5f5', color: '#777' }
                    }}
                    helperText={
                      isEdit
                        ? (isIdentityLocked ? 'Clave de sincronización externa (No editable).' : 'Clave gestionada por el sistema.')
                        : 'La clave se asignará automáticamente al guardar.'
                    }
                  />
                </FormControl>

              </Stack>
            </SectionCard>

          </Box>

          {/* BOTONES ACCIÓN */}
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

        </Box>
      </Card>
    </Box>
  )
}

export default ClusterForm
