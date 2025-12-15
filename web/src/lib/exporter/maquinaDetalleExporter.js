import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import logo from 'src/images/logo-agetic-reporte.png'

/* ========================================================
   HELPERS & UTILIDADES
======================================================== */
const fmtDate = (d) => {
    if (!d) return '-'
    try {
        return new Date(d).toLocaleString('es-BO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
    } catch { return '-' }
}

const formatUserName = (userObj) => {
    if (!userObj) return '-'
    if (typeof userObj === 'string') return userObj
    const { nombres, primer_apellido, segundo_apellido } = userObj || {}
    return `${nombres || ''} ${primer_apellido || ''} ${segundo_apellido || ''}`.trim() || '-'
}

const formatAlmacenamiento = (val) => {
    if (!val) return '-'
    try {
        const arr = typeof val === 'object' ? val : JSON.parse(val)
        if (!Array.isArray(arr)) return '-'
        return arr.map(d => `[D${d.Disco}: ${d.Valor}GB]`).join('  ')
    } catch { return '-' }
}

// --- LÓGICA CRÍTICA: Replicar la inteligencia del componente React ---
const getInfraestructuraData = (maquina) => {
    const arr = []

    // 1. VIRTUALIZACIÓN (Desde 'servidores')
    const servidorRaw = maquina?.servidores
    const servidor = Array.isArray(servidorRaw) ? servidorRaw[0] : servidorRaw

    if (servidor) {
        const srvNodes = Array.isArray(servidor.cluster_nodos)
            ? servidor.cluster_nodos
            : (servidor.cluster_nodos ? [servidor.cluster_nodos] : [])

        const srvNode = srvNodes[0]
        const dc = Array.isArray(servidor.data_centers) ? servidor.data_centers[0] : servidor.data_centers

        if (srvNode && srvNode.cluster) {
            arr.push([
                'Virtualización', // Contexto
                srvNode.cluster.tipoClusterInfo?.nombre || 'Cluster Virt.', // Tipo
                srvNode.cluster.nombre, // Cluster
                srvNode.nombre, // Nodo
                `Host Físico: ${servidor.nombre}\nDC: ${dc?.nombre || '-'}` // Detalle Extra
            ])
        } else {
            // Caso Standalone (Servidor suelto)
            arr.push([
                'Virtualización',
                'Standalone',
                '-',
                '-',
                `Host Físico: ${servidor.nombre}\nDC: ${dc?.nombre || '-'}`
            ])
        }
    }

    // 2. ORQUESTACIÓN (Desde 'cluster_nodos' propios de la VM)
    const nodos = maquina?.cluster_nodos || []
    nodos.forEach(n => {
        if (n.cluster) {
            arr.push([
                'Orquestación', // Contexto
                n.cluster.tipoClusterInfo?.nombre || 'K8s/Docker', // Tipo
                n.cluster.nombre, // Cluster
                n.nombre, // Nombre del Nodo (VM)
                `Rol: ${n.rolInfo?.nombre || 'Sin Rol'}` // Detalle Extra
            ])
        }
    })

    return arr
}

/* ========================================================
   DIBUJAR UNA MÁQUINA (PÁGINA)
======================================================== */
const printMachinePage = (doc, maquina) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 14

    // --- ENCABEZADO ---
    const logoSize = 20
    doc.addImage(logo, 'PNG', margin, margin, logoSize, logoSize)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('AGENCIA DE GOBIERNO ELECTRÓNICO Y TECNOLOGÍAS', margin + logoSize + 5, margin + 6)
    doc.text('DE LA INFORMACIÓN Y COMUNICACIÓN', margin + logoSize + 5, margin + 11)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('UNIDAD DE INFRAESTRUCTURA TECNOLÓGICA', margin + logoSize + 5, margin + 16)

    // Título del reporte
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`FICHA TÉCNICA: ${maquina.nombre || 'SIN NOMBRE'}`, pageWidth - margin, margin + 10, { align: 'right' })

    doc.setFontSize(9)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-BO')}`, pageWidth - margin, margin + 16, { align: 'right' })

    // Línea separadora
    doc.setLineWidth(0.5)
    doc.line(margin, margin + 22, pageWidth - margin, margin + 22)

    let startY = margin + 30

    // -----------------------------------------------------------------
    // 1. BLOQUE PRINCIPAL: DATOS GENERALES Y RECURSOS
    // -----------------------------------------------------------------
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('1. INFORMACIÓN GENERAL Y RECURSOS', margin, startY)
    startY += 5

    autoTable(doc, {
        startY: startY,
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        body: [
            [
                { content: 'Nombre VM:', styles: { fontStyle: 'bold' } }, maquina.nombre,
                { content: 'IP:', styles: { fontStyle: 'bold' } }, maquina.ip
            ],
            [
                { content: 'VMID:', styles: { fontStyle: 'bold' } }, maquina.proxmox_vmid,
                { content: 'Identificador:', styles: { fontStyle: 'bold' } }, maquina.identity_key || '-'
            ],
            [
                { content: 'S. Operativo:', styles: { fontStyle: 'bold' } }, maquina.so,
                { content: 'Plataforma:', styles: { fontStyle: 'bold' } }, maquina.plataformaInfo?.nombre || maquina.cod_plataforma
            ],
            [
                { content: 'Estado:', styles: { fontStyle: 'bold' } }, maquina.estado,
                { content: 'Est. Operativo:', styles: { fontStyle: 'bold' } }, maquina.estadoOperativoInfo?.nombre || maquina.estado_operativo
            ],
            // Sección Recursos fusionada
            [
                { content: 'CPU / Cores:', styles: { fontStyle: 'bold' } }, `${maquina.cpu} vCores`,
                { content: 'Memoria RAM:', styles: { fontStyle: 'bold' } }, `${maquina.ram} GB`
            ],
            [
                { content: 'Almacenamiento:', styles: { fontStyle: 'bold' } },
                { content: formatAlmacenamiento(maquina.almacenamiento), colSpan: 3 }
            ]
        ]
    })

    startY = doc.lastAutoTable.finalY + 10

    // -----------------------------------------------------------------
    // 2. INFRAESTRUCTURA (La lógica compleja)
    // -----------------------------------------------------------------
    doc.text('2. INFRAESTRUCTURA Y ORQUESTACIÓN', margin, startY)
    startY += 5

    const infraData = getInfraestructuraData(maquina)

    if (infraData.length > 0) {
        autoTable(doc, {
            startY: startY,
            theme: 'striped',
            headStyles: { fillColor: [70, 70, 70] },
            head: [['Contexto', 'Tipo', 'Cluster', 'Nodo / VM', 'Detalle / Rol']],
            body: infraData,
            styles: { fontSize: 8 }
        })
    } else {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(9)
        doc.text('No existe vinculación a infraestructura física o cluster.', margin + 2, startY + 5)
        doc.setFont('helvetica', 'bold')
        // Ajuste manual de Y si no hubo tabla
        doc.lastAutoTable = { finalY: startY + 10 }
    }

    startY = doc.lastAutoTable.finalY + 10

    // -----------------------------------------------------------------
    // 3. AUDITORÍA
    // -----------------------------------------------------------------
    doc.setFontSize(11)
    doc.text('3. AUDITORÍA DEL REGISTRO', margin, startY)
    startY += 5

    autoTable(doc, {
        startY: startY,
        theme: 'plain', // Más limpio para auditoría
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 } },
        body: [
            ['Fecha Creación:', fmtDate(maquina.fecha_creacion), 'Por:', formatUserName(maquina.creadoPor)],
            ['Última Modif.:', fmtDate(maquina.fecha_modificacion), 'Por:', formatUserName(maquina.modificadoPor)]
        ]
    })

    startY = doc.lastAutoTable.finalY + 10

    // -----------------------------------------------------------------
    // 4. DETALLES ADICIONALES (Listas)
    // -----------------------------------------------------------------

    // -- A. Usuarios --
    if (maquina.usuario_roles?.length > 0) {
        checkPageBreak(doc, startY, pageHeight)
        doc.setFontSize(10)
        doc.text(`Usuarios Asignados (${maquina.usuario_roles.length})`, margin, startY)
        startY += 4

        const userRows = maquina.usuario_roles.map(ur => [
            formatUserName(ur.usuarios),
            ur.roles?.nombre || '-',
            ur.sistemas?.sigla || '-'
        ])

        autoTable(doc, {
            startY: startY,
            theme: 'grid',
            head: [['Usuario', 'Rol', 'Sistema']],
            body: userRows,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [220, 220, 220], textColor: 0 } // Gris claro
        })
        startY = doc.lastAutoTable.finalY + 8
    }

    // -- B. Despliegues --
    if (maquina.despliegue?.length > 0) {
        checkPageBreak(doc, startY, pageHeight)
        doc.setFontSize(10)
        doc.text(`Historial de Despliegues (${maquina.despliegue.length})`, margin, startY)
        startY += 4

        const deployRows = maquina.despliegue.map(d => [
            fmtDate(d.fecha_despliegue),
            d.componentes?.nombre || '-',
            d.componentes?.sistemas?.sigla || '-',
            d.estado_despliegue
        ])

        autoTable(doc, {
            startY: startY,
            theme: 'grid',
            head: [['Fecha', 'Componente', 'Sistema', 'Estado']],
            body: deployRows,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [220, 220, 220], textColor: 0 }
        })
        startY = doc.lastAutoTable.finalY + 8
    }

    // -- C. Eventos --
    if (maquina.infra_afectada?.length > 0) {
        checkPageBreak(doc, startY, pageHeight)
        doc.setFontSize(10)
        doc.text('Eventos e Incidentes', margin, startY)
        startY += 4

        // Aplanar eventos desde infra_afectada
        const eventos = maquina.infra_afectada.flatMap(ia => ia.eventos || [])
        const eventRows = eventos.map(e => [
            fmtDate(e.fecha_evento || e.fecha_creacion),
            e.cod_evento,
            e.descripcion?.substring(0, 50) + (e.descripcion?.length > 50 ? '...' : '')
        ])

        autoTable(doc, {
            startY: startY,
            theme: 'grid',
            head: [['Fecha', 'Código', 'Descripción']],
            body: eventRows,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [220, 220, 220], textColor: 0 }
        })
    }
}

// Helper para saltar de página si falta espacio
const checkPageBreak = (doc, currentY, pageHeight) => {
    if (currentY > pageHeight - 30) {
        doc.addPage()
        doc.setPage(doc.getNumberOfPages()) // Focus en nueva pagina
        return 20 // Nuevo startY
    }
    return currentY
}


/* ========================================================
   FUNCIÓN PRINCIPAL EXPORTADA
======================================================== */
export const generatePDF = async (dataInput) => {
    // Aseguramos que sea un array
    const listaMaquinas = Array.isArray(dataInput) ? dataInput : [dataInput]

    if (!listaMaquinas || listaMaquinas.length === 0) {
        throw new Error('No hay datos para generar el reporte')
    }

    // Crear documento
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // Iterar y crear una página por máquina (o varias páginas si la máquina es muy larga)
    listaMaquinas.forEach((maquina, index) => {
        if (index > 0) doc.addPage() // Nueva página para la siguiente máquina
        printMachinePage(doc, maquina)
    })

    return doc.output('datauristring')
}