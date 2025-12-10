import { useState, useEffect } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

// Iconos
import StorageIcon from '@mui/icons-material/Storage' // Nodos Físicos
import CloudIcon from '@mui/icons-material/Cloud' // VMs (Nodos Virtuales)
import SyncIcon from '@mui/icons-material/Sync'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import DnsIcon from '@mui/icons-material/Dns'
import LanguageIcon from '@mui/icons-material/Language' // API URL
import FactCheckIcon from '@mui/icons-material/FactCheck'
import HubIcon from '@mui/icons-material/Hub' // Total Nodos
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty' // Icono para ocupado

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

  const [idEnProceso, setIdEnProceso] = useState(null)
  const [tipoProceso, setTipoProceso] = useState(null)
  const [sincronizandoTodo, setSincronizandoTodo] = useState(false)
  
  const [estadoSincronizacion, setEstadoSincronizacion] = useState({})
  const [apiError, setApiError] = useState(null) // <-- [1] Nuevo Estado Global de Error

  const API_URL = process.env.API_URL || 'http://localhost:8911'
  const URL_SYNC = `${API_URL}/k8sSync`
  const API_HEALTH_CHECK_PATH = '/status'; // Usamos el path de la función global de salud


  /* --------------------------------------------------
     [2] FUNCIÓN: Verificar la salud del API (con AbortController)
  -------------------------------------------------- */
  const verificarApiActiva = async () => {
    const controller = new AbortController();
    // 💡 5 segundos de timeout
    const id = setTimeout(() => controller.abort(), 5000); 

    try {
      const respuesta = await fetch(`${API_URL}${API_HEALTH_CHECK_PATH}`, {
        method: 'GET',
        signal: controller.signal, 
      })

      clearTimeout(id); 

      if (!respuesta.ok) {
        throw new Error(`Servidor API respondió con Status ${respuesta.status}`)
      }
      
      setApiError(null)

    } catch (error) {
      clearTimeout(id); 

      let mensaje;

      if (error.name === 'AbortError') {
         mensaje = `Tiempo de espera excedido (5s). El servidor API no respondió.`
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        mensaje = `Fallo de conexión. No se pudo contactar el servidor API en ${API_URL}. Revise la URL y el puerto de ejecución.`
      } else {
        mensaje = `Error al verificar la salud del API: ${error.message}`
      }
      
      console.error('API Health Check Error:', mensaje)
      setApiError(mensaje)
    }
  }

  // 1. AUTO-VERIFICACIÓN AL CARGAR (Ahora incluye la verificación de la API)
  useEffect(() => {
    // Verificar el estado del API
    verificarApiActiva() 

    // Solo procede con el auto-verify si la API está sana y hay endpoints
    if (apiError === null && data?.k8SEndpoints?.length > 0) {
      data.k8SEndpoints.forEach((ep) => {
        // Solo verificamos si no tenemos un estado previo
        if (!estadoSincronizacion[ep.id]) {
            conectarBackend(ep.id, 'verify', true)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, apiError]) // Dependencia en apiError para reintentar la verificación de endpoints

  // 2. CONEXIÓN AL BACKEND (Con manejo de Lock/Bloqueo)
  const conectarBackend = async (endpointId, accion, silencioso = false) => {
    // 💡 [3] BLOQUEAR la ejecución si el API está caído
    if (apiError) {
      if (!silencioso) toast.error("Imposible iniciar: El servidor API no responde.")
      return
    }

    if (!silencioso) {
        setIdEnProceso(endpointId)
        setTipoProceso(accion)
    }

    setEstadoSincronizacion((prev) => ({
      ...prev,
      // Si el API está caído, el estado local ya es 'error' (aunque se comprueba arriba)
      [endpointId]: { ...prev[endpointId], tipo: 'cargando', accion },
    }))

    try {
      const respuesta = await fetch(URL_SYNC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointId,
          soloVerificar: accion === 'verify',
        }),
      })

      // Manejo de JSON y Errores (sin el chequeo de Failed to fetch)
      const datos = await respuesta.json()

      // 🟢 DETECCIÓN DE BLOQUEO (Valkey Lock)
      if (respuesta.status === 409 || datos.esBloqueo) {
        throw new Error('BLOQUEADO: Sincronización ya en curso')
      }

      // ERROR HTTP o ERROR LÓGICO
      if (!respuesta.ok) throw new Error(datos.error || 'Error de servidor')
      if (datos.success === false) {
         throw new Error(datos.message || 'Fallo en la operación')
      }

      // --- ÉXITO ---
      const mensaje = datos.message || (accion === 'verify' ? 'Conexión OK' : 'Sincronización OK')
      const nodosTotal = datos.procesados || 0
      const desglose = datos.detalles?.desglose || datos.desglose || { virtual: 0, fisico: 0 }

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

    } catch (err) {
      console.error(err)
      
      // 🟢 MANEJO VISUAL DEL BLOQUEO (No necesitamos chequear Failed to fetch aquí)
      const esBloqueo = err.message.includes('BLOQUEADO') || err.message.includes('ya está en ejecución')

      setEstadoSincronizacion((prev) => ({
        ...prev,
        [endpointId]: {
          tipo: esBloqueo ? 'warning' : 'error',
          mensaje: esBloqueo ? 'Omitido: Ya en progreso' : (err.message || 'Error de conexión'),
          accion
        },
      }))
      
      if (!silencioso) {
        if (esBloqueo) {
            toast('Sync en progreso... (omitido)', { icon: '⚠️', duration: 3000 })
        } else {
            toast.error(err.message)
        }
      }
    } finally {
      if (!silencioso) {
        setIdEnProceso(null)
        setTipoProceso(null)
      }
    }
  }

  // 3. SINCRONIZACIÓN MASIVA
  const ejecutarSincronizacionMasiva = async () => {
    // 💡 [3] BLOQUEAR si el API está caído
    if (apiError) {
      toast.error("Imposible iniciar: El servidor API no responde.")
      return
    }
    
    const lista = data?.k8SEndpoints || []
    if (!lista.length) return

    setSincronizandoTodo(true)
    toast.loading('Iniciando sincronización masiva...', { id: 'k8s-masivo' })

    for (const ep of lista) {
      await conectarBackend(ep.id, 'sync', false)
    }

    toast.dismiss('k8s-masivo')
    toast.success('Proceso masivo completado')
    setSincronizandoTodo(false)
  }

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />

  const endpoints = data?.k8SEndpoints || []

  return (
    <Box p={3} maxWidth={1600} mx="auto">
      {/* HEADER */}
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
          disabled={sincronizandoTodo || endpoints.length === 0 || apiError} // 💡 Deshabilitar
        >
          {sincronizandoTodo ? 'Procesando...' : 'Sincronizar Todo'}
        </Button>
      </Stack>
      
      {/* 🚨 [4] MENSAJE DE ERROR CRÍTICO DEL API */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography fontWeight="bold">Error Crítico del Sistema API:</Typography>
          {apiError}
        </Alert>
      )}

      {/* LISTA */}
      {endpoints.length === 0 ? (
        <Alert severity="info">No hay endpoints registrados.</Alert>
      ) : (
        <Grid container spacing={3}>
          {endpoints.map((endpoint) => {
            const resultado = estadoSincronizacion[endpoint.id] || {}
            
            const cargando = resultado.tipo === 'cargando'
            const exitoSync = resultado.tipo === 'exito' && resultado.accion === 'sync'
            const esError = resultado.tipo === 'error'
            const esWarning = resultado.tipo === 'warning' // Estado de bloqueo
            
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
                      
                      {/* ESTADO GENERAL */}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="600">Estado:</Typography>
                        
                        {/* 💡 [5] CORRECCIÓN CHIP: Priorizar el error global del API */}
                        {apiError ? ( 
                            <Chip label="API Caído" color="error" icon={<DnsIcon />} />
                        ) : cargando ? (
                           <Chip label={resultado.accion === 'verify' ? "Verificando..." : "Sincronizando..."} color="primary" variant="outlined" icon={<CircularProgress size={14} />} />
                        ) : esError ? (
                           <Chip label="Error Conexión" color="error" icon={<ErrorIcon />} />
                        ) : esWarning ? (
                           /* 🟢 CHIP AMARILLO: CUANDO ESTÁ BLOQUEADO POR VALKEY */
                           <Chip label="Ocupado" sx={{ bgcolor: '#fff3e0', color: '#e65100', border: '1px solid #ffe0b2' }} icon={<HourglassEmptyIcon style={{ color: '#e65100' }} />} />
                        ) : resultado.tipo === 'exito' ? (
                           <Chip label={resultado.accion === 'sync' ? "Sincronizado" : "Online"} color="success" icon={<CheckCircleIcon />} />
                        ) : (
                           <Chip label="Pendiente" />
                        )}
                      </Box>

                      {/* BARRA DE ESTADÍSTICAS (Solo si fue exitosa una sync) */}
                      {exitoSync && (
                        <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 2, border: '1px solid #bbdefb' }}>
                            <Typography variant="caption" color="primary" fontWeight="bold" gutterBottom display="block">
                                RESULTADO DEL ESCANEO:
                            </Typography>
                            <Stack direction="row" spacing={1} justifyContent="space-between">
                                <Tooltip title="Total Nodos">
                                    <Chip size="small" icon={<HubIcon sx={{ fontSize: 16 }} />} label={`${resultado.cantidadNodos} Total`} sx={{ bgcolor: 'white', fontWeight: 'bold' }} />
                                </Tooltip>
                                <Tooltip title="Máquinas Virtuales (VMs) - Nodos virtuales">
                                    <Chip size="small" icon={<CloudIcon sx={{ fontSize: 16, color: '#1976d2 !important' }} />} label={`${vms} VMs`} sx={{ bgcolor: 'white', color: '#1565c0', borderColor: '#bbdefb', border: '1px solid' }} />
                                </Tooltip>
                                <Tooltip title="Servidores Físicos (Bare Metal) - Nodos físicos">
                                    <Chip size="small" icon={<StorageIcon sx={{ fontSize: 16, color: '#e65100 !important' }} />} label={`${fisicos} Fis.`} sx={{ bgcolor: 'white', color: '#e65100', borderColor: '#ffe0b2', border: '1px solid' }} />
                                </Tooltip>
                            </Stack>
                        </Box>
                      )}

                      {/* MENSAJE DE ERROR O WARNING */}
                      {((esError || esWarning) && !apiError) && ( // 💡 No mostrar error local si el global falla
                          <Alert severity={esWarning ? "warning" : "error"} sx={{ fontSize: '0.75rem', alignItems: 'center' }}>
                            {resultado.mensaje}
                          </Alert>
                      )}
                      
                      {/* INFO FECHA */}
                      {!exitoSync && !esError && !esWarning && !apiError && (
                        <Box sx={{ bgcolor: '#f5f7fa', p: 1.5, borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">Última sync:</Typography>
                            <Typography variant="body2" fontWeight="medium">
                            {endpoint.fecha_ultima_sync ? new Date(endpoint.fecha_ultima_sync).toLocaleString() : 'Nunca'}
                            </Typography>
                        </Box>
                      )}

                      {/* BOTONES */}
                      <Stack direction="row" spacing={1}>
                        <Button 
                            variant="outlined" color={esError ? "error" : "info"} fullWidth size="small" startIcon={<FactCheckIcon />}
                            onClick={() => conectarBackend(endpoint.id, 'verify')} disabled={cargando || sincronizandoTodo || apiError} // 💡 Deshabilitar
                        >
                          Verificar
                        </Button>
                        <Button 
                            variant="contained" color="primary" fullWidth size="small" startIcon={<SyncIcon />}
                            onClick={() => conectarBackend(endpoint.id, 'sync')} disabled={cargando || sincronizandoTodo || esError || apiError} // 💡 Deshabilitar
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