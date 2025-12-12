import React, { useState, useMemo } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import {
  Box, Typography, Card, CardContent, CardHeader, Avatar, Chip, Stack,
  useTheme, IconButton, Tooltip, alpha, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material'

import {
  Domain as DataCenterIcon,
  Place as LocationIcon,
  Info as GeneralIcon,
  History as AuditIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon,
  CalendarMonth as DateIcon,
  Storage as ServerIcon,
  CloudDownload as DeploymentIcon, 
  Computer as VmIcon, 
  Warning as EventIcon,
  Dns as HostIcon,
  Hub as ClusterIcon,
  Memory as RamIcon,
  Speed as CpuIcon
} from '@mui/icons-material'

/* --- HELPERS --- */
const fmtDate = (d) => {
  if (!d) return '-'
  try { return new Date(d).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return '-' }
}

const formatUserName = (usuarioObj) => {
  if (!usuarioObj) return '-'
  if (typeof usuarioObj === 'string' || typeof usuarioObj === 'number') return usuarioObj
  if (usuarioObj.nombres || usuarioObj.primer_apellido) return `${usuarioObj.nombres || ''} ${usuarioObj.primer_apellido || ''} ${usuarioObj.segundo_apellido || ''}`.trim()
  return '-'
}

const getStatusColor = (codigo) => {
  const map = { 
    OPERATIVO: 'success', FINALIZADO: 'success', INICIADO: 'warning',
    FUERA_SERVICIO: 'error', MANTENIMIENTO: 'warning', ACTIVO: 'success',
    INACTIVO: 'default', UNKNOWN: 'default'
  }
  return map[codigo] || 'default'
}

const parseAlmacenamiento = (val) => {
  if (!val) return '-'
  try {
    const arr = typeof val === 'string' ? JSON.parse(val) : val
    return Array.isArray(arr) && arr.length ? arr.map(d => `D${d.Disco}:${d.Valor}GB`).join(' ') : '-'
  } catch { return '-' }
}

const getStorageTotal = (val) => {
  if (!val) return '-'
  try {
    const arr = typeof val === 'string' ? JSON.parse(val) : val
    if (!Array.isArray(arr) || arr.length === 0) return '-'
    const total = arr.reduce((acc, curr) => acc + (Number(curr.Valor) || 0), 0)
    return total > 0 ? `${total} GB` : '-'
  } catch { return '-' }
}

// --- LÓGICA DE INFRAESTRUCTURA VM ---
const getVmInfraInfo = (maquina) => {
  const hostNombre = maquina._hostFisico?.nombre || '-'

  // 1. Cluster Virtualización (Proxmox)
  let clusterVirt = null
  const hostClusters = maquina._hostFisico?.cluster_nodos || []
  
  if (hostClusters.length > 0) {
    const nodeVirt = hostClusters.find(n => 
      n.cluster?.tipoClusterInfo?.codigo === 'VIRTUALIZACION'
    ) || hostClusters[0]
    
    if (nodeVirt?.cluster) {
        clusterVirt = { id: nodeVirt.cluster.id, name: nodeVirt.cluster.nombre }
    }
  }

  // 2. Cluster Orquestación (K8s)
  let clusterOrq = null
  const vmClusters = maquina.cluster_nodos || []
  
  if (vmClusters.length > 0) {
    const nodeOrq = vmClusters.find(n => 
      n.cluster?.tipoClusterInfo?.codigo === 'ORQUESTACION'
    ) || vmClusters[0]

    if (nodeOrq?.cluster) {
        clusterOrq = { id: nodeOrq.cluster.id, name: nodeOrq.cluster.nombre }
    }
  }

  return { hostNombre, clusterVirt, clusterOrq }
}

const getServerCluster = (servidor) => {
    const nodos = servidor?.cluster_nodos || []
    if (nodos.length === 0) return '-'
    return nodos.map(n => n.cluster?.nombre).join(', ')
}

/* --- SUB-COMPONENTES UI --- */
const RowItem = ({ label, value, icon, isLast }) => {
  const theme = useTheme()
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      py: 0.75, 
      borderBottom: isLast ? 'none' : '1px solid', 
      borderColor: theme.palette.divider, 
      transition: 'background-color 0.2s', 
      // CORRECCIÓN: Ahora usa la variable global action.hover
      '&:hover': { bgcolor: 'action.hover' } 
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: '40%', pr: 2, display: 'flex', alignItems: 'center' }}>
        {icon && <Box sx={{ mr: 1, display: 'flex', color: 'action.active' }}>{icon}</Box>}
        {label}
      </Typography>
      <Box sx={{ width: '60%', display: 'flex', alignItems: 'center' }}>
        {React.isValidElement(value) ? value : <Typography variant="body1" sx={{ fontWeight: 600 }}>{value}</Typography>}
      </Box>
    </Box>
  )
}

const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  return (
    <Card sx={{ borderRadius: 2, borderTop: `3px solid ${bgcolor || theme.palette.primary.main}`, bgcolor: theme.palette.background.paper, height: '100%' }}>
      <CardHeader avatar={<Avatar sx={{ bgcolor: bgcolor || theme.palette.primary.main, width: 32, height: 32 }}>{icon}</Avatar>} title={<Typography sx={{ fontWeight: 700 }}>{title}</Typography>} sx={{ py: 1, px: 2, borderBottom: `1px solid ${theme.palette.divider}` }} />
      <CardContent sx={{ p: 1.5 }}>{children}</CardContent>
    </Card>
  )
}

/* --- MAIN COMPONENT --- */
const DataCenter = ({ dataCenter }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  // 1. SERVIDORES
  const servidores = dataCenter?.servidores || []

  // 2. MAQUINAS
  const maquinas = useMemo(() => {
    return servidores.flatMap(s => {
      const vms = s.maquinas || []
      return vms.map(vm => ({
        ...vm,
        _hostFisico: {
            nombre: s.nombre,
            cluster_nodos: s.cluster_nodos
        }
      }))
    })
  }, [servidores])

  // 3. DESPLIEGUES
  const desplieguesTodos = useMemo(() => {
    const despFisicos = servidores.flatMap(s => (s.despliegue || []).map(d => ({
        ...d, _origenTipo: 'Servidor Físico', _origenNombre: s.nombre, _isVm: false
    })))
    const despVirtuales = maquinas.flatMap(m => (m.despliegue || []).map(d => ({
        ...d, _origenTipo: 'Máquina Virtual', _origenNombre: m.nombre, _isVm: true
    })))
    return [...despFisicos, ...despVirtuales].sort((a,b) => new Date(b.fecha_despliegue) - new Date(a.fecha_despliegue))
  }, [servidores, maquinas])

  const eventos = (dataCenter?.infra_afectada || []).flatMap(ia => ia.eventos || [])

  const handleTabChange = (_, v) => setTab(v)

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      {/* HEADER CARD */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '0 0 12px 12px', mb: 3, bgcolor: theme.palette.background.paper }}>
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver">
            <IconButton onClick={() => navigate(routes.dataCenters())} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`, color: theme.palette.primary.main, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Avatar sx={{ width: 42, height: 42, background: 'linear-gradient(135deg, #5C6BC0, #3F51B5)' }}><DataCenterIcon /></Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800}>{dataCenter.nombre}</Typography>
            <Typography variant="caption" color="text.secondary">Ficha técnica de Data Center</Typography>
          </Box>
        </Box>
        <CardContent sx={{ px: 5, pb: 4, pt: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Stack spacing={2}>
              <SectionCard icon={<GeneralIcon />} title="Información General" bgcolor={theme.palette.primary.main}>
                <RowItem label="Nombre" value={dataCenter.nombre} icon={<DataCenterIcon />} />
                <RowItem label="Ubicación" value={dataCenter.ubicacion} icon={<LocationIcon />} />
                <RowItem label="Estado" isLast value={<Chip label={dataCenter.estado} size="small" color={getStatusColor(dataCenter.estado)} sx={{ height: 20, fontWeight: 700, fontSize: '0.75rem' }} />} />
              </SectionCard>
            </Stack>
            <Stack spacing={2}>
              <SectionCard icon={<AuditIcon />} title="Auditoría" bgcolor={theme.palette.warning.main}>
                <RowItem label="Fecha de creación" value={fmtDate(dataCenter.fecha_creacion)} icon={<DateIcon />} />
                <RowItem label="Creado por" value={formatUserName(dataCenter.creadoPor)} icon={<PersonIcon />} />
                <RowItem label="Fecha de modificación" value={fmtDate(dataCenter.fecha_modificacion)} icon={<DateIcon />} />
                <RowItem label="Modificado por" value={formatUserName(dataCenter.modificadoPor)} isLast icon={<PersonIcon />} />
              </SectionCard>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* TABS INFERIORES */}
      <Card sx={{ borderRadius: 2, mt: 3, bgcolor: theme.palette.background.paper }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 2 }}>
          <Tab label={<Stack direction="row" spacing={1}><ServerIcon fontSize="small"/> Servidores <Chip label={servidores.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><VmIcon fontSize="small"/> Máquinas <Chip label={maquinas.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><DeploymentIcon fontSize="small"/> Despliegues <Chip label={desplieguesTodos.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><EventIcon fontSize="small"/> Eventos <Chip label={eventos.length} size="small" /></Stack>} />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          
          {/* TAB 0: SERVIDORES */}
          {tab === 0 && (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                  <TableRow>
                    <TableCell>Host</TableCell>
                    <TableCell>IP</TableCell>
                    <TableCell>Marca / Modelo</TableCell>
                    <TableCell>RAM</TableCell>
                    <TableCell>Almacenamiento</TableCell>
                    <TableCell>Cluster</TableCell>
                    <TableCell>Estado Op.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {servidores.map((s) => (
                    // CORRECCIÓN: Usamos solo "hover"
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                          <Link to={routes.servidor({ id: s.id })} style={{ textDecoration: 'none', color: theme.palette.primary.main }}>{s.nombre}</Link>
                      </TableCell>
                      <TableCell>{s.ip_primaria || '-'}</TableCell>
                      <TableCell>{s.marca} {s.modelo}</TableCell>
                      <TableCell>{s.ram ? `${s.ram} GB` : '-'}</TableCell>
                      <TableCell>{parseAlmacenamiento(s.almacenamiento)}</TableCell>
                      <TableCell>{getServerCluster(s)}</TableCell>
                      <TableCell><Chip label={s.estadoOperativoInfo?.nombre || s.estado} size="small" color={getStatusColor(s.estadoOperativoInfo?.codigo || s.estado)} /></TableCell>
                    </TableRow>
                  ))}
                  {servidores.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{py:3}}>Sin servidores</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 1: MAQUINAS */}
          {tab === 1 && (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                  <TableRow>
                    <TableCell sx={{ width: '80px' }}>VMID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>IP</TableCell>
                    <TableCell>SO</TableCell>
                    <TableCell>vCPU</TableCell>
                    <TableCell>RAM</TableCell>
                    <TableCell>Almacenamiento</TableCell>
                    <TableCell>Cluster Virtualización</TableCell>
                    <TableCell>Cluster Orquestación</TableCell>
                    <TableCell>Estado Operativo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maquinas.map((m) => {
                    const infra = getVmInfraInfo(m)
                    return (
                    // CORRECCIÓN: Usamos solo "hover"
                    <TableRow key={m.id} hover>
                      <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{m.proxmox_vmid}</TableCell>
                      
                      <TableCell>
                         <Link to={routes.maquina({ id: m.id })} style={{ textDecoration: 'none', color: theme.palette.primary.main, fontWeight: 700 }}>
                             {m.nombre}
                         </Link>
                      </TableCell>

                      <TableCell>{m.ip}</TableCell>
                      
                      <TableCell>
                          <Typography variant="caption" sx={{display:'block', lineHeight:1.2, maxWidth: 150}} title={m.so}>
                              {m.so || '-'}
                          </Typography>
                      </TableCell>
                      
                      <TableCell>{m.cpu}</TableCell>
                      <TableCell>{m.ram} GB</TableCell>

                      <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                             {getStorageTotal(m.almacenamiento)}
                          </Typography>
                      </TableCell>
                      
                      <TableCell>
                         {infra.clusterVirt ? (
                            <Link 
                                to={routes.cluster({ id: infra.clusterVirt.id })}
                                style={{ textDecoration: 'none', color: theme.palette.text.primary }}
                            >
                                <Typography variant="body2" sx={{ '&:hover': { color: theme.palette.primary.main, textDecoration: 'underline' } }}>
                                    {infra.clusterVirt.name}
                                </Typography>
                            </Link>
                         ) : '-'}
                      </TableCell>

                      <TableCell>
                         {infra.clusterOrq ? (
                            <Link 
                                to={routes.cluster({ id: infra.clusterOrq.id })}
                                style={{ textDecoration: 'none', color: theme.palette.primary.main }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}>
                                    {infra.clusterOrq.name}
                                </Typography>
                            </Link>
                         ) : '-'}
                      </TableCell>

                      <TableCell><Chip label={m.estadoOperativoInfo?.nombre || 'Unknown'} size="small" color={getStatusColor(m.estadoOperativoInfo?.codigo)} /></TableCell>
                    </TableRow>
                  )})}
                  {maquinas.length === 0 && <TableRow><TableCell colSpan={10} align="center" sx={{py:3}}>Sin máquinas virtuales</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 2: DESPLIEGUES */}
          {tab === 2 && (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                  <TableRow>
                    <TableCell>Componente</TableCell>
                    <TableCell>Sistema</TableCell>
                    <TableCell>Infraestructura Origen</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Estado Despliegue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {desplieguesTodos.map((d) => (
                    // CORRECCIÓN: Usamos solo "hover"
                    <TableRow key={d.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{d.componentes?.nombre}</TableCell>
                      <TableCell>{d.componentes?.sistemas?.nombre || d.componentes?.sistemas?.sigla}</TableCell>
                      <TableCell>
                         <Stack direction="row" spacing={1} alignItems="center">
                             {d._isVm ? <VmIcon fontSize="small" color="action"/> : <ServerIcon fontSize="small" color="action"/>}
                             <Box>
                                <Typography variant="caption" display="block" color="text.secondary" sx={{lineHeight:1}}>{d._origenTipo}</Typography>
                                <Typography variant="body2" sx={{fontWeight:500}}>{d._origenNombre}</Typography>
                             </Box>
                         </Stack>
                      </TableCell>
                      <TableCell>{fmtDate(d.fecha_despliegue)}</TableCell>
                      <TableCell><Chip label={d.estadoDespliegueInfo?.nombre || 'Desconocido'} size="small" color={getStatusColor(d.estadoDespliegueInfo?.codigo)} /></TableCell>
                    </TableRow>
                  ))}
                  {desplieguesTodos.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{py:3}}>Sin despliegues registrados</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 3: EVENTOS */}
          {tab === 3 && (
             <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
             <Table size="small">
               <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                 <TableRow>
                   <TableCell>Cód. Evento</TableCell>
                   <TableCell>Tipo</TableCell>
                   <TableCell>Descripción</TableCell>
                   <TableCell>Solicitante</TableCell>
                   <TableCell>Fecha</TableCell>
                   <TableCell>Estado Evento</TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {eventos.map((e) => (
                   // CORRECCIÓN: Usamos solo "hover"
                   <TableRow key={e.id} hover>
                     <TableCell sx={{fontFamily: 'monospace', fontWeight: 600}}>{e.cod_evento}</TableCell>
                     <TableCell>{e.tipoEventoInfo?.nombre || e.cod_tipo_evento}</TableCell>
                     <TableCell>{e.descripcion}</TableCell>
                     <TableCell>
                         <Stack direction="row" spacing={1} alignItems="center">
                             <PersonIcon fontSize="small" sx={{color: theme.palette.text.disabled}}/>
                             <Typography variant="body2">{e.solicitante || '-'}</Typography>
                         </Stack>
                     </TableCell>
                     <TableCell>{fmtDate(e.fecha_evento)}</TableCell>
                     <TableCell><Chip label={e.estadoEventoInfo?.nombre} size="small" color={getStatusColor(e.estadoEventoInfo?.codigo)} /></TableCell>
                   </TableRow>
                 ))}
                 {eventos.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{py:3}}>Sin eventos</TableCell></TableRow>}
               </TableBody>
             </Table>
           </TableContainer>
          )}

        </CardContent>
      </Card>
    </Box>
  )
}

export default DataCenter