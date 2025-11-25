import { useState } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

// Iconos Material UI
import StorageIcon from '@mui/icons-material/Storage'
import SyncIcon from '@mui/icons-material/Sync'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import DnsIcon from '@mui/icons-material/Dns'
import ComputerIcon from '@mui/icons-material/Computer' // Icono para VM/Proxmox

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Avatar,
  Alert,
} from '@mui/material'

const CONSULTA_PROXMOX = gql`
  query ProxmoxEndpointsForSync {
    proxmoxEndpoints {
      id
      nombre
      ip
      puerto
      usuario
      fecha_ultima_sync
    }
  }
`

export default function ProxmoxSyncPage() {
  const { data, loading, refetch } = useQuery(CONSULTA_PROXMOX)

  // Estados de control
  const [idEnProceso, setIdEnProceso] = useState(null)
  const [sincronizandoTodo, setSincronizandoTodo] = useState(false)
  const [estadoSincronizacion, setEstadoSincronizacion] = useState({})

  // ---------------------------------------------------------
  // VARIABLE DE ENTORNO PARA URL (Igual que en K8s)
  // ---------------------------------------------------------
  const API_URL = process.env.API_URL || 'http://localhost:8911'

  /**
   * Conecta con la función proxmoxSync del backend
   */
  const procesarSincronizacion = async (endpointId) => {
    console.log(`[ProxmoxSync] Iniciando sync ID: ${endpointId}`)
    setIdEnProceso(endpointId)

    // Resetear estado visual a "cargando"
    setEstadoSincronizacion((previos) => ({
      ...previos,
      [endpointId]: { tipo: 'cargando' },
    }))

    try {
      const urlDestino = `${API_URL}/proxmoxSync`
      console.log(`[ProxmoxSync] Request a: ${urlDestino}`)

      const respuesta = await fetch(urlDestino, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpointId: endpointId }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.error || `Error HTTP ${respuesta.status}`)
      }

      console.log('[ProxmoxSync] Éxito:', datos)

      // Calculamos totales para el feedback visual
      const totalNodos = datos.nodos?.length || 0
      // Sumamos las VMs de todos los nodos
      const totalVMs = datos.nodos?.reduce((acc, nodo) => acc + (nodo.vms?.length || 0), 0) || 0

      setEstadoSincronizacion((previos) => ({
        ...previos,
        [endpointId]: {
          tipo: 'exito',
          mensaje: 'Sincronizado',
          detalles: `${totalNodos} Nodos / ${totalVMs} VMs`,
        },
      }))

      toast.success(`Proxmox conectado: ${totalVMs} VMs encontradas`)
      await refetch()

    } catch (error) {
      console.error('[ProxmoxSync] Error:', error)
      setEstadoSincronizacion((previos) => ({
        ...previos,
        [endpointId]: {
          tipo: 'error',
          mensaje: error.message,
        },
      }))
      toast.error(`Error Proxmox: ${error.message}`)
    } finally {
      setIdEnProceso(null)
    }
  }

  /**
   * Sincronización masiva secuencial
   */
  const ejecutarSincronizacionMasiva = async () => {
    const lista = data?.proxmoxEndpoints || []

    if (lista.length === 0) {
      toast.info('No hay servidores Proxmox configurados')
      return
    }

    setSincronizandoTodo(true)
    toast.loading('Sincronizando todos los servidores...', { id: 'proxmox-masivo' })

    for (const ep of lista) {
      await procesarSincronizacion(ep.id)
    }

    toast.dismiss('proxmox-masivo')
    toast.success('Sincronización masiva completada')
    setSincronizandoTodo(false)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
        <Typography ml={2}>Cargando servidores...</Typography>
      </Box>
    )
  }

  const endpoints = data?.proxmoxEndpoints ?? []

  return (
    <Box p={3}>
      {/* Cabecera */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={4} spacing={2}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
            <DnsIcon fontSize="large" color="warning" /> {/* Color warning (naranja) para Proxmox */}
            Sincronización Proxmox
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Conectando vía: {API_URL}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          color="warning" // Botón naranja para diferenciar de K8s
          startIcon={sincronizandoTodo ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
          onClick={ejecutarSincronizacionMasiva}
          disabled={sincronizandoTodo || endpoints.length === 0}
        >
          {sincronizandoTodo ? 'Procesando...' : 'Sincronizar Todo'}
        </Button>
      </Stack>

      {/* Listado de Tarjetas */}
      {endpoints.length === 0 ? (
        <Alert severity="warning" variant="outlined">
          No hay servidores Proxmox configurados en la base de datos.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {endpoints.map((ep) => {
            const resultado = estadoSincronizacion[ep.id] || {}
            const estaCargando = idEnProceso === ep.id

            // Configuración visual del estado
            let colorChip = 'default'
            let iconoChip = <StorageIcon />
            let textoChip = 'Pendiente'

            if (resultado.tipo === 'exito') {
              colorChip = 'success'
              iconoChip = <CheckCircleIcon />
              textoChip = resultado.detalles // Muestra "X Nodos / Y VMs"
            } else if (resultado.tipo === 'error') {
              colorChip = 'error'
              iconoChip = <ErrorIcon />
              textoChip = 'Error'
            }

            return (
              <Grid item xs={12} md={6} lg={4} key={ep.id}>
                <Card elevation={4} sx={{ borderRadius: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>

                  {/* Cabecera de Tarjeta */}
                  <CardHeader
                    avatar={
                      // Avatar Naranja intenso (#E55D32 es parecido al de Proxmox)
                      <Avatar sx={{ bgcolor: '#E55D32', width: 50, height: 50 }}>
                        <ComputerIcon />
                      </Avatar>
                    }
                    title={
                      <Typography variant="h6" fontWeight="bold">
                        {ep.nombre}
                      </Typography>
                    }
                    subheader={
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {ep.usuario}@{ep.ip}:{ep.puerto}
                      </Typography>
                    }
                  />
                  <Divider />

                  {/* Cuerpo */}
                  <CardContent>
                    <Stack spacing={2}>

                      {/* Estado */}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Estado Sync:
                        </Typography>
                        <Chip
                          label={estaCargando ? 'Conectando...' : textoChip}
                          color={colorChip}
                          size="small"
                          variant={estaCargando ? 'outlined' : 'filled'}
                          icon={estaCargando ? <CircularProgress size={16} /> : iconoChip}
                        />
                      </Box>

                      {/* Alerta de Error */}
                      {resultado.tipo === 'error' && (
                        <Alert severity="error" sx={{ fontSize: '0.8rem' }}>
                          {resultado.mensaje}
                        </Alert>
                      )}

                      {/* Fecha */}
                      <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2 }}> {/* Fondo naranja muy suave */}
                        <Typography variant="caption" color="text.secondary" display="block">
                          Última sincronización:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {ep.fecha_ultima_sync
                            ? new Date(ep.fecha_ultima_sync).toLocaleString()
                            : 'Nunca'}
                        </Typography>
                      </Box>

                      {/* Botón */}
                      <Button
                        variant="outlined"
                        color="warning"
                        fullWidth
                        startIcon={<SyncIcon />}
                        onClick={() => procesarSincronizacion(ep.id)}
                        disabled={estaCargando || sincronizandoTodo}
                        sx={{ mt: 1 }}
                      >
                        {estaCargando ? 'Sincronizando...' : 'Sincronizar'}
                      </Button>

                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}