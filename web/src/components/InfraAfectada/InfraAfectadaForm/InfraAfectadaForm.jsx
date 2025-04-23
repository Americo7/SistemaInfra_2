import { useState, useEffect } from 'react'
import Select from 'react-select'
import { useQuery } from '@redwoodjs/web'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  useTheme,
  CircularProgress,
  IconButton,
  Tooltip,
  Collapse,
  TextField,
  InputAdornment,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  CheckCircleOutline,
  Close,
  Storage,
  Dns,
  Computer,
  Event,
  Search,
  FilterAlt,
  FilterAltOff
} from '@mui/icons-material'

const GET_EVENTOS = gql`
  query GetEventoInfra {
    eventos {
      id
      cod_evento
      descripcion
      estado
    }
  }
`

const GET_DATA_CENTERS = gql`
  query GetDataCentersInfra {
    dataCenters {
      id
      nombre
      estado
    }
  }
`

const GET_SERVIDORES = gql`
  query GetServidoresInfra {
    servidores {
      id
      serie
      modelo
      marca
      cod_tipo_servidor
      estado
      estado_operativo
    }
  }
`

const GET_MAQUINAS = gql`
  query GetMaquinasInfra {
    maquinas {
      id
      nombre
      estado
    }
  }
`

const InfraAfectadaForm = (props) => {
  const theme = useTheme()
  const { data: eventosData, loading: loadingEventos } = useQuery(GET_EVENTOS)
  const { data: dataCentersData, loading: loadingDataCenters } = useQuery(GET_DATA_CENTERS)
  const { data: servidoresData, loading: loadingServidores } = useQuery(GET_SERVIDORES)
  const { data: maquinasData, loading: loadingMaquinas } = useQuery(GET_MAQUINAS)

  const [selectedEvento, setSelectedEvento] = useState(null)
  const [selectedServidor, setSelectedServidor] = useState(null)
  const [selectedMaquina, setSelectedMaquina] = useState(null)
  const [selectedDataCenter, setSelectedDataCenter] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    marca: '',
    tipo: '',
    estado: 'ACTIVO'
  })
  const [selectedComponents, setSelectedComponents] = useState({
    dataCenter: false,
    maquina: false,
    servidor: false
  })

  // Efecto para inicializar los valores cuando hay datos para editar
  useEffect(() => {
    if (props.infraAfectada && eventosData && servidoresData && maquinasData && dataCentersData) {
      const evento = eventosData.eventos.find(e => e.id === props.infraAfectada.id_evento)
      const servidor = servidoresData.servidores.find(s => s.id === props.infraAfectada.id_servidor)
      const maquina = maquinasData.maquinas.find(m => m.id === props.infraAfectada.id_maquina)
      const dataCenter = dataCentersData.dataCenters.find(d => d.id === props.infraAfectada.id_data_center)

      if (evento) setSelectedEvento({
        value: evento.id,
        label: `${evento.cod_evento} - ${evento.descripcion}`
      })

      // Determinar qué componentes están presentes
      const components = {
        dataCenter: !!dataCenter,
        maquina: !!maquina,
        servidor: !!servidor
      }
      setSelectedComponents(components)

      if (servidor) setSelectedServidor({
        value: servidor.id,
        label: `${servidor.serie} - ${servidor.marca} ${servidor.modelo} (${servidor.cod_tipo_servidor})`,
        data: servidor
      })
      if (maquina) setSelectedMaquina({
        value: maquina.id,
        label: maquina.nombre
      })
      if (dataCenter) setSelectedDataCenter({
        value: dataCenter.id,
        label: dataCenter.nombre
      })
    }
  }, [props.infraAfectada, dataCentersData, servidoresData, maquinasData, eventosData])

  const handleComponentChange = (component) => (event) => {
    setSelectedComponents({
      ...selectedComponents,
      [component]: event.target.checked
    })

    // Limpiar selección cuando se desmarca
    if (!event.target.checked) {
      if (component === 'dataCenter') setSelectedDataCenter(null)
      if (component === 'maquina') setSelectedMaquina(null)
      if (component === 'servidor') setSelectedServidor(null)
    }
  }

  const filteredServidores = servidoresData?.servidores
    ?.filter(servidor => {
      const matchesSearch = searchTerm === '' ||
        servidor.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servidor.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servidor.modelo.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilters =
        (filters.marca === '' || servidor.marca === filters.marca) &&
        (filters.tipo === '' || servidor.cod_tipo_servidor === filters.tipo) &&
        servidor.estado === filters.estado

      return matchesSearch && matchesFilters
    }) || []

  const eventosOptions = eventosData?.eventos
    ?.filter(evento => evento.estado === 'ACTIVO')
    .map(evento => ({
      value: evento.id,
      label: `${evento.cod_evento} - ${evento.descripcion}`,
    })) || []

  const servidoresOptions = filteredServidores.map(servidor => ({
    value: servidor.id,
    label: `${servidor.serie} - ${servidor.marca} ${servidor.modelo} (${servidor.cod_tipo_servidor})`,
    data: servidor
  }))

  const maquinasOptions = maquinasData?.maquinas
    ?.filter(maquina => maquina.estado === 'ACTIVO')
    .map(maquina => ({
      value: maquina.id,
      label: maquina.nombre,
    })) || []

  const dataCenterOptions = dataCentersData?.dataCenters
    ?.filter(dataCenter => dataCenter.estado === 'ACTIVO')
    .map(dataCenter => ({
      value: dataCenter.id,
      label: dataCenter.nombre,
    })) || []

  const marcasUnicas = [...new Set(servidoresData?.servidores?.map(s => s.marca))].filter(Boolean)
  const tiposUnicos = [...new Set(servidoresData?.servidores?.map(s => s.cod_tipo_servidor))].filter(Boolean)

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '48px',
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
      padding: '8px 12px',
      fontSize: '0.875rem'
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '300px',
      padding: 0
    }),
    singleValue: (base) => ({
      ...base,
      color: theme.palette.text.primary,
      fontSize: '0.875rem'
    }),
    placeholder: (base) => ({
      ...base,
      color: theme.palette.text.secondary,
      fontSize: '0.875rem'
    }),
    input: (base) => ({
      ...base,
      fontSize: '0.875rem'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '8px'
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '8px'
    })
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (!selectedEvento) {
      alert('Por favor seleccione un evento')
      return
    }

    // Verificar que al menos un componente esté seleccionado
    if (!selectedComponents.dataCenter && !selectedComponents.maquina && !selectedComponents.servidor) {
      alert('Por favor seleccione al menos un componente de infraestructura')
      return
    }

    // Verificar que si el checkbox está marcado, el componente esté seleccionado
    if (selectedComponents.dataCenter && !selectedDataCenter) {
      alert('Por favor seleccione un Data Center')
      return
    }
    if (selectedComponents.maquina && !selectedMaquina) {
      alert('Por favor seleccione una Máquina Virtual')
      return
    }
    if (selectedComponents.servidor && !selectedServidor) {
      alert('Por favor seleccione un Servidor')
      return
    }

    const formData = {
      id_evento: selectedEvento.value,
      id_data_center: selectedComponents.dataCenter ? selectedDataCenter?.value : null,
      id_servidor: selectedComponents.servidor ? selectedServidor?.value : null,
      id_maquina: selectedComponents.maquina ? selectedMaquina?.value : null,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }

    props.onSave(formData, props?.infraAfectada?.id)
  }

  if (loadingEventos || loadingDataCenters || loadingServidores || loadingMaquinas) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card
      sx={{
        maxWidth: '1000px',
        margin: 'auto',
        boxShadow: theme.shadows[3],
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
        }}
      >
        <Typography variant="h6" fontWeight="600">
          {props.infraAfectada?.id ? 'Editar Infraestructura' : 'Registrar Infraestructura Afectada'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {props.infraAfectada?.id ? 'Actualice los detalles' : 'Asocie infraestructura al evento'}
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* Evento (requerido) */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Event sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="textSecondary">
                    Evento asociado *
                  </Typography>
                </Box>
                <Select
                  value={selectedEvento}
                  options={eventosOptions}
                  onChange={setSelectedEvento}
                  styles={customSelectStyles}
                  placeholder="Seleccione un evento..."
                  noOptionsMessage={() => "No hay eventos disponibles"}
                  isSearchable
                  required
                />
              </Box>
            </Grid>

            {/* Selección de componentes */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Seleccione los componentes afectados:
                </Typography>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedComponents.dataCenter}
                        onChange={handleComponentChange('dataCenter')}
                        color="primary"
                      />
                    }
                    label="Data Center"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedComponents.maquina}
                        onChange={handleComponentChange('maquina')}
                        color="primary"
                      />
                    }
                    label="Máquina Virtual"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedComponents.servidor}
                        onChange={handleComponentChange('servidor')}
                        color="primary"
                      />
                    }
                    label="Servidor Físico"
                  />
                </FormGroup>
              </Box>
            </Grid>

            {/* Data Center (solo si está seleccionado) */}
            {selectedComponents.dataCenter && (
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Storage sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Data Center *
                    </Typography>
                  </Box>
                  <Select
                    value={selectedDataCenter}
                    options={dataCenterOptions}
                    onChange={setSelectedDataCenter}
                    styles={customSelectStyles}
                    placeholder="Seleccione data center..."
                    noOptionsMessage={() => "No hay data centers disponibles"}
                    isSearchable
                    required
                  />
                </Box>
              </Grid>
            )}

            {/* Máquina Virtual (solo si está seleccionado) */}
            {selectedComponents.maquina && (
              <Grid item xs={12} md={selectedComponents.dataCenter ? 6 : 12}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Computer sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Máquina Virtual *
                    </Typography>
                  </Box>
                  <Select
                    value={selectedMaquina}
                    options={maquinasOptions}
                    onChange={setSelectedMaquina}
                    styles={customSelectStyles}
                    placeholder="Buscar máquina virtual..."
                    noOptionsMessage={() => "No hay máquinas disponibles"}
                    isSearchable
                    required
                  />
                </Box>
              </Grid>
            )}

            {/* Servidor con búsqueda avanzada (solo si está seleccionado) */}
            {selectedComponents.servidor && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Dns sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="textSecondary">
                        Servidor Físico *
                      </Typography>
                    </Box>
                    <Tooltip title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}>
                      <IconButton
                        size="small"
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {showFilters ? <FilterAltOff fontSize="small" /> : <FilterAlt fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>



                  <Collapse in={showFilters}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          select
                          fullWidth
                          label="Marca"
                          value={filters.marca}
                          onChange={(e) => setFilters({...filters, marca: e.target.value})}
                          size="small"
                        >
                          <MenuItem value="">Todas</MenuItem>
                          {marcasUnicas.map(marca => (
                            <MenuItem key={marca} value={marca}>{marca}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          select
                          fullWidth
                          label="Tipo"
                          value={filters.tipo}
                          onChange={(e) => setFilters({...filters, tipo: e.target.value})}
                          size="small"
                        >
                          <MenuItem value="">Todos</MenuItem>
                          {tiposUnicos.map(tipo => (
                            <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          select
                          fullWidth
                          label="Estado"
                          value={filters.estado}
                          onChange={(e) => setFilters({...filters, estado: e.target.value})}
                          size="small"
                        >
                          <MenuItem value="ACTIVO">Activo</MenuItem>
                          <MenuItem value="INACTIVO">Inactivo</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Collapse>

                  <Select
                    value={selectedServidor}
                    options={servidoresOptions}
                    onChange={setSelectedServidor}
                    styles={{
                      ...customSelectStyles,
                      menuList: (base) => ({
                        ...base,
                        maxHeight: '400px'
                      })
                    }}
                    placeholder="Seleccione un servidor..."
                    noOptionsMessage={() => "No hay servidores que coincidan"}
                    isSearchable
                    required
                  />

                  {selectedServidor && (
                    <Box sx={{
                      mt: 1,
                      p: 2,
                      backgroundColor: theme.palette.grey[100],
                      borderRadius: '8px',
                      borderLeft: `4px solid ${theme.palette.primary.main}`
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Detalles del servidor seleccionado:
                      </Typography>
                      <Typography variant="body2">
                        <strong>Serie:</strong> {selectedServidor.data.serie}<br />
                        <strong>Marca/Modelo:</strong> {selectedServidor.data.marca} {selectedServidor.data.modelo}<br />
                        <strong>Tipo:</strong> {selectedServidor.data.cod_tipo_servidor}<br />
                        <strong>Estado:</strong> {selectedServidor.data.estado_operativo}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <LoadingButton
              variant="outlined"
              onClick={props.onCancel}
              startIcon={<Close />}
              sx={{
                px: 4,
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '500',
                fontSize: '0.875rem',
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
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '500',
                fontSize: '0.875rem',
              }}
            >
              {props.loading ? 'Guardando...' : (props.infraAfectada?.id ? 'Actualizar' : 'Guardar')}
            </LoadingButton>
          </Box>
        </form>
      </CardContent>
    </Card>
  )
}

export default InfraAfectadaForm
