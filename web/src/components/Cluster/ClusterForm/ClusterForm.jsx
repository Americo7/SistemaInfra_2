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
const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  const color = bgcolor || theme.palette.primary.main

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderTop: `3px solid ${color}`,
      }}
    >
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: color }}>{icon}</Avatar>}
        title={<Typography fontWeight={700}>{title}</Typography>}
        sx={{ py: 1.5, px: 2 }}
      />
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
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
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
      <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {/* HEADER */}
        <Box
          sx={{
            px: 4,
            py: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: '#fff',
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #1565C0, #7B1FA2)',
              color: '#fff',
            }}
          >
            {isEdit ? <EditIcon /> : <AddIcon />}
          </Avatar>

          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(90deg, #1565C0 0%, #7B1FA2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {isEdit ? 'Editar Cluster' : 'Registro de Cluster'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Gestión de clústeres de infraestructura
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: 5, pb: 5 }}>
          {error && (
            <Paper
              sx={{
                p: 2,
                mb: 3,
                bgcolor: '#fff4f4',
                color: '#c62828',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <ErrorIcon color="error" />
              <Typography>{error.message}</Typography>
            </Paper>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <SectionCard title="Información" icon={<InfoIcon />}>

              <Stack spacing={3}>

                {/* ------------------ NOMBRE ------------------ */}
                <Box>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Nombre del Cluster *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej. cluster-production"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                    InputProps={{
                      startAdornment: (
                        <ClusterIcon sx={{ mr: 1, opacity: 0.7 }} />
                      ),
                    }}
                  />
                </Box>

                {/* ------------------ TIPO + KEY EN LA MISMA FILA ------------------ */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 3,
                    alignItems: 'start',
                  }}
                >
                  {/* Tipo */}
                  <Box sx={{ width: '100%' }}>
                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                      Tipo de Cluster *
                    </Typography>

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

                    {errors.cod_tipo_cluster && (
                      <Typography color="error" variant="caption">
                        {errors.cod_tipo_cluster}
                      </Typography>
                    )}
                  </Box>

                  {/* Identity Key */}
                  <FormControl fullWidth>
                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                      Identificador (Key)
                    </Typography>

                    <TextField
                      size="small"
                      disabled
                      value={
                        form.identity_key ||
                        (isEdit
                          ? 'No disponible'
                          : 'Se generará automáticamente…')
                      }
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            {isIdentityLocked ? (
                              <LockIcon color="disabled" />
                            ) : (
                              <LinkIcon color="disabled" />
                            )}
                          </InputAdornment>
                        ),
                        style: {
                          backgroundColor: '#f5f5f5',
                          color: '#777',
                        },
                      }}
                      helperText={
                        isEdit
                          ? 'Clave gestionada por el sistema.'
                          : 'La clave se asignará al guardar.'
                      }
                    />
                  </FormControl>
                </Box>

                {/* ------------------ DESCRIPCIÓN ------------------ */}
                <Box>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Descripción
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Descripción breve del cluster"
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <DescIcon sx={{ mr: 1, opacity: 0.7 }} />
                      ),
                    }}
                  />
                </Box>

              </Stack>
            </SectionCard>

            {/* BOTONES */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={() => navigate(routes.clusters())}
              >
                Cancelar
              </Button>

              <LoadingButton
                type="submit"
                variant="contained"
                loading={loading || submitting}
                startIcon={<SaveIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #1565C0, #7B1FA2)',
                  fontWeight: 700,
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
