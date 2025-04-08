import { useEffect, useState } from 'react'

import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
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
    fecha_despliegue: '',
    fecha_solicitud: '',
    unidad_solicitante: '',
    solicitante: '',
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

  const ultimoSistema =
    sistemasData?.sistemas?.length > 0
      ? [...sistemasData.sistemas].sort((a, b) => b.id - a.id)[0]
      : null

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    props.onSave(
      {
        ...formData,
        estado: 'ACTIVO',
        usuario_modificacion: 1,
        usuario_creacion: 1,
      },
      props?.despliegue?.id
    )
  }

  return (
    <Box p={2}>
      <Grid container spacing={3}>
        {/* Formulario */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Formulario de Despliegue" />
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Componente</InputLabel>
                      <Select
                        name="id_componente"
                        value={formData.id_componente}
                        label="Componente"
                        onChange={handleChange}
                      >
                        {componentesActivos.map((comp) => (
                          <MenuItem key={comp.id} value={comp.id}>
                            {comp.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Máquina</InputLabel>
                      <Select
                        name="id_maquina"
                        value={formData.id_maquina}
                        label="Máquina"
                        onChange={handleChange}
                      >
                        {maquinasActivas.map((maq) => (
                          <MenuItem key={maq.id} value={maq.id}>
                            {maq.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="fecha_despliegue"
                      label="Fecha de Despliegue"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      value={formData.fecha_despliegue}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="fecha_solicitud"
                      label="Fecha de Solicitud"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      value={formData.fecha_solicitud}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="unidad_solicitante"
                      label="Unidad Solicitante"
                      value={formData.unidad_solicitante}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="solicitante"
                      label="Solicitante"
                      value={formData.solicitante}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de Respaldo</InputLabel>
                      <Select
                        name="cod_tipo_respaldo"
                        value={formData.cod_tipo_respaldo}
                        onChange={handleChange}
                        label="Tipo de Respaldo"
                      >
                        {parametrosDeTipoRespaldo.map((p) => (
                          <MenuItem key={p.id} value={p.codigo}>
                            {p.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="referencia_respaldo"
                      label="Referencia de Respaldo"
                      value={formData.referencia_respaldo}
                      onChange={handleChange}
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
            </CardContent>
          </Card>
        </Grid>

        {/* Lado derecho: info reciente + botones */}
        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Card>
              <CardHeader title="Último Sistema Registrado" />
              <CardContent>
                {ultimoSistema ? (
                  <>
                    <Typography variant="h6">{ultimoSistema.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estado: {ultimoSistema.estado}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2">
                    No hay sistemas registrados.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {!sistemaRegistrado ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => props.navigateTo?.('nuevoSistema')}
              >
                Agregar un nuevo Sistema
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => props.navigateTo?.('nuevoComponente')}
                >
                  Registrar Componente
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => props.navigateTo?.('nuevaMaquina')}
                >
                  Registrar Máquina
                </Button>
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DespliegueForm
