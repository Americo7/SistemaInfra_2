import React, { useState, useMemo } from 'react'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import * as XLSX from 'xlsx-js-style'

import { Link, routes } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Evento/EventosCell'
import { formatEnum, jsonTruncate, timeTag, truncate } from 'src/lib/formatters'

const UPDATE_EVENTO_MUTATION = gql`
  mutation UpdateEventoMutation_fromEvento(
    $id: Int!
    $input: UpdateEventoInput!
  ) {
    updateEvento(id: $id, input: $input) {
      id
      estado
    }
  }
`

const USUARIOS_QUERY = gql`
  query UsuariosQuery {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

const INFRA_QUERY = gql`
  query InfraQuery {
    dataCenters {
      id
      nombre
    }
    servidores {
      id
      nombre
    }
    maquinas {
      id
      nombre
    }
  }
`

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

const EventosList = ({ eventos = [] }) => {
  const [deleteState, setDeleteState] = useState({ open: false, id: null })
  const [exportMenuAnchor, setExportMenuAnchor] = useState({
    all: null,
    page: null,
    selection: null,
  })
  const [showInactive, setShowInactive] = useState(false)

  const { data: usuariosData } = useQuery(USUARIOS_QUERY)
  const { data: infraData } = useQuery(INFRA_QUERY)
  const usuarios = usuariosData?.usuarios || []
  const dataCenters = infraData?.dataCenters || []
  const servidores = infraData?.servidores || []
  const maquinas = infraData?.maquinas || []

  const [updateEvento] = useMutation(UPDATE_EVENTO_MUTATION, {
    onCompleted: () => {
      toast.success('Evento desactivado correctamente')
      setDeleteState({ open: false, id: null })
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const getNombreUsuario = (id) => {
    const usuario = usuarios.find(u => u.id === id)
    return usuario
      ? `${usuario.nombres} ${usuario.primer_apellido} ${usuario.segundo_apellido}`
      : 'Desconocido'
  }

  const getNombresResponsables = (ids) => {
    return ids
      .map((id) => {
        const usuario = usuarios.find((u) => u.id === id)
        return usuario
          ? `${usuario.nombres} ${usuario.primer_apellido} ${usuario.segundo_apellido}`
          : 'Desconocido'
      })
      .join(', ')
  }

  const getInfraAfectada = (eventoId) => {
    const infra = []
    eventos.find(e => e.id === eventoId)?.infra_afectada?.forEach(item => {
      if (item.id_data_center) {
        const dc = dataCenters.find(dc => dc.id === item.id_data_center)
        if (dc) infra.push(`DC: ${dc.nombre}`)
      }
      if (item.id_servidor) {
        const serv = servidores.find(s => s.id === item.id_servidor)
        if (serv) infra.push(`Servidor: ${serv.nombre}`)
      }
      if (item.id_maquina) {
        const maq = maquinas.find(m => m.id === item.id_maquina)
        if (maq) infra.push(`Máquina: ${maq.nombre}`)
      }
    })
    return infra.join(', ') || 'N/A'
  }

  const desactivarEvento = (id) => {
    updateEvento({
      variables: {
        id: id,
        input: {
          estado: 'INACTIVO',
          fecha_modificacion: new Date().toISOString(),
        },
      },
    })
  }

  const getFormattedData = (rows, table) => {
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter(
        (column) =>
          column.id !== 'mrt-row-actions' && column.id !== 'mrt-row-select'
      )

    const headers = visibleColumns.map((column) => column.columnDef.header)

    return {
      headers,
      data: rows.map((row) =>
        visibleColumns.map((column) => {
          const cellValue = row.original[column.id] || 'N/A'

          if (column.id.includes('fecha_')) return formatDateTime(cellValue)
          if (column.id === 'estado' || column.id === 'estado_evento')
            return formatEnum(cellValue)
          if (column.id === 'responsables') return getNombresResponsables(cellValue)
          if (column.id === 'infra_afectada') return getInfraAfectada(row.original.id)
          if (column.id === 'usuario_creacion' || column.id === 'usuario_modificacion')
            return getNombreUsuario(cellValue)
          return String(cellValue)
        })
      ),
    }
  }

  const exportToPDF = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
    })

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 40, 77)
    doc.text('Reporte de Eventos', 14, 15)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado: ${formatDateTime(new Date())}`, 14, 22)

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
      body: data.map((row, rowIndex) =>
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
      columnStyles: {
        Responsables: { cellWidth: 'auto', minCellWidth: 60 },
        InfraAfectada: { cellWidth: 'auto', minCellWidth: 80 },
      },
      margin: { left: 10, right: 10 },
    })

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

    doc.save(`eventos-${new Date().toISOString()}.pdf`)
  }

  const exportToExcel = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

    // Estilos para el encabezado
    const headerStyle = {
      fill: { fgColor: { rgb: "0F284D" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    }

    // Aplicar estilos al encabezado
    for (let i = 0; i < headers.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i })
      ws[cellRef].s = headerStyle
    }

    // Aplicar estilos a las filas
    for (let r = 1; r <= data.length; r++) {
      for (let c = 0; c < headers.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c })
        ws[cellRef].s = {
          fill: { fgColor: { rgb: r % 2 === 0 ? "F8F9FA" : "FFFFFF" } },
          alignment: { wrapText: true },
        }
      }
    }

    // Ajustar ancho de columnas
    ws['!cols'] = headers.map(() => ({ width: 20 }))

    XLSX.utils.book_append_sheet(wb, ws, "Eventos")
    XLSX.writeFile(wb, `eventos-${new Date().toISOString()}.xlsx`)
  }

  const exportToCSV = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `eventos-${new Date().toISOString()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredEventos = useMemo(() => {
    if (showInactive) {
      return eventos
    }
    return eventos.filter((evento) => evento.estado === 'ACTIVO')
  }, [eventos, showInactive])

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      {
        accessorKey: 'cod_evento',
        header: 'Código Evento',
        size: 120,
      },
      {
        accessorKey: 'cod_tipo_evento',
        header: 'Código Tipo Evento',
        size: 120,
      },
      { accessorKey: 'descripcion', header: 'Descripción', size: 200 },
      {
        accessorKey: 'fecha_evento',
        header: 'Fecha Evento',
        size: 120,
        Cell: ({ cell }) => timeTag(cell.getValue()),
      },
      {
        accessorKey: 'responsables',
        header: 'Responsables',
        size: 250,
        Cell: ({ cell }) => (
          <div
            style={{
              whiteSpace: 'nowrap',
              overflowX: 'auto',
              padding: '4px 0',
              maxWidth: '400px'
            }}
          >
            {getNombresResponsables(cell.getValue())}
          </div>
        ),
      },
      {
        accessorKey: 'infra_afectada',
        header: 'Infraestructura Afectada',
        size: 250,
        Cell: ({ row }) => (
          <div
            style={{
              whiteSpace: 'nowrap',
              overflowX: 'auto',
              padding: '4px 0',
              maxWidth: '400px'
            }}
          >
            {getInfraAfectada(row.original.id)}
          </div>
        ),
      },
      {
        accessorKey: 'estado_evento',
        header: 'Estado Evento',
        size: 120,
        Cell: ({ row }) => (
          <Chip
            label={formatEnum(row.original.estado_evento)}
            color={row.original.estado_evento === 'INICIADO' ? 'success' : 'error'}
            size="small"
          />
        ),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 100,
        Cell: ({ row }) => (
          <Chip
            label={formatEnum(row.original.estado)}
            color={row.original.estado === 'ACTIVO' ? 'success' : 'error'}
            size="small"
          />
        ),
      },
      {
        accessorKey: 'cite',
        header: 'Cite',
        size: 120,
      },
      {
        accessorKey: 'solicitante',
        header: 'Solicitante',
        size: 150,
      },
      {
        accessorKey: 'fecha_creacion',
        header: 'Fecha Creación',
        size: 150,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      {
        accessorKey: 'usuario_creacion',
        header: 'Usuario Creación',
        size: 180,
        Cell: ({ cell }) => getNombreUsuario(cell.getValue()),
      },
      {
        accessorKey: 'fecha_modificacion',
        header: 'Fecha Modificación',
        size: 150,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      {
        accessorKey: 'usuario_modificacion',
        header: 'Usuario Modificación',
        size: 180,
        Cell: ({ cell }) => getNombreUsuario(cell.getValue()),
      },
    ],
    [usuarios, dataCenters, servidores, maquinas]
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredEventos,
    enableRowActions: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row) => row.id.toString(),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: {
        cursor: 'pointer',
        backgroundColor: row.getIsSelected()
          ? 'rgba(0, 0, 255, 0.1)'
          : undefined,
      },
    }),
    initialState: {
      showGlobalFilter: true,
      columnVisibility: {
        // Estos campos ahora son visibles por defecto
        // usuario_creacion: false,
        // fecha_modificacion: false,
        // usuario_modificacion: false,
      },
      density: 'compact',
    },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Ver detalles">
          <IconButton
            component={Link}
            to={routes.evento({ id: row.original.id })}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton
            component={Link}
            to={routes.editEvento({ id: row.original.id })}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {row.original.estado === 'ACTIVO' && (
          <Tooltip title="Desactivar">
            <IconButton
              onClick={() =>
                setDeleteState({ open: true, id: row.original.id })
              }
            >
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().rows
      const hasSelection = selectedRows.length > 0

      return (
        <Box
          sx={{
            display: 'flex',
            gap: '16px',
            p: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                size="small"
              />
            }
            label="Mostrar inactivos"
          />

          <Button
            disabled={table.getPrePaginationRowModel().rows.length === 0}
            onClick={(e) =>
              setExportMenuAnchor({ ...exportMenuAnchor, all: e.currentTarget })
            }
            startIcon={<FileDownloadIcon />}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#0F284D',
              '&:hover': { backgroundColor: '#1A3D6D' },
            }}
          >
            Exportar Todos
          </Button>
          <Menu
            anchorEl={exportMenuAnchor.all}
            open={Boolean(exportMenuAnchor.all)}
            onClose={() =>
              setExportMenuAnchor({ ...exportMenuAnchor, all: null })
            }
          >
            <MenuItem
              onClick={() => {
                exportToPDF(table.getPrePaginationRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, all: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(table.getPrePaginationRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, all: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(table.getPrePaginationRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, all: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>

          <Button
            disabled={table.getRowModel().rows.length === 0}
            onClick={(e) =>
              setExportMenuAnchor({
                ...exportMenuAnchor,
                page: e.currentTarget,
              })
            }
            startIcon={<FileDownloadIcon />}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#0F284D',
              '&:hover': { backgroundColor: '#1A3D6D' },
            }}
          >
            Exportar Página
          </Button>
          <Menu
            anchorEl={exportMenuAnchor.page}
            open={Boolean(exportMenuAnchor.page)}
            onClose={() =>
              setExportMenuAnchor({ ...exportMenuAnchor, page: null })
            }
          >
            <MenuItem
              onClick={() => {
                exportToPDF(table.getRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, page: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(table.getRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, page: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(table.getRowModel().rows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, page: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>

          <Button
            disabled={!hasSelection}
            onClick={(e) =>
              setExportMenuAnchor({
                ...exportMenuAnchor,
                selection: e.currentTarget,
              })
            }
            startIcon={<FileDownloadIcon />}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#0F284D',
              '&:hover': { backgroundColor: '#1A3D6D' },
            }}
          >
            Exportar Selección ({hasSelection ? selectedRows.length : 0})
          </Button>
          <Menu
            anchorEl={exportMenuAnchor.selection}
            open={Boolean(exportMenuAnchor.selection)}
            onClose={() =>
              setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
            }
          >
            <MenuItem
              onClick={() => {
                exportToPDF(selectedRows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(selectedRows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(selectedRows, table)
                setExportMenuAnchor({ ...exportMenuAnchor, selection: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>
        </Box>
      )
    },
  })

  return (
    <Box sx={{ p: 1 }}>
      <MaterialReactTable table={table} />

      <Dialog
        open={deleteState.open}
        onClose={() => setDeleteState({ open: false, id: null })}
      >
        <DialogTitle>Confirmar Desactivación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de desactivar el evento {deleteState.id}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button
            onClick={() => desactivarEvento(deleteState.id)}
            color="error"
            variant="contained"
            sx={{
              backgroundColor: '#e57373',
              '&:hover': { backgroundColor: '#ef5350' },
            }}
          >
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EventosList
