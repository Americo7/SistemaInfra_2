import { useState, useEffect } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useAuth } from 'src/auth'

// Iconos
import StorageIcon from '@mui/icons-material/Storage'
import CloudIcon from '@mui/icons-material/Cloud'
import SyncIcon from '@mui/icons-material/Sync'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import DnsIcon from '@mui/icons-material/Dns'
import LanguageIcon from '@mui/icons-material/Language'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import HubIcon from '@mui/icons-material/Hub'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'

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
  Tooltip
} from '@mui/material'

const CONSULTA_ENDPOINTS = gql`
  query ObtenerK8sEndpoints {
    k8SEndpoints {
      id
      nombre
      url_api
      fecha_ultima_sync
      estado
    }
  }
`

export default function K8sSyncPage() {
  const { data, loading, refetch } = useQuery(CONSULTA_ENDPOINTS)
  const { getToken } = useAuth()

  const [idEnProceso, setIdEnProceso] = useState(null)
  const [tipoProceso, setTipoProceso] = useState(null)
  const [sincronizandoTodo, setSincronizandoTodo] = useState(false)
  
  const [estadoSincronizacion, setEstadoSincronizacion] = useState({})
  const [apiError, setApiError] = useState(null)

  const API_URL = process.env.API_URL || 'http://localhost:8911'
  const URL_SYNC = `${API_URL}/k8sSync`
  const API_HEALTH_CHECK_PATH = '/status'

  // --- HELPER: Asegurar que los contadores sean números ---
  const normalizarDesglose = (datos) => {
    const raw = datos.detalles?.desglose || datos.desglose || {}
    return {
      virtual: Number(raw.virtuales || raw.Virtual || raw.vms || 0),
      fisico: Number(raw.fisicos || raw.Fisico || raw.physical || 0)
    }
  }

  const verificarApiActiva = async () => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000); 

    try {
      const respuesta = await fetch(`${API_URL}${API_HEALTH_CHECK_PATH}`, {
        method: 'GET',
        signal: controller.signal, 
      })
      clearTimeout(id); 
      if (!respuesta.ok) throw new Error(`Status ${respuesta.status}`)
      setApiError(null)
    } catch (error) {
      clearTimeout(id); 
      let mensaje = error.name === 'AbortError' 
        ? 'Tiempo de espera excedido (API).' 
        : `Error de conexión API: ${error.message}`;
      console.error(mensaje)
      setApiError(mensaje)
    }
  }

  useEffect(() => {
    verificarApiActiva() 
    if (apiError === null && data?.k8SEndpoints?.length > 0) {
      data.k8SEndpoints.forEach((ep) => {
        if (!estadoSincronizacion[ep.id]) {
            conectarBackend(ep.id, 'verify', true)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, apiError])

  // --- LÓGICA PRINCIPAL DE CONEXIÓN ---
  const conectarBackend = async (endpointId, accion, silencioso = false) => {
    if (apiError) {
      if (!silencioso) toast.error("API no disponible")
      return { success: false }
    }

    if (!silencioso) {
        setIdEnProceso(endpointId)
        setTipoProceso(accion)
    }

    setEstadoSincronizacion((prev) => ({
      ...prev,
      [endpointId]: { ...prev[endpointId], tipo: 'cargando', accion },
    }))

    try {
      // 1. OBTENER EL TOKEN
      const token = await getToken()

      // 2. VALIDACIÓN DE TOKEN (NUEVO BLOQUE DE SEGURIDAD)
      if (!token) {
        const msg = "Sesión expirada. Por favor, recargue la página."
        
        setEstadoSincronizacion((prev) => ({
          ...prev,
          [endpointId]: { 
            tipo: 'error', 
            mensaje: 'Sin sesión', 
            accion 
          },
        }))

        if (!silencioso) toast.error(msg)
        return { success: false }
      }

      // 3. ENVIAR PETICIÓN CON TOKEN
      const respuesta = await fetch(URL_SYNC, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'auth-provider': 'dbAuth', 
            'authorization': `Bearer ${token}` // Token validado
        },
        credentials: 'include',
        body: JSON.stringify({ 
            endpointId, 
            soloVerificar: accion === 'verify',
            trigger: 'MANUAL' 
        }),
      })

      const datos = await respuesta.json()

      if (respuesta.status === 409 || datos.esBloqueo) throw new Error('BLOQUEADO')
      if (!respuesta.ok) throw new Error(datos.error || 'Error servidor')
      if (datos.success === false) throw new Error(datos.message || 'Fallo operación')

      // --- ÉXITO ---
      const mensaje = datos.message || (accion === 'verify' ? 'Conexión OK' : 'Sync OK')
      const nodosTotal = Number(datos.procesados || 0)
      const desglose = normalizarDesglose(datos)

      setEstadoSincronizacion((prev) => ({
        ...prev,
        [endpointId]: {
          tipo: 'exito',
          mensaje,
          cantidadNodos: nodosTotal,
          desglose: desglose,
          accion
        },
      }))

      if (!silencioso) toast.success(mensaje)
      if (accion === 'sync') await refetch()
      
      return { success: true }

    } catch (err) {
      const esBloqueo = err.message.includes('BLOQUEADO')
      
      setEstadoSincronizacion((prev) => ({
        ...prev,
        [endpointId]: {
          tipo: esBloqueo ? 'warning' : 'error',
          mensaje: esBloqueo ? 'En progreso...' : (err.message || 'Error'),
          accion
        },
      }))
      
      if (!silencioso) {
        esBloqueo ? toast('Sync en progreso (omitido)', { icon: '⚠️' }) : toast.error(err.message)
      }
      return { success: false, esBloqueo }
    } finally {
      if (!silencioso) {
        setIdEnProceso(null)
        setTipoProceso(null)
      }
    }
  }

  const ejecutarSincronizacionMasiva = async () => {
    if (apiError) return toast.error("API no disponible")
    
    const lista = data?.k8SEndpoints || []
    if (!lista.length) return

    setSincronizandoTodo(true)
    const toastId = toast.loading(`Sincronizando ${lista.length} clusters...`)

    let exitosos = 0
    let errores = 0

    for (const ep of lista) {
      const resultado = await conectarBackend(ep.id, 'sync', true)
      if (resultado.success) exitosos++
      else errores++
    }

    toast.dismiss(toastId)
    
    if (errores === 0) {
        toast.success(`¡Todo listo! ${exitosos} clusters sincronizados.`)
    } else {
        toast.error(`Finalizado: ${exitosos} OK, ${errores} fallidos.`)
    }

    setSincronizandoTodo(false)
  }

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />

  const endpoints = data?.k8SEndpoints || []

  return (
    <Box p={3} maxWidth={1600} mx="auto">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={4} sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, color: '#1565c0' }}>
            <DnsIcon fontSize="large" /> Sincronización Kubernetes
          </Typography>
          <Typography variant="body2" color="text.secondary">Gestión de clusters y nodos (API: {API_URL})</Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={sincronizandoTodo ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
          onClick={ejecutarSincronizacionMasiva}
          disabled={sincronizandoTodo || endpoints.length === 0 || apiError}
        >
          {sincronizandoTodo ? 'Procesando...' : 'Sincronizar Todo'}
        </Button>
      </Stack>
      
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography fontWeight="bold">Error Crítico del Sistema API:</Typography>
          {apiError}
        </Alert>
      )}

      {endpoints.length === 0 ? (
        <Alert severity="info">No hay endpoints registrados.</Alert>
      ) : (
        <Grid container spacing={3}>
          {endpoints.map((endpoint) => {
            const resultado = estadoSincronizacion[endpoint.id] || {}
            
            const cargando = resultado.tipo === 'cargando'
            const exitoSync = resultado.tipo === 'exito' && resultado.accion === 'sync'
            const esError = resultado.tipo === 'error'
            const esWarning = resultado.tipo === 'warning'
            
            const vms = resultado.desglose?.virtual || 0
            const fisicos = resultado.desglose?.fisico || 0

            return (
              <Grid item xs={12} md={6} lg={4} key={endpoint.id}>
                <Card elevation={3} sx={{ borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  
                  <CardHeader
                    avatar={<Avatar sx={{ bgcolor: esError ? '#d32f2f' : '#326ce5' }}><LanguageIcon /></Avatar>}
                    title={<Typography fontWeight="bold" noWrap>{endpoint.nombre}</Typography>}
                    subheader={<Typography variant="caption" noWrap>{endpoint.url_api}</Typography>}
                  />
                  <Divider />

                  <CardContent>
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="600">Estado:</Typography>
                        {apiError ? ( 
                            <Chip label="API Caído" color="error" icon={<DnsIcon />} />
                        ) : cargando ? (
                           <Chip label={resultado.accion === 'verify' ? "Verificando..." : "Sincronizando..."} color="primary" variant="outlined" icon={<CircularProgress size={14} />} />
                        ) : esError ? (
                           <Chip label="Error Conexión" color="error" icon={<ErrorIcon />} />
                        ) : esWarning ? (
                           <Chip label="Ocupado" sx={{ bgcolor: '#fff3e0', color: '#e65100', border: '1px solid #ffe0b2' }} icon={<HourglassEmptyIcon style={{ color: '#e65100' }} />} />
                        ) : resultado.tipo === 'exito' ? (
                           <Chip label={resultado.accion === 'sync' ? "Sincronizado" : "Online"} color="success" icon={<CheckCircleIcon />} />
                        ) : (
                           <Chip label="Pendiente" />
                        )}
                      </Box>

                      {exitoSync && (
                        <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 2, border: '1px solid #bbdefb' }}>
                            <Typography variant="caption" color="primary" fontWeight="bold" gutterBottom display="block">
                                RESULTADO DEL ESCANEO:
                            </Typography>
                            <Stack direction="row" spacing={1} justifyContent="space-between">
                                <Tooltip title="Total Nodos">
                                    <Chip size="small" icon={<HubIcon sx={{ fontSize: 16 }} />} label={`${resultado.cantidadNodos} Total`} sx={{ bgcolor: 'white', fontWeight: 'bold' }} />
                                </Tooltip>
                                <Tooltip title="Nodos Virtuales (VMs)">
                                    <Chip size="small" icon={<CloudIcon sx={{ fontSize: 16, color: '#1976d2 !important' }} />} label={`${vms} VMs`} sx={{ bgcolor: 'white', color: '#1565c0', borderColor: '#bbdefb', border: '1px solid' }} />
                                </Tooltip>
                                <Tooltip title="Nodos Físicos">
                                    <Chip size="small" icon={<StorageIcon sx={{ fontSize: 16, color: '#e65100 !important' }} />} label={`${fisicos} Fis.`} sx={{ bgcolor: 'white', color: '#e65100', borderColor: '#ffe0b2', border: '1px solid' }} />
                                </Tooltip>
                            </Stack>
                        </Box>
                      )}

                      {((esError || esWarning) && !apiError) && (
                          <Alert severity={esWarning ? "warning" : "error"} sx={{ fontSize: '0.75rem', alignItems: 'center' }}>
                            {resultado.mensaje}
                          </Alert>
                      )}
                      
                      {!exitoSync && !esError && !esWarning && !apiError && (
                        <Box sx={{ bgcolor: '#f5f7fa', p: 1.5, borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">Última sync:</Typography>
                            <Typography variant="body2" fontWeight="medium">
                            {endpoint.fecha_ultima_sync ? new Date(endpoint.fecha_ultima_sync).toLocaleString() : 'Nunca'}
                            </Typography>
                        </Box>
                      )}

                      <Stack direction="row" spacing={1}>
                        <Button 
                            variant="outlined" color={esError ? "error" : "info"} fullWidth size="small" startIcon={<FactCheckIcon />}
                            onClick={() => conectarBackend(endpoint.id, 'verify')} disabled={cargando || sincronizandoTodo || apiError}
                        >
                          Verificar
                        </Button>
                        <Button 
                            variant="contained" color="primary" fullWidth size="small" startIcon={<SyncIcon />}
                            onClick={() => conectarBackend(endpoint.id, 'sync')} disabled={cargando || sincronizandoTodo || esError || apiError}
                        >
                          Sincronizar
                        </Button>
                      </Stack>

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