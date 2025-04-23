import { useState } from 'react'
import Select from 'react-select'
import { Form, FormError, FieldError, Label, TextField } from '@redwoodjs/forms'
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
  Description,
  Category,
  Title,
} from '@mui/icons-material'

const GET_PARAMETROS = gql`
  query GetParametrosRoles {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`

const RoleForm = (props) => {
  const theme = useTheme()
  const { data: parametrosData, loading: parametrosLoading } = useQuery(GET_PARAMETROS)

  const [selectedTipoRol, setSelectedTipoRol] = useState(props.role?.cod_tipo_rol || null)

  const parametrosDeEntorno = parametrosData?.parametros?.filter((param) => {
    return param.grupo === 'TIPO_ROL'
  }) || []

  const tipoRolOptions = parametrosDeEntorno.map((tipoRol) => ({
    value: tipoRol.codigo,
    label: tipoRol.nombre,
  }))

  const onSubmit = (data) => {
    const formData = {
      ...data,
      cod_tipo_rol: selectedTipoRol,
      estado: props.role?.id ? data.estado : 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.role?.id)
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

  if (parametrosLoading) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography>Cargando...</Typography>
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
          {props.role?.id ? 'Editar Rol' : 'Nuevo Rol'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {props.role?.id ? 'Actualice la información del rol' : 'Complete la información para crear un nuevo rol'}
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
            <Grid item xs={12} md={6}>
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
                Nombre
              </Label>
              <TextField
                name="nombre"
                defaultValue={props.role?.nombre || ''}
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

            <Grid item xs={12} md={6}>
              <Label
                name="cod_tipo_rol"
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
                Tipo de Rol
              </Label>
              <Select
                name="cod_tipo_rol"
                value={tipoRolOptions.find((option) => option.value === selectedTipoRol) || null}
                options={tipoRolOptions}
                onChange={(selectedOption) => setSelectedTipoRol(selectedOption?.value || null)}
                styles={customSelectStyles}
                classNamePrefix="select"
                isClearable
                placeholder="Seleccionar tipo de rol..."
                noOptionsMessage={() => 'No hay tipos de rol disponibles'}
              />
              <FieldError
                name="cod_tipo_rol"
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
                Descripción
              </Label>
              <TextField
                name="descripcion"
                defaultValue={props.role?.descripcion || ''}
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
              {props.loading ? 'Guardando...' : 'Guardar Rol'}
            </LoadingButton>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default RoleForm
