import React, { useState, useMemo } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { useQuery, gql } from '@redwoodjs/web'
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
} from '@mui/material'

import {
  Dns as SystemIcon,
  DeveloperBoard as ComponentIcon,
  People as UsersIcon,
  Cloud as DeployIcon,
  Computer as MachineIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  ArrowBack as BackIcon,
  Info as GeneralIcon,
  History as AuditIcon,
  Business as EntityIcon,
  VpnKey as KeyIcon,
  Description as DescIcon,
  CalendarToday as DateIcon,
  OpenInNew as OpenInNewIcon,
  Label as TagIcon,
} from '@mui/icons-material'

/* -----------------------
 * CONSULTAS (QUERIES)
 * ----------------------- */
const GET_USUARIOS_QUERY = gql`
  query UsuariosLookupForSistema {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(d)
  }
}

const fmtEnum = (val) => (val ? String(val).toUpperCase() : '')

const uniqueById = (arr = []) => {
  const map = new Map()
  arr.forEach((it) => {
    if (it?.id != null && !map.has(it.id)) map.set(it.id, it)
  })
  return Array.from(map.values())
}

/* -----------------------
 * SUB-COMPONENTES UI
 * ----------------------- */
const RowItem = ({ label, value, icon, isLast, multiline }) => (
  <Box
    sx={{
      display: multiline ? 'block' : 'flex',
      alignItems: multiline ? 'flex-start' : 'center',
      py: 1.2, // Espacio vertical cómodo
      borderBottom: isLast ? 'none' : '1px solid',
      borderColor: 'divider',
      width: '100%',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        width: multiline ? '100%' : '40%',
        pr: 2,
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.95rem', // Letra grande para etiqueta
        mb: multiline ? 0.5 : 0,
        fontWeight: 500,
      }}
    >
      {icon && (
        <Box component="span" sx={{ mr: 1, display: 'flex', color: 'action.active' }}>
          {icon}
        </Box>
      )}
      {label}
    </Typography>

    <Box sx={{ width: multiline ? '100%' : '60%', display: 'flex', alignItems: 'center' }}>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            fontSize: '1rem', // Letra grande para el valor
            whiteSpace: multiline ? 'pre-wrap' : 'normal',
            color: 'text.primary'
          }}
        >
          {value ?? ''}
        </Typography>
      ) : (
        value ?? <Typography variant="body1"> </Typography>
      )}
    </Box>
  </Box>
)

// Diseño Original: Borde superior de color
const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  const activeColor = bgcolor || theme.palette.primary.main

  return (
    <Card
      sx={{
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `3px solid ${activeColor}`, // Mantenemos el borde de color
        borderLeft: `1px solid ${theme.palette.divider}`,
        borderRight: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        height: '100%',
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: activeColor, width: 32, height: 32 }}>
            {icon}
          </Avatar>
        }
        title={
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
            {title}
          </Typography>
        }
        sx={{
          py: 1.5,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      />
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>{children}</CardContent>
    </Card>
  )
}

/* -----------------------
 * COMPONENTE PRINCIPAL
 * ----------------------- */
const Sistema = ({ sistema }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)
  const [pdfData, setPdfData] = useState(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // -- Queries --
  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY)

  // -- Data Processing (Memo) --
  const componentes = sistema?.componentes || []
  const usuariosRoles = sistema?.usuario_roles || []

  const usuariosMap = useMemo(
    () =>
      usuariosData?.usuarios?.reduce((map, u) => {
        map[u.id] = `${u.nombres} ${u.primer_apellido}`.trim()
        return map
      }, {}) || {},
    [usuariosData]
  )

  const getUserFullName = (id) => (!id ? '-' : usuariosMap[id] || `ID: ${id}`)

  // 1. Historial Despliegues
  const historialDespliegues = useMemo(() => {
    const all = componentes.flatMap((c) =>
      (c.despliegue || []).map((d) => ({ ...d, componente: c }))
    )
    return all.sort((a, b) => new Date(b.fecha_despliegue) - new Date(a.fecha_despliegue))
  }, [componentes])

  // 2. Máquinas Únicas
  const maquinasInvolucradas = useMemo(() => {
    const rawMaquinas = historialDespliegues.flatMap((d) => (d.maquina ? [d.maquina] : []))
    return uniqueById(rawMaquinas)
  }, [historialDespliegues])

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

  return (
    <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto' }}>
      {/* HEADER CARD */}
      <Card elevation={3} sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            px: 4,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {/* Back Button */}
          <Tooltip title="Volver">
            <IconButton
              onClick={() => navigate(routes.sistemas())}
              size="small"
              sx={{
                mr: 1,
                bgcolor: 'rgba(63, 81, 181, 0.15)',
                color: '#3f51b5',
                border: '1px solid rgba(63, 81, 181, 0.3)',
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

          {/* Avatar Identidad (Mantenemos Colores/Gradientes) */}
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <SystemIcon fontSize="medium" />
          </Avatar>

          {/* Títulos */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                lineHeight: 1.2,
                // CAMBIO: Color negro (text.primary)
                color: 'text.primary',
              }}
            >
              {sistema.nombre}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Ficha técnica del sistema
            </Typography>
          </Box>

          {/* Botones de Acción (Solo Reporte) */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="medium"
              disableElevation
              startIcon={generatingPdf ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
              onClick={generatePDFHandler}
              disabled={generatingPdf}
              sx={{ fontWeight: 700 }}
            >
              Reporte
            </Button>
          </Stack>
        </Box>

        {/* CONTENIDO PRINCIPAL (GRID 2 COLUMNAS) */}
        <CardContent sx={{ px: 4, py: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>

            {/* IZQUIERDA: Información General */}
            <SectionCard
              icon={<GeneralIcon fontSize="small" />}
              title="Información General"
              bgcolor={theme.palette.primary.main}
            >
              <RowItem
                label="Entidad"
                icon={<EntityIcon fontSize="inherit" />}
                value={
                  sistema.entidades ? (
                    <Typography variant="body1" fontWeight={700} color="primary.main">
                      {sistema.entidades.nombre}
                    </Typography>
                  ) : 'No asignada'
                }
              />
              <RowItem label="Código" value={sistema.codigo} icon={<KeyIcon fontSize="inherit" />} />
              <RowItem label="Sigla" value={sistema.sigla} icon={<TagIcon fontSize="inherit" />} />
              <RowItem label="RA Creación" value={sistema.ra_creacion} />
              <RowItem
                label="Descripción"
                multiline
                isLast
                icon={<DescIcon fontSize="inherit" />}
                value={sistema.descripcion || 'Sin descripción detallada.'}
              />
            </SectionCard>

            {/* DERECHA: Auditoría y Stats */}
            <Stack spacing={3}>
              <SectionCard
                icon={<AuditIcon fontSize="small" />}
                title="Auditoría del Registro"
                bgcolor={theme.palette.warning.dark}
              >
                <RowItem
                  label="Estado Registro"
                  value={
                    <Chip
                      label={fmtEnum(sistema.estado)}
                      size="small"
                      color={sistema.estado === 'ACTIVO' ? 'success' : 'error'}
                      sx={{ height: 24, fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  }
                />
                <RowItem label="Fecha Creación" value={fmtDate(sistema.fecha_creacion)} icon={<DateIcon fontSize="inherit" />} />
                <RowItem label="Creado por" value={getUserFullName(sistema.usuario_creacion)} />
                <RowItem label="Última Modificación" value={fmtDate(sistema.fecha_modificacion)} />
                <RowItem label="Modificado por" value={getUserFullName(sistema.usuario_modificacion)} isLast />
              </SectionCard>

              {/* Stats Rápidos (Bordes de Colores mantenidos) */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, textAlign: 'center', borderColor: theme.palette.info.main, borderTopWidth: 3 }}
                >
                  <Typography variant="h5" color="primary.main" fontWeight={800}>
                    {componentes.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Componentes
                  </Typography>
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, textAlign: 'center', borderColor: theme.palette.success.main, borderTopWidth: 3 }}
                >
                  <Typography variant="h5" color="success.main" fontWeight={800}>
                    {maquinasInvolucradas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Máquinas
                  </Typography>
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, textAlign: 'center', borderColor: theme.palette.warning.main, borderTopWidth: 3 }}
                >
                  <Typography variant="h5" color="warning.main" fontWeight={800}>
                    {historialDespliegues.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Despliegues
                  </Typography>
                </Paper>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* TABS */}
      <Card sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, minHeight: 54 }}
        >
          <Tab
            sx={{ minHeight: 54 }}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <ComponentIcon />
                <Typography variant="subtitle2" fontWeight={600}>Componentes</Typography>
                <Chip label={componentes.length} size="small" sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }} />
              </Stack>
            }
          />
          <Tab
            sx={{ minHeight: 54 }}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <DeployIcon />
                <Typography variant="subtitle2" fontWeight={600}>Despliegues</Typography>
                <Chip label={historialDespliegues.length} size="small" sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }} />
              </Stack>
            }
          />
          <Tab
            sx={{ minHeight: 54 }}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <MachineIcon />
                <Typography variant="subtitle2" fontWeight={600}>Máquinas</Typography>
                <Chip label={maquinasInvolucradas.length} size="small" sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }} />
              </Stack>
            }
          />
          <Tab
            sx={{ minHeight: 54 }}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <UsersIcon />
                <Typography variant="subtitle2" fontWeight={600}>Usuarios</Typography>
                <Chip label={usuariosRoles.length} size="small" sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }} />
              </Stack>
            }
          />
        </Tabs>

        {/* TAB CONTENT */}
        <CardContent sx={{ p: 0 }}>
          {/* 0. COMPONENTES */}
          {tab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Dominio</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Entorno</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {componentes.length > 0 ? (
                    componentes.map((c) => (
                      <TableRow key={c.id} hover>
                        <TableCell>
                          <Link
                            to={routes.componente({ id: c.id })}
                            style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none', fontSize: '0.95rem' }}
                          >
                            {c.nombre}
                          </Link>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>
                          {c.dominio ? (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <a href={`https://${c.dominio}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{c.dominio}</a>
                              <OpenInNewIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            </Stack>
                          ) : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>{c.cod_entorno}</TableCell>
                        <TableCell>
                          <Chip label={c.estado} size="small" color={c.estado === 'ACTIVO' ? 'success' : 'default'} sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '1rem' }}>No hay componentes registrados</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* 1. DESPLIEGUES */}
          {tab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Componente</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Versión / Tag</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historialDespliegues.length > 0 ? (
                    historialDespliegues.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell sx={{ fontSize: '0.95rem', fontWeight: 500 }}>{d.componente?.nombre}</TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>{d.version || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>{fmtDate(d.fecha_despliegue)}</TableCell>
                        <TableCell>
                          <Chip
                            label={d.estado_despliegue}
                            size="small"
                            color={
                              d.estado_despliegue === 'EXITOSO' ? 'success' : d.estado_despliegue === 'FALLIDO' ? 'error' : 'warning'
                            }
                            sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '1rem' }}>No hay historial de despliegues</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* 2. MAQUINAS */}
          {tab === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Nombre / Hostname</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>IP</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>S.O.</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maquinasInvolucradas.length > 0 ? (
                    maquinasInvolucradas.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell>
                          <Link to={routes.maquina({ id: m.id })} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none', fontSize: '0.95rem' }}>
                            {m.nombre}
                          </Link>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>{m.ip || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>{m.so || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={m.estado_operativo}
                            size="small"
                            variant="outlined"
                            color={m.estado_operativo === 'OPERATIVO' ? 'success' : 'warning'}
                            sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '1rem' }}>No hay máquinas vinculadas</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* 3. USUARIOS */}
          {tab === 3 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Nombre Completo</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Rol en Sistema</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuariosRoles.length > 0 ? (
                    usuariosRoles.map((ur) => (
                      <TableRow key={ur.id} hover>
                        <TableCell sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                          {ur.usuarios.nombres} {ur.usuarios.primer_apellido} {ur.usuarios.segundo_apellido}
                        </TableCell>
                        <TableCell>
                          <Chip label={ur.roles?.nombre} size="small" variant="outlined" sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>{ur.usuarios.email}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '1rem' }}>No hay usuarios asignados</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* DIALOGO PDF (Sin cambios) */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { minHeight: '80vh' } }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>Vista previa del Reporte</Typography>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={downloadPDF} color="primary" size="medium">Descargar</Button>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5' }}>
          {pdfData && <iframe src={pdfData} width="100%" height="100%" style={{ border: 'none', minHeight: '60vh', display: 'block' }} title="Vista previa del PDF" />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} size="medium">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Sistema