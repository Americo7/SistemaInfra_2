import { KubeConfig, CoreV1Api } from '@kubernetes/client-node'
import { db } from 'src/lib/db'

/**
 * Obtiene una instancia autenticada de la API CoreV1 de Kubernetes
 */
export const getK8sClient = async (endpointId) => {
  console.log(`[K8s] Iniciando cliente para Endpoint ID: ${endpointId}`)

  const ep = await db.k8sEndpoint.findUnique({
    where: { id: endpointId },
  })

  if (!ep) throw new Error('K8sEndpoint no encontrado en la base de datos')
  if (!ep.url_api || !ep.token_bearer) throw new Error('Configuración K8s incompleta')

  const kc = new KubeConfig()

  kc.loadFromOptions({
    clusters: [
      {
        name: `cluster-${ep.id}`,
        server: ep.url_api,
        skipTLSVerify: true,
      },
    ],
    users: [
      {
        name: `user-${ep.id}`,
        token: ep.token_bearer,
      },
    ],
    contexts: [
      {
        name: `context-${ep.id}`,
        user: `user-${ep.id}`,
        cluster: `cluster-${ep.id}`,
      },
    ],
    currentContext: `context-${ep.id}`,
  })

  const k8sApi = kc.makeApiClient(CoreV1Api)
  return { k8sApi, endpoint: ep }
}

/**
 * Lista los nodos físicos/virtuales del cluster K8s
 */
export const listarNodosK8s = async (endpointId) => {
  const { k8sApi } = await getK8sClient(endpointId)

  try {
    console.log('[K8s] Solicitando lista de nodos...')
    
    // Hacemos la llamada
    const res = await k8sApi.listNode()

    // --- CORRECCIÓN DE BUG ---
    // Determinamos dónde está la lista de items.
    // A veces está en res.body.items, a veces en res.items directo.
    const data = res.body || res
    const items = data.items

    // Debug para ver qué estamos recibiendo si vuelve a fallar
    if (!items) {
      console.error('[K8s] Estructura inesperada:', Object.keys(res))
      throw new Error('La respuesta de Kubernetes no contiene la lista de "items"')
    }

    console.log(`[K8s] Se encontraron ${items.length} nodos.`)

    return items.map((node) => ({
      name: node.metadata.name,
      uid: node.metadata.uid,
      roles: Object.keys(node.metadata?.labels || {})
        .filter((key) => key.startsWith('node-role.kubernetes.io/'))
        .map((key) => key.split('/')[1])
        .join(', ') || 'worker', // Default a worker si no hay etiqueta
      status: node.status.conditions.find((c) => c.type === 'Ready')?.status,
      cpu: node.status.capacity.cpu,
      memory: node.status.capacity.memory,
      os: node.status.nodeInfo.osImage,
      kernel: node.status.nodeInfo.kernelVersion,
      kubelet: node.status.nodeInfo.kubeletVersion,
      addresses: node.status.addresses,
    }))
  } catch (error) {
    console.error('[K8s] Error listando nodos:', error)
    // Extraemos mensaje limpio si es error de Axios/K8s
    const msg = error.response?.body?.message || error.message
    throw new Error(`Error Kubernetes: ${msg}`)
  }
}