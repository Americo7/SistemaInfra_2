import React, { useMemo, useState } from 'react'
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
  alpha,
} from '@mui/material'

import {
  Computer as MachineIcon,
  Dns as ClusterIcon,
  Memory as MemoryIcon,
  People as UsersIcon,
  Cloud as DeploymentIcon,
  Apps as SystemIcon,
  Storage as InfraIcon,
  Link as MacIcon,
  Domain as ProxmoxIcon,
  Settings as OSIcon,
  History as AuditIcon,
  Info as GeneralIcon,
  ArrowBack as BackIcon,
  Fingerprint as CodeIcon, // Icono para el código en sistemas
  CalendarMonth as DateIcon, // Icono para la fecha
  Person as PersonIcon // Icono para solicitante
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

const parseAlmacenamiento = (value) => {
  if (!value) return []
  try {
    return typeof value === 'object' ? value : JSON.parse(value)
  } catch {
    return []
  }
}

const uniqueById = (arr = []) => {
  const map = new Map()
  arr.forEach((it) => {
    if (it?.id && !map.has(it.id)) map.set(it.id, it)
  })
  return [...map.values()]
}

const formatUserName = (usuarioObj) => {
  if (!usuarioObj) return '-'
  if (typeof usuarioObj === 'string') return usuarioObj
  if (usuarioObj.nombres || usuarioObj.primer_apellido || usuarioObj.segundo_apellido) {
    return `${usuarioObj.nombres || ''} ${usuarioObj.primer_apellido || ''} ${usuarioObj.segundo_apellido}`.trim()
  }
  return '-'
}

const getStatusColor = (codigo) => {
  const map = {
    OPERATIVO: 'success',
    FUERA_SERVICIO: 'error',
    MANTENIMIENTO: 'warning',
    ACTIVO: 'success',
    INACTIVO: 'default',
    UNKNOWN: 'default'
  }
  return map[codigo] || 'default'
}

/* -----------------------
 * SUB-COMPONENTES
 * ----------------------- */
const RowItem = ({ label, value, icon, isLast }) => {
  const theme = useTheme()
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
      <Box sx={{ width: '60%', display: 'flex', alignItems: 'center' }}>
        {React.isValidElement(value) ? value : (
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        )}
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
const Maquina = ({ maquina }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  // Datos básicos
  const servidorRaw = maquina?.servidores
  const servidor = Array.isArray(servidorRaw) ? servidorRaw[0] : servidorRaw
  const usuarioRoles = maquina?.usuario_roles || []
  const despliegues = maquina?.despliegue || []
  const infraAfectada = maquina?.infra_afectada || []
  const maquinaClusterNodos = maquina?.cluster_nodos || []

  /* --- LOGICA CLUSTERS --- */
  const clusterInfo = useMemo(() => {
    const arr = []
    
    // 1. HOST DE VIRTUALIZACIÓN (Proxmox)
    if (servidor) {
      const srvNodes = Array.isArray(servidor.cluster_nodos) 
        ? servidor.cluster_nodos 
        : (servidor.cluster_nodos ? [servidor.cluster_nodos] : [])
      
      const srvNode = srvNodes[0] 
      
      if (srvNode && srvNode.cluster) {
        const dc = Array.isArray(servidor.data_centers) ? servidor.data_centers[0] : servidor.data_centers

        arr.push({
          tipoContexto: 'VIRTUALIZACION',
          headerTitle: 'Host de Virtualización',
          clusterType: srvNode.cluster.tipoClusterInfo?.nombre || 'Virtualización',
          hostServidor: servidor.nombre,
          dataCenter: dc?.nombre || '-',
          nodoNombre: srvNode.nombre,
          clusterNombre: srvNode.cluster.nombre,
          link: routes.cluster({ id: srvNode.cluster.id }),
        })
      }
    }

    // 2. ORQUESTACIÓN (K8s, etc)
    for (const n of maquinaClusterNodos) {
      if (n.cluster) {
        arr.push({
          tipoContexto: 'ORQUESTACION',
          headerTitle: 'Orquestación',
          clusterType: n.cluster.tipoClusterInfo?.nombre || 'Orquestación',
          clusterNombre: n.cluster.nombre,
          nodoNombre: n.nombre,
          rol: n.rolInfo?.nombre || '-',
          link: routes.cluster({ id: n.cluster.id }),
        })
      }
    }
    return arr
  }, [servidor, maquinaClusterNodos])

  const handleTabChange = (_, v) => setTab(v)

  // --- DATOS PARA LAS NUEVAS TABLAS ---
  const sistemasUnicos = useMemo(() => {
    return uniqueById(despliegues.flatMap(d => d.componentes?.sistemas ? [d.componentes.sistemas] : []));
  }, [despliegues])

  const eventosInfra = useMemo(() => {
    return infraAfectada.map(ia => {
        const eList = ia.eventos
        const e = Array.isArray(eList) ? eList[0] : eList
        return {
            id: ia.id,
            tipo: e?.tipoEventoInfo?.nombre || e?.cod_tipo_evento || 'Desconocido',
            solicitante: e?.solicitante || 'N/A',
            fecha: e?.fecha_evento,
            estado: e?.estadoEventoInfo?.nombre || e?.estado_evento || 'N/A',
        }
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [infraAfectada])


  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      {/* HEADER CARD */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          mb: 3,
          bgcolor: theme.palette.background.paper, 
        }}
      >
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver">
            <IconButton
              onClick={() => navigate(routes.maquinas())}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                color: theme.palette.primary.main,
                '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 42,
              height: 42,
              background: 'linear-gradient(135deg, #00ACC1, #26C6DA)',
            }}
          >
            <MachineIcon />
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight={800}>
              {maquina.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ficha técnica de máquina virtual
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: 5, pb: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            
            {/* --- COLUMNA IZQUIERDA --- */}
            <Stack spacing={2}>
              {/* 1. INFORMACIÓN GENERAL (AZUL PRIMARIO) */}
              <SectionCard icon={<GeneralIcon />} title="Información General" bgcolor={theme.palette.primary.main}>
                <RowItem label="VMID" value={maquina.proxmox_vmid} icon={<ProxmoxIcon />} />
                <RowItem label="Identificador" value={maquina.identity_key} icon={<MacIcon />} />
                <RowItem label="Dirección IP" value={maquina.ip} />
                <RowItem label="Sistema Operativo" value={maquina.so} icon={<OSIcon />} />
                <RowItem 
                    label="Plataforma" 
                    value={maquina.plataformaInfo?.nombre || maquina.cod_plataforma || '-'} 
                />
                <RowItem
                  label="Estado Operativo"
                  isLast
                  value={
                    <Chip
                      label={maquina.estadoOperativoInfo?.nombre || maquina.estado_operativo || 'Desconocido'}
                      size="small"
                      color={getStatusColor(maquina.estado_operativo)} 
                      sx={{
                        height: 20,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                      }}
                    />
                  }
                />
              </SectionCard>

              {/* 2. AUDITORÍA DEL REGISTRO (AMARILLO/WARNING) */}
              <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                <RowItem
                  label="Estado Registro"
                  value={
                    <Chip
                      label={maquina.estado}
                      size="small"
                      color={getStatusColor(maquina.estado)}
                    />
                  }
                />
                <RowItem label="Fecha Creación" value={fmtDate(maquina.fecha_creacion)} />
                <RowItem label="Creado por" value={formatUserName(maquina.creadoPor)} />
                <RowItem label="Última Modificación" value={fmtDate(maquina.fecha_modificacion)} />
                <RowItem label="Modificado por" value={formatUserName(maquina.modificadoPor)} isLast />
              </SectionCard>
            </Stack>

            {/* --- COLUMNA DERECHA --- */}
            <Stack spacing={2}>
              {/* 1. INFRAESTRUCTURA Y ORQUESTACIÓN (AZUL INFO) */}
              <SectionCard icon={<ClusterIcon />} title="Infraestructura y Orquestación" bgcolor={theme.palette.info.main}>
                {clusterInfo.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No vinculada a ningún host ni cluster.</Typography>
                ) : (
                  clusterInfo.map((info, idx) => (
                    // Se elimina el borderBottom y se quita el margen inferior al último elemento
                    <Box key={idx} sx={{ mb: idx < clusterInfo.length - 1 ? 2 : 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, mr: 1 }}>
                          {info.headerTitle}
                        </Typography>
                        <Chip 
                            label={info.clusterType} 
                            size="small" 
                            variant="outlined" 
                            sx={{ height: 18, fontSize: '0.65rem' }} 
                        />
                      </Box>

                      {info.tipoContexto === 'VIRTUALIZACION' && (
                        <>
                            <RowItem label="Host Servidor" value={info.hostServidor} />
                            <RowItem label="Data Center" value={info.dataCenter} />
                            <RowItem label="Nodo" value={info.nodoNombre} />
                            <RowItem
                                label="Cluster"
                                value={
                                <Link to={info.link} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>
                                    {info.clusterNombre}
                                </Link>
                                }
                            />
                        </>
                      )}

                      {info.tipoContexto === 'ORQUESTACION' && (
                        <>
                            <RowItem
                                label="Cluster"
                                value={
                                <Link to={info.link} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>
                                    {info.clusterNombre}
                                </Link>
                                }
                            />
                            <RowItem label="Nodo / Host" value={info.nodoNombre} />
                            <RowItem label="Rol" value={<Chip label={info.rol} size="small" />} />
                        </>
                      )}
                    </Box>
                  ))
                )}
              </SectionCard>

              {/* 2. RECURSOS ASIGNADOS (VERDE/SUCCESS) */}
              <SectionCard icon={<MemoryIcon />} title="Recursos Asignados" bgcolor={theme.palette.success.main}>
                <RowItem label="vCPUs" value={`${maquina.cpu} Core(s)`} />
                <RowItem label="RAM" value={`${maquina.ram} GB`} />
                <RowItem
                  label="Almacenamiento"
                  isLast
                  value={
                    parseAlmacenamiento(maquina.almacenamiento).length ? (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {parseAlmacenamiento(maquina.almacenamiento).map((d, i) => (
                          <Chip
                            key={i}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: theme.palette.divider }}
                            label={`D${d.Disco}: ${d.Valor} GB`}
                          />
                        ))}
                      </Stack>
                    ) : 'Sin información'
                  }
                />
              </SectionCard>
            </Stack>

          </Box>
        </CardContent>
      </Card>

      {/* --------- TABS INFERIORES --------- */}
      <Card sx={{ borderRadius: 2, mt: 3, bgcolor: theme.palette.background.paper }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab label={<Stack direction="row" spacing={1}><UsersIcon fontSize="small" />Usuarios<Chip label={usuarioRoles.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><DeploymentIcon fontSize="small" />Despliegues<Chip label={despliegues.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><SystemIcon fontSize="small" />Sistemas<Chip label={sistemasUnicos.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><InfraIcon fontSize="small" />Eventos<Chip label={infraAfectada.length} size="small" /></Stack>} />
        </Tabs>

        <CardContent>
          {/* TAB 0: USUARIOS */}
          {tab === 0 && (
            usuarioRoles.length ? (
              <TableContainer component={Paper} elevation={0} sx={{border: `1px solid ${theme.palette.divider}`}}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Rol</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuarioRoles.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{formatUserName(r.usuarios)}</TableCell>
                        <TableCell>{r.roles?.nombre}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary">No hay usuarios asociados.</Typography>
          )}

          {/* TAB 1: DESPLIEGUES */}
          {tab === 1 && (
            despliegues.length ? (
              <TableContainer component={Paper} elevation={0} sx={{border: `1px solid ${theme.palette.divider}`}}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell>Componente</TableCell>
                      <TableCell>Sistema</TableCell>
                      <TableCell>Fecha Despliegue</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {despliegues.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell sx={{ fontWeight: 500 }}>{d.componentes?.nombre}</TableCell>
                        <TableCell>{d.componentes?.sistemas?.nombre}</TableCell>
                        <TableCell>{fmtDate(d.fecha_despliegue)}</TableCell>
                        <TableCell><Chip label={d.estado_despliegue} size="small" color={getStatusColor(d.estado_despliegue)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary">No hay despliegues registrados.</Typography>
          )}

          {/* TAB 2: SISTEMAS (MEJORADO A TABLA) */}
          {tab === 2 && (
             sistemasUnicos.length ? (
              <TableContainer component={Paper} elevation={0} sx={{border: `1px solid ${theme.palette.divider}`}}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell sx={{ width: '15%' }}><CodeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Sigla</TableCell>
                      <TableCell sx={{ width: '25%' }}>Nombre</TableCell>
                      <TableCell sx={{ width: '40%' }}>Descripción</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sistemasUnicos.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{s.sigla}</TableCell>
                        <TableCell>{s.nombre}</TableCell>
                        <TableCell>{s.descripcion}</TableCell>
                        <TableCell>
                          <Chip label={s.estado} size="small" color={getStatusColor(s.estado)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary">No hay sistemas asociados mediante despliegues.</Typography>
          )}

          {/* TAB 3: EVENTOS INFRA (MEJORADO A TABLA) */}
          {tab === 3 && (
            eventosInfra.length ? (
              <TableContainer component={Paper} elevation={0} sx={{border: `1px solid ${theme.palette.divider}`}}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell sx={{ width: '20%' }}>Tipo Evento</TableCell>
                      <TableCell sx={{ width: '20%' }}><PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Solicitante</TableCell>
                      <TableCell sx={{ width: '20%' }}><DateIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Fecha Evento</TableCell>
                      <TableCell>Estado Final</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eventosInfra.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{e.tipo}</TableCell>
                        <TableCell>{e.solicitante}</TableCell>
                        <TableCell>{fmtDate(e.fecha)}</TableCell>
                        <TableCell>
                          <Chip label={e.estado} size="small" color={getStatusColor(e.estado)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary">No hay eventos registrados.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Maquina