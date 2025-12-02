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
  Divider
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
  VpnKey as UuidIcon,
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
    parametros(grupo: ["PLATAFORMA"]) {
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
    if (it?.id != null && !map.has(it.id)) map.set(it.id, it)
  })
  return Array.from(map.values())
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
      width: '100%',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ width: '40%', pr: 2, display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}
    >
      {icon && (
        <Box component="span" sx={{ mr: 1, display: 'flex', color: 'action.active' }}>
          {icon}
        </Box>
      )}
      {label}
    </Typography>

    <Box sx={{ width: '60%', display: 'flex', alignItems: 'center' }}>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {value ?? ''}
        </Typography>
      ) : (
        value ?? <Typography variant="body2"> </Typography>
      )}
    </Box>
  </Box>
)

/* -----------------------
 * SECTION CARD
 * ----------------------- */
const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  const activeColor = bgcolor || theme.palette.primary.main

  return (
    <Card
      sx={{
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `3px solid ${activeColor}`,
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: activeColor, width: 32, height: 32 }}>
            {icon}
          </Avatar>
        }
        title={
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1rem', color: '#000' }}>
            {title}
          </Typography>
        }
        sx={{
          py: 1,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      />
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>{children}</CardContent>
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

  /* ----- MAPAS ------- */
  const usuariosMap = useMemo(
    () =>
      usuariosData?.usuarios?.reduce((map, u) => {
        map[u.id] = `${u.nombres} ${u.primer_apellido}`.trim()
        return map
      }, {}) || {},
    [usuariosData]
  )

  const parametrosMap = useMemo(
    () =>
      paramData?.parametros?.reduce((map, p) => {
        map[p.codigo] = p.nombre
        return map
      }, {}) || {},
    [paramData]
  )

  const getNombrePlataforma = (c) => parametrosMap[c] || c || '-'
  const getUserFullName = (id) => usuariosMap[id] || 'Sistema'
  const sistemasFromDespliegues = useMemo(() => {
    const arr = (despliegues || []).flatMap((d) => {
      const comps = Array.isArray(d.componentes)
        ? d.componentes
        : d.componentes
        ? [d.componentes]
        : []

      return comps.flatMap((c) =>
        Array.isArray(c.sistemas)
          ? c.sistemas
          : c.sistemas
          ? [c.sistemas]
          : []
      )
    })

    return uniqueById(arr)
  }, [despliegues])

  /* ----- Cluster info ----- */
  const clusterInfo = useMemo(() => {
    const arr = []
    
    // Obtener cluster desde servidor -> cluster_nodos -> cluster
    if (servidor?.cluster_nodos?.[0]?.cluster) {
      const clusterFromServidor = servidor.cluster_nodos[0].cluster
      arr.push({
        titulo: 'Host de Virtualización',
        clusterName: clusterFromServidor?.nombre || 'Sin datos',
        nodoName: servidor.nombre,
        link: routes.cluster({ id: clusterFromServidor.id }),
        tipo: clusterFromServidor.cod_tipo_cluster,
      })
    }
    
    // Cluster nodos directos de la máquina
    maquinaClusterNodos.forEach((n) => {
      if (n.cluster) {
        arr.push({
          titulo: 'Nodo de Cluster',
          clusterName: n.cluster?.nombre || 'Sin datos',
          nodoName: n.nombre || maquina.nombre,
          tipo: n.cluster.cod_tipo_cluster,
          rol: n.rol,
          link: routes.cluster({ id: n.cluster.id }),
        })
      }
    })
    return arr
  }, [servidor, maquinaClusterNodos, maquina])

  /* ----- Tabs ----- */
  const handleTabChange = (_, v) => setTab(v)

  return (
    <Box sx={{ width: '100%', maxWidth: 1500, mx: 'auto' }}>
      {/* CARD PRINCIPAL */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderTop: 'none',

          borderTopLeftRadius: '0 !important',
          borderTopRightRadius: '0 !important',
          borderRadius: '0 0 12px 12px !important',

          mb: 3,
          bgcolor: theme.palette.background.paper,
        }}
      >

        {/* HEADER */}
        <Box
          sx={{
            px: 5,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mt: -1,                 // ← CLAVE: empuja el header 1px hacia arriba
            borderTop: 'none',      // ← asegura continuidad visual
            borderTopLeftRadius: 0, // ← evita curva
            borderTopRightRadius: 0,
          }}
        >
          <Tooltip title="Volver">
            <IconButton
              onClick={() => navigate(routes.maquinas())}
              size="small"
              sx={{
                mr: 1,
                bgcolor: 'rgba(63, 81, 181, 0.15)',
                color: '#3f51b5',
                border: '1px solid rgba(63, 81, 181, 0.3)',
                '&:hover': {
                  bgcolor: 'rgba(63, 81, 181, 0.25)',
                  color: '#303f9f',
                  borderColor: 'rgba(63, 81, 181, 0.6)',
                },
              }}
            >
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #0097a7, #26c6da)',
              color: 'white',
            }}
          >
            <MachineIcon />
          </Avatar>

          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                lineHeight: 1.2,
                color: '#000',
                fontWeight: 800,
              }}
            >
              {maquina.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ficha técnica de máquina virtual
            </Typography>
          </Box>
        </Box>

        {/* CONTENIDO */}
        <CardContent sx={{ px: 5, py: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* COLUMNA IZQUIERDA */}
            <Stack spacing={2}>
              {/* CARD — Info General */}
              <SectionCard
                icon={<GeneralIcon fontSize="small" />}
                title="Información General"
                bgcolor={theme.palette.primary.main}
              >
                <RowItem label="VMID" value={maquina.proxmox_vmid} icon={<ProxmoxIcon fontSize="inherit" />} />
                <RowItem label="Identificador" value={maquina.identity_key} icon={<MacIcon fontSize="inherit" />} />
                <RowItem label="Dirección IP" value={maquina.ip} />
                <RowItem label="Sistema Operativo" value={maquina.so} icon={<OSIcon fontSize="inherit" />} />
                <RowItem label="Plataforma" value={getNombrePlataforma(maquina.cod_plataforma)} />
                <RowItem
                  label="Estado Operativo"
                  isLast
                  value={
                    <Chip
                      label={fmtEnum(maquina.estado_operativo)}
                      size="small"
                      color={maquina.estado_operativo === 'OPERATIVO' ? 'success' : 'error'}
                      sx={{
                        height: 20,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                      }}
                    />
                  }
                />
              </SectionCard>

              {/* CARD — Recursos */}
              <SectionCard
                icon={<MemoryIcon fontSize="small" />}
                title="Recursos Asignados"
                bgcolor={theme.palette.success.main}
              >
                <RowItem label="vCPUs" value={`${maquina.cpu} Core(s)`} />
                <RowItem label="RAM" value={`${maquina.ram} GB`} />
                <RowItem
                  label="Almacenamiento"
                  isLast
                  value={
                    parseAlmacenamiento(maquina.almacenamiento).length > 0 ? (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {parseAlmacenamiento(maquina.almacenamiento).map((d, i) => (
                          <Chip
                            key={i}
                            size="small"
                            label={`D${d.Disco}: ${d.Valor} GB`}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
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

            {/* COLUMNA DERECHA */}
            <Stack spacing={2}>
              {/* CARD — Infraestructura */}
              <SectionCard
                icon={<ClusterIcon fontSize="small" />}
                title="Infraestructura y Orquestación"
                bgcolor={theme.palette.info.main}
              >
                {clusterInfo.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No vinculada a ningún host.
                  </Typography>
                ) : (
                  clusterInfo.map((info, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        mb: 2,
                        pb: 1,
                        borderBottom: idx < clusterInfo.length - 1 ? '1px dashed #ddd' : 'none',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}
                      >
                        {info.titulo.toUpperCase()}
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
                      {info.rol && (
                        <RowItem
                          label="Rol"
                          value={<Chip size="small" variant="outlined" label={info.rol} />}
                          isLast
                        />
                      )}
                    </Box>
                  ))
                )}
              </SectionCard>

              {/* CARD — Auditoría */}
              <SectionCard
                icon={<AuditIcon fontSize="small" />}
                title="Auditoría del Registro"
                bgcolor={theme.palette.warning.dark}
              >
                <RowItem
                  label="Estado Registro"
                  value={
                    <Chip
                      label={fmtEnum(maquina.estado)}
                      size="small"
                      color={maquina.estado === 'ACTIVO' ? 'success' : 'error'}
                      sx={{ height: 20, fontWeight: 600, fontSize: '0.7rem' }}
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

      {/* TABS PRINCIPALES */}
      <Card sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, minHeight: 42 }}
        >
          <Tab
            sx={{ minHeight: 42, py: 0 }}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <UsersIcon fontSize="small" />
                <span>Usuarios</span>
                <Chip label={usuarioRoles.length} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
              </Stack>
            }
          />

          <Tab
            sx={{ minHeight: 42, py: 0 }}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <DeploymentIcon fontSize="small" />
                <span>Despliegues</span>
                <Chip label={despliegues.length} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
              </Stack>
            }
          />

          <Tab
            sx={{ minHeight: 42, py: 0 }}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <SystemIcon fontSize="small" />
                <span>Sistemas</span>
                <Chip
                  label={uniqueById(
                    despliegues.flatMap((d) =>
                      d.componentes?.sistemas ? [d.componentes.sistemas] : []
                    )
                  ).length}
                  size="small"
                  sx={{ height: 18, fontSize: '0.7rem' }}
                />
              </Stack>
            }
          />

          <Tab
            sx={{ minHeight: 42, py: 0 }}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <InfraIcon fontSize="small" />
                <span>Eventos</span>
                <Chip label={infraAfectada.length} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
              </Stack>
            }
          />
        </Tabs>

        {/* TAB CONTENT */}
        <CardContent sx={{ p: 2 }}>
          {/* TAB 0: Usuarios */}
          {tab === 0 &&
            (usuarioRoles.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuarioRoles.map((ur) => (
                      <TableRow key={ur.id} hover>
                        <TableCell>{getUserFullName(ur.usuarios?.[0]?.id)}</TableCell>
                        <TableCell>{ur.roles?.nombre}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                No hay usuarios asociados.
              </Typography>
            ))}

          {/* TAB 1: Despliegues */}
          {tab === 1 &&
            (despliegues.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell sx={{ fontWeight: 700 }}>Componente</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Sistema</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {despliegues.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell>{d.componentes?.nombre}</TableCell>
                        <TableCell>{d.componentes?.sistemas?.nombre}</TableCell>
                        <TableCell>{fmtDate(d.fecha_despliegue)}</TableCell>
                        <TableCell>
                          <Chip label={d.estado_despliegue} size="small" sx={{ height: 20 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                No hay despliegues registrados.
              </Typography>
            ))}

          {/* TAB 2: Sistemas */}
          {tab === 2 &&
            (sistemasFromDespliegues.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 2,
                }}
              >
                {sistemasFromDespliegues.map((s) => (
                  <Paper key={s.id} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" fontWeight={700}>
                      {s.nombre} {s.sigla && `(${s.sigla})`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.descripcion?.substring(0, 150)}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                No hay sistemas asociados.
              </Typography>
            ))}

          {/* TAB 3: Eventos */}
          {tab === 3 &&
            (infraAfectada.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell sx={{ fontWeight: 700 }}>Tipo Evento</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {infraAfectada.map((ia) => {
                      const ev = ia.eventos?.[0]
                      return (
                        <TableRow key={ia.id} hover>
                          <TableCell>{ev?.cod_tipo_evento}</TableCell>
                          <TableCell>{ev?.descripcion}</TableCell>
                          <TableCell>{fmtDate(ev?.fecha_evento)}</TableCell>
                          <TableCell>
                            <Chip label={ia.estado} size="small" sx={{ height: 20 }} />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                No hay eventos registrados.
              </Typography>
            ))}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Maquina