import { useEffect, useState } from 'react'
import Select from 'react-select'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  useTheme,
  TextField as MuiTextField,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import gql from 'graphql-tag'
import { useQuery } from '@redwoodjs/web'
import { useAuth } from 'src/auth'
import { LoadingButton } from '@mui/lab'
import {
  CheckCircleOutline,
  Computer,
  Code,
  CalendarToday,
  Person,
  Business,
  Description,
  Backup,
  Link,
  PlaylistAddCheck,
  Close,
} from '@mui/icons-material'

const OBTENER_MAQUINAS = gql`
  query ObtenerMaquinaDespliegue {
    maquinas {
      id
      nombre
      estado
    }
  }
`

const OBTENER_COMPONENTES = gql`
  query ObtenerComponentesDespliegue {
    componentes {
      id
      nombre
      estado
    }
  }
`

const GET_PARAMETROS = gql`
  query GetParametrosDespliegue {
    parametros {
      id
      codigo
      nombre
      grupo
      estado
    }
  }
`

const OBTENER_SISTEMAS = gql`
  query ObtenerSistemasDespliegue {
    sistemas {
      id
      nombre
      estado
    }
  }
`

const DespliegueForm = (props) => {
  const theme = useTheme()
  const { currentUser } = useAuth()
  const { data: componentesData } = useQuery(OBTENER_COMPONENTES)
  const { data: maquinasData } = useQuery(OBTENER_MAQUINAS)
  const { data: parametrosData } = useQuery(GET_PARAMETROS)
  const { data: sistemasData } = useQuery(OBTENER_SISTEMAS)

  const [formData, setFormData] = useState({
    id_componente: '',
    id_maquina: '',
    fecha_despliegue: null,
    fecha_solicitud: null,
    unidad_solicitante: '',
    solicitante: '',
    descripcion: '',
    cod_tipo_respaldo: '',
    referencia_respaldo: '',
    estado_despliegue: '',
  })

  const [sistemaRegistrado, setSistemaRegistrado] = useState(false)

  useEffect(() => {
    if (sistemasData?.sistemas?.length > 0) {
      setSistemaRegistrado(true)
    }
  }, [sistemasData])

  useEffect(() => {
    if (props?.despliegue) {
      setFormData({
        id_componente: props.despliegue.id_componente,
        id_maquina: props.despliegue.id_maquina,
        fecha_despliegue: props.despliegue.fecha_despliegue ? dayjs(props.despliegue.fecha_despliegue) : null,
        fecha_solicitud: props.despliegue.fecha_solicitud ? dayjs(props.despliegue.fecha_solicitud) : null,
        unidad_solicitante: props.despliegue.unidad_solicitante,
        solicitante: props.despliegue.solicitante,
        descripcion: props.despliegue.descripcion || '',
        cod_tipo_respaldo: props.despliegue.cod_tipo_respaldo,
        referencia_respaldo: props.despliegue.referencia_respaldo,
        estado_despliegue: props.despliegue.estado_despliegue,
      })
    }
  }, [props?.despliegue])

  const componentesActivos =
    componentesData?.componentes?.filter((c) => c.estado === 'ACTIVO') || []

  const maquinasActivas =
    maquinasData?.maquinas?.filter((m) => m.estado === 'ACTIVO') || []

  const parametrosDeTipoRespaldo =
    parametrosData?.parametros?.filter((p) => p.grupo === 'TIPO_RESPALDO') || []

  const parametrosDeEstadoDespliegue =
    parametrosData?.parametros?.filter(
      (p) => p.grupo === 'E_EVENTO_DESPLIEGUE'
    ) || []

  const unidadesAgeticOptions =
    parametrosData?.parametros?.filter((p) => p.grupo === 'UNIDAD_AGETIC') || []

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name) => (newValue) => {
    setFormData((prev) => ({ ...prev, [name]: newValue }))
  }

  const handleSelectChange = (name) => (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : ''
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar campos requeridos
    const requiredFields = [
      'id_componente',
      'id_maquina',
      'fecha_despliegue',
      'fecha_solicitud',
      'unidad_solicitante',
      'solicitante',
      'cod_tipo_respaldo',
      'referencia_respaldo',
      'estado_despliegue'
    ]

    const missingFields = requiredFields.filter(field => !formData[field])
    if (missingFields.length > 0) {
      alert(`Por favor complete los siguientes campos: ${missingFields.join(', ')}`)
      return
    }

    // Validar fechas
    if (formData.fecha_solicitud && formData.fecha_despliegue &&
        formData.fecha_solicitud.isAfter(formData.fecha_despliegue)) {
      alert('La fecha de solicitud no puede ser posterior a la fecha de despliegue')
      return
    }

    // Preparar payload con fechas en formato ISO
    const payload = {
      ...formData,
      fecha_despliegue: formData.fecha_despliegue ? formData.fecha_despliegue.toISOString() : null,
      fecha_solicitud: formData.fecha_solicitud ? formData.fecha_solicitud.toISOString() : null,
      estado: 'ACTIVO',
      usuario_creacion: props.despliegue?.id ? props.despliegue.usuario_creacion : currentUser?.id,
      usuario_modificacion: currentUser?.id
    }

    props.onSave(payload, props?.despliegue?.id)
  }

  // Opciones para los selects
  const componenteOptions = componentesActivos.map(comp => ({
    value: comp.id,
    label: comp.nombre
  }))

  const maquinaOptions = maquinasActivas.map(maq => ({
    value: maq.id,
    label: maq.nombre
  }))

  const tipoRespaldoOptions = parametrosDeTipoRespaldo.map(p => ({
    value: p.codigo,
    label: p.nombre
  }))

  const estadoDespliegueOptions = parametrosDeEstadoDespliegue.map(p => ({
    value: p.codigo,
    label: p.nombre
  }))

  const unidadSolicitanteOptions = unidadesAgeticOptions.map(p => ({
    value: p.codigo,
    label: `${p.codigo} - ${p.nombre}`
  }))

  // Estilos personalizados para los selects
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '56px',
      borderRadius: '8px',
      borderColor: theme.palette.divider,
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
    singleValue: (base) => ({
      ...base,
      color: theme.palette.text.primary,
    }),
    placeholder: (base) => ({
      ...base,
      color: theme.palette.text.secondary,
    }),
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          maxWidth: '1200px',
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
            {props.despliegue?.id ? 'Editar Despliegue' : 'Nuevo Despliegue'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {props.despliegue?.id ? 'Actualice los datos del despliegue' : 'Complete la información para registrar un nuevo despliegue'}
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Code sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Componente
                    </Typography>
                  </Box>
                  <Select
                    options={componenteOptions}
                    value={componenteOptions.find(option => option.value === formData.id_componente) || null}
                    onChange={handleSelectChange('id_componente')}
                    placeholder="Seleccionar componente..."
                    noOptionsMessage={() => "No hay componentes disponibles"}
                    styles={customSelectStyles}
                    isSearchable
                    required
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Computer sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Máquina
                    </Typography>
                  </Box>
                  <Select
                    options={maquinaOptions}
                    value={maquinaOptions.find(option => option.value === formData.id_maquina) || null}
                    onChange={handleSelectChange('id_maquina')}
                    placeholder="Seleccionar máquina..."
                    noOptionsMessage={() => "No hay máquinas disponibles"}
                    styles={customSelectStyles}
                    isSearchable
                    required
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Fecha de Despliegue
                    </Typography>
                  </Box>
                  <DateTimePicker
                    value={formData.fecha_despliegue}
                    onChange={handleDateChange('fecha_despliegue')}
                    renderInput={(params) => (
                      <MuiTextField
                        {...params}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            height: '56px'
                          }
                        }}
                      />
                    )}
                    maxDate={null}
                    disableFuture={false}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Fecha de Solicitud
                    </Typography>
                  </Box>
                  <DateTimePicker
                    value={formData.fecha_solicitud}
                    onChange={handleDateChange('fecha_solicitud')}
                    renderInput={(params) => (
                      <MuiTextField
                        {...params}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            height: '56px'
                          }
                        }}
                      />
                    )}
                    maxDate={null}
                    disableFuture={false}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Business sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Unidad Solicitante
                    </Typography>
                  </Box>
                  <Select
                    options={unidadSolicitanteOptions}
                    value={unidadSolicitanteOptions.find(option => option.value === formData.unidad_solicitante) || null}
                    onChange={handleSelectChange('unidad_solicitante')}
                    placeholder="Seleccionar unidad..."
                    noOptionsMessage={() => "No hay unidades disponibles"}
                    styles={customSelectStyles}
                    isSearchable
                    required
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Solicitante
                    </Typography>
                  </Box>
                  <MuiTextField
                    fullWidth
                    name="solicitante"
                    value={formData.solicitante}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        height: '56px'
                      }
                    }}
                    inputProps={{ maxLength: 100 }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Description sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Descripción
                    </Typography>
                  </Box>
                  <MuiTextField
                    fullWidth
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      }
                    }}
                    inputProps={{ maxLength: 500 }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Backup sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Tipo de Respaldo
                    </Typography>
                  </Box>
                  <Select
                    options={tipoRespaldoOptions}
                    value={tipoRespaldoOptions.find(option => option.value === formData.cod_tipo_respaldo) || null}
                    onChange={handleSelectChange('cod_tipo_respaldo')}
                    placeholder="Seleccionar tipo de respaldo..."
                    noOptionsMessage={() => "No hay tipos de respaldo disponibles"}
                    styles={customSelectStyles}
                    isSearchable
                    required
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Link sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Referencia de Respaldo
                    </Typography>
                  </Box>
                  <MuiTextField
                    fullWidth
                    name="referencia_respaldo"
                    value={formData.referencia_respaldo}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        height: '56px'
                      }
                    }}
                    inputProps={{ maxLength: 100 }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PlaylistAddCheck sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Estado Despliegue
                    </Typography>
                  </Box>
                  <Select
                    options={estadoDespliegueOptions}
                    value={estadoDespliegueOptions.find(option => option.value === formData.estado_despliegue) || null}
                    onChange={handleSelectChange('estado_despliegue')}
                    placeholder="Seleccionar estado..."
                    noOptionsMessage={() => "No hay estados disponibles"}
                    styles={customSelectStyles}
                    isSearchable
                    required
                  />
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <LoadingButton
                variant="outlined"
                onClick={props.onCancel}
                startIcon={<Close />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main,
                  },
                }}
              >
                Cancelar
              </LoadingButton>

              <LoadingButton
                type="submit"
                variant="contained"
                loading={props.loading}
                loadingPosition="start"
                startIcon={<CheckCircleOutline />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                {props.loading ? 'Guardando...' : (props.despliegue?.id ? 'Actualizar' : 'Guardar')}
              </LoadingButton>
            </Box>
          </form>
        </CardContent>
      </Card>
    </LocalizationProvider>
  )
}

export default DespliegueForm
