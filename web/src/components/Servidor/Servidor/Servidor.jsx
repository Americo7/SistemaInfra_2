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
  Tooltip,
  IconButton,
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
  Apps as SystemIcon,
  ArrowBack as BackIcon,
  Apartment as EntityIcon,
  ViewModule as NodeIcon,
  DeviceHub as ParentIcon
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
  if (typeof userObj === 'string' || typeof userObj === 'number') return userObj
  const { nombres, primer_apellido, segundo_apellido } = userObj || {}
  if (!nombres && !primer_apellido) return '-'
  return `${nombres || ''} ${primer_apellido || ''} ${segundo_apellido || ''}`.trim()
}

// Helper para obtener el nombre correcto sin forzar mayúsculas
const getEstadoOperativoLabel = (servidor) => {
  // 1. Prioridad: Nombre descriptivo desde la relación
  if (servidor?.estadoOperativoInfo?.nombre) {
    return servidor.estadoOperativoInfo.nombre
  }
  // 2. Respaldo: El código plano (limpiando guiones bajos)
  if (servidor?.estado_operativo) {
    return servidor.estado_operativo.replace(/_/g, ' ')
  }
  return 'Desconocido'
}

const getStatusColor = (codigo) => {
  if (!codigo) return 'default'
  const c = String(codigo).toUpperCase()
  const map = {
    OPERATIVO: 'success', ACTIVO: 'success', EXITOSO: 'success', REALIZADO: 'success',
    FUERA_SERVICIO: 'error', FUERA_DE_SERVICIO: 'error', INACTIVO: 'error', FALLIDO: 'error', CRITICO: 'error', BAJA: 'error',
    MANTENIMIENTO: 'warning', PENDIENTE: 'warning', INICIADO: 'warning', EN_PROGRESO: 'warning',
    PROCESO: 'info', CREADO: 'info'
  }
  return map[c] || 'default'
}

// Calcula el total de almacenamiento sumando los discos
const getStorageTotal = (val) => {
  if (!val) return '-'
  try {
    const arr = typeof val === 'string' ? JSON.parse(val) : val
    if (!Array.isArray(arr) || arr.length === 0) return '-'
    const total = arr.reduce((acc, curr) => acc + (Number(curr.Valor) || 0), 0)
    return total > 0 ? `${total} GB` : '-'
  } catch { return '-' }
}

/* -----------------------
 * SUB-COMPONENTES UI
 * ----------------------- */
const RowItem = ({ label, value, icon, isLast }) => {
  const theme = useTheme()
  const displayValue = (value === null || value === undefined || value === '') ? '-' : value;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 0.75,
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: theme.palette.divider,
        transition: 'background-color 0.2s',
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
        {React.isValidElement(displayValue) ? displayValue : (
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {displayValue}
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

  // -- RELACIONES --
  const maquinas = servidor?.maquinas || []
  const clusterNodos = servidor?.cluster_nodos || []
  const despliegues = servidor?.despliegue || []
  const infraAfectada = servidor?.infra_afectada || []

  // Preparamos etiquetas y códigos del Estado
  const estadoOpLabel = getEstadoOperativoLabel(servidor)
  const estadoOpCodigo = servidor.estadoOperativoInfo?.codigo || servidor.estado_operativo

  /* --- LOGICA CLUSTERS Y UBICACIÓN --- */
  const ubicacionInfo = useMemo(() => {
    const arr = []
    const dcNombre = servidor.data_centers?.nombre || 'No asignado'
    const servidorPadre = servidor.servidores_padre?.nombre || null

    if (clusterNodos.length > 0) {
      clusterNodos.forEach((n) => {
        const isVirt = n.cluster?.cod_tipo_cluster === 'VIRTUALIZACION' || n.cluster?.tipoClusterInfo?.codigo === 'VIRTUALIZACION'

        arr.push({
          headerTitle: isVirt ? 'Host de Virtualización' : 'Miembro de Cluster',
          chipLabel: n.cluster?.tipoClusterInfo?.nombre || 'Cluster',
          dataCenter: dcNombre,
          servidorPadre: servidorPadre,
          clusterNombre: n.cluster?.nombre,
          clusterLink: routes.cluster({ id: n.cluster?.id }),
          nodoNombre: n.nombre,
          rol: n.rolInfo?.nombre
        })
      })
    } else {
      arr.push({
        headerTitle: 'Ubicación Física',
        chipLabel: 'Standalone',
        isStandalone: true,
        dataCenter: dcNombre,
        servidorPadre: servidorPadre,
      })
    }
    return arr
  }, [servidor, clusterNodos])

  // --- OTRAS LOGICAS ---
  const handleTabChange = (_, v) => setTab(v)

  const sistemasUnicos = useMemo(() => {
    const map = new Map()
    despliegues.forEach(d => {
      if (d.componentes?.sistemas) map.set(d.componentes.sistemas.id, d.componentes.sistemas)
    })
    return [...map.values()]
  }, [despliegues])

  const eventosMapeados = useMemo(() => {
    return infraAfectada.flatMap(ia => ia.eventos || []).map(e => ({
      id: e.id,
      eventId: e.id,
      tipo: e.tipoEventoInfo?.nombre || e.cod_tipo_evento || 'Desconocido',
      codigoEvento: e.cod_evento || '-',
      descripcion: e.descripcion || '-',
      solicitante: e.solicitante || '-',
      fecha: e.fecha_evento,
      estado: e.estadoEventoInfo?.nombre || e.estado_evento || '-',
      estadoCod: e.estadoEventoInfo?.codigo
    })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [infraAfectada])

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>

      {/* HEADER CARD */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '0 0 12px 12px',
          mb: 3,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver">
            <IconButton
              onClick={() => navigate(routes.servidors())}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
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

          <Box>
            <Typography variant="h5" fontWeight={800}>
              {servidor.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ficha técnica de servidor físico
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: 5, pb: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start' }}>

            {/* --- COLUMNA IZQUIERDA --- */}
            <Stack spacing={2}>
              {/* 1. INFORMACIÓN GENERAL */}
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

                {/* --- ESTADO OPERATIVO CORREGIDO --- */}
                <RowItem
                  label="Estado Operativo"
                  isLast
                  value={
                    <Chip
                      label={estadoOpLabel} // Muestra "Fuera de Servicio" (Natural case)
                      size="small"
                      color={getStatusColor(estadoOpCodigo)} // Color basado en código
                      sx={{
                        height: 20,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        // textTransform eliminado
                      }}
                    />
                  }
                />
              </SectionCard>

              {/* 2. RECURSOS */}
              <SectionCard icon={<MemoryIcon />} title="Hardware y Recursos" bgcolor={theme.palette.success.main}>
                <RowItem label="Memoria RAM" value={servidor.ram ? `${servidor.ram} GB` : '-'} />
                <RowItem label="Almacenamiento Total" value={servidor.almacenamiento ? `${servidor.almacenamiento} GB` : '-'} isLast />
              </SectionCard>
            </Stack>

            {/* --- COLUMNA DERECHA --- */}
            <Stack spacing={2}>

              {/* 1. UBICACIÓN Y ORQUESTACIÓN */}
              <SectionCard icon={<NetworkIcon />} title="Ubicación y Orquestación" bgcolor={theme.palette.info.main}>
                {ubicacionInfo.map((info, idx) => (
                  <Box key={idx} sx={{ mb: idx < ubicacionInfo.length - 1 ? 2.5 : 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, mr: 1, color: 'text.primary' }}>
                        {info.headerTitle}
                      </Typography>
                      <Chip
                        label={info.chipLabel}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    </Box>

                    <RowItem
                      label="Data Center"
                      value={info.dataCenter}
                      icon={<DataCenterIcon />}
                    />

                    {info.servidorPadre && (
                      <RowItem
                        label="Servidor Padre"
                        value={info.servidorPadre}
                        icon={<ParentIcon />}
                      />
                    )}

                    {!info.isStandalone && (
                      <>
                        <RowItem
                          label="Cluster"
                          value={
                            <Link to={info.clusterLink} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>
                              {info.clusterNombre}
                            </Link>
                          }
                          icon={<ClusterIcon />}
                        />
                        <RowItem
                          label="Nombre de Nodo"
                          value={info.nodoNombre}
                          icon={<NodeIcon />}
                          isLast={!info.rol}
                        />
                        {info.rol && (
                          <RowItem
                            label="Rol Asignado"
                            value={<Chip label={info.rol} size="small" variant="outlined" sx={{ height: 20 }} />}
                            isLast
                          />
                        )}
                      </>
                    )}

                    {info.isStandalone && (
                      <RowItem label="Cluster" value="No asignado (Stand-alone)" icon={<ClusterIcon />} isLast />
                    )}
                  </Box>
                ))}
              </SectionCard>

              {/* 2. AUDITORÍA */}
              <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                <RowItem
                  label="Estado Registro"
                  value={<Chip label={servidor.estado} size="small" color={getStatusColor(servidor.estado)} />}
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

      {/* TABS INFERIORES */}
      <Card sx={{ borderRadius: 2, mt: 3, bgcolor: theme.palette.background.paper }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 2 }}
        >
          <Tab label={<Stack direction="row" spacing={1}><MachineIcon fontSize="small" /><span>Máquinas Virtuales</span><Chip label={maquinas.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><DeploymentIcon fontSize="small" /><span>Despliegues</span><Chip label={despliegues.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><SystemIcon fontSize="small" /><span>Sistemas</span><Chip label={sistemasUnicos.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><EventIcon fontSize="small" /><span>Eventos</span><Chip label={infraAfectada.length} size="small" /></Stack>} />
        </Tabs>

        <CardContent>
          {/* TAB 0: MÁQUINAS VIRTUALES */}
          {tab === 0 && (
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                  <TableRow>
                    <TableCell>VMID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>IP</TableCell>
                    <TableCell>S.O.</TableCell>
                    <TableCell>vCPU</TableCell>
                    <TableCell>RAM</TableCell>
                    <TableCell>Almacenamiento</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maquinas.length > 0 ? maquinas.map((vm) => (
                    <TableRow key={vm.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{vm.proxmox_vmid || '-'}</TableCell>

                      <TableCell>
                        <Link to={routes.maquina({ id: vm.id })} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>
                          {vm.nombre}
                        </Link>
                      </TableCell>

                      <TableCell>{vm.ip}</TableCell>

                      <TableCell>
                        <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.2, maxWidth: 150 }} title={vm.so}>
                          {vm.so || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>{vm.cpu ? `${vm.cpu} vCPU` : '-'}</TableCell>
                      <TableCell>{vm.ram ? `${vm.ram} GB` : '-'}</TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {getStorageTotal(vm.almacenamiento)}
                        </Typography>
                      </TableCell>

                      <TableCell><Chip label={vm.estadoOperativoInfo?.nombre} size="small" color={getStatusColor(vm.estadoOperativoInfo?.codigo)} /></TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3 }}>Sin máquinas virtuales asociadas.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 1: DESPLIEGUES */}
          {tab === 1 && (
            despliegues.length ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell>Componente</TableCell>
                      <TableCell>Sistema</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {despliegues.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>
                          <Link to={routes.despliegue({ id: d.id })} style={{ color: theme.palette.text.primary, textDecoration: 'none' }}>
                            {d.componentes?.nombre}
                          </Link>
                        </TableCell>
                        <TableCell>{d.componentes?.sistemas?.nombre}</TableCell>
                        <TableCell>{fmtDate(d.fecha_despliegue)}</TableCell>
                        <TableCell><Chip label={d.estadoDespliegueInfo?.nombre} size="small" color={getStatusColor(d.estadoDespliegueInfo?.codigo)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No hay despliegues.</Typography>
          )}

          {/* TAB 2: SISTEMAS */}
          {tab === 2 && (
            sistemasUnicos.length ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell>Sigla</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Entidad</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sistemasUnicos.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Link to={routes.sistema({ id: s.id })} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                            {s.sigla}
                          </Link>
                        </TableCell>
                        <TableCell>{s.nombre}</TableCell>
                        <TableCell>{s.entidades?.sigla || '-'}</TableCell>
                        <TableCell><Chip label={s.estado} size="small" color={getStatusColor(s.estado)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No hay sistemas.</Typography>
          )}

          {/* TAB 3: EVENTOS */}
          {tab === 3 && (
            eventosMapeados.length ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell>Evento</TableCell>
                      <TableCell>Código</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eventosMapeados.map((e) => (
                      <TableRow key={e.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{e.tipo}</TableCell>
                        <TableCell>
                          <Link to={routes.evento({ id: e.eventId })} style={{ fontFamily: 'monospace', color: theme.palette.primary.main, textDecoration: 'none' }}>
                            {e.codigoEvento}
                          </Link>
                        </TableCell>
                        <TableCell>{e.descripcion}</TableCell>
                        <TableCell>{fmtDate(e.fecha)}</TableCell>
                        <TableCell><Chip label={e.estado} size="small" color={getStatusColor(e.estadoCod)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No hay eventos registrados.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Servidor