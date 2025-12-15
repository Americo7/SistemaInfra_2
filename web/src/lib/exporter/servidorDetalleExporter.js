import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import logo from 'src/images/logo-agetic-reporte.png'

// Paleta de colores corporativa AGETIC
const COLOR_GUINDO = [143, 20, 64]
const COLOR_NEGRO = [0, 0, 0]
const COLOR_GRIS_OSCURO = [70, 70, 70]
const COLOR_GRIS = [120, 120, 120]
const COLOR_GRIS_CLARO = [240, 240, 240]

/* ========================================================
   HELPERS DE FORMATO
======================================================== */
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
    if (typeof userObj === 'string') return userObj
    const { nombres, primer_apellido, segundo_apellido } = userObj || {}
    return `${nombres || ''} ${primer_apellido || ''} ${segundo_apellido || ''}`.trim() || '-'
}

/* ========================================================
   GENERADOR DE REPORTE DE SERVIDOR DETALLADO
======================================================== */
export const generatePDF = async (servidorDetails) => {
    if (!servidorDetails) {
        throw new Error('No hay datos del servidor para generar el reporte')
    }

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

    const margin = 12
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // ====== ENCABEZADO ======
    const logoSize = 20
    doc.addImage(logo, 'PNG', margin, margin, logoSize, logoSize)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...COLOR_NEGRO)
    doc.text('AGENCIA DE GOBIERNO ELECTRÓNICO Y TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN',
        margin + logoSize + 5, margin + 6)

    doc.setFontSize(9)
    doc.text('UNIDAD DE INFRAESTRUCTURA TECNOLÓGICA',
        margin + logoSize + 5, margin + 11)

    doc.setFontSize(11)
    doc.setTextColor(...COLOR_GUINDO)
    doc.text('REPORTE DETALLADO DE SERVIDOR', pageWidth / 2, margin + 20, { align: 'center' })

    // Línea separadora
    doc.setDrawColor(...COLOR_GUINDO)
    doc.setLineWidth(0.5)
    doc.line(margin, margin + 25, pageWidth - margin, margin + 25)

    let startY = margin + 32

    // ====== INFORMACIÓN GENERAL ======
    doc.setFontSize(10)
    doc.setTextColor(...COLOR_NEGRO)
    doc.text('INFORMACIÓN GENERAL', pageWidth / 2, startY, { align: 'center' })

    doc.setDrawColor(...COLOR_GRIS)
    doc.setLineWidth(0.2)
    doc.line(pageWidth / 2 - 30, startY + 2, pageWidth / 2 + 30, startY + 2)

    startY += 8

    autoTable(doc, {
        startY: startY,
        body: [
            [
                { content: 'Nombre', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.nombre || '-', styles: { fontSize: 9 } },
                { content: 'IP Primaria', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.ip_primaria || '-', styles: { fontSize: 9 } }
            ],
            [
                { content: 'Tipo', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.tipoServidorInfo?.nombre || servidorDetails.cod_tipo_servidor || '-', styles: { fontSize: 9 } },
                { content: 'Inventario AGETIC', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.cod_inventario_agetic || '-', styles: { fontSize: 9 } }
            ],
            [
                { content: 'Marca', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.marca || '-', styles: { fontSize: 9 } },
                { content: 'Modelo', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.modelo || '-', styles: { fontSize: 9 } }
            ],
            [
                { content: 'Serie', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.serie || '-', styles: { fontSize: 9 } },
                { content: 'Sistema Operativo', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.sistema_operativo || '-', styles: { fontSize: 9 } }
            ],
            [
                { content: 'RAM', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.ram ? `${servidorDetails.ram} GB` : '-', styles: { fontSize: 9 } },
                { content: 'Almacenamiento', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.almacenamiento ? `${servidorDetails.almacenamiento} GB` : '-', styles: { fontSize: 9 } }
            ],
            [
                { content: 'Estado Operativo', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.estadoOperativoInfo?.nombre || servidorDetails.estado_operativo || '-', styles: { fontSize: 9 } },
                { content: 'Estado', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: servidorDetails.estado || '-', styles: { fontSize: 9 } }
            ]
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
            0: { cellWidth: 40 },
            1: { cellWidth: null },
            2: { cellWidth: 40 },
            3: { cellWidth: null }
        }
    })

    startY = doc.lastAutoTable.finalY + 5

    // ====== DATA CENTER ======
    if (servidorDetails.data_centers) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('UBICACIÓN - DATA CENTER', pageWidth / 2, startY + 4, { align: 'center' })
        doc.setDrawColor(...COLOR_GRIS)
        doc.setLineWidth(0.2)
        doc.line(pageWidth / 2 - 30, startY + 6, pageWidth / 2 + 30, startY + 6)
        startY += 8

        autoTable(doc, {
            startY: startY,
            body: [
                [
                    { content: 'Nombre', styles: { fontStyle: 'bold', fontSize: 9 } },
                    { content: servidorDetails.data_centers.nombre || '-', colSpan: 3, styles: { fontSize: 9 } }
                ],
                [
                    { content: 'Dirección', styles: { fontStyle: 'bold', fontSize: 9 } },
                    { content: servidorDetails.data_centers.direccion || '-', colSpan: 3, styles: { fontSize: 9 } }
                ]
            ],
            theme: 'grid',
            margin: { left: margin, right: margin },
            styles: {
                fontSize: 9,
                cellPadding: 2,
                textColor: COLOR_NEGRO,
                lineColor: COLOR_GRIS,
                lineWidth: 0.1,
            }
        })
        startY = doc.lastAutoTable.finalY + 5
    }

    // ====== SERVIDOR PADRE (SI ES HIJO) ======
    if (servidorDetails.servidores_padre) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('SERVIDOR PADRE', pageWidth / 2, startY + 4, { align: 'center' })
        doc.setDrawColor(...COLOR_GRIS)
        doc.setLineWidth(0.2)
        doc.line(pageWidth / 2 - 25, startY + 6, pageWidth / 2 + 25, startY + 6)
        startY += 8

        autoTable(doc, {
            startY: startY,
            body: [
                [
                    { content: 'Nombre', styles: { fontStyle: 'bold', fontSize: 9 } },
                    { content: servidorDetails.servidores_padre.nombre || '-', styles: { fontSize: 9 } },
                    { content: 'IP', styles: { fontStyle: 'bold', fontSize: 9 } },
                    { content: servidorDetails.servidores_padre.ip_primaria || '-', styles: { fontSize: 9 } }
                ]
            ],
            theme: 'grid',
            margin: { left: margin, right: margin },
            styles: {
                fontSize: 9,
                cellPadding: 2,
                textColor: COLOR_NEGRO,
                lineColor: COLOR_GRIS,
                lineWidth: 0.1,
            }
        })
        startY = doc.lastAutoTable.finalY + 5
    }

    // ====== MÁQUINAS VIRTUALES ======
    if (servidorDetails.maquinas && servidorDetails.maquinas.length > 0) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('MÁQUINAS VIRTUALES', pageWidth / 2, startY + 4, { align: 'center' })
        doc.setDrawColor(...COLOR_GRIS)
        doc.setLineWidth(0.2)
        doc.line(pageWidth / 2 - 30, startY + 6, pageWidth / 2 + 30, startY + 6)
        startY += 8

        const maquinas = servidorDetails.maquinas.map(m => [
            { content: m.nombre || '-', styles: { fontSize: 8 } },
            { content: m.ip || '-', styles: { fontSize: 8 } },
            { content: m.so || '-', styles: { fontSize: 8 } },
            { content: m.estadoOperativoInfo?.nombre || m.estado_operativo || '-', styles: { fontSize: 8 } }
        ])

        autoTable(doc, {
            startY: startY,
            head: [[
                { content: 'Nombre', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } },
                { content: 'IP', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } },
                { content: 'SO', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } },
                { content: 'Estado', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } }
            ]],
            body: maquinas,
            theme: 'grid',
            margin: { left: margin, right: margin },
            styles: {
                cellPadding: 2,
                lineColor: COLOR_GRIS,
                lineWidth: 0.1
            }
        })

        startY = doc.lastAutoTable.finalY + 5
    }

    // ====== DESPLIEGUES ======
    if (servidorDetails.despliegue && servidorDetails.despliegue.length > 0) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('DESPLIEGUES', pageWidth / 2, startY + 4, { align: 'center' })
        doc.setDrawColor(...COLOR_GRIS)
        doc.setLineWidth(0.2)
        doc.line(pageWidth / 2 - 20, startY + 6, pageWidth / 2 + 20, startY + 6)
        startY += 8

        const despliegues = servidorDetails.despliegue.map(d => [
            { content: d.componentes?.nombre || '-', styles: { fontSize: 7 } },
            { content: d.componentes?.sistemas?.sigla || '-', styles: { fontSize: 7 } },
            { content: fmtDate(d.fecha_despliegue), styles: { fontSize: 7 } },
            { content: d.estado_despliegue || '-', styles: { fontSize: 7 } }
        ])

        autoTable(doc, {
            startY: startY,
            head: [[
                { content: 'Componente', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } },
                { content: 'Sistema', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } },
                { content: 'Fecha', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } },
                { content: 'Estado', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } }
            ]],
            body: despliegues,
            theme: 'grid',
            margin: { left: margin, right: margin },
            styles: {
                cellPadding: 2,
                lineColor: COLOR_GRIS,
                lineWidth: 0.1
            }
        })

        startY = doc.lastAutoTable.finalY + 5
    }

    // ====== AUDITORÍA ======
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('AUDITORÍA DEL REGISTRO', pageWidth / 2, startY + 4, { align: 'center' })
    doc.setDrawColor(...COLOR_GRIS)
    doc.setLineWidth(0.2)
    doc.line(pageWidth / 2 - 35, startY + 6, pageWidth / 2 + 35, startY + 6)
    startY += 8

    autoTable(doc, {
        startY: startY,
        body: [
            [
                { content: 'Fecha Creación', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: fmtDate(servidorDetails.fecha_creacion), styles: { fontSize: 9 } },
                { content: 'Creado por', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: formatUserName(servidorDetails.creadoPor), styles: { fontSize: 9 } }
            ],
            [
                { content: 'Última Modificación', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: fmtDate(servidorDetails.fecha_modificacion), styles: { fontSize: 9 } },
                { content: 'Modificado por', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: formatUserName(servidorDetails.modificadoPor), styles: { fontSize: 9 } }
            ]
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
            0: { cellWidth: 40 },
            1: { cellWidth: null },
            2: { cellWidth: 40 },
            3: { cellWidth: null }
        }
    })

    // ====== PIE DE PÁGINA ======
    const footerY = pageHeight - margin
    doc.setDrawColor(...COLOR_GRIS)
    doc.setLineWidth(0.2)
    doc.line(margin, footerY - 7, pageWidth - margin, footerY - 7)

    doc.setFontSize(7)
    doc.setTextColor(...COLOR_GRIS_OSCURO)
    doc.setFont('helvetica', 'normal')
    doc.text(`${servidorDetails.nombre} | Generado: ${new Date().toLocaleDateString('es-BO')}`,
        pageWidth / 2, footerY - 3, { align: 'center' })

    return doc.output('datauristring')
}
