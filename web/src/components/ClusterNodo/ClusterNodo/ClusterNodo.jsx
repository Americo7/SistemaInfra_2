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
  useTheme,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Skeleton,
  Stack,
  Paper,
} from '@mui/material'

import {
  Hub as ClusterIcon,
  Computer as MachineIcon,
  Storage as ServerIcon,
  Info as InfoIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
  Memory as ResourceIcon,
  History as AuditIcon,
  Settings as ConfigIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Update as UpdateIcon,
  CheckCircle as StatusIcon,
  Dns as DnsIcon,
} from '@mui/icons-material'

/* ----------------------------------------------------
 * QUERY PARA OBTENER UN USUARIO POR ID
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

/* ----------------------------------------------------
 * SUBCOMPONENTE NombreUsuario
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

/* ----------------------------------------------------
 * Helpers & Estilos (Patrón Vista Detalle 2.0)
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
      variant="outlined" // Usamos variant outlined para que no compita con la sombra del Card principal
      sx={{
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `3px solid ${activeColor}`,
        borderLeft: `1px solid ${theme.palette.divider}`,
        borderRight: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        height: '100%', // Para que ocupen la misma altura si están en grid
        bgcolor: 'background.paper'
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
 * COMPONENTE PRINCIPAL ClusterNodo
 * ---------------------------------------------------- */
const ClusterNodo = ({ clusterNodo }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)

  const isPhysicalNode = clusterNodo?.nodoTipo === 'FISICO'
  const isVirtualNode = clusterNodo?.nodoTipo === 'VIRTUAL'

  const hostedVms = clusterNodo?.servidor?.maquinas || []

  const handleTabChange = (_, v) => setActiveTab(v)

  const recurso = useMemo(() => {
    if (isVirtualNode && clusterNodo.maquina) {
      return {
        tipo: 'Máquina Virtual',
        icon: <MachineIcon fontSize="inherit" />,
        nombre: clusterNodo.maquina.nombre,
        route: clusterNodo.maquina.id ? routes.maquina({ id: clusterNodo.maquina.id }) : null
      }
    }
    if (isPhysicalNode && clusterNodo.servidor) {
      return {
        tipo: 'Servidor Físico',
        icon: <ServerIcon fontSize="inherit" />,
        nombre: clusterNodo.servidor.nombre,
        route: clusterNodo.servidor.id ? routes.servidor({ id: clusterNodo.servidor.id }) : null
      }
    }
    return { tipo: 'No definido', icon: <InfoIcon fontSize="inherit" />, nombre: 'No asignado', route: null }
  }, [isVirtualNode, isPhysicalNode, clusterNodo])

  return (
    <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto' }}>
      
      {/* CARD ÚNICO CONTENEDOR */}
      <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
        
        {/* 1. HEADER (Integrado en el Card) */}
        <Box sx={{ 
            px: 3,
            py: 2.5,
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Tooltip title="Volver">
              <IconButton
                onClick={() => navigate(routes.clusterNodos())}
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
                  width: 42,
                  height: 42,
                  background: 'linear-gradient(135deg, #5a00f0, #8a2be2)',
                  color: 'white',
                  boxShadow: 2
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
              {clusterNodo.nombre}
            </Typography>
             <Typography variant="caption" color="text.secondary">
               Detalle del Nodo de Cluster
             </Typography>
           </Box>
        </Box>

        {/* 2. TABS */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="standard"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, minHeight: 48, px: 2, bgcolor: 'background.default' }}
        >
          <Tab 
            sx={{ minHeight: 48, fontWeight: 600 }} 
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <InfoIcon fontSize="small"/>
                <span>Resumen</span>
              </Stack>
            } 
          />
          {isPhysicalNode && (
            <Tab
              sx={{ minHeight: 48, fontWeight: 600 }}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                    <MachineIcon fontSize="small"/>
                    <span>VMs Alojadas</span>
                    <Chip label={hostedVms.length} size="small" sx={{height:18, fontSize:'0.7rem', cursor:'pointer'}}/>
                </Stack>
              }
            />
          )}
        </Tabs>

        {/* 3. CONTENIDO DEL TAB */}
        <Box sx={{ p: 3, minHeight: 300, bgcolor: '#f9fafb' }}> {/* Fondo gris muy suave para el contenido */}
             
             {/* ----------------------------------------------------
              * TAB 0: RESUMEN
              * ---------------------------------------------------- */}
             {activeTab === 0 && (
                <Stack spacing={3}>
                  
                  {/* FILA SUPERIOR: GRID DE 2 COLUMNAS */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    {/* COLUMNA 1: INFO */}
                    <SectionCard
                      icon={<InfoIcon sx={{ fontSize: 16 }} />}
                      title="Información General"
                      bgcolor={theme.palette.primary.main}
                    >
                      <RowItem label="Nombre Nodo" value={clusterNodo.nombre} />
                      <RowItem 
                          label="Tipo de Nodo" 
                          value={fmtEnum(clusterNodo.nodoTipo)} 
                          icon={<DnsIcon fontSize="inherit"/>}
                      />
                      <RowItem label="Rol" value={clusterNodo.rol || 'No definido'} icon={<ConfigIcon fontSize="inherit"/>} />
                      
                      {clusterNodo.identity_key && (
                        <RowItem
                          label="Identificador"
                          value={
                            <Tooltip title={clusterNodo.identity_key}>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 0.5, borderRadius: 1 }}>
                                {clusterNodo.identity_key.substring(0, 18)}...
                              </Typography>
                            </Tooltip>
                          }
                        />
                      )}

                      <RowItem
                        label="Estado Actual"
                        isLast
                        value={
                          <Chip
                            size="small"
                            label={fmtEnum(clusterNodo.estado)}
                            color={clusterNodo.estado === 'ACTIVO' ? 'success' : 'error'}
                            variant={clusterNodo.estado === 'ACTIVO' ? 'filled' : 'outlined'}
                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                          />
                        }
                        icon={<StatusIcon fontSize="inherit"/>}
                      />
                    </SectionCard>

                    {/* COLUMNA 2: RECURSO */}
                    <SectionCard 
                        icon={<ResourceIcon sx={{ fontSize: 16 }} />} 
                        title="Recurso Vinculado y Cluster" 
                        bgcolor={theme.palette.secondary.main}
                    >
                      <RowItem label="Tipo de Recurso" value={recurso.tipo} icon={recurso.icon} />
                      <RowItem 
                          label="Nombre Recurso" 
                          value={
                              recurso.route ? (
                                  <Link to={recurso.route} style={{ color: theme.palette.primary.main, textDecoration:'none', fontWeight: 600 }}>
                                      {recurso.nombre}
                                  </Link>
                              ) : recurso.nombre
                          } 
                      />
                      <RowItem
                        label="Cluster Perteneciente"
                        value={
                          clusterNodo.cluster?.nombre ? (
                            <Link
                              to={routes.cluster({ id: clusterNodo.clusterId })}
                              style={{
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              {clusterNodo.cluster.nombre}
                            </Link>
                          ) : (
                            'No asignado'
                          )
                        }
                        icon={<ClusterIcon fontSize="inherit"/>}
                        isLast
                      />
                    </SectionCard>
                  </Box>

                  {/* FILA INFERIOR: AUDITORÍA (ANCHO COMPLETO) */}
                  <Box>
                    <SectionCard 
                        icon={<AuditIcon sx={{ fontSize: 16 }} />} 
                        title="Auditoría del Registro" 
                        bgcolor={theme.palette.warning.dark}
                    >
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 4 }}>
                         {/* Usamos un sub-grid interno para aprovechar el ancho completo */}
                         <Box>
                            <RowItem label="Fecha Creación" value={fmtDate(clusterNodo.fecha_creacion)} icon={<EventIcon fontSize="inherit"/>} />
                            <RowItem label="Creado por" value={<NombreUsuario id={clusterNodo.usuario_creacion} />} icon={<PersonIcon fontSize="inherit"/>} isLast />
                         </Box>
                         <Box>
                            <RowItem label="Última Modif." value={fmtDate(clusterNodo.fecha_modificacion)} icon={<UpdateIcon fontSize="inherit"/>} />
                            <RowItem label="Modificado por" value={<NombreUsuario id={clusterNodo.usuario_modificacion} />} icon={<PersonIcon fontSize="inherit"/>} isLast />
                         </Box>
                      </Box>
                    </SectionCard>
                  </Box>

                </Stack>
             )}

             {/* ----------------------------------------------------
              * TAB 1: MÁQUINAS VIRTUALES
              * ---------------------------------------------------- */}
             {isPhysicalNode && activeTab === 1 && (
                hostedVms.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                          <TableCell sx={{ fontWeight: 700 }}>Proxmox ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Nombre VM</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Plataforma</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {hostedVms.map((vm) => (
                          <TableRow key={vm.id} hover>
                            <TableCell>
                              <Chip size="small" variant="outlined" label={vm.proxmox_vmid || 'N/A'} sx={{ height: 22, fontSize: '0.75rem' }}/>
                            </TableCell>
                            <TableCell>
                                <Link
                                  to={routes.maquina({ id: vm.id })}
                                  style={{
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                  }}
                                >
                                  {vm.nombre}
                                </Link>
                            </TableCell>
                            <TableCell>{vm.ip || '-'}</TableCell>
                            <TableCell>{vm.cod_plataforma || '-'}</TableCell>
                            <TableCell align="right">
                                <Tooltip title="Ver detalle de VM">
                                  <IconButton size="small" component={Link} to={routes.maquina({ id: vm.id })}>
                                    <ViewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                    <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                        Este nodo físico no tiene máquinas virtuales registradas actualmente.
                    </Typography>
                )
             )}
        </Box>
      </Card>
    </Box>
  )
}

export default ClusterNodo