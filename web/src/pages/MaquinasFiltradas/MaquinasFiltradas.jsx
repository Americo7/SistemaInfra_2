import React, { useState, useEffect } from 'react'

import {
  ArrowBack as ArrowBackIcon,
  Computer as ComputerIcon,
  MemoryOutlined as MemoryIcon,
  Storage as StorageIcon,
  MoreVert as MoreVertIcon,
  SettingsEthernet as SettingsEthernetIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Link as MuiLink,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'

import { Link, routes, navigate } from '@redwoodjs/router'
import { useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

// Consulta para obtener detalles del servidor con sus máquinas
const GET_SERVER_WITH_MACHINES = gql`
  query ServerWithMachines($id: Int!) {
    servidor(id: $id) {
      id
      nombre
      cod_tipo_servidor
      cod_inventario_agetic
      estado_operativo
      marca
      data_center {
        id
        nombre
      }
      asignacion_servidor_maquina {
        maquinas {
          id
          nombre
          codigo
          ip
          so
          ram
          almacenamiento
          cpu
          estado
          cod_plataforma
          es_virtual
          fecha_creacion
          usuario_creacion
        }
      }
    }
  }
`

const getServerTypeName = (code) =>
  ({
    1: 'CHASIS',
    2: 'BLADE',
    3: 'RACK',
    4: 'TORRE',
  }[code] || 'OTRO')

const getServerTypeIcon = (type) => {
  const icons = {
    CHASIS: <StorageIcon fontSize="large" sx={{ color: '#1976d2' }} />,
    BLADE: <MemoryIcon fontSize="large" sx={{ color: '#2e7d32' }} />,
    RACK: <StorageIcon fontSize="large" sx={{ color: '#ed6c02' }} />,
    TORRE: <ComputerIcon fontSize="large" sx={{ color: '#9c27b0' }} />,
  }
  return (
    icons[type] || <ComputerIcon fontSize="large" sx={{ color: '#d32f2f' }} />
  )
}

const getTypeColor = (type) =>
  ({
    CHASIS: 'primary',
    BLADE: 'success',
    RACK: 'warning',
    TORRE: 'secondary',
  }[type] || 'error')

const getPlatformIcon = (code) => {
  const icons = {
    1: <StorageIcon fontSize="small" sx={{ color: '#ff9800' }} />, // Linux
    2: <ComputerIcon fontSize="small" sx={{ color: '#2196f3' }} />, // Windows
    3: <MemoryIcon fontSize="small" sx={{ color: '#4caf50' }} />, // VMware
  }
  return (
    icons[code] || (
      <SettingsEthernetIcon fontSize="small" sx={{ color: '#9e9e9e' }} />
    )
  )
}

const getPlatformName = (code) =>
  ({
    1: 'Linux',
    2: 'Windows',
    3: 'VMware',
  }[code] || 'Otra')

/**
 * Función auxiliar para formatear valores. Si el valor es un objeto y tiene la propiedad "Valor",
 * retorna ese valor. De lo contrario, devuelve el valor o una cadena vacía.
 */
const formatValue = (value) => {
  if (value && typeof value === 'object') {
    return value.Valor !== undefined ? value.Valor : JSON.stringify(value)
  }
  return value
}

const MaquinasFiltradas = ({ id }) => {
  const theme = useTheme()
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedMachine, setSelectedMachine] = useState(null)

  const { loading, error, data } = useQuery(GET_SERVER_WITH_MACHINES, {
    variables: { id: parseInt(id) },
    fetchPolicy: 'network-only',
  })

  console.log('Data:  ', data)
  useEffect(() => {
    if (error) {
      toast.error('No se pudo cargar la información del Servidor')
      navigate(routes.dataCenters())
    }
  }, [error])

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Cargando datos del Servidor...</Typography>
      </Box>
    )
  }

  const servidor = data?.servidor
  if (!servidor) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">
          Servidor no encontrado o sin acceso
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

  const serverType = getServerTypeName(servidor.cod_tipo_servidor)

  const handleMenuOpen = (event, machine) => {
    setMenuAnchor(event.currentTarget)
    setSelectedMachine(machine)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedMachine(null)
  }

  const handleViewMachine = () => {
    if (selectedMachine?.id) {
      navigate(routes.maquina({ id: selectedMachine.id }))
    }
    handleMenuClose()
  }

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
          <MuiLink
            component={Link}
            to={routes.dataCenterServidor({ id: servidor.data_center.id })}
            underline="hover"
            color="inherit"
          >
            {servidor.data_center.nombre}
          </MuiLink>
          <Typography color="text.primary">{servidor.nombre}</Typography>
        </Breadcrumbs>
      </Paper>

      {/* Detalles del servidor */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette[getTypeColor(serverType)].light,
                  mr: 2,
                  width: 56,
                  height: 56,
                }}
              >
                {getServerTypeIcon(serverType)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {servidor.nombre}
                </Typography>
                <Chip
                  label={serverType}
                  color={getTypeColor(serverType)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Inventario:
                </Typography>
                <Typography>
                  {servidor.cod_inventario_agetic || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Estado Operativo:
                </Typography>
                <Chip
                  size="small"
                  label={servidor.estado_operativo || 'N/A'}
                  color={
                    servidor.estado_operativo === 'OPERATIVO'
                      ? 'success'
                      : 'error'
                  }
                  icon={
                    servidor.estado_operativo === 'OPERATIVO' ? (
                      <CheckCircleIcon />
                    ) : (
                      <ErrorIcon />
                    )
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Marca:
                </Typography>
                <Typography>{servidor.marca || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de todas las máquinas asignadas */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Máquinas asignadas
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  'Nombre',
                  'Código',
                  'IP',
                  'SO',
                  'RAM',
                  'Almacenamiento',
                  'CPU',
                  'Plataforma',
                  'Tipo',
                  'Acciones',
                ].map((col) => (
                  <TableCell key={col}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {servidor?.asignacion_servidor_maquina?.flatMap((asignacion) => {
                // Si 'maquinas' no es un array, lo envolvemos en uno.
                const maquinas = Array.isArray(asignacion?.maquinas)
                  ? asignacion.maquinas
                  : asignacion?.maquinas
                  ? [asignacion.maquinas]
                  : []
                return maquinas.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.nombre}</TableCell>
                    <TableCell>{m.codigo}</TableCell>
                    <TableCell>{m.ip}</TableCell>
                    <TableCell>{m.so}</TableCell>
                    <TableCell>{formatValue(m.ram)} GB</TableCell>
                    <TableCell>{formatValue(m.almacenamiento)} GB</TableCell>
                    <TableCell>{m.cpu}</TableCell>
                    <TableCell>
                      <Tooltip title={getPlatformName(m.cod_plataforma)}>
                        {getPlatformIcon(m.cod_plataforma)}
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.es_virtual ? 'Virtual' : 'Física'}
                        color={m.es_virtual ? 'info' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, m)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Menú contextual */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewMachine}>Ver detalles</MenuItem>
      </Menu>
    </Box>
  )
}

export default MaquinasFiltradas
