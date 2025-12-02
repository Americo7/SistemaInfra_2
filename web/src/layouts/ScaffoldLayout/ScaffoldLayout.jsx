import { Link, routes } from '@redwoodjs/router'
import { Toaster } from '@redwoodjs/web/toast'
import {
  Box,
  Button,
  Typography,
  useTheme,
  Breadcrumbs,
  Link as MuiLink,
  alpha,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material'

const ScaffoldLayout = ({
  title,              // Ej: "Clusters"
  titleTo,            // Ej: "clusters" (nombre de la ruta)
  groupTitle,         // Ej: "Infraestructura" (NUEVO PROP)
  buttonLabel,
  buttonTo,
  children,
  breadcrumbItems = [], // Items extra para (Nuevo / Editar / Detalle)
  actionButtons = [],
}) => {
  const theme = useTheme()

  // Detectamos si estamos en la vista de Lista (sin items extra)
  const isListView = breadcrumbItems.length === 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
      
      {/* Header Container */}
      <Box
        sx={{
          width: '100%', maxWidth: 1500, mx: 'auto' ,
          minHeight: 75,
          px: 5,
          py: 2,
          mt: 1,
          mb: 0, // → sin espacio abajo
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderTopLeftRadius: 12,    // ← arriba redondeado
          borderTopRightRadius: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >

        {/* === BREADCRUMBS AUTOMÁTICOS === */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />} 
          aria-label="breadcrumb"
        >
          {/* NIVEL 1: INICIO */}
          <Link to={routes.home()} style={{ textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              <HomeIcon sx={{ mr: 0.5, fontSize: '1.5rem' }} />
              <Typography variant="body1" fontWeight={500}>Inicio</Typography>
            </Box>
          </Link>

          {/* NIVEL 2: AGRUPADOR (Infraestructura) */}
          {groupTitle && (
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              {groupTitle}
            </Typography>
          )}

          {/* NIVEL 3: TÍTULO DE ENTIDAD (Clusters) */}
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
             <Typography 
               variant="body1" 
               sx={{ 
                 fontWeight: 700, 
                 color: 'primary.main',
               }}
             >
               {title}
             </Typography>
          )}

          {/* NIVEL 4: SUB-PÁGINAS (Nuevo / Editar / ID) */}
          {breadcrumbItems.map((item, index) => (
             <Typography key={index} variant="body1" fontWeight={700} color="primary.main">
               {item.label}
             </Typography>
          ))}

        </Breadcrumbs>

        {/* === BOTONES DE ACCIÓN === */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          
          {/* Botón "Nuevo" (Solo visible en la lista) */}
          {isListView && buttonTo && (
            <Button
              variant="contained"
              component={Link}
              to={routes[buttonTo]()}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: '12px',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                textTransform: 'none',
                fontWeight: 600,
                // AQUÍ SE USA ALPHA
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {buttonLabel}
            </Button>
          )}

          {/* Botones Custom (Editar/Eliminar en vistas de detalle) */}
          {actionButtons.map((btn, index) => (
             <Button
                key={index}
                variant={btn.variant || 'contained'}
                color={btn.color || 'primary'}
                onClick={btn.onClick}
                startIcon={
                  btn.iconName === 'edit' ? <EditIcon /> : 
                  btn.iconName === 'delete' ? <DeleteIcon /> : null
                }
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
             >
               {btn.label}
             </Button>
          ))}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ pb: 6, px: 0 }}>
        <Box component="main" sx={{ width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default ScaffoldLayout