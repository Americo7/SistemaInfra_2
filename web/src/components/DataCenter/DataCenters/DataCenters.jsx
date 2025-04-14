import React, { useState, useMemo } from 'react'

import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Hardware as HardwareIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/DataCenter/DataCentersCell'

const DELETE_DATA_CENTER_MUTATION = gql`
  mutation DeleteDataCenterMutation($id: Int!) {
    deleteDataCenter(id: $id) {
      id
    }
  }
`

// Función mejorada para formato de fecha/hora
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const truncate = (text, length = 50) => {
  if (!text) return 'N/A'
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatEnum = (value) => {
  if (!value) return 'N/A'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

const DataCentersList = ({ dataCenters = [] }) => {
  if (!Array.isArray(dataCenters)) {
    console.error('Error: dataCenters no es un array', dataCenters)
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Error: Datos no válidos</Typography>
      </Box>
    )
  }

  const [deleteState, setDeleteState] = useState({ open: false, id: null })
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [deleteDataCenter] = useMutation(DELETE_DATA_CENTER_MUTATION, {
    onCompleted: () => {
      toast.success('DataCenter eliminado')
      setDeleteState({ open: false, id: null })
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const getFormattedData = (data) => {
    const headers = [
      'ID',
      'Nombre',
      'Ubicación',
      'Estado',
      'Fecha Creación',
      'Creado por',
      'Última Modificación',
      'Modificado por',
    ]

    return {
      headers,
      data: data.map((item) => [
        item.id,
        item.nombre,
        item.ubicacion,
        formatEnum(item.estado),
        formatDateTime(item.fecha_creacion),
        item.usuario_creacion || 'N/A',
        formatDateTime(item.fecha_modificacion),
        item.usuario_modificacion || 'N/A',
      ]),
    }
  }

  // Exportación PDF mejorada
  const exportToPDF = (data) => {
    const { headers, data: formattedData } = getFormattedData(data)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
    })

    // Título y metadata
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 40, 77)
    doc.text('Reporte de Data Centers', 14, 15)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado: ${formatDateTime(new Date())}`, 14, 22)

    // Tabla con estilos
    autoTable(doc, {
      head: [
        headers.map((h) => ({
          content: h,
          styles: {
            fillColor: [15, 40, 77],
            textColor: 255,
            fontStyle: 'bold',
          },
        })),
      ],
      body: formattedData.map((row, rowIndex) =>
        row.map((cell) => ({
          content: cell,
          styles: {
            fillColor: rowIndex % 2 === 0 ? [248, 249, 250] : [255, 255, 255],
          },
        }))
      ),
      startY: 30,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      margin: { left: 10, right: 10 },
    })

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 10
      )
    }

    doc.save(`datacenters-${new Date().toISOString()}.pdf`)
  }

  // Exportación Excel mejorada
  const exportToExcel = (data) => {
    const { headers, data: formattedData } = getFormattedData(data)
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])

    // Estilos profesionales
    const headerStyle = {
      font: { sz: 12, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '0F284D' } },
      alignment: { horizontal: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    }

    // Título y metadata
    XLSX.utils.sheet_add_aoa(ws, [['Reporte de Data Centers']], {
      origin: 'A1',
    })
    XLSX.utils.sheet_add_aoa(
      ws,
      [[`Generado: ${formatDateTime(new Date())}`]],
      { origin: 'A2' }
    )

    // Cabeceras
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A4' })

    // Datos
    XLSX.utils.sheet_add_aoa(ws, formattedData, { origin: 'A5' })

    // Aplicar estilos
    const range = XLSX.utils.decode_range(ws['!ref'])
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerCell = XLSX.utils.encode_cell({ r: 3, c: C })
      ws[headerCell].s = headerStyle

      for (let R = 4; R <= range.e.r; ++R) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C })
        if (!ws[cell]) ws[cell] = {}
        ws[cell].s = {
          fill: { fgColor: { rgb: R % 2 === 0 ? 'F8F9FA' : 'FFFFFF' } },
          border: {
            top: { style: 'thin', color: { rgb: 'DDDDDD' } },
            bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
            left: { style: 'thin', color: { rgb: 'DDDDDD' } },
            right: { style: 'thin', color: { rgb: 'DDDDDD' } },
          },
        }
      }
    }

    // Autoajuste de columnas
    ws['!cols'] = headers.map((_, col) => ({
      wch:
        Math.max(
          ...formattedData.map((row) => String(row[col]).length),
          headers[col].length
        ) + 2,
    }))

    // Combinar celdas para título
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'DataCenters')
    XLSX.writeFile(wb, `datacenters-${new Date().toISOString()}.xlsx`)
  }

  // Exportación CSV mejorada
  const exportToCSV = (data) => {
    const { headers, data: formattedData } = getFormattedData(data)
    const csvContent = [
      'Reporte de Data Centers',
      `Generado: ${formatDateTime(new Date())}`,
      '',
      headers.join(','),
      ...formattedData.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
      '',
      `*Este archivo fue generado automáticamente el ${formatDateTime(
        new Date()
      )}`,
    ].join('\n')

    const blob = new Blob(['\ufeff', csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `datacenters-${new Date().toISOString()}.csv`
    link.click()
  }

  // Filtrar datos según término de búsqueda
  const filteredDataCenters = useMemo(() => {
    return dataCenters.filter(
      (dataCenter) =>
        dataCenter.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataCenter.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataCenter.id.toString().includes(searchTerm)
    )
  }, [dataCenters, searchTerm])

  return (
    <Box sx={{ p: 2 }}>
      {/* Cabecera con búsqueda y exportación */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: '40%' } }}>
          <input
            type="text"
            placeholder="Buscar data centers..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        <Box>
          <Button
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            startIcon={<FileDownloadIcon />}
            variant="contained"
            size="medium"
            sx={{
              backgroundColor: '#0F284D',
              '&:hover': { backgroundColor: '#1A3D6D' },
            }}
          >
            Exportar Reporte
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                exportToPDF(filteredDataCenters)
                setExportMenuAnchor(null)
              }}
            >
              PDF (Estilizado)
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(filteredDataCenters)
                setExportMenuAnchor(null)
              }}
            >
              Excel (Profesional)
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(filteredDataCenters)
                setExportMenuAnchor(null)
              }}
            >
              CSV (Estándar)
            </MenuItem>
          </Menu>
        </Box>
      </Paper>

      {/* Grid de Cards */}
      <Grid container spacing={3}>
        {filteredDataCenters.length > 0 ? (
          filteredDataCenters.map((dataCenter) => (
            <Grid item xs={12} sm={6} md={4} key={dataCenter.id}>
              <Card
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {dataCenter.nombre}
                    </Typography>
                  }
                  subheader={`ID: ${dataCenter.id}`}
                  action={
                    <Chip
                      label={formatEnum(dataCenter.estado)}
                      color={
                        dataCenter.estado === 'ACTIVO' ? 'success' : 'error'
                      }
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  }
                  sx={{
                    backgroundColor: '#f5f7fa',
                    borderBottom: '1px solid #eee',
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    <strong>Ubicación:</strong> {dataCenter.ubicacion}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>Creado:</strong>{' '}
                    {formatDateTime(dataCenter.fecha_creacion)}
                    {dataCenter.usuario_creacion &&
                      ` por ${dataCenter.usuario_creacion}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Modificado:</strong>{' '}
                    {formatDateTime(dataCenter.fecha_modificacion)}
                    {dataCenter.usuario_modificacion &&
                      ` por ${dataCenter.usuario_modificacion}`}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}
                >
                  <Box>
                    <Tooltip title="Ver hardware">
                      <IconButton
                        component={Link}
                        to={routes.dataCenterServidor({ id: dataCenter.id })}
                        color="primary"
                      >
                        <HardwareIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        component={Link}
                        to={routes.dataCenter({ id: dataCenter.id })}
                        color="info"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Tooltip title="Editar">
                      <IconButton
                        component={Link}
                        to={routes.editDataCenter({ id: dataCenter.id })}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        onClick={() =>
                          setDeleteState({ open: true, id: dataCenter.id })
                        }
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron data centers
                {searchTerm && ` con el término "${searchTerm}"`}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Dialog de confirmación para eliminar */}
      <Dialog
        open={deleteState.open}
        onClose={() => setDeleteState({ open: false, id: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de eliminar el data center {deleteState.id}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button
            onClick={() =>
              deleteDataCenter({ variables: { id: deleteState.id } })
            }
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DataCentersList
