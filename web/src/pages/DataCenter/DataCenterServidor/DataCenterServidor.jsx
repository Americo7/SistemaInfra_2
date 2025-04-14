import React, { useState, useEffect } from 'react'

import {
  ArrowBack as ArrowBackIcon,
  Computer as ComputerIcon,
  MemoryOutlined as MemoryIcon,
  Storage as StorageIcon,
  DeviceHub as DeviceHubIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Breadcrumbs,
  Chip,
  Divider,
  Grid,
  IconButton,
  Link as MuiLink,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

import { Link, routes, navigate } from '@redwoodjs/router'
import { useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

// Query para obtener detalles del data center y sus servidores
const GET_DATA_CENTER_WITH_SERVERS = gql`
  query DataCenterWithServers($id: Int!) {
    dataCenter(id: $id) {
      id
      nombre
      estado
      servidores {
        id
        nombre
        cod_inventario_agetic
        ram
        almacenamiento
        estado_operativo
        estado
        marca
        modelo
        cod_tipo_servidor
        fecha_creacion
      }
    }
  }
`

// Icono según el tipo de servidor
const getServerTypeIcon = (type) => {
  switch (type) {
    case 'CHASIS':
      return <DeviceHubIcon fontSize="large" sx={{ color: '#1976d2' }} />
    case 'BLADE':
      return <MemoryIcon fontSize="large" sx={{ color: '#2e7d32' }} />
    case 'RACK':
      return <StorageIcon fontSize="large" sx={{ color: '#ed6c02' }} />
    case 'TORRE':
      return <ComputerIcon fontSize="large" sx={{ color: '#9c27b0' }} />
    default:
      return <DeviceHubIcon fontSize="large" sx={{ color: '#d32f2f' }} />
  }
}

// Color del chip según tipo
const getTypeColor = (type) => {
  switch (type) {
    case 'CHASIS':
      return 'primary'
    case 'BLADE':
      return 'success'
    case 'RACK':
      return 'warning'
    case 'TORRE':
      return 'secondary'
    default:
      return 'error'
  }
}

// Formatear fecha
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const DataCenterServidor = ({ id }) => {
  const [activeTab, setActiveTab] = useState('all')
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const [selectedServerId, setSelectedServerId] = useState(null)

  const { loading, error, data } = useQuery(GET_DATA_CENTER_WITH_SERVERS, {
    variables: { id: parseInt(id) },
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (error) {
      console.error('Error al cargar los datos del Data Center:', error)
      toast.error('No se pudo cargar la información del Data Center')
      navigate(routes.dataCenters())
    }
  }, [error])

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Cargando datos del Data Center...</Typography>
      </Box>
    )
  }

  const dataCenter = data?.dataCenter
  if (!dataCenter) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">
          Data Center no encontrado o sin acceso
        </Typography>
        <Button
          component={Link}
          to={routes.dataCenters()}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </Box>
    )
  }

  const getFilteredServers = () => {
    if (activeTab === 'all') return dataCenter.servidores
    return dataCenter.servidores.filter(
      (server) => server.cod_tipo_servidor === activeTab
    )
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleMenuOpen = (event, serverId) => {
    setMenuAnchorEl(event.currentTarget)
    setSelectedServerId(serverId)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
    setSelectedServerId(null)
  }

  const handleViewServer = () => {
    navigate(routes.servidor({ id: selectedServerId }))
    handleMenuClose()
  }
  const handleViewMaquina = () => {
    navigate(routes.maquinasFiltradas({ id: selectedServerId }))
    handleMenuClose()
  }

  const serverTypes = ['CHASIS', 'BLADE', 'RACK', 'TORRE']

  return (
    <Box sx={{ p: 2 }}>
      {/* Breadcrumbs */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" separator="›">
          <MuiLink
            component={Link}
            to={routes.home()}
            underline="hover"
            color="inherit"
          >
            Dashboard
          </MuiLink>
          <MuiLink
            component={Link}
            to={routes.dataCenters()}
            underline="hover"
            color="inherit"
          >
            Data Centers
          </MuiLink>
          <Typography color="text.primary">{dataCenter.nombre}</Typography>
        </Breadcrumbs>
      </Paper>

      {/* Cabecera */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {dataCenter.nombre}
          </Typography>
          <Chip
            label={dataCenter.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
            color={dataCenter.estado === 'ACTIVO' ? 'success' : 'error'}
            sx={{ mt: { xs: 2, sm: 0 } }}
          />
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Todos" value="all" />
          {serverTypes.map((type) => (
            <Tab key={type} label={type} value={type} />
          ))}
        </Tabs>

        {/* Tabla */}
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Inventario AGETIC</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Marca/Modelo</TableCell>
                <TableCell>RAM</TableCell>
                <TableCell>Almacenamiento</TableCell>
                <TableCell>Fecha de Creación</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredServers()?.map((server) => (
                <TableRow key={server.id}>
                  <TableCell>{server.nombre}</TableCell>
                  <TableCell>{server.cod_inventario_agetic}</TableCell>
                  <TableCell>{server.cod_tipo_servidor}</TableCell>
                  <TableCell>
                    {server.marca} {server.modelo}
                  </TableCell>
                  <TableCell>{server.ram}</TableCell>
                  <TableCell>{server.almacenamiento}</TableCell>
                  <TableCell>{formatDateTime(server.fecha_creacion)}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="more"
                      onClick={(event) => handleMenuOpen(event, server.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={selectedServerId === server.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={handleViewServer}>
                        Ver servidor
                      </MenuItem>
                      <MenuItem onClick={handleViewMaquina}>
                        Ver Maquinas
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default DataCenterServidor
