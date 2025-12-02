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

  const API_URL = process.env.API_URL || 'http://localhost:8911'

  /* ============================================================
     CONEXIÓN BACKEND (Con Manejo de Bloqueo 409)
  ============================================================ */
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
      const respuesta = await fetch(`${API_URL}/proxmoxSync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointId,
          soloVerificar: accion === 'verify',
        }),
      })

      const datos = await respuesta.json()

      // 🟢 DETECCIÓN DE BLOQUEO (Valkey Lock)
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

    } catch (error) {
      // 🟢 MANEJO VISUAL DEL BLOQUEO
      const esBloqueo = error.message.includes('BLOQUEADO') || error.message.includes('ya está en ejecución')

      setEstadoSincronizacion((prev) => ({
        ...prev,
        [endpointId]: {
          tipo: esBloqueo ? 'warning' : 'error',
          mensaje: esBloqueo ? 'Omitido: Ya en progreso' : error.message,
          accion 
        },
      }))
      
      if (!silencioso) {
         if (esBloqueo) toast('Sync en progreso... (omitido)', { icon: '⚠️', duration: 3000 })
         else toast.error(error.message)
      }
    } finally {
      if (!silencioso) {
         setIdEnProceso(null)
         setTipoProceso(null)
      }
    }
  }

  /* ============================================================
     SINCRONIZACIÓN MASIVA (Secuencial y Tolerante a Bloqueos)
  ============================================================ */
  const ejecutarSincronizacionMasiva = async () => {
    const lista = data?.proxmoxEndpoints || []
    if (lista.length === 0) return
    
    setSincronizandoTodo(true)
    toast.loading('Sincronizando todo...', { id: 'proxmox-masivo' })
    
    // Iteramos uno por uno. Si uno está bloqueado, saltará al catch,
    // mostrará el Chip amarillo y el loop continuará con el siguiente.
    for (const ep of lista) {
      await conectarBackend(ep.id, 'sync', false)
    }
    
    toast.dismiss('proxmox-masivo')
    toast.success('Proceso masivo completado')
    setSincronizandoTodo(false)
  }

  /* ============================================================
     AUTO-VERIFY
  ============================================================ */
  useEffect(() => {
    if (yaVerificado || loading) return
    const endpoints = data?.proxmoxEndpoints || []
    if (endpoints.length > 0) {
      setYaVerificado(true)
      endpoints.forEach((ep) => {
          // Solo verificamos si no hay estado previo
          if (!estadoSincronizacion[ep.id]) {
             conectarBackend(ep.id, 'verify', true)
          }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data, yaVerificado])

  /* ============================================================
     RENDER
  ============================================================ */
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
          color="warning" // Color Naranja Proxmox
          startIcon={sincronizandoTodo ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
          onClick={ejecutarSincronizacionMasiva}
          disabled={sincronizandoTodo || endpoints.length === 0}
        >
          {sincronizandoTodo ? 'Procesando...' : 'Sincronizar Todo'}
        </Button>
      </Stack>

      {/* LISTA */}
      {endpoints.length === 0 ? (
        <Alert severity="warning">No hay endpoints Proxmox configurados.</Alert>
      ) : (
        <Grid container spacing={3}>
          {endpoints.map((ep) => {
            const resultado = estadoSincronizacion[ep.id] || {}
            
            // Estado visual de carga (global o individual)
            const procesando = resultado.tipo === 'cargando'
            
            const esError = resultado.tipo === 'error'
            const esWarning = resultado.tipo === 'warning'
            const exitoSync = resultado.tipo === 'exito' && resultado.accion === 'sync'

            // Contadores
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
                      
                      {/* ESTADO */}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="600">Estado:</Typography>
                        {procesando ? (
                           <Chip label={resultado.accion === 'verify' ? "Verificando..." : "Sincronizando..."} color="warning" variant="outlined" icon={<CircularProgress size={14} />} />
                        ) : esError ? (
                           <Chip label="Error" color="error" icon={<ErrorIcon />} />
                        ) : esWarning ? (
                           /* 🟢 CHIP AMARILLO: CUANDO ESTÁ BLOQUEADO POR VALKEY */
                           <Chip label="Ocupado" sx={{ bgcolor: '#fff3e0', color: '#e65100', border: '1px solid #ffe0b2' }} icon={<HourglassEmptyIcon style={{ color: '#e65100' }} />} />
                        ) : resultado.tipo === 'exito' ? (
                           <Chip label={resultado.accion === 'sync' ? "Sincronizado" : "Online"} color="success" icon={<CheckCircleIcon />} />
                        ) : (
                           <Chip label="Pendiente" />
                        )}
                      </Box>

                      {/* --- ESTADÍSTICAS (ESTILO K8S) --- */}
                      {exitoSync && (
                        <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2, border: '1px solid #ffe0b2' }}>
                            <Typography variant="caption" color="warning.dark" fontWeight="bold" gutterBottom display="block">
                                RESULTADO DEL ESCANEO:
                            </Typography>
                            
                            <Stack direction="row" spacing={1} justifyContent="space-between">
                                {/* Total Nodos */}
                                <Tooltip title="Nodos Físicos (Hypervisors)">
                                    <Chip 
                                        size="small" 
                                        icon={<StorageIcon sx={{ fontSize: 16, color: '#e65100 !important' }} />} 
                                        label={`${info.nodos} Nodos`} 
                                        sx={{ bgcolor: 'white', fontWeight: 'bold', border: '1px solid #ffe0b2', color: '#e65100' }} 
                                    />
                                </Tooltip>

                                {/* Total VMs */}
                                <Tooltip title="Máquinas Virtuales Detectadas">
                                    <Chip 
                                        size="small" 
                                        icon={<ComputerIcon sx={{ fontSize: 16, color: '#1565c0 !important' }} />} 
                                        label={`${info.vms} VMs`} 
                                        sx={{ bgcolor: 'white', color: '#1565c0', borderColor: '#bbdefb', border: '1px solid' }} 
                                    />
                                </Tooltip>

                                {/* Insertados / Nuevos (Lo que pediste) */}
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

                      {/* MENSAJE ERROR O WARNING */}
                      {(esError || esWarning) && (
                          <Alert severity={esWarning ? "warning" : "error"} sx={{ py: 0, fontSize: '0.75rem' }}>{resultado.mensaje}</Alert>
                      )}

                      {/* FECHA */}
                      {!exitoSync && !esError && !esWarning && (
                        <Box sx={{ bgcolor: '#f5f7fa', p: 1.5, borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">Última sync:</Typography>
                            <Typography variant="body2" fontWeight="medium">
                            {ep.fecha_ultima_sync ? new Date(ep.fecha_ultima_sync).toLocaleString() : 'Nunca'}
                            </Typography>
                        </Box>
                      )}

                      {/* BOTONES */}
                      <Stack direction="row" spacing={1}>
                        <Button 
                            variant="outlined" color="inherit" fullWidth size="small" startIcon={<FactCheckIcon />}
                            onClick={() => conectarBackend(ep.id, 'verify')} disabled={procesando || sincronizandoTodo}
                        >
                          Verificar
                        </Button>
                        <Button 
                            variant="contained" color="warning" fullWidth size="small" startIcon={<SyncIcon />}
                            onClick={() => conectarBackend(ep.id, 'sync')} disabled={procesando || sincronizandoTodo || esError}
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