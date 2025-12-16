import { useState } from 'react'
import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
} from '@mui/material'

import {
  KeyboardArrowDown as ArrowDownIcon,
  DeleteForever as HardDeleteIcon,
  Block as SoftDeleteIcon,
  WarningAmberRounded as WarningIcon,
  CheckCircle as RestoreIcon, // Icono para restaurar
  Edit as EditIcon,
} from '@mui/icons-material'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import DataCenterCell from 'src/components/DataCenter/DataCenterCell'

/* -----------------------
 * GRAPHQL
 * ----------------------- */
const QUERY = gql`
  query GetDataCenterPage($id: Int!) {
    dataCenter(id: $id) {
      id
      nombre
      estado # <--- IMPORTANTE: Agregado para lógica de estado
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteDataCenterPage($id: Int!) {
    deleteDataCenter(id: $id) {
      id
    }
  }
`

const UPDATE_MUTATION = gql`
  mutation SoftDeleteDataCenterPage($id: Int!, $input: UpdateDataCenterInput!) {
    updateDataCenter(id: $id, input: $input) {
      id
      estado
    }
  }
`

const DataCenterPage = ({ id }) => {
  const theme = useTheme()

  // --- ESTADOS ---
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)
  
  // Estado para el Dialog: { open: boolean, type: 'soft' | 'hard' | 'restore' }
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null })

  // --- QUERIES & MUTATIONS ---
  const { data, refetch } = useQuery(QUERY, { variables: { id } })
  
  const dataCenter = data?.dataCenter || {}
  const nombreDataCenter = dataCenter.nombre || 'Cargando...'
  const isActivo = dataCenter.estado === 'ACTIVO' // Lógica de estado

  const [deleteDataCenter] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Data Center eliminado permanentemente')
      navigate(routes.dataCenters())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const [updateDataCenter] = useMutation(UPDATE_MUTATION, {
    onCompleted: (data) => {
      const nuevoEstado = data.updateDataCenter.estado
      toast.success(`Data Center ${nuevoEstado === 'ACTIVO' ? 'restaurado' : 'desactivado'} correctamente`)
      refetch() // Recargamos para actualizar el botón
    },
    onError: (err) => toast.error(err?.message || 'Error al desactivar'),
  })

  /* -----------------------
   * HANDLERS MENÚ
   * ----------------------- */
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  // Maneja tanto Desactivar como Restaurar
  const handleToggleStateClick = () => {
    handleMenuClose()
    setConfirmDialog({ open: true, type: isActivo ? 'soft' : 'restore' })
  }

  const handleHardDeleteClick = () => {
    handleMenuClose()
    setConfirmDialog({ open: true, type: 'hard' })
  }

  /* -----------------------
   * HANDLERS DIALOG
   * ----------------------- */
  const handleCloseConfirm = () => {
    setConfirmDialog({ ...confirmDialog, open: false })
  }

  const handleConfirmAction = () => {
    handleCloseConfirm()
    if (confirmDialog.type === 'soft') {
      updateDataCenter({ variables: { id, input: { estado: 'INACTIVO' } } })
    } else if (confirmDialog.type === 'restore') {
      updateDataCenter({ variables: { id, input: { estado: 'ACTIVO' } } })
    } else if (confirmDialog.type === 'hard') {
      deleteDataCenter({ variables: { id } })
    }
  }

  /* -----------------------
   * COMPONENTE MENÚ DINÁMICO
   * ----------------------- */
  const deleteMenu = (
    <Menu
      anchorEl={anchorEl}
      open={openMenu}
      onClose={handleMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 3,
        sx: { mt: 1, minWidth: 260, borderRadius: 2 },
      }}
    >
      {/* Opción Desactivar/Restaurar (Dinámica) */}
      <MenuItem onClick={handleToggleStateClick} disableRipple sx={{ py: 1.5 }}>
        <ListItemIcon>
          {isActivo ? <SoftDeleteIcon color="warning" /> : <RestoreIcon color="success" />}
        </ListItemIcon>
        <ListItemText
          primary={isActivo ? "Desactivar" : "Restaurar"}
          secondary={isActivo ? "Cambiar estado a INACTIVO" : "Habilitar nuevamente el Data Center"}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </MenuItem>

      {/* Opción Eliminar Permanentemente */}
      <MenuItem onClick={handleHardDeleteClick} disableRipple sx={{ color: 'error.main', py: 1.5 }}>
        <ListItemIcon>
          <HardDeleteIcon color="error" />
        </ListItemIcon>
        <ListItemText
          primary="Eliminar Permanentemente"
          secondary="Borrar registro de la BD. Irreversible."
          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
          secondaryTypographyProps={{ variant: 'caption', color: 'error.light' }}
        />
      </MenuItem>
    </Menu>
  )

  /* -----------------------
   * CONFIGURACIÓN BOTONES SCAFFOLD
   * ----------------------- */
  const actionButtons = [
    {
      label: 'Editar',
      startIcon: <EditIcon />,
      variant: 'contained',
      onClick: () => navigate(routes.editDataCenter({ id })),
    },
    {
      label: 'Opciones',
      variant: 'outlined',
      color: 'error',
      endIcon: <ArrowDownIcon />,
      onClick: handleMenuClick,
      menu: deleteMenu,
    },
  ]

  // Lógica visual del Dialog
  const isHardDelete = confirmDialog.type === 'hard'
  const isRestore = confirmDialog.type === 'restore'
  const isSoftDelete = confirmDialog.type === 'soft'

  let dialogTitle = ''
  let dialogContent = ''
  let confirmButtonColor = 'warning'
  let confirmButtonText = 'Desactivar'
  let DialogIcon = SoftDeleteIcon

  if (isHardDelete) {
    dialogTitle = '¿Eliminar permanentemente?'
    dialogContent = `Estás a punto de ELIMINAR PERMANENTEMENTE el Data Center "${nombreDataCenter}". Esta acción podría afectar a servidores y equipos alojados en él y NO se puede deshacer.`
    confirmButtonColor = 'error'
    confirmButtonText = 'Eliminar'
    DialogIcon = HardDeleteIcon
  } else if (isRestore) {
    dialogTitle = '¿Restaurar Data Center?'
    dialogContent = `¿Deseas RESTAURAR el Data Center "${nombreDataCenter}"? Pasará a estado ACTIVO.`
    confirmButtonColor = 'success'
    confirmButtonText = 'Restaurar'
    DialogIcon = RestoreIcon
  } else if (isSoftDelete) {
    dialogTitle = '¿Desactivar Data Center?'
    dialogContent = `¿Estás seguro de DESACTIVAR el Data Center "${nombreDataCenter}"? Pasará a estado INACTIVO.`
    confirmButtonColor = 'warning'
    confirmButtonText = 'Desactivar'
    DialogIcon = SoftDeleteIcon
  }

  return (
    <>
      <ScaffoldLayout
        title="Data Centers"
        titleTo="dataCenters"
        groupTitle="Infraestructura"
        breadcrumbItems={[{ label: 'Detalle' }]}
        actionButtons={actionButtons}
      >
        <DataCenterCell id={id} />
      </ScaffoldLayout>

      {/* -----------------------
       * MODAL DE CONFIRMACIÓN
       * ----------------------- */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500 } }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DialogIcon color={confirmButtonColor} />
          {dialogTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: 'text.primary' }}>
            {dialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseConfirm} color="inherit" sx={{ fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={confirmButtonColor}
            autoFocus
            startIcon={<DialogIcon />}
            sx={{ fontWeight: 600, px: 3 }}
          >
            {confirmButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DataCenterPage