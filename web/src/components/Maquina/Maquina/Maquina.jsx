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
    UNKNOWN: 'default'
  }
  return map[codigo] || 'default'
}

/* -----------------------
 * SUB-COMPONENTES
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
      {React.isValidElement(value) ? value : (
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
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

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      {/* HEADER CARD */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '0 0 12px 12px',
          mb: 3,
        }}
      >
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver">
            <IconButton
              onClick={() => navigate(routes.maquinas())}
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
              background: 'linear-gradient(135deg, #0097a7, #26c6da)',
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

        <CardContent sx={{ px: 5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            
            {/* --- COLUMNA IZQUIERDA --- */}
            <Stack spacing={2}>
              {/* 1. INFORMACIÓN GENERAL */}
              <SectionCard icon={<GeneralIcon />} title="Información General">
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

              {/* 2. AUDITORÍA DEL REGISTRO */}
              <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                <RowItem
                  label="Estado Registro"
                  value={
                    <Chip
                      label={maquina.estado}
                      size="small"
                      color={maquina.estado === 'ACTIVO' ? 'success' : 'error'}
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
              {/* 1. INFRAESTRUCTURA Y ORQUESTACIÓN */}
              <SectionCard icon={<ClusterIcon />} title="Infraestructura y Orquestación" bgcolor={theme.palette.info.main}>
                {clusterInfo.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No vinculada a ningún host ni cluster.</Typography>
                ) : (
                  clusterInfo.map((info, idx) => (
                    // MODIFICACIÓN: Se elimina el borderBottom y se quita el margen inferior al último elemento
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

              {/* 2. RECURSOS ASIGNADOS */}
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
                            label={`D${d.Disco}: ${d.Valor} GB`}
                            sx={{ height: 20 }}
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
      <Card sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab label={<Stack direction="row" spacing={1}><UsersIcon fontSize="small" />Usuarios<Chip label={usuarioRoles.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><DeploymentIcon fontSize="small" />Despliegues<Chip label={despliegues.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><SystemIcon fontSize="small" />Sistemas<Chip label={uniqueById(despliegues.map(d => d.componentes?.sistemas)).length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><InfraIcon fontSize="small" />Eventos<Chip label={infraAfectada.length} size="small" /></Stack>} />
        </Tabs>

        <CardContent>
          {/* TAB 0: USUARIOS */}
          {tab === 0 && (
            usuarioRoles.length ? (
              <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #eee'}}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
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
              <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #eee'}}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell>Componente</TableCell>
                      <TableCell>Sistema</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {despliegues.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.componentes?.nombre}</TableCell>
                        <TableCell>{d.componentes?.sistemas?.nombre}</TableCell>
                        <TableCell>{fmtDate(d.fecha_despliegue)}</TableCell>
                        <TableCell><Chip label={d.estado_despliegue} size="small" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary">No hay despliegues registrados.</Typography>
          )}

          {/* TAB 2: SISTEMAS */}
          {tab === 2 && (() => {
             const sistemasUnicos = uniqueById(despliegues.flatMap(d => d.componentes?.sistemas ? [d.componentes.sistemas] : []));
             return sistemasUnicos.length ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 2 }}>
                {sistemasUnicos.map((s) => (
                  <Paper key={s.id} sx={{ p: 2, border: '1px solid #eee' }} elevation={0}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>{s.nombre}</Typography>
                    <Typography variant="caption" display="block" sx={{mb:1}}>{s.sigla}</Typography>
                    <Typography variant="body2" color="text.secondary">{s.descripcion}</Typography>
                  </Paper>
                ))}
              </Box>
            ) : <Typography variant="body2" color="text.secondary">No hay sistemas asociados.</Typography>
          })()}

          {/* TAB 3: EVENTOS INFRA */}
          {tab === 3 && (
            infraAfectada.length ? (
              <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #eee'}}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell>Tipo Evento</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {infraAfectada.map((ia) => {
                      const eList = ia.eventos
                      const e = Array.isArray(eList) ? eList[0] : eList
                      return (
                        <TableRow key={ia.id}>
                          <TableCell sx={{ fontWeight: 600 }}>{e?.cod_tipo_evento}</TableCell>
                          <TableCell>{e?.descripcion}</TableCell>
                          <TableCell>{fmtDate(e?.fecha_evento)}</TableCell>
                          <TableCell><Chip label={ia.estado} size="small" variant="outlined" /></TableCell>
                        </TableRow>
                      )
                    })}
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