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
import { QUERY } from 'src/components/InfraAfectada/InfraAfectadasCell'

// Consultas GraphQL
const UPDATE_INFRA_AFECTADA_MUTATION = gql`
  mutation UpdateInfraAfectadaMutation_fromList(
    $id: Int!
    $input: UpdateInfraAfectadaInput!
  ) {
    updateInfraAfectada(id: $id, input: $input) {
      id
      estado
    }
  }
`

const GET_DATA_CENTERS = gql`
  query GetDataCenters {
    dataCenters {
      id
      nombre
    }
  }
`

const GET_SERVIDORES = gql`
  query GetServidores {
    servidores {
      id
      serie
      modelo
      cod_tipo_servidor
    }
  }
`

const GET_MAQUINAS = gql`
  query GetMaquinas {
    maquinas {
      id
      nombre
    }
  }
`

const GET_PARAMETROS_TIPO_SERVIDOR = gql`
  query GetParametrosTipoServidor {
    parametros {
      codigo
      nombre
    }
  }
`

const GET_EVENTOS = gql`
  query GetEventos {
    eventos {
      id
      descripcion
    }
  }
`

const GET_USUARIOS = gql`
  query GetUsuarios_fromInfraLista {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

// Funciones de utilidad
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
  return text?.length > length ? `${text.substring(0, length)}...` : text || 'N/A'
}

const formatEnum = (value) => {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : 'N/A'
}

const formatUserName = (user) => {
  if (!user) return 'N/A'
  return `${user.nombres} ${user.primer_apellido} ${user.segundo_apellido || ''}`.trim()
}

// Componente principal
const InfraAfectadasList = ({ infraAfectadas = [] }) => {
  // Estados
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [exportMenuAnchor, setExportMenuAnchor] = useState({
    all: null,
    page: null,
    selection: null,
  })
  const [showInactive, setShowInactive] = useState(false)

  // Consultas de datos relacionados
  const { data: dataCentersData } = useQuery(GET_DATA_CENTERS)
  const { data: servidoresData } = useQuery(GET_SERVIDORES)
  const { data: maquinasData } = useQuery(GET_MAQUINAS)
  const { data: tipoServidorData } = useQuery(GET_PARAMETROS_TIPO_SERVIDOR)
  const { data: eventosData } = useQuery(GET_EVENTOS)
  const { data: usuariosData } = useQuery(GET_USUARIOS)

  // Mapeo de datos para búsqueda rápida
  const dataMaps = useMemo(() => {
    const maps = {
      dataCenters: {},
      maquinas: {},
      tipoServidor: {},
      servidores: {},
      eventos: {},
      usuarios: {}
    }

    // Mapear Data Centers
    dataCentersData?.dataCenters?.forEach(dc => {
      maps.dataCenters[dc.id] = dc.nombre
    })

    // Mapear Máquinas
    maquinasData?.maquinas?.forEach(maq => {
      maps.maquinas[maq.id] = maq.nombre
    })

    // Mapear Tipos de Servidor
    tipoServidorData?.parametros?.forEach(param => {
      maps.tipoServidor[param.codigo] = param.nombre
    })

    // Mapear Servidores
    servidoresData?.servidores?.forEach(srv => {
      const tipo = maps.tipoServidor[srv.cod_tipo_servidor] || srv.cod_tipo_servidor
      maps.servidores[srv.id] = `${srv.serie} - ${srv.modelo} (${tipo})`
    })

    // Mapear Eventos
    eventosData?.eventos?.forEach(evento => {
      maps.eventos[evento.id] = evento.descripcion
    })

    // Mapear Usuarios
    usuariosData?.usuarios?.forEach(user => {
      maps.usuarios[user.id] = {
        nombres: user.nombres,
        primer_apellido: user.primer_apellido,
        segundo_apellido: user.segundo_apellido
      }
    })

    return maps
  }, [dataCentersData, maquinasData, tipoServidorData, servidoresData, eventosData, usuariosData])

  // Mutación para actualizar estado
  const [updateInfraAfectada] = useMutation(UPDATE_INFRA_AFECTADA_MUTATION, {
    onCompleted: () => {
      toast.success('Estado actualizado correctamente')
      setDeleteDialog({ open: false, id: null })
    },
    onError: (error) => {
      toast.error(`Error al actualizar: ${error.message}`)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  // Filtrar y enriquecer datos
  const enrichedData = useMemo(() => {
    const filtered = showInactive
      ? infraAfectadas
      : infraAfectadas.filter(infra => infra.estado === 'ACTIVO')

    return filtered.map(infra => ({
      ...infra,
      data_center_nombre: infra.id_data_center ? dataMaps.dataCenters[infra.id_data_center] || 'N/A' : 'N/A',
      servidor_nombre: infra.id_servidor ? dataMaps.servidores[infra.id_servidor] || 'N/A' : 'N/A',
      maquina_nombre: infra.id_maquina ? dataMaps.maquinas[infra.id_maquina] || 'N/A' : 'N/A',
      evento_descripcion: infra.id_evento ? dataMaps.eventos[infra.id_evento] || 'N/A' : 'N/A',
      usuario_creacion_nombre: infra.usuario_creacion ? formatUserName(dataMaps.usuarios[infra.usuario_creacion]) : 'N/A',
      usuario_modificacion_nombre: infra.usuario_modificacion ? formatUserName(dataMaps.usuarios[infra.usuario_modificacion]) : 'N/A',
    }))
  }, [infraAfectadas, showInactive, dataMaps])

  // Funciones de exportación (igual que antes)
  const exportFunctions = {
    pdf: (rows, table) => {
      const { headers, data } = prepareExportData(rows, table)
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 40, 77)
      doc.text('Reporte de Infraestructuras Afectadas', 14, 15)
      doc.setFontSize(10)
      doc.text(`Generado: ${formatDateTime(new Date())}`, 14, 22)

      autoTable(doc, {
        head: [headers.map(h => ({
          content: h,
          styles: { fillColor: [15, 40, 77], textColor: 255, fontStyle: 'bold' }
        }))],
        body: data.map((row, i) =>
          row.map(cell => ({
            content: cell,
            styles: { fillColor: i % 2 ? [255, 255, 255] : [248, 249, 250] }
          }))
        ),
        startY: 30,
        styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
        margin: { left: 10, right: 10 }
      })

      const pages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
          `Página ${i} de ${pages}`,
          doc.internal.pageSize.width - 25,
          doc.internal.pageSize.height - 10
        )
      }

      doc.save(`infraestructuras-afectadas-${new Date().toISOString()}.pdf`)
    },

    excel: (rows, table) => {
      const { headers, data } = prepareExportData(rows, table)
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([
        ['Reporte de Infraestructuras Afectadas'],
        [`Generado: ${formatDateTime(new Date())}`],
        [],
        headers,
        ...data
      ])

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

      const range = XLSX.utils.decode_range(ws['!ref'])
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const headerCell = XLSX.utils.encode_cell({ r: 3, c: C })
        ws[headerCell].s = headerStyle

        for (let R = 4; R <= range.e.r; ++R) {
          const cell = XLSX.utils.encode_cell({ r: R, c: C })
          ws[cell] = ws[cell] || {}
          ws[cell].s = {
            fill: { fgColor: { rgb: R % 2 ? 'FFFFFF' : 'F8F9FA' } },
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
        wch: Math.max(...data.map(row => String(row[col]).length, headers[col].length)) + 2
      }))

      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Infraestructuras Afectadas')
      XLSX.writeFile(wb, `infraestructuras-afectadas-${new Date().toISOString()}.xlsx`)
    },

    csv: (rows, table) => {
      const { headers, data } = prepareExportData(rows, table)
      const csvContent = [
        'Reporte de Infraestructuras Afectadas',
        `Generado: ${formatDateTime(new Date())}`,
        '',
        headers.join(','),
        ...data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        '',
        `*Generado el ${formatDateTime(new Date())}`
      ].join('\n')

      const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `infraestructuras-afectadas-${new Date().toISOString()}.csv`
      link.click()
    }
  }

  const prepareExportData = (rows, table) => {
    const visibleColumns = table.getVisibleLeafColumns()
      .filter(col => !['mrt-row-actions', 'mrt-row-select'].includes(col.id))

    const headers = visibleColumns.map(col => col.columnDef.header)

    const data = rows.map(row =>
      visibleColumns.map(col => {
        const value = row.original[col.id] || 'N/A'
        if (col.id.includes('fecha_')) return formatDateTime(value)
        if (col.id === 'estado') return formatEnum(value)
        return truncate(value, 100)
      })
    )

    return { headers, data }
  }

  // Columnas de la tabla
  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    {
      accessorKey: 'evento_descripcion',
      header: 'Evento',
      size: 200,
      Cell: ({ row }) => truncate(row.original.evento_descripcion, 70),
    },
    {
      accessorKey: 'data_center_nombre',
      header: 'Data Center',
      size: 150,
      Cell: ({ row }) => truncate(row.original.data_center_nombre),
    },
    {
      accessorKey: 'servidor_nombre',
      header: 'Servidor',
      size: 200,
      Cell: ({ row }) => truncate(row.original.servidor_nombre, 70),
    },
    {
      accessorKey: 'maquina_nombre',
      header: 'Máquina',
      size: 150,
      Cell: ({ row }) => truncate(row.original.maquina_nombre),
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
      accessorKey: 'usuario_creacion_nombre',
      header: 'Creado por',
      size: 150,
    },
    {
      accessorKey: 'fecha_modificacion',
      header: 'Fecha Modificación',
      size: 150,
      Cell: ({ cell }) => formatDateTime(cell.getValue()),
    },
    {
      accessorKey: 'usuario_modificacion_nombre',
      header: 'Modificado por',
      size: 150,
    },
  ], [])

  // Configuración de la tabla
  const table = useMaterialReactTable({
    columns,
    data: enrichedData,
    enableRowActions: true,
    enableRowSelection: true,
    initialState: {
      showGlobalFilter: true,
      density: 'compact',
      columnVisibility: {
        fecha_modificacion: false,
        usuario_modificacion_nombre: false,
      },
    },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Ver detalles">
          <IconButton component={Link} to={routes.infraAfectada({ id: row.original.id })}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editInfraAfectada({ id: row.original.id })}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {row.original.estado === 'ACTIVO' && (
          <Tooltip title="Desactivar">
            <IconButton onClick={() => setDeleteDialog({ open: true, id: row.original.id })}>
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedCount = table.getSelectedRowModel().rows.length
      const hasSelection = selectedCount > 0
      const rowCount = table.getPrePaginationRowModel().rows.length
      const pageCount = table.getRowModel().rows.length

      return (
        <Box sx={{ display: 'flex', gap: '16px', p: '8px', flexWrap: 'wrap' }}>
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

          {renderExportButton('all', 'Exportar Todos', rowCount === 0)}
          {renderExportButton('page', 'Exportar Página', pageCount === 0)}
          {renderExportButton('selection', `Exportar Selección (${selectedCount})`, !hasSelection)}
        </Box>
      )
    },
  })

  const renderExportButton = (type, label, disabled) => {
    const getRows = {
      all: table.getPrePaginationRowModel().rows,
      page: table.getRowModel().rows,
      selection: table.getSelectedRowModel().rows
    }[type]

    return (
      <>
        <Button
          disabled={disabled}
          onClick={(e) => setExportMenuAnchor({ ...exportMenuAnchor, [type]: e.currentTarget })}
          startIcon={<FileDownloadIcon />}
          variant="contained"
          size="small"
          sx={{
            backgroundColor: '#0F284D',
            '&:hover': { backgroundColor: '#1A3D6D' },
          }}
        >
          {label}
        </Button>
        <Menu
          anchorEl={exportMenuAnchor[type]}
          open={Boolean(exportMenuAnchor[type])}
          onClose={() => setExportMenuAnchor({ ...exportMenuAnchor, [type]: null })}
        >
          <MenuItem onClick={() => {
            exportFunctions.pdf(getRows, table)
            setExportMenuAnchor({ ...exportMenuAnchor, [type]: null })
          }}>
            PDF
          </MenuItem>
          <MenuItem onClick={() => {
            exportFunctions.excel(getRows, table)
            setExportMenuAnchor({ ...exportMenuAnchor, [type]: null })
          }}>
            Excel
          </MenuItem>
          <MenuItem onClick={() => {
            exportFunctions.csv(getRows, table)
            setExportMenuAnchor({ ...exportMenuAnchor, [type]: null })
          }}>
            CSV
          </MenuItem>
        </Menu>
      </>
    )
  }

  return (
    <Box sx={{ p: 1 }}>
      <MaterialReactTable table={table} />

      {/* Diálogo de confirmación */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
        <DialogTitle>Confirmar Desactivación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de desactivar la infraestructura afectada {deleteDialog.id}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Cancelar</Button>
          <Button
            onClick={() => {
              updateInfraAfectada({
                variables: {
                  id: deleteDialog.id,
                  input: {
                    estado: 'INACTIVO',
                    fecha_modificacion: new Date().toISOString(),
                    // usuario_modificacion: currentUser.id
                  }
                }
              })
            }}
            color="error"
            variant="contained"
          >
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default InfraAfectadasList
