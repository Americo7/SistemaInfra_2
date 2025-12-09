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
  Edit as EditIcon, // Icono editar
} from '@mui/icons-material'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ServidorCell from 'src/components/Servidor/ServidorCell'

/* -----------------------
 * GRAPHQL
 * ----------------------- */
const GET_SERVIDOR_PAGE_QUERY = gql`
  query GetServidorPage($id: Int!) {
    servidor(id: $id) {
      id
      nombre
      estado  # <--- ¡IMPORTANTE! Agregamos esto para saber el estado real
    }
  }
`

const DELETE_SERVIDOR_MUTATION = gql`
  mutation DeleteServidorPage($id: Int!) {
    deleteServidor(id: $id) {
      id
    }
  }
`

const UPDATE_SERVIDOR_MUTATION = gql`
  mutation SoftDeleteServidorPage($id: Int!, $input: UpdateServidorInput!) {
    updateServidor(id: $id, input: $input) {
      id
      estado
    }
  }
`

const ServidorPage = ({ id }) => {
  const theme = useTheme()

  // --- ESTADOS ---
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)
  
  // Estado para el Dialog: { open: boolean, type: 'soft' | 'hard' | 'restore' }
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null })

  // --- QUERIES & MUTATIONS ---
  const { data, refetch } = useQuery(GET_SERVIDOR_PAGE_QUERY, { variables: { id } })
  
  const servidor = data?.servidor || {}
  const nombreServidor = servidor.nombre || 'Cargando...'
  const isActivo = servidor.estado === 'ACTIVO' // <--- Lógica corregida

  const [deleteServidor] = useMutation(DELETE_SERVIDOR_MUTATION, {
    onCompleted: () => {
      toast.success('Servidor eliminado permanentemente')
      navigate(routes.servidors())
    },
    onError: (error) => toast.error(error.message),
  })

  const [updateServidor] = useMutation(UPDATE_SERVIDOR_MUTATION, {
    onCompleted: (data) => {
      const nuevoEstado = data.updateServidor.estado
      toast.success(`Servidor ${nuevoEstado === 'ACTIVO' ? 'restaurado' : 'desactivado'} correctamente`)
      refetch() // Recargamos para actualizar el botón
    },
    onError: (error) => toast.error(error.message),
  })

  /* -----------------------
   * HANDLERS MENÚ
   * ----------------------- */
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  // Maneja tanto Desactivar como Restaurar
  const handleToggleStateClick = () => {
    handleMenuClose()
    // Si es activo -> type 'soft' (para desactivar)
    // Si no es activo -> type 'restore' (para restaurar)
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
      // Desactivar
      updateServidor({ variables: { id, input: { estado: 'INACTIVO' } } })
    } else if (confirmDialog.type === 'restore') {
      // Restaurar
      updateServidor({ variables: { id, input: { estado: 'ACTIVO' } } })
    } else if (confirmDialog.type === 'hard') {
      // Eliminar
      deleteServidor({ variables: { id } })
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
      {/* OPCIÓN 1: DESACTIVAR / RESTAURAR (Dinámico) */}
      <MenuItem onClick={handleToggleStateClick} disableRipple sx={{ py: 1.5 }}>
        <ListItemIcon>
          {isActivo ? <SoftDeleteIcon color="warning" /> : <RestoreIcon color="success" />}
        </ListItemIcon>
        <ListItemText
          primary={isActivo ? "Desactivar" : "Restaurar"}
          secondary={isActivo ? "Cambiar estado a INACTIVO" : "Habilitar nuevamente el servidor"}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </MenuItem>

      {/* OPCIÓN 2: ELIMINAR PERMANENTE */}
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
      startIcon: <EditIcon />, // Pasamos el icono directamente aquí si tu layout lo soporta así
      // O usa iconName: 'edit' si tu layout usa strings
      variant: 'contained',
      onClick: () => navigate(routes.editServidor({ id })),
    },
    {
      label: 'Opciones',
      // iconName: 'delete', // Puedes quitar esto si usas startIcon o endIcon
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
    dialogContent = `Estás a punto de ELIMINAR PERMANENTEMENTE el servidor "${nombreServidor}". Esta acción eliminará también sus relaciones y NO se puede deshacer.`
    confirmButtonColor = 'error'
    confirmButtonText = 'Eliminar'
    DialogIcon = HardDeleteIcon
  } else if (confirmDialog.type === 'soft') {
    dialogTitle = '¿Desactivar servidor?'
    dialogContent = `¿Estás seguro de DESACTIVAR el servidor "${nombreServidor}"? Pasará a estado INACTIVO.`
    confirmButtonColor = 'warning'
    confirmButtonText = 'Desactivar'
    DialogIcon = SoftDeleteIcon
  } else if (confirmDialog.type === 'restore') {
    dialogTitle = '¿Restaurar servidor?'
    dialogContent = `¿Deseas RESTAURAR el servidor "${nombreServidor}"? Pasará a estado ACTIVO.`
    confirmButtonColor = 'success'
    confirmButtonText = 'Restaurar'
    DialogIcon = RestoreIcon
  }

  return (
    <>
      <ScaffoldLayout
        title="Servidores"
        titleTo="servidors"
        groupTitle="Infraestructura"
        breadcrumbItems={[{ label: nombreServidor }]}
        actionButtons={actionButtons}
      >
        <ServidorCell id={id} />
      </ScaffoldLayout>

      {/* -----------------------
       * MODAL DE CONFIRMACIÓN
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

export default ServidorPage