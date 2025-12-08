import React, { useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { Toaster } from '@redwoodjs/web/toast'

import {
  Box,
  Button,
  Typography,
  useTheme,
  Breadcrumbs,
  FormControlLabel,
  Switch,
} from '@mui/material'

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  RestoreFromTrash as RestoreIcon,
  FileDownload as ExportIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material'

const ScaffoldLayout = ({
  title,
  titleTo,
  groupTitle,
  buttonLabel,
  buttonTo,
  children,
  breadcrumbItems = [],
  actionButtons = [],
  listActionsConfig = null,
}) => {
  const theme = useTheme()
  const isListView = breadcrumbItems.length === 0

  // ================================================================
  // ESTILOS
  // ================================================================
  const buttonBaseStyle = {
    height: 34,
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 1,
    px: 1.8,
    display: 'flex',
    alignItems: 'center',
  }

  // ================================================================
  // ACCIONES DE LISTA (Bulk Actions)
  // ================================================================
  const ListActionsComponent = useMemo(() => {
    if (!listActionsConfig || !isListView) return null
    const {
      showDeleted,
      selectedRowCount,
      handleSwitchChange,
      handleBulkAction,
      handleExportClick,
      exportMenu,
      bulkActionMenu,
    } = listActionsConfig

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4, height: '100%' }}>
        <FormControlLabel
          label={showDeleted ? 'Papelera' : 'Activos'}
          control={
            <Switch
              checked={showDeleted}
              onChange={handleSwitchChange}
              color="primary"
              size="small"
              sx={{ p: 0.3 }}
            />
          }
          sx={{
            m: 0,
            display: 'flex',
            alignItems: 'center',
            height: 34,
            '.MuiFormControlLabel-label': { fontSize: '0.8rem', fontWeight: 600 },
          }}
        />

        <Button
          disabled={!selectedRowCount}
          onClick={handleBulkAction}
          startIcon={showDeleted ? <RestoreIcon fontSize="small" /> : <DeleteIcon fontSize="small" />}
          endIcon={!showDeleted ? <ArrowDownIcon fontSize="small" /> : null}
          variant="outlined"
          color={showDeleted ? 'primary' : 'error'}
          sx={{ ...buttonBaseStyle }}
        >
          {showDeleted ? `Restaurar (${selectedRowCount})` : `Eliminar (${selectedRowCount})`}
        </Button>
        {bulkActionMenu}

        <Button
          onClick={handleExportClick}
          startIcon={<ExportIcon fontSize="small" />}
          endIcon={<ArrowDownIcon fontSize="small" />}
          variant="outlined"
          sx={{
            ...buttonBaseStyle,
            borderRadius: '12px',
            px: 2,
            borderColor: theme.palette.success.main,
            color: theme.palette.success.main,
            '&:hover': {
              borderColor: theme.palette.success.dark,
              background: theme.palette.success.main + '15',
            },
          }}
        >
          Exportar
        </Button>
        {exportMenu}
      </Box>
    )
  }, [listActionsConfig, isListView, theme])

  // ================================================================
  // LAYOUT PRINCIPAL
  // ================================================================
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />

      {/* HEADER */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 1500,
          mx: 'auto',
          minHeight: 75,
          px: 5,
          py: 1.5,
          mt: 4,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          borderBottomLeftRadius: '0 !important',
          borderBottomRightRadius: '0 !important',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* BREADCRUMBS */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />}>
            <Link to={routes.home()} style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                <HomeIcon sx={{ mr: 0.5, fontSize: '1.4rem' }} />
                <Typography variant="body1" fontWeight={500}>Inicio</Typography>
              </Box>
            </Link>
            {groupTitle && <Typography variant="body1" color="text.secondary" fontWeight={500}>{groupTitle}</Typography>}
            {!isListView && titleTo ? (
              <Link to={routes[titleTo]()} style={{ textDecoration: 'none' }}>
                <Typography variant="body1" fontWeight={500} color="text.secondary" sx={{ '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>{title}</Typography>
              </Link>
            ) : (
              <Typography variant="body1" fontWeight={700} color="primary.main">{title}</Typography>
            )}
            {breadcrumbItems.map((item, i) => (
              <Typography key={i} variant="body1" fontWeight={700} color="primary.main">{item.label}</Typography>
            ))}
          </Breadcrumbs>
        </Box>

        {/* ACCIONES DERECHA */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
          {isListView && ListActionsComponent}

          {isListView && buttonTo && (
            <Button
              variant="contained"
              component={Link}
              to={routes[buttonTo]()}
              startIcon={<AddIcon />}
              sx={{ ...buttonBaseStyle, background: theme.palette.primary.main, '&:hover': { background: theme.palette.primary.dark } }}
            >
              {buttonLabel}
            </Button>
          )}

          {/* Renderizado de Botones de Acción (Vista Detalle) */}
          {actionButtons.map((btn, index) => (
            <React.Fragment key={index}>
              <Button
                variant={btn.variant || 'contained'}
                color={btn.color || 'primary'}
                onClick={btn.onClick}
                disabled={btn.disabled}
                startIcon={
                  btn.iconName === 'edit' ? <EditIcon /> :
                  btn.iconName === 'delete' ? <DeleteIcon /> :
                  btn.startIcon // Permite pasar un icono custom
                }
                endIcon={btn.endIcon} // Permitimos icono final (flecha)
                sx={{ ...buttonBaseStyle, ...btn.sx }}
              >
                {btn.label}
              </Button>
              {/* Si el botón trae un menú asociado, lo renderizamos aquí */}
              {btn.menu}
            </React.Fragment>
          ))}
        </Box>
      </Box>

      {/* CONTENIDO */}
      <Box sx={{ pb: 2, px: 0 }}>
        <Box component="main" sx={{ width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default ScaffoldLayout