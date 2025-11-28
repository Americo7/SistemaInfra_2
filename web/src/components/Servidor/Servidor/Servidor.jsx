import React, { useMemo, useState } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation, useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

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
  Button,
  IconButton,
  Tooltip,
} from '@mui/material'

import {
  Storage as ServerIcon,
  Computer as MachineIcon,
  Dns as ClusterIcon,
  Event as EventIcon,
  ArrowBack as BackIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Business as DataCenterIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as GeneralIcon,
  History as AuditIcon,
  Place as LocationIcon,
  Settings as OSIcon,
  DeveloperBoard as HardwareIcon,
  Router as NetworkIcon,
} from '@mui/icons-material'

/* -----------------------
 * CONSULTAS
 * ----------------------- */
const DELETE_SERVIDOR_MUTATION = gql`
  mutation DeleteServidorMutation($id: Int!) {
    deleteServidor(id: $id) {
      id
    }
  }
`

const GET_USUARIOS_QUERY = gql`
  query UsuariosQuery_fromServidor {
    usuarios {
      id
      nombres
      primer_apellido
    }
  }
`

const GET_PARAMETROS_QUERY = gql`
  query GetParametrosInventarioDetalle {
    parametros(grupo: ["AGETIC_INV", "TIPO_SERV"]) {
      codigo
      nombre
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
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return String(d) }
}

const fmtEnum = (val) => (val ? String(val).toUpperCase() : '')

// --- RowItem: Ajustado para ser más compacto ---
const RowItem = ({ label, value, icon, isLast }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      py: 0.75, // CAMBIO: Reducido de 1.2 a 0.75 para menos altura por fila
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
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{value ?? ''}</Typography>
      ) : (
        value ?? <Typography variant="body2"> </Typography>
      )}
    </Box>
  </Box>
)

// --- SectionCard: Paddings reducidos ---
const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  const activeColor = bgcolor || theme.palette.primary.main
  return (
    <Card
      sx={{
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `3px solid ${activeColor}`, // Borde superior grueso del color del tema
        // Opcional: si quieres un borde sutil alrededor del resto:
        borderLeft: `1px solid ${theme.palette.divider}`,
        borderRight: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardHeader
        avatar={
          // CAMBIO: Avatar un poco más pequeño (32px)
          <Avatar sx={{ bgcolor: bgcolor || theme.palette.primary.main, width: 32, height: 32 }}>
            {icon}
          </Avatar>
        }
        // CAMBIO: Título un poco más pequeño
        title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1 rem' }}>{title}</Typography>}
        sx={{
          py: 1, // CAMBIO: Padding vertical del header reducido
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      />
      {/* CAMBIO: Padding del contenido reducido de 2 a 1.5 */}
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>{children}</CardContent>
    </Card>
  )
}

const Servidor = ({ servidor }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  
  const [deleteServidor] = useMutation(DELETE_SERVIDOR_MUTATION, {
    onCompleted: () => {
      toast.success('Servidor eliminado')
      navigate(routes.servidors())
    },
    onError: (error) => toast.error(error.message),
  })

  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)
  const { data: parametrosData } = useQuery(GET_PARAMETROS_QUERY)

  const usuariosMap = useMemo(() => {
    return usuariosData?.usuarios?.reduce((map, u) => {
      map[u.id] = `${u.nombres} ${u.primer_apellido}`.trim()
      return map
    }, {}) || {}
  }, [usuariosData])

  const parametrosMap = useMemo(() => {
    return parametrosData?.parametros?.reduce((map, p) => {
      map[p.codigo] = p.nombre
      return map
    }, {}) || {}
  }, [parametrosData])

  const getNombreParametro = (codigo) => parametrosMap[codigo] || codigo || '-'
  const getUserFullName = (id) => usuariosMap[id] || 'Sistema'

  const onDeleteClick = (id) => {
    if (confirm(`¿Eliminar servidor ${servidor.nombre}?`)) {
      deleteServidor({ variables: { id } })
    }
  }

  const handleTabChange = (_, v) => setActiveTab(v)

  // Relaciones
  const machines = servidor.maquinas || []
  const clusterNodos = servidor.cluster_nodos || []
  const events = servidor.infra_afectada || []
  const deployments = servidor.despliegue || []

  const nombreCluster = clusterNodos.length > 0 
    ? clusterNodos[0].cluster?.nombre 
    : 'No asignado'

  return (
    <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto'}}> {/* CAMBIO: Padding general reducido a 2 */}
      
      {/* 1. CARD PRINCIPAL AGRUPADOR */}
      <Card elevation={3} sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}> {/* CAMBIO: mb reducido a 2 */}
        
        {/* CABECERA PRINCIPAL COMPACTA */}
        <Box sx={{ 
            px: 4, // CAMBIO: Padding reducido de 3 a 2
            py: 2,
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, // CAMBIO: Gap reducido
          }}>
            <Tooltip title="Volver">
              <IconButton
                onClick={() => navigate(routes.servidors())}
                size="small"
                sx={{
                  mr: 1,
                  bgcolor: 'rgba(63, 81, 181, 0.15)', // azul translúcido
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

           {/* CAMBIO: Avatar más pequeño (40px vs 46px) */}
            <Avatar
              sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'linear-gradient(135deg, #5a00f0, #8a2be2)',
                  background: 'linear-gradient(135deg, #5a00f0, #8a2be2)', // important
                  color: 'white',
                }}
              >
              <ServerIcon />
            </Avatar>
           <Box>
             {/* CAMBIO: Tipografía ligeramente ajustada */}
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
              {servidor.nombre}
            </Typography>
             <Typography variant="caption" color="text.secondary">
               Ficha técnica del servidor físico
             </Typography>
           </Box>
        </Box>

        <CardContent sx={{ px: 4, py:0}}> {/* CAMBIO: Padding interno reducido a 2 */}
          
          {/* USO DE CSS GRID */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}> {/* CAMBIO: Gap reducido de 3 a 2 */}

            {/* --- COLUMNA IZQUIERDA --- */}
            <Stack spacing={2}> {/* CAMBIO: Spacing reducido de 3 a 2 */}
              
              {/* CARD 1: INFORMACIÓN GENERAL */}
              <SectionCard
                icon={<GeneralIcon sx={{ fontSize: 16 }} />}
                title="Información General"
                bgcolor={theme.palette.primary.main}
              >
                <RowItem label="Nombre Host" value={servidor.nombre} />
                <RowItem label="Tipo Servidor" value={getNombreParametro(servidor.cod_tipo_servidor)} />
                <RowItem label="Cod. Inventario" value={getNombreParametro(servidor.cod_inventario_agetic)} />
                <RowItem label="Marca" value={servidor.marca} icon={<HardwareIcon fontSize="inherit"/>} />
                <RowItem label="Modelo" value={servidor.modelo} />
                <RowItem label="Serie" value={servidor.serie} />
                <RowItem 
                  label="Estado Operativo" 
                  isLast
                  value={
                    <Chip 
                      label={fmtEnum(servidor.estado_operativo)} 
                      size="small" 
                      variant={servidor.estado_operativo === 'OPERATIVO' ? 'filled' : 'outlined'}
                      color={servidor.estado_operativo === 'OPERATIVO' ? 'success' : 'error'}
                      sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem' }} // Chip más pequeño
                    />
                  } 
                />
              </SectionCard>

              {/* CARD 2: RECURSOS HARDWARE */}
              <SectionCard 
                icon={<MemoryIcon sx={{ fontSize: 16 }} />} 
                title="Recursos de Hardware" 
                bgcolor={theme.palette.secondary.main}
              >
                <RowItem label="Memoria RAM" value={servidor.ram ? `${servidor.ram} GB` : 'N/A'} icon={<MemoryIcon fontSize="inherit"/>} />
                <RowItem label="Almacenamiento" value={servidor.almacenamiento ? `${servidor.almacenamiento} GB` : 'N/A'} icon={<StorageIcon fontSize="inherit"/>} />
                <RowItem label="Sistema Operativo" value={servidor.sistema_operativo} icon={<OSIcon fontSize="inherit"/>} isLast />
              </SectionCard>

            </Stack>

            {/* --- COLUMNA DERECHA --- */}
            <Stack spacing={2}> {/* CAMBIO: Spacing reducido de 3 a 2 */}

              {/* CARD 3: UBICACIÓN Y RED */}
              <SectionCard
                icon={<LocationIcon sx={{ fontSize: 16 }} />}
                title="Ubicación y Red"
                bgcolor={theme.palette.info.main}
              >
                <RowItem label="IP Primaria" value={servidor.ip_primaria} icon={<NetworkIcon fontSize="inherit"/>} />
                <RowItem 
                  label="Data Center" 
                  value={servidor.data_centers?.nombre || 'No asignado'} 
                  icon={<DataCenterIcon fontSize="inherit"/>} 
                />
                <RowItem 
                  label="Cluster Asignado" 
                  value={nombreCluster} 
                  icon={<ClusterIcon fontSize="inherit"/>}
                  isLast 
                />
                <RowItem 
                  label="Servidor Padre" 
                  value={servidor.servidores_padre?.nombre || 'Ninguno (Físico)'} 
                  icon={<ServerIcon fontSize="inherit"/>} 
                />
              </SectionCard>

              {/* CARD 4: AUDITORÍA */}
              <SectionCard 
                  icon={<AuditIcon sx={{ fontSize: 16 }} />} 
                  title="Auditoría del Registro" 
                  bgcolor={theme.palette.warning.dark}
              >
                <RowItem
                  label="Estado Registro"
                  value={
                    <Chip
                      label={fmtEnum(servidor.estado)}
                      size="small"
                      color={servidor.estado === 'ACTIVO' ? 'success' : 'error'}
                      sx={{ height: 20, fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  }
                />
                <RowItem label="Fecha Creación" value={fmtDate(servidor.fecha_creacion)} icon={<EventIcon fontSize="inherit"/>} />
                <RowItem label="Creado por" value={getUserFullName(servidor.usuario_creacion)} icon={<PersonIcon fontSize="inherit"/>} />
                <RowItem label="Última Modificacion" value={fmtDate(servidor.fecha_modificacion)} icon={<UpdateIcon fontSize="inherit"/>} />
                <RowItem label="Modificado por" value={getUserFullName(servidor.usuario_modificacion)} icon={<PersonIcon fontSize="inherit"/>} isLast />
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
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, minHeight: 42 }} // Tabs un poco más compactos
        >
          <Tab sx={{ minHeight: 42, py: 0 }} label={<Stack direction="row" spacing={1} alignItems="center"><MachineIcon fontSize="small"/><span>VMs</span><Chip label={machines.length} size="small" sx={{height:18, fontSize:'0.7rem'}}/></Stack>} />
          <Tab sx={{ minHeight: 42, py: 0 }} label={<Stack direction="row" spacing={1} alignItems="center"><UpdateIcon fontSize="small"/><span>Despliegues</span><Chip label={deployments.length} size="small" sx={{height:18, fontSize:'0.7rem'}}/></Stack>} />
          <Tab sx={{ minHeight: 42, py: 0 }} label={<Stack direction="row" spacing={1} alignItems="center"><EventIcon fontSize="small"/><span>Eventos</span><Chip label={events.length} size="small" sx={{height:18, fontSize:'0.7rem'}}/></Stack>} />
        </Tabs>

        <Box sx={{ p: 2, minHeight: 200 }}>
          
          {/* TAB 0: VIRTUAL MACHINES */}
          {activeTab === 0 && (
            machines.length > 0 ? (
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
                    {machines.map((vm) => (
                      <TableRow key={vm.id} hover>
                        <TableCell>{vm.proxmox_vmid}</TableCell>
                        <TableCell>{vm.nombre}</TableCell>
                        <TableCell>{vm.ip}</TableCell>
                        <TableCell>{vm.ram} GB</TableCell>
                        <TableCell>{vm.cpu} cores</TableCell>
                        <TableCell>{vm.so}</TableCell>
                        <TableCell>
                          <Chip 
                            label={vm.estado_operativo} 
                            size="small" 
                            sx={{
                              bgcolor: vm?.estado_operativo === 'OPERATIVO' ? theme.palette.success.main : theme.palette.error.main,
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
            ) : <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No hay máquinas virtuales hosteadas.</Typography>
          )}

          {/* TAB 1: DESPLIEGUES */}
          {activeTab === 1 && (
            deployments.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell sx={{ fontWeight: 700 }}>Componente</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deployments.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell>{d.componentes?.nombre}</TableCell>
                        <TableCell>{fmtDate(d.fecha_despliegue)}</TableCell>
                        <TableCell><Chip label={d.estado_despliegue} size="small" sx={{ height: 20 }}/></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography align="center" color="text.secondary" sx={{ py: 4 }}>Sin despliegues.</Typography>
          )}

          {/* TAB 2: EVENTOS */}
          {activeTab === 2 && (
            events.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell sx={{ fontWeight: 700 }}>Evento</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((ev) => (
                      <TableRow key={ev.id} hover>
                        <TableCell>{ev.eventos?.cod_tipo_evento}</TableCell>
                        <TableCell>{fmtDate(ev.eventos?.fecha_evento)}</TableCell>
                        <TableCell><Chip label={ev.estado} size="small" sx={{ height: 20 }}/></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography align="center" color="text.secondary" sx={{ py: 4 }}>Sin eventos registrados.</Typography>
          )}

        </Box>
      </Card>
    </Box>
  )
}

export default Servidor