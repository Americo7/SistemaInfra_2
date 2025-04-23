import { useState, useEffect } from 'react'
import Select from 'react-select'
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
  Chip,
  Stack,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  CheckCircleOutline,
  Event,
  Description,
  Category,
  People,
  Schedule,
  Assignment,
  Person,
  Code,
} from '@mui/icons-material'

// Función para manejar los contadores en localStorage
const manageEventCounters = (tipoEvento, action = 'get') => {
  const counters = JSON.parse(localStorage.getItem('eventoCounters') || '{}')

  if (action === 'get') {
    return counters[tipoEvento] || 0
  } else if (action === 'increment') {
    const newValue = (counters[tipoEvento] || 0) + 1
    counters[tipoEvento] = newValue
    localStorage.setItem('eventoCounters', JSON.stringify(counters))
    return newValue
  }
  return 0
}

const ResponsablesSelect = ({ usuarios, value, onChange, theme }) => {
  const options = usuarios.map((u) => ({
    value: u.id,
    label: `${u.nombres} ${u.primer_apellido} ${u.segundo_apellido}`,
  }))

  const selected = options.filter((opt) => value?.includes(opt.value))

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
    multiValue: (base) => ({
      ...base,
      backgroundColor: theme.palette.primary.light,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: theme.palette.primary.contrastText,
    }),
  }

  return (
    <Grid item xs={12}>
      <Label
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          fontWeight: '500',
          color: theme.palette.text.primary,
          fontSize: '0.875rem',
        }}
      >
        <People fontSize="small" sx={{ mr: 1 }} />
        Responsables
      </Label>
      <Select
        isMulti
        options={options}
        value={selected}
        onChange={(selectedOptions) =>
          onChange(selectedOptions.map((opt) => opt.value))
        }
        styles={customSelectStyles}
        classNamePrefix="select"
        placeholder="Buscar y seleccionar usuarios..."
        noOptionsMessage={() => 'No hay usuarios disponibles'}
      />
      <FieldError
        name="responsables"
        style={{
          color: theme.palette.error.main,
          fontSize: '0.75rem',
          marginTop: '4px',
        }}
      />
    </Grid>
  )
}

const GET_PARAMETROS = gql`
  query GetParametrosTipoEvento {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`

const GET_USUARIOS = gql`
  query GetUsuariosEvento {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date - tzOffset).toISOString().slice(0, 16)
}

const EventoForm = (props) => {
  const theme = useTheme()
  const { data: usuariosData, loading: loadingUsuarios } = useQuery(GET_USUARIOS)
  const { data: parametrosData, loading: loadingParametros } = useQuery(GET_PARAMETROS)
  const [responsablesSeleccionados, setResponsablesSeleccionados] = useState(
    props.evento?.responsables || []
  )
  const [selectedTipoEvento, setSelectedTipoEvento] = useState(null)
  const [selectedEstadoEvento, setSelectedEstadoEvento] = useState(null)
  const [fechaEvento, setFechaEvento] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [codigoGenerado, setCodigoGenerado] = useState(props.evento?.cod_evento || '')
  const [mostrarCodigo, setMostrarCodigo] = useState(!!props.evento?.cod_evento)

  useEffect(() => {
    if (!loadingUsuarios && !loadingParametros && props.evento && !isInitialized) {
      setResponsablesSeleccionados(props.evento.responsables || [])
      if (props.evento.fecha_evento) {
        setFechaEvento(formatDateForInput(props.evento.fecha_evento))
      }

      if (props.evento.cod_tipo_evento) {
        const tipoEvento = parametrosData?.parametros?.find(
          (param) => param.grupo === 'TIPO_EVENTO' && param.codigo === props.evento.cod_tipo_evento
        )
        if (tipoEvento) {
          setSelectedTipoEvento({
            value: tipoEvento.codigo,
            label: tipoEvento.nombre
          })
        }
      }

      if (props.evento.estado_evento) {
        const estadoEvento = parametrosData?.parametros?.find(
          (param) => param.grupo === 'E_EVENTO_DESPLIEGUE' && param.codigo === props.evento.estado_evento
        )
        if (estadoEvento) {
          setSelectedEstadoEvento({
            value: estadoEvento.codigo,
            label: estadoEvento.nombre
          })
        }
      }

      setIsInitialized(true)
    }
  }, [loadingUsuarios, loadingParametros, props.evento, isInitialized, parametrosData])

  useEffect(() => {
    if (selectedTipoEvento && !props.evento?.id) {
      const counter = manageEventCounters(selectedTipoEvento.value, 'get')
      const nuevoCodigo = `${selectedTipoEvento.value}-${(counter + 1).toString().padStart(3, '0')}`
      setCodigoGenerado(nuevoCodigo)
      setMostrarCodigo(true)
    }
  }, [selectedTipoEvento, props.evento?.id])

  const onSubmit = (data) => {
    let codigoFinal = codigoGenerado

    // Solo generar nuevo código si es un evento nuevo y hay tipo de evento seleccionado
    if (!props.evento?.id && selectedTipoEvento) {
      const counter = manageEventCounters(selectedTipoEvento.value, 'increment')
      codigoFinal = `${selectedTipoEvento.value}-${counter.toString().padStart(3, '0')}`
      setCodigoGenerado(codigoFinal)
      setMostrarCodigo(true)
    }

    const formData = {
      ...data,
      cod_tipo_evento: selectedTipoEvento?.value,
      cod_evento: codigoFinal,
      estado_evento: selectedEstadoEvento?.value,
      responsables: responsablesSeleccionados,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }

    props.onSave(formData, props?.evento?.id)
  }

  const parametrosDeTipoEvento = parametrosData?.parametros?.filter((param) => {
    return param.grupo === 'TIPO_EVENTO'
  }) || []

  const parametrosDeEstadoEvento = parametrosData?.parametros?.filter(
    (param) => param.grupo === 'E_EVENTO_DESPLIEGUE'
  ) || []

  const tipoEventoOptions = parametrosDeTipoEvento.map((tipo) => ({
    value: tipo.codigo,
    label: tipo.nombre,
  }))

  const estadoEventoOptions = parametrosDeEstadoEvento.map((estado) => ({
    value: estado.codigo,
    label: estado.nombre,
  }))

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

  if (loadingUsuarios || loadingParametros) {
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
          {props.evento?.id ? 'Editar Evento' : 'Nuevo Evento'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {props.evento?.id ? 'Actualice la información del evento' : 'Complete la información para crear un nuevo evento'}
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
            {/* Mostrar código generado cuando hay tipo de evento seleccionado */}
            {mostrarCodigo && selectedTipoEvento && (
              <Grid item xs={12}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      px: 3,
                      py: 1.5,
                      borderRadius: '8px',
                      boxShadow: theme.shadows[1],
                    }}
                  >
                    <Code fontSize="small" />
                    <Typography variant="subtitle1" fontWeight="600">
                      Código generado:
                    </Typography>
                    <Typography variant="h6" fontWeight="700">
                      {codigoGenerado}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {props.evento?.id ? 'Código del evento' : 'Este será el código del nuevo evento'}
                  </Typography>
                </Stack>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <Label
                name="cod_tipo_evento"
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
                Tipo de Evento*
              </Label>
              <Select
                name="cod_tipo_evento"
                options={tipoEventoOptions}
                value={selectedTipoEvento}
                onChange={setSelectedTipoEvento}
                styles={customSelectStyles}
                classNamePrefix="select"
                placeholder="Seleccionar tipo de evento..."
                noOptionsMessage={() => 'No hay tipos de evento disponibles'}
                isClearable
                required
                isDisabled={!!props.evento?.id}
              />
              <FieldError
                name="cod_tipo_evento"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Label
                name="fecha_evento"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                <Schedule fontSize="small" sx={{ mr: 1 }} />
                Fecha del Evento*
              </Label>
              <TextField
                name="fecha_evento"
                value={fechaEvento}
                onChange={(e) => setFechaEvento(e.target.value)}
                type="datetime-local"
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
                name="fecha_evento"
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
                defaultValue={props.evento?.descripcion}
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

            <ResponsablesSelect
              usuarios={usuariosData?.usuarios || []}
              value={responsablesSeleccionados}
              onChange={setResponsablesSeleccionados}
              theme={theme}
            />

            <Grid item xs={12} md={6}>
              <Label
                name="estado_evento"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                <Event fontSize="small" sx={{ mr: 1 }} />
                Estado del Evento*
              </Label>
              <Select
                name="estado_evento"
                options={estadoEventoOptions}
                value={selectedEstadoEvento}
                onChange={setSelectedEstadoEvento}
                styles={customSelectStyles}
                classNamePrefix="select"
                placeholder="Seleccionar estado..."
                noOptionsMessage={() => 'No hay estados disponibles'}
                isClearable
                required
              />
              <FieldError
                name="estado_evento"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Label
                name="cite"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                <Assignment fontSize="small" sx={{ mr: 1 }} />
                Cite
              </Label>
              <TextField
                name="cite"
                defaultValue={props.evento?.cite}
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
                name="cite"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Label
                name="solicitante"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                <Person fontSize="small" sx={{ mr: 1 }} />
                Solicitante
              </Label>
              <TextField
                name="solicitante"
                defaultValue={props.evento?.solicitante}
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
                name="solicitante"
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
              disabled={!selectedTipoEvento}
            >
              {props.loading ? 'Guardando...' : 'Guardar Evento'}
            </LoadingButton>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default EventoForm
