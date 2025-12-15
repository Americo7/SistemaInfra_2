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
  Shield as RoleIcon,
  People as UsersIcon,
  History as AuditIcon,
  Info as GeneralIcon,
  ArrowBack as BackIcon,
  Email as EmailIcon,
} from '@mui/icons-material'

/* -----------------------
 * HELPERS GLOBALES
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
    OPERATIVO: 'success', ACTIVO: 'success', EXITOSO: 'success', REALIZADO: 'success',
    FUERA_SERVICIO: 'error', FUERA_DE_SERVICIO: 'error', INACTIVO: 'error', FALLIDO: 'error', CRITICO: 'error', BAJA: 'error',
    MANTENIMIENTO: 'warning', PENDIENTE: 'warning', INICIADO: 'warning', EN_PROGRESO: 'warning',
    PROCESO: 'info', CREADO: 'info'
  }
  return map[c] || 'default'
}

/* -----------------------
 * SUB-COMPONENTES UI
 * ----------------------- */
const RowItem = ({ label, value, icon, isLast }) => {
  const theme = useTheme()
  const displayValue = (value === null || value === undefined || value === '') ? '-' : value;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 0.75,
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: theme.palette.divider,
        transition: 'background-color 0.2s',
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
        {React.isValidElement(displayValue) ? displayValue : (
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {displayValue}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  return (
    <Card
      sx={{
        borderRadius: 2,
        borderTop: `3px solid ${bgcolor || theme.palette.primary.main}`,
        bgcolor: theme.palette.background.paper,
        height: 'auto'
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
 * COMPONENTE PRINCIPAL
 * ----------------------- */
const Role = ({ role }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  // Datos básicos
  const usuarioRoles = role?.usuario_roles || []

  const handleTabChange = (_, v) => setTab(v)

  // Usuarios únicos
  const usuariosUnicos = useMemo(() => {
    const map = new Map()
    usuarioRoles.forEach(ur => {
      if (ur.usuarios && !map.has(ur.usuarios.id)) {
        map.set(ur.usuarios.id, ur.usuarios)
      }
    })
    return [...map.values()]
  }, [usuarioRoles])

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      {/* HEADER CARD */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '0 0 12px 12px',
          mb: 3,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver">
            <IconButton
              onClick={() => navigate(routes.roles())}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 42,
              height: 42,
              background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            }}
          >
            <RoleIcon />
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight={800}>
              {role.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Rol del sistema
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: 5, pb: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start' }}>

            {/* --- COLUMNA IZQUIERDA --- */}
            <Stack spacing={2}>
              {/* 1. INFORMACIÓN GENERAL */}
              <SectionCard icon={<GeneralIcon />} title="Información General" bgcolor={theme.palette.primary.main}>
                <RowItem label="Nombre" value={role.nombre} />
                <RowItem label="Tipo de Rol" value={role.cod_tipo_rol} />
                <RowItem label="Descripción" value={role.descripcion} />
                <RowItem
                  label="Estado Registro"
                  isLast
                  value={
                    <Chip
                      label={role.estado}
                      size="small"
                      color={getStatusColor(role.estado)}
                      sx={{ height: 20, fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  }
                />
              </SectionCard>
            </Stack>

            {/* --- COLUMNA DERECHA --- */}
            <Stack spacing={2}>
              {/* 1. AUDITORÍA */}
              <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                <RowItem label="Fecha Creación" value={fmtDate(role.fecha_creacion)} />
                <RowItem label="Creado por" value={formatUserName(role.creadoPor)} />
                <RowItem label="Última Modificación" value={fmtDate(role.fecha_modificacion)} />
                <RowItem label="Modificado por" value={formatUserName(role.modificadoPor)} isLast />
              </SectionCard>
            </Stack>

          </Box>
        </CardContent>
      </Card>

      {/* TABS INFERIORES */}
      <Card sx={{ borderRadius: 2, mt: 3, bgcolor: theme.palette.background.paper }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 2 }}
        >
          <Tab label={<Stack direction="row" spacing={1}><UsersIcon fontSize="small" /><span>Usuarios Asignados</span><Chip label={usuariosUnicos.length} size="small" /></Stack>} />
        </Tabs>

        <CardContent>
          {/* TAB 0: USUARIOS */}
          {tab === 0 && (
            usuariosUnicos.length ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell>Nombre Completo</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosUnicos.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Link to={routes.usuario({ id: u.id })} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                            {formatUserName(u)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">{u.email}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell><Chip label={u.estado} size="small" color={getStatusColor(u.estado)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No hay usuarios con este rol asignado.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Role
