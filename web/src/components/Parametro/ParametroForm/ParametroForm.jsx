import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
  SelectField,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  IconButton,
  TextField as MuiTextField,
  Autocomplete,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { CheckCircleOutline, ArrowBack } from '@mui/icons-material'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const PARAMETROS_QUERY = gql`
  query ParametrosGrupos {
    parametros {
      grupo
    }
  }
`

const ParametroForm = (props) => {
  const theme = createTheme();
  const { data } = useQuery(PARAMETROS_QUERY)
  const [mostrarCampoNuevoGrupo, setMostrarCampoNuevoGrupo] = useState(false)
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(props.parametro?.grupo || '')

  // Extraer grupos únicos
  const gruposExistentes = [...new Set(data?.parametros?.map(p => p.grupo) || [])]
    .filter(grupo => grupo)
    .sort()

  const onSubmit = (data) => {
    const formData = {
      ...data,
      grupo: mostrarCampoNuevoGrupo ? data.nuevoGrupo : (data.grupo || grupoSeleccionado),
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    delete formData.nuevoGrupo // Eliminamos el campo temporal
    props.onSave(formData, props?.parametro?.id)
  }

  const handleChangeGrupo = (event, newValue) => {
    if (newValue === '__nuevo_grupo') {
      setMostrarCampoNuevoGrupo(true)
    } else {
      setGrupoSeleccionado(newValue)
    }
  }

  // Estilos comunes para los campos
  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.divider}`,
    fontSize: '0.9375rem',
    transition: 'all 0.2s ease',
  }

  const errorStyle = {
    borderColor: theme.palette.error.main,
    backgroundColor: theme.palette.error.lighter || '#fff8f8',
  }

  const fieldErrorStyle = {
    color: theme.palette.error.main,
    fontSize: '0.75rem',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }

  const helpTextStyle = {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: '4px',
  }

  return (
    <ThemeProvider theme={theme}>
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
            {props.parametro?.id ? 'Editar Parámetro' : 'Nuevo Parámetro'}
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
              {/* Campo Código */}
              <Grid item xs={12} md={6}>
                <Label
                  name="codigo"
                  style={labelStyle}
                  errorStyle={labelStyle}
                >
                  Código
                </Label>
                <TextField
                  name="codigo"
                  defaultValue={props.parametro?.codigo}
                  style={inputStyle}
                  errorStyle={{...inputStyle, ...errorStyle}}
                  validation={{
                    required: 'El código es obligatorio',
                    pattern: {
                      value: /^[A-Z0-9_]{1,20}$/,
                      message: 'Solo mayúsculas, números y guiones bajos (max 20 caracteres)'
                    }
                  }}
                  placeholder="Ej: TIPO_CLIENTE"
                />
                <p style={helpTextStyle}>Usa mayúsculas y guiones bajos, sin espacios</p>
                <FieldError name="codigo" style={fieldErrorStyle} />
              </Grid>

              {/* Campo Nombre */}
              <Grid item xs={12} md={6}>
                <Label
                  name="nombre"
                  style={labelStyle}
                  errorStyle={labelStyle}
                >
                  Nombre
                </Label>
                <TextField
                  name="nombre"
                  defaultValue={props.parametro?.nombre}
                  style={inputStyle}
                  errorStyle={{...inputStyle, ...errorStyle}}
                  validation={{
                    required: 'El nombre es obligatorio',
                    maxLength: {
                      value: 100,
                      message: 'Máximo 100 caracteres'
                    }
                  }}
                  placeholder="Ej: Tipo de Cliente"
                />
                <p style={helpTextStyle}>Nombre descriptivo del parámetro</p>
                <FieldError name="nombre" style={fieldErrorStyle} />
              </Grid>

              {/* Campo Grupo */}
              <Grid item xs={12}>
                {!mostrarCampoNuevoGrupo ? (
                  <>
                    <Label
                      name="grupo"
                      style={labelStyle}
                      errorStyle={labelStyle}
                    >
                      Grupo
                    </Label>
                    <div style={{ position: 'relative' }}>
                      <TextField
                        name="grupo"
                        defaultValue={props.parametro?.grupo || ''}
                        style={{ display: 'none' }}
                      />
                      <Autocomplete
                        freeSolo
                        options={[...gruposExistentes, '__nuevo_grupo']}
                        getOptionLabel={(option) => option === '__nuevo_grupo' ? '[+] Crear nuevo grupo' : option}
                        value={grupoSeleccionado}
                        onChange={handleChangeGrupo}
                        renderInput={(params) => (
                          <MuiTextField
                            {...params}
                            placeholder="Selecciona o escribe un grupo..."
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                padding: '4px 16px',
                                '& fieldset': {
                                  borderColor: theme.palette.divider,
                                },
                                '&:hover fieldset': {
                                  borderColor: theme.palette.primary.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.primary.main,
                                  borderWidth: '1px',
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </div>
                    <p style={helpTextStyle}>Agrupa parámetros relacionados o ingresa uno nuevo</p>
                    <FieldError name="grupo" style={fieldErrorStyle} />
                  </>
                ) : (
                  <>
                    <Label
                      name="nuevoGrupo"
                      style={labelStyle}
                      errorStyle={labelStyle}
                    >
                      Nuevo Grupo
                    </Label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TextField
                        name="nuevoGrupo"
                        style={{...inputStyle, flex: 1}}
                        errorStyle={{...inputStyle, ...errorStyle, flex: 1}}
                        validation={{
                          required: 'Debes ingresar un nombre para el nuevo grupo'
                          // Eliminada la validación de patrón
                        }}
                        placeholder="Ej: Configuración del Sistema"
                        autoFocus
                      />
                      <IconButton
                        type="button"
                        onClick={() => setMostrarCampoNuevoGrupo(false)}
                        sx={{
                          backgroundColor: theme.palette.error.main,
                          color: theme.palette.error.contrastText,
                          p: 1,
                          borderRadius: '8px',
                          '&:hover': {
                            backgroundColor: theme.palette.error.dark,
                          },
                        }}
                      >
                        <ArrowBack fontSize="small" />
                      </IconButton>
                    </div>
                    <p style={helpTextStyle}>Usa un nombre descriptivo para el nuevo grupo</p>
                    <FieldError name="nuevoGrupo" style={fieldErrorStyle} />
                  </>
                )}
              </Grid>

              {/* Campo Descripción */}
              <Grid item xs={12}>
                <Label
                  name="descripcion"
                  style={labelStyle}
                  errorStyle={labelStyle}
                >
                  Descripción
                </Label>
                <TextField
                  name="descripcion"
                  defaultValue={props.parametro?.descripcion}
                  style={{...inputStyle, minHeight: '100px'}}
                  errorStyle={{...inputStyle, ...errorStyle, minHeight: '100px'}}
                  as="textarea"
                  rows={3}
                  validation={{
                    maxLength: {
                      value: 255,
                      message: 'Máximo 255 caracteres'
                    }
                  }}
                  placeholder="Ej: Define los diferentes tipos de clientes del sistema"
                />
                <p style={helpTextStyle}>Descripción detallada del propósito del parámetro</p>
                <FieldError name="descripcion" style={fieldErrorStyle} />
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
                  props.loading ? null : (
                    <CheckCircleOutline fontSize="small" />
                  )
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
                {props.loading ? 'Guardando...' : 'Guardar Parámetro'}
              </LoadingButton>
            </Box>
          </Form>
        </CardContent>
      </Card>
    </ThemeProvider>
  )
}

export default ParametroForm
