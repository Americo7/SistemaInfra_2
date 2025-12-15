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
  alpha,
} from '@mui/material'

import {
  Cloud as CloudIcon,
  Dns as ClusterIcon,
  History as AuditIcon,
  Info as GeneralIcon,
  ArrowBack as BackIcon,
  Security as SecurityIcon,
} from '@mui/icons-material'

/* HELPERS GLOBALES */
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

const getStatusColor = (codigo) => {
  if (!codigo) return 'default'
  const c = String(codigo).toUpperCase()
  const map = {
    OPERATIVO: 'success', ACTIVO: 'success', EXITOSO: 'success',
    FUERA_SERVICIO: 'error', INACTIVO: 'error',
    MANTENIMIENTO: 'warning', PENDIENTE: 'warning',
  }
  return map[c] || 'default'
}

/* SUB-COMPONENTES */
const RowItem = ({ label, value, icon, isLast }) => {
  const theme = useTheme()
  const displayValue = (value === null || value === undefined || value === '') ? '-' : value;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', py: 0.75, borderBottom: isLast ? 'none' : '1px solid', borderColor: theme.palette.divider, '&:hover': { bgcolor: 'action.hover' } }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: '40%', pr: 2, display: 'flex', alignItems: 'center' }}>
        {icon && <Box sx={{ mr: 1, display: 'flex', color: 'action.active' }}>{icon}</Box>}
        {label}
      </Typography>
      <Box sx={{ width: '60%', display: 'flex', alignItems: 'center' }}>
        {React.isValidElement(displayValue) ? displayValue : (
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{displayValue}</Typography>
        )}
      </Box>
    </Box>
  )
}

const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  return (
    <Card sx={{ borderRadius: 2, borderTop: `3px solid ${bgcolor || theme.palette.primary.main}`, bgcolor: theme.palette.background.paper }}>
      <CardHeader avatar={<Avatar sx={{ bgcolor: bgcolor || theme.palette.primary.main, width: 32, height: 32 }}>{icon}</Avatar>} title={<Typography sx={{ fontWeight: 700 }}>{title}</Typography>} sx={{ py: 1, px: 2, borderBottom: `1px solid ${theme.palette.divider}` }} />
      <CardContent sx={{ p: 1.5 }}>{children}</CardContent>
    </Card>
  )
}

/* COMPONENTE PRINCIPAL */
const ProxmoxEndpoint = ({ proxmoxEndpoint }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)
  const clusters = proxmoxEndpoint?.clusters || []
  const handleTabChange = (_, v) => setTab(v)

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '0 0 12px 12px', mb: 3, bgcolor: theme.palette.background.paper }}>
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver">
            <IconButton onClick={() => navigate(routes.proxmoxEndpoints())} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`, color: theme.palette.primary.main, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Avatar sx={{ width: 42, height: 42, background: 'linear-gradient(135deg, #f5af19, #f12711)' }}>
            <CloudIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800}>{proxmoxEndpoint.nombre}</Typography>
            <Typography variant="caption" color="text.secondary">Proxmox Endpoint</Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: 5, pb: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start' }}>
            <Stack spacing={2}>
              <SectionCard icon={<GeneralIcon />} title="Conexión" bgcolor={theme.palette.primary.main}>
                <RowItem label="Nombre" value={proxmoxEndpoint.nombre} />
                <RowItem label="Dominio" value={proxmoxEndpoint.dominio} />
                <RowItem label="IP" value={proxmoxEndpoint.ip} />
                <RowItem label="Puerto" value={proxmoxEndpoint.puerto} />
                <RowItem label="SSL" value={proxmoxEndpoint.ssl ? 'Sí' : 'No'} />
                <RowItem label="Usuario" value={proxmoxEndpoint.usuario} isLast />
              </SectionCard>

              <SectionCard icon={<SecurityIcon />} title="Seguridad" bgcolor={theme.palette.error.main}>
                <RowItem label="Token ID" value={proxmoxEndpoint.token_id} />
                <RowItem label="Token Secret" value="●●●●●●●●" />
                <RowItem label="Última Sync" value={fmtDate(proxmoxEndpoint.fecha_ultima_sync)} isLast />
              </SectionCard>
            </Stack>

            <Stack spacing={2}>
              <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                <RowItem label="Estado" value={<Chip label={proxmoxEndpoint.estado} size="small" color={getStatusColor(proxmoxEndpoint.estado)} sx={{ height: 20, fontWeight: 700, fontSize: '0.75rem' }} />} />
                <RowItem label="Fecha Creación" value={fmtDate(proxmoxEndpoint.fecha_creacion)} />
                <RowItem label="Creado por" value={formatUserName(proxmoxEndpoint.creadoPor)} />
                <RowItem label="Última Modificación" value={fmtDate(proxmoxEndpoint.fecha_modificacion)} />
                <RowItem label="Modificado por" value={formatUserName(proxmoxEndpoint.modificadoPor)} isLast />
              </SectionCard>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, mt: 3, bgcolor: theme.palette.background.paper }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 2 }}>
          <Tab label={<Stack direction="row" spacing={1}><ClusterIcon fontSize="small" /><span>Clusters</span><Chip label={clusters.length} size="small" /></Stack>} />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            clusters.length ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clusters.map((c) => (
                      <TableRow key={c.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Link to={routes.cluster({ id: c.id })} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>{c.nombre}</Link>
                        </TableCell>
                        <TableCell>{c.cod_tipo_cluster}</TableCell>
                        <TableCell><Chip label={c.estado} size="small" color={getStatusColor(c.estado)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No hay clusters asociados.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default ProxmoxEndpoint
