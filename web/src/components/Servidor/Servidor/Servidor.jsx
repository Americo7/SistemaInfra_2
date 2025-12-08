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
  Paper,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  IconButton,
  Tooltip,
  Switch
} from '@mui/material'

import {
  Storage as ServerIcon,
  Computer as MachineIcon,
  Dns as ClusterIcon,
  Memory as MemoryIcon,
  Business as DataCenterIcon,
  Router as NetworkIcon,
  History as AuditIcon,
  Info as GeneralIcon,
  ArrowBack as BackIcon,
  Cloud as DeploymentIcon,
  Event as EventIcon,
  DeveloperBoard as HardwareIcon,
  Settings as OSIcon,
  Edit as EditIcon
} from '@mui/icons-material'

/* -----------------------
 * DEFINICIONES GRAPHQL
 * ----------------------- */

const UPDATE_SERVIDOR_STATE_MUTATION = gql`
  mutation UpdateServidorState($id: Int!, $input: UpdateServidorInput!) {
    updateServidor(id: $id, input: $input) {
      id
      estado
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const DELETE_SERVIDOR_MUTATION = gql`
  mutation DeleteServidorMutation($id: Int!) {
    deleteServidor(id: $id) {
      id
    }
  }
`

/* -----------------------
 * HELPERS
 * ----------------------- */
const fmtDate = (d) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

const formatUserName = (userObj) => {
  if (!userObj) return 'Sistema Automático'
  const { nombres, primer_apellido, segundo_apellido } = userObj
  return `${nombres} ${primer_apellido} ${segundo_apellido || ''}`.trim()
}

const getEstadoOperativoColor = (codigo) => {
  if (!codigo) return 'default'
  const c = String(codigo).toUpperCase()
  if (c === 'OPERATIVO') return 'success'
  if (c === 'FUERA_SERVICIO') return 'error'
  if (c === 'MANTENIMIENTO') return 'warning'
  return 'default'
}

/* -----------------------
 * COMPONENTES UI
 * ----------------------- */
const RowItem = ({ label, value, icon, isLast }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      py: 0.75,
      borderBottom: isLast ? 'none' : '1px solid',
      borderColor: 'divider',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ width: '40%', pr: 2, display: 'flex', alignItems: 'center' }}
    >
      {icon && <Box sx={{ mr: 1, display: 'flex', color: 'action.active' }}>{icon}</Box>}
      {label}
    </Typography>

    <Box sx={{ width: '60%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ flexGrow: 1 }}>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  </Box>
)

const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  return (
    <Card
      sx={{
        borderRadius: 2,
        borderTop: `3px solid ${bgcolor || theme.palette.primary.main}`,
        height: 'auto'
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: bgcolor || theme.palette.primary.main, width: 32, height: 32 }}>
            {icon}
          </Avatar>
        }
        title={<Typography sx={{ fontWeight: 700 }}>{title}</Typography>}
        sx={{ py: 1, px: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent sx={{ p: 1.5 }}>{children}</CardContent>
    </Card>
  )
}

/* -----------------------
 * COMPONENTE PRINCIPAL
 * ----------------------- */
const Servidor = ({ servidor }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  // -- Mutation Delete --
  const [deleteServidor] = useMutation(DELETE_SERVIDOR_MUTATION, {
    onCompleted: () => {
      toast.success('Servidor eliminado correctamente')
      navigate(routes.servidors())
    },
    onError: (error) => toast.error(error.message),
  })

  // -- Mutation Update (Toggle Estado) --
  const [updateServidor, { loading: loadingUpdate }] = useMutation(UPDATE_SERVIDOR_STATE_MUTATION, {
    onCompleted: (data) => {
      const nuevoEstado = data.updateServidor.estado
      toast.success(`Servidor ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente`)
    },
    onError: (error) => toast.error(error.message),
  })

  const handleToggleEstado = (e) => {
    // Si estaba inactivo, lo activamos. Si estaba activo, lo desactivamos.
    const nuevoEstado = e.target.checked ? 'ACTIVO' : 'INACTIVO'
    
    updateServidor({ 
      variables: { 
        id: servidor.id, 
        input: { estado: nuevoEstado } 
      } 
    })
  }

  // Memoización de relaciones
  const maquinas = servidor?.maquinas || []
  const clusterNodos = servidor?.cluster_nodos || []
  const despliegues = servidor?.despliegue || []
  const eventos = servidor?.infra_afectada || []

  const clusterInfo = useMemo(() => {
    if (!clusterNodos.length) return []
    return clusterNodos.map((n) => ({
      id: n.id,
      nombre: n.cluster?.nombre || 'Desconocido',
      rol: n.rol,
      tipo: n.nodoTipo,
      link: routes.cluster({ id: n.cluster?.id || 0 }),
    }))
  }, [clusterNodos])

  const handleTabChange = (_, v) => setTab(v)

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      
      {/* TARJETA PRINCIPAL HEADER */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '0 0 12px 12px',
          mb: 3,
        }}
      >
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver a lista">
            <IconButton
              onClick={() => navigate(routes.servidors())}
              sx={{
                bgcolor: 'rgba(63,81,181,0.15)',
                border: '1px solid rgba(63,81,181,0.3)',
              }}
            >
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 42,
              height: 42,
              background: 'linear-gradient(135deg, #5a00f0, #8a2be2)',
            }}
          >
            <ServerIcon />
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={800}>
              {servidor.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ficha técnica de servidor físico
            </Typography>
          </Box>

          <Tooltip title="Editar Servidor">
             <IconButton 
                component={Link} 
                to={routes.editServidor({ id: servidor.id })}
                color="primary"
                sx={{ bgcolor: 'action.hover' }}
             >
                <EditIcon />
             </IconButton>
          </Tooltip>
        </Box>

        <CardContent sx={{ px: 5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start' }}>
            
            {/* --- COLUMNA IZQUIERDA --- */}
            <Stack spacing={2}>
              {/* 1. INFORMACIÓN GENERAL */}
              <SectionCard icon={<GeneralIcon />} title="Información General">
                <RowItem label="Tipo Servidor" value={servidor.tipoServidorInfo?.nombre || servidor.cod_tipo_servidor || '-'} />
                <RowItem label="Cod. Inventario" value={servidor.cod_inventario_agetic || '-'} />
                <RowItem
                  label="Marca / Modelo"
                  value={`${servidor.marca || ''} ${servidor.modelo || ''}`}
                  icon={<HardwareIcon />}
                />
                <RowItem label="Serie" value={servidor.serie} />
                <RowItem label="Sistema Operativo" value={servidor.sistema_operativo} icon={<OSIcon />} />
                
                {/* IP AQUÍ */}
                <RowItem label="Dirección IP" value={servidor.ip_primaria || 'No asignada'} />

                <RowItem
                  label="Estado Operativo"
                  isLast
                  value={
                    <Chip
                      label={servidor.estadoOperativoInfo?.nombre || servidor.estado_operativo || 'N/A'}
                      size="small"
                      color={getEstadoOperativoColor(servidor.estado_operativo)}
                      sx={{ height: 20, fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  }
                />
              </SectionCard>

              {/* 2. HARDWARE */}
              <SectionCard icon={<MemoryIcon />} title="Hardware y Recursos" bgcolor={theme.palette.success.main}>
                <RowItem label="Memoria RAM" value={`${servidor.ram || 0} GB`} />
                <RowItem label="Almacenamiento Total" value={`${servidor.almacenamiento || 0} GB`} isLast />
              </SectionCard>
            </Stack>

            {/* --- COLUMNA DERECHA --- */}
            <Stack spacing={2}>
              
              {/* 1. RED Y UBICACIÓN (ARRIBA) */}
              <SectionCard icon={<NetworkIcon />} title="Red y Ubicación" bgcolor={theme.palette.info.main}>
                <RowItem
                  label="Data Center"
                  value={servidor.data_centers?.nombre || 'No asignado'}
                  icon={<DataCenterIcon />}
                />

                {clusterInfo.length > 0 ? (
                  clusterInfo.map((ci) => (
                    <Box key={ci.id}>
                      <RowItem
                        label={ci.tipo === 'HOST' ? 'Host de Cluster' : 'Nodo de Cluster'}
                        value={
                          <Link to={ci.link} style={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            {ci.nombre}
                          </Link>
                        }
                        icon={<ClusterIcon />}
                      />
                      {ci.rol && <RowItem label="Rol" value={<Chip label={ci.rol} size="small" />} />}
                    </Box>
                  ))
                ) : (
                  <RowItem label="Cluster" value="Stand-alone (Sin cluster)" icon={<ClusterIcon />} />
                )}

                <RowItem
                  label="Servidor Padre"
                  value={servidor.servidores_padre?.nombre || 'N/A (Físico)'}
                  isLast
                />
              </SectionCard>

              {/* 2. AUDITORÍA (ABAJO) - CON SWITCH FUNCIONAL */}
              <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                <RowItem
                  label="Estado Registro"
                  value={
                    <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                        <Chip
                          label={servidor.estado}
                          size="small"
                          color={servidor.estado === 'ACTIVO' ? 'success' : 'error'}
                        />
                        <Tooltip title={servidor.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}>
                            <Switch 
                                size="small"
                                checked={servidor.estado === 'ACTIVO'}
                                onChange={handleToggleEstado}
                                disabled={loadingUpdate}
                                color="success"
                            />
                        </Tooltip>
                    </Stack>
                  }
                />
                <RowItem label="Fecha Creación" value={fmtDate(servidor.fecha_creacion)} />
                <RowItem label="Creado por" value={formatUserName(servidor.creadoPor)} />
                <RowItem label="Última Modificación" value={fmtDate(servidor.fecha_modificacion)} />
                <RowItem label="Modificado por" value={formatUserName(servidor.modificadoPor)} isLast />
              </SectionCard>

            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* --------- TABS DE DETALLE --------- */}
      <Card sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab label={<Stack direction="row" spacing={1}><MachineIcon fontSize="small"/><span>Máquinas Virtuales</span><Chip label={maquinas.length} size="small"/></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><DeploymentIcon fontSize="small"/><span>Despliegues</span><Chip label={despliegues.length} size="small"/></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><EventIcon fontSize="small"/><span>Eventos</span><Chip label={eventos.length} size="small"/></Stack>} />
        </Tabs>

        <CardContent>
          {tab === 0 && (
            maquinas.length ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>VMID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>Recursos</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maquinas.map((vm) => (
                      <TableRow key={vm.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{vm.proxmox_vmid}</TableCell>
                        <TableCell><Link to={routes.maquina({ id: vm.id })} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>{vm.nombre}</Link></TableCell>
                        <TableCell>{vm.ip}</TableCell>
                        <TableCell>{vm.cpu} CPU / {vm.ram} GB</TableCell>
                        <TableCell><Chip label={vm.estado_operativo} size="small" color={getEstadoOperativoColor(vm.estado_operativo)} sx={{ height: 20, fontSize: '0.7rem' }}/></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" align="center" sx={{p:2}}>No hay máquinas virtuales.</Typography>
          )}

          {tab === 1 && (
            despliegues.length ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Componente</TableCell><TableCell>Fecha</TableCell><TableCell>Estado</TableCell></TableRow></TableHead>
                  <TableBody>{despliegues.map((d) => (<TableRow key={d.id}><TableCell>{d.componentes?.nombre}</TableCell><TableCell>{fmtDate(d.fecha_despliegue)}</TableCell><TableCell><Chip label={d.estado_despliegue} size="small" /></TableCell></TableRow>))}</TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" align="center" sx={{p:2}}>No hay despliegues.</Typography>
          )}

          {tab === 2 && (
            eventos.length ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Tipo</TableCell><TableCell>Descripción</TableCell><TableCell>Fecha</TableCell><TableCell>Solicitante</TableCell></TableRow></TableHead>
                  <TableBody>{eventos.map((ev) => { const e = ev.eventos?.[0] || {}; return (<TableRow key={ev.id}><TableCell>{e.cod_tipo_evento}</TableCell><TableCell>{e.descripcion}</TableCell><TableCell>{fmtDate(e.fecha_evento)}</TableCell><TableCell>{e.solicitante}</TableCell></TableRow>) })}</TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" align="center" sx={{p:2}}>No hay eventos.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Servidor