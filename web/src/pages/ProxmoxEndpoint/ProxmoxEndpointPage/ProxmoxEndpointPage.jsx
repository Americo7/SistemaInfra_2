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
import ProxmoxEndpointCell from 'src/components/ProxmoxEndpoint/ProxmoxEndpointCell'

/* -----------------------
 * GRAPHQL
 * ----------------------- */
const QUERY = gql`
  query ProxmoxEndpoint($id: Int!) {
    proxmoxEndpoint(id: $id) {
      id
      nombre
      estado # <--- IMPORTANTE: Agregado para lógica de estado
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteProxmoxEndpoint($id: Int!) {
    deleteProxmoxEndpoint(id: $id) {
      id
    }
  }
`

const UPDATE_MUTATION = gql`
  mutation SoftDeleteProxmoxEndpoint($id: Int!, $input: UpdateProxmoxEndpointInput!) {
    updateProxmoxEndpoint(id: $id, input: $input) {
      id
      estado
    }
  }
`

const ProxmoxEndpointPage = ({ id }) => {
  const theme = useTheme()

  // --- ESTADOS ---
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null })

  // --- QUERIES & MUTATIONS ---
  const { data, refetch } = useQuery(QUERY, { variables: { id } })
  
  const endpoint = data?.proxmoxEndpoint || {}
  const nombre = endpoint.nombre || 'Cargando…'
  const isActivo = endpoint.estado === 'ACTIVO' // Lógica de estado

  const [deleteItem] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Endpoint eliminado permanentemente')
      navigate(routes.proxmoxEndpoints())
    },
    onError: (e) => toast.error(e.message),
  })

  const [updateItem] = useMutation(UPDATE_MUTATION, {
    onCompleted: (data) => {
      const nuevoEstado = data.updateProxmoxEndpoint.estado
      toast.success(`Endpoint ${nuevoEstado === 'ACTIVO' ? 'restaurado' : 'desactivado'} correctamente`)
      refetch() // Recargamos para actualizar el botón
    },
    onError: (e) => toast.error(e.message),
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
      updateItem({ variables: { id, input: { estado: 'INACTIVO' } } })
    } else if (confirmDialog.type === 'restore') {
      updateItem({ variables: { id, input: { estado: 'ACTIVO' } } })
    } else if (confirmDialog.type === 'hard') {
      deleteItem({ variables: { id } })
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
      <MenuItem onClick={handleToggleStateClick} disableRipple sx={{ py: 1.5 }}>
        <ListItemIcon>
          {isActivo ? <SoftDeleteIcon color="warning" /> : <RestoreIcon color="success" />}
        </ListItemIcon>
        <ListItemText
          primary={isActivo ? "Desactivar" : "Restaurar"}
          secondary={isActivo ? "Marcar como INACTIVO" : "Habilitar/Reactivar endpoint"}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </MenuItem>

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
      onClick: () => navigate(routes.editProxmoxEndpoint({ id })),
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
  
  let dialogTitle = ''
  let dialogContent = ''
  let confirmButtonColor = 'warning'
  let confirmButtonText = 'Desactivar'
  let DialogIcon = SoftDeleteIcon

  if (isHardDelete) {
    dialogTitle = '¿Eliminar permanentemente?'
    dialogContent = `Estás a punto de ELIMINAR PERMANENTEMENTE el endpoint "${nombre}". Esta acción NO se puede deshacer.`
    confirmButtonColor = 'error'
    confirmButtonText = 'Eliminar'
    DialogIcon = HardDeleteIcon
  } else if (isRestore) {
    dialogTitle = '¿Restaurar endpoint?'
    dialogContent = `¿Deseas RESTAURAR el endpoint "${nombre}"? Pasará a estado ACTIVO.`
    confirmButtonColor = 'success'
    confirmButtonText = 'Restaurar'
    DialogIcon = RestoreIcon
  } else {
    // Soft Delete (Desactivar)
    dialogTitle = '¿Desactivar endpoint?'
    dialogContent = `¿Estás seguro de DESACTIVAR el endpoint "${nombre}"? Pasará a estado INACTIVO.`
    confirmButtonColor = 'warning'
    confirmButtonText = 'Desactivar'
    DialogIcon = SoftDeleteIcon
  }

  return (
    <>
      <ScaffoldLayout
        title="Endpoints de Proxmox"
        titleTo="proxmoxEndpoints"
        groupTitle="Sincronización"
        breadcrumbItems={[
          { label: nombre }
        ]}
        actionButtons={actionButtons}
      >
        <ProxmoxEndpointCell id={id} />
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

export default ProxmoxEndpointPage