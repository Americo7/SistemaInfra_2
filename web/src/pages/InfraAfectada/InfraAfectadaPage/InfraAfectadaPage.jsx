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
import InfraAfectadaCell from 'src/components/InfraAfectada/InfraAfectadaCell'

/* -----------------------
 * GRAPHQL
 * ----------------------- */
const QUERY = gql`
  query GetInfraAfectadaPage($id: Int!) {
    infraAfectada(id: $id) {
      id
      id_evento
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteInfraAfectadaPage($id: Int!) {
    deleteInfraAfectada(id: $id) {
      id
    }
  }
`

const UPDATE_MUTATION = gql`
  mutation SoftDeleteInfraAfectadaPage($id: Int!, $input: UpdateInfraAfectadaInput!) {
    updateInfraAfectada(id: $id, input: $input) {
      id
      estado
    }
  }
`

const InfraAfectadaPage = ({ id }) => {
  const theme = useTheme()

  // --- ESTADOS ---
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)
  
  // Estado para el Dialog: { open: boolean, type: 'soft' | 'hard' }
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null })

  // --- QUERIES & MUTATIONS ---
  const { data } = useQuery(QUERY, { variables: { id } })
  const tituloRegistro = data?.infraAfectada?.id_evento
    ? `Registro asociado al Evento #${data.infraAfectada.id_evento}`
    : `Registro #${id}`

  const [deleteInfraAfectada] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Registro eliminado permanentemente')
      navigate(routes.infraAfectadas())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const [updateInfraAfectada] = useMutation(UPDATE_MUTATION, {
    onCompleted: () => {
      toast.success('Registro desactivado (INACTIVO)')
      navigate(routes.infraAfectadas())
    },
    onError: (err) => toast.error(err?.message || 'Error al desactivar'),
  })

  /* -----------------------
   * HANDLERS MENÚ
   * ----------------------- */
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleSoftDeleteClick = () => {
    handleMenuClose()
    setConfirmDialog({ open: true, type: 'soft' })
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
      updateInfraAfectada({ variables: { id, input: { estado: 'INACTIVO' } } })
    } else if (confirmDialog.type === 'hard') {
      deleteInfraAfectada({ variables: { id } })
    }
  }

  /* -----------------------
   * COMPONENTE MENÚ
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
          secondary="Marcar como INACTIVO"
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
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editInfraAfectada({ id })),
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

  // Lógica visual del Dialog
  const isHardDelete = confirmDialog.type === 'hard'
  const dialogTitle = isHardDelete ? '¿Eliminar permanentemente?' : '¿Desactivar registro?'
  const dialogContent = isHardDelete
    ? `Estás a punto de ELIMINAR PERMANENTEMENTE el "${tituloRegistro}". Esta acción NO se puede deshacer.`
    : `¿Estás seguro de DESACTIVAR el "${tituloRegistro}"?`
  const confirmButtonColor = isHardDelete ? 'error' : 'warning'
  const confirmButtonText = isHardDelete ? 'Eliminar' : 'Desactivar'

  return (
    <>
      <ScaffoldLayout
        title="Infraestructura Afectada"
        titleTo="infraAfectadas"
        groupTitle="Monitorización"
        breadcrumbItems={[{ label: 'Detalle' }]}
        actionButtons={actionButtons}
      >
        <InfraAfectadaCell id={id} />
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

export default InfraAfectadaPage