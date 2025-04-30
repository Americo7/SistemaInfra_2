import { useState, useEffect } from 'react'

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Fade,
} from '@mui/material'

import { navigate, routes, useLocation } from '@redwoodjs/router'

import { useAuth } from 'src/auth'

export default function LoginPage() {
  const { isAuthenticated, logIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const location = useLocation()

  useEffect(() => {
    document.title = 'Login - Ciudadanía Digital'
    console.log('LoginPage montado, título actualizado')
  }, [])

  // Detectar si hay error en la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const errorParam = params.get('error')
    console.log('Parámetros de búsqueda detectados:', errorParam)

    if (errorParam === 'unauthorized') {
      console.log('Error detectado: Acceso denegado')
      setError('Acceso denegado. No estás registrado en el sistema.')
    } else if (errorParam === 'invalid_token') {
      console.log('Error detectado: Token inválido')
      setError('Error de autenticación. Intenta iniciar sesión nuevamente.')
    }
  }, [location.search])

  // Redirigir si ya está autenticado
  useEffect(() => {
    console.log('Estado de autenticación:', isAuthenticated)
    if (isAuthenticated) {
      console.log('Usuario ya autenticado, redirigiendo a Home')
      navigate(routes.home())
    }
  }, [isAuthenticated])

  const handleLogin = async () => {
    console.log('Intentando iniciar sesión...')
    setLoading(true)
    setError('')
    try {
      await logIn()
      console.log('Login exitoso, redirigiendo a Home')
      navigate(routes.home())
    } catch (err) {
      console.error('Error en el login:', err)
      setError(err.message || 'No se pudo conectar con Ciudadanía Digital')
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundImage: 'linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Fade in timeout={800}>
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            p: 4,
            borderRadius: 6,
            boxShadow: 10,
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
              sx={{ color: '#1976d2' }}
            >
              Bienvenido
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, fontSize: '1rem' }}
            >
              Ingresa usando tu cuenta de Ciudadanía Digital
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleLogin}
              disabled={loading}
              fullWidth
              sx={{
                borderRadius: 8,
                textTransform: 'none',
                height: 56,
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Ingresar con Ciudadanía Digital'
              )}
            </Button>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  )
}
