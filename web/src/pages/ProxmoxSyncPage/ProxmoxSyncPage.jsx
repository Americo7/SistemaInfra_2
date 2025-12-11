import { useState, useEffect } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

// Iconos
import StorageIcon from '@mui/icons-material/Storage' // Nodos
import ComputerIcon from '@mui/icons-material/Computer' // VMs
import SyncIcon from '@mui/icons-material/Sync'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import DnsIcon from '@mui/icons-material/Dns'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import AddCircleIcon from '@mui/icons-material/AddCircle' // Para insertados
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

/* ============================================================
   GRAPHQL
============================================================ */
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

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */
export default function ProxmoxSyncPage() {
  const { data, loading, refetch } = useQuery(CONSULTA_PROXMOX)

  const [idEnProceso, setIdEnProceso] = useState(null)
  const [tipoProceso, setTipoProceso] = useState(null)
  const [sincronizandoTodo, setSincronizandoTodo] = useState(false)
  const [estadoSincronizacion, setEstadoSincronizacion] = useState({})
  const [yaVerificado, setYaVerificado] = useState(false)
  const [apiError, setApiError] = useState(null) 

  const API_URL = process.env.API_URL || 'http://localhost:8911'
  const API_HEALTH_CHECK_PATH = '/status'; 

  /* --------------------------------------------------
     FUNCIÓN: Verificar la salud del API (con AbortController)
  -------------------------------------------------- */
  const verificarApiActiva = async () => {
    const controller = new AbortController();
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
         mensaje = `Tiempo de espera excedido (5s). El API en ${API_URL} no respondió.`
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        mensaje = `Fallo de conexión. No se pudo contactar el servidor API en ${API_URL}. Revise la URL y el puerto de ejecución.`
      } else {
        mensaje = `Error al verificar la salud del API: ${error.message}`
      }
      console.error('API Health Check Error:', mensaje)
      setApiError(mensaje)
    }
  }

  /* ============================================================
     CONEXIÓN BACKEND (MODIFICADO: Retorna estado de éxito)
  ============================================================ */
  const conectarBackend = async (endpointId, accion, silencioso = false) => {
    if (apiError) {
      if (!silencioso) toast.error("Imposible iniciar: El servidor API no responde.")
      return { success: false }
    }

    if (!silencioso) {
        setIdEnProceso(endpointId)
        setTipoProceso(accion)
    }

    setEstadoSincronizacion((prev) => ({
      ...prev,
      [endpointId]: { ...prev[endpointId], tipo: apiError ? 'error' : 'cargando', accion, mensaje: apiError },
    }))

    try {
      const respuesta = await fetch(`${API_URL}/proxmoxSync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointId,
          soloVerificar: accion === 'verify',
        }),
      })
      
      let datos
      try {
          datos = await respuesta.json()
      } catch (jsonError) {
          throw new Error(`Fallo de API: La respuesta no es JSON.`)
      }

      if (respuesta.status === 409 || datos.esBloqueo) {
        throw new Error('BLOQUEADO: Sincronización ya en curso') 
      }

      if (!respuesta.ok) throw new Error(datos.error || 'Error desconocido')
      if (datos.success === false) throw new Error(datos.message || 'Error lógico')

      // Mapeo de datos para el frontend
      const info = {
        nodos: datos.totalNodosDetectados ?? 0,
        nodosNuevos: datos.totalNodosInsertados ?? 0,
        vms: datos.totalVMsDetectadas ?? 0,
        vmsNuevas: datos.totalVMsInsertadas ?? 0,
      }

      const mensaje = accion === 'verify' ? 'Conexión exitosa' : 'Sincronización completada'

      setEstadoSincronizacion((prev) => ({
        ...prev,
        [endpointId]: {
          tipo: 'exito',
          mensaje,
          resumen: info,
          accion
        },
      }))

      if (!silencioso) toast.success(mensaje)
      if (accion === 'sync') await refetch()
      
      return { success: true } // 🟢 RETORNO DE ÉXITO

    } catch (error) {
      let mensajeError = error.message
      let errorTipo = 'error' 

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        mensajeError = `Fallo de conexión: No se pudo contactar el API.`
      } 
      else if (error.message.includes('BLOQUEADO') || error.message.includes('ya está en ejecución')) {
         errorTipo = 'warning'
         mensajeError = 'Omitido: Ya en progreso'
      }

      setEstadoSincronizacion((prev) => ({
        ...prev,
        [endpointId]: {
          tipo: errorTipo,
          mensaje: mensajeError,
          accion 
        },
      }))
      
      if (!silencioso) {
         if (errorTipo === 'warning') toast('Sync en progreso... (omitido)', { icon: '⚠️', duration: 3000 })
         else toast.error(mensajeError)
      }

      return { success: false, esBloqueo: errorTipo === 'warning' } // 🔴 RETORNO DE FALLO
    } finally {
      if (!silencioso) {
         setIdEnProceso(null)
         setTipoProceso(null)
      }
    }
  }

  /* ============================================================
     SINCRONIZACIÓN MASIVA (SILENCIOSA Y SECUENCIAL)
  ============================================================ */
  const ejecutarSincronizacionMasiva = async () => {
    if (apiError) {
      toast.error("Imposible iniciar: El servidor API no responde.")
      return
    }
    
    const lista = data?.proxmoxEndpoints || []
    if (lista.length === 0) return
    
    setSincronizandoTodo(true)
    // 🟢 Toast de carga único
    const toastId = toast.loading(`Sincronizando ${lista.length} entornos Proxmox...`)
    
    let exitosos = 0
    let errores = 0

    for (const ep of lista) {
      // 🟢 'true' activa el modo silencioso
      const resultado = await conectarBackend(ep.id, 'sync', true) 
      if (resultado.success) exitosos++
      else errores++
    }
    
    // 🟢 Resumen final
    toast.dismiss(toastId)
    
    if (errores === 0) {
        toast.success(`¡Todo listo! ${exitosos} entornos sincronizados.`)
    } else {
        toast.error(`Finalizado: ${exitosos} OK, ${errores} fallidos.`)
    }

    setSincronizandoTodo(false)
  }

  /* ============================================================
     AUTO-VERIFY
  ============================================================ */
  useEffect(() => {
    verificarApiActiva() 
    
    if (apiError === null && !yaVerificado && !loading) {
      const endpoints = data?.proxmoxEndpoints || []
      if (endpoints.length > 0) {
        setYaVerificado(true)
        endpoints.forEach((ep) => {
            if (!estadoSincronizacion[ep.id] || estadoSincronizacion[ep.id].tipo !== 'exito') {
               conectarBackend(ep.id, 'verify', true)
            }
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data, yaVerificado, apiError]) 

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>

  const endpoints = data?.proxmoxEndpoints ?? []

  return (
    <Box p={3} maxWidth={1600} mx="auto">
      {/* HEADER */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={4} sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, color: '#e65100' }}>
            <DnsIcon fontSize="large" /> Sincronización Proxmox
          </Typography>
          <Typography variant="body2" color="text.secondary">Gestión de hipervisores y VMs (API: {API_URL})</Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          color="warning" 
          startIcon={sincronizandoTodo ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
          onClick={ejecutarSincronizacionMasiva}
          disabled={sincronizandoTodo || endpoints.length === 0 || apiError} 
        >
          {sincronizandoTodo ? 'Procesando...' : 'Sincronizar Todo'}
        </Button>
      </Stack>

      {/* ERROR API */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography fontWeight="bold">Error Crítico del Sistema API:</Typography>
          {apiError}
        </Alert>
      )}

      {/* LISTA */}
      {endpoints.length === 0 ? (
        <Alert severity="warning">No hay endpoints Proxmox configurados.</Alert>
      ) : (
        <Grid container spacing={3}>
          {endpoints.map((ep) => {
            const resultado = estadoSincronizacion[ep.id] || {}
            
            const procesando = resultado.tipo === 'cargando'
            const esError = resultado.tipo === 'error'
            const esWarning = resultado.tipo === 'warning'
            const exitoSync = resultado.tipo === 'exito' && resultado.accion === 'sync'

            const info = resultado.resumen || { nodos: 0, vms: 0, nodosNuevos: 0, vmsNuevas: 0 }
            const totalInsertados = info.nodosNuevos + info.vmsNuevas

            return (
              <Grid item xs={12} md={6} lg={4} key={ep.id}>
                <Card elevation={3} sx={{ borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  
                  <CardHeader
                    avatar={<Avatar sx={{ bgcolor: esError ? '#d32f2f' : '#ef6c00' }}><ComputerIcon /></Avatar>}
                    title={<Typography fontWeight="bold" noWrap>{ep.nombre}</Typography>}
                    subheader={<Typography variant="caption" noWrap>{ep.usuario}@{ep.ip}</Typography>}
                  />
                  <Divider />

                  <CardContent>
                    <Stack spacing={2}>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="600">Estado:</Typography>
                        
                        {apiError ? ( 
                            <Chip label="API Caído" color="error" icon={<DnsIcon />} />
                        ) : procesando ? (
                           <Chip label={resultado.accion === 'verify' ? "Verificando..." : "Sincronizando..."} color="warning" variant="outlined" icon={<CircularProgress size={14} />} />
                        ) : esError ? (
                               <Chip label="Error" color="error" icon={<ErrorIcon />} />
                        ) : esWarning ? (
                           <Chip label="Ocupado" sx={{ bgcolor: '#fff3e0', color: '#e65100', border: '1px solid #ffe0b2' }} icon={<HourglassEmptyIcon style={{ color: '#e65100' }} />} />
                        ) : resultado.tipo === 'exito' ? (
                           <Chip label={resultado.accion === 'sync' ? "Sincronizado" : "Online"} color="success" icon={<CheckCircleIcon />} />
                        ) : (
                           <Chip label="Pendiente" />
                        )}
                      </Box>

                      {exitoSync && (
                        <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2, border: '1px solid #ffe0b2' }}>
                            <Typography variant="caption" color="warning.dark" fontWeight="bold" gutterBottom display="block">
                                RESULTADO DEL ESCANEO:
                            </Typography>
                            
                            <Stack direction="row" spacing={1} justifyContent="space-between">
                                <Tooltip title="Nodos Físicos (Hypervisors)">
                                    <Chip 
                                        size="small" 
                                        icon={<StorageIcon sx={{ fontSize: 16, color: '#e65100 !important' }} />} 
                                        label={`${info.nodos} Nodos`} 
                                        sx={{ bgcolor: 'white', fontWeight: 'bold', border: '1px solid #ffe0b2', color: '#e65100' }} 
                                    />
                                </Tooltip>

                                <Tooltip title="Máquinas Virtuales Detectadas">
                                    <Chip 
                                        size="small" 
                                        icon={<ComputerIcon sx={{ fontSize: 16, color: '#1565c0 !important' }} />} 
                                        label={`${info.vms} VMs`} 
                                        sx={{ bgcolor: 'white', color: '#1565c0', borderColor: '#bbdefb', border: '1px solid' }} 
                                    />
                                </Tooltip>

                                <Tooltip title="Recursos Nuevos Insertados en BD">
                                    <Chip 
                                        size="small" 
                                        icon={<AddCircleIcon sx={{ fontSize: 16, color: '#2e7d32 !important' }} />} 
                                        label={`+${totalInsertados} New`} 
                                        sx={{ bgcolor: 'white', color: '#2e7d32', borderColor: '#c8e6c9', border: '1px solid' }} 
                                    />
                                </Tooltip>
                            </Stack>
                        </Box>
                      )}

                      {((esError || esWarning) && !apiError) && (
                          <Alert severity={esWarning ? "warning" : "error"} sx={{ py: 0, fontSize: '0.75rem' }}>{resultado.mensaje}</Alert>
                      )}

                      {!exitoSync && !esError && !esWarning && !apiError && (
                        <Box sx={{ bgcolor: '#f5f7fa', p: 1.5, borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">Última sync:</Typography>
                            <Typography variant="body2" fontWeight="medium">
                            {ep.fecha_ultima_sync ? new Date(ep.fecha_ultima_sync).toLocaleString() : 'Nunca'}
                            </Typography>
                        </Box>
                      )}

                      <Stack direction="row" spacing={1}>
                        <Button 
                            variant="outlined" color="inherit" fullWidth size="small" startIcon={<FactCheckIcon />}
                            onClick={() => conectarBackend(ep.id, 'verify')} disabled={procesando || sincronizandoTodo || apiError} 
                        >
                          Verificar
                        </Button>
                        <Button 
                            variant="contained" color="warning" fullWidth size="small" startIcon={<SyncIcon />}
                            onClick={() => conectarBackend(ep.id, 'sync')} disabled={procesando || sincronizandoTodo || esError || apiError} 
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