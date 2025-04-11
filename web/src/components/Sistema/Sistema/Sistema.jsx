import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatEnum, timeTag } from 'src/lib/formatters'
import { useState, useEffect } from 'react'
import logo from 'src/images/logo-agetic.png'

// Colores corporativos
const COLOR_PRIMARIO = [96, 11, 39] // Guindo/Borgoña
const COLOR_SECUNDARIO = [15, 47, 92] // Azul oscuro
const COLOR_FONDO = [249, 245, 246] // Fondo claro
const COLOR_TEXTO = [51, 51, 51] // Texto principal
const COLOR_BORDE = [200, 200, 200] // Color para bordes

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
      entidades {
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
            nombre
            ip
            so
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
  const [showPreview, setShowPreview] = useState(false)
  const [pdfData, setPdfData] = useState(null)
  const { data, loading, error } = useQuery(SISTEMA_REPORTE_QUERY, {
    variables: { id: sistema.id },
    skip: !showPreview
  })

  const [deleteSistema] = useMutation(DELETE_SISTEMA_MUTATION, {
    onCompleted: () => {
      toast.success('Sistema eliminado correctamente.')
      navigate(routes.sistemas())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar el sistema ' + id + '?')) {
      deleteSistema({ variables: { id } })
    }
  }

  const formatTecnologia = (tecnologia) => {
    try {
      const tech = typeof tecnologia === 'string' ? JSON.parse(tecnologia) : tecnologia
      if (Array.isArray(tech)) {
        return tech.map(t => `${t.nombre}${t.version ? ` v${t.version}` : ''}`).join(', ')
      }
      return JSON.stringify(tech)
    } catch {
      return tecnologia || 'No especificado'
    }
  }

  const generateReportData = () => {
    if (!data?.sistema) return null

    const sistemaData = data.sistema

    // Agrupar componentes por entorno
    const entornos = {}
    sistemaData.componentes?.forEach(comp => {
      const entorno = comp.cod_entorno || 'SIN_ENTORNO'
      if (!entornos[entorno]) {
        entornos[entorno] = {
          estado: 'DESCONOCIDO',
          dominio: comp.dominio || 'N/A',
          componentes: []
        }
      }

      entornos[entorno].componentes.push({
        nombre: comp.nombre,
        tecnologia: formatTecnologia(comp.tecnologia)
      })
    })

    // Procesar despliegues (solo uno por entorno)
    const despliegues = []
    const entornosProcesados = new Set()

    sistemaData.componentes?.forEach(comp => {
      const entorno = comp.cod_entorno || 'SIN_ENTORNO'

      if (entornosProcesados.has(entorno)) return

      // Tomar el primer despliegue del componente para este entorno
      const primerDespliegue = comp.despliegue?.[0]
      if (primerDespliegue) {
        despliegues.push({
          entorno,
          tipoRespaldo: primerDespliegue.cod_tipo_respaldo || 'N/A',
          referenciaRespaldo: primerDespliegue.referencia_respaldo || 'N/A',
          unidadSolicitante: primerDespliegue.unidad_solicitante || 'N/A',
          solicitante: primerDespliegue.solicitante || 'N/A',
          fechaRespaldo: primerDespliegue.fecha_despliegue
            ? new Date(primerDespliegue.fecha_despliegue).toLocaleDateString()
            : 'N/A',
          maquinas: Array.isArray(primerDespliegue.maquinas) && primerDespliegue.maquinas.length > 0
            ? primerDespliegue.maquinas.map(m => `${m.nombre || 'N/A'} (${m.ip || 'N/A'})`).join(', ')
            : 'N/A'
        })
        entornosProcesados.add(entorno)
      }
    })

    // Procesar administradores
    const administradores = []
    if (sistemaData.usuario_roles && Array.isArray(sistemaData.usuario_roles)) {
      sistemaData.usuario_roles.forEach(ur => {
        if (ur && ur.usuarios && ur.roles) {
          const nombreCompleto = `${ur.usuarios.nombres || ''} ${ur.usuarios.primer_apellido || ''} ${ur.usuarios.segundo_apellido || ''}`.trim()
          const rolNombre = ur.roles.nombre || 'N/A'

          if (nombreCompleto) {
            administradores.push({
              nombreCompleto: nombreCompleto,
              entidad: sistemaData.entidades?.sigla || 'AGETIC',
              rol: rolNombre
            })
          }
        }
      })
    }

    return {
      general: {
        nombre: sistemaData.nombre || 'N/A',
        sigla: sistemaData.sigla || 'N/A',
        codigo: sistemaData.codigo || 'N/A',
        descripcion: sistemaData.descripcion || 'N/A',
        entidad: sistemaData.entidades?.sigla || 'N/A'
      },
      entornos,
      despliegues,
      administradores
    }
  }

  const generatePDF = () => {
    const reportData = generateReportData()
    if (!reportData) {
      toast.error('No hay datos suficientes para generar el reporte')
      return
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Configuración
    const margin = 15
    const pageWidth = doc.internal.pageSize.getWidth()
    const usableWidth = pageWidth - 2 * margin

    // Estilo del documento
    doc.setFont('helvetica', 'normal')

    // Logo y Encabezado
    doc.addImage(logo, 'PNG', margin, 10, 25, 25)
    doc.setFontSize(16)
    doc.setTextColor(...COLOR_PRIMARIO)
    doc.setFont('helvetica', 'bold')
    doc.text('AGENCIA DE GOBIERNO ELECTRÓNICO', pageWidth / 2, 20, { align: 'center' })
    doc.text('Y TECNOLOGÍAS DE INFORMACIÓN', pageWidth / 2, 26, { align: 'center' })
    doc.setFontSize(10)
    doc.setTextColor(...COLOR_SECUNDARIO)
    doc.setFont('helvetica', 'normal')
    doc.text('UNIDAD DE INFRAESTRUCTURA TECNOLÓGICA', pageWidth / 2, 32, { align: 'center' })

    // Línea decorativa
    doc.setDrawColor(...COLOR_PRIMARIO)
    doc.setLineWidth(0.5)
    doc.line(margin, 36, pageWidth - margin, 36)

    // Título principal
    doc.setFontSize(18)
    doc.setTextColor(...COLOR_PRIMARIO)
    doc.setFont('helvetica', 'bold')
    doc.text('REGISTRO DE SISTEMA INFORMÁTICO', pageWidth / 2, 45, { align: 'center' })

    // 1. Información General
    doc.setFontSize(12)
    doc.setDrawColor(...COLOR_PRIMARIO)
    doc.setFillColor(...COLOR_FONDO)
    doc.roundedRect(margin, 50, usableWidth, 8, 2, 2, 'F')
    doc.setTextColor(...COLOR_PRIMARIO)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMACIÓN GENERAL', margin + 5, 55.5)

    autoTable(doc, {
      startY: 60,
      head: [
        [
          {
            content: 'Datos del Sistema',
            styles: {
              fontStyle: 'bold',
              fillColor: COLOR_PRIMARIO,
              textColor: [255, 255, 255],
              fontSize: 10,
              cellPadding: 5
            }
          }
        ]
      ],
      body: [
        [
          {
            content: `• Nombre: ${reportData.general.nombre}\n` +
                     `• Sigla: ${reportData.general.sigla}\n` +
                     `• Código: ${reportData.general.codigo}\n` +
                     `• Entidad: ${reportData.general.entidad}\n` +
                     `• Descripción: ${reportData.general.descripcion}`,
            styles: {
              fontSize: 10,
              lineColor: COLOR_BORDE,
              cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
              textColor: COLOR_TEXTO
            }
          }
        ]
      ],
      margin: { top: 0, left: margin, right: margin },
      styles: {
        overflow: 'linebreak',
        halign: 'left'
      },
      theme: 'plain',
      headStyles: {
        valign: 'middle'
      }
    })

    // 2. Entornos de Despliegue
    let startY = doc.lastAutoTable.finalY + 15

    doc.setFontSize(12)
    doc.setDrawColor(...COLOR_PRIMARIO)
    doc.setFillColor(...COLOR_FONDO)
    doc.roundedRect(margin, startY - 5, usableWidth, 8, 2, 2, 'F')
    doc.setTextColor(...COLOR_PRIMARIO)
    doc.setFont('helvetica', 'bold')
    doc.text('ENTORNOS Y COMPONENTES', margin + 5, startY + 0.5)

    if (Object.keys(reportData.entornos).length > 0) {
      for (const [entorno, datos] of Object.entries(reportData.entornos)) {
        startY += 10

        // Subtítulo de entorno
        doc.setFontSize(10)
        doc.setTextColor(...COLOR_SECUNDARIO)
        doc.setFont('helvetica', 'bold')
        doc.text(`ENTORNO: ${entorno.toUpperCase()}`, margin, startY)
        doc.setTextColor(100, 100, 100)
        doc.setFont('helvetica', 'normal')
        doc.text(`Dominio: ${datos.dominio}`, margin, startY + 5)

        // Tabla de componentes
        autoTable(doc, {
          startY: startY + 8,
          head: [
            [
              {
                content: 'Componente',
                styles: {
                  fontStyle: 'bold',
                  fillColor: COLOR_PRIMARIO,
                  textColor: [255, 255, 255],
                  fontSize: 9,
                  cellPadding: 4
                }
              },
              {
                content: 'Tecnología',
                styles: {
                  fontStyle: 'bold',
                  fillColor: COLOR_PRIMARIO,
                  textColor: [255, 255, 255],
                  fontSize: 9,
                  cellPadding: 4
                }
              }
            ]
          ],
          body: datos.componentes.map(comp => [
            {
              content: comp.nombre,
              styles: {
                fontSize: 9,
                cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
                textColor: COLOR_TEXTO
              }
            },
            {
              content: comp.tecnologia,
              styles: {
                fontSize: 8,
                cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
                textColor: COLOR_TEXTO
              }
            }
          ]),
          margin: { top: 2, left: margin, right: margin },
          styles: {
            lineColor: COLOR_BORDE,
            overflow: 'linebreak'
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 'auto' }
          },
          theme: 'grid'
        })

        startY = doc.lastAutoTable.finalY + 10
      }
    } else {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text('No hay entornos de despliegue registrados', margin + 4, startY + 10)
      startY += 15
    }

    // 3. Respaldo de Despliegue
    doc.setFontSize(12)
    doc.setDrawColor(...COLOR_PRIMARIO)
    doc.setFillColor(...COLOR_FONDO)
    doc.roundedRect(margin, startY, usableWidth, 8, 2, 2, 'F')
    doc.setTextColor(...COLOR_PRIMARIO)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMACIÓN DE RESPALDOS', margin + 5, startY + 5.5)
    startY += 15

    if (reportData.despliegues.length > 0) {
      autoTable(doc, {
        startY,
        head: [
          [
            {
              content: 'Entorno',
              styles: {
                fontStyle: 'bold',
                fillColor: COLOR_PRIMARIO,
                textColor: [255, 255, 255],
                fontSize: 9,
                cellPadding: 4
              }
            },
            {
              content: 'Tipo Respaldo',
              styles: {
                fontStyle: 'bold',
                fillColor: COLOR_PRIMARIO,
                textColor: [255, 255, 255],
                fontSize: 9,
                cellPadding: 4
              }
            },
            {
              content: 'Referencia',
              styles: {
                fontStyle: 'bold',
                fillColor: COLOR_PRIMARIO,
                textColor: [255, 255, 255],
                fontSize: 9,
                cellPadding: 4
              }
            },
            {
              content: 'Unidad Solicitante',
              styles: {
                fontStyle: 'bold',
                fillColor: COLOR_PRIMARIO,
                textColor: [255, 255, 255],
                fontSize: 9,
                cellPadding: 4
              }
            },
            {
              content: 'Fecha Respaldo',
              styles: {
                fontStyle: 'bold',
                fillColor: COLOR_PRIMARIO,
                textColor: [255, 255, 255],
                fontSize: 9,
                cellPadding: 4
              }
            }
          ]
        ],
        body: reportData.despliegues.map(d => [
          {
            content: d.entorno,
            styles: {
              fontSize: 9,
              cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
              textColor: COLOR_TEXTO
            }
          },
          {
            content: d.tipoRespaldo,
            styles: {
              fontSize: 9,
              cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
              textColor: COLOR_TEXTO
            }
          },
          {
            content: d.referenciaRespaldo,
            styles: {
              fontSize: 8,
              cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
              textColor: COLOR_TEXTO
            }
          },
          {
            content: d.unidadSolicitante,
            styles: {
              fontSize: 8,
              cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
              textColor: COLOR_TEXTO
            }
          },
          {
            content: d.fechaRespaldo,
            styles: {
              fontSize: 9,
              cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
              textColor: COLOR_TEXTO
            }
          }
        ]),
        margin: { top: 0, left: margin, right: margin },
        styles: {
          lineColor: COLOR_BORDE,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 }
        },
        theme: 'grid'
      })
      startY = doc.lastAutoTable.finalY + 10
    } else {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text('No hay información de respaldo registrada', margin + 4, startY)
      startY += 10
    }

    // 4. Administradores
    doc.setFontSize(12)
    doc.setDrawColor(...COLOR_PRIMARIO)
    doc.setFillColor(...COLOR_FONDO)
    doc.roundedRect(margin, startY, usableWidth, 8, 2, 2, 'F')
    doc.setTextColor(...COLOR_PRIMARIO)
    doc.setFont('helvetica', 'bold')
    doc.text('RESPONSABLES DEL SISTEMA', margin + 5, startY + 5.5)
    startY += 15

    if (reportData.administradores.length > 0) {
      autoTable(doc, {
        startY,
        head: [
          [
            {
              content: 'Nombre',
              styles: {
                fontStyle: 'bold',
                fillColor: COLOR_PRIMARIO,
                textColor: [255, 255, 255],
                fontSize: 9,
                cellPadding: 4
              }
            },
            {
              content: 'Entidad',
              styles: {
                fontStyle: 'bold',
                fillColor: COLOR_PRIMARIO,
                textColor: [255, 255, 255],
                fontSize: 9,
                cellPadding: 4
              }
            },
            {
              content: 'Rol',
              styles: {
                fontStyle: 'bold',
                fillColor: COLOR_PRIMARIO,
                textColor: [255, 255, 255],
                fontSize: 9,
                cellPadding: 4
              }
            }
          ]
        ],
        body: reportData.administradores.map(a => [
          {
            content: a.nombreCompleto,
            styles: {
              fontSize: 9,
              cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
              textColor: COLOR_TEXTO
            }
          },
          {
            content: a.entidad,
            styles: {
              fontSize: 9,
              cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
              textColor: COLOR_TEXTO
            }
          },
          {
            content: a.rol,
            styles: {
              fontSize: 9,
              cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
              textColor: COLOR_TEXTO
            }
          }
        ]),
        margin: { top: 0, left: margin, right: margin },
        styles: {
          lineColor: COLOR_BORDE,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 40 },
          2: { cellWidth: 60 }
        },
        theme: 'grid'
      })
    } else {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text('No hay administradores registrados', margin + 4, startY)
    }

    // Pie de página profesional
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_SECUNDARIO)
    doc.setFont('helvetica', 'italic')
    doc.text(`Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`,
             margin, doc.internal.pageSize.getHeight() - 10)
    doc.text(`Sistema: ${reportData.general.nombre} | Código: ${reportData.general.codigo}`,
             margin, doc.internal.pageSize.getHeight() - 5)

    // Número de página
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.text(`Página ${i} de ${pageCount}`,
               pageWidth - margin - 20, doc.internal.pageSize.getHeight() - 5,
               { align: 'right' })
    }

    setPdfData(doc.output('datauristring'))
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const downloadPDF = () => {
    if (!pdfData) {
      toast.error('No hay PDF generado para descargar')
      return
    }

    const link = document.createElement('a')
    link.href = pdfData
    link.download = `Registro_Sistema_${data?.sistema?.nombre || sistema.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    if (showPreview && !loading && data) {
      generatePDF()
    }
  }, [showPreview, loading, data])

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Detalle del Sistema {sistema.id}
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>ID</th>
              <td>{sistema.id}</td>
            </tr>
            <tr>
              <th>Nombre</th>
              <td>{sistema.nombre}</td>
            </tr>
            <tr>
              <th>Sigla</th>
              <td>{sistema.sigla || 'N/A'}</td>
            </tr>
            <tr>
              <th>Descripción</th>
              <td>{sistema.descripcion}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(sistema.estado)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav className="rw-button-group">
        <Link
          to={routes.editSistema({ id: sistema.id })}
          className="rw-button rw-button-blue"
        >
          Editar
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(sistema.id)}
        >
          Eliminar
        </button>
        <button
          type="button"
          className="rw-button rw-button-green"
          onClick={handlePreview}
        >
          {showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}
        </button>
        <button
          type="button"
          className="rw-button rw-button-blue"
          onClick={downloadPDF}
          disabled={!pdfData || loading}
        >
          Descargar PDF
        </button>
      </nav>

      {showPreview && (
        <div className="mt-8 p-4 border rounded-lg">
          <h3 className="text-xl font-bold mb-4">Vista Previa del Reporte</h3>

          {loading && (
            <div className="text-center py-8">Cargando datos del sistema...</div>
          )}

          {!loading && pdfData && (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={downloadPDF}
                  className="rw-button rw-button-blue"
                >
                  Descargar PDF
                </button>
              </div>
              <iframe
                src={pdfData}
                className="w-full h-[600px] border"
                title="Vista previa del reporte"
              />
            </>
          )}

          {!loading && !pdfData && (
            <div className="text-center py-8">
              No se pudo generar el reporte. Verifique que el sistema tenga datos completos.
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Sistema
