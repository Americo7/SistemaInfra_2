import { useState } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import StorageIcon from '@mui/icons-material/Storage'
import SyncIcon from '@mui/icons-material/Sync'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import DnsIcon from '@mui/icons-material/Dns'
import LanguageIcon from '@mui/icons-material/Language'

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
  const [sincronizandoTodo, setSincronizandoTodo] = useState(false)
  const [estadoSincronizacion, setEstadoSincronizacion] = useState({})

  // ---------------------------------------------------------
  // VARIABLE API_URL
  // ---------------------------------------------------------
  // Toma el valor de .env (http o https) o usa localhost por defecto
  const API_URL = process.env.API_URL || 'http://localhost:8911'

  const procesarSincronizacion = async (endpointId) => {
    console.log(`[K8sSync] Iniciando proceso para ID: ${endpointId}`)
    setIdEnProceso(endpointId)

    setEstadoSincronizacion((previos) => ({
        ...previos,
        [endpointId]: { tipo: 'cargando' }
    }))

    try {
      // Uso de la variable API_URL
      const urlDestino = `${API_URL}/k8sSync`
      console.log(`[K8sSync] Conectando a: ${urlDestino}`)

      const respuesta = await fetch(urlDestino, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpointId: endpointId }),
      })

      const datosRespuesta = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datosRespuesta.error || `Error del servidor: ${respuesta.status}`)
      }

      console.log('[K8sSync] Respuesta exitosa:', datosRespuesta)

      setEstadoSincronizacion((previos) => ({
        ...previos,
        [endpointId]: {
          tipo: 'exito',
          mensaje: 'Sincronizado',
          cantidadNodos: datosRespuesta.nodosSincronizados || 0,
        },
      }))

      toast.success(`Cluster "${datosRespuesta.cluster}" sincronizado correctamente`)
      await refetch()

    } catch (error) {
      console.error('[K8sSync] Error detectado:', error)
      setEstadoSincronizacion((previos) => ({
        ...previos,
        [endpointId]: {
            tipo: 'error',
            mensaje: error.message
        },
      }))
      toast.error(`Fallo al sincronizar: ${error.message}`)
    } finally {
      setIdEnProceso(null)
    }
  }

  const ejecutarSincronizacionMasiva = async () => {
    const listaEndpoints = data?.k8sEndpoints || []

    if (listaEndpoints.length === 0) {
      toast.info('No hay clusters registrados para sincronizar')
      return
    }

    setSincronizandoTodo(true)
    toast.loading('Iniciando sincronización masiva...', { id: 'toast-masivo' })

    for (const endpoint of listaEndpoints) {
      await procesarSincronizacion(endpoint.id)
    }

    toast.dismiss('toast-masivo')
    toast.success('Proceso masivo finalizado')
    setSincronizandoTodo(false)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
        <Typography ml={2}>Cargando configuración...</Typography>
      </Box>
    )
  }

  const endpoints = data?.k8sEndpoints ?? []

  return (
    <Box p={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={4} spacing={2}>
        <Box>
            <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
            <DnsIcon fontSize="large" color="primary" />
            Sincronización Kubernetes
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Conectando vía: {API_URL}
            </Typography>
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

      {endpoints.length === 0 ? (
        <Alert severity="info" variant="outlined">
            No se han encontrado Endpoints de Kubernetes configurados en la base de datos.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {endpoints.map((endpoint) => {
            const resultado = estadoSincronizacion[endpoint.id] || {}
            const estaCargando = idEnProceso === endpoint.id

            let colorChip = 'default'
            let iconoChip = <StorageIcon />
            let textoChip = 'Pendiente'

            if (resultado.tipo === 'exito') {
              colorChip = 'success'
              iconoChip = <CheckCircleIcon />
              textoChip = `OK (${resultado.cantidadNodos} nodos)`
            } else if (resultado.tipo === 'error') {
              colorChip = 'error'
              iconoChip = <ErrorIcon />
              textoChip = 'Error'
            }

            return (
              <Grid item xs={12} md={6} lg={4} key={endpoint.id}>
                <Card elevation={4} sx={{ borderRadius: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>

                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: '#326ce5', width: 50, height: 50 }}>
                        <LanguageIcon />
                      </Avatar>
                    }
                    title={
                        <Typography variant="h6" fontWeight="bold">
                            {endpoint.nombre}
                        </Typography>
                    }
                    subheader={
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {endpoint.url_api}
                        </Typography>
                    }
                  />
                  <Divider />

                  <CardContent>
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                         <Typography variant="body2" color="text.secondary">
                            Estado Sincronización:
                         </Typography>
                         <Chip
                            label={estaCargando ? 'Conectando...' : textoChip}
                            color={colorChip}
                            size="small"
                            variant={estaCargando ? "outlined" : "filled"}
                            icon={estaCargando ? <CircularProgress size={16} /> : iconoChip}
                         />
                      </Box>

                      {resultado.tipo === 'error' && (
                        <Alert severity="error" sx={{ fontSize: '0.8rem' }}>
                           {resultado.mensaje}
                        </Alert>
                      )}

                      <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Última actualización exitosa:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                            {endpoint.fecha_ultima_sync
                            ? new Date(endpoint.fecha_ultima_sync).toLocaleString()
                            : 'Nunca sincronizado'}
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<SyncIcon />}
                        onClick={() => procesarSincronizacion(endpoint.id)}
                        disabled={estaCargando || sincronizandoTodo}
                        sx={{ mt: 1 }}
                      >
                        {estaCargando ? 'Sincronizando...' : 'Sincronizar Ahora'}
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