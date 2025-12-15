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
  Person as UserIcon,
  Badge as RoleIcon,
  Apps as SystemIcon,
  Computer as MachineIcon,
  History as AuditIcon,
  Info as GeneralIcon,
  ArrowBack as BackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Fingerprint as DocumentIcon,
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
const Usuario = ({ usuario }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  const usuarioRoles = usuario?.usuario_roles || []

  const handleTabChange = (_, v) => setTab(v)

  // Extraer roles, sistemas y máquinas únicos
  const rolesUnicos = useMemo(() => {
    const map = new Map()
    usuarioRoles.forEach(ur => {
      if (ur.roles && !map.has(ur.roles.id)) {
        map.set(ur.roles.id, ur.roles)
      }
    })
    return [...map.values()]
  }, [usuarioRoles])

  const sistemasUnicos = useMemo(() => {
    const map = new Map()
    usuarioRoles.forEach(ur => {
      if (ur.sistemas && !map.has(ur.sistemas.id)) {
        map.set(ur.sistemas.id, ur.sistemas)
      }
    })
    return [...map.values()]
  }, [usuarioRoles])

  const maquinasUnicas = useMemo(() => {
    const map = new Map()
    usuarioRoles.forEach(ur => {
      if (ur.maquinas && !map.has(ur.maquinas.id)) {
        map.set(ur.maquinas.id, ur.maquinas)
      }
    })
    return [...map.values()]
  }, [usuarioRoles])

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '0 0 12px 12px', mb: 3, bgcolor: theme.palette.background.paper }}>
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver">
            <IconButton onClick={() => navigate(routes.usuarios())} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`, color: theme.palette.primary.main, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Avatar sx={{ width: 42, height: 42, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
            <UserIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800}>{formatUserName(usuario)}</Typography>
            <Typography variant="caption" color="text.secondary">Usuario del sistema</Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: 5, pb: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start' }}>
            <Stack spacing={2}>
              <SectionCard icon={<GeneralIcon />} title="Información Personal" bgcolor={theme.palette.primary.main}>
                <RowItem label="Nombre Usuario" value={usuario.nombre_usuario} />
                <RowItem label="Nombres" value={usuario.nombres} />
                <RowItem label="Primer Apellido" value={usuario.primer_apellido} />
                <RowItem label="Segundo Apellido" value={usuario.segundo_apellido} />
                <RowItem label="Nro. Documento" value={usuario.nro_documento} icon={<DocumentIcon />} />
                <RowItem label="Email" value={usuario.email} icon={<EmailIcon />} />
                <RowItem label="Celular" value={usuario.celular} icon={<PhoneIcon />} isLast />
              </SectionCard>
            </Stack>

            <Stack spacing={2}>
              <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                <RowItem label="Estado" value={<Chip label={usuario.estado} size="small" color={getStatusColor(usuario.estado)} sx={{ height: 20, fontWeight: 700, fontSize: '0.75rem' }} />} />
                <RowItem label="Fecha Creación" value={fmtDate(usuario.fecha_creacion)} />
                <RowItem label="Creado por" value={formatUserName(usuario.creadoPor)} />
                <RowItem label="Última Modificación" value={fmtDate(usuario.fecha_modificacion)} />
                <RowItem label="Modificado por" value={formatUserName(usuario.modificadoPor)} isLast />
              </SectionCard>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, mt: 3, bgcolor: theme.palette.background.paper }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 2 }}>
          <Tab label={<Stack direction="row" spacing={1}><RoleIcon fontSize="small" /><span>Roles</span><Chip label={rolesUnicos.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><SystemIcon fontSize="small" /><span>Sistemas</span><Chip label={sistemasUnicos.length} size="small" /></Stack>} />
          <Tab label={<Stack direction="row" spacing={1}><MachineIcon fontSize="small" /><span>Máquinas</span><Chip label={maquinasUnicas.length} size="small" /></Stack>} />
        </Tabs>

        <CardContent>
          {tab === 0 && (
            rolesUnicos.length ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rolesUnicos.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Link to={routes.role({ id: r.id })} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>{r.nombre}</Link>
                        </TableCell>
                        <TableCell>{r.cod_tipo_rol}</TableCell>
                        <TableCell>{r.descripcion}</TableCell>
                        <TableCell><Chip label={r.estado} size="small" color={getStatusColor(r.estado)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No hay roles asignados.</Typography>
          )}

          {tab === 1 && (
            sistemasUnicos.length ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell>Sigla</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sistemasUnicos.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Link to={routes.sistema({ id: s.id })} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>{s.sigla}</Link>
                        </TableCell>
                        <TableCell>{s.nombre}</TableCell>
                        <TableCell>{s.descripcion}</TableCell>
                        <TableCell><Chip label={s.estado} size="small" color={getStatusColor(s.estado)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No hay sistemas asociados.</Typography>
          )}

          {tab === 2 && (
            maquinasUnicas.length ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>SO</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maquinasUnicas.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Link to={routes.maquina({ id: m.id })} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>{m.nombre}</Link>
                        </TableCell>
                        <TableCell>{m.ip}</TableCell>
                        <TableCell>{m.so}</TableCell>
                        <TableCell><Chip label={m.estado} size="small" color={getStatusColor(m.estado)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No hay máquinas asignadas.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Usuario