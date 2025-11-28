import { Link, routes } from '@redwoodjs/router'
import { Toaster } from '@redwoodjs/web/toast'
import {
  Box,
  Button,
  Typography,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
} from '@mui/icons-material'

const ScaffoldLayout = ({
  title,
  titleTo,
  buttonLabel,
  buttonTo,
  children,
  breadcrumbItems = [],
  actionButtons = [],
}) => {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>

      {/* Header: Breadcrumbs + Actions */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 2,
          mt: 1,
          mb: 2,
          mx: { xs: 2, sm: 3, md: 4 },
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Breadcrumbs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Link to={routes.home()} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <HomeIcon fontSize="small" sx={{ mr: 0.75, fontSize: '1rem' }} />
              <Typography variant="body1">Inicio</Typography>
            </Box>
          </Link>

          {breadcrumbItems.length === 0 ? (
            <>
              <Typography variant="body1" color="text.disabled" sx={{ mx: 0.5 }}>
                /
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {title}
              </Typography>
            </>
          ) : (
            breadcrumbItems.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="h6" color="text.disabled">/</Typography>

                {item.link ? (
                  <Link to={item.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        cursor: 'pointer',
                        color: 'text.secondary',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        },
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Link>
                ) : (
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {item.label}
                  </Typography>
                )}
              </Box>
            ))
          )}
        </Box>

        {/* Actions section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          {/* Show "Nuevo" only on list pages (no breadcrumbs → listado) */}
          {breadcrumbItems.length === 0 && buttonTo && (
            <Button
              variant="contained"
              component={Link}
              to={routes[buttonTo]()}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: '12px',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                fontWeight: '600',
                textTransform: 'none',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                '&:hover': {
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              {buttonLabel}
            </Button>
          )}

          {/* Action buttons on detail pages */}
          {breadcrumbItems.length > 0 &&
            actionButtons.map((btn, index) => (
              <Button
                key={index}
                variant={btn.variant || 'contained'}
                color={btn.color || 'primary'}
                onClick={btn.onClick}
                startIcon={
                  btn.iconName === 'edit' ? <EditIcon /> :
                  btn.iconName === 'delete' ? <DeleteIcon /> :
                  null
                }
                sx={{
                  borderRadius: '10px',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                {btn.label}
              </Button>
            ))}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ pb: 6, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box component="main" sx={{ width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default ScaffoldLayout
