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

import React, { useMemo } from 'react'

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
  // ESTILOS UNIFICADOS DE BOTONES
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
  // ACCIONES DE LISTA (Activos / Eliminar / Exportar)
  // ================================================================
  const ListActionsComponent = useMemo(() => {
    if (!listActionsConfig || !isListView) return null

    const {
      showDeleted,
      selectedRowCount,
      handleSwitchChange,
      handleBulkAction, // Ahora esto abrirá el menú (setAnchor)
      handleExportClick,
      exportMenu,
      bulkActionMenu, // <--- NUEVO: Menú desplegable para eliminar
    } = listActionsConfig

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.4,
          height: '100%',
        }}
      >
        {/* SWITCH Activos / Papelera */}
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
            '.MuiFormControlLabel-label': {
              fontSize: '0.8rem',
              fontWeight: 600,
            },
          }}
        />

        {/* BOTÓN ELIMINAR / RESTAURAR */}
        {/* Modificado para soportar menú desplegable */}
        <Button
          disabled={!selectedRowCount}
          onClick={handleBulkAction}
          startIcon={
            showDeleted ? <RestoreIcon fontSize="small" /> : <DeleteIcon fontSize="small" />
          }
          // Agregamos flecha abajo si estamos en modo activos (para mostrar opciones)
          endIcon={!showDeleted ? <ArrowDownIcon fontSize="small" /> : null}
          variant="outlined"
          color={showDeleted ? 'primary' : 'error'}
          sx={{ ...buttonBaseStyle }}
        >
          {showDeleted
            ? `Restaurar (${selectedRowCount})`
            : `Eliminar (${selectedRowCount})`}
        </Button>
        
        {/* Renderizamos el menú de eliminación aquí */}
        {bulkActionMenu}

        {/* BOTÓN EXPORTAR */}
        <Button
          onClick={handleExportClick}
          startIcon={<ExportIcon fontSize="small" />}
          endIcon={<ArrowDownIcon fontSize="small" />}
          variant="outlined"
          sx={{
            height: 34,
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '12px',
            px: 2,
            display: 'flex',
            alignItems: 'center',

            // Línea verde + texto verde
            borderColor: theme.palette.success.main,
            color: theme.palette.success.main,

            '&:hover': {
              borderColor: theme.palette.success.dark,
              background: theme.palette.success.main + '15', // verde tenue 15% opacity
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

      {/* ===================================== */}
      {/* HEADER SUPERIOR                      */}
      {/* ===================================== */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 1500,
          mx: 'auto',
          minHeight:75,
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
        {/* ... (Resto del Header igual) ... */}
        
        {/* ===================================== */}
        {/* IZQUIERDA — Breadcrumbs               */}
        {/* ===================================== */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            flexGrow: 1,
            minWidth: '40%',
            height: '100%',
          }}
        >
          <Breadcrumbs
            separator={
              <NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            }
          >
            <Link to={routes.home()} style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <HomeIcon sx={{ mr: 0.5, fontSize: '1.4rem' }} />
                <Typography variant="body1" fontWeight={500}>
                  Inicio
                </Typography>
              </Box>
            </Link>

            {groupTitle && (
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                {groupTitle}
              </Typography>
            )}

            {!isListView && titleTo ? (
              <Link to={routes[titleTo]()} style={{ textDecoration: 'none' }}>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  color="text.secondary"
                  sx={{ '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                >
                  {title}
                </Typography>
              </Link>
            ) : (
              <Typography variant="body1" fontWeight={700} color="primary.main">
                {title}
              </Typography>
            )}

            {breadcrumbItems.map((item, i) => (
              <Typography key={i} variant="body1" fontWeight={700} color="primary.main">
                {item.label}
              </Typography>
            ))}
          </Breadcrumbs>
        </Box>

        {/* ===================================== */}
        {/* DERECHA — Acciones + Nuevo             */}
        {/* ===================================== */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            height: '100%',
          }}
        >
          {isListView && ListActionsComponent}

          {isListView && buttonTo && (
            <Button
              variant="contained"
              component={Link}
              to={routes[buttonTo]()}
              startIcon={<AddIcon />}
              sx={{
                ...buttonBaseStyle,
                background: theme.palette.primary.main,
                '&:hover': { background: theme.palette.primary.dark },
              }}
            >
              {buttonLabel}
            </Button>
          )}

          {actionButtons.map((btn, index) => (
            <Button
              key={index}
              variant={btn.variant || 'contained'}
              color={btn.color || 'primary'}
              onClick={btn.onClick}
              startIcon={
                btn.iconName === 'edit' ? (
                  <EditIcon />
                ) : btn.iconName === 'delete' ? (
                  <DeleteIcon />
                ) : null
              }
              sx={{ ...buttonBaseStyle }}
            >
              {btn.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* ===================================== */}
      {/* CONTENIDO PRINCIPAL                   */}
      {/* ===================================== */}
      <Box sx={{ pb: 2, px: 0 }}>
        <Box component="main" sx={{ width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default ScaffoldLayout