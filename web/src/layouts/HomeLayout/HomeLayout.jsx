import React, { useState, useEffect, useCallback, useMemo } from 'react'

// MUI Components
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Computer as HardwareIcon,
  Storage as ServersIcon,
  Dns as DataCenterIcon,
  DeveloperBoard as ComponentsIcon,
  Cloud as DeployIcon,
  Apps as SystemsIcon,
  AccountTree as EntitiesIcon,
  Person as UsuariosIcon,
  Lock as RolesIcon,
  GroupWork as UsuarioRolsIcon,
  PrecisionManufacturing as MachinesIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Inventory as InventoryIcon,
  PowerSettingsNew as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Dashboard as DashboardIcon,
  Warning as EventIcon,
  Engineering as InfrastructureIcon,
  Code as DeploymentIcon,
  VerifiedUser as UserManagementIcon,
  Tune as ParametersIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  IconButton,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Container,
  Paper,
  Avatar,
  Divider,
  useMediaQuery,
  Collapse,
  Tooltip,
  Fade,
  Menu,
  MenuItem as MuiMenuItem,
  alpha,
  LinearProgress,
  Badge,
} from '@mui/material'

// MUI Icons

import { ThemeProvider, createTheme } from '@mui/material/styles'

import { Link, routes, useLocation, navigate } from '@redwoodjs/router'
import { Head } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
const DRAWER_WIDTH = 280
const TRANSITION_DURATION = 200

const HomeLayout = ({ children }) => {
  const { isAuthenticated, logIn, logOut, currentUser } = useAuth()
  const [mode, setMode] = useState('light')
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  // Use Media Query hooks
  const isMobile = useMediaQuery('(max-width:1024px)')
  const isSmall = useMediaQuery('(max-width:600px)')

  // Menu state with persisted section state
  const [openSections, setOpenSections] = useState({})

  // Dropdown menus
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null)

  // User data - Hardcoded for now (replace with actual user data)
  {
    console.log('currentUser: ', currentUser)
    console.log('isAuthenticated: ', isAuthenticated)
  }
  const user = {
    id: currentUser?.id,
    name: currentUser?.nombre,
    role: currentUser?.role,
    roleDescription: 'Administrador de Sistema de Inventario',
    username: 'AMERICO',
    documentNumber: '13854969',
    phone: '61135053',
    email: 'rodrigo.americo@agetic.gob.bo',
    avatar: 'RA',
    notifications: 3,
  }

  // Theme configuration - Memoize to prevent recreation on every render
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#5E35B1' : '#3949AB',
            light: mode === 'dark' ? '#7C4DFF' : '#5C6BC0',
            dark: mode === 'dark' ? '#4527A0' : '#303F9F',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: mode === 'dark' ? '#00BCD4' : '#00ACC1',
            light: mode === 'dark' ? '#26C6DA' : '#26C6DA',
            dark: mode === 'dark' ? '#0097A7' : '#00838F',
            contrastText: '#FFFFFF',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#F9FAFC',
            paper: mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
          },
          success: { main: '#4CAF50' },
          error: { main: '#F44336' },
          warning: { main: '#FF9800' },
          info: { main: '#2196F3' },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif',
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          subtitle1: { fontWeight: 500 },
          button: {
            fontWeight: 500,
            textTransform: 'none',
          },
        },
        shape: { borderRadius: 10 },
        transitions: {
          duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
          },
        },
        components: {
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                '&.Mui-selected': {
                  backgroundColor:
                    mode === 'dark'
                      ? alpha('#5E35B1', 0.16)
                      : alpha('#3949AB', 0.12),
                  '&:hover': {
                    backgroundColor:
                      mode === 'dark'
                        ? alpha('#5E35B1', 0.24)
                        : alpha('#3949AB', 0.18),
                  },
                },
                '&:hover': {
                  backgroundColor:
                    mode === 'dark'
                      ? alpha('#FFFFFF', 0.05)
                      : alpha('#000000', 0.04),
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: { borderRadius: 12 },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: { backgroundImage: 'none' },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundImage: 'none',
                borderRight: 'none',
              },
            },
          },
          MuiListItemIcon: {
            styleOverrides: {
              root: { minWidth: 40 },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: { borderRadius: 8 },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { borderRadius: 6 },
            },
          },
        },
      }),
    [mode]
  )

  // Menu structure - Optimized as static structure
  const menuStructure = useMemo(
    () => [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <DashboardIcon />,
        route: routes.home(),
        standalone: true,
      },
      {
        id: 'infrastructure',
        label: 'Infraestructura',
        icon: <InfrastructureIcon />,
        items: [
          {
            id: 'maquinas',
            label: 'Máquinas',
            icon: <MachinesIcon />,
            route: routes.maquinas(),
          },
          {
            id: 'login',
            label: 'LOGIN',
            icon: <MachinesIcon />,
            route: routes.login(),
          },
          {
            id: 'clusters',
            label: 'Clusters',
            icon: <InventoryIcon />,
            route: routes.clusters(),
          },
          {
            id: 'asignacion',
            label: 'Asignación Servidor-Máquina',
            icon: <HardwareIcon />,
            route: routes.asignacionServidorMaquinas(),
          },
          {
            id: 'servidores',
            label: 'Servidores',
            icon: <ServersIcon />,
            route: routes.servidors(),
          },
          {
            id: 'dataCenters',
            label: 'Data Centers',
            icon: <DataCenterIcon />,
            route: routes.dataCenters(),
          },
        ],
      },
      {
        id: 'deployments',
        label: 'Despliegues',
        icon: <DeploymentIcon />,
        items: [
          {
            id: 'sistemas',
            label: 'Sistemas',
            icon: <SystemsIcon />,
            route: routes.sistemas(),
          },
          {
            id: 'componentes',
            label: 'Componentes',
            icon: <ComponentsIcon />,
            route: routes.componentes(),
          },
          {
            id: 'despliegues',
            label: 'Despliegues',
            icon: <DeployIcon />,
            route: routes.despliegues(),
          },
          {
            id: 'entidades',
            label: 'Entidades',
            icon: <EntitiesIcon />,
            route: routes.entidads(),
          },
        ],
      },
      {
        id: 'userManagement',
        label: 'Gestión de Usuarios',
        icon: <UserManagementIcon />,
        items: [
          {
            id: 'usuarios',
            label: 'Usuarios',
            icon: <UsuariosIcon />,
            route: routes.usuarios(),
          },
          {
            id: 'usuarioRoles',
            label: 'Asignación de Roles',
            icon: <UsuarioRolsIcon />,
            route: routes.usuarioRols(),
          },
          {
            id: 'roles',
            label: 'Roles',
            icon: <RolesIcon />,
            route: routes.roles(),
          },
        ],
      },
      {
        id: 'events',
        label: 'Eventos',
        icon: <EventIcon />,
        items: [
          {
            id: 'eventos',
            label: 'Eventos',
            icon: <DeployIcon />,
            route: routes.eventos(),
          },
          {
            id: 'infraAfectadas',
            label: 'Infraestructura Afectada',
            icon: <SystemsIcon />,
            route: routes.infraAfectadas(),
          },
        ],
      },
      {
        id: 'parameters',
        label: 'Paramétricas',
        icon: <ParametersIcon />,
        items: [
          {
            id: 'parametros',
            label: 'Parámetros',
            icon: <SettingsIcon />,
            route: routes.parametros(),
          },
        ],
      },
    ],
    []
  )

  // Handlers with useCallback for optimization
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prevState) => !prevState)
  }, [])

  const handleThemeToggle = useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }, [])

  const handleProfileMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleProfileMenuClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleNotificationsMenuOpen = useCallback((event) => {
    setNotificationsAnchorEl(event.currentTarget)
  }, [])

  const handleNotificationsMenuClose = useCallback(() => {
    setNotificationsAnchorEl(null)
  }, [])

  const handleViewProfile = useCallback(() => {
    navigate(routes.usuario({ id: user.id }))
    handleProfileMenuClose()
  }, [user.id, handleProfileMenuClose])

  const handleEditProfile = useCallback(() => {
    navigate(routes.editUsuario({ id: user.id }))
    handleProfileMenuClose()
  }, [user.id, handleProfileMenuClose])

  const handleLogout = useCallback(() => {
    // Add your logout logic here
    handleProfileMenuClose()
  }, [handleProfileMenuClose])

  // Fixed toggle section logic to avoid state conflicts
  const toggleSection = useCallback((sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }, [])

  // Helper to determine active route
  const isActiveRoute = useCallback(
    (route) => {
      return location.pathname === route
    },
    [location.pathname]
  )

  // Find active section based on current route
  const findActiveSectionAndItem = useCallback(() => {
    for (const section of menuStructure) {
      if (section.standalone && isActiveRoute(section.route)) {
        return { section, item: null }
      }

      if (section.items) {
        const activeItem = section.items.find((item) =>
          isActiveRoute(item.route)
        )
        if (activeItem) {
          return { section, item: activeItem }
        }
      }
    }
    return { section: null, item: null }
  }, [menuStructure, isActiveRoute])

  // Auto-open section on first render and when route changes
  useEffect(() => {
    const { section } = findActiveSectionAndItem()

    if (section && !section.standalone && section.id) {
      setOpenSections((prev) => ({
        ...prev,
        [section.id]: true,
      }))
    }
  }, [findActiveSectionAndItem])

  // Loading indicator effect
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [location.pathname])

  // Get page title for display
  const getPageTitle = useCallback(() => {
    const { section, item } = findActiveSectionAndItem()

    if (!section) return 'Inventario Tecnológico'

    if (section.standalone) return section.label

    return item ? `${section.label} / ${item.label}` : section.label
  }, [findActiveSectionAndItem])

  // Memo for active section
  const activeSection = useMemo(() => {
    const { section } = findActiveSectionAndItem()
    return section
  }, [findActiveSectionAndItem])

  // Optimized menu item component to avoid re-rendering issues
  const NavMenuItem = useCallback(
    ({ item, section }) => {
      const active = isActiveRoute(item.route)

      return (
        <ListItemButton
          component={Link}
          to={item.route}
          selected={active}
          sx={{
            pl: 6,
            py: 0.75,
            borderRadius: 2,
            mx: 1,
            minHeight: 40,
            my: 0.25,
          }}
          onClick={() => {
            if (isMobile) {
              setMobileOpen(false)
            }
          }}
        >
          <ListItemIcon
            sx={{
              color: active ? 'primary.main' : 'inherit',
              minWidth: 36,
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: active ? 600 : 400,
            }}
          />
        </ListItemButton>
      )
    },
    [isActiveRoute, isMobile]
  )

  // Memoized accordion section component
  const AccordionSection = useCallback(
    ({ section }) => {
      const { section: activeSection, item: activeItem } =
        findActiveSectionAndItem()
      const isActive = activeSection?.id === section.id
      const isOpen = openSections[section.id] ?? false

      return (
        <Box key={section.id} sx={{ mb: 0.75 }}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => toggleSection(section.id)}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                minHeight: 44,
                color: isActive ? 'primary.main' : 'inherit',
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? 'primary.main' : 'inherit',
                  minWidth: 36,
                }}
              >
                {section.icon}
              </ListItemIcon>
              <ListItemText
                primary={section.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 500,
                }}
              />
              {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>

          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {section.items.map((item) => (
                <NavMenuItem key={item.id} item={item} section={section} />
              ))}
            </List>
          </Collapse>
        </Box>
      )
    },
    [findActiveSectionAndItem, openSections, toggleSection, NavMenuItem]
  )

  // Standalone menu item component
  const StandaloneMenuItem = useCallback(
    ({ section }) => {
      const active = isActiveRoute(section.route)

      return (
        <ListItem
          key={section.id}
          disablePadding
          sx={{ display: 'block', mb: 0.75 }}
        >
          <ListItemButton
            component={Link}
            to={section.route}
            selected={active}
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              minHeight: 44,
            }}
            onClick={() => {
              if (isMobile) setMobileOpen(false)
            }}
          >
            <ListItemIcon
              sx={{
                color: active ? 'primary.main' : 'inherit',
                minWidth: 36,
              }}
            >
              {section.icon}
            </ListItemIcon>
            <ListItemText
              primary={section.label}
              primaryTypographyProps={{
                fontWeight: active ? 600 : 500,
              }}
            />
          </ListItemButton>
        </ListItem>
      )
    },
    [isActiveRoute, isMobile]
  )

  // Drawer content - optimized with memo
  const drawerContent = useMemo(
    () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src="/images/agetic-logo.png"
              alt="AGETIC"
              variant="rounded"
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                bgcolor: 'primary.main',
              }}
            >
              IT
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                color="textPrimary"
                sx={{ fontWeight: 600, letterSpacing: '-0.025em' }}
              >
                AGETIC
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ opacity: 0.8 }}
              >
                Inventario Tecnológico
              </Typography>
            </Box>
          </Box>
          {!isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              size="small"
              sx={{
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.04)',
                '&:hover': {
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.08)',
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>

        {/* User profile */}
        <Box sx={{ px: 2, mt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem',
              }}
            >
              {user?.avatar}
            </Avatar>
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.name?.split(' ')[0]} {user?.name?.split(' ')[1]}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user?.role}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Menu items - Using virtualized list for better performance */}
        <List
          component="nav"
          sx={{ px: 1.5, pt: 2, flexGrow: 1, overflowY: 'auto' }}
        >
          {menuStructure.map((section) =>
            section.standalone ? (
              <StandaloneMenuItem key={section.id} section={section} />
            ) : (
              <AccordionSection key={section.id} section={section} />
            )
          )}
        </List>

        {/* Footer */}
        <Divider sx={{ my: 1 }} />
      </Box>
    ),
    [
      theme,
      isMobile,
      mode,
      handleDrawerToggle,
      handleThemeToggle,
      menuStructure,
      StandaloneMenuItem,
      AccordionSection,
      user,
      handleLogout,
    ]
  )

  // Profile menu
  const profileMenu = useMemo(
    () => (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 1,
          sx: {
            mt: 1.5,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
            width: 280,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MuiMenuItem onClick={handleViewProfile} sx={{ py: 1.5 }}>
          <Avatar sx={{ mr: 2, width: 28, height: 28 }}>{user.avatar}</Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.role}
            </Typography>
          </Box>
        </MuiMenuItem>
        <Divider />
        <MuiMenuItem onClick={handleEditProfile} sx={{ py: 1 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </MuiMenuItem>
        {!isAuthenticated ? (
          <>
            <MuiMenuItem onClick={() => logIn()} sx={{ py: 1 }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Iniciar sesión" />
            </MuiMenuItem>
          </>
        ) : (
          <>
            <MuiMenuItem onClick={() => logOut()} sx={{ py: 1 }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </MuiMenuItem>
          </>
        )}
      </Menu>
    ),
    [
      anchorEl,
      handleProfileMenuClose,
      user,
      handleViewProfile,
      handleEditProfile,
      handleLogout,
    ]
  )

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Inventario UIT - AGETIC</title>
        <link rel="icon" type="image/ico" href="/images/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </Head>

      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <CssBaseline />

        {/* AppBar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: alpha(
              theme.palette.background.paper,
              theme.palette.mode === 'dark' ? 0.8 : 0.95
            ),
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
            width: {
              xs: '100%',
              sm: `calc(100% - ${isMobile ? 0 : DRAWER_WIDTH}px)`,
            },
            ml: { xs: 0, sm: isMobile ? 0 : `${DRAWER_WIDTH}px` },
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: TRANSITION_DURATION,
            }),
          }}
        >
          <Toolbar sx={{ minHeight: 64, px: { xs: 1.5, sm: 2 } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                mx: { xs: 0, sm: 1 },
              }}
            >
              {!isSmall && (
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    letterSpacing: '-0.025em',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {activeSection && activeSection.icon && (
                    <Box
                      component="span"
                      sx={{
                        mr: 1,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'primary.main',
                        fontSize: '1rem',
                      }}
                    >
                      {React.cloneElement(activeSection.icon, {
                        fontSize: 'inherit',
                      })}
                    </Box>
                  )}
                  {getPageTitle()}
                </Typography>
              )}

              <Box sx={{ flexGrow: 1 }} />

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Theme toggle button */}
                <Tooltip
                  title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                  arrow
                >
                  <IconButton
                    color="inherit"
                    onClick={handleThemeToggle}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      mx: 0.5,
                    }}
                  >
                    {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>

                {/* Help button */}
                <Tooltip
                  title="Ayuda"
                  arrow
                  TransitionComponent={Fade}
                  TransitionProps={{ timeout: 600 }}
                >
                  <IconButton
                    color="inherit"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      mx: 0.5,
                    }}
                  >
                    <HelpIcon sx={{ fontSize: '1.25rem' }} />
                  </IconButton>
                </Tooltip>

                {/* User profile */}
                <Box
                  onClick={handleProfileMenuOpen}
                  sx={{
                    ml: 1,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    py: 0.5,
                    px: 1,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '0.875rem',
                    }}
                  >
                    {user.avatar}
                  </Avatar>
                  <Box sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.name?.split(' ')[0]} {user?.name?.split(' ')[1]}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {user?.role}
                    </Typography>
                  </Box>
                  <KeyboardArrowDownIcon
                    sx={{
                      ml: 0.5,
                      fontSize: '1rem',
                      display: { xs: 'none', md: 'block' },
                      color: 'text.secondary',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Toolbar>
          {loading && <LinearProgress color="primary" sx={{ height: 2 }} />}
        </AppBar>

        {/* Drawer */}
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            bgcolor: 'background.default',
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            pt: '64px',
          }}
        >
          {/* Breadcrumbs */}
          <Box sx={{ p: { xs: 1, sm: 2 } }}>
            <Container
              maxWidth="xl"
              sx={{
                mb: 2,
                mt: { xs: 1, sm: 2 },
                px: { xs: 1.5, sm: 3 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    color="textPrimary"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      letterSpacing: '-0.025em',
                      display: { xs: 'block', sm: 'none' },
                    }}
                  >
                    {getPageTitle()}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Link
                      to={routes.home()}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Box
                        component="span"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <HomeIcon
                          fontSize="small"
                          sx={{ mr: 0.5, fontSize: '0.875rem' }}
                        />
                        Inicio
                      </Box>
                    </Link>

                    {activeSection && !activeSection.standalone && (
                      <>
                        <Box
                          component="span"
                          sx={{ mx: 1, color: 'text.disabled' }}
                        >
                          /
                        </Box>
                        <Box component="span">{activeSection.label}</Box>

                        {findActiveSectionAndItem().item && (
                          <>
                            <Box
                              component="span"
                              sx={{ mx: 1, color: 'text.disabled' }}
                            >
                              /
                            </Box>
                            <Box
                              component="span"
                              sx={{ color: 'primary.main', fontWeight: 500 }}
                            >
                              {findActiveSectionAndItem().item.label}
                            </Box>
                          </>
                        )}
                      </>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Container>
          </Box>

          {/* Page content */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: { xs: 1, sm: 2 },
            }}
          >
            <Container
              maxWidth="xl"
              sx={{
                height: '100%',
                px: { xs: 1, sm: 2 },
                py: 1,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  minHeight: '100%',
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'auto',
                }}
              >
                {children}
              </Paper>
            </Container>
          </Box>
        </Box>

        {/* Profile Menu */}
        {profileMenu}
      </Box>
    </ThemeProvider>
  )
}

export default HomeLayout
