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
  Divider,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material'
import { OpenInNew, Security, KeyboardArrowRight, VerifiedUser } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { navigate, routes, useLocation } from '@redwoodjs/router'
import { useAuth } from 'src/auth'

// Componente mejorado de elementos flotantes con mejor diseño visual y rendimiento
const FloatingElements = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      {/* Malla geométrica de fondo con mejor visibilidad */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.04
        }}
      >
        <pattern
          id="grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#000"
            strokeWidth="0.6"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Elementos flotantes modernos optimizados */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.3 + 0.05,
            scale: Math.random() * 0.6 + 0.3,
            rotate: Math.random() * 360
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            rotate: Math.random() * 360 + 360,
            transition: {
              duration: Math.random() * 50 + 30,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }
          }}
          style={{
            position: 'absolute',
            borderRadius: i % 5 === 0 ? '50%' :
                        i % 5 === 1 ? '40% 60% 60% 40% / 40% 40% 60% 60%' :
                        i % 5 === 2 ? '40% 60% 70% 30% / 60% 30% 70% 40%' :
                        i % 5 === 3 ? '30% 70% 70% 30% / 50% 60% 40% 50%' : '0%',
            background: i % 7 === 0
              ? 'linear-gradient(135deg, rgba(26, 35, 126, 0.02), rgba(108, 92, 231, 0.07))'
              : i % 7 === 1
                ? 'linear-gradient(135deg, rgba(74, 20, 140, 0.04), rgba(126, 87, 194, 0.09))'
                : i % 7 === 2
                  ? 'linear-gradient(135deg, rgba(0, 77, 64, 0.03), rgba(0, 137, 123, 0.07))'
                  : i % 7 === 3
                    ? 'linear-gradient(135deg, rgba(191, 54, 12, 0.02), rgba(255, 87, 34, 0.05))'
                    : i % 7 === 4
                      ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.02), rgba(33, 33, 33, 0.05))'
                      : i % 7 === 5
                        ? 'linear-gradient(135deg, rgba(26, 35, 126, 0.04), rgba(21, 101, 192, 0.07))'
                        : 'linear-gradient(135deg, rgba(49, 27, 146, 0.03), rgba(94, 53, 177, 0.06))',
            width: `${Math.random() * 180 + 100}px`,
            height: `${Math.random() * 180 + 100}px`,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: 'inset 0 0 25px rgba(255, 255, 255, 0.07)'
          }}
        />
      ))}
    </Box>
  )
}

// Componente para el patrón de hexágonos mejorado en el lado izquierdo
const HexagonPattern = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.15,
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2.2) rotate(0)">
            <path d="M25,21.7l-25,0l0-21.7l25-21.7l25,21.7l0,21.7z" fill="none" stroke="#fff" strokeWidth="0.6"></path>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)"></rect>
      </svg>
    </Box>
  )
}

// Componente para los puntos de conexión visual
const ConnectionDots = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.1,
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#fff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)"></rect>
      </svg>
    </Box>
  )
}

export default function CiudadaniaDigitalLogin() {
  const { isAuthenticated, logIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('sm'))

  // Tema personalizado mejorado con colores más profesionales
  const customTheme = {
    primary: {
      main: '#2a3eb1', // Azul profesional
      light: '#5965b2',
      dark: '#0e1a6a',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#455a64', // Azul pizarra
      light: '#718792',
      dark: '#1c313a',
      contrastText: '#ffffff'
    },
    accent: {
      main: '#c2185b', // Magenta profesional
      light: '#fa5788',
      dark: '#8c0032',
      contrastText: '#ffffff'
    },
    background: {
      dark: '#121212',
      main: '#fafafa',
      light: '#ffffff',
      paper: '#ffffff'
    },
    text: {
      primary: '#263238',
      secondary: '#546e7a',
      disabled: '#b0bec5',
      hint: '#eceff1'
    },
    gold: {
      main: '#ffab00',
      light: '#ffdd4b',
      dark: '#c67c00'
    }
  }

  useEffect(() => {
    document.title = 'Sistema de Inventarios UIT - Iniciar Sesión'
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const errorParam = params.get('error')

    if (errorParam === 'unauthorized') {
      setError('Acceso denegado. No estás registrado en el sistema.')
    } else if (errorParam === 'invalid_token') {
      setError('Token inválido. Intenta iniciar sesión nuevamente.')
    }
  }, [location.search])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home())
    }
  }, [isAuthenticated])

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await logIn()
      navigate(routes.home())
    } catch (err) {
      setError(err.message || 'No se pudo conectar con Ciudadanía Digital')
      setLoading(false)
    }
  }

  const redirectToCiudadania = () => {
    window.open('https://ciudadaniadigital.bo/home', '_blank')
  }

  // Variantes de animación para elementos clave
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  }

  // Adaptaciones responsivas para diferentes tamaños de pantalla
  const logoSize = {
    xs: '140px',
    sm: '160px',
    md: '180px',
    lg: '200px'
  }

  const titleFontSize = {
    xs: '1.8rem',
    sm: '2.2rem',
    md: '2.5rem',
    lg: '3rem'
  }

  const subtitleFontSize = {
    xs: '1.2rem',
    sm: '1.3rem',
    md: '1.4rem',
    lg: '1.5rem'
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        backgroundColor: customTheme.background.main,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elementos flotantes de fondo para toda la página */}
      <FloatingElements />

      {/* Lado Izquierdo - Hero Section */}
      <Box
        sx={{
          width: isMobile ? '100%' : '55%',
          minHeight: isMobile ? (isExtraSmall ? '50vh' : '45vh') : '100vh',
          background: `linear-gradient(135deg, ${customTheme.primary.dark} 0%, ${customTheme.primary.main} 60%, ${customTheme.primary.light} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#fff',
          p: { xs: 3, sm: 4, md: 5, lg: 6 },
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          boxShadow: '5px 0 25px rgba(0,0,0,0.18)'
        }}
        component={motion.div}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Elementos decorativos en el fondo */}
        <HexagonPattern />
        <ConnectionDots />

        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.2 }}>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha('#fff', 0.18)} 0%, ${alpha('#fff', 0)} 70%)`,
                width: `${Math.random() * 500 + 300}px`,
                height: `${Math.random() * 500 + 300}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              initial={{ scale: 0.8, opacity: 0.1 }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.1, 0.3, 0.1],
                transition: {
                  repeat: Infinity,
                  duration: Math.random() * 15 + 20,
                  ease: "easeInOut"
                }
              }}
            />
          ))}
        </Box>

        {/* Logo y contenido principal */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', maxWidth: isMobile ? '90%' : '85%', textAlign: 'center' }}
        >
          <motion.div variants={itemVariants}>
            <Box
              sx={{
                background: alpha('#fff', 0.12),
                backdropFilter: 'blur(15px)',
                borderRadius: '24px',
                p: { xs: 2.5, sm: 3, md: 3.5 },
                mb: { xs: 3, sm: 4, md: 5 },
                border: `1px solid ${alpha('#fff', 0.25)}`,
                boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                width: 'fit-content',
                mx: 'auto',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <img
                  src="/logo-uit.png"
                  alt="Logo UIT"
                  style={{
                    maxWidth: isMobile ? (isExtraSmall ? logoSize.xs : logoSize.sm) : logoSize.md,
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
                  }}
                />
              </motion.div>
            </Box>
          </motion.div>

          <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              fontWeight="bold"
              gutterBottom
              sx={{
                textShadow: '0 4px 10px rgba(0,0,0,0.25)',
                background: `linear-gradient(135deg, #fff 30%, ${customTheme.gold.light} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                letterSpacing: '0.5px',
                fontSize: {
                  xs: titleFontSize.xs,
                  sm: titleFontSize.sm,
                  md: titleFontSize.md,
                  lg: titleFontSize.lg
                }
              }}
            >
              Sistema de Inventarios
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              sx={{
                opacity: 0.95,
                letterSpacing: '1px',
                fontWeight: 300,
                mb: { xs: 3, sm: 3.5, md: 4 },
                textAlign: 'center',
                textShadow: '0 2px 6px rgba(0,0,0,0.25)',
                fontSize: {
                  xs: subtitleFontSize.xs,
                  sm: subtitleFontSize.sm,
                  md: subtitleFontSize.md,
                  lg: subtitleFontSize.lg
                }
              }}
            >
              Unidad de Infraestructura Tecnológica
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Box
              sx={{
                mt: { xs: 3, sm: 4, md: 5 },
                pt: { xs: 3, sm: 3.5, md: 4 },
                borderTop: `1px solid ${alpha('#fff', 0.25)}`,
                width: { xs: '90%', sm: '85%', md: '80%' },
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >

              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontStyle: 'italic',
                  mt: 1,
                  maxWidth: '90%',
                  textAlign: 'center',
                  lineHeight: 1.6,
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' }
                }}
              >
                "Digitalizando Bolivia"
              </Typography>
            </Box>
          </motion.div>
        </motion.div>
      </Box>

      {/* Lado Derecho - Formulario */}
      <Box
        sx={{
          width: isMobile ? '100%' : '45%',
          minHeight: isMobile ? (isExtraSmall ? '50vh' : '55vh') : '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          background: `linear-gradient(135deg, ${customTheme.background.light} 0%, ${customTheme.background.main} 100%)`,
          zIndex: 1
        }}
        component={motion.div}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
      >
        <Fade in timeout={1000}>
          <Card
            sx={{
              width: '100%',
              maxWidth: { xs: 360, sm: 460, md: 520 },
              p: { xs: 3, sm: 3.5, md: 4 },
              borderRadius: { xs: 3, sm: 3.5, md: 4 },
              boxShadow: '0 15px 35px rgba(0,0,0,0.08), 0 5px 15px rgba(0,0,0,0.05)',
              textAlign: 'center',
              backgroundColor: customTheme.background.light,
              border: '1px solid',
              borderColor: alpha('#000', 0.05),
              position: 'relative',
              overflow: 'hidden'
            }}
            component={motion.div}
            whileHover={{ scale: 1.01, boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 10px 20px rgba(0,0,0,0.08)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Elementos decorativos de la tarjeta */}
            <Box
              sx={{
                position: 'absolute',
                top: -150,
                right: -150,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(customTheme.primary.light, 0.07)} 0%, ${alpha(customTheme.secondary.light, 0.03)} 100%)`,
                zIndex: 0
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                bottom: -120,
                left: -120,
                width: 240,
                height: 240,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(customTheme.accent.light, 0.05)} 0%, ${alpha(customTheme.secondary.light, 0.07)} 100%)`,
                zIndex: 0
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '40%',
                left: -50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(customTheme.primary.main, 0.03)} 0%, ${alpha(customTheme.primary.light, 0.06)} 100%)`,
                zIndex: 0
              }}
            />

            <CardContent sx={{ position: 'relative', zIndex: 1, padding: { xs: 1, sm: 1.5, md: 2 } }}>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {error && (
                  <motion.div variants={itemVariants}>
                    <Alert
                      severity="error"
                      sx={{
                        mb: 4,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)'
                      }}
                      onClose={() => setError('')}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <Box
                    sx={{
                      mb: { xs: 3, sm: 3.5, md: 4 },
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5, rotate: 2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <Box
                        sx={{
                          p: { xs: 2, sm: 2.5, md: 3 },
                          borderRadius: { xs: 2, sm: 2.5, md: 3 },
                          background: 'white',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.08), 0 3px 8px rgba(0,0,0,0.05)',
                          border: '1px solid',
                          borderColor: alpha('#000', 0.05),
                        }}
                      >
                        <img
                          src="/ciudadania-digital.png"
                          alt="Ciudadanía Digital"
                          style={{
                            maxWidth: isExtraSmall ? 120 : isMobile ? 135 : 150,
                            filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.1))'
                          }}
                        />
                      </Box>
                    </motion.div>
                  </Box>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="h4"
                    component="div"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: customTheme.primary.main,
                      mb: 1,
                      background: `linear-gradient(135deg, ${customTheme.primary.main} 0%, ${customTheme.primary.dark} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2rem' }
                    }}
                  >
                    Acceso al Sistema
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      mb: { xs: 3, sm: 3.5, md: 4 },
                      maxWidth: { xs: '95%', sm: '90%', md: '85%' },
                      mx: 'auto',
                      lineHeight: 1.7,
                      fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' }
                    }}
                  >
                    Ingresa de forma segura con tu cuenta de Ciudadanía Digital para acceder al sistema de inventarios
                  </Typography>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleLogin}
                    disabled={loading}
                    sx={{
                      borderRadius: { xs: 6, sm: 7, md: 8 },
                      textTransform: 'none',
                      height: { xs: 50, sm: 55, md: 60 },
                      fontWeight: 600,
                      fontSize: { xs: '1rem', sm: '1.05rem', md: '1.1rem' },
                      mt: 2,
                      mb: 3,
                      background: `linear-gradient(135deg, ${customTheme.primary.main} 20%, ${customTheme.primary.dark} 100%)`,
                      boxShadow: `0 8px 25px ${alpha(customTheme.primary.main, 0.4)}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${customTheme.primary.light} 0%, ${customTheme.primary.main} 100%)`,
                        boxShadow: `0 10px 30px ${alpha(customTheme.primary.main, 0.6)}`
                      }
                    }}
                    endIcon={
                      loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : <VerifiedUser fontSize="small" />
                    }
                  >
                    {loading ? 'Autenticando...' : 'Ingresar con Ciudadanía Digital'}
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 1 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: customTheme.secondary.main,
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha(customTheme.secondary.main, 0.05)
                    }}>
                      <Security fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        Conexión segura y encriptada
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Divider
                    sx={{
                      my: { xs: 3, sm: 3.5, md: 4 },
                      '&::before, &::after': {
                        borderColor: alpha(customTheme.text.secondary, 0.1),
                      }
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ px: 1, fontWeight: 500 }}
                    >
                      Más información
                    </Typography>
                  </Divider>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' } }}
                  >
                    ¿No tienes una cuenta? Visita el portal oficial para registrarte
                  </Typography>
                </motion.div>

    <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="medium"
                    onClick={redirectToCiudadania}
                    startIcon={<OpenInNew fontSize="small" />}
                    endIcon={<KeyboardArrowRight fontSize="small" />}
                    sx={{
                      borderRadius: { xs: 5, sm: 6, md: 7 },
                      textTransform: 'none',
                      px: 3,
                      py: 1,
                      mb: 2,
                      borderWidth: 1.5,
                      borderColor: alpha(customTheme.secondary.main, 0.5),
                      color: customTheme.secondary.main,
                      '&:hover': {
                        borderColor: customTheme.secondary.main,
                        bgcolor: alpha(customTheme.secondary.main, 0.05)
                      }
                    }}
                  >
                    Visitar Ciudadanía Digital
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 3,
                      opacity: 0.7,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  >
                    © {new Date().getFullYear()} - Sistema de Inventarios UIT
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.5,
                      fontSize: { xs: '0.65rem', sm: '0.7rem' }
                    }}
                  >
                    Versión 1.2.0 - Todos los derechos reservados
                  </Typography>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </Fade>

        {/* Información de soporte en la parte inferior */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 10, sm: 15, md: 20 },
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            px: 2
          }}
        >
        </Box>
      </Box>
    </Box>
  )
}
