import { db } from 'src/lib/db'
import { getK8sClient } from 'src/lib/k8s/client'
import { syncCluster } from './syncCluster'
import { syncNodos } from './syncNodos'

// --- MODO 1: SOLO VERIFICAR CONEXIÓN ---
export const verifyK8sConnection = async (endpointId) => {
  console.log(`[K8s] Verificando conexión para ID: ${endpointId}`)
  
  try {
    const endpoint = await db.k8sEndpoint.findUnique({ where: { id: endpointId } })
    if (!endpoint) throw new Error('Endpoint no encontrado')

    const k8sApi = getK8sClient(endpoint)
    
    // Hacemos una llamada ligera para probar credenciales
    // listNode puede ser pesado si hay 1000 nodos, pero es la prueba definitiva de auth
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
export const syncK8sBasic = async (endpointId) => {
  console.log(`[K8s] Iniciando Full Sync para ID: ${endpointId}`)

  const endpoint = await db.k8sEndpoint.findUnique({ where: { id: endpointId } })
  if (!endpoint) throw new Error('Endpoint no encontrado')

  const k8sApi = getK8sClient(endpoint)

  try {
    // 1. Sync Cluster (Padre)
    const cluster = await syncCluster(endpoint)
    
    // 2. Sync Nodos (Hijos)
    // resultNodos contiene ahora: { procesados, desactivados, desglose: { virtual, fisico } }
    const resultNodos = await syncNodos(k8sApi, cluster.id)

    // 3. Actualizar Timestamp
    await db.k8sEndpoint.update({
      where: { id: endpoint.id },
      data: { fecha_ultima_sync: new Date() }
    })

    // 4. Retorno enriquecido para el Frontend
    return { 
      success: true, 
      message: `Sincronización finalizada. Nodos: ${resultNodos.procesados}`,
      procesados: resultNodos.procesados,
      desactivados: resultNodos.desactivados,
      desglose: resultNodos.desglose // <--- IMPORTANTE: Enviamos los contadores al front
    }

  } catch (error) {
    console.error('[K8s] Error Sync:', error)
    throw new Error(error.message)
  }
}