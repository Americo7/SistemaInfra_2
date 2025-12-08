import React, { useState, useMemo } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
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
} from '@mui/material'

import {
  Dns as ClusterIcon,
  Computer as MachineIcon,
  Hub as NodeIcon,
  ArrowBack as BackIcon,
  Info as GeneralIcon,
  History as AuditIcon,
  Description as DescIcon,
  Category as TypeIcon,
  CheckCircle as StatusIcon,
  Storage as ServerIcon,
} from '@mui/icons-material'

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

/* -----------------------
 * COLOR SEGÚN ESTADO OPERATIVO
 * ----------------------- */
const getEstadoOperativoColor = (codigo) => {
  if (!codigo) return 'default'
  const c = String(codigo).toUpperCase().trim()

  if (['OPERATIVO', 'RUNNING', 'ON', 'UP', 'ACTIVO'].includes(c)) return 'success'
  if (['FUERA_SERVICIO', 'STOPPED', 'OFF', 'DOWN', 'APAGADO'].includes(c)) return 'error'
  if (['MANTENIMIENTO', 'MAINTENANCE', 'RESTARTING'].includes(c)) return 'warning'

  return 'default'
}

/* -----------------------
 * ROW ITEM
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

    <Box sx={{ width: '60%', display: 'flex', alignItems: 'center' }}>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  </Box>
)

/* -----------------------
 * SECTION CARD
 * ----------------------- */
const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()

  return (
    <Card
      sx={{
        borderRadius: 2,
        borderTop: `3px solid ${bgcolor || theme.palette.primary.main}`,
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
 * CLUSTER DETALLE
 * ----------------------- */
const Cluster = ({ cluster }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  // -- Data Processing --
  const nodos = cluster?.cluster_nodos || []

  // Detectar tipo
  const isProxmox =
    cluster.cod_tipo_cluster === 'PXM' ||
    cluster.cod_tipo_cluster === 'PROXMOX' ||
    cluster.tipoClusterInfo?.codigo === 'PXM'

  // Helper de Usuario
  const getUserFullName = (userObj) => {
    if (!userObj) return '-'
    return `${userObj.nombres} ${userObj.primer_apellido} ${userObj.segundo_apellido}`.trim()
  }

  // Lógica de VMs
  const maquinasProxmox = useMemo(() => {
    if (!isProxmox) return []
    const vms = []
    
    nodos.forEach((nodo) => {
      // 1. VMs dentro de servidores físicos
      if (nodo.servidor?.maquinas?.length) {
        vms.push(...nodo.servidor.maquinas)
      }
      // 2. Si el nodo mismo es una VM
      if (nodo.maquina) {
        vms.push(nodo.maquina)
      }
    })
    
    const uniqueMap = new Map()
    vms.forEach(vm => uniqueMap.set(vm.id, vm))
    return Array.from(uniqueMap.values())
  }, [nodos, isProxmox])

  const handleTabChange = (_, v) => setTab(v)

  /* -----------------------
   * RENDER
   * ----------------------- */
  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '0 0 12px 12px',
          mb: 3,
        }}
      >
        {/* HEADER */}
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver a lista">
            <IconButton
              onClick={() => navigate(routes.clusters())}
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
              background: 'linear-gradient(135deg, #ff6f00, #ff8f00)',
            }}
          >
            <ClusterIcon />
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight={800}>
              {cluster.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ficha técnica de Cluster
            </Typography>
          </Box>
        </Box>

        {/* CONTENIDO PRINCIPAL */}
        <CardContent sx={{ px: 5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* IZQUIERDA */}
            <Stack spacing={2}>
              <SectionCard icon={<GeneralIcon />} title="Información General">
                <RowItem label="Nombre" value={cluster.nombre} />
                <RowItem
                  label="Tipo Cluster"
                  value={cluster.tipoClusterInfo?.nombre || cluster.cod_tipo_cluster}
                  icon={<TypeIcon />}
                />
                <RowItem
                  label="Descripción"
                  value={cluster.descripcion || 'Sin descripción'}
                  icon={<DescIcon />}
                />
                <RowItem
                  label="Estado"
                  isLast
                  value={
                    <Chip
                      label={cluster.estado}
                      size="small"
                      color={cluster.estado === 'ACTIVO' ? 'success' : 'error'}
                      icon={<StatusIcon fontSize="small" />}
                      sx={{ height: 20, fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  }
                />
              </SectionCard>
            </Stack>

            {/* DERECHA */}
            <Stack spacing={2}>
              <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                <RowItem label="Fecha Creación" value={fmtDate(cluster.fecha_creacion)} />
                <RowItem label="Creado por" value={getUserFullName(cluster.creadoPor)} />
                <RowItem label="Última Modificación" value={fmtDate(cluster.fecha_modificacion)} />
                <RowItem label="Modificado por" value={getUserFullName(cluster.modificadoPor)} isLast />
              </SectionCard>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* --------- TABS --------- */}
      <Card sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab
            label={
              <Stack direction="row" spacing={1}>
                <NodeIcon fontSize="small" />
                Nodos
                <Chip label={nodos.length} size="small" />
              </Stack>
            }
          />
          {isProxmox && (
            <Tab
              label={
                <Stack direction="row" spacing={1}>
                  <MachineIcon fontSize="small" />
                  VMs Asociadas
                  <Chip label={maquinasProxmox.length} size="small" />
                </Stack>
              }
            />
          )}
        </Tabs>

        <CardContent>
          {/* TAB 0: NODOS */}
          {tab === 0 &&
            (nodos.length ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre Nodo</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Recurso Vinculado</TableCell>
                      <TableCell>Rol</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nodos.map((n) => {
                      let recursoLink = null
                      let recursoNombre = '-'
                      let icon = null

                      if (n.maquina) {
                        recursoNombre = n.maquina.nombre
                        recursoLink = routes.maquina({ id: n.maquina.id })
                        icon = <MachineIcon fontSize="inherit" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      } else if (n.servidor) {
                        recursoNombre = n.servidor.nombre
                        recursoLink = routes.servidor({ id: n.servidor.id })
                        icon = <ServerIcon fontSize="inherit" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      }

                      return (
                        <TableRow key={n.id} hover>
                          {/* CAMBIO: El nombre ahora es un enlace si existe el recurso */}
                          <TableCell>
                            {recursoLink ? (
                              <Link
                                to={recursoLink}
                                style={{
                                  fontWeight: 600,
                                  color: theme.palette.primary.main,
                                  textDecoration: 'none', // Sin subrayado
                                }}
                              >
                                {n.nombre}
                              </Link>
                            ) : (
                              <Typography variant="body2" fontWeight={600}>{n.nombre}</Typography>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              label={n.nodoTipo}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22, fontSize: '0.75rem' }}
                            />
                          </TableCell>
                          <TableCell>
                            {recursoLink ? (
                              <Link
                                to={recursoLink}
                                style={{
                                  color: theme.palette.primary.main,
                                  fontWeight: 600,
                                  textDecoration: 'none', // Sin subrayado
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {icon} {recursoNombre}
                              </Link>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Sin vinculación
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                              {n.rolInfo?.nombre || n.rolInfo?.codigo || n.rol || '-'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay nodos registrados en este cluster.
              </Typography>
            ))}

          {/* TAB 1: MAQUINAS PROXMOX */}
          {isProxmox &&
            tab === 1 &&
            (maquinasProxmox.length ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>VMID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>CPU</TableCell>
                      <TableCell>RAM</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maquinasProxmox.map((vm) => {
                      const estadoNombre = vm.estadoOperativoInfo?.nombre || vm.estado_operativo || 'Desconocido'
                      const estadoCodigo = vm.estadoOperativoInfo?.codigo || vm.estado_operativo
                      const color = getEstadoOperativoColor(estadoCodigo)
                      
                      return (
                        <TableRow key={vm.id} hover>
                          <TableCell>{vm.proxmox_vmid}</TableCell>
                          <TableCell>
                            <Link
                              to={routes.maquina({ id: vm.id })}
                              style={{ 
                                fontWeight: 600, 
                                color: theme.palette.primary.main,
                                textDecoration: 'none' // CAMBIO: Sin subrayado
                              }}
                            >
                              {vm.nombre}
                            </Link>
                          </TableCell>
                          <TableCell>{vm.ip}</TableCell>
                          <TableCell>{vm.cpu} vCores</TableCell>
                          <TableCell>{vm.ram} GB</TableCell>
                          <TableCell>
                            <Chip
                              label={estadoNombre}
                              size="small"
                              color={color}
                              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay máquinas virtuales asociadas a los nodos de este cluster.
              </Typography>
            ))}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Cluster