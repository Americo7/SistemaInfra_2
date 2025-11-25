import { useEffect, useState } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { useForm, Controller } from 'react-hook-form'
import { Form, FormError } from '@redwoodjs/forms'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  CircularProgress,
  Divider,
} from '@mui/material'

import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material'
import { navigate, routes } from '@redwoodjs/router'

// 1. QUERY PARA LLENAR LOS SELECTORES
const GET_FORM_DATA = gql`
  query GetFormData {
    clusters {
      id
      nombre
      cod_tipo_cluster
    }
    maquinas {
      id
      nombre
      ip
    }
    servidores {
      id
      nombre
      ip_primaria
    }
  }
`

const ClusterNodoForm = (props) => {
  // 2. Fetch de datos auxiliares
  const { data, loading: loadingData } = useQuery(GET_FORM_DATA)

  // 3. Configuración del formulario
  const formMethods = useForm({
    defaultValues: {
      clusterId: props.clusterNodo?.clusterId || '',
      nombre: props.clusterNodo?.nombre || '',
      nodoTipo: props.clusterNodo?.nodoTipo || 'VIRTUAL',
      maquinaId: props.clusterNodo?.maquinaId || null,
      servidorId: props.clusterNodo?.servidorId || null,
      rol: props.clusterNodo?.rol || '',
      k8s_uid: props.clusterNodo?.k8s_uid || '',
      estado: props.clusterNodo?.estado || 'ACTIVO',
    },
  })

  const { control, handleSubmit, watch, setValue, formState: { errors } } = formMethods

  // Observar el tipo de nodo para cambiar la UI dinámicamente
  const watchedNodoTipo = watch('nodoTipo')

  // Efecto para limpiar el campo contrario cuando cambia el tipo
  useEffect(() => {
    if (watchedNodoTipo === 'VIRTUAL') {
      setValue('servidorId', null)
    } else {
      setValue('maquinaId', null)
    }
  }, [watchedNodoTipo, setValue])

  // 4. Submit Handler
  const onSubmit = (data) => {
    // Asegurar tipos de datos correctos para el backend
    const inputData = {
      ...data,
      usuario_creacion: props.clusterNodo ? props.clusterNodo.usuario_creacion : 1, // TODO: Usar contexto de auth real
      usuario_modificacion: 1, // TODO: Usar contexto de auth real
      // Si es update, estos campos no deberian enviarse si no cambiaron, pero Prisma lo maneja bien
    }
    props.onSave(inputData, props?.clusterNodo?.id)
  }

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto' }}>
      <Form formMethods={formMethods} onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardHeader
            title={props.clusterNodo ? 'Editar Nodo de Cluster' : 'Nuevo Nodo de Cluster'}
            subheader="Complete la información del nodo y su asociación"
            sx={{ bgcolor: 'grey.100', borderBottom: '1px solid #e0e0e0' }}
          />
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>

              {/* --- SECCIÓN 1: DATOS BÁSICOS --- */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                  DATOS GENERALES
                </Typography>
              </Grid>

              {/* CLUSTER (Autocomplete) */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="clusterId"
                  control={control}
                  rules={{ required: 'El Cluster es obligatorio' }}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      options={data?.clusters || []}
                      getOptionLabel={(option) => `${option.nombre} (${option.cod_tipo_cluster})`}
                      value={data?.clusters.find((c) => c.id === value) || null}
                      onChange={(_, newValue) => onChange(newValue ? newValue.id : '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cluster *"
                          error={!!errors.clusterId}
                          helperText={errors.clusterId?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* NOMBRE */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="nombre"
                  control={control}
                  rules={{ required: 'El nombre es obligatorio' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre del Nodo *"
                      fullWidth
                      error={!!errors.nombre}
                      helperText={errors.nombre?.message}
                    />
                  )}
                />
              </Grid>

              {/* TIPO DE NODO (Radio) */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Tipo de Nodo:</Typography>
                  <Controller
                    name="nodoTipo"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel value="VIRTUAL" control={<Radio />} label="Virtual (VM)" />
                        <FormControlLabel value="FISICO" control={<Radio />} label="Físico (Bare Metal)" />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>

              {/* --- SECCIÓN 2: RECURSO ASOCIADO (CONDICIONAL) --- */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="primary" sx={{ my: 2, fontWeight: 'bold' }}>
                  RECURSO ASOCIADO
                </Typography>
              </Grid>

              {watchedNodoTipo === 'VIRTUAL' ? (
                // SELECTOR DE MÁQUINA
                <Grid item xs={12}>
                  <Controller
                    name="maquinaId"
                    control={control}
                    rules={{ required: watchedNodoTipo === 'VIRTUAL' ? 'Debe seleccionar una máquina' : false }}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        options={data?.maquinas || []}
                        getOptionLabel={(option) => `${option.nombre} - IP: ${option.ip || 'N/A'}`}
                        value={data?.maquinas.find((m) => m.id === value) || null}
                        onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Seleccionar Máquina Virtual *"
                            placeholder="Buscar por nombre o IP..."
                            error={!!errors.maquinaId}
                            helperText={errors.maquinaId?.message || "La VM que formará parte del cluster"}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              ) : (
                // SELECTOR DE SERVIDOR
                <Grid item xs={12}>
                  <Controller
                    name="servidorId"
                    control={control}
                    rules={{ required: watchedNodoTipo === 'FISICO' ? 'Debe seleccionar un servidor' : false }}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        options={data?.servidores || []}
                        getOptionLabel={(option) => `${option.nombre} - IP: ${option.ip_primaria || 'N/A'}`}
                        value={data?.servidores.find((s) => s.id === value) || null}
                        onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Seleccionar Servidor Físico *"
                            placeholder="Buscar servidor..."
                            error={!!errors.servidorId}
                            helperText={errors.servidorId?.message || "El servidor host que formará parte del cluster"}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              )}

              {/* --- SECCIÓN 3: DETALLES TÉCNICOS --- */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="primary" sx={{ my: 2, fontWeight: 'bold' }}>
                  DETALLES TÉCNICOS
                </Typography>
              </Grid>

              {/* K8S UID */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="k8s_uid"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kubernetes UID (Opcional)"
                      fullWidth
                      helperText="Identificador único del nodo en el clúster K8s"
                    />
                  )}
                />
              </Grid>

              {/* ROL */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="rol"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Rol en el Cluster"
                      placeholder="Ej: control-plane, worker, etcd"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              {/* ESTADO */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado *</InputLabel>
                  <Controller
                    name="estado"
                    control={control}
                    defaultValue="ACTIVO"
                    render={({ field }) => (
                      <Select {...field} label="Estado *">
                        <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                        <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>

            </Grid>
          </CardContent>

          {/* ACTIONS */}
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: 'grey.50' }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CancelIcon />}
              onClick={() => navigate(routes.clusterNodos())}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={props.loading}
            >
              {props.loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        </Card>
      </Form>
    </Box>
  )
}

export default ClusterNodoForm