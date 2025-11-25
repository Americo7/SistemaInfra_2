import React, { useMemo, useState } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Button,
  useTheme,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material'

import {
  Dns as ClusterIcon,
  Computer as MachineIcon,
  Storage as ServerIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ListAlt as ListIcon,
  Info as InfoIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material'

/* -----------------------
 * Mutations
 * ----------------------- */
const DELETE_CLUSTER_NODO_MUTATION = gql`
  mutation DeleteClusterNodoMutation($id: Int!) {
    deleteClusterNodo(id: $id) {
      id
    }
  }
`

/* ---------------------------------------------
 * Helpers
 * --------------------------------------------- */
const fmtDate = (d) => {
  if (!d) return ''
  try {
    const date = new Date(d)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(d)
  }
}

const fmtEnum = (val) => (val ? String(val).toUpperCase() : '')

const RowItem = ({ label, value }) => (
  <Box
    sx={{
      display: 'flex',
      py: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' },
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ width: '40%', pr: 2, display: 'flex', alignItems: 'center' }}
    >
      {label}
    </Typography>
    <Box sx={{ width: '60%', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
          {value ?? ''}
        </Typography>
      ) : (
        value ?? <Typography variant="body2"> </Typography>
      )}
    </Box>
  </Box>
)

const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  return (
    <Card
      sx={{
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.12)',
        height: 'fit-content',
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: bgcolor || theme.palette.primary.main,
              width: 36,
              height: 36,
            }}
          >
            {icon}
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        }
        sx={{
          py: 1.2,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      />
      <CardContent sx={{ flex: 1, py: 1, px: 2 }}>{children}</CardContent>
    </Card>
  )
}

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
 * CLUSTER NODO COMPONENT
 * --------------------------------------------- */
const ClusterNodo = ({ clusterNodo }) => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)

  const [deleteClusterNodo] = useMutation(DELETE_CLUSTER_NODO_MUTATION, {
    onCompleted: () => {
      toast.success('Nodo de clúster eliminado')
      navigate(routes.clusterNodos())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Handlers
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const onDeleteClick = (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar el nodo ' + id + '?')) {
      deleteClusterNodo({ variables: { id } })
    }
  }

  // --- Lógica de Presentación ---

  const nombreRecurso = useMemo(() => {
    if (clusterNodo?.maquina) return clusterNodo.maquina.nombre
    if (clusterNodo?.servidor) return clusterNodo.servidor.nombre
    return 'No asignado'
  }, [clusterNodo])

  const tipoRecurso = useMemo(() => {
    if (clusterNodo?.maquina) return 'Máquina Virtual'
    if (clusterNodo?.servidor) return 'Servidor Físico'
    return 'No definido'
  }, [clusterNodo])

  // Extraemos las VMs si es un servidor físico (gracias a la nueva Query)
  const hostedVms = useMemo(() => {
    return clusterNodo?.servidor?.maquinas || []
  }, [clusterNodo])

  // Verificamos si es nodo físico
  const isPhysicalNode = clusterNodo?.nodoTipo === 'FISICO'

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>

      {/* --- HEADER TABS --- */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="cluster nodo tabs">
          <Tab icon={<InfoIcon />} iconPosition="start" label="Detalles Generales" />
          {isPhysicalNode && (
            <Tab
              icon={<MachineIcon />}
              iconPosition="start"
              label={`Máquinas Virtuales (${hostedVms.length})`}
            />
          )}
        </Tabs>
      </Box>

      {/* --- TAB 1: DETALLES --- */}
      <CustomTabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>

          {/* CARD 1: INFORMACIÓN DEL NODO */}
          <SectionCard
            icon={<ClusterIcon sx={{ fontSize: 18 }} />}
            title="Información del Nodo"
            bgcolor={theme.palette.primary.main}
          >
            <RowItem label="ID" value={clusterNodo?.id || ''} />
            <RowItem label="Nombre del nodo" value={clusterNodo?.nombre || ''} />
            <RowItem label="Tipo de nodo" value={fmtEnum(clusterNodo?.nodoTipo) || ''} />
            <RowItem label="Rol" value={clusterNodo?.rol || ''} />

            {clusterNodo?.k8s_uid && (
              <RowItem
                label="K8s UID"
                value={
                  <Tooltip title={clusterNodo.k8s_uid}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', cursor: 'help' }}>
                      {clusterNodo.k8s_uid.substring(0, 20)}...
                    </Typography>
                  </Tooltip>
                }
              />
            )}

            <RowItem
              label="Estado"
              value={
                <Chip
                  label={fmtEnum(clusterNodo?.estado)}
                  size="small"
                  sx={{
                    bgcolor: clusterNodo?.estado === 'ACTIVO' ? theme.palette.success.main : theme.palette.error.main,
                    color: '#fff',
                    height: 22,
                    fontSize: '0.75rem',
                  }}
                />
              }
            />
            <RowItem label="Fecha de creación" value={fmtDate(clusterNodo?.fecha_creacion)} />
            <RowItem label="Usuario creación" value={clusterNodo?.usuario_creacion || ''} />
            <RowItem label="Última modificación" value={fmtDate(clusterNodo?.fecha_modificacion)} />
            <RowItem label="Usuario modificación" value={clusterNodo?.usuario_modificacion || ''} />
          </SectionCard>

          {/* CARD 2: RECURSO Y CLUSTER */}
          <SectionCard
            icon={clusterNodo?.maquina ? <MachineIcon sx={{ fontSize: 18 }} /> : <ServerIcon sx={{ fontSize: 18 }} />}
            title="Recurso y Cluster"
            bgcolor={clusterNodo?.maquina ? theme.palette.info.main : theme.palette.warning.main}
          >
            <RowItem label="Nombre del recurso" value={nombreRecurso} />
            <RowItem label="Tipo de recurso" value={tipoRecurso} />
            <RowItem
              label="Cluster"
              value={
                clusterNodo?.cluster ? (
                  <Link
                    to={routes.cluster({ id: clusterNodo.cluster.id })} // Asumiendo que existe ruta 'cluster'
                    style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}
                  >
                    {clusterNodo.cluster.nombre}
                  </Link>
                ) : (
                  'No asignado'
                )
              }
            />
            <RowItem label="Cluster ID" value={clusterNodo?.clusterId || ''} />
            <RowItem label="Máquina ID" value={clusterNodo?.maquinaId || 'No asignado'} />
            <RowItem label="Servidor ID" value={clusterNodo?.servidorId || 'No asignado'} />
          </SectionCard>
        </Box>
      </CustomTabPanel>

      {/* --- TAB 2: MÁQUINAS VIRTUALES (SOLO SI ES FÍSICO) --- */}
      {isPhysicalNode && (
        <CustomTabPanel value={tabValue} index={1}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardHeader
              title="Máquinas Virtuales Alojadas"
              subheader={`Listado de VMs corriendo en el servidor ${clusterNodo?.servidor?.nombre || ''}`}
              avatar={
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <ListIcon />
                </Avatar>
              }
            />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Proxmox ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>IP</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Plataforma</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hostedVms.length > 0 ? (
                    hostedVms.map((vm) => (
                      <TableRow key={vm.id} hover>
                        <TableCell>
                          <Chip
                            label={vm.proxmox_vmid || 'N/A'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{vm.nombre}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{vm.ip || '-'}</TableCell>
                        <TableCell>{vm.cod_plataforma || '-'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalles de la máquina">
                            <IconButton
                              component={Link}
                              to={routes.maquina({ id: vm.id })} // Asumiendo que existe ruta 'maquina'
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
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No hay máquinas virtuales registradas en este nodo físico.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </CustomTabPanel>
      )}

      {/* --- BOTONES DE ACCIÓN --- */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          component={Link}
          to={routes.editClusterNodo({ id: clusterNodo.id })}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Editar
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDeleteClick(clusterNodo.id)}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Eliminar
        </Button>
      </Box>
    </Box>
  )
}

export default ClusterNodo