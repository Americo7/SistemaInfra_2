import { useState, useEffect } from 'react'
import Select from 'react-select'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField as RedwoodTextField,
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
  InputAdornment,
  IconButton,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  CheckCircleOutline,
  ErrorOutline,
  HelpOutline,
} from '@mui/icons-material'

const OBTENER_SISTEMAS = gql`
  query ObtenerSistemasPadre {
    sistemas {
      id
      nombre
      estado
    }
  }
`

const OBTENER_ENTIDADES = gql`
  query ObtenerEntidades {
    entidads {
      id
      nombre
      estado
    }
  }
`

const SistemaForm = (props) => {
  const theme = useTheme()
  const { data: sistemasData } = useQuery(OBTENER_SISTEMAS)
  const { data: entidadesData } = useQuery(OBTENER_ENTIDADES)

  const [selectedPadre, setSelectedPadre] = useState(null)
  const [selectedEntidad, setSelectedEntidad] = useState(null)

  useEffect(() => {
    if (props.sistema) {
      setSelectedPadre(props.sistema.id_padre)
      setSelectedEntidad(props.sistema.id_entidad)
    }
  }, [props.sistema])

  const sistemasOptions =
    sistemasData?.sistemas
      ?.filter((s) => s.estado === 'ACTIVO')
      .map((s) => ({ value: s.id, label: s.nombre })) || []

  const entidadesOptions =
    entidadesData?.entidads
      ?.filter((e) => e.estado === 'ACTIVO')
      .map((e) => ({ value: e.id, label: e.nombre })) || []

  const onSubmit = (data) => {
    const formData = {
      ...data,
      id_padre: selectedPadre,
      id_entidad: selectedEntidad,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }

    if (props?.sistema?.id) {
      props.onSave(formData, props.sistema.id)
    } else {
      props.onSave(formData)
    }
  }

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '44px',
      borderRadius: '8px',
      borderColor: state.isFocused
        ? theme.palette.primary.main
        : theme.palette.divider,
      boxShadow: state.isFocused
        ? `0 0 0 1px ${theme.palette.primary.main}`
        : 'none',
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
  }

  return (
    <Card
      sx={{
        maxWidth: '1000px',
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
          {props.sistema?.id ? 'Editar Sistema' : 'Nuevo Sistema'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Complete todos los campos requeridos
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
                name="id_padre"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                Sistema Padre (Opcional)
                <IconButton size="small" sx={{ ml: 0.5, color: 'text.secondary' }}>
                  <HelpOutline fontSize="small" />
                </IconButton>
              </Label>
              <Select
                name="id_padre"
                value={
                  sistemasOptions.find((opt) => opt.value === selectedPadre) ||
                  null
                }
                options={sistemasOptions}
                onChange={(option) => setSelectedPadre(option?.value || null)}
                styles={customSelectStyles}
                classNamePrefix="select"
                isClearable
                placeholder="Buscar sistema padre..."
                noOptionsMessage={() => 'No hay sistemas disponibles'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Label
                name="id_entidad"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                Entidad
              </Label>
              <Select
                name="id_entidad"
                value={
                  entidadesOptions.find((opt) => opt.value === selectedEntidad) ||
                  null
                }
                options={entidadesOptions}
                onChange={(option) => setSelectedEntidad(option?.value || null)}
                styles={customSelectStyles}
                classNamePrefix="select"
                isClearable
                placeholder="Seleccione una entidad..."
                noOptionsMessage={() => 'No hay entidades disponibles'}
              />
              <FieldError
                name="id_entidad"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Label
                name="codigo"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                Código
              </Label>
              <RedwoodTextField
                name="codigo"
                defaultValue={props.sistema?.codigo}
                validation={{ required: 'El código es requerido' }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s ease',
                }}
                errorStyle={{
                  borderColor: theme.palette.error.main,
                  backgroundColor: theme.palette.error.lighter,
                }}
              />
              <FieldError
                name="codigo"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Label
                name="sigla"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                Sigla
              </Label>
              <RedwoodTextField
                name="sigla"
                defaultValue={props.sistema?.sigla}
                validation={{ required: 'La sigla es requerida' }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s ease',
                }}
                errorStyle={{
                  borderColor: theme.palette.error.main,
                  backgroundColor: theme.palette.error.lighter,
                }}
              />
              <FieldError
                name="sigla"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Label
                name="ra_creacion"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                RA Creación
              </Label>
              <RedwoodTextField
                name="ra_creacion"
                defaultValue={props.sistema?.ra_creacion}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s ease',
                }}
              />
              <FieldError
                name="ra_creacion"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Label
                name="nombre"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                Nombre completo
              </Label>
              <RedwoodTextField
                name="nombre"
                defaultValue={props.sistema?.nombre}
                validation={{ required: 'El nombre es requerido' }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s ease',
                }}
                errorStyle={{
                  borderColor: theme.palette.error.main,
                  backgroundColor: theme.palette.error.lighter,
                }}
              />
              <FieldError
                name="nombre"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Label
                name="descripcion"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                Descripción
              </Label>
              <RedwoodTextField
                name="descripcion"
                defaultValue={props.sistema?.descripcion}
                validation={{ required: 'La descripción es requerida' }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.9375rem',
                  minHeight: '120px',
                  transition: 'all 0.2s ease',
                }}
                multiline
                rows={4}
                errorStyle={{
                  borderColor: theme.palette.error.main,
                  backgroundColor: theme.palette.error.lighter,
                }}
              />
              <FieldError
                name="descripcion"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
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
              startIcon={
                props.loading ? null : <CheckCircleOutline fontSize="small" />
              }
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
              {props.loading ? 'Guardando...' : 'Guardar Sistema'}
            </LoadingButton>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SistemaForm
