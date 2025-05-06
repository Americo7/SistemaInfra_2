import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
import { useAuth } from 'src/auth' // Importa el hook de autenticación
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
  const { currentUser } = useAuth() // Obtiene el usuario actual autenticado
  const { data: parametrosData, loading: loadingParametros } = useQuery(GET_PARAMETROS)
  const [selectedTipoCluster, setSelectedTipoCluster] = useState(null)

  useEffect(() => {
    if (!loadingParametros && props.cluster?.cod_tipo_cluster) {
      const tipoCluster = parametrosData?.parametros?.find(
        (param) => param.grupo === 'TIPO_CLUSTER' && param.codigo === props.cluster.cod_tipo_cluster
      )
      if (tipoCluster) {
        setSelectedTipoCluster({
          value: tipoCluster.codigo,
          label: tipoCluster.nombre
        })
      }
    }
  }, [loadingParametros, props.cluster, parametrosData])

  const parametrosDeCluster = parametrosData?.parametros?.filter((param) => {
    return param.grupo === 'TIPO_CLUSTER'
  }) || []

  const tipoClusterOptions = parametrosDeCluster.map((cluster) => ({
    value: cluster.codigo,
    label: cluster.nombre,
  }))

  const onSubmit = (data) => {
    // Utiliza el ID del usuario actual para los campos de usuario_creacion y usuario_modificacion
    const formData = {
      ...data,
      cod_tipo_cluster: selectedTipoCluster?.value,
      estado: 'ACTIVO',
      usuario_modificacion: currentUser?.id, // ID del usuario actual
      usuario_creacion: props.cluster?.id ? props.cluster.usuario_creacion : currentUser?.id, // Si es edición, mantiene el usuario de creación original
    }
    props.onSave(formData, props?.cluster?.id)
  }

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '50px',
      borderRadius: '8px',
      borderColor: state.isFocused ? theme.palette.primary.main : theme.palette.divider,
      boxShadow: state.isFocused ? `0 0 0 1px ${theme.palette.primary.main}` : 'none',
      '&:hover': {
        borderColor: theme.palette.primary.main,
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? theme.palette.primary.light
        : state.isFocused
        ? theme.palette.action.hover
        : 'transparent',
      color: state.isSelected
        ? theme.palette.primary.contrastText
        : theme.palette.text.primary,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }

  if (loadingParametros) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography>Cargando datos...</Typography>
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
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 3,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          marginTop: '-1px',
        }}
      >
        <Typography variant="h5" fontWeight="600">
          {props.cluster?.id ? 'Editar Cluster' : 'Nuevo Cluster'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {props.cluster?.id ? 'Actualice la información del cluster' : 'Complete la información para crear un nuevo cluster'}
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Form onSubmit={onSubmit} error={props.error}>
          <FormError
            error={props.error}
            wrapperStyle={{
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.contrastText,
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            titleStyle={{
              fontWeight: '600',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            listStyle={{
              listStyleType: 'none',
              padding: 0,
              margin: 0,
            }}
          />

          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Label
                name="nombre"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                <Title fontSize="small" sx={{ mr: 1 }} />
                Nombre*
              </Label>
              <TextField
                name="nombre"
                defaultValue={props.cluster?.nombre}
                validation={{ required: true }}
                style={{
                  minHeight: '50px',
                  borderRadius: '8px',
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.9375rem',
                }}
                errorStyle={{
                  border: `1px solid ${theme.palette.error.main}`,
                  backgroundColor: theme.palette.error.light,
                }}
              />
              <FieldError
                name="nombre"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Label
                name="cod_tipo_cluster"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                <Category fontSize="small" sx={{ mr: 1 }} />
                Tipo de Cluster*
              </Label>
              <Select
                name="cod_tipo_cluster"
                options={tipoClusterOptions}
                value={selectedTipoCluster}
                onChange={setSelectedTipoCluster}
                styles={customSelectStyles}
                classNamePrefix="select"
                placeholder="Seleccionar tipo de cluster..."
                noOptionsMessage={() => 'No hay tipos de cluster disponibles'}
                isClearable
                required
              />
              <FieldError
                name="cod_tipo_cluster"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Label
                name="descripcion"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                <Description fontSize="small" sx={{ mr: 1 }} />
                Descripción*
              </Label>
              <TextField
                name="descripcion"
                defaultValue={props.cluster?.descripcion}
                validation={{ required: true }}
                style={{
                  minHeight: '50px',
                  borderRadius: '8px',
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.9375rem',
                }}
                errorStyle={{
                  border: `1px solid ${theme.palette.error.main}`,
                  backgroundColor: theme.palette.error.light,
                }}
              />
              <FieldError
                name="descripcion"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={props.loading}
              loadingPosition="start"
              startIcon={props.loading ? null : <CheckCircleOutline fontSize="small" />}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '0.9375rem',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
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
