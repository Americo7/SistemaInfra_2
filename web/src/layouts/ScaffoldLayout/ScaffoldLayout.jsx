import { Link, routes } from '@redwoodjs/router'
import { Toaster } from '@redwoodjs/web/toast'
import { alpha, useTheme } from '@mui/material/styles'
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Stack,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

const ScaffoldLayout = ({
  title,
  titleTo,
  buttonLabel,
  buttonTo,
  children,
}) => {
  const theme = useTheme()

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: alpha(theme.palette.primary.light, 0.05),
    }}>
      {/* Toaster refinado */}
      <Toaster toastOptions={{
        className: 'rw-toast',
        duration: 6000,
        style: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[4],
          borderRadius: '8px',
          border: `1px solid ${theme.palette.divider}`,
          fontSize: '0.85rem',
          padding: '10px 14px',
        }
      }} />

      {/* Header simplificado */}
      <Paper elevation={0} sx={{
        p: 2.5,
        borderRadius: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        mb: 3,
      }}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography
              component={Link} // Convertimos el título en enlace
              to={routes[titleTo]()}
              variant="h5" // Tamaño reducido de h4 a h5
              sx={{
                fontWeight: 600, // Peso reducido de 700 a 600
                color: theme.palette.primary.main,
                letterSpacing: '-0.3px',
                textDecoration: 'none',
                '&:hover': {
                  color: theme.palette.primary.dark,
                  textDecoration: 'underline',
                },
                transition: 'color 0.2s ease',
              }}
            >
              {title}
            </Typography>

            <Button
              component={Link}
              to={routes[buttonTo]()}
              variant="contained"
              color="primary"
              size="medium" // Tamaño reducido de large a medium
              startIcon={<AddIcon sx={{ fontSize: '1.2rem' }} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1,
                fontSize: '0.9rem',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: theme.shadows[2],
                },
                transition: 'all 0.2s ease',
              }}
            >
              {buttonLabel}
            </Button>
          </Stack>
        </Container>
      </Paper>

      {/* Contenido principal optimizado */}
      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          py: 0,
          px: { xs: 1.5, md: 3 }, // Padding reducido
          mb: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 3 }, // Padding reducido
            minHeight: '50vh', // Altura reducida
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            '& .MuiDataGrid-root': {
              border: 'none',
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem', // Tamaño de fuente reducido
                whiteSpace: 'normal !important',
                wordWrap: 'break-word !important',
                lineHeight: '1.4 !important',
                py: '6px !important', // Padding reducido
              },
              '& .MuiDataGrid-columnHeader': {
                fontSize: '0.875rem', // Tamaño de fuente reducido
                backgroundColor: alpha(theme.palette.primary.light, 0.08),
              },
            },
            '& .MuiTableCell-root': {
              fontSize: '0.875rem', // Tamaño de fuente reducido
              wordBreak: 'break-word',
            },
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  )
}

export default ScaffoldLayout
