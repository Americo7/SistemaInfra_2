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
   GENERADOR DE REPORTE DE CLUSTER DETALLADO
======================================================== */
export const generatePDF = async (clusterDetails) => {
    if (!clusterDetails) {
        throw new Error('No hay datos del cluster para generar el reporte')
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
    doc.text('REPORTE DETALLADO DE CLUSTER', pageWidth / 2, margin + 20, { align: 'center' })

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
                { content: clusterDetails.nombre || '-', colSpan: 3, styles: { fontSize: 9 } }
            ],
            [
                { content: 'Tipo', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: clusterDetails.tipoClusterInfo?.nombre || clusterDetails.cod_tipo_cluster || '-', styles: { fontSize: 9 } },
                { content: 'Estado', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: clusterDetails.estado || '-', styles: { fontSize: 9 } }
            ],
            [
                { content: 'Descripción', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: clusterDetails.descripcion || '-', colSpan: 3, styles: { fontSize: 9 } }
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
            0: { cellWidth: 35 },
            1: { cellWidth: null },
            2: { cellWidth: 35 },
            3: { cellWidth: null }
        }
    })

    startY = doc.lastAutoTable.finalY + 5

    // ====== ENDPOINT ASOCIADO ======
    if (clusterDetails.proxmox_endpoint || clusterDetails.k8s_endpoint) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('ENDPOINT DE GESTIÓN', pageWidth / 2, startY + 4, { align: 'center' })
        doc.setDrawColor(...COLOR_GRIS)
        doc.setLineWidth(0.2)
        doc.line(pageWidth / 2 - 30, startY + 6, pageWidth / 2 + 30, startY + 6)
        startY += 8

        const endpoint = clusterDetails.proxmox_endpoint || clusterDetails.k8s_endpoint
        const tipo = clusterDetails.proxmox_endpoint ? 'Proxmox' : 'Kubernetes'

        autoTable(doc, {
            startY: startY,
            body: [
                [
                    { content: 'Tipo', styles: { fontStyle: 'bold', fontSize: 9 } },
                    { content: tipo, styles: { fontSize: 9 } },
                    { content: 'Nombre', styles: { fontStyle: 'bold', fontSize: 9 } },
                    { content: endpoint.nombre || '-', styles: { fontSize: 9 } }
                ],
                [
                    { content: clusterDetails.proxmox_endpoint ? 'Dominio' : 'URL API', styles: { fontStyle: 'bold', fontSize: 9 } },
                    { content: endpoint.dominio || endpoint.url_api || '-', colSpan: 3, styles: { fontSize: 9 } }
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

    // ====== NODOS DEL CLUSTER ======
    if (clusterDetails.cluster_nodos && clusterDetails.cluster_nodos.length > 0) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('NODOS DEL CLUSTER', pageWidth / 2, startY + 4, { align: 'center' })
        doc.setDrawColor(...COLOR_GRIS)
        doc.setLineWidth(0.2)
        doc.line(pageWidth / 2 - 25, startY + 6, pageWidth / 2 + 25, startY + 6)
        startY += 8

        const nodos = clusterDetails.cluster_nodos.map(n => {
            const recurso = n.servidores || n.maquinas
            const tipoRecurso = n.servidores ? 'Servidor' : 'Máquina'
            return [
                { content: recurso?.nombre || '-', styles: { fontSize: 8 } },
                { content: tipoRecurso, styles: { fontSize: 8 } },
                { content: n.servidores?.ip_primaria || n.maquinas?.ip || '-', styles: { fontSize: 8 } },
                { content: n.es_master ? 'Sí' : 'No', styles: { fontSize: 8 } }
            ]
        })

        autoTable(doc, {
            startY: startY,
            head: [[
                { content: 'Nombre', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } },
                { content: 'Tipo', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } },
                { content: 'IP', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } },
                { content: 'Master', styles: { fillColor: COLOR_GRIS_CLARO, textColor: COLOR_NEGRO, fontStyle: 'bold', fontSize: 8 } }
            ]],
            body: nodos,
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

    // ====== RESUMEN DE RECURSOS ======
    if (clusterDetails.cluster_nodos && clusterDetails.cluster_nodos.length > 0) {
        const totalServidores = clusterDetails.cluster_nodos.filter(n => n.servidores).length
        const totalMaquinas = clusterDetails.cluster_nodos.filter(n => n.maquinas).length
        const totalMasters = clusterDetails.cluster_nodos.filter(n => n.es_master).length

        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('RESUMEN DE RECURSOS', pageWidth / 2, startY + 4, { align: 'center' })
        doc.setDrawColor(...COLOR_GRIS)
        doc.setLineWidth(0.2)
        doc.line(pageWidth / 2 - 30, startY + 6, pageWidth / 2 + 30, startY + 6)
        startY += 8

        autoTable(doc, {
            startY: startY,
            body: [
                [
                    { content: 'Total de Nodos', styles: { fontStyle: 'bold', fontSize: 9 } },
                    { content: clusterDetails.cluster_nodos.length.toString(), styles: { fontSize: 9 } },
                    { content: 'Nodos Master', styles: { fontStyle: 'bold', fontSize: 9 } },
                    { content: totalMasters.toString(), styles: { fontSize: 9 } }
                ],
                [
                    { content: 'Servidores Físicos', styles: { fontStyle: 'bold', fontSize: 9 } },
                    { content: totalServidores.toString(), styles: { fontSize: 9 } },
                    { content: 'Máquinas Virtuales', styles: { fontStyle: 'bold', fontSize: 9 } },
                    { content: totalMaquinas.toString(), styles: { fontSize: 9 } }
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
                { content: fmtDate(clusterDetails.fecha_creacion), styles: { fontSize: 9 } },
                { content: 'Creado por', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: formatUserName(clusterDetails.creadoPor), styles: { fontSize: 9 } }
            ],
            [
                { content: 'Última Modificación', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: fmtDate(clusterDetails.fecha_modificacion), styles: { fontSize: 9 } },
                { content: 'Modificado por', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: formatUserName(clusterDetails.modificadoPor), styles: { fontSize: 9 } }
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
    doc.text(`${clusterDetails.nombre} | Generado: ${new Date().toLocaleDateString('es-BO')}`,
        pageWidth / 2, footerY - 3, { align: 'center' })

    return doc.output('datauristring')
}
