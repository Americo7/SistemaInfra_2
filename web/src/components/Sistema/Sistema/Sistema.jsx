// src/components/Sistema/Sistema.jsx
import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useState } from 'react'

// Importar funciones del exportador de reportes
import {
  generatePDF,
  getMachineAdmins,
  formatTecnologia,
  mapEstadoDespliegue
} from 'src/lib/exporter/sistemaDetalleExporter'

// Material-UI Components
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Tabs,
  Tab,
  Stack,
  Tooltip,
  useTheme,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Badge,
  LinearProgress,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Dns as SystemIcon,
  Event as EventIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  DeveloperBoard as ComponentIcon,
  Group as PeopleIcon,
  Cloud as DeployIcon,
  Business as EntityIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
  OpenInNew as OpenInNewIcon,
  Code as CodeIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Assessment as StatsIcon,
  SettingsInputComponent as MachineAdminIcon,
} from '@mui/icons-material'

const DELETE_SISTEMA_MUTATION = gql`
  mutation DeleteSistemaMutation($id: Int!) {
    deleteSistema(id: $id) {
      id
    }
  }
`

const Sistema = ({ sistema }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [pdfData, setPdfData] = useState(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const [deleteSistema] = useMutation(DELETE_SISTEMA_MUTATION, {
    onCompleted: () => {
      toast.success('Sistema eliminado correctamente')
      navigate(routes.sistemas())
    },
    onError: (error) => {
      toast.error(`Error al eliminar sistema: ${error.message}`)
    },
  })

  // Funciones auxiliares
  const confirmDelete = (id) => {
    if (confirm(`¿Está seguro que desea eliminar el sistema ${sistema.nombre}?`)) {
      deleteSistema({ variables: { id } })
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const getEstadoColor = (estado) => {
    return estado === 'ACTIVO' ? theme.palette.success.main : theme.palette.error.main
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Funciones para generar PDF usando el exportador
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
    if (!pdfData) {
      toast.error('No hay PDF generado para descargar')
      return
    }

    const link = document.createElement('a')
    link.href = pdfData
    link.download = `Registro_Sistema_${sistema.codigo || sistema.id}_${new Date().toISOString().slice(0,10)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Contadores para las pestañas
  const componentesCount = sistema.componentes?.length || 0
  const responsablesCount = sistema.usuario_roles?.length || 0
  const machineAdmins = getMachineAdmins(sistema)
  const machineAdminsCount = machineAdmins.length || 0

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Volver a la lista">
          <IconButton
            onClick={() => navigate(routes.sistemas())}
            sx={{
              mr: 2,
              backgroundColor: theme.palette.action.hover,
              '&:hover': {
                backgroundColor: theme.palette.action.selected,
              }
            }}
          >
            <BackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {sistema.nombre}
          {sistema.sigla && (
            <Typography variant="h5" component="span" sx={{ ml: 2, color: 'text.secondary' }}>
              ({sistema.sigla})
            </Typography>
          )}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={routes.editSistema({ id: sistema.id })}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Editar Sistema
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => confirmDelete(sistema.id)}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            Eliminar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={generatingPdf ? <CircularProgress size={20} /> : <PdfIcon />}
            onClick={generatePDFHandler}
            disabled={generatingPdf}
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              textTransform: 'none',
              px: 3,
            }}
          >
            {generatingPdf ? 'Generando...' : 'Generar PDF'}
          </Button>
        </Stack>
      </Box>

      {/* Tarjeta principal de información */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[3] }}>
        <CardHeader
          avatar={
            <Avatar sx={{
              bgcolor: theme.palette.primary.main,
              width: 56,
              height: 56,
            }}>
              <SystemIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {sistema.nombre}
              <Chip
                label={sistema.estado}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(sistema.estado),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            </Typography>
          }
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Código: {sistema.codigo || 'N/A'} • Entidad: {sistema.entidades?.sigla || 'AGETIC'}
              </Typography>
            </Box>
          }
          action={
            <IconButton>
              <MoreIcon />
            </IconButton>
          }
          sx={{
            pb: 0,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Columna izquierda - Detalles del sistema */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Detalles del Sistema
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>Nombre</TableCell>
                      <TableCell>{sistema.nombre}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Sigla</TableCell>
                      <TableCell>{sistema.sigla || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                      <TableCell>{sistema.codigo || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Entidad</TableCell>
                      <TableCell>
                        {sistema.entidades ? (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <EntityIcon fontSize="small" color="action" />
                            <span>
                              {sistema.entidades.nombre} ({sistema.entidades.sigla})
                            </span>
                          </Stack>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>RA Creación</TableCell>
                      <TableCell>{sistema.ra_creacion || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" sx={{
                mt: 3,
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <CodeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Descripción
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  {sistema.descripcion || 'No hay descripción disponible para este sistema.'}
                </Typography>
              </Paper>
            </Grid>

            {/* Columna derecha - Estado y auditoría */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <EventIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Auditoría
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Creado por
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {sistema.usuario_creacion || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Fecha Creación
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(sistema.fecha_creacion)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Modificado por
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {sistema.usuario_modificacion || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <UpdateIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Última Modificación
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(sistema.fecha_modificacion)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}>
                <StatsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Resumen
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Componentes
                    </Typography>
                    <Badge badgeContent={componentesCount} color="primary" max={999}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        <ComponentIcon fontSize="large" color="action" />
                      </Typography>
                    </Badge>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Responsables
                    </Typography>
                    <Badge badgeContent={responsablesCount} color="primary" max={999}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        <PeopleIcon fontSize="large" color="action" />
                      </Typography>
                    </Badge>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Admin. Máquinas
                    </Typography>
                    <Badge badgeContent={machineAdminsCount} color="primary" max={999}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        <MachineAdminIcon fontSize="large" color="action" />
                      </Typography>
                    </Badge>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sección de pestañas */}
      <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTabs-flexContainer': {
              borderBottom: `1px solid ${theme.palette.divider}`,
            }
          }}
        >
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <ComponentIcon fontSize="small" />
                <span>Componentes</span>
                <Chip
                  label={componentesCount}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <PeopleIcon fontSize="small" />
                <span>Responsables</span>
                <Chip
                  label={responsablesCount}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <MachineAdminIcon fontSize="small" />
                <span>Admin. Máquinas</span>
                <Chip
                  label={machineAdminsCount}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <DeployIcon fontSize="small" />
                <span>Despliegues</span>
              </Stack>
            }
          />
        </Tabs>

        <Divider />

        <CardContent>
          {activeTab === 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Componentes asociados a este sistema
              </Typography>
              {componentesCount > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Dominio</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Entorno</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Categoría</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tecnología</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Último Despliegue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sistema.componentes?.map((componente) => (
                        <TableRow key={componente.id} hover>
                          <TableCell>
                            <Link
                              to={routes.componente({ id: componente.id })}
                              style={{ textDecoration: 'none' }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                                {componente.nombre}
                              </Typography>
                            </Link>
                          </TableCell>
                          <TableCell>
                            {componente.dominio ? (
                              <MuiLink
                                href={`https://${componente.dominio}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                {componente.dominio}
                                <OpenInNewIcon fontSize="small" sx={{ ml: 1 }} />
                              </MuiLink>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{componente.cod_entorno || '-'}</TableCell>
                          <TableCell>{componente.cod_categoria || '-'}</TableCell>
                          <TableCell>
                            <Tooltip title={formatTecnologia(componente.tecnologia)}>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                {formatTecnologia(componente.tecnologia)?.substring(0, 20) || '-'}
                                {formatTecnologia(componente.tecnologia)?.length > 20 ? '...' : ''}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={componente.estado}
                              size="small"
                              sx={{
                                backgroundColor: getEstadoColor(componente.estado),
                                color: 'white',
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {componente.despliegue?.[0] ? (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={componente.despliegue[0].estado_despliegue}
                                  size="small"
                                  sx={{
                                    backgroundColor:
                                      componente.despliegue[0].estado_despliegue === 'EXITOSO' ? theme.palette.success.main :
                                      componente.despliegue[0].estado_despliegue === 'FALLIDO' ? theme.palette.error.main :
                                      theme.palette.warning.main,
                                    color: 'white',
                                    fontSize: '0.7rem',
                                  }}
                                />
                                <Typography variant="caption">
                                  {formatDate(componente.despliegue[0].fecha_despliegue)}
                                </Typography>
                              </Stack>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <ComponentIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay componentes registrados para este sistema.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Usuarios responsables de este sistema
              </Typography>
              {responsablesCount > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tipo de Rol</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sistema.usuario_roles?.map((usuarioRol) => (
                        <TableRow key={usuarioRol.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {`${usuarioRol.usuarios.nombres} ${usuarioRol.usuarios.primer_apellido} ${usuarioRol.usuarios.segundo_apellido || ''}`.trim()}
                            </Typography>
                          </TableCell>
                          <TableCell>{usuarioRol.roles.nombre}</TableCell>
                          <TableCell>{usuarioRol.roles.cod_tipo_rol}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay usuarios responsables registrados para este sistema.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 2 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Administradores de máquina asociados a este sistema
              </Typography>
              {machineAdminsCount > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Máquina</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {machineAdmins.map((admin, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {admin.nombreCompleto}
                            </Typography>
                          </TableCell>
                          <TableCell>{admin.maquina}</TableCell>
                          <TableCell>{admin.ip}</TableCell>
                          <TableCell>{admin.roles}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <MachineAdminIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay administradores de máquina registrados para este sistema.
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {activeTab === 3 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Historial de despliegues del sistema
              </Typography>
              {componentesCount > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Componente</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Entorno</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sistema.componentes?.flatMap(componente =>
                        componente.despliegue?.map(despliegue => (
                          <TableRow key={`${componente.id}-${despliegue.id}`} hover>
                            <TableCell>
                              <Link
                                to={routes.componente({ id: componente.id })}
                                style={{ textDecoration: 'none' }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                                  {componente.nombre}
                                </Typography>
                              </Link>
                            </TableCell>
                            <TableCell>{componente.cod_entorno || '-'}</TableCell>
                            <TableCell>{formatDate(despliegue.fecha_despliegue)}</TableCell>
                            <TableCell>
                              <Chip
                                label={despliegue.estado_despliegue}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    despliegue.estado_despliegue === 'EXITOSO' ? theme.palette.success.main :
                                    despliegue.estado_despliegue === 'FALLIDO' ? theme.palette.error.main :
                                    theme.palette.warning.main,
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )) || []
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <DeployIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay despliegues registrados para este sistema.
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de previsualización PDF */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { minHeight: '80vh' } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Vista previa del reporte</Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadPDF}
              color="primary"
            >
              Descargar PDF
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {pdfData && (
            <iframe
              src={pdfData}
              width="100%"
              height="100%"
              style={{ border: 'none', minHeight: '60vh' }}
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