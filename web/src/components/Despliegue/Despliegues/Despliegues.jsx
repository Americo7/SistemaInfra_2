import React, { useState, useMemo, useRef } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Print as PrintIcon,
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
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material'

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'

import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
  exportSystemReportToPDF,
  exportSystemReportToExcel,
} from 'src/lib/exporter/desplieguesExporter'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

import { QUERY } from 'src/components/Despliegue/DesplieguesCell'

/* ===========================================================================
   MUTATION
=========================================================================== */

const UPDATE_DESPLIEGUE_MUTATION = gql`
  mutation UpdateDespliegue($id: Int!, $input: UpdateDespliegueInput!) {
    updateDespliegue(id: $id, input: $input) {
      id
      estado
    }
  }
`

/* ===========================================================================
   UTIL
=========================================================================== */

const formatDateTime = (value) => {
  if (!value) return '-'
  try {
    return format(parseISO(value), 'dd/MM/yyyy HH:mm', { locale: es })
  } catch {
    return '-'
  }
}

/* ===========================================================================
   COMPONENT
=========================================================================== */

const DesplieguesList = ({ despliegues, usuarios, parametros }) => {
  const [showInactive, setShowInactive] = useState(false)
  const [exportMenu, setExportMenu] = useState({ all: null, page: null, sel: null })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, row: null })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [currentTab, setCurrentTab] = useState(0)
  const reportRef = useRef()

  /* ---------------------------------------------------------
     Helpers basados en relaciones reales
  --------------------------------------------------------- */

  const helpers = {
    componente: (d) => d.componentes?.nombre || 'N/A',

    sistema: (d) =>
      d.componentes?.sistemas?.nombre ||
      d.componentes?.sistemas?.[0]?.nombre ||
      'N/A',

    maquina: (d) => d.maquinas?.nombre || 'N/A',

    servidor: (d) => {
      const s =
        d.servidores ||
        d.maquinas?.servidores

      if (!s) return 'N/A'

      let txt = s.nombre
      if (s.cod_tipo_servidor) txt += ` (${s.cod_tipo_servidor})`
      return txt
    },

    respaldoNombre: (codigo) => {
      const p = parametros?.find((x) => x.codigo === codigo)
      return p?.nombre || codigo
    },
  }

  /* ---------------------------------------------------------
     Filtrado
  --------------------------------------------------------- */

  const filteredData = useMemo(() => {
    if (!despliegues) return []
    return despliegues.filter((d) =>
      showInactive ? d.estado === 'INACTIVO' : d.estado === 'ACTIVO'
    )
  }, [despliegues, showInactive])

  /* ---------------------------------------------------------
     Agrupación por sistema
  --------------------------------------------------------- */

  const systemReport = useMemo(() => {
    const map = new Map()

    filteredData.forEach((d) => {
      const sistema = helpers.sistema(d)

      if (!map.has(sistema)) {
        map.set(sistema, { sistema, despliegues: [] })
      }

      map.get(sistema).despliegues.push({
        fecha_despliegue: formatDateTime(d.fecha_despliegue),
        fecha_solicitud: formatDateTime(d.fecha_solicitud),
        componente: helpers.componente(d),
        maquina: helpers.maquina(d),
        sistema,
        servidor: helpers.servidor(d),
        solicitante: d.solicitante,
        unidad_solicitante: d.unidad_solicitante,
        referencia_respaldo: d.referencia_respaldo,
      })
    })

    return Array.from(map.values())
  }, [filteredData, parametros])

  /* ---------------------------------------------------------
     Columnas MRT
  --------------------------------------------------------- */

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },

      {
        id: 'componente',
        header: 'Componente',
        size: 120,
        Cell: ({ row }) => helpers.componente(row.original),
      },

      {
        id: 'maquina',
        header: 'Máquina',
        size: 120,
        Cell: ({ row }) => helpers.maquina(row.original),
      },

      {
        id: 'sistema',
        header: 'Sistema',
        size: 120,
        Cell: ({ row }) => helpers.sistema(row.original),
      },

      {
        id: 'servidor',
        header: 'Servidor',
        size: 150,
        Cell: ({ row }) => helpers.servidor(row.original),
      },

      {
        accessorKey: 'fecha_despliegue',
        header: 'Fecha Despliegue',
        size: 140,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },

      {
        accessorKey: 'fecha_solicitud',
        header: 'Fecha Solicitud',
        size: 140,
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },

      {
        accessorKey: 'cod_tipo_respaldo',
        header: 'Tipo Respaldo',
        size: 140,
        Cell: ({ cell }) => helpers.respaldoNombre(cell.getValue()),
      },

      { accessorKey: 'unidad_solicitante', header: 'Unidad', size: 150 },
      { accessorKey: 'solicitante', header: 'Solicitante', size: 150 },
      { accessorKey: 'descripcion', header: 'Descripción', size: 200 },

      {
        accessorKey: 'estado',
        header: 'Estado',
        size: 90,
        Cell: ({ cell }) => (
          <Chip
            size="small"
            label={cell.getValue() === 'ACTIVO' ? 'Activo' : 'Inactivo'}
            color={cell.getValue() === 'ACTIVO' ? 'success' : 'error'}
          />
        ),
      },
    ],
    [parametros]
  )

  /* ---------------------------------------------------------
     MUTATION
  --------------------------------------------------------- */

  const [updateDespliegue] = useMutation(UPDATE_DESPLIEGUE_MUTATION, {
    onCompleted: () => {
      toast.success('Estado actualizado')
      setDeleteDialog({ open: false, id: null })
    },
    onError: (e) => toast.error(e.message),
    refetchQueries: [{ query: QUERY }],
  })

  const confirmarDesactivar = () => {
    updateDespliegue({
      variables: {
        id: deleteDialog.id,
        input: {
          estado: 'INACTIVO',
          fecha_modificacion: new Date().toISOString(),
        },
      },
    })
  }

  /* ---------------------------------------------------------
     Tabla
  --------------------------------------------------------- */

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableRowActions: true,
    enableRowSelection: true,

    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      columnVisibility: { id: false },
    },

    renderRowActions: ({ row }) => (
      <Tooltip title="Acciones">
        <IconButton
          onClick={(e) =>
            setActionMenu({ anchorEl: e.currentTarget, row: row.original })
          }
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
    ),

    renderTopToolbarCustomActions: ({ table }) => {
      const selected = table.getSelectedRowModel().rows

      return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
            }
            label="Mostrar inactivos"
          />

          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={(e) =>
              setExportMenu({ ...exportMenu, all: e.currentTarget })
            }
            sx={{ backgroundColor: '#0F284D' }}
          >
            Exportar Todos
          </Button>

          <Menu
            anchorEl={exportMenu.all}
            open={!!exportMenu.all}
            onClose={() => setExportMenu({ ...exportMenu, all: null })}
          >
            <MenuItem
              onClick={() => {
                exportToPDF(table.getPrePaginationRowModel().rows, table, helpers)
                setExportMenu({ ...exportMenu, all: null })
              }}
            >
              PDF
            </MenuItem>

            <MenuItem
              onClick={() => {
                exportToExcel(table.getPrePaginationRowModel().rows, table, helpers)
                setExportMenu({ ...exportMenu, all: null })
              }}
            >
              Excel
            </MenuItem>

            <MenuItem
              onClick={() => {
                exportToCSV(table.getPrePaginationRowModel().rows, table, helpers)
                setExportMenu({ ...exportMenu, all: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>

          {/* Exportar Página */}
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            sx={{ backgroundColor: '#0F284D' }}
            onClick={(e) =>
              setExportMenu({ ...exportMenu, page: e.currentTarget })
            }
          >
            Exportar Página
          </Button>

          <Menu
            anchorEl={exportMenu.page}
            open={!!exportMenu.page}
            onClose={() => setExportMenu({ ...exportMenu, page: null })}
          >
            <MenuItem
              onClick={() => {
                exportToPDF(table.getRowModel().rows, table, helpers)
                setExportMenu({ ...exportMenu, page: null })
              }}
            >
              PDF
            </MenuItem>

            <MenuItem
              onClick={() => {
                exportToExcel(table.getRowModel().rows, table, helpers)
                setExportMenu({ ...exportMenu, page: null })
              }}
            >
              Excel
            </MenuItem>

            <MenuItem
              onClick={() => {
                exportToCSV(table.getRowModel().rows, table, helpers)
                setExportMenu({ ...exportMenu, page: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>

          {/* Exportar selección */}
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            disabled={selected.length === 0}
            sx={{ backgroundColor: '#0F281D' }}
            onClick={(e) =>
              setExportMenu({ ...exportMenu, sel: e.currentTarget })
            }
          >
            Exportar Selección ({selected.length})
          </Button>

          <Menu
            anchorEl={exportMenu.sel}
            open={!!exportMenu.sel}
            onClose={() => setExportMenu({ ...exportMenu, sel: null })}
          >
            <MenuItem
              onClick={() => {
                exportToPDF(selected, table, helpers)
                setExportMenu({ ...exportMenu, sel: null })
              }}
            >
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(selected, table, helpers)
                setExportMenu({ ...exportMenu, sel: null })
              }}
            >
              Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToCSV(selected, table, helpers)
                setExportMenu({ ...exportMenu, sel: null })
              }}
            >
              CSV
            </MenuItem>
          </Menu>
        </Box>
      )
    },
  })

  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */

  return (
    <Box sx={{ px: 0, py: 0 }}>
      <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
        <Tab label="Tabla Completa" />
        <Tab label="Despliegues por Sistema" />
      </Tabs>

      {currentTab === 0 && <MaterialReactTable table={table} />}

      {currentTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadIcon />}
              sx={{ backgroundColor: '#0F284D' }}
              onClick={() => exportSystemReportToPDF(systemReport)}
            >
              Exportar PDF
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadIcon />}
              sx={{ backgroundColor: '#0F284D' }}
              onClick={() => exportSystemReportToExcel(systemReport)}
            >
              Exportar Excel
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<PrintIcon />}
              sx={{ backgroundColor: '#0F284D' }}
              onClick={() => window.print()}
            >
              Imprimir
            </Button>
          </Box>

          <Box ref={reportRef}>
            {systemReport.map((sys) => (
              <Box key={sys.sistema} sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 'bold', mb: 1 }}>
                  {sys.sistema}
                </Typography>

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#eee' }}>
                        <TableCell>Fecha Despliegue</TableCell>
                        <TableCell>Fecha Solicitud</TableCell>
                        <TableCell>Componente</TableCell>
                        <TableCell>Máquina</TableCell>
                        <TableCell>Servidor</TableCell>
                        <TableCell>Solicitante</TableCell>
                        <TableCell>Unidad</TableCell>
                        <TableCell>Referencia</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {sys.despliegues.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell>{d.fecha_despliegue}</TableCell>
                          <TableCell>{d.fecha_solicitud}</TableCell>
                          <TableCell>{d.componente}</TableCell>
                          <TableCell>{d.maquina}</TableCell>
                          <TableCell>{d.servidor}</TableCell>
                          <TableCell>{d.solicitante}</TableCell>
                          <TableCell>{d.unidad_solicitante}</TableCell>
                          <TableCell>{d.referencia_respaldo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>Desactivar Despliegue</DialogTitle>

        <DialogContent>
          ¿Seguro que deseas desactivar el despliegue #{deleteDialog.id}?
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
            Cancelar
          </Button>

          <Button variant="contained" color="error" onClick={confirmarDesactivar}>
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={() => setActionMenu({ anchorEl: null, row: null })}
      >
        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.despliegue({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={actionMenu.row ? routes.editDespliegue({ id: actionMenu.row.id }) : '#'}
          onClick={() => setActionMenu({ anchorEl: null, row: null })}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionMenu.row) {
              setDeleteDialog({ open: true, id: actionMenu.row.id })
            }
            setActionMenu({ anchorEl: null, row: null })
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Desactivar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default DesplieguesList
