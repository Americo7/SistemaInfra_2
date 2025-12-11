import React, { useMemo, useState } from 'react'
import { Link, routes } from '@redwoodjs/router'
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
  Tooltip,
  alpha,
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
  Cloud as DeploymentIcon,
  Event as EventIcon,
  DeveloperBoard as HardwareIcon,
  Settings as OSIcon,
  CalendarMonth as DateIcon,
  Person as PersonIcon,
  Apps as SystemIcon,
  Code as CodeIcon,
  ArrowBack as BackIcon,
  Apartment as EntityIcon
} from '@mui/icons-material'

/* -----------------------
 * HELPERS GLOBALES
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
  return `${nombres || ''} ${primer_apellido || ''} ${segundo_apellido || ''}`.trim() || '-'
}

// MEJORA: Lógica de colores ampliada para incluir estados de despliegue
const getStatusColor = (codigo) => {
  if (!codigo) return 'default'
  const c = String(codigo).toUpperCase()
  
  // VERDE (Éxito / Operativo)
  if (['OPERATIVO', 'ACTIVO', 'EXITOSO', 'REALIZADO', 'CORRECTO', 'FINALIZADO', 'OK', 'COMPLETADO'].includes(c)) return 'success'
  
  // ROJO (Error / Inactivo)
  if (['FUERA_SERVICIO', 'INACTIVO', 'FALLIDO', 'CANCELADO', 'ERROR', 'CRITICO'].includes(c)) return 'error'
  
  // AMARILLO (Advertencia / Pendiente)
  if (['MANTENIMIENTO', 'PENDIENTE', 'EN_PROGRESO', 'EN_EJECUCION', 'INICIADO', 'REVISION'].includes(c)) return 'warning'
  
  // AZUL (Info / Proceso)
  if (['PROCESO', 'CREADO', 'PLANIFICADO'].includes(c)) return 'info'
  
  return 'default'
}

/* -----------------------
 * COMPONENTES UI INTERNOS
 * ----------------------- */
const RowItem = ({ label, value, icon, isLast }) => {
  const theme = useTheme()
  const displayValue = (value == null || value === '' || value === 0) ? '-' : value; 

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 0.75,
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: theme.palette.divider,
        '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
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
          {React.isValidElement(displayValue) ? displayValue : (
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {displayValue}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}

const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  return (
    <Card
      sx={{
        borderRadius: 2,
        borderTop: `3px solid ${bgcolor || theme.palette.primary.main}`,
        bgcolor: theme.palette.background.paper,
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
 * COMPONENTES PRINCIPAL
 * ----------------------- */
const Servidor = ({ servidor }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  const isActivo = servidor.estado === 'ACTIVO'

  // -- RELACIONES --
  const maquinas = servidor?.maquinas || []
  const clusterNodos = servidor?.cluster_nodos || []
  const despliegues = servidor?.despliegue || []
  const infraAfectada = servidor?.infra_afectada || []

  // --- LOGICA CLUSTER ---
  const clusterInfo = useMemo(() => {
    if (!clusterNodos.length) return []
    return clusterNodos.map((n) => ({
      id: n.id,
      nombre: n.cluster?.nombre || 'Desconocido',
      rol: n.rolInfo?.nombre || 'Sin Rol', 
      tipo: n.nodoTipo,
      link: routes.cluster({ id: n.cluster?.id || 0 }),
    }))
  }, [clusterNodos])

  // --- LOGICA SISTEMAS (TAB 2) ---
  const sistemasUnicos = useMemo(() => {
    const sistemasMap = new Map();
    despliegues.forEach(d => {
        const sis = d.componentes?.sistemas;
        if (sis && !sistemasMap.has(sis.id)) {
            sistemasMap.set(sis.id, sis);
        }
    });
    return Array.from(sistemasMap.values());
  }, [despliegues]);

  // --- LOGICA EVENTOS (TAB 3) ---
  const eventosMapeados = useMemo(() => {
    const todosLosEventos = infraAfectada.flatMap(ia => ia.eventos || [])
    
    return todosLosEventos.map(e => ({
        id: e.id,
        tipo: e.tipoEventoInfo?.nombre || e.cod_tipo_evento || 'Desconocido',
        descripcion: e.descripcion || '-',
        solicitante: e.solicitante || '-',
        fecha: e.fecha_evento,
        estado: e.estadoEventoInfo?.nombre || e.estado_evento || 'N/A',
        estadoCodigo: e.estadoEventoInfo?.codigo || 'DEFAULT'
    })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [infraAfectada])


  const handleTabChange = (_, v) => setTab(v)

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
        
        {/* TARJETA DE IDENTIDAD */}
        <Card
            elevation={0}
            sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            mb: 3,
            bgcolor: theme.palette.background.paper,
            }}
        >
            <Box sx={{ px: 5, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                    sx={{
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #5a00f0, #8a2be2)',
                    boxShadow: 2
                    }}
                >
                    <ServerIcon fontSize="large" />
                </Avatar>

                <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                        {servidor.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Ficha técnica de servidor físico
                    </Typography>
                </Box>
            </Box>

            <CardContent sx={{ px: 5, pt: 0, pb: 4 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, alignItems: 'start' }}>
                    
                    {/* --- COLUMNA IZQUIERDA --- */}
                    <Stack spacing={3}>
                        <SectionCard icon={<GeneralIcon />} title="Información General" bgcolor={theme.palette.primary.main}>
                            <RowItem label="Tipo Servidor" value={servidor.tipoServidorInfo?.nombre || servidor.cod_tipo_servidor} />
                            <RowItem label="Cod. Inventario" value={servidor.cod_inventario_agetic} />
                            <RowItem
                                label="Marca / Modelo"
                                value={`${servidor.marca || ''} ${servidor.modelo || ''}`.trim()}
                                icon={<HardwareIcon />}
                            />
                            <RowItem label="Serie" value={servidor.serie} />
                            <RowItem label="Sistema Operativo" value={servidor.sistema_operativo} icon={<OSIcon />} />
                            <RowItem label="Dirección IP" value={servidor.ip_primaria} />
                            <RowItem
                                label="Estado Operativo"
                                isLast
                                value={
                                    <Chip
                                        label={servidor.estadoOperativoInfo?.nombre || servidor.estado_operativo || 'N/A'}
                                        size="small"
                                        color={getStatusColor(servidor.estadoOperativoInfo?.codigo || servidor.estado_operativo)}
                                        sx={{ height: 20, fontWeight: 700, fontSize: '0.75rem' }}
                                    />
                                }
                            />
                        </SectionCard>

                        <SectionCard icon={<MemoryIcon />} title="Hardware y Recursos" bgcolor={theme.palette.success.main}>
                            <RowItem label="Memoria RAM" value={servidor.ram ? `${servidor.ram} GB` : ''} />
                            <RowItem label="Almacenamiento Total" value={servidor.almacenamiento ? `${servidor.almacenamiento} GB` : ''} isLast />
                        </SectionCard>
                    </Stack>

                    {/* --- COLUMNA DERECHA --- */}
                    <Stack spacing={3}>
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
                                                <Link to={routes.cluster({ id: ci.link ? ci.id : 0 })} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>
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
                                value={servidor.servidores_padre?.nombre}
                                isLast
                            />
                        </SectionCard>

                        <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                            <RowItem
                                label="Estado Registro"
                                value={
                                    <Chip
                                        label={servidor.estado}
                                        size="small"
                                        color={getStatusColor(servidor.estado)}
                                    />
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

        {/* TABS DE DETALLE */}
        <Card sx={{ borderRadius: 2, mt: 3, bgcolor: theme.palette.background.paper }}>
            <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
            >
                <Tab label={<Stack direction="row" spacing={1}><MachineIcon fontSize="small"/><span>Máquinas Virtuales</span><Chip label={maquinas.length} size="small"/></Stack>} />
                <Tab label={<Stack direction="row" spacing={1}><DeploymentIcon fontSize="small"/><span>Despliegues</span><Chip label={despliegues.length} size="small"/></Stack>} />
                <Tab label={<Stack direction="row" spacing={1}><SystemIcon fontSize="small"/><span>Sistemas</span><Chip label={sistemasUnicos.length} size="small"/></Stack>} />
                <Tab label={<Stack direction="row" spacing={1}><EventIcon fontSize="small"/><span>Eventos</span><Chip label={eventosMapeados.length} size="small"/></Stack>} />
            </Tabs>

            <CardContent>
                {/* TAB 0: MÁQUINAS VIRTUALES */}
                {tab === 0 && (
                    maquinas.length ? (
                        <TableContainer component={Paper} elevation={0} sx={{border: `1px solid ${theme.palette.divider}`}}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                                    <TableRow>
                                        <TableCell>VMID</TableCell>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>IP</TableCell>
                                        <TableCell>S.O.</TableCell>
                                        <TableCell>CPU</TableCell> 
                                        <TableCell>RAM</TableCell> 
                                        <TableCell>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {maquinas.map((vm) => (
                                        <TableRow key={vm.id} hover>
                                            <TableCell sx={{ fontFamily: 'monospace' }}>{vm.proxmox_vmid || ''}</TableCell>
                                            <TableCell><Link to={routes.maquina({ id: vm.id })} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>{vm.nombre}</Link></TableCell>
                                            <TableCell>{vm.ip || ''}</TableCell>
                                            <TableCell>{vm.so || '-'}</TableCell>
                                            <TableCell>{vm.cpu ? `${vm.cpu} Core(s)` : ''}</TableCell>
                                            <TableCell>{vm.ram ? `${vm.ram} GB` : ''}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={vm.estadoOperativoInfo?.nombre || 'N/A'} 
                                                    size="small" 
                                                    color={getStatusColor(vm.estadoOperativoInfo?.codigo)} 
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : <Typography variant="body2" color="text.secondary" align="center" sx={{p:2}}>No hay máquinas virtuales.</Typography>
                )}

                {/* TAB 1: DESPLIEGUES (CORREGIDO) */}
                {tab === 1 && (
                    despliegues.length ? (
                        <TableContainer component={Paper} elevation={0} sx={{border: `1px solid ${theme.palette.divider}`}}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                                    <TableRow>
                                        <TableCell>Componente</TableCell>
                                        <TableCell>Sistema</TableCell>
                                        <TableCell>Tipo Respaldo</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {despliegues.map((d) => (
                                        <TableRow key={d.id}>
                                            <TableCell>{d.componentes?.nombre || '-'}</TableCell>
                                            <TableCell>{d.componentes?.sistemas?.nombre || '-'}</TableCell>
                                            <TableCell>{d.tipoRespaldoInfo?.nombre || '-'}</TableCell>
                                            <TableCell>{fmtDate(d.fecha_despliegue)}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    // AQUÍ ESTABA EL ERROR: Usamos estadoDespliegueInfo
                                                    label={d.estadoDespliegueInfo?.nombre || 'N/A'} 
                                                    size="small"
                                                    color={getStatusColor(d.estadoDespliegueInfo?.codigo)} 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : <Typography variant="body2" color="text.secondary" align="center" sx={{p:2}}>No hay despliegues.</Typography>
                )}

                {/* TAB 2: SISTEMAS */}
                {tab === 2 && (
                    sistemasUnicos.length ? (
                        <TableContainer component={Paper} elevation={0} sx={{border: `1px solid ${theme.palette.divider}`}}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                                    <TableRow>
                                        <TableCell sx={{ width: '15%' }}><CodeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Código/Sigla</TableCell>
                                        <TableCell sx={{ width: '30%' }}>Nombre</TableCell>
                                        <TableCell>Entidad</TableCell>
                                        <TableCell>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sistemasUnicos.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell sx={{ fontWeight: 600 }}>{s.codigo || s.sigla || '-'}</TableCell>
                                            <TableCell>{s.nombre}</TableCell>
                                            <TableCell>
                                                {s.entidades ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <EntityIcon fontSize="inherit" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                                        {s.entidades.sigla || s.entidades.nombre}
                                                    </Box>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={s.estado} size="small" color={getStatusColor(s.estado)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : <Typography variant="body2" color="text.secondary" align="center" sx={{p:2}}>No hay sistemas asociados.</Typography>
                )}

                {/* TAB 3: EVENTOS */}
                {tab === 3 && (
                    eventosMapeados.length ? (
                        <TableContainer component={Paper} elevation={0} sx={{border: `1px solid ${theme.palette.divider}`}}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                                    <TableRow>
                                        <TableCell>Tipo Evento</TableCell>
                                        <TableCell>Descripción</TableCell>
                                        <TableCell>Solicitante</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Estado Final</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {eventosMapeados.map((e) => (
                                        <TableRow key={e.id}>
                                            <TableCell sx={{fontWeight: 600}}>{e.tipo}</TableCell>
                                            <TableCell>{e.descripcion}</TableCell>
                                            <TableCell>{e.solicitante}</TableCell>
                                            <TableCell>{fmtDate(e.fecha)}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={e.estado} 
                                                    size="small" 
                                                    color={getStatusColor(e.estadoCodigo)} 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : <Typography variant="body2" color="text.secondary" align="center" sx={{p:2}}>No hay eventos registrados.</Typography>
                )}
            </CardContent>
        </Card>
    </Box>
  )
}

export default Servidor