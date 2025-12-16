import React, { useMemo } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { gql } from '@redwoodjs/web'

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
  Code as ComponentIcon,
  Dns as SystemIcon,
  Cloud as DeployIcon,
  Info as GeneralIcon,
  History as AuditIcon,
  ArrowBack as BackIcon,
  Language as DomainIcon,
  Category as CategoryIcon,
  GitHub as GitIcon,
  SettingsEthernet as EnvIcon,
  Memory as MemoryIcon,
  OpenInNew as OpenInNewIcon,
  Hub as ClusterIcon,
  Description as DescIcon,
} from '@mui/icons-material'

/* -----------------------
 * QUERIES & MUTATIONS
 * ----------------------- */
const DELETE_COMPONENTE_MUTATION = gql`
  mutation DeleteComponenteMutation($id: Int!) {
    deleteComponente(id: $id) {
      id
    }
  }
`

/* -----------------------
 * HELPERS GLOBALES
 * ----------------------- */
const fmtDate = (d) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '-' }
}

const getStatusColor = (codigo) => {
  const c = codigo?.toUpperCase() || 'UNKNOWN'
  const map = {
    ACTIVO: 'success', EXITOSO: 'success', OPERATIVO: 'success', FINALIZADO: 'success',
    FALLIDO: 'error', ERROR: 'error', FUERA_SERVICIO: 'error',
    EN_PROCESO: 'info', INICIADO: 'warning', PENDIENTE: 'warning',
  }
  return map[c] || 'default'
}

const formatUserName = (usuarioObj) => {
  if (!usuarioObj) return '-'
  return `${usuarioObj.nombres || ''} ${usuarioObj.primer_apellido || ''} ${usuarioObj.segundo_apellido || ''}`.trim()
}

const parseJsonData = (value) => {
  if (!value) return []
  try {
    const parsed = typeof value === 'object' ? value : JSON.parse(value)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch { return [] }
}

const resolveClusterInfo = (recurso, tipoRecurso) => {
  if (!recurso) return { nombre: '-', tipo: null, color: 'default' }
  const getFirst = (data) => Array.isArray(data) && data.length > 0 ? data[0] : null;

  if (recurso.cluster_nodos) {
    const k8sNode = getFirst(recurso.cluster_nodos);
    if (k8sNode?.cluster) {
      return {
        nombre: k8sNode.cluster.nombre,
        tipo: k8sNode.cluster.tipoClusterInfo?.nombre || 'Orquestación',
        color: 'primary'
      }
    }
  }
  return { nombre: '-', tipo: null, color: 'default' }
}

/* -----------------------
 * SUB-COMPONENTES UI
 * ----------------------- */
const RowItem = ({ label, value, icon, isLast, href }) => {
  const theme = useTheme()
  const content = React.isValidElement(value) ? value : <Typography variant="body2" fontWeight={600}>{value}</Typography>

  return (
    <Box sx={{
        display: 'flex', alignItems: 'center', py: 0.75,
        borderBottom: isLast ? 'none' : '1px solid', borderColor: theme.palette.divider,
        '&:hover': { bgcolor: 'action.hover' },
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: '35%', pr: 2, display: 'flex', alignItems: 'center' }}>
        {icon && <Box sx={{ mr: 1, display: 'flex', color: 'action.active' }}>{icon}</Box>}
        {label}
      </Typography>
      <Box sx={{ width: '65%', display: 'flex', alignItems: 'center' }}>
        {href ? (
           <a href={href} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: theme.palette.primary.main, fontWeight: 600 }}>
             {value} <OpenInNewIcon sx={{ ml: 0.5, fontSize: 14 }} />
           </a>
        ) : content}
      </Box>
    </Box>
  )
}

const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, borderTop: `3px solid ${bgcolor || theme.palette.primary.main}`, bgcolor: theme.palette.background.paper }}>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: bgcolor || theme.palette.primary.main, width: 32, height: 32 }}>{icon}</Avatar>}
        title={<Typography sx={{ fontWeight: 700 }}>{title}</Typography>}
        sx={{ py: 1, px: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent sx={{ p: 2 }}>{children}</CardContent>
    </Card>
  )
}

/* -----------------------
 * COMPONENTE PRINCIPAL
 * ----------------------- */
const Componente = ({ componente }) => {
  const theme = useTheme()

  const tecnologiaList = useMemo(() => parseJsonData(componente.tecnologia), [componente.tecnologia])
  
  const historialDespliegues = useMemo(() => {
    const lista = []
    const desplieguesRaw = componente.despliegue || []
    desplieguesRaw.forEach(d => {
      const targets = []
      if (d.maquinas) targets.push({ ...d.maquinas, type: 'VM' })
      if (d.servidores) targets.push({ ...d.servidores, type: 'SRV' })

      const baseInfo = {
        fecha: d.fecha_despliegue,
        tipoRespaldo: d.tipoRespaldoInfo?.nombre || d.cod_tipo_respaldo || '-',
        estado: d.estadoDespliegueInfo?.nombre || d.estado_despliegue,
        estadoCodigo: d.estadoDespliegueInfo?.codigo || d.estado_despliegue
      }

      if (targets.length === 0) {
        lista.push({ id: `d-${d.id}-none`, ...baseInfo, destino: null, ip: '-' })
      } else {
        targets.forEach(t => {
          const clusterData = resolveClusterInfo(t, t.type)
          lista.push({
            id: `d-${d.id}-${t.type}-${t.id}`,
            ...baseInfo,
            ip: t.type === 'VM' ? (t.ip || '-') : (t.ip_primaria || '-'),
            destino: { id: t.id, nombre: t.nombre, tipo: t.type, cluster: clusterData }
          })
        })
      }
    })
    return lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [componente])

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      
      {/* HEADER */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '0 0 12px 12px', mb: 3, bgcolor: theme.palette.background.paper }}>
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver">
            <IconButton onClick={() => navigate(routes.componentes())} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(135deg, #7B1FA2, #E1BEE7)' }}>
            <ComponentIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800}>{componente.nombre}</Typography>
            <Typography variant="caption" color="text.secondary">Ficha técnica de componente de software</Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: 5, pb: 5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, alignItems: 'start' }}>
            
            <SectionCard icon={<GeneralIcon />} title="Información General" bgcolor={theme.palette.primary.main}>
              <RowItem label="Dominio" value={componente.dominio || '-'} icon={<DomainIcon />} href={componente.dominio} />
              <RowItem label="Entorno" value={componente.entornoInfo?.nombre || '-'} icon={<EnvIcon />} />
              <RowItem label="Categoría" value={componente.categoriaInfo?.nombre || '-'} icon={<CategoryIcon />} />
              <RowItem label="Sistema" icon={<SystemIcon />} value={componente.sistemas ? <Link to={routes.sistema({ id: componente.sistemas.id })} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>{componente.sistemas.nombre}</Link> : 'No asociado'} />
              <RowItem label="Repositorio" value={componente.gitlab_repo || '-'} icon={<GitIcon />} href={componente.gitlab_repo} />
              {/* Le quité isLast a Rama */}
              <RowItem label="Rama" value={componente.gitlab_rama || '-'} /> 
              {/* Agregado Descripción al final con isLast */}
              <RowItem label="Descripción" value={componente.descripcion || '-'} icon={<DescIcon />} isLast />
            </SectionCard>

            <Stack spacing={1}>
              <SectionCard icon={<AuditIcon />} title="Estado y Auditoría" bgcolor={theme.palette.warning.main}>
                <RowItem label="Estado Actual" value={<Chip label={componente.estado} size="small" variant="outlined" color={getStatusColor(componente.estado)} sx={{ fontWeight: 700 }} />} />
                <RowItem label="Fecha Creación" value={fmtDate(componente.fecha_creacion)} />
                <RowItem label="Creado Por" value={formatUserName(componente.creadoPor)} />
                <RowItem label="Fecha mod." value={fmtDate(componente.fecha_modificacion)} />
                <RowItem label="Modificado Por" value={formatUserName(componente.modificadoPor)} isLast />
              </SectionCard>

              <SectionCard icon={<MemoryIcon />} title="Stack Tecnológico" bgcolor={theme.palette.secondary.main}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
                  {tecnologiaList.length > 0 ? (
                    tecnologiaList.map((tech, idx) => (
                      <Chip
                        key={idx}
                        label={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tech.nombre}</Typography>
                            {tech.version && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  bgcolor: alpha('#fff', 0.6), 
                                  px: 0.8, 
                                  py: 0.1,
                                  borderRadius: '4px', 
                                  fontWeight: 800,
                                  color: theme.palette.secondary.dark,
                                  fontSize: '0.7rem'
                                }}
                              >
                                v {tech.version}
                              </Typography>
                            )}
                          </Box>
                        }
                        sx={{
                          height: 'auto',
                          py: 0.6,
                          borderRadius: '8px',
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No especificado</Typography>
                  )}
                </Box>
              </SectionCard>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* HISTORIAL DE DESPLIEGUES */}
      <Card sx={{ borderRadius: 2, mt: 3, bgcolor: theme.palette.background.paper }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}><DeployIcon /></Avatar>}
          title={<Typography sx={{ fontWeight: 700 }}>Historial de Despliegues</Typography>}
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 1.5 }}
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo Respaldo</TableCell>
                  <TableCell>Destino</TableCell>
                  <TableCell>Cluster</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historialDespliegues.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{fmtDate(d.fecha)}</TableCell>
                    <TableCell>{d.tipoRespaldo}</TableCell>
                    <TableCell>
                      {d.destino ? (
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{d.destino.nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">IP: {d.ip}</Typography>
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {d.destino?.cluster.nombre !== '-' ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ClusterIcon fontSize="small" color={d.destino.cluster.color} />
                          <Typography variant="body2">{d.destino.cluster.nombre}</Typography>
                        </Stack>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip label={d.estado} size="small" color={getStatusColor(d.estadoCodigo)} sx={{ fontWeight: 600 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Componente