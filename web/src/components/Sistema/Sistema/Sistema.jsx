import React, { useState, useMemo } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { toast } from '@redwoodjs/web/toast'

// Importar funciones de exportación
import { generatePDF } from 'src/lib/exporter/sistemaDetalleExporter'

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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  alpha,
} from '@mui/material'

import {
  Dns as SystemIcon,
  DeveloperBoard as ComponentIcon,
  People as UsersIcon,
  Cloud as DeployIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  ArrowBack as BackIcon,
  Info as GeneralIcon,
  History as AuditIcon,
  Business as EntityIcon,
  VpnKey as KeyIcon,
  Description as DescIcon,
  OpenInNew as OpenInNewIcon,
  Label as TagIcon,
  Computer as VmIcon,
  Dns as ServerIcon,
  Hub as ClusterIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Code as CodeIcon,
  AccountTree as BranchIcon,
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

const fmtEnum = (val) => (val ? String(val).toUpperCase() : '')

// Helper para obtener nombre completo de un objeto usuario (creadoPor/modificadoPor)
const formatUserObj = (userObj) => {
  if (!userObj) return '-'
  const { nombres, primer_apellido, segundo_apellido } = userObj
  return `${nombres || ''} ${primer_apellido || ''} ${segundo_apellido || ''}`.trim()
}

// Helper para el Color del Estado
const getStatusColor = (codigo) => {
  const c = codigo?.toUpperCase() || 'UNKNOWN'
  const map = {
    ACTIVO: 'success',
    EXITOSO: 'success',
    OPERATIVO: 'success',
    FINALIZADO: 'success',
    FALLIDO: 'error',
    ERROR: 'error',
    INACTIVO: 'default',
    PENDIENTE: 'warning',
    INICIADO: 'warning',
    MANTENIMIENTO: 'warning',
    UNKNOWN: 'default',
  }
  return map[c] || 'default'
}

// Helper para la Variante del Estado (Relleno vs Líneas)
const getStatusVariant = (codigo) => {
  const c = codigo?.toUpperCase() || ''
  if (c === 'ACTIVO' || c === 'INACTIVO') {
    return 'outlined'
  }
  return 'filled'
}

// Helper para el Color del Entorno
const getEntornoColor = (codigo) => {
  const c = codigo?.toUpperCase() || ''
  if (c === 'PROD' || c === 'PRODUCCION') return 'success'
  if (c === 'PREPROD' || c === 'PRE_PROD' || c === 'STAGING') return 'warning'
  if (c === 'DEMO' || c === 'DEV' || c === 'QA' || c === 'TEST') return 'info'
  return 'default'
}

/* Lógica de Prioridad de Cluster: K8s > Proxmox > Físico */
const resolveClusterInfo = (recurso, tipoRecurso) => {
  if (!recurso) return { nombre: '-', tipo: 'NONE' }

  // 1. Buscamos Cluster de Orquestación (K8s) en cluster_nodos (Directo en la VM o Server)
  const nodosK8s = Array.isArray(recurso.cluster_nodos) ? recurso.cluster_nodos : []
  const k8sNode = nodosK8s.find((n) => n.cluster)

  if (k8sNode) {
    return {
      nombre: k8sNode.cluster.nombre,
      tipo: k8sNode.cluster.tipoClusterInfo?.nombre || 'Orquestación',
      color: 'primary',
    }
  }

  // 2. Si es VM, buscamos el Host de Virtualización (Proxmox) -> Servidores -> Cluster
  if (tipoRecurso === 'VM') {
    const host = recurso.servidores
    if (host) {
      const hostNodos = Array.isArray(host.cluster_nodos) ? host.cluster_nodos : []
      const hostNode = hostNodos.find((n) => n.cluster)

      if (hostNode) {
        return {
          nombre: hostNode.cluster.nombre,
          tipo: hostNode.cluster.tipoClusterInfo?.nombre || 'Virtualización',
          color: 'secondary',
        }
      }
    }
  }

  return { nombre: '-', tipo: '-', color: 'default' }
}

/* -----------------------
 * SUB-COMPONENTES
 * ----------------------- */
const RowItem = ({ label, value, icon, isLast, multiline }) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        display: multiline ? 'block' : 'flex',
        alignItems: multiline ? 'flex-start' : 'center',
        py: 0.75,
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: theme.palette.divider,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ width: multiline ? '100%' : '40%', pr: 2, display: 'flex', alignItems: 'center' }}
      >
        {icon && <Box sx={{ mr: 1, display: 'flex', color: 'action.active' }}>{icon}</Box>}
        {label}
      </Typography>
      <Box sx={{ width: multiline ? '100%' : '60%', display: 'flex', alignItems: 'center' }}>
        {React.isValidElement(value) ? (
          value
        ) : (
          <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: multiline ? 'pre-wrap' : 'normal' }}>
            {value || '-'}
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
        height: '100%',
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
const Sistema = ({ sistema }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  // Estados para PDF
  const [pdfData, setPdfData] = useState(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // -- Procesamiento de Datos (Memo) --

  // 1. Historial de Despliegues (Aplanado desde Componentes)
  const historialDespliegues = useMemo(() => {
    const lista = []
    const compsRaw = sistema.componentes
    const comps = Array.isArray(compsRaw) ? compsRaw : compsRaw ? [compsRaw] : []

    comps.forEach((comp) => {
      const despliegues = Array.isArray(comp.despliegue) ? comp.despliegue : []

      despliegues.forEach((d) => {
        const targets = []
        // Mapear VMs
        if (d.maquinas && Array.isArray(d.maquinas)) {
             d.maquinas.forEach(m => targets.push({ ...m, type: 'VM' }))
        } else if (d.maquinas) { // Por si viene como objeto único
             targets.push({ ...d.maquinas, type: 'VM' })
        }

        // Mapear Servidores (Bare Metal)
        if (d.servidores && Array.isArray(d.servidores)) {
             d.servidores.forEach(s => targets.push({ ...s, type: 'SRV' }))
        } else if (d.servidores) {
             targets.push({ ...d.servidores, type: 'SRV' })
        }

        if (targets.length === 0) {
          lista.push({
            id: `d-${d.id}-none`,
            fecha: d.fecha_despliegue,
            compNombre: comp.nombre,
            dominio: comp.dominio,
            entorno: comp.entornoInfo?.codigo || '-',
            estado: d.estadoDespliegueInfo?.nombre || d.estado_despliegue,
            estadoCodigo: d.estadoDespliegueInfo?.codigo || d.estado_despliegue, // Para color
            destino: null,
            ip: '-',
          })
        } else {
          targets.forEach((t) => {
            const clusterData = resolveClusterInfo(t, t.type)
            const ipAddress = t.type === 'VM' ? t.ip || '-' : t.ip_primaria || '-'
            lista.push({
              id: `d-${d.id}-${t.type}-${t.id}`,
              fecha: d.fecha_despliegue,
              compNombre: comp.nombre,
              dominio: comp.dominio,
              entorno: comp.entornoInfo?.codigo || '-',
              estado: d.estadoDespliegueInfo?.nombre || d.estado_despliegue,
              estadoCodigo: d.estadoDespliegueInfo?.codigo || d.estado_despliegue,
              ip: ipAddress,
              destino: {
                id: t.id,
                nombre: t.nombre,
                tipo: t.type,
                cluster: clusterData,
              },
            })
          })
        }
      })
    })
    // Ordenar por fecha descendente
    return lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [sistema])

  // -- Handlers --
  const handleTabChange = (_, v) => setTab(v)

  const generatePDFHandler = async () => {
    setGeneratingPdf(true)
    try {
      const pdfDataUri = await generatePDF(sistema)
      setPdfData(pdfDataUri)
      setPreviewOpen(true)
    } catch (error) {
      toast.error('Error al generar el PDF: ' + error.message)
    } finally {
      setGeneratingPdf(false)
    }
  }

  const downloadPDF = () => {
    if (!pdfData) return
    const link = document.createElement('a')
    link.href = pdfData
    link.download = `Sistema_${sistema.codigo || sistema.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const safeUsuarios = Array.isArray(sistema.usuario_roles) ? sistema.usuario_roles : []
  const safeComponentes = Array.isArray(sistema.componentes)
    ? sistema.componentes
    : sistema.componentes
    ? [sistema.componentes]
    : []

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
              onClick={() => navigate(routes.sistemas())}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 42,
              height: 42,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            }}
          >
            <SystemIcon />
          </Avatar>

          <Box>
            <Typography variant="h6" fontWeight={800}>
              {sistema.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ficha técnica del sistema
            </Typography>
          </Box>

          <Box sx={{ ml: 'auto' }}>
            <Button
              variant="contained"
              size="small"
              disableElevation
              startIcon={generatingPdf ? <CircularProgress size={16} color="inherit" /> : <PdfIcon />}
              onClick={generatePDFHandler}
              disabled={generatingPdf}
              sx={{ fontWeight: 700 }}
            >
              Reporte
            </Button>
          </Box>
        </Box>

        <CardContent sx={{ px: 5, pb: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* COLUMNA IZQUIERDA */}
            <Stack spacing={2}>
              <SectionCard icon={<GeneralIcon />} title="Información General" bgcolor={theme.palette.primary.main}>
                <RowItem
                  label="Entidad"
                  icon={<EntityIcon fontSize="small" />}
                  value={
                    sistema.entidades ? (
                      // AQUÍ SE AGREGA TYPOGRAPHY body2 PARA IGUALAR AL RESTO DE CAMPOS
                      <Typography variant="body2" fontWeight={600}>
                        <Link
                          to={routes.entidad({ id: sistema.entidades.id })}
                          style={{ color: theme.palette.primary.main, textDecoration: 'none' }}
                        >
                          {sistema.entidades.nombre}
                        </Link>
                      </Typography>
                    ) : (
                      'No asignada'
                    )
                  }
                />
                <RowItem label="Código" value={sistema.codigo} icon={<KeyIcon fontSize="small" />} />
                <RowItem label="Sigla" value={sistema.sigla} icon={<TagIcon fontSize="small" />} />
                <RowItem label="RA Creación" value={sistema.ra_creacion} />
                <RowItem
                  label="Descripción"
                  isLast
                  multiline
                  icon={<DescIcon fontSize="small" />}
                  value={sistema.descripcion}
                />
              </SectionCard>
            </Stack>

            {/* COLUMNA DERECHA */}
            <Stack spacing={2}>
              <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                <RowItem
                  label="Estado Registro"
                  value={
                    <Chip
                      label={fmtEnum(sistema.estado)}
                      size="small"
                      color={getStatusColor(sistema.estado)}
                      variant={getStatusVariant(sistema.estado)}
                      sx={{ height: 20, fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  }
                />
                <RowItem label="Fecha Creación" value={fmtDate(sistema.fecha_creacion)} />
                <RowItem label="Creado por" value={formatUserObj(sistema.creadoPor)} />
                <RowItem label="Última Modificación" value={fmtDate(sistema.fecha_modificacion)} />
                <RowItem label="Modificado por" value={formatUserObj(sistema.modificadoPor)} isLast />
              </SectionCard>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* --------- TABS INFERIORES --------- */}
      <Card sx={{ borderRadius: 2, mt: 3, bgcolor: theme.palette.background.paper }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab
            label={
              <Stack direction="row" spacing={1}>
                <ComponentIcon fontSize="small" />
                Componentes
                <Chip label={safeComponentes.length} size="small" />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1}>
                <DeployIcon fontSize="small" />
                Despliegues
                <Chip label={historialDespliegues.length} size="small" />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1}>
                <UsersIcon fontSize="small" />
                Usuarios
                <Chip label={safeUsuarios.length} size="small" />
              </Stack>
            }
          />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          {/* TAB 0: COMPONENTES */}
          {tab === 0 && (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Dominio</TableCell>
                    <TableCell>Entorno</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>GitLab Repo</TableCell>
                    <TableCell>Rama</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeComponentes.length > 0 ? (
                    safeComponentes.map((c) => (
                      <TableRow key={c.id} hover>
                        {/* Nombre */}
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Link
                            to={routes.componente({ id: c.id })}
                            style={{ color: theme.palette.primary.main, textDecoration: 'none' }}
                          >
                            {c.nombre}
                          </Link>
                        </TableCell>

                        {/* Dominio */}
                        <TableCell>
                          {c.dominio ? (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <a
                                href={`https://${c.dominio}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'inherit', textDecoration: 'none' }}
                              >
                                {c.dominio}
                              </a>
                              <OpenInNewIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            </Stack>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        {/* Entorno - CON COLOR */}
                        <TableCell>
                          {c.entornoInfo ? (
                            <Chip
                              label={c.entornoInfo.nombre || c.entornoInfo.codigo}
                              size="small"
                              variant="outlined"
                              color={getEntornoColor(c.entornoInfo.codigo)}
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        {/* Categoría */}
                        <TableCell>
                          {c.categoriaInfo ? <Typography variant="body2">{c.categoriaInfo.nombre}</Typography> : '-'}
                        </TableCell>

                        {/* GitLab Repo */}
                        <TableCell>
                          {c.gitlab_repo ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <CodeIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                {c.gitlab_repo}
                              </Typography>
                            </Stack>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        {/* Rama */}
                        <TableCell>
                          {c.gitlab_rama ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <BranchIcon fontSize="small" sx={{ fontSize: 14, color: 'text.disabled' }} />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                              >
                                {c.gitlab_rama}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>

                        {/* Estado */}
                        <TableCell>
                          <Chip
                            label={c.estado}
                            size="small"
                            color={getStatusColor(c.estado)}
                            variant={getStatusVariant(c.estado)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No hay componentes registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 1: DESPLIEGUES */}
          {tab === 1 && (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                  <TableRow>
                    <TableCell>Componente</TableCell>
                    <TableCell>Dominio</TableCell>
                    <TableCell>Entorno</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Destino (IP)</TableCell>
                    <TableCell>Cluster</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historialDespliegues.length > 0 ? (
                    historialDespliegues.map((d) => (
                      <TableRow key={d.id} hover>
                        {/* Componente */}
                        <TableCell sx={{ fontWeight: 500 }}>{d.compNombre}</TableCell>

                        {/* Dominio */}
                        <TableCell>
                          {d.dominio ? (
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              {d.dominio}
                            </Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        {/* Entorno - CON COLOR */}
                        <TableCell>
                          <Chip
                            label={d.entorno}
                            size="small"
                            variant="outlined"
                            color={getEntornoColor(d.entorno)}
                          />
                        </TableCell>

                        {/* Fecha */}
                        <TableCell>{fmtDate(d.fecha)}</TableCell>

                        {/* Destino + IP */}
                        <TableCell>
                          {d.destino ? (
                            <Stack>
                              <Stack direction="row" alignItems="center" gap={1}>
                                {d.destino.tipo === 'VM' ? (
                                  <VmIcon fontSize="small" color="action" />
                                ) : (
                                  <ServerIcon fontSize="small" color="action" />
                                )}
                                <Typography variant="body2" fontWeight={600}>
                                  {d.destino.nombre}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                                {d.ip !== '-' ? `IP: ${d.ip}` : 'Sin IP'}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Sin destino
                            </Typography>
                          )}
                        </TableCell>

                        {/* Cluster */}
                        <TableCell>
                          {d.destino && d.destino.cluster.nombre !== '-' ? (
                            <Stack direction="row" alignItems="center" gap={1}>
                              <ClusterIcon fontSize="small" color={d.destino.cluster.color} />
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {d.destino.cluster.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {d.destino.cluster.tipo}
                                </Typography>
                              </Box>
                            </Stack>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        {/* Estado */}
                        <TableCell>
                          <Chip
                            label={d.estado}
                            size="small"
                            color={getStatusColor(d.estadoCodigo)}
                            variant={getStatusVariant(d.estadoCodigo)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No hay historial de despliegues.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 2: USUARIOS */}
          {tab === 2 && (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                  <TableRow>
                    <TableCell>Cuenta</TableCell>
                    <TableCell>Nombre Completo</TableCell>
                    <TableCell>Documento</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Celular</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeUsuarios.length > 0 ? (
                    safeUsuarios.map((ur) => (
                      <TableRow key={ur.id} hover>
                        {/* Cuenta */}
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon fontSize="small" color="action" />
                            <Link
                              to={routes.usuario({ id: ur.usuarios.id })}
                              style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}
                            >
                              {ur.usuarios.nombre_usuario || 'Sin usuario'}
                            </Link>
                          </Stack>
                        </TableCell>

                        {/* Nombre Completo */}
                        <TableCell sx={{ fontWeight: 500 }}>
                          {ur.usuarios.nombres} {ur.usuarios.primer_apellido} {ur.usuarios.segundo_apellido}
                        </TableCell>

                        {/* Documento */}
                        <TableCell>
                          {ur.usuarios.nro_documento ? (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <BadgeIcon fontSize="small" sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{ur.usuarios.nro_documento}</Typography>
                            </Stack>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        {/* Email */}
                        <TableCell>
                          {ur.usuarios.email ? (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <EmailIcon fontSize="small" sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="body2">{ur.usuarios.email}</Typography>
                            </Stack>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        {/* Celular */}
                        <TableCell>
                          {ur.usuarios.celular ? (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <PhoneIcon fontSize="small" sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="body2">{ur.usuarios.celular}</Typography>
                            </Stack>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        {/* Rol */}
                        <TableCell>
                          <Chip label={ur.roles?.nombre} size="small" variant="outlined" color="primary" />
                        </TableCell>

                        {/* Estado */}
                        <TableCell>
                          <Chip
                            label={ur.usuarios.estado}
                            size="small"
                            color={getStatusColor(ur.usuarios.estado)}
                            variant={getStatusVariant(ur.usuarios.estado)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No hay usuarios asignados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* DIALOGO PDF */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { minHeight: '80vh' } }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>
              Vista previa del Reporte
            </Typography>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={downloadPDF}>
              Descargar
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5' }}>
          {pdfData && (
            <iframe
              src={pdfData}
              width="100%"
              height="100%"
              style={{ border: 'none', minHeight: '60vh', display: 'block' }}
              title="Vista previa del PDF"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Sistema