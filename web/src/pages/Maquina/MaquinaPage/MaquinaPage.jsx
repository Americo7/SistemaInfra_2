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
  CheckCircle as RestoreIcon, // Icono para restaurar
  WarningAmberRounded as WarningIcon,
  Edit as EditIcon,
} from '@mui/icons-material'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import MaquinaCell from 'src/components/Maquina/MaquinaCell'

/* -----------------------
 * GRAPHQL
 * ----------------------- */
const MAQUINA_QUERY = gql`
  query GetMaquinaPage($id: Int!) {
    maquina(id: $id) {
      id
      nombre
      estado  # <--- IMPORTANTE: Agregado para lógica de estado
    }
  }
`

const DELETE_MAQUINA_MUTATION = gql`
  mutation DeleteMaquinaPage($id: Int!) {
    deleteMaquina(id: $id) {
      id
    }
  }
`

const UPDATE_MAQUINA_MUTATION = gql`
  mutation SoftDeleteMaquinaPage($id: Int!, $input: UpdateMaquinaInput!) {
    updateMaquina(id: $id, input: $input) {
      id
      estado
    }
  }
`

const MaquinaPage = ({ id }) => {
  const theme = useTheme()
  // Estado para el menú desplegable
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)

  // Estado para el Dialog: { open: boolean, type: 'soft' | 'hard' | 'restore' }
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null })

  // 1. Carga de datos
  const { data, refetch } = useQuery(MAQUINA_QUERY, { variables: { id } })
  
  const maquina = data?.maquina || {}
  const nombreMaquina = maquina.nombre || 'Cargando...'
  const isActivo = maquina.estado === 'ACTIVO' // Lógica de estado

  // 2. Mutaciones
  const [deleteMaquina] = useMutation(DELETE_MAQUINA_MUTATION, {
    onCompleted: () => {
      toast.success('Máquina eliminada permanentemente')
      navigate(routes.maquinas())
    },
    onError: (error) => toast.error(error.message),
  })

  const [updateMaquina] = useMutation(UPDATE_MAQUINA_MUTATION, {
    onCompleted: (data) => {
      const nuevoEstado = data.updateMaquina.estado
      toast.success(`Máquina ${nuevoEstado === 'ACTIVO' ? 'restaurada' : 'desactivada'} correctamente`)
      refetch() // Recargamos para actualizar el botón
    },
    onError: (error) => toast.error(error.message),
  })

  /* -----------------------
   * HANDLERS
   * ----------------------- */
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  // Maneja tanto Desactivar como Restaurar
  const handleToggleStateClick = () => {
    handleMenuClose()
    setConfirmDialog({ open: true, type: isActivo ? 'soft' : 'restore' })
  }

  // Abre el diálogo para "Eliminar Permanentemente"
  const handleHardDeleteClick = () => {
    handleMenuClose()
    setConfirmDialog({ open: true, type: 'hard' })
  }

  // Cierra el diálogo de confirmación
  const handleCloseConfirm = () => {
    setConfirmDialog({ ...confirmDialog, open: false })
  }

  // Ejecuta la acción confirmada
  const handleConfirmAction = () => {
    handleCloseConfirm()
    if (confirmDialog.type === 'soft') {
      updateMaquina({ variables: { id, input: { estado: 'INACTIVO' } } })
    } else if (confirmDialog.type === 'restore') {
      updateMaquina({ variables: { id, input: { estado: 'ACTIVO' } } })
    } else if (confirmDialog.type === 'hard') {
      deleteMaquina({ variables: { id } })
    }
  }

  /* -----------------------
   * MENU COMPONENT
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
          secondary={isActivo ? "Cambiar estado a INACTIVO" : "Habilitar nuevamente la máquina"}
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
      startIcon: <EditIcon />, // Pasando el componente icono directamente
      variant: 'contained',
      onClick: () => navigate(routes.editMaquina({ id })),
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
  let dialogTitle = ''
  let dialogContent = ''
  let confirmButtonColor = 'primary'
  let confirmButtonText = ''
  let DialogIcon = WarningIcon

  if (confirmDialog.type === 'hard') {
    dialogTitle = '¿Eliminar permanentemente?'
    dialogContent = `Estás a punto de ELIMINAR PERMANENTEMENTE la máquina "${nombreMaquina}". Esta acción NO se puede deshacer.`
    confirmButtonColor = 'error'
    confirmButtonText = 'Eliminar'
    DialogIcon = HardDeleteIcon
  } else if (confirmDialog.type === 'soft') {
    dialogTitle = '¿Desactivar máquina?'
    dialogContent = `¿Estás seguro de DESACTIVAR la máquina "${nombreMaquina}"? Pasará a estado INACTIVO.`
    confirmButtonColor = 'warning'
    confirmButtonText = 'Desactivar'
    DialogIcon = SoftDeleteIcon
  } else if (confirmDialog.type === 'restore') {
    dialogTitle = '¿Restaurar máquina?'
    dialogContent = `¿Deseas RESTAURAR la máquina "${nombreMaquina}"? Pasará a estado ACTIVO.`
    confirmButtonColor = 'success'
    confirmButtonText = 'Restaurar'
    DialogIcon = RestoreIcon
  }

  return (
    <>
      <ScaffoldLayout
        title="Máquinas"
        titleTo="maquinas"
        groupTitle="Infraestructura"
        breadcrumbItems={[{ label: nombreMaquina }]}
        actionButtons={actionButtons}
      >
        <MaquinaCell id={id} />
      </ScaffoldLayout>

      {/* -----------------------
       * DIALOGO DE CONFIRMACIÓN
       * ----------------------- */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DialogIcon color={confirmButtonColor} />
          {dialogTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
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

export default MaquinaPage