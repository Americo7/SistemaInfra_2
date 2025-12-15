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
  useTheme,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material'

import {
  DeveloperBoard as InfraIcon,
  Event as EventIcon,
  Business as DataCenterIcon,
  Storage as ServerIcon,
  Computer as MachineIcon,
  History as AuditIcon,
  Info as GeneralIcon,
  ArrowBack as BackIcon,
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
const InfraAfectada = ({ infraAfectada }) => {
  const theme = useTheme()

  const evento = infraAfectada?.eventos
  const dataCenter = infraAfectada?.data_centers
  const servidor = infraAfectada?.servidores
  const maquina = infraAfectada?.maquinas

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '0 0 12px 12px', mb: 3, bgcolor: theme.palette.background.paper }}>
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver">
            <IconButton onClick={() => navigate(routes.infraAfectadas())} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`, color: theme.palette.primary.main, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Avatar sx={{ width: 42, height: 42, background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
            <InfraIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800}>Infraestructura Afectada #{infraAfectada.id}</Typography>
            <Typography variant="caption" color="text.secondary">Registro de infraestructura afectada por evento</Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: 5, pb: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start' }}>
            <Stack spacing={2}>
              <SectionCard icon={<GeneralIcon />} title="Infraestructura Afectada" bgcolor={theme.palette.primary.main}>
                <RowItem
                  label="Evento"
                  value={evento ? (
                    <Link to={routes.evento({ id: evento.id })} style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
                      {evento.cod_evento || `Evento #${evento.id}`}
                    </Link>
                  ) : '-'}
                  icon={<EventIcon />}
                />
                <RowItem
                  label="Data Center"
                  value={dataCenter ? (
                    <Link to={routes.dataCenter({ id: dataCenter.id })} style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
                      {dataCenter.nombre}
                    </Link>
                  ) : 'No asignado'}
                  icon={<DataCenterIcon />}
                />
                <RowItem
                  label="Servidor"
                  value={servidor ? (
                    <Link to={routes.servidor({ id: servidor.id })} style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
                      {servidor.nombre}
                    </Link>
                  ) : 'No asignado'}
                  icon={<ServerIcon />}
                />
                <RowItem
                  label="Máquina"
                  value={maquina ? (
                    <Link to={routes.maquina({ id: maquina.id })} style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
                      {maquina.nombre}
                    </Link>
                  ) : 'No asignada'}
                  icon={<MachineIcon />}
                  isLast
                />
              </SectionCard>
            </Stack>

            <Stack spacing={2}>
              <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                <RowItem label="Estado" value={<Chip label={infraAfectada.estado} size="small" color={getStatusColor(infraAfectada.estado)} sx={{ height: 20, fontWeight: 700, fontSize: '0.75rem' }} />} />
                <RowItem label="Fecha Creación" value={fmtDate(infraAfectada.fecha_creacion)} />
                <RowItem label="Creado por" value={formatUserName(infraAfectada.creadoPor)} />
                <RowItem label="Última Modificación" value={fmtDate(infraAfectada.fecha_modificacion)} />
                <RowItem label="Modificado por" value={formatUserName(infraAfectada.modificadoPor)} isLast />
              </SectionCard>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default InfraAfectada
