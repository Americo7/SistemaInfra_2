import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  useTheme,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  CheckCircleOutline,
  Category,
  Title,
  Description,
  Dns,
} from '@mui/icons-material'
import Select from 'react-select'
import React, { useState, useEffect } from 'react'

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

const ClusterForm = (props) => {
  const theme = useTheme()
  const { data: parametrosData, loading: loadingParametros } = useQuery(GET_PARAMETROS)

  // Valores iniciales
  const [selectedTipoCluster, setSelectedTipoCluster] = useState(null)
  const [selectedProxmoxEndpoint, setSelectedProxmoxEndpoint] = useState(null)
  const [selectedK8sEndpoint, setSelectedK8sEndpoint] = useState(null)

  /* ------------------------------------------
   * CARGAR VALORES INICIALES DEL CLUSTER
   * ------------------------------------------ */
  useEffect(() => {
    if (!loadingParametros && props.cluster) {
      // Tipo cluster
      if (props.cluster.cod_tipo_cluster) {
        const match = parametrosData?.parametros?.find(
          (p) =>
            p.grupo === 'TIPO_CLUSTER' &&
            p.codigo === props.cluster.cod_tipo_cluster
        )
        if (match) {
          setSelectedTipoCluster({ value: match.codigo, label: match.nombre })
        }
      }

      // Proxmox endpoint
      if (props.cluster.id_proxmox_endpoint) {
        const match = props.proxmoxEndpoints?.find(
          (p) => p.id === props.cluster.id_proxmox_endpoint
        )
        if (match) {
          setSelectedProxmoxEndpoint({
            value: match.id,
            label: match.nombre,
          })
        }
      }

      // K8s endpoint
      if (props.cluster.id_k8s_endpoint) {
        const match = props.k8sEndpoints?.find(
          (k) => k.id === props.cluster.id_k8s_endpoint
        )
        if (match) {
          setSelectedK8sEndpoint({
            value: match.id,
            label: match.nombre,
          })
        }
      }
    }
  }, [loadingParametros, props.cluster, parametrosData])

  /* ------------------------------------------
   * PARÁMETROS DE TIPO CLUSTER
   * ------------------------------------------ */
  const parametrosDeCluster =
    parametrosData?.parametros?.filter((p) => p.grupo === 'TIPO_CLUSTER') || []

  const tipoClusterOptions = parametrosDeCluster.map((p) => ({
    value: p.codigo,
    label: p.nombre,
  }))

  /* ------------------------------------------
   * OPCIONES ENDPOINTS
   * ------------------------------------------ */
  const proxmoxOptions =
    props.proxmoxEndpoints?.map((p) => ({
      value: p.id,
      label: `${p.nombre} (${p.ip || p.dominio})`,
    })) || []

  const k8sOptions =
    props.k8sEndpoints?.map((k) => ({
      value: k.id,
      label: `${k.nombre}`,
    })) || []

  /* ------------------------------------------
   * SUBMIT
   * ------------------------------------------ */
  const onSubmit = (data) => {
    const payload = {
      ...data,
      cod_tipo_cluster: selectedTipoCluster?.value || null,

      id_proxmox_endpoint:
        selectedTipoCluster?.value === 'PX'
          ? selectedProxmoxEndpoint?.value || null
          : null,

      id_k8s_endpoint:
        selectedTipoCluster?.value === 'K8S'
          ? selectedK8sEndpoint?.value || null
          : null,

      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }

    props.onSave(payload, props?.cluster?.id)
  }

  /* ------------------------------------------
   * ESTILOS SELECT
   * ------------------------------------------ */
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '50px',
      borderRadius: '8px',
      borderColor: state.isFocused
        ? theme.palette.primary.main
        : theme.palette.divider,
      boxShadow: state.isFocused
        ? `0 0 0 1px ${theme.palette.primary.main}`
        : 'none',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }

  if (loadingParametros) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography>Cargando parámetros...</Typography>
      </Box>
    )
  }

  return (
    <Card
      sx={{
        maxWidth: '900px',
        margin: 'auto',
        boxShadow: theme.shadows[6],
        borderRadius: '12px',
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 3,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      >
        <Typography variant="h5" fontWeight="600">
          {props.cluster?.id ? 'Editar Cluster' : 'Nuevo Cluster'}
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Form onSubmit={onSubmit} error={props.error}>
          <FormError
            error={props.error}
            wrapperStyle={{
              backgroundColor: theme.palette.error.light,
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          />

          <Grid container spacing={4}>
            {/* NOMBRE */}
            <Grid item xs={12}>
              <Label name="nombre">Nombre*</Label>
              <TextField
                name="nombre"
                defaultValue={props.cluster?.nombre}
                validation={{ required: true }}
                className="rw-input"
                style={{ width: '100%', minHeight: '50px' }}
              />
              <FieldError name="nombre" />
            </Grid>

            {/* TIPO CLUSTER */}
            <Grid item xs={12}>
              <Label name="cod_tipo_cluster">Tipo de Cluster*</Label>
              <Select
                value={selectedTipoCluster}
                onChange={setSelectedTipoCluster}
                options={tipoClusterOptions}
                styles={customSelectStyles}
                placeholder="Seleccionar tipo..."
              />
              <FieldError name="cod_tipo_cluster" />
            </Grid>

            {/* DESCRIPCIÓN */}
            <Grid item xs={12}>
              <Label name="descripcion">Descripción*</Label>
              <TextField
                name="descripcion"
                defaultValue={props.cluster?.descripcion}
                validation={{ required: true }}
                className="rw-input"
                style={{ width: '100%' }}
              />
              <FieldError name="descripcion" />
            </Grid>

            {/* ------------------------------------------
                ENDPOINT PROXMOX SOLO SI PX
            ------------------------------------------ */}
            {selectedTipoCluster?.value === 'PX' && (
              <Grid item xs={12}>
                <Label name="id_proxmox_endpoint">
                  Endpoint de Proxmox*
                </Label>
                <Select
                  value={selectedProxmoxEndpoint}
                  onChange={setSelectedProxmoxEndpoint}
                  options={proxmoxOptions}
                  styles={customSelectStyles}
                  placeholder="Seleccionar endpoint Proxmox..."
                  isClearable
                />
              </Grid>
            )}

            {/* ------------------------------------------
                ENDPOINT K8S SOLO SI K8S
            ------------------------------------------ */}
            {selectedTipoCluster?.value === 'K8S' && (
              <Grid item xs={12}>
                <Label name="id_k8s_endpoint">Endpoint de Kubernetes*</Label>
                <Select
                  value={selectedK8sEndpoint}
                  onChange={setSelectedK8sEndpoint}
                  options={k8sOptions}
                  styles={customSelectStyles}
                  placeholder="Seleccionar API K8s..."
                  isClearable
                />
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={props.loading}
              startIcon={<CheckCircleOutline />}
            >
              {props.loading ? 'Guardando...' : 'Guardar Cluster'}
            </LoadingButton>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ClusterForm
