import React, { useMemo } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
// Eliminamos useQuery y gql ya que no se hacen consultas internas
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
  // Tabs, // Eliminado
  // Tab,  // Eliminado
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
  Hub as NodeIcon,
  Dns as ClusterIcon,
  Computer as MachineIcon,
  Storage as ServerIcon,
  ArrowBack as BackIcon,
  Info as GeneralIcon,
  History as AuditIcon,
  Category as TypeIcon,
  CheckCircle as StatusIcon,
  Settings as ConfigIcon,
  Layers as VmIcon, // Agregado icono para la sección de VMs
} from '@mui/icons-material'

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

const getUserFullName = (userObj) => {
  if (!userObj) return '-'
  const { nombres, primer_apellido, segundo_apellido } = userObj
  return `${nombres} ${primer_apellido} ${segundo_apellido || ''}`.trim()
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
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
        height: '100%' // Asegura que las tarjetas tengan la misma altura
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
 * CLUSTER NODO DETALLE
 * ----------------------- */
const ClusterNodo = ({ clusterNodo }) => {
  const theme = useTheme()
  // const [tab, setTab] = useState(0) // Estado de tabs eliminado

  // -- Data Processing --
  const isPhysicalNode = clusterNodo?.nodoTipo === 'FISICO'
  const isVirtualNode = clusterNodo?.nodoTipo === 'VIRTUAL'
  const hostedVms = clusterNodo?.servidor?.maquinas || []

  // Determinar Recurso Vinculado
  const recurso = useMemo(() => {
    if (isVirtualNode && clusterNodo.maquina) {
      return {
        tipo: 'Máquina Virtual',
        icon: <MachineIcon fontSize="inherit" />,
        nombre: clusterNodo.maquina.nombre,
        route: routes.maquina({ id: clusterNodo.maquina.id }),
      }
    }
    if (isPhysicalNode && clusterNodo.servidor) {
      return {
        tipo: 'Servidor Físico',
        icon: <ServerIcon fontSize="inherit" />,
        nombre: clusterNodo.servidor.nombre,
        route: routes.servidor({ id: clusterNodo.servidor.id }),
      }
    }
    return {
      tipo: 'No definido',
      icon: <GeneralIcon fontSize="inherit" />,
      nombre: 'No asignado',
      route: null,
    }
  }, [isVirtualNode, isPhysicalNode, clusterNodo])

  // const handleTabChange = (_, v) => setTab(v) // Handler eliminado

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
        {/* HEADER (DISEÑO ORIGINAL RESTAURADO) */}
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver a lista">
            <IconButton
              onClick={() => navigate(routes.clusterNodos())}
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
              background: 'linear-gradient(135deg, #e91e63, #f06292)',
            }}
          >
            <NodeIcon />
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight={800}>
              {clusterNodo.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Detalle del Nodo de Cluster
            </Typography>
          </Box>
        </Box>

        {/* CONTENIDO PRINCIPAL (ESTRUCTURA ORIGINAL RESTAURADA) */}
        <CardContent sx={{ px: 5, pb: 5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3, alignItems: 'start' }}>

            {/* IZQUIERDA: INFORMACIÓN GENERAL Y VINCULACIONES COMBINADAS */}
            <Stack spacing={2}>
              <SectionCard icon={<GeneralIcon />} title="Información General">
                <RowItem
                  label="Tipo de Nodo"
                  value={clusterNodo.nodoTipo}
                  icon={<TypeIcon />}
                />
                <RowItem
                  label="Rol"
                  value={clusterNodo.rolInfo?.nombre || clusterNodo.rol || 'No definido'}
                  icon={<ConfigIcon />}
                />
                {clusterNodo.identity_key && (
                  <RowItem
                    label="Identificador"
                    value={
                      <Tooltip title={clusterNodo.identity_key}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            bgcolor: 'action.hover',
                            px: 0.5,
                            borderRadius: 1,
                            display: 'inline-block',
                            maxWidth: '250px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {clusterNodo.identity_key}
                        </Typography>
                      </Tooltip>
                    }
                  />
                )}

                <RowItem label="Tipo Recurso" value={recurso.tipo} icon={recurso.icon} />
                <RowItem
                  label="Recurso Vinculado"
                  value={
                    recurso.route ? (
                      <Link
                        to={recurso.route}
                        style={{
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        {recurso.nombre}
                      </Link>
                    ) : (
                      recurso.nombre
                    )
                  }
                />
                <RowItem
                  label="Cluster Perteneciente"
                  icon={<ClusterIcon />}
                  isLast
                  value={
                    clusterNodo.cluster ? (
                      <Link
                        to={routes.cluster({ id: clusterNodo.cluster.id })}
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
                />
              </SectionCard>
            </Stack>

            {/* DERECHA: AUDITORÍA Y ESTADO */}
            <Stack spacing={2}>
              <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                <RowItem
                  label="Estado Actual"
                  value={
                    <Chip
                      label={clusterNodo.estado}
                      size="small"
                      color={clusterNodo.estado === 'ACTIVO' ? 'success' : 'error'}
                      icon={<StatusIcon fontSize="small" />}
                      sx={{
                        height: 20,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  }
                />
                <RowItem label="Fecha Creación" value={fmtDate(clusterNodo.fecha_creacion)} />
                <RowItem label="Creado por" value={getUserFullName(clusterNodo.creadoPor)} />
                <RowItem label="Última Modificación" value={fmtDate(clusterNodo.fecha_modificacion)} />
                <RowItem label="Modificado por" value={getUserFullName(clusterNodo.modificadoPor)} isLast />
              </SectionCard>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* --------- SECCIÓN DINÁMICA: VMS ALOJADAS (Solo si es Físico) --------- */}
      {/* Se eliminaron los tabs y se muestra esta sección condicionalmente */}
      {isPhysicalNode && (
        <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, mt: 3 }} elevation={0}>
          <CardHeader
            avatar={
               <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                  <VmIcon fontSize="small"/>
               </Avatar>
            }
            title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        Máquinas Virtuales Alojadas
                    </Typography>
                    <Chip label={hostedVms.length} size="small" color="secondary" sx={{ height: 20 }} />
                </Box>
            }
            sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 3, py: 1.5 }}
          />

          <CardContent sx={{ p: 0 }}>
            {hostedVms.length > 0 ? (
              <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'background.default' } }}>
                      <TableCell sx={{ pl: 3 }}>VMID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>Plataforma</TableCell>
                      <TableCell align="center">Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hostedVms.map((vm) => (
                      <TableRow key={vm.id} hover>
                        <TableCell sx={{ pl: 3, fontFamily: 'monospace' }}>{vm.proxmox_vmid || '-'}</TableCell>
                        <TableCell>
                          <Link
                            to={routes.maquina({ id: vm.id })}
                            style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}
                          >
                            {vm.nombre}
                          </Link>
                        </TableCell>
                        <TableCell>{vm.ip || '-'}</TableCell>
                        <TableCell>{vm.cod_plataforma}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={vm.estado_operativo || 'Desconocido'}
                            size="small"
                            variant="outlined"
                            color={vm.estado_operativo === 'RUNNING' ? 'success' : 'default'}
                            sx={{ height: 20, fontSize: '0.7rem', minWidth: 80 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">
                  No se detectaron máquinas virtuales alojadas en este servidor físico.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default ClusterNodo