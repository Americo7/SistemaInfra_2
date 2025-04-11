import React, { useState } from 'react'

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
} from '@mui/icons-material'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline,
  Avatar,
  Paper,
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import { Link, routes } from '@redwoodjs/router'

const theme = createTheme({
  palette: {
    primary: { main: '#2C3E50', light: '#34495E', contrastText: '#FFFFFF' },
    secondary: { main: '#2980B9', contrastText: '#FFFFFF' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
  },
  typography: { fontFamily: '"Roboto", sans-serif' },
})

const HomeLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)

  const menuItems = [
    { label: 'Inicio', icon: <HomeIcon />, route: routes.home() },
    { label: 'Roles', icon: <RolesIcon />, route: routes.roles() },
    {
      label: 'Usuarios-Roles',
      icon: <UsuarioRolsIcon />,
      route: routes.usuarioRols(),
    },
    { label: 'Usuarios', icon: <UsuariosIcon />, route: routes.usuarios() },
    { label: 'Hardware', icon: <HardwareIcon />, route: routes.hardwares() },
    { label: 'Servidores', icon: <ServersIcon />, route: routes.servidors() },
    { label: 'Máquinas', icon: <MachinesIcon />, route: routes.maquinas() },
    {
      label: 'Data Centers',
      icon: <DataCenterIcon />,
      route: routes.dataCenters(),
    },
    {
      label: 'Componentes',
      icon: <ComponentsIcon />,
      route: routes.componentes(),
    },
    { label: 'Sistemas', icon: <SystemsIcon />, route: routes.sistemas() },
    { label: 'Despliegues', icon: <DeployIcon />, route: routes.despliegues() },
    { label: 'Entidades', icon: <EntitiesIcon />, route: routes.entidads() },
    {
      label: 'Despliegue Bitacora',
      icon: <SystemsIcon />,
      route: routes.despliegueBitacoras(),
    },
    {
      label: 'Asignacion Servidor Maquina',
      icon: <DeployIcon />,
      route: routes.asignacionServidorMaquinas(),
    },
    { label: 'Clusters', icon: <EntitiesIcon />, route: routes.clusters() },
    {
      label: 'Infra Afectada',
      icon: <SystemsIcon />,
      route: routes.infraAfectadas(),
    },
    { label: 'Eventos', icon: <DeployIcon />, route: routes.eventos() },
    {
      label: 'Eventos Bitacora',
      icon: <EntitiesIcon />,
      route: routes.eventosBitacoras(),
    },
    {
      label: 'Parámetros',
      icon: <EntitiesIcon />,
      route: routes.parametros(),
    },
  ]

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed" color="default">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Inventario Tecnológico
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 250 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{ bgcolor: 'secondary.main', width: 40, height: 40, mr: 2 }}
            >
              UIT
            </Avatar>
            <Typography variant="h6">AGETIC</Typography>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item, index) => (
              <ListItem
                button
                key={index}
                component={Link}
                to={item.route}
                onClick={handleDrawerToggle}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ p: 3, mt: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="xl">
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            {children}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default HomeLayout
