import { useState } from 'react'

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
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import logo from 'src/images/logo-agetic-reporte.png'

// Material-UI Components

// Paleta de colores para PDF
const COLOR_GUINDO = [143, 20, 64]
const COLOR_NEGRO = [0, 0, 0]
const COLOR_GRIS_OSCURO = [70, 70, 70]
const COLOR_GRIS = [120, 120, 120]
const COLOR_GRIS_CLARO = [240, 240, 240]

const DELETE_SISTEMA_MUTATION = gql`
  mutation DeleteSistemaMutation($id: Int!) {
    deleteSistema(id: $id) {
      id
    }
  }
`

const SISTEMA_REPORTE_QUERY = gql`
  query SistemaReporteQuery($id: Int!) {
    sistema(id: $id) {
      id
      nombre
      sigla
      codigo
      descripcion
      estado
      ra_creacion
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      entidades {
        id
        nombre
        sigla
      }
      componentes {
        id
        nombre
        dominio
        tecnologia
        cod_entorno
        cod_categoria
        estado
        despliegue {
          id
          estado_despliegue
          fecha_despliegue
          unidad_solicitante
          solicitante
          referencia_respaldo
          fecha_solicitud
          cod_tipo_respaldo
          maquinas {
            id
            nombre
            ip
            so
            usuario_roles {
              id
              usuarios {
                nombres
                primer_apellido
                segundo_apellido
              }
              roles {
                nombre
                cod_tipo_rol
              }
            }
          }
        }
      }
      usuario_roles {
        id
        usuarios {
          nombres
          primer_apellido
          segundo_apellido
        }
        roles {
          nombre
          cod_tipo_rol
        }
      }
    }
  }
`

const Sistema = ({ sistema }) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [pdfData, setPdfData] = useState(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const { data, loading, error } = useQuery(SISTEMA_REPORTE_QUERY, {
    variables: { id: sistema.id },
  })

  const [deleteSistema] = useMutation(DELETE_SISTEMA_MUTATION, {
    onCompleted: () => {
      toast.success('Sistema eliminado correctamente')
      navigate(routes.sistemas())
    },
    onError: (error) => {
      toast.error(`Error al eliminar sistema: ${error.message}`)
    },
  })

  const sistemaDetails = data?.sistema || sistema

  // Funciones auxiliares
  const confirmDelete = (id) => {
    if (
      confirm(`¿Está seguro que desea eliminar el sistema ${sistema.nombre}?`)
    ) {
      deleteSistema({ variables: { id } })
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const getEstadoColor = (estado) => {
    return estado === 'ACTIVO'
      ? theme.palette.success.main
      : theme.palette.error.main
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

  // Funciones para generar PDF
  const formatTecnologia = (tecnologia) => {
    try {
      const tech =
        typeof tecnologia === 'string' ? JSON.parse(tecnologia) : tecnologia
      if (Array.isArray(tech)) {
        return tech
          .map((t) => `${t.nombre}${t.version ? ` v${t.version}` : ''}`)
          .join(', ')
      }
      return JSON.stringify(tech)
    } catch {
      return tecnologia || 'No especificado'
    }
  }

  const mapEstadoDespliegue = (estado) => {
    const estados = {
      DESPLEGADO: 'Desplegado',
      PENDIENTE: 'Pendiente',
      EN_PROGRESO: 'En progreso',
      FALLIDO: 'Fallido',
      NO_APLICA: 'No aplica',
    }
    return estados[estado] || estado || 'No especificado'
  }

  const getEstadoDespliegue = (componentes, entorno) => {
    const componentesEntorno = componentes.filter(
      (c) => c.cod_entorno === entorno
    )
    if (componentesEntorno.length === 0) return 'No aplica'

    for (const comp of componentesEntorno) {
      if (comp.despliegue && comp.despliegue.length > 0) {
        return comp.despliegue[0].estado_despliegue
      }
    }
    return 'No especificado'
  }

  // Obtener administradores de máquina del sistema
  const getMachineAdmins = () => {
    if (!sistemaDetails.componentes) return []

    const machineAdminsMap = new Map()

    sistemaDetails.componentes.forEach((componente) => {
      componente.despliegue?.forEach((despliegue) => {
        despliegue.maquinas?.usuario_roles?.forEach((usuarioRol) => {
          if (usuarioRol.usuarios && usuarioRol.roles) {
            const nombreCompleto =
              `${usuarioRol.usuarios.nombres || ''} ${usuarioRol.usuarios.primer_apellido || ''} ${usuarioRol.usuarios.segundo_apellido || ''}`.trim()
            const rolNombre = usuarioRol.roles.nombre || 'N/A'

            if (nombreCompleto) {
              if (machineAdminsMap.has(nombreCompleto)) {
                const admin = machineAdminsMap.get(nombreCompleto)
                if (!admin.roles.includes(rolNombre)) {
                  admin.roles.push(rolNombre)
                }
              } else {
                machineAdminsMap.set(nombreCompleto, {
                  nombreCompleto,
                  roles: [rolNombre],
                  maquina: despliegue.maquinas.nombre,
                  ip: despliegue.maquinas.ip,
                })
              }
            }
          }
        })
      })
    })

    return Array.from(machineAdminsMap.values()).map((admin) => ({
      ...admin,
      roles: admin.roles.join(', '),
    }))
  }

  const generateReportData = () => {
    if (!sistemaDetails) return null

    // Agrupar componentes por entorno
    const entornos = {}
    sistemaDetails.componentes?.forEach((comp) => {
      const entorno = comp.cod_entorno || 'SIN_ENTORNO'
      if (!entornos[entorno]) {
        entornos[entorno] = {
          estado: getEstadoDespliegue(sistemaDetails.componentes, entorno),
          dominio: comp.dominio || 'N/A',
          componentes: [],
        }
      }

      entornos[entorno].componentes.push({
        nombre: comp.nombre,
        tecnologia: formatTecnologia(comp.tecnologia),
      })
    })

    // Procesar despliegues
    const despliegues = []
    Object.keys(entornos).forEach((entorno) => {
      const componentesEntorno =
        sistemaDetails.componentes?.filter((c) => c.cod_entorno === entorno) ||
        []
      for (const comp of componentesEntorno) {
        if (comp.despliegue && comp.despliegue.length > 0) {
          const desp = comp.despliegue[0]
          despliegues.push({
            entorno,
            tipoRespaldo: desp.cod_tipo_respaldo || 'Cita',
            referenciaRespaldo: desp.referencia_respaldo || 'N/A',
            unidadSolicitante: desp.unidad_solicitante || 'N/A',
            solicitante: desp.solicitante || 'N/A',
            fechaRespaldo: desp.fecha_despliegue
              ? new Date(desp.fecha_despliegue).toLocaleDateString()
              : 'N/A',
            estadoDespliegue: desp.estado_despliegue || 'No especificado',
          })
          break
        }
      }
    })

    // Procesar administradores agrupando roles
    const administradoresMap = new Map()
    if (
      sistemaDetails.usuario_roles &&
      Array.isArray(sistemaDetails.usuario_roles)
    ) {
      sistemaDetails.usuario_roles.forEach((ur) => {
        if (ur && ur.usuarios && ur.roles) {
          const nombreCompleto =
            `${ur.usuarios.nombres || ''} ${ur.usuarios.primer_apellido || ''} ${ur.usuarios.segundo_apellido || ''}`.trim()
          const rolNombre = ur.roles.nombre || 'N/A'
          const entidad = sistemaDetails.entidades?.sigla || 'AGETIC'

          if (nombreCompleto) {
            if (administradoresMap.has(nombreCompleto)) {
              const admin = administradoresMap.get(nombreCompleto)
              admin.roles.push(rolNombre)
            } else {
              administradoresMap.set(nombreCompleto, {
                nombreCompleto,
                entidad,
                roles: [rolNombre],
              })
            }
          }
        }
      })
    }

    const administradores = Array.from(administradoresMap.values()).map(
      (admin) => ({
        ...admin,
        roles: admin.roles.join(', '),
      })
    )

    // Procesar administradores de máquina
    const machineAdmins = getMachineAdmins()

    return {
      general: {
        nombre: sistemaDetails.nombre || 'N/A',
        sigla: sistemaDetails.sigla || 'N/A',
        codigo: sistemaDetails.codigo || 'N/A',
        entidad: sistemaDetails.entidades?.sigla || 'N/A',
      },
      entornos,
      despliegues,
      administradores,
      machineAdmins,
    }
  }

  const generatePDF = async () => {
    setGeneratingPdf(true)
    try {
      const reportData = generateReportData()
      if (!reportData) {
        toast.error('No hay datos suficientes para generar el reporte')
        return
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Configuración
      const margin = 12
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Encabezado
      const logoSize = 20
      doc.addImage(logo, 'PNG', margin, margin, logoSize, logoSize)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...COLOR_NEGRO)
      doc.text(
        'AGENCIA DE GOBIERNO ELECTRÓNICO Y TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN',
        margin + logoSize + 5,
        margin + 6
      )

      doc.setFontSize(9)
      doc.text(
        'UNIDAD DE INFRAESTRUCTURA TECNOLÓGICA',
        margin + logoSize + 5,
        margin + 11
      )

      doc.setFontSize(11)
      doc.setTextColor(...COLOR_GUINDO)
      doc.text(
        'FORMULARIO DE REGISTRO DE SISTEMA',
        pageWidth / 2,
        margin + 20,
        { align: 'center' }
      )

      // Línea separadora
      doc.setDrawColor(...COLOR_GUINDO)
      doc.setLineWidth(0.5)
      doc.line(margin, margin + 25, pageWidth - margin, margin + 25)

      let startY = margin + 32

      // Información General
      doc.setFontSize(10)
      doc.setTextColor(...COLOR_NEGRO)
      doc.text('INFORMACIÓN GENERAL', pageWidth / 2, startY, {
        align: 'center',
      })

      doc.setDrawColor(...COLOR_GRIS)
      doc.setLineWidth(0.2)
      doc.line(pageWidth / 2 - 30, startY + 2, pageWidth / 2 + 30, startY + 2)

      startY += 8

      // Tabla de información
      autoTable(doc, {
        startY: startY,
        body: [
          [
            { content: 'Sistema', styles: { fontStyle: 'bold', fontSize: 9 } },
            {
              content: reportData.general.nombre || 'N/A',
              styles: { fontStyle: 'normal', fontSize: 9 },
            },
            { content: 'Sigla', styles: { fontStyle: 'bold', fontSize: 9 } },
            {
              content: reportData.general.sigla || 'N/A',
              styles: { fontStyle: 'normal', fontSize: 9 },
            },
          ],
          [
            { content: 'Código', styles: { fontStyle: 'bold', fontSize: 9 } },
            {
              content: reportData.general.codigo || 'N/A',
              styles: { fontStyle: 'normal', fontSize: 9 },
            },
            { content: 'Entidad', styles: { fontStyle: 'bold', fontSize: 9 } },
            {
              content: reportData.general.entidad || 'N/A',
              styles: { fontStyle: 'normal', fontSize: 9 },
            },
          ],
        ],
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: COLOR_NEGRO,
          lineColor: COLOR_GRIS,
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: null },
          2: { cellWidth: 25 },
          3: { cellWidth: null },
        },
      })

      startY = doc.lastAutoTable.finalY + 5

      // Entornos de despliegue
      doc.setFontSize(10)
      doc.setTextColor(...COLOR_NEGRO)
      doc.setFont('helvetica', 'bold')
      doc.text('ENTORNOS DE DESPLIEGUE', pageWidth / 2, startY + 4, {
        align: 'center',
      })

      doc.setDrawColor(...COLOR_GRIS)
      doc.setLineWidth(0.2)
      doc.line(pageWidth / 2 - 35, startY + 6, pageWidth / 2 + 35, startY + 6)

      startY += 8

      const entornosOrden = [
        'PRODUCCION',
        'PRE-PRODUCCION',
        'DEMO',
        'DESARROLLO',
        'PRUEBAS',
      ]
      const entornosOrdenados = entornosOrden
        .filter((entorno) => Object.keys(reportData.entornos).includes(entorno))
        .concat(
          Object.keys(reportData.entornos).filter(
            (e) => !entornosOrden.includes(e)
          )
        )

      for (const entorno of entornosOrdenados) {
        const datos = reportData.entornos[entorno]
        if (!datos) continue

        const formatEntorno = (entorno) => {
          return entorno
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())
        }

        autoTable(doc, {
          startY: startY,
          head: [
            [
              {
                content: formatEntorno(entorno),
                styles: {
                  fillColor: [255, 255, 255],
                  textColor: COLOR_GUINDO,
                  fontStyle: 'bold',
                  fontSize: 9,
                },
              },
              {
                content: `Estado: ${mapEstadoDespliegue(datos.estado)}`,
                styles: {
                  fillColor: [255, 255, 255],
                  textColor: COLOR_GRIS_OSCURO,
                  fontStyle: 'normal',
                  fontSize: 8,
                  halign: 'right',
                },
              },
            ],
          ],
          margin: { left: margin, right: margin },
          styles: {
            cellPadding: 2,
            lineColor: COLOR_GRIS,
            lineWidth: 0.1,
          },
          theme: 'plain',
        })

        startY = doc.lastAutoTable.finalY

        if (datos.dominio && datos.dominio !== 'N/A') {
          autoTable(doc, {
            startY: startY,
            body: [
              [
                {
                  content: 'Dominio: ' + datos.dominio,
                  styles: {
                    fontStyle: 'normal',
                    textColor: COLOR_GRIS_OSCURO,
                    fontSize: 8,
                  },
                },
              ],
            ],
            margin: { left: margin + 5, right: margin },
            styles: {
              cellPadding: 1,
            },
            theme: 'plain',
          })

          startY = doc.lastAutoTable.finalY
        }

        if (datos.componentes.length > 0) {
          autoTable(doc, {
            startY: startY,
            head: [
              [
                {
                  content: 'Componente',
                  styles: {
                    fillColor: COLOR_GRIS_CLARO,
                    textColor: COLOR_NEGRO,
                    fontStyle: 'bold',
                    fontSize: 8,
                  },
                },
                {
                  content: 'Tecnología',
                  styles: {
                    fillColor: COLOR_GRIS_CLARO,
                    textColor: COLOR_NEGRO,
                    fontStyle: 'bold',
                    fontSize: 8,
                  },
                },
              ],
            ],
            body: datos.componentes.map((comp) => [
              {
                content: comp.nombre,
                styles: {
                  textColor: COLOR_NEGRO,
                  fontSize: 7,
                },
              },
              {
                content: comp.tecnologia,
                styles: {
                  textColor: COLOR_GRIS_OSCURO,
                  fontSize: 7,
                },
              },
            ]),
            margin: { left: margin + 5, right: margin },
            styles: {
              cellPadding: 2,
              lineColor: COLOR_GRIS,
              lineWidth: 0.1,
            },
            theme: 'grid',
          })

          startY = doc.lastAutoTable.finalY + 3
        } else {
          autoTable(doc, {
            startY: startY,
            body: [
              [
                {
                  content: 'Sin componentes registrados',
                  styles: {
                    textColor: COLOR_GRIS,
                    fontStyle: 'italic',
                    fontSize: 7,
                    halign: 'center',
                  },
                },
              ],
            ],
            margin: { left: margin + 5, right: margin },
            styles: {
              cellPadding: 1,
            },
            theme: 'plain',
          })
          startY = doc.lastAutoTable.finalY + 3
        }
      }

      // Respaldo de despliegue
      doc.setFontSize(10)
      doc.setTextColor(...COLOR_NEGRO)
      doc.setFont('helvetica', 'bold')
      doc.text('RESPALDO DE DESPLIEGUE', pageWidth / 2, startY + 4, {
        align: 'center',
      })

      doc.setDrawColor(...COLOR_GRIS)
      doc.setLineWidth(0.2)
      doc.line(pageWidth / 2 - 35, startY + 6, pageWidth / 2 + 35, startY + 6)

      startY += 8

      if (reportData.despliegues.length > 0) {
        autoTable(doc, {
          startY: startY,
          head: [
            [
              {
                content: 'Tipo',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
              {
                content: 'Referencia',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
              {
                content: 'Unidad Solicitante',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
              {
                content: 'Solicitante',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
              {
                content: 'Fecha',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
            ],
          ],
          body: reportData.despliegues.map((d) => [
            { content: d.tipoRespaldo, styles: { fontSize: 7 } },
            { content: d.referenciaRespaldo, styles: { fontSize: 7 } },
            { content: d.unidadSolicitante, styles: { fontSize: 7 } },
            { content: d.solicitante, styles: { fontSize: 7 } },
            { content: d.fechaRespaldo, styles: { fontSize: 7 } },
          ]),
          margin: { left: margin, right: margin },
          styles: {
            cellPadding: 2,
            lineColor: COLOR_GRIS,
            lineWidth: 0.1,
          },
          theme: 'grid',
        })
      } else {
        autoTable(doc, {
          startY: startY,
          body: [
            [
              {
                content: 'Sin información de respaldo disponible',
                styles: {
                  textColor: COLOR_GRIS,
                  fontStyle: 'italic',
                  fontSize: 8,
                  halign: 'center',
                },
              },
            ],
          ],
          margin: { left: margin, right: margin },
          styles: {
            cellPadding: 2,
          },
          theme: 'plain',
        })
      }

      startY = doc.lastAutoTable.finalY + 5

      // Administradores del sistema
      doc.setFontSize(10)
      doc.setTextColor(...COLOR_NEGRO)
      doc.setFont('helvetica', 'bold')
      doc.text('ADMINISTRADORES DEL SISTEMA', pageWidth / 2, startY + 4, {
        align: 'center',
      })

      doc.setDrawColor(...COLOR_GRIS)
      doc.setLineWidth(0.2)
      doc.line(pageWidth / 2 - 40, startY + 6, pageWidth / 2 + 40, startY + 6)

      startY += 8

      if (reportData.administradores.length > 0) {
        autoTable(doc, {
          startY: startY,
          head: [
            [
              {
                content: 'Nombre',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
              {
                content: 'Entidad',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
              {
                content: 'Roles',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
            ],
          ],
          body: reportData.administradores.map((a) => [
            { content: a.nombreCompleto, styles: { fontSize: 7 } },
            { content: a.entidad, styles: { fontSize: 7 } },
            { content: a.roles, styles: { fontSize: 7 } },
          ]),
          margin: { left: margin, right: margin },
          styles: {
            cellPadding: 2,
            lineColor: COLOR_GRIS,
            lineWidth: 0.1,
          },
          theme: 'grid',
        })
      } else {
        autoTable(doc, {
          startY: startY,
          body: [
            [
              {
                content: 'Sin administradores registrados',
                styles: {
                  textColor: COLOR_GRIS,
                  fontStyle: 'italic',
                  fontSize: 8,
                  halign: 'center',
                },
              },
            ],
          ],
          margin: { left: margin, right: margin },
          styles: {
            cellPadding: 2,
          },
          theme: 'plain',
        })
      }

      startY = doc.lastAutoTable.finalY + 5

      // Administradores de máquina
      doc.setFontSize(10)
      doc.setTextColor(...COLOR_NEGRO)
      doc.setFont('helvetica', 'bold')
      doc.text('ADMINISTRADORES DE MÁQUINA', pageWidth / 2, startY + 4, {
        align: 'center',
      })

      doc.setDrawColor(...COLOR_GRIS)
      doc.setLineWidth(0.2)
      doc.line(pageWidth / 2 - 40, startY + 6, pageWidth / 2 + 40, startY + 6)

      startY += 8

      if (reportData.machineAdmins.length > 0) {
        autoTable(doc, {
          startY: startY,
          head: [
            [
              {
                content: 'Nombre',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
              {
                content: 'Máquina',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
              {
                content: 'IP',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
              {
                content: 'Roles',
                styles: {
                  fillColor: COLOR_GRIS_CLARO,
                  textColor: COLOR_NEGRO,
                  fontStyle: 'bold',
                  fontSize: 8,
                },
              },
            ],
          ],
          body: reportData.machineAdmins.map((a) => [
            { content: a.nombreCompleto, styles: { fontSize: 7 } },
            { content: a.maquina, styles: { fontSize: 7 } },
            { content: a.ip, styles: { fontSize: 7 } },
            { content: a.roles, styles: { fontSize: 7 } },
          ]),
          margin: { left: margin, right: margin },
          styles: {
            cellPadding: 2,
            lineColor: COLOR_GRIS,
            lineWidth: 0.1,
          },
          theme: 'grid',
        })
      } else {
        autoTable(doc, {
          startY: startY,
          body: [
            [
              {
                content: 'Sin administradores de máquina registrados',
                styles: {
                  textColor: COLOR_GRIS,
                  fontStyle: 'italic',
                  fontSize: 8,
                  halign: 'center',
                },
              },
            ],
          ],
          margin: { left: margin, right: margin },
          styles: {
            cellPadding: 2,
          },
          theme: 'plain',
        })
      }

      // Pie de página
      const footerY = pageHeight - margin

      doc.setDrawColor(...COLOR_GRIS)
      doc.setLineWidth(0.2)
      doc.line(margin, footerY - 7, pageWidth - margin, footerY - 7)

      doc.setFontSize(7)
      doc.setTextColor(...COLOR_GRIS_OSCURO)
      doc.setFont('helvetica', 'normal')

      doc.text(
        `${reportData.general.nombre} | ${reportData.general.codigo} | Generado: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        footerY - 3,
        { align: 'center' }
      )

      setPdfData(doc.output('datauristring'))
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
    link.download = `Registro_Sistema_${sistemaDetails.nombre || sistema.codigo}_${new Date().toISOString().slice(0, 10)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Contadores para las pestañas
  const componentesCount = sistemaDetails.componentes?.length || 0
  const responsablesCount = sistemaDetails.usuario_roles?.length || 0
  const machineAdmins = getMachineAdmins()
  const machineAdminsCount = machineAdmins.length || 0

  if (loading) return <LinearProgress />
  if (error)
    return (
      <Typography color="error">
        Error al cargar los datos del sistema
      </Typography>
    )

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
              },
            }}
          >
            <BackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {sistemaDetails.nombre}
          {sistemaDetails.sigla && (
            <Typography
              variant="h5"
              component="span"
              sx={{ ml: 2, color: 'text.secondary' }}
            >
              ({sistemaDetails.sigla})
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
            startIcon={
              generatingPdf ? <CircularProgress size={20} /> : <PdfIcon />
            }
            onClick={generatePDF}
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
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 56,
                height: 56,
              }}
            >
              <SystemIcon fontSize="large" />
            </Avatar>
          }
          title={
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {sistemaDetails.nombre}
              <Chip
                label={sistemaDetails.estado}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: getEstadoColor(sistemaDetails.estado),
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
                Código: {sistemaDetails.codigo || 'N/A'} • Entidad:{' '}
                {sistemaDetails.entidades?.sigla || 'AGETIC'}
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
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Detalles del Sistema
              </Typography>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>
                        Nombre
                      </TableCell>
                      <TableCell>{sistemaDetails.nombre}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Sigla</TableCell>
                      <TableCell>{sistemaDetails.sigla || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                      <TableCell>{sistemaDetails.codigo || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Entidad</TableCell>
                      <TableCell>
                        {sistemaDetails.entidades ? (
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <EntityIcon fontSize="small" color="action" />
                            <span>
                              {sistemaDetails.entidades.nombre} (
                              {sistemaDetails.entidades.sigla})
                            </span>
                          </Stack>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>
                        RA Creación
                      </TableCell>
                      <TableCell>{sistemaDetails.ra_creacion || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography
                variant="h6"
                sx={{
                  mt: 3,
                  mb: 2,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <CodeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Descripción
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  {sistemaDetails.descripcion ||
                    'No hay descripción disponible para este sistema.'}
                </Typography>
              </Paper>
            </Grid>

            {/* Columna derecha - Estado y auditoría */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <EventIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Auditoría
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Creado por
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {sistemaDetails.usuario_creacion || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Fecha Creación
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(sistemaDetails.fecha_creacion)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Modificado por
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {sistemaDetails.usuario_modificacion || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <UpdateIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Última Modificación
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(sistemaDetails.fecha_modificacion)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <StatsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Resumen
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Componentes
                    </Typography>
                    <Badge
                      badgeContent={componentesCount}
                      color="primary"
                      max={999}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        <ComponentIcon fontSize="large" color="action" />
                      </Typography>
                    </Badge>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Responsables
                    </Typography>
                    <Badge
                      badgeContent={responsablesCount}
                      color="primary"
                      max={999}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        <PeopleIcon fontSize="large" color="action" />
                      </Typography>
                    </Badge>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Admin. Máquinas
                    </Typography>
                    <Badge
                      badgeContent={machineAdminsCount}
                      color="primary"
                      max={999}
                    >
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
            },
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
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: theme.palette.grey[50] }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Dominio</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Entorno</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Categoría
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Tecnología
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Último Despliegue
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sistemaDetails.componentes?.map((componente) => (
                        <TableRow key={componente.id} hover>
                          <TableCell>
                            <Link
                              to={routes.componente({ id: componente.id })}
                              style={{ textDecoration: 'none' }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: theme.palette.primary.main,
                                }}
                              >
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
                                <OpenInNewIcon
                                  fontSize="small"
                                  sx={{ ml: 1 }}
                                />
                              </MuiLink>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{componente.cod_entorno || '-'}</TableCell>
                          <TableCell>
                            {componente.cod_categoria || '-'}
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title={
                                componente.tecnologia ||
                                'Sin tecnología especificada'
                              }
                            >
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ maxWidth: 150 }}
                              >
                                {componente.tecnologia?.substring(0, 20) || '-'}
                                {componente.tecnologia?.length > 20
                                  ? '...'
                                  : ''}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={componente.estado}
                              size="small"
                              sx={{
                                backgroundColor: getEstadoColor(
                                  componente.estado
                                ),
                                color: 'white',
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {componente.despliegue?.[0] ? (
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Chip
                                  label={
                                    componente.despliegue[0].estado_despliegue
                                  }
                                  size="small"
                                  sx={{
                                    backgroundColor:
                                      componente.despliegue[0]
                                        .estado_despliegue === 'EXITOSO'
                                        ? theme.palette.success.main
                                        : componente.despliegue[0]
                                              .estado_despliegue === 'FALLIDO'
                                          ? theme.palette.error.main
                                          : theme.palette.warning.main,
                                    color: 'white',
                                    fontSize: '0.7rem',
                                  }}
                                />
                                <Typography variant="caption">
                                  {formatDate(
                                    componente.despliegue[0].fecha_despliegue
                                  )}
                                </Typography>
                              </Stack>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
                >
                  <ComponentIcon
                    sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }}
                  />
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
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: theme.palette.grey[50] }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Tipo de Rol
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sistemaDetails.usuario_roles?.map((usuarioRol) => (
                        <TableRow key={usuarioRol.id} hover>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
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
                <Paper
                  variant="outlined"
                  sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
                >
                  <PeopleIcon
                    sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }}
                  />
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
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: theme.palette.grey[50] }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Máquina</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {machineAdmins.map((admin) => (
                        <TableRow
                          key={admin.nombreCompleto + admin.maquina}
                          hover
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
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
                <Paper
                  variant="outlined"
                  sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
                >
                  <MachineAdminIcon
                    sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    No hay administradores de máquina registrados para este
                    sistema.
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
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: theme.palette.grey[50] }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>
                          Componente
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Entorno</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sistemaDetails.componentes?.flatMap(
                        (componente) =>
                          componente.despliegue?.map((despliegue) => (
                            <TableRow
                              key={`${componente.id}-${despliegue.id}`}
                              hover
                            >
                              <TableCell>
                                <Link
                                  to={routes.componente({ id: componente.id })}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      color: theme.palette.primary.main,
                                    }}
                                  >
                                    {componente.nombre}
                                  </Typography>
                                </Link>
                              </TableCell>
                              <TableCell>
                                {componente.cod_entorno || '-'}
                              </TableCell>
                              <TableCell>
                                {formatDate(despliegue.fecha_despliegue)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={despliegue.estado_despliegue}
                                  size="small"
                                  sx={{
                                    backgroundColor:
                                      despliegue.estado_despliegue === 'EXITOSO'
                                        ? theme.palette.success.main
                                        : despliegue.estado_despliegue ===
                                            'FALLIDO'
                                          ? theme.palette.error.main
                                          : theme.palette.warning.main,
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
                <Paper
                  variant="outlined"
                  sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
                >
                  <DeployIcon
                    sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }}
                  />
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
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
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
