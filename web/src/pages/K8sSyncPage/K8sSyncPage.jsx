import { useState, useEffect } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

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

  const API_URL = process.env.API_URL || 'http://localhost:8911'
  const URL_SYNC = `${API_URL}/k8sSync`

  // 1. AUTO-VERIFICACIÓN AL CARGAR
  useEffect(() => {
    if (data?.k8SEndpoints?.length > 0) {
      data.k8SEndpoints.forEach((ep) => {
        // Solo verificamos si no tenemos un estado previo
        if (!estadoSincronizacion[ep.id]) {
            conectarBackend(ep.id, 'verify', true)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // 2. CONEXIÓN AL BACKEND (Lógica corregida)
  const conectarBackend = async (endpointId, accion, silencioso = false) => {
    if (!silencioso) {
        setIdEnProceso(endpointId)
        setTipoProceso(accion)
    }

    setEstadoSincronizacion((prev) => ({
      ...prev,
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

      const datos = await respuesta.json()

      // ERROR HTTP (500, 404, etc)
      if (!respuesta.ok) throw new Error(datos.error || 'Error de servidor')

      // ERROR LÓGICO (Backend responde 200 pero dice success: false)
      // ESTA ES LA CORRECCIÓN CLAVE:
      if (datos.success === false) {
         throw new Error(datos.message || 'Fallo en la operación')
      }

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
      
      // Actualizamos el estado visual a ERROR
      setEstadoSincronizacion((prev) => ({
        ...prev,
        [endpointId]: {
          tipo: 'error',
          mensaje: err.message || 'Error de conexión',
          accion // Mantenemos la acción para saber qué falló
        },
      }))
      
      if (!silencioso) toast.error(err.message)
    } finally {
      if (!silencioso) {
        setIdEnProceso(null)
        setTipoProceso(null)
      }
    }
  }

  // 3. SINCRONIZACIÓN MASIVA
  const ejecutarSincronizacionMasiva = async () => {
    const lista = data?.k8SEndpoints || []
    if (!lista.length) return
    setSincronizandoTodo(true)
    toast.loading('Sincronizando todo...', { id: 'k8s-masivo' })
    for (const ep of lista) {
      await conectarBackend(ep.id, 'sync')
    }
    toast.dismiss('k8s-masivo')
    toast.success('Proceso completado')
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
          disabled={sincronizandoTodo || endpoints.length === 0}
        >
          {sincronizandoTodo ? 'Procesando...' : 'Sincronizar Todo'}
        </Button>
      </Stack>

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
                        {cargando ? (
                           <Chip label={resultado.accion === 'verify' ? "Verificando..." : "Sincronizando..."} color="primary" variant="outlined" icon={<CircularProgress size={14} />} />
                        ) : esError ? (
                           // AHORA SÍ SE MOSTRARÁ ESTE CHIP ROJO
                           <Chip label="Error Conexión" color="error" icon={<ErrorIcon />} />
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
                                <Tooltip title="Máquinas Virtuales (VMs)">
                                    <Chip size="small" icon={<CloudIcon sx={{ fontSize: 16, color: '#1976d2 !important' }} />} label={`${vms} VMs`} sx={{ bgcolor: 'white', color: '#1565c0', borderColor: '#bbdefb', border: '1px solid' }} />
                                </Tooltip>
                                <Tooltip title="Servidores Físicos (Bare Metal)">
                                    <Chip size="small" icon={<StorageIcon sx={{ fontSize: 16, color: '#e65100 !important' }} />} label={`${fisicos} Fis.`} sx={{ bgcolor: 'white', color: '#e65100', borderColor: '#ffe0b2', border: '1px solid' }} />
                                </Tooltip>
                            </Stack>
                        </Box>
                      )}

                      {/* MENSAJE DE ERROR CLARO EN LA TARJETA */}
                      {esError && (
                          <Alert severity="error" sx={{ fontSize: '0.75rem', alignItems: 'center' }}>
                            {resultado.mensaje.includes('ECONNREFUSED') ? 'Conexión rechazada por el servidor K8s' : resultado.mensaje}
                          </Alert>
                      )}

                      {/* INFO FECHA */}
                      {!exitoSync && !esError && (
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
                            onClick={() => conectarBackend(endpoint.id, 'verify')} disabled={cargando || sincronizandoTodo}
                        >
                          Verificar
                        </Button>
                        <Button 
                            variant="contained" color="primary" fullWidth size="small" startIcon={<SyncIcon />}
                            onClick={() => conectarBackend(endpoint.id, 'sync')} disabled={cargando || sincronizandoTodo || esError}
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