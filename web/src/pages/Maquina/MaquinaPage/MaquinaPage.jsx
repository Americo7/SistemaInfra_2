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

  // Estado para el Dialog de Confirmación
  // Guardamos el tipo de acción ('soft' o 'hard')
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null })

  // 1. Carga de datos básica
  const { data } = useQuery(MAQUINA_QUERY, { variables: { id } })
  const nombreMaquina = data?.maquina?.nombre || 'Cargando...'

  // 2. Mutaciones
  const [deleteMaquina] = useMutation(DELETE_MAQUINA_MUTATION, {
    onCompleted: () => {
      toast.success('Máquina eliminada permanentemente')
      navigate(routes.maquinas())
    },
    onError: (error) => toast.error(error.message),
  })

  const [updateMaquina] = useMutation(UPDATE_MAQUINA_MUTATION, {
    onCompleted: () => {
      toast.success('Máquina desactivada (INACTIVO)')
      navigate(routes.maquinas())
    },
    onError: (error) => toast.error(error.message),
  })

  /* -----------------------
   * HANDLERS
   * ----------------------- */
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  // Abre el diálogo para "Desactivar"
  const handleSoftDeleteClick = () => {
    handleMenuClose()
    setConfirmDialog({ open: true, type: 'soft' })
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
        sx: { mt: 1, minWidth: 240, borderRadius: 2 },
      }}
    >
      <MenuItem onClick={handleSoftDeleteClick} disableRipple sx={{ py: 1.5 }}>
        <ListItemIcon>
          <SoftDeleteIcon color="warning" />
        </ListItemIcon>
        <ListItemText
          primary="Desactivar"
          secondary="Cambiar estado a INACTIVO"
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
   * CONFIGURACIÓN BOTONES
   * ----------------------- */
  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editMaquina({ id })),
    },
    {
      label: 'Opciones',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      endIcon: <ArrowDownIcon />,
      onClick: handleMenuClick,
      menu: deleteMenu,
    },
  ]

  // Determinar textos y colores del diálogo según la acción
  const isHardDelete = confirmDialog.type === 'hard'
  const dialogTitle = isHardDelete ? '¿Eliminar permanentemente?' : '¿Desactivar máquina?'
  const dialogContent = isHardDelete
    ? `Estás a punto de ELIMINAR PERMANENTEMENTE la máquina "${nombreMaquina}". Esta acción NO se puede deshacer.`
    : `¿Estás seguro de DESACTIVAR la máquina "${nombreMaquina}"? Pasará a estado INACTIVO.`
  const confirmButtonColor = isHardDelete ? 'error' : 'warning'
  const confirmButtonText = isHardDelete ? 'Eliminar' : 'Desactivar'

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
       * DIALOGO DE CONFIRMACIÓN (Modal Bonito)
       * ----------------------- */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color={confirmButtonColor} />
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
            startIcon={isHardDelete ? <HardDeleteIcon /> : <SoftDeleteIcon />}
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