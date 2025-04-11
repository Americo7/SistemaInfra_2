import { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import gql from 'graphql-tag'
import { useQuery } from '@redwoodjs/web'

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
    descripcion: '', // Nuevo campo añadido
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
        descripcion: props.despliegue.descripcion || '', // Manejo del nuevo campo
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name) => (date) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar campos requeridos
    if (
      !formData.id_componente ||
      !formData.id_maquina ||
      !formData.fecha_despliegue ||
      !formData.fecha_solicitud ||
      !formData.unidad_solicitante ||
      !formData.solicitante ||
      !formData.cod_tipo_respaldo ||
      !formData.referencia_respaldo ||
      !formData.estado_despliegue
    ) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    // Preparar payload con fechas en formato ISO
    const payload = {
      ...formData,
      fecha_despliegue: formData.fecha_despliegue.toISOString(),
      fecha_solicitud: formData.fecha_solicitud.toISOString(),
      estado: 'ACTIVO',
      usuario_modificacion: 1,
      usuario_creacion: 1,
    }

    props.onSave(payload, props?.despliegue?.id)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box p={3} border={1} borderRadius={2} boxShadow={2}>
            <Typography variant="h6" gutterBottom>
              Formulario de Despliegue
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} direction="column">
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Componente</InputLabel>
                    <Select
                      name="id_componente"
                      value={formData.id_componente}
                      label="Componente"
                      onChange={handleChange}
                      required
                    >
                      {componentesActivos.map((comp) => (
                        <MenuItem key={comp.id} value={comp.id}>
                          {comp.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Máquina</InputLabel>
                    <Select
                      name="id_maquina"
                      value={formData.id_maquina}
                      label="Máquina"
                      onChange={handleChange}
                      required
                    >
                      {maquinasActivas.map((maq) => (
                        <MenuItem key={maq.id} value={maq.id}>
                          {maq.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <DateTimePicker
                    label="Fecha de Despliegue"
                    value={formData.fecha_despliegue}
                    onChange={handleDateChange('fecha_despliegue')}
                    inputFormat="DD/MM/YYYY, HH:mm"
                    renderInput={(params) => (
                      <TextField {...params} fullWidth required />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <DateTimePicker
                    label="Fecha de Solicitud"
                    value={formData.fecha_solicitud}
                    onChange={handleDateChange('fecha_solicitud')}
                    inputFormat="DD/MM/YYYY, HH:mm"
                    renderInput={(params) => (
                      <TextField {...params} fullWidth required />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="unidad_solicitante"
                    label="Unidad Solicitante"
                    value={formData.unidad_solicitante}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="solicitante"
                    label="Solicitante"
                    value={formData.solicitante}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {/* Nuevo campo de descripción añadido */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="descripcion"
                    label="Descripción"
                    value={formData.descripcion}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Respaldo</InputLabel>
                    <Select
                      name="cod_tipo_respaldo"
                      value={formData.cod_tipo_respaldo}
                      onChange={handleChange}
                      label="Tipo de Respaldo"
                      required
                    >
                      {parametrosDeTipoRespaldo.map((p) => (
                        <MenuItem key={p.id} value={p.codigo}>
                          {p.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="referencia_respaldo"
                    label="Referencia de Respaldo"
                    value={formData.referencia_respaldo}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Estado Despliegue</InputLabel>
                    <Select
                      name="estado_despliegue"
                      value={formData.estado_despliegue}
                      onChange={handleChange}
                      label="Estado Despliegue"
                      required
                    >
                      {parametrosDeEstadoDespliegue.map((p) => (
                        <MenuItem key={p.id} value={p.codigo}>
                          {p.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    fullWidth
                  >
                    Guardar Despliegue
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* Espacio para información adicional si es necesario */}
        </Grid>
      </Grid>
    </LocalizationProvider>
  )
}

export default DespliegueForm
