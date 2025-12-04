import React, { useMemo, useState } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { useQuery, gql } from '@redwoodjs/web'
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
 * CONSULTAS DE LOOKUP
 * ----------------------- */
const GET_USUARIOS_QUERY = gql`
  query UsuariosLookupForMaquina {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

const QUERY_PARAMETRICAS = gql`
  query ParametrosLookupForMaquina {
    parametros(grupo: ["PLATAFORMA", "ESTADO_OPERATIVO"]) {
      codigo
      nombre
      grupo
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

const parseAlmacenamiento = (value) => {
  if (!value) return []
  try {
    return Array.isArray(value) ? value : JSON.parse(value)
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

/* -----------------------
 * COLOR SEGÚN ESTADO OPERATIVO
 * ----------------------- */
const getEstadoOperativoColor = (codigo) => {
  if (!codigo) return 'default'
  const c = codigo.toUpperCase()

  if (c === 'OPERATIVO') return 'success'
  if (c === 'FUERA_SERVICIO') return 'error'
  if (c === 'MANTENIMIENTO') return 'warning'

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
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
 * MAQUINA DETALLE
 * ----------------------- */
const Maquina = ({ maquina }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  const { data: paramData } = useQuery(QUERY_PARAMETRICAS)
  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)

  const servidor = maquina?.servidores
  const usuarioRoles = maquina?.usuario_roles || []
  const despliegues = maquina?.despliegue || []
  const infraAfectada = maquina?.infra_afectada || []
  const maquinaClusterNodos = maquina?.cluster_nodos || []

  /* -----------------------
   * MAPAS CORREGIDOS
   * ----------------------- */

  const usuariosMap = useMemo(() => {
    return (
      usuariosData?.usuarios?.reduce((map, u) => {
        map[u.id] = `${u.nombres} ${u.primer_apellido}`.trim()
        return map
      }, {}) || {}
    )
  }, [usuariosData])

  const parametrosMap = useMemo(() => {
    return (
      paramData?.parametros?.reduce((map, p) => {
        map[p.codigo] = p.nombre
        return map
      }, {}) || {}
    )
  }, [paramData])

  // ESTADO OPERATIVO → NOMBRE REAL (TABLA PARAMETROS)
  const estadoOperativoMap = useMemo(() => {
    return (paramData?.parametros || [])
      .filter((p) => p.grupo === 'ESTADO_OPERATIVO')
      .reduce((map, p) => {
        map[p.codigo] = p.nombre
        return map
      }, {})
  }, [paramData])

  const getUserFullName = (id) => usuariosMap[id] || 'Sistema Automático'
  const getNombrePlataforma = (c) => parametrosMap[c] || c || '-'

  /* -----------------------
   * CLUSTER
   * ----------------------- */
  const clusterInfo = useMemo(() => {
    const arr = []

    if (servidor?.cluster_nodos?.[0]?.cluster) {
      const cl = servidor.cluster_nodos[0].cluster
      arr.push({
        titulo: 'Host de Virtualización',
        clusterName: cl.nombre,
        nodoName: servidor.nombre,
        link: routes.cluster({ id: cl.id }),
      })
    }

    for (const n of maquinaClusterNodos) {
      if (n.cluster) {
        arr.push({
          titulo: 'Nodo de Cluster',
          clusterName: n.cluster.nombre,
          nodoName: n.nombre,
          rol: n.rol,
          link: routes.cluster({ id: n.cluster.id }),
        })
      }
    }

    return arr
  }, [servidor, maquinaClusterNodos])

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
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
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

        {/* CONTENIDO */}
        <CardContent sx={{ px: 5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* IZQUIERDA */}
            <Stack spacing={2}>
              <SectionCard icon={<GeneralIcon />} title="Información General">
                <RowItem label="VMID" value={maquina.proxmox_vmid} icon={<ProxmoxIcon />} />
                <RowItem label="Identificador" value={maquina.identity_key} icon={<MacIcon />} />
                <RowItem label="Dirección IP" value={maquina.ip} />
                <RowItem label="Sistema Operativo" value={maquina.so} icon={<OSIcon />} />
                <RowItem label="Plataforma" value={getNombrePlataforma(maquina.cod_plataforma)} />

                {/* ESTADO OPERATIVO FINAL */}
                <RowItem
                  label="Estado Operativo"
                  isLast
                  value={
                    <Chip
                      label={
                        estadoOperativoMap[maquina.estado_operativo] ||
                        maquina.estado_operativo ||
                        'Desconocido'
                      }
                      size="small"
                      color={getEstadoOperativoColor(maquina.estado_operativo)}
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
                    ) : (
                      'Sin información'
                    )
                  }
                />
              </SectionCard>
            </Stack>

            {/* DERECHA */}
            <Stack spacing={2}>
              <SectionCard icon={<ClusterIcon />} title="Infraestructura y Orquestación" bgcolor={theme.palette.info.main}>
                {clusterInfo.length === 0 ? (
                  <Typography>No vinculada a ningún host.</Typography>
                ) : (
                  clusterInfo.map((info, idx) => (
                    <Box key={idx} sx={{ mb: 2, pb: 1, borderBottom: idx < clusterInfo.length - 1 ? '1px dashed #ddd' : 'none' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {info.titulo}
                      </Typography>
                      <RowItem
                        label="Cluster"
                        value={
                          <Link to={info.link} style={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            {info.clusterName}
                          </Link>
                        }
                      />
                      <RowItem label="Nodo / Host" value={info.nodoName} />
                      {info.rol && <RowItem label="Rol" value={<Chip label={info.rol} size="small" />} />}
                    </Box>
                  ))
                )}
              </SectionCard>

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
                <RowItem label="Creado por" value={getUserFullName(maquina.usuario_creacion)} />
                <RowItem label="Última Modificación" value={fmtDate(maquina.fecha_modificacion)} />
                <RowItem label="Modificado por" value={getUserFullName(maquina.usuario_modificacion)} isLast />
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
          <Tab label={<Stack direction="row" spacing={1}><UsersIcon fontSize="small" />Usuarios<Chip label={usuarioRoles.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><DeploymentIcon fontSize="small" />Despliegues<Chip label={despliegues.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><SystemIcon fontSize="small" />Sistemas<Chip label={uniqueById(despliegues.map(d=>d.componentes?.sistemas)).length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><InfraIcon fontSize="small" />Eventos<Chip label={infraAfectada.length} size="small" /></Stack>} />
        </Tabs>

        <CardContent>
          {tab === 0 &&
            (usuarioRoles.length ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Rol</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuarioRoles.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{getUserFullName(r.usuarios?.[0]?.id)}</TableCell>
                        <TableCell>{r.roles?.nombre}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography>No hay usuarios asociados.</Typography>)}

          {tab === 1 &&
            (despliegues.length ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
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
            ) : <Typography>No hay despliegues registrados.</Typography>)}

          {tab === 2 &&
            (uniqueById(despliegues.flatMap(d => d.componentes?.sistemas ? [d.componentes.sistemas] : [])).length ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 2 }}>
                {uniqueById(despliegues.flatMap(d => d.componentes?.sistemas ? [d.componentes.sistemas] : [])).map((s) => (
                  <Paper key={s.id} sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{s.nombre}</Typography>
                    <Typography variant="caption">{s.descripcion}</Typography>
                  </Paper>
                ))}
              </Box>
            ) : <Typography>No hay sistemas asociados.</Typography>)}

          {tab === 3 &&
            (infraAfectada.length ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo Evento</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {infraAfectada.map((ia) => {
                      const e = ia.eventos?.[0]
                      return (
                        <TableRow key={ia.id}>
                          <TableCell>{e?.cod_tipo_evento}</TableCell>
                          <TableCell>{e?.descripcion}</TableCell>
                          <TableCell>{fmtDate(e?.fecha_evento)}</TableCell>
                          <TableCell><Chip label={ia.estado} size="small" /></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography>No hay eventos registrados.</Typography>)}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Maquina
