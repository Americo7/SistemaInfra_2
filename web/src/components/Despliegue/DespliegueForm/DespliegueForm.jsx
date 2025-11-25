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
import { LoadingButton } from '@mui/lab'
import {
  CheckCircleOutline,
  Computer,
  Dns,
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

/* ================================================================
   QUERIES
================================================================ */
const GET_COMPONENTES = gql`
  query ObtenerComponentesDespliegue {
    componentes {
      id
      nombre
      estado
    }
  }
`

const GET_MAQUINAS = gql`
  query ObtenerMaquinasForm {
    maquinas {
      id
      nombre
      estado
    }
  }
`

const GET_SERVIDORES = gql`
  query ObtenerServidoresForm {
    servidores {
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

/* ================================================================
   FORMULARIO
================================================================ */
const DespliegueForm = (props) => {
  const theme = useTheme()

  const { data: componentesData } = useQuery(GET_COMPONENTES)
  const { data: maquinasData } = useQuery(GET_MAQUINAS)
  const { data: servidoresData } = useQuery(GET_SERVIDORES)
  const { data: parametrosData } = useQuery(GET_PARAMETROS)

  const [formData, setFormData] = useState({
    id_componente: '',
    id_maquina: '',
    id_servidor: '',
    fecha_despliegue: null,
    fecha_solicitud: null,
    unidad_solicitante: '',
    solicitante: '',
    descripcion: '',
    cod_tipo_respaldo: '',
    referencia_respaldo: '',
    estado_despliegue: '',
  })

  /* ================================================================
     PRE-CARGA
  ================================================================= */
  useEffect(() => {
    if (props?.despliegue) {
      setFormData({
        id_componente: props.despliegue.id_componente,
        id_maquina: props.despliegue.id_maquina,
        id_servidor: props.despliegue.id_servidor,
        fecha_despliegue: props.despliegue.fecha_despliegue
          ? dayjs(props.despliegue.fecha_despliegue)
          : null,
        fecha_solicitud: props.despliegue.fecha_solicitud
          ? dayjs(props.despliegue.fecha_solicitud)
          : null,
        unidad_solicitante: props.despliegue.unidad_solicitante,
        solicitante: props.despliegue.solicitante,
        descripcion: props.despliegue.descripcion || '',
        cod_tipo_respaldo: props.despliegue.cod_tipo_respaldo,
        referencia_respaldo: props.despliegue.referencia_respaldo,
        estado_despliegue: props.despliegue.estado_despliegue,
      })
    }
  }, [props.despliegue])

  /* ================================================================
     CATÁLOGOS
  ================================================================= */
  const componentesActivos =
    componentesData?.componentes?.filter((c) => c.estado === 'ACTIVO') || []

  const maquinasActivas =
    maquinasData?.maquinas?.filter((m) => m.estado === 'ACTIVO') || []

  const servidoresActivos =
    servidoresData?.servidores?.filter((s) => s.estado === 'ACTIVO') || []

  const tipoRespaldoOptions =
    parametrosData?.parametros
      ?.filter((p) => p.grupo === 'TIPO_RESPALDO')
      .map((p) => ({ value: p.codigo, label: p.nombre })) || []

  const estadoDespliegueOptions =
    parametrosData?.parametros
      ?.filter((p) => p.grupo === 'E_EVENTO_DESPLIEGUE')
      .map((p) => ({ value: p.codigo, label: p.nombre })) || []

  const unidadSolicitanteOptions =
    parametrosData?.parametros
      ?.filter((p) => p.grupo === 'UNIDAD_AGETIC')
      .map((p) => ({
        value: p.codigo,
        label: `${p.codigo} - ${p.nombre}`,
      })) || []

  /* ================================================================
     HANDLERS
  ================================================================= */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name) => (option) => {
    let value = option ? option.value : ''

    // Lógica VM vs Servidor físico
    if (name === 'id_maquina') {
      setFormData((prev) => ({
        ...prev,
        id_maquina: value,
        id_servidor: '', // limpiar servidor
      }))
      return
    }

    if (name === 'id_servidor') {
      setFormData((prev) => ({
        ...prev,
        id_servidor: value,
        id_maquina: '', // limpiar maquina
      }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name) => (newValue) => {
    setFormData((prev) => ({ ...prev, [name]: newValue }))
  }

  /* ================================================================
     SUBMIT
  ================================================================= */
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar VM o Servidor (uno solo)
    if (!formData.id_maquina && !formData.id_servidor) {
      alert('Debe seleccionar una Máquina o un Servidor físico.')
      return
    }

    if (formData.id_maquina && formData.id_servidor) {
      alert('Solo puede seleccionar Máquina o Servidor, no ambos.')
      return
    }

    const payload = {
      ...formData,
      fecha_despliegue: formData.fecha_despliegue
        ? formData.fecha_despliegue.toISOString()
        : null,
      fecha_solicitud: formData.fecha_solicitud
        ? formData.fecha_solicitud.toISOString()
        : null,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
    }

    props.onSave(payload, props?.despliegue?.id)
  }

  /* ================================================================
     OPTIONS
  ================================================================= */
  const componenteOptions = componentesActivos.map((c) => ({
    value: c.id,
    label: c.nombre,
  }))

  const maquinaOptions = maquinasActivas.map((m) => ({
    value: m.id,
    label: m.nombre,
  }))

  const servidorOptions = servidoresActivos.map((s) => ({
    value: s.id,
    label: s.nombre,
  }))

  /* ================================================================
     ESTILOS SELECT
  ================================================================= */
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '56px',
      borderRadius: '8px',
      borderColor: theme.palette.divider,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }

  /* ================================================================
     RENDER
  ================================================================= */
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={{ maxWidth: '1200px', margin: 'auto', borderRadius: '12px' }}>
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
            {props.despliegue?.id ? 'Editar Despliegue' : 'Nuevo Despliegue'}
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* ======================================================
                  COLUMNA IZQUIERDA
              ====================================================== */}
              <Grid item xs={12} md={6}>
                {/* COMPONENTE */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Componente
                  </Typography>
                  <Select
                    options={componenteOptions}
                    value={componenteOptions.find(
                      (x) => x.value === formData.id_componente
                    )}
                    onChange={handleSelectChange('id_componente')}
                    styles={customSelectStyles}
                    placeholder="Seleccionar..."
                    required
                  />
                </Box>

                {/* MAQUINA */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Máquina Virtual
                  </Typography>
                  <Select
                    options={maquinaOptions}
                    value={maquinaOptions.find(
                      (x) => x.value === formData.id_maquina
                    )}
                    onChange={handleSelectChange('id_maquina')}
                    styles={customSelectStyles}
                    placeholder="Seleccionar VM..."
                  />
                </Box>

                {/* SERVIDOR */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Servidor Físico
                  </Typography>
                  <Select
                    options={servidorOptions}
                    value={servidorOptions.find(
                      (x) => x.value === formData.id_servidor
                    )}
                    onChange={handleSelectChange('id_servidor')}
                    styles={customSelectStyles}
                    placeholder="Seleccionar servidor..."
                  />
                </Box>

                {/* FECHAS */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Fecha de Despliegue
                  </Typography>
                  <DateTimePicker
                    value={formData.fecha_despliegue}
                    onChange={handleDateChange('fecha_despliegue')}
                    renderInput={(params) => (
                      <MuiTextField fullWidth {...params} />
                    )}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Fecha de Solicitud
                  </Typography>
                  <DateTimePicker
                    value={formData.fecha_solicitud}
                    onChange={handleDateChange('fecha_solicitud')}
                    renderInput={(params) => (
                      <MuiTextField fullWidth {...params} />
                    )}
                  />
                </Box>
              </Grid>

              {/* ======================================================
                  COLUMNA DERECHA
              ====================================================== */}
              <Grid item xs={12} md={6}>
                {/* UNIDAD */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Unidad Solicitante
                  </Typography>
                  <Select
                    options={unidadSolicitanteOptions}
                    value={unidadSolicitanteOptions.find(
                      (x) => x.value === formData.unidad_solicitante
                    )}
                    onChange={handleSelectChange('unidad_solicitante')}
                    styles={customSelectStyles}
                    placeholder="Seleccionar unidad..."
                    required
                  />
                </Box>

                {/* SOLICITANTE */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Solicitante
                  </Typography>
                  <MuiTextField
                    fullWidth
                    name="solicitante"
                    value={formData.solicitante}
                    onChange={handleChange}
                  />
                </Box>

                {/* DESCRIPCIÓN */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Descripción
                  </Typography>
                  <MuiTextField
                    fullWidth
                    name="descripcion"
                    multiline
                    rows={4}
                    value={formData.descripcion}
                    onChange={handleChange}
                  />
                </Box>

                {/* TIPO RESPALDO */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Tipo de Respaldo
                  </Typography>
                  <Select
                    options={tipoRespaldoOptions}
                    value={tipoRespaldoOptions.find(
                      (x) => x.value === formData.cod_tipo_respaldo
                    )}
                    onChange={handleSelectChange('cod_tipo_respaldo')}
                    styles={customSelectStyles}
                    placeholder="Seleccionar..."
                    required
                  />
                </Box>

                {/* REFERENCIA */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Referencia de Respaldo
                  </Typography>
                  <MuiTextField
                    fullWidth
                    name="referencia_respaldo"
                    value={formData.referencia_respaldo}
                    onChange={handleChange}
                  />
                </Box>

                {/* ESTADO DESPLIEGUE */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Estado de Despliegue
                  </Typography>
                  <Select
                    options={estadoDespliegueOptions}
                    value={estadoDespliegueOptions.find(
                      (x) => x.value === formData.estado_despliegue
                    )}
                    onChange={handleSelectChange('estado_despliegue')}
                    styles={customSelectStyles}
                    placeholder="Seleccionar..."
                    required
                  />
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <LoadingButton
                variant="outlined"
                startIcon={<Close />}
                onClick={props.onCancel}
              >
                Cancelar
              </LoadingButton>

              <LoadingButton
                type="submit"
                variant="contained"
                loading={props.loading}
                startIcon={<CheckCircleOutline />}
              >
                {props.despliegue?.id ? 'Actualizar' : 'Guardar'}
              </LoadingButton>
            </Box>
          </form>
        </CardContent>
      </Card>
    </LocalizationProvider>
  )
}

export default DespliegueForm
