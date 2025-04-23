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
  MenuItem
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  CheckCircleOutline,
  Close,
  Storage,
  Dns,
  Computer,
  Search,
  FilterAlt,
  FilterAltOff
} from '@mui/icons-material'

const OBTENER_SERVIDORES = gql`
  query ObtenerServidores {
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

const OBTENER_CLUSTERS = gql`
  query ObtenerClustersAsignacion {
    clusters {
      id
      nombre
      estado
    }
  }
`

const GET_MAQUINA = gql`
  query GetMaquinasAsignacion_fromAsignacionForm {
    maquinas {
      id
      nombre
      estado
    }
  }
`

const AsignacionServidorMaquinaForm = (props) => {
  const theme = useTheme()
  const { data: servidoresData, loading: loadingServidores } = useQuery(OBTENER_SERVIDORES)
  const { data: clustersData, loading: loadingClusters } = useQuery(OBTENER_CLUSTERS)
  const { data: maquinasData, loading: loadingMaquinas } = useQuery(GET_MAQUINA)

  const [selectedCluster, setSelectedCluster] = useState(null)
  const [selectedServidor, setSelectedServidor] = useState(null)
  const [selectedMaquina, setSelectedMaquina] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    marca: '',
    tipo: '',
    estado: 'ACTIVO'
  })

  // Inicializar valores cuando hay datos para editar
  useEffect(() => {
    if (props.asignacionServidorMaquina && servidoresData && clustersData && maquinasData) {
      const servidor = servidoresData.servidores.find(s => s.id === props.asignacionServidorMaquina.id_servidor)
      const cluster = clustersData.clusters.find(c => c.id === props.asignacionServidorMaquina.id_cluster)
      const maquina = maquinasData.maquinas.find(m => m.id === props.asignacionServidorMaquina.id_maquina)

      if (servidor) setSelectedServidor({
        value: servidor.id,
        label: `${servidor.serie} - ${servidor.marca} ${servidor.modelo} (${servidor.cod_tipo_servidor})`,
        data: servidor
      })
      if (cluster) setSelectedCluster({
        value: cluster.id,
        label: cluster.nombre
      })
      if (maquina) setSelectedMaquina({
        value: maquina.id,
        label: maquina.nombre
      })
    }
  }, [props.asignacionServidorMaquina, servidoresData, clustersData, maquinasData])

  // Filtrar servidores basados en búsqueda y filtros
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

  // Opciones para los selects
  const clustersOptions = clustersData?.clusters
    ?.filter(cluster => cluster.estado === 'ACTIVO')
    .map(cluster => ({
      value: cluster.id,
      label: cluster.nombre,
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

  // Valores únicos para filtros
  const marcasUnicas = [...new Set(servidoresData?.servidores?.map(s => s.marca))].filter(Boolean)
  const tiposUnicos = [...new Set(servidoresData?.servidores?.map(s => s.cod_tipo_servidor))].filter(Boolean)

  // Estilos personalizados para los selects
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

    const formData = {
      id_servidor: selectedServidor?.value || null,
      id_cluster: selectedCluster?.value || null,
      id_maquina: selectedMaquina?.value || null,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }

    props.onSave(formData, props?.asignacionServidorMaquina?.id)
  }

  if (loadingServidores || loadingClusters || loadingMaquinas) {
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
          {props.asignacionServidorMaquina?.id ? 'Editar Asignación' : 'Nueva Asignación'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {props.asignacionServidorMaquina?.id ? 'Actualice la asignación' : 'Asocie servidores, máquinas y clusters'}
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* Servidor con búsqueda avanzada */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Dns sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="textSecondary">
                      Servidor Físico
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
                  isClearable
                  isSearchable
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

            {/* Máquina Virtual */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Computer sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="textSecondary">
                    Máquina Virtual
                  </Typography>
                </Box>
                <Select
                  value={selectedMaquina}
                  options={maquinasOptions}
                  onChange={setSelectedMaquina}
                  styles={customSelectStyles}
                  placeholder="Buscar máquina virtual..."
                  noOptionsMessage={() => "No hay máquinas disponibles"}
                  isClearable
                  isSearchable
                />
              </Box>
            </Grid>

            {/* Cluster */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Storage sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="textSecondary">
                    Cluster
                  </Typography>
                </Box>
                <Select
                  value={selectedCluster}
                  options={clustersOptions}
                  onChange={setSelectedCluster}
                  styles={customSelectStyles}
                  placeholder="Seleccione cluster..."
                  noOptionsMessage={() => "No hay clusters disponibles"}
                  isClearable
                  isSearchable
                />
              </Box>
            </Grid>
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
              {props.loading ? 'Guardando...' : (props.asignacionServidorMaquina?.id ? 'Actualizar' : 'Guardar')}
            </LoadingButton>
          </Box>
        </form>
      </CardContent>
    </Card>
  )
}

export default AsignacionServidorMaquinaForm
