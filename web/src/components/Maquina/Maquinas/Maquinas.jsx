import React, { useState, useMemo } from 'react'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
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
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import * as XLSX from 'xlsx-js-style'

import { Link, routes } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

const UPDATE_MAQUINA_MUTATION = gql`
  mutation UpdateMaquinaMutation_fromMaquina($id: Int!, $input: UpdateMaquinaInput!) {
    updateMaquina(id: $id, input: $input) {
      id
      estado
      es_virtual
      cod_plataforma
    }
  }
`

const QUERY_MAQUINAS = gql`
  query FindMaquinas {
    maquinas {
      id
      codigo
      cod_plataforma
      nombre
      ip
      so
      ram
      almacenamiento
      cpu
      es_virtual
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const QUERY_PARAMETRICAS = gql`
  query FindParametricas {
    parametros {
      id
      codigo
      nombre
      grupo
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

const truncate = (text, length = 50) => {
  if (!text) return 'N/A'
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatEnum = (value) => {
  if (!value) return 'N/A'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

const formatBoolean = (value) => {
  return value ? (
    <CheckIcon color="success" fontSize="small" />
  ) : (
    <CloseIcon color="error" fontSize="small" />
  )
}

const parseAlmacenamiento = (value) => {
  try {
    if (!value) return []
    if (typeof value === 'string') {
      return JSON.parse(value)
    }
    if (Array.isArray(value)) {
      return value
    }
    return []
  } catch (e) {
    console.error('Error parsing almacenamiento:', e)
    return []
  }
}

const MaquinasList = () => {
  const { data: maquinasData } = useQuery(QUERY_MAQUINAS)
  const { data: parametricasData } = useQuery(QUERY_PARAMETRICAS)
  const [deleteState, setDeleteState] = useState({ open: false, id: null, estado: 'ACTIVO' })
  const [exportMenuAnchor, setExportMenuAnchor] = useState({
    all: null,
    page: null,
    selection: null,
  })
  const [showInactive, setShowInactive] = useState(false)
  const [virtualFilter, setVirtualFilter] = useState('all') // 'all', 'virtual', 'physical'

  const [updateMaquina] = useMutation(UPDATE_MAQUINA_MUTATION, {
    onCompleted: () => {
      toast.success('Máquina actualizada correctamente')
      setDeleteState({ open: false, id: null, estado: 'ACTIVO' })
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY_MAQUINAS }],
    awaitRefetchQueries: true,
  })

  const getNombrePlataforma = (codigo) => {
    if (!parametricasData?.parametros) return codigo
    const param = parametricasData.parametros.find(p => p.codigo === codigo)
    return param ? param.nombre : codigo
  }

  const toggleEstado = (id, currentEstado) => {
    updateMaquina({
      variables: {
        id: id,
        input: {
          estado: currentEstado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
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

          if (column.id === 'es_virtual') return cellValue ? 'Sí' : 'No'
          if (column.id === 'almacenamiento') {
            const discos = parseAlmacenamiento(cellValue)
            return discos.map(d => `Disco ${d.Disco}: ${d.Valor} GB`).join(', ') || 'N/A'
          }
          if (column.id.includes('fecha_')) return formatDateTime(cellValue)
          if (column.id === 'estado') return formatEnum(cellValue)
          if (column.id === 'cod_plataforma') return getNombrePlataforma(cellValue)
          return truncate(cellValue, 100)
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
    doc.text('Reporte de Máquinas', 14, 15)

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

    doc.save(`maquinas-${new Date().toISOString()}.pdf`)
  }

  const exportToExcel = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])

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

    XLSX.utils.sheet_add_aoa(ws, [['Reporte de Máquinas']], { origin: 'A1' })
    XLSX.utils.sheet_add_aoa(
      ws,
      [[`Generado: ${formatDateTime(new Date())}`]],
      { origin: 'A2' }
    )
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A4' })
    XLSX.utils.sheet_add_aoa(ws, data, { origin: 'A5' })

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

    ws['!cols'] = headers.map((_, col) => ({
      wch:
        Math.max(
          ...data.map((row) => String(row[col]).length),
          headers[col].length
        ) + 2,
    }))

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Máquinas')
    XLSX.writeFile(wb, `maquinas-${new Date().toISOString()}.xlsx`)
  }

  const exportToCSV = (rows, table) => {
    const { headers, data } = getFormattedData(rows, table)
    const csvContent = [
      'Reporte de Máquinas',
      `Generado: ${formatDateTime(new Date())}`,
      '',
      headers.join(','),
      ...data.map((row) =>
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
    link.download = `maquinas-${new Date().toISOString()}.csv`
    link.click()
  }

  const filteredMaquinas = useMemo(() => {
    if (!maquinasData?.maquinas) return []

    let filtered = maquinasData.maquinas

    // Filtro por estado (activo/inactivo)
    if (!showInactive) {
      filtered = filtered.filter((maquina) => maquina.estado === 'ACTIVO')
    }

    // Filtro por tipo de máquina (virtual/física)
    if (virtualFilter === 'virtual') {
      filtered = filtered.filter((maquina) => maquina.es_virtual === true)
    } else if (virtualFilter === 'physical') {
      filtered = filtered.filter((maquina) => maquina.es_virtual === false)
    }

    return filtered
  }, [maquinasData, showInactive, virtualFilter])

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      { accessorKey: 'codigo', header: 'Código', size: 100 },
      {
        accessorKey: 'cod_plataforma',
        header: 'Plataforma',
        size: 120,
        Cell: ({ cell }) => getNombrePlataforma(cell.getValue())
      },
      { accessorKey: 'nombre', header: 'Nombre', size: 150 },
      { accessorKey: 'ip', header: 'IP', size: 120 },
      { accessorKey: 'so', header: 'Sistema Operativo', size: 150 },
      {
        accessorKey: 'es_virtual',
        header: 'Es Virtual',
        size: 100,
        Cell: ({ cell }) => formatBoolean(cell.getValue())
      },
      {
        accessorKey: 'ram',
        header: 'RAM',
        size: 100,
        Cell: ({ cell }) => `${cell.getValue()} GB`
      },
      {
        accessorKey: 'almacenamiento',
        header: 'Almacenamiento',
        size: 200,
        Cell: ({ cell }) => {
          const discos = parseAlmacenamiento(cell.getValue())

          if (!discos.length) {
            return <Chip label="Sin discos" size="small" variant="outlined" />
          }

          return (
            <Stack spacing={0.5}>
              {discos.map((disco, index) => (
                <div key={index}>
                  <Chip
                    label={`Disco ${disco.Disco}: ${disco.Valor} GB`}
                    size="small"
                    variant="outlined"
                  />
                </div>
              ))}
            </Stack>
          )
        },
      },
      {
        accessorKey: 'cpu',
        header: 'CPUs',
        size: 100,
        Cell: ({ cell }) => `${cell.getValue()} Núcleos`
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
        accessorKey: 'fecha_creacion',
        header: 'Fecha Creación',
        size: 150,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      {
        accessorKey: 'usuario_creacion',
        header: 'Creado por',
        size: 120,
        visible: false,
      },
      {
        accessorKey: 'fecha_modificacion',
        header: 'Última Modificación',
        size: 150,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
        visible: false,
      },
      {
        accessorKey: 'usuario_modificacion',
        header: 'Modificado por',
        size: 120,
        visible: false,
      },
    ],
    [parametricasData]
  )

  const table = useMaterialReactTable({
    columns,
    data: filteredMaquinas,
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
        usuario_creacion: false,
        fecha_modificacion: false,
        usuario_modificacion: false,
      },
      density: 'compact',
    },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Ver detalles">
          <IconButton
            component={Link}
            to={routes.maquina({ id: row.original.id })}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton
            component={Link}
            to={routes.editMaquina({ id: row.original.id })}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={row.original.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}>
          <IconButton
            onClick={() =>
              setDeleteState({
                open: true,
                id: row.original.id,
                estado: row.original.estado
              })
            }
          >
            {row.original.estado === 'ACTIVO' ? (
              <DeleteIcon fontSize="small" color="error" />
            ) : (
              <CheckIcon fontSize="small" color="success" />
            )}
          </IconButton>
        </Tooltip>
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

          <ToggleButtonGroup
            value={virtualFilter}
            exclusive
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setVirtualFilter(newValue)
              }
            }}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: 2,
                py: 0.5,
                fontSize: '0.75rem',
              },
            }}
          >
            <ToggleButton value="all">Todas</ToggleButton>
            <ToggleButton value="virtual">Virtuales</ToggleButton>
            <ToggleButton value="physical">Físicas</ToggleButton>
          </ToggleButtonGroup>

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
        onClose={() => setDeleteState({ open: false, id: null, estado: 'ACTIVO' })}
      >
        <DialogTitle>
          {deleteState.estado === 'ACTIVO' ? 'Desactivar Máquina' : 'Activar Máquina'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de {deleteState.estado === 'ACTIVO' ? 'desactivar' : 'activar'} la máquina {deleteState.id}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState({ open: false, id: null, estado: 'ACTIVO' })}>
            Cancelar
          </Button>
          <Button
            onClick={() => toggleEstado(deleteState.id, deleteState.estado)}
            color={deleteState.estado === 'ACTIVO' ? 'error' : 'success'}
            variant="contained"
            sx={{
              backgroundColor: deleteState.estado === 'ACTIVO' ? '#e57373' : '#81c784',
              '&:hover': {
                backgroundColor: deleteState.estado === 'ACTIVO' ? '#ef5350' : '#66bb6a'
              },
            }}
          >
            {deleteState.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MaquinasList
