import React, { useState, useMemo } from 'react'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Hardware as HardwareIcon,
  Undo as UndoIcon
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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/DataCenter/DataCentersCell'

const UPDATE_DATA_CENTER_MUTATION = gql`
  mutation UpdateDataCenterMutation($id: Int!, $input: UpdateDataCenterInput!) {
    updateDataCenter(id: $id, input: $input) {
      id
      estado
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

const DataCentersList = ({ dataCenters = [] }) => {
  const [deleteState, setDeleteState] = useState({ open: false, id: null, action: 'deactivate' })
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  const [updateDataCenter] = useMutation(UPDATE_DATA_CENTER_MUTATION, {
    onCompleted: () => {
      toast.success(`Data Center ${deleteState.action === 'deactivate' ? 'desactivado' : 'reactivado'} correctamente`)
      setDeleteState({ open: false, id: null, action: 'deactivate' })
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const toggleDataCenterStatus = (id) => {
    updateDataCenter({
      variables: {
        id: id,
        input: {
          estado: deleteState.action === 'deactivate' ? 'INACTIVO' : 'ACTIVO',
          fecha_modificacion: new Date().toISOString(),
          // usuario_modificacion: currentUser.id // Descomenta cuando tengas autenticación
        }
      }
    })
  }

  const filteredDataCenters = useMemo(() => {
    let result = dataCenters.filter(dataCenter => 
      (dataCenter.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataCenter.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataCenter.id.toString().includes(searchTerm))
    )

    if (!showInactive) {
      result = result.filter(dataCenter => dataCenter.estado === 'ACTIVO')
    }

    return result
  }, [dataCenters, searchTerm, showInactive])

  const exportToPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.text('Reporte de Data Centers', 14, 15)
    autoTable(doc, {
      head: [['ID', 'Nombre', 'Ubicación', 'Estado']],
      body: data.map(item => [item.id, item.nombre, item.ubicacion, item.estado]),
      startY: 20
    })
    doc.save(`datacenters-${new Date().toISOString()}.pdf`)
  }

  const exportToExcel = (data) => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      ID: item.id,
      Nombre: item.nombre,
      Ubicación: item.ubicacion,
      Estado: item.estado
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'DataCenters')
    XLSX.writeFile(wb, `datacenters-${new Date().toISOString()}.xlsx`)
  }

  const exportToCSV = (data) => {
    const csvContent = [
      'ID,Nombre,Ubicación,Estado',
      ...data.map(item => `${item.id},"${item.nombre}","${item.ubicacion}",${item.estado}`)
    ].join('\n')
    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `datacenters-${new Date().toISOString()}.csv`
    link.click()
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: { xs: '100%', sm: '40%' } }}>
          <input
            type="text"
            placeholder="Buscar data centers..."
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <ToggleButtonGroup
          value={showInactive}
          exclusive
          onChange={() => setShowInactive(!showInactive)}
          size="small"
        >
          <ToggleButton value={false}>Activos</ToggleButton>
          <ToggleButton value={true}>Inactivos</ToggleButton>
        </ToggleButtonGroup>

        <Box>
          <Button
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            startIcon={<FileDownloadIcon />}
            variant="contained"
            size="medium"
            sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
          >
            Exportar
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem onClick={() => { exportToPDF(filteredDataCenters); setExportMenuAnchor(null) }}>PDF</MenuItem>
            <MenuItem onClick={() => { exportToExcel(filteredDataCenters); setExportMenuAnchor(null) }}>Excel</MenuItem>
            <MenuItem onClick={() => { exportToCSV(filteredDataCenters); setExportMenuAnchor(null) }}>CSV</MenuItem>
          </Menu>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {filteredDataCenters.length > 0 ? (
          filteredDataCenters.map((dataCenter) => (
            <Grid item xs={12} sm={6} md={4} key={dataCenter.id}>
              <Card elevation={3} sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                opacity: dataCenter.estado === 'INACTIVO' ? 0.8 : 1,
                borderLeft: dataCenter.estado === 'INACTIVO' ? '4px solid #f44336' : '4px solid #4caf50'
              }}>
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {dataCenter.nombre}
                      {dataCenter.estado === 'INACTIVO' && (
                        <Chip label="INACTIVO" color="error" size="small" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                  }
                  subheader={`ID: ${dataCenter.id}`}
                  sx={{ backgroundColor: '#f5f7fa', borderBottom: '1px solid #eee' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    <strong>Ubicación:</strong> {dataCenter.ubicacion}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Estado:</strong> {dataCenter.estado}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Última modificación:</strong> {formatDateTime(dataCenter.fecha_modificacion)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
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
                        disabled={dataCenter.estado === 'INACTIVO'}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {dataCenter.estado === 'ACTIVO' ? (
                      <Tooltip title="Desactivar">
                        <IconButton
                          onClick={() => setDeleteState({ open: true, id: dataCenter.id, action: 'deactivate' })}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Reactivar">
                        <IconButton
                          onClick={() => setDeleteState({ open: true, id: dataCenter.id, action: 'activate' })}
                          color="success"
                        >
                          <UndoIcon />
                        </IconButton>
                      </Tooltip>
                    )}
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
                {showInactive && ' inactivos'}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <Dialog
        open={deleteState.open}
        onClose={() => setDeleteState({ open: false, id: null, action: 'deactivate' })}
      >
        <DialogTitle>
          {deleteState.action === 'deactivate' ? 'Desactivar Data Center' : 'Reactivar Data Center'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de {deleteState.action === 'deactivate' ? 'desactivar' : 'reactivar'} el data center {deleteState.id}?
          </Typography>
          {deleteState.action === 'deactivate' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              El data center no se eliminará, solo cambiará su estado a INACTIVO.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState({ open: false, id: null, action: 'deactivate' })}>
            Cancelar
          </Button>
          <Button
            onClick={() => toggleDataCenterStatus(deleteState.id)}
            color={deleteState.action === 'deactivate' ? 'error' : 'success'}
            variant="contained"
          >
            {deleteState.action === 'deactivate' ? 'Desactivar' : 'Reactivar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DataCentersList