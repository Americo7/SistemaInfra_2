import React, { useMemo, useState } from 'react'
import { Link, routes } from '@redwoodjs/router'
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
  Server as ProxmoxIcon,
  VpnKey as UuidIcon,
  Settings as OSIcon,
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

/* ---------------------------------------------
 * HELPERS
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
    if (it && it.id != null && !map.has(it.id)) map.set(it.id, it)
  })
  return Array.from(map.values())
}

const RowItem = ({ label, value, icon }) => (
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
      sx={{ width: '50%', pr: 2, display: 'flex', alignItems: 'center' }}
    >
      {icon && <Box component="span" sx={{ mr: 1, display: 'flex', color: 'action.active' }}>{icon}</Box>}
      {label}
    </Typography>

    <Box sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value ?? ''}</Typography>
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
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: bgcolor || theme.palette.primary.main, width: 36, height: 36 }}>
            {icon}
          </Avatar>
        }
        title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>}
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

/* ---------------------------------------------
 * MAQUINA COMPONENT
 * --------------------------------------------- */
const Maquina = ({ maquina = {} }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  // Consultas de Lookup
  const { data: paramData } = useQuery(QUERY_PARAMETRICAS)
  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)

  // Extracción de Relaciones
  const servidor = maquina?.servidores || null
  const maquinaClusterNodos = maquina?.cluster_nodos || []
  const usuarioRoles = maquina?.usuario_roles || []
  const despliegues = maquina?.despliegue || []
  const infraAfectada = maquina?.infra_afectada || []

  // Mapas de Lookup
  const usuariosMap = useMemo(() => {
    return (
      usuariosData?.usuarios?.reduce((map, usuario) => {
        map[usuario.id] = [usuario.nombres, usuario.primer_apellido, usuario.segundo_apellido].filter(Boolean).join(' ')
        return map
      }, {}) || {}
    )
  }, [usuariosData])

  const parametrosMap = useMemo(() => {
    return (
      paramData?.parametros?.reduce((map, param) => {
        if (param.grupo === 'PLATAFORMA') {
            map[param.codigo] = param.nombre;
        }
        return map;
      }, {}) || {}
    )
  }, [paramData])

  const getNombrePlataforma = (codigo) => parametrosMap[codigo] || codigo || '-'
  const getUserFullName = (userId) => usuariosMap[userId] || 'N/A'

  // Lógica de Sistemas
  const sistemasFromDespliegues = useMemo(() => {
    const arr = (despliegues || []).flatMap((d) => {
      const comps = Array.isArray(d.componentes) ? d.componentes : d.componentes ? [d.componentes] : []
      return comps.flatMap((c) => Array.isArray(c.sistemas) ? c.sistemas : c.sistemas ? [c.sistemas] : [])
    })
    return uniqueById(arr)
  }, [despliegues])

  // Lógica de Cluster/Host
  const clusterInfo = useMemo(() => {
    const info = []

    // 1. Host Físico (Proxmox)
    if (servidor) {
      info.push({
        titulo: 'Host de Virtualización',
        clusterName: servidor.data_centers?.nombre || 'Data Center',
        nodoName: servidor.nombre,
        link: routes.servidor({ id: servidor.id }),
        tipo: 'PROXMOX'
      })
    }

    // 2. Nodos Kubernetes (si esta VM es un worker/master)
    maquinaClusterNodos.forEach(nodo => {
      if (nodo.cluster) {
        info.push({
          titulo: 'Nodo de Cluster',
          clusterName: nodo.cluster.nombre,
          nodoName: nodo.nombre || maquina.nombre,
          link: routes.cluster({ id: nodo.cluster.id }),
          tipo: nodo.cluster.cod_tipo_cluster,
          rol: nodo.rol
        })
      }
    })

    return info
  }, [servidor, maquinaClusterNodos, maquina])

  const handleTabChange = (_e, v) => setTab(v)

  return (
    <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto' }}>
      {/* GRID SUPERIOR */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>

        {/* CARD 1: DETALLES DE MÁQUINA */}
        <SectionCard
          icon={<MachineIcon sx={{ fontSize: 18 }} />}
          title="Detalles de la Máquina Virtual"
          bgcolor={theme.palette.primary.main}
        >
          <RowItem label="Nombre" value={maquina?.nombre || ''} />

          {/* Campos de Sincronización */}
          <RowItem label="VM ID (Proxmox)" value={maquina?.proxmox_vmid || 'N/A'} icon={<ProxmoxIcon fontSize="inherit" />} />
          <RowItem label="MAC Address" value={maquina?.mac_address || 'N/A'} icon={<MacIcon fontSize="inherit" />} />
          <RowItem label="UUID" value={maquina?.uuid || 'N/A'} icon={<UuidIcon fontSize="inherit" />} />

          <RowItem label="IP" value={maquina?.ip || ''} />
          <RowItem label="Sistema Operativo" value={maquina?.so || ''} icon={<OSIcon fontSize="inherit" />} />
          <RowItem label="Plataforma" value={getNombrePlataforma(maquina?.cod_plataforma)} />

          <RowItem
            label="Estado"
            value={
              <Chip
                label={fmtEnum(maquina?.estado)}
                size="small"
                sx={{
                  bgcolor: maquina?.estado === 'ACTIVO' ? theme.palette.success.main : theme.palette.error.main,
                  color: '#fff',
                  height: 22,
                  fontSize: '0.75rem',
                }}
              />
            }
          />

          <RowItem label="Fecha creación" value={fmtDate(maquina?.fecha_creacion)} />
          <RowItem label="Creado por" value={getUserFullName(maquina?.usuario_creacion)} />
          <RowItem label="Última modif." value={fmtDate(maquina?.fecha_modificacion)} />
          <RowItem label="Modificado por" value={getUserFullName(maquina?.usuario_modificacion)} />
        </SectionCard>

        {/* COLUMNA DERECHA */}
        <Stack spacing={2}>

          {/* CARD 2: ORQUESTACIÓN */}
          <SectionCard
            icon={<ClusterIcon sx={{ fontSize: 18 }} />}
            title="Infraestructura y Orquestación"
            bgcolor={theme.palette.info.main}
          >
            {clusterInfo.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>No está vinculada a ningún Host o Cluster.</Typography>
            ) : (
              clusterInfo.map((info, idx) => (
                <Box key={idx} sx={{ mb: 2, pb: 1, borderBottom: idx < clusterInfo.length -1 ? '1px dashed #eee' : 'none' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    {info.titulo.toUpperCase()}
                  </Typography>

                  <RowItem
                    label={info.tipo === 'PROXMOX' ? 'Ubicación' : 'Cluster'}
                    value={
                      <Link to={info.link} style={{ textDecoration: 'none', color: theme.palette.primary.main, fontWeight: 600 }}>
                        {info.clusterName}
                      </Link>
                    }
                  />
                  <RowItem label="Nodo / Host" value={info.nodoName} />
                  {info.rol && <RowItem label="Rol Asignado" value={<Chip label={info.rol} size="small" variant="outlined" />} />}
                </Box>
              ))
            )}
          </SectionCard>

          {/* CARD 3: RECURSOS */}
          <SectionCard icon={<MemoryIcon sx={{ fontSize: 18 }} />} title="Recursos Asignados" bgcolor={theme.palette.success.main}>
            <RowItem label="CPUs Virtuales" value={`${maquina?.cpu ?? 0} vCores`} />
            <RowItem label="Memoria RAM" value={`${maquina?.ram ?? 0} GB`} />

            <RowItem
              label="Discos"
              value={
                parseAlmacenamiento(maquina?.almacenamiento).length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {parseAlmacenamiento(maquina.almacenamiento).map((d, i) => (
                      <Chip
                        key={i}
                        size="small"
                        label={`D${d.Disco || i+1}: ${d.Valor} GB`}
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.75rem' }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.secondary">Sin información</Typography>
                )
              }
            />
          </SectionCard>

        </Stack>
      </Box>

      {/* TABS INFERIORES */}
      <Card sx={{ borderRadius: 1 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, minHeight: 42 }}
        >
          <Tab label={<Stack direction="row" spacing={1} alignItems="center"><UsersIcon fontSize="small" /><span>Usuarios</span><Chip label={usuarioRoles.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1} alignItems="center"><DeploymentIcon fontSize="small" /><span>Despliegues</span><Chip label={despliegues.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1} alignItems="center"><SystemIcon fontSize="small" /><span>Sistemas</span><Chip label={sistemasFromDespliegues.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1} alignItems="center"><InfraIcon fontSize="small" /><span>Eventos</span><Chip label={infraAfectada.length} size="small" /></Stack>} />
        </Tabs>

        <CardContent sx={{ p: 2 }}>

          {/* TAB 0: USUARIOS */}
          {tab === 0 && (
            usuarioRoles.length > 0 ? (
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
                        <TableCell>{ur.roles?.nombre || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No hay usuarios asociados.</Typography>
          )}

          {/* TAB 1: DESPLIEGUES */}
          {tab === 1 && (
            despliegues.length > 0 ? (
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
                        <TableCell>{d.componentes?.nombre || 'N/A'}</TableCell>
                        <TableCell>{d.componentes?.sistemas?.nombre || 'N/A'}</TableCell>
                        <TableCell>{fmtDate(d.fecha_despliegue)}</TableCell>
                        <TableCell><Chip size="small" label={d.estado_despliegue} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No hay despliegues registrados.</Typography>
          )}

          {/* TAB 2: SISTEMAS */}
          {tab === 2 && (
            sistemasFromDespliegues.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                {sistemasFromDespliegues.map((s) => (
                  <Paper key={s.id} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" fontWeight={700}>
                      {s.nombre} {s.sigla ? `(${s.sigla})` : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.descripcion?.substring(0, 100)}...
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No hay sistemas relacionados.</Typography>
          )}

          {/* TAB 3: EVENTOS */}
          {tab === 3 && (
            infraAfectada.length > 0 ? (
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
                      const ev = ia.eventos?.[0]; // Asumiendo relación 1-N simplificada para la vista
                      return (
                        <TableRow key={ia.id} hover>
                          <TableCell>{ev?.cod_tipo_evento || 'N/A'}</TableCell>
                          <TableCell>{ev?.descripcion || 'N/A'}</TableCell>
                          <TableCell>{fmtDate(ev?.fecha_evento)}</TableCell>
                          <TableCell><Chip size="small" label={ia.estado} /></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No hay eventos de infraestructura.</Typography>
          )}

        </CardContent>
      </Card>
    </Box>
  )
}

export default Maquina