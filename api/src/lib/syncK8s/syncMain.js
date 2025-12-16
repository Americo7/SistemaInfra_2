import { db } from 'src/lib/db'
import { getK8sClient } from 'src/lib/k8s/client'
import { valkey } from 'src/lib/valkey'
import { syncCluster } from './syncCluster'
import { syncNodos } from './syncNodos'
import { startSyncLog, finishSyncLog } from 'src/lib/syncLogger'

export const verifyK8sConnection = async (endpointId) => {
    console.log(`[K8s] Verificando conexión para ID: ${endpointId}`)
  
    try {
      const endpoint = await db.k8sEndpoint.findUnique({ where: { id: endpointId } })
      if (!endpoint) throw new Error('Endpoint no encontrado')
  
      const k8sApi = getK8sClient(endpoint)
      await k8sApi.listNode() 
  
      return { 
        success: true, 
        message: `Conexión exitosa con el cluster: ${endpoint.nombre}`,
        endpoint: endpoint.nombre
      }
  
    } catch (error) {
      console.error('[K8s] Error de verificación:', error)
      return { 
        success: false, 
        message: `Fallo de conexión: ${error.body?.message || error.message}` 
      }
    }
}

// --- MODO 2: SINCRONIZACIÓN COMPLETA ---
// CORRECCIÓN: Agregamos 'usuarioIdExplicit' como tercer parámetro
export const syncK8sBasic = async (endpointId, trigger = 'MANUAL', usuarioIdExplicit) => {
  console.log(`[K8s] Iniciando Full Sync para ID: ${endpointId}`)

  const lockKey = `k8s:sync:lock:${endpointId}`
  const acquired = await valkey.set(lockKey, 'LOCKED', 'EX', 60, 'NX')

  if (!acquired) {
    throw new Error(`Sincronización K8s ya está en curso para endpoint ${endpointId}`)
  }

  const startTime = new Date()
  
  // CORRECCIÓN: Pasamos el ID explícito al logger
  const logId = await startSyncLog({
    tipo: 'K8S',
    endpointId,
    trigger,
    usuarioIdExplicit // <--- AQUÍ SE ENVÍA EL USUARIO
  })

  try {
    const endpoint = await db.k8sEndpoint.findUnique({ where: { id: endpointId } })
    if (!endpoint) throw new Error('Endpoint no encontrado')

    const k8sApi = getK8sClient(endpoint)

    // 1. Sync Cluster
    const cluster = await syncCluster(endpoint)
    
    // 2. Sync Nodos
    const resultNodos = await syncNodos(k8sApi, cluster.id)

    // 3. Update Timestamp
    await db.k8sEndpoint.update({
      where: { id: endpoint.id },
      data: { fecha_ultima_sync: new Date() }
    })

    const response = { 
      success: true, 
      message: `Sincronización finalizada. Nodos: ${resultNodos.procesados}`,
      procesados: resultNodos.procesados,
      desactivados: resultNodos.desactivados,
      desglose: resultNodos.desglose 
    }

    // 4. FINALIZAR LOG
    await finishSyncLog({
      logId,
      success: true,
      startObj: startTime,
      metrics: {
        total_clusters: 1,
        total_nodos: resultNodos.procesados,
        snapshot: response 
      }
    })

    return response

  } catch (error) {
    console.error('[K8s] Error Sync:', error)
    
    await finishSyncLog({
      logId,
      success: false,
      error: error,
      startObj: startTime
    })

    throw new Error(error.message)
  } finally {
    await valkey.del(lockKey)
  }
}