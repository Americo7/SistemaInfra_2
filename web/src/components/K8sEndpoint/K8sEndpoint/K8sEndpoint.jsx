import React, { useState } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { timeTag, formatEnum } from 'src/lib/formatters'

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  Chip,
  useTheme,
  Tabs,
  Tab,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Tooltip,
} from '@mui/material'

import {
  Cloud as CloudIcon,
  Dns as ClusterIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material'

/* ---------------------------------------------
 * Mutations
 * --------------------------------------------- */
const DELETE_K8S_ENDPOINT_MUTATION = gql`
  mutation DeleteK8sEndpointMutation($id: Int!) {
    deleteK8sEndpoint(id: $id) {
      id
    }
  }
`

/* ---------------------------------------------
 * Reusable Item
 * --------------------------------------------- */
const RowItem = ({ label, value }) => (
  <Box
    sx={{
      display: 'flex',
      py: 1.5,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Typography variant="body2" sx={{ width: '35%', color: 'text.secondary', fontWeight: 500 }}>
      {label}
    </Typography>

    <Box sx={{ width: '65%' }}>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  </Box>
)

/* ---------------------------------------------
 * Inner Card (hijo)
 * --------------------------------------------- */
const InnerCard = ({ title, children, icon }) => {
  const theme = useTheme()
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
      }}
    >
      <CardHeader
        avatar={icon ? <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>{icon}</Avatar> : null}
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        }
        sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'grey.50' }}
      />
      <CardContent sx={{ pt: 2 }}>{children}</CardContent>
    </Card>
  )
}

/* ---------------------------------------------
 * Tab Panel Helper
 * --------------------------------------------- */
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

/* ---------------------------------------------
 * MAIN COMPONENT
 * --------------------------------------------- */
const K8sEndpoint = ({ k8SEndpoint, usuarios = [] }) => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)

  // --- Mutation para eliminar ---
  const [deleteK8sEndpoint] = useMutation(DELETE_K8S_ENDPOINT_MUTATION, {
    onCompleted: () => {
      toast.success('Endpoint eliminado correctamente')
      navigate(routes.k8SEndpoints())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // --- Handlers ---
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const onDeleteClick = (id) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el Endpoint "${k8SEndpoint.nombre}"?`)) {
      deleteK8sEndpoint({ variables: { id } })
    }
  }

  const getUserFullName = (id) => {
    if (!id) return 'Sistema / Desconocido'
    const u = usuarios.find((x) => x.id === id)
    if (!u) return `ID ${id}`
    return [u.nombres, u.primer_apellido, u.segundo_apellido].filter(Boolean).join(' ')
  }

  const clustersAsociados = k8SEndpoint.clusters || []

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 2 }}>

      {/* HEADER TABS */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<InfoIcon />} iconPosition="start" label="Detalles Generales" />
          <Tab
            icon={<ClusterIcon />}
            iconPosition="start"
            label={`Clusters Asociados (${clustersAsociados.length})`}
          />
        </Tabs>
      </Box>

      {/* --- TAB 1: DETALLES --- */}
      <CustomTabPanel value={tabValue} index={0}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
          }}
        >
          {/* COLUMNA IZQUIERDA: CONEXIÓN */}
          <InnerCard title="Datos de Conexión" icon={<CloudIcon sx={{ fontSize: 18 }} />}>
            <RowItem label="ID Endpoint" value={k8SEndpoint.id} />
            <RowItem label="Nombre" value={k8SEndpoint.nombre} />
            <RowItem
              label="URL API"
              value={
                <Typography
                  component="a"
                  href={k8SEndpoint.url_api}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                >
                  {k8SEndpoint.url_api}
                </Typography>
              }
            />
            <RowItem
              label="Token Bearer"
              value={
                <Tooltip title={k8SEndpoint.token_bearer}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      bgcolor: 'grey.100',
                      p: 0.5,
                      borderRadius: 1,
                      display: 'block',
                      wordBreak: 'break-all',
                      maxHeight: 100,
                      overflowY: 'auto',
                    }}
                  >
                    {k8SEndpoint.token_bearer}
                  </Typography>
                </Tooltip>
              }
            />
            <RowItem label="Descripción" value={k8SEndpoint.descripcion || 'Sin descripción'} />
          </InnerCard>

          {/* COLUMNA DERECHA: ESTADO Y AUDITORÍA */}
          <InnerCard title="Estado y Auditoría" icon={<InfoIcon sx={{ fontSize: 18 }} />}>
            <RowItem
              label="Estado"
              value={
                <Chip
                  size="small"
                  label={formatEnum(k8SEndpoint.estado)}
                  color={k8SEndpoint.estado === 'ACTIVO' ? 'success' : 'error'}
                />
              }
            />
            <RowItem
              label="Última Sincronización"
              value={timeTag(k8SEndpoint.fecha_ultima_sync) || 'Nunca'}
            />
            <RowItem
              label="Fecha Creación"
              value={timeTag(k8SEndpoint.fecha_creacion)}
            />
            <RowItem
              label="Creado por"
              value={getUserFullName(k8SEndpoint.usuario_creacion)}
            />
            <RowItem
              label="Última Modificación"
              value={timeTag(k8SEndpoint.fecha_modificacion)}
            />
            <RowItem
              label="Modificado por"
              value={getUserFullName(k8SEndpoint.usuario_modificacion)}
            />
          </InnerCard>
        </Box>
      </CustomTabPanel>

      {/* --- TAB 2: CLUSTERS ASOCIADOS --- */}
      <CustomTabPanel value={tabValue} index={1}>
        <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nombre del Cluster</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clustersAsociados.length > 0 ? (
                  clustersAsociados.map((cluster) => (
                    <TableRow key={cluster.id} hover>
                      <TableCell>{cluster.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{cluster.nombre}</TableCell>
                      <TableCell>{cluster.cod_tipo_cluster}</TableCell>
                      <TableCell>
                        <Chip
                          label={formatEnum(cluster.estado)}
                          size="small"
                          color={cluster.estado === 'ACTIVO' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver Cluster">
                          <IconButton
                            component={Link}
                            to={routes.cluster({ id: cluster.id })}
                            color="primary"
                            size="small"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay clusters asociados a este endpoint.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </CustomTabPanel>

    </Box>
  )
}

export default K8sEndpoint