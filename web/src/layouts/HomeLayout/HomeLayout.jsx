import React, { useState } from 'react'

import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as UsersIcon,
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
} from '@mui/icons-material'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline,
  useMediaQuery,
  Container,
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import { Link, routes } from '@redwoodjs/router'

// Tema profesional minimalista
const theme = createTheme({
  palette: {
    primary: {
      main: '#2C3E50', // Azul oscuro profesional
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#3498DB', // Azul claro moderno
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FA', // Fondo gris muy claro
      paper: '#FFFFFF', // Fondo para tarjetas
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 500,
      letterSpacing: 0.15,
    },
  },
  shape: {
    borderRadius: 8, // Bordes redondeados
  },
})

const HomeLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Todos los elementos del menú organizados
  const menuSections = [
    {
      title: 'Principal',
      items: [{ label: 'Inicio', icon: <HomeIcon />, route: routes.home() }],
    },
    {
      title: 'Gestión de Usuarios',
      items: [
        { label: 'Usuarios', icon: <UsersIcon />, route: routes.usuarios() },
        { label: 'Roles', icon: <RolesIcon />, route: routes.roles() },
        {
          label: 'Usuarios-Roles',
          icon: <UsuarioRolsIcon />,
          route: routes.usuarioRols(),
        },
        { label: 'Usuarios', icon: <UsuariosIcon />, route: routes.usuarios() },
      ],
    },
    {
      title: 'Infraestructura',
      items: [
        {
          label: 'Hardware',
          icon: <HardwareIcon />,
          route: routes.hardwares(),
        },
        {
          label: 'Servidores',
          icon: <ServersIcon />,
          route: routes.servidors(),
        },
        { label: 'Máquinas', icon: <MachinesIcon />, route: routes.maquinas() },
        {
          label: 'Data Centers',
          icon: <DataCenterIcon />,
          route: routes.dataCenters(),
        },
        {
          label: 'Servidor-Máquina',
          icon: <ServersIcon />,
          route: routes.servidorMaquinas(),
        },
      ],
    },
    {
      title: 'Sistemas',
      items: [
        {
          label: 'Componentes',
          icon: <ComponentsIcon />,
          route: routes.componentes(),
        },
        { label: 'Sistemas', icon: <SystemsIcon />, route: routes.sistemas() },
        {
          label: 'Despliegues',
          icon: <DeployIcon />,
          route: routes.despliegues(),
        },
        {
          label: 'Entidades',
          icon: <EntitiesIcon />,
          route: routes.entidads(),
        },
      ],
    },
    {
      title: 'Configuración',
      items: [{ label: 'Ajustes', icon: <SettingsIcon />, route: '#' }],
    },
  ]

  const drawerContent = (
    <div>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6">AGETIC UIT</Typography>
      </Toolbar>
      <Divider />

      {menuSections.map((section, index) => (
        <React.Fragment key={index}>
          <List dense>
            <ListItem>
              <Typography variant="subtitle2" color="textSecondary">
                {section.title}
              </Typography>
            </ListItem>
            {section.items.map((item) => (
              <ListItem
                button
                key={item.label}
                component={Link}
                to={item.route}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  '&.active': {
                    bgcolor: 'primary.light',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
          {index < menuSections.length - 1 && <Divider sx={{ my: 1 }} />}
        </React.Fragment>
      ))}
    </div>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* AppBar superior */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            boxShadow: 'none',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Sistema de Inventario Tecnológico
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Menú lateral para desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              borderRight: 'none',
              boxShadow: '1px 0 10px rgba(0, 0, 0, 0.05)',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>

        {/* Menú lateral para mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Contenido principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - 240px)` },
            mt: 8,
            bgcolor: 'background.default',
          }}
        >
          <Container maxWidth="xl" sx={{ py: 2 }}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              {children}
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default HomeLayout
