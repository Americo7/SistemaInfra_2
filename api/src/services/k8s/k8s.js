import { KubeConfig, CoreV1Api } from '@kubernetes/client-node'
import { db } from 'src/lib/db'

/**
 * Obtiene una instancia autenticada de la API CoreV1 de Kubernetes
 */
export const getK8sClient = async (endpointId) => {
  console.log(`[K8s] Iniciando cliente para Endpoint ID: ${endpointId}`)

  // 1. Obtener credenciales de la BD
  const ep = await db.k8sEndpoint.findUnique({
    where: { id: endpointId },
  })

  if (!ep) {
    throw new Error('K8sEndpoint no encontrado en la base de datos')
  }

  if (!ep.url_api || !ep.token_bearer) {
    throw new Error('Configuración K8s incompleta: Falta URL o Token')
  }

  // 2. Configurar KubeConfig manualmente (sin archivo .yaml)
  const kc = new KubeConfig()

  kc.loadFromOptions({
    clusters: [
      {
        name: `cluster-${ep.id}`,
        server: ep.url_api,
        skipTLSVerify: true, // Importante para IPs privadas o certs autofirmados
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

  // 3. Crear instancia de la API
  const k8sApi = kc.makeApiClient(CoreV1Api)
  console.log('[K8s] Cliente creado exitosamente')

  return { k8sApi, endpoint: ep }
}

/**
 * Lista los nodos físicos/virtuales del cluster K8s
 */
export const listarNodosK8s = async (endpointId) => {
  const { k8sApi } = await getK8sClient(endpointId)

  try {
    console.log('[K8s] Solicitando lista de nodos...')
    const res = await k8sApi.listNode()

    console.log(`[K8s] Se encontraron ${res.body.items.length} nodos.`)

    // Mapeamos solo la info útil para no saturar logs
    return res.body.items.map((node) => ({
      name: node.metadata.name,
      uid: node.metadata.uid,
      roles: Object.keys(node.metadata.labels)
        .filter((key) => key.startsWith('node-role.kubernetes.io/'))
        .map((key) => key.split('/')[1])
        .join(', '),
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
    throw new Error(`Error Kubernetes: ${error.message}`)
  }
}