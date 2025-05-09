// web/src/pages/LoginCallbackPage/LoginCallbackPage.js

import { useEffect } from 'react'
import { navigate, routes } from '@redwoodjs/router'
import { useAuth } from 'src/auth'
import { Box, CircularProgress, Typography } from '@mui/material'

const LoginCallbackPage = () => {
  const { isAuthenticated, getUserMetadata } = useAuth()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Forzar la obtención de metadatos del usuario
        await getUserMetadata()

        // Redirigir a home si está autenticado
        if (isAuthenticated) {
          navigate(routes.home())
        } else {
          navigate(routes.login({ error: 'auth_failed' }))
        }
      } catch (error) {
        console.error('Error en callback:', error)
        navigate(routes.login({ error: 'auth_failed' }))
      }
    }

    checkAuth()
  }, [isAuthenticated, getUserMetadata])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 3 }}>
        Procesando autenticación...
      </Typography>
    </Box>
  )
}

export default LoginCallbackPage
