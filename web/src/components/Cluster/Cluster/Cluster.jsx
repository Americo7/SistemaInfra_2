import React, { useState, useMemo } from 'react'
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
  Skeleton,
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
  Person as PersonIcon,
  Event as EventIcon,
  Update as UpdateIcon,
  CheckCircle as StatusIcon,
} from '@mui/icons-material'

/* ----------------------------------------------------
 * QUERIES GRAPHQL (Conservadas del original)
 * ---------------------------------------------------- */
const GET_USUARIO_NAME = gql`
  query GetUsuarioName($id: Int!) {
    usuario(id: $id) {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

const GET_PARAMETRO_NOMBRE = gql`
  query GetParametroNombre($codigo: String!) {
    parametroByCodigo(codigo: $codigo) {
      id
      nombre
    }
  }
`

/* ----------------------------------------------------
 * SUB-COMPONENTES LOGICOS (Conservados)
 * ---------------------------------------------------- */
const NombreUsuario = ({ id }) => {
  if (!id) return '—'
  const { data, loading, error } = useQuery(GET_USUARIO_NAME, {
    variables: { id },
  })
  if (loading) return <Skeleton width={100} height={20} />
  if (error || !data?.usuario) return 'Usuario no encontrado'
  const u = data.usuario
  return [u.nombres, u.primer_apellido, u.segundo_apellido].filter(Boolean).join(' ')
}

const TipoCluster = ({ codigo }) => {
  if (!codigo) return '—'
  const { data, loading, error } = useQuery(GET_PARAMETRO_NOMBRE, {
    variables: { codigo },
  })
  if (loading) return <Skeleton width={60} height={20} />
  if (error || !data?.parametroByCodigo) return codigo
  return data.parametroByCodigo.nombre
}

/* ----------------------------------------------------
 * HELPERS & ESTILOS (Patrón Vista Detalle 2.0)
 * ---------------------------------------------------- */
const fmtDate = (d) => {
  if (!d) return '-'
  try {
    const date = new Date(d)
    return date.toLocaleString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return String(d) }
}
const fmtEnum = (val) => (val ? String(val).toUpperCase() : '')

// --- RowItem: Compacto 50/50 ---
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
    {/* ETIQUETA: 50% */}
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ width: '50%', pr: 2, display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}
    >
      {icon && <Box component="span" sx={{ mr: 1, display: 'flex', color: 'action.active' }}>{icon}</Box>}
      {label}
    </Typography>
    {/* VALOR: 50% */}
    <Box sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
      {React.isValidElement(value) ? value : (
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {value ?? ''}
        </Typography>
      )}
    </Box>
  </Box>
)

// --- SectionCard: Borde Top coloreado ---
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
        borderLeft: `1px solid ${theme.palette.divider}`,
        borderRight: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: bgcolor || theme.palette.primary.main, width: 32, height: 32 }}>
            {icon}
          </Avatar>
        }
        title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1rem' }}>{title}</Typography>}
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

/* ----------------------------------------------------
 * COMPONENTE PRINCIPAL
 * ---------------------------------------------------- */
const Cluster = ({ cluster }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)

  // Lógica de visualización específica
  const isProxmox = cluster.cod_tipo_cluster === 'PX'
  const nodos = cluster.cluster_nodos || []

  // Memorizar máquinas (extraído de la lógica original)
  const maquinasProxmox = useMemo(() => {
    if (!isProxmox) return []
    const maquinas = []
    for (const nodo of nodos) {
      if (nodo.servidor?.maquinas?.length) {
        maquinas.push(...nodo.servidor.maquinas)
      }
    }
    return maquinas
  }, [nodos, isProxmox])

  const handleTabChange = (_, v) => setActiveTab(v)

  return (
    <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto' }}>
      
      {/* 1. CARD PRINCIPAL AGRUPADOR */}
      <Card elevation={3} sx={{ borderRadius: 2, mb: 2, overflow: 'hidden' }}>
        
        {/* CABECERA PRINCIPAL COMPACTA */}
        <Box sx={{ 
            px: 4,
            py: 2,
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
          }}>
            <Tooltip title="Volver">
              <IconButton
                onClick={() => navigate(routes.clusters())} // Asumiendo ruta plural 'clusters'
                size="small"
                sx={{
                  mr: 1,
                  bgcolor: 'rgba(63, 81, 181, 0.15)',
                  color: '#3f51b5',
                  border: '1px solid rgba(63, 81, 181, 0.3)',
                  transition: 'all 0.2s ease-in-out',
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
                  background: 'linear-gradient(135deg, #5a00f0, #8a2be2)',
                  color: 'white',
                }}
              >
              <ClusterIcon />
            </Avatar>
           <Box>
             <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                lineHeight: 1.2,
                background: 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
              }}
            >
              {cluster.nombre}
            </Typography>
             <Typography variant="caption" color="text.secondary">
               Ficha técnica del Cluster
             </Typography>
           </Box>
        </Box>

        <CardContent sx={{ px: 4, py: 0 }}>
          
          {/* GRID LAYOUT */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            
            {/* --- COLUMNA IZQUIERDA: INFO GENERAL --- */}
            <Stack spacing={2}>
              <SectionCard
                icon={<GeneralIcon sx={{ fontSize: 16 }} />}
                title="Información General"
                bgcolor={theme.palette.primary.main}
              >
                <RowItem label="Nombre" value={cluster.nombre} />
                <RowItem 
                    label="Tipo de Cluster" 
                    value={<TipoCluster codigo={cluster.cod_tipo_cluster} />} 
                    icon={<TypeIcon fontSize="inherit"/>}
                />
                <RowItem 
                    label="Descripción" 
                    value={cluster.descripcion || 'Sin descripción'} 
                    icon={<DescIcon fontSize="inherit"/>}
                />
                <RowItem 
                  label="Estado Actual" 
                  isLast
                  value={
                    <Chip 
                      label={fmtEnum(cluster.estado)} 
                      size="small" 
                      variant={cluster.estado === 'ACTIVO' ? 'filled' : 'outlined'}
                      color={cluster.estado === 'ACTIVO' ? 'success' : 'error'}
                      sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem' }}
                    />
                  } 
                  icon={<StatusIcon fontSize="inherit"/>}
                />
              </SectionCard>
            </Stack>

            {/* --- COLUMNA DERECHA: AUDITORÍA --- */}
            <Stack spacing={2}>
              <SectionCard 
                  icon={<AuditIcon sx={{ fontSize: 16 }} />} 
                  title="Auditoría del Registro" 
                  bgcolor={theme.palette.warning.dark} // Usando warning para auditoría segun patrón
              >
                <RowItem label="Fecha Creación" value={fmtDate(cluster.fecha_creacion)} icon={<EventIcon fontSize="inherit"/>} />
                <RowItem label="Creado por" value={<NombreUsuario id={cluster.usuario_creacion} />} icon={<PersonIcon fontSize="inherit"/>} />
                <RowItem label="Última Modif." value={fmtDate(cluster.fecha_modificacion)} icon={<UpdateIcon fontSize="inherit"/>} />
                <RowItem label="Modificado por" value={<NombreUsuario id={cluster.usuario_modificacion} />} icon={<PersonIcon fontSize="inherit"/>} isLast />
              </SectionCard>
            </Stack>

          </Box>
        </CardContent>
      </Card>

      {/* 2. TABS INFERIORES */}
      <Card sx={{ borderRadius: 2 }}>
        <Tabs
          value={activeTab}
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
                <NodeIcon fontSize="small"/>
                <span>Nodos</span>
                <Chip label={nodos.length} size="small" sx={{height:18, fontSize:'0.7rem'}}/>
              </Stack>
            } 
          />
          {isProxmox && (
            <Tab 
              sx={{ minHeight: 42, py: 0 }} 
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <MachineIcon fontSize="small"/>
                  <span>VMs Asociadas</span>
                  <Chip label={maquinasProxmox.length} size="small" sx={{height:18, fontSize:'0.7rem'}}/>
                </Stack>
              } 
            />
          )}
        </Tabs>

        <Box sx={{ p: 2, minHeight: 200 }}>
          
          {/* TAB 0: NODOS */}
          {activeTab === 0 && (
            nodos.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell sx={{ fontWeight: 700 }}>Nombre Lógico</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tipo Nodo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Recurso Vinculado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nodos.map((n) => {
                       let recursoNombre = ''
                       let recursoLink = null
                       if (n.maquina) {
                         recursoNombre = n.maquina.nombre
                         recursoLink = routes.maquina({ id: n.maquina.id })
                       } else if (n.servidor) {
                         recursoNombre = n.servidor.nombre
                         recursoLink = routes.servidor({ id: n.servidor.id })
                       }
                      return (
                        <TableRow key={n.id} hover>
                          <TableCell>{n.nombre}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={fmtEnum(n.nodoTipo)}
                              color={n.nodoTipo === 'VIRTUAL' ? 'info' : 'warning'}
                              sx={{ height: 22, fontSize: '0.75rem' }}
                            />
                          </TableCell>
                          <TableCell>
                            {recursoNombre ? (
                              <Link
                                to={recursoLink}
                                style={{
                                  color: theme.palette.primary.main,
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                              >
                                {recursoNombre}
                              </Link>
                            ) : (<Typography variant="caption" color="text.secondary">Sin vinculación</Typography>)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography align="center" color="text.secondary" sx={{ py: 4 }}>Este cluster no tiene nodos registrados.</Typography>
          )}

          {/* TAB 1: MÁQUINAS (PROXMOX ONLY) */}
          {isProxmox && activeTab === 1 && (
            maquinasProxmox.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell sx={{ fontWeight: 700 }}>VMID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Nombre VM</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>RAM</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>CPU</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Sistema Operativo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado Operativo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maquinasProxmox.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell>{m.proxmox_vmid}</TableCell>
                        <TableCell>
                           <Link
                              to={routes.maquina({ id: m.id })}
                              style={{
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              {m.nombre}
                            </Link>
                        </TableCell>
                        <TableCell>{m.ip}</TableCell>
                        <TableCell>{m.ram} GB</TableCell>
                        <TableCell>{m.cpu} cores</TableCell>
                        <TableCell>{m.so}</TableCell>
                        <TableCell>
                          <Chip 
                            label={m.estado_operativo} 
                            size="small" 
                            sx={{
                              bgcolor: m?.estado_operativo === 'running' ? theme.palette.success.main : theme.palette.error.main,
                              color: '#fff',
                              height: 22,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No se encontraron máquinas virtuales en los nodos de este cluster.</Typography>
          )}

        </Box>
      </Card>
    </Box>
  )
}

export default Cluster