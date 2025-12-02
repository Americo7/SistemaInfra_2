// src/lib/k8s/fetch.js
import { getK8sClient } from './client'
import { valkey } from 'src/lib/valkey' // 🟢 Importamos Valkey

/* ============================================================
   HELPER: Cache Wrapper (Reutilizable)
============================================================ */
const cachedApiCall = async (key, ttlSeconds, fetchFn) => {
  if (!key) return fetchFn() // Si no hay key, paso directo (sin caché)

  try {
    const cached = await valkey.get(key)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (err) {
    console.warn(`[Valkey] Error leyendo cache ${key}:`, err.message)
  }

  const data = await fetchFn()

  if (data) {
    // Guardamos en background
    valkey.set(key, JSON.stringify(data), 'EX', ttlSeconds).catch(() => {})
  }

  return data
}

/* ============================================================
   EXTRACTORES (Helpers puros)
============================================================ */
const extractRoles = (node) => {
  const labels = node.metadata?.labels || {}
  return Object.keys(labels)
    .filter(k => k.startsWith('node-role.kubernetes.io/'))
    .map(k => k.split('/')[1] || 'worker')
}

const extractReady = (status) => {
  const cond = status?.conditions || []
  const ready = cond.find(c => c.type === 'Ready')
  return ready?.status === 'True' ? 'Ready' : 'NotReady'
}

const extractIPs = (status) => {
  const addrs = status?.addresses || []
  return {
    internalIP: addrs.find(a => a.type === 'InternalIP')?.address || null,
    hostname: addrs.find(a => a.type === 'Hostname')?.address || null,
    externalIP: addrs.find(a => a.type === 'ExternalIP')?.address || null,
  }
}

const detectProvider = (node) => {
  const annotations = node.metadata?.annotations || {}
  if (annotations['harvesterhci.io/node-id']) return 'harvester'
  if (annotations['openstack.org/instance-id']) return 'openstack'
  if (annotations['proxmox.vm/uuid']) return 'proxmox'
  return 'k8s'
}

/* ============================================================
   FETCH NODES (Con Valkey Caching)
   @param source: Cliente K8s o Endpoint Object
   @param cacheId: (Opcional) ID del endpoint para generar la key de cache
============================================================ */
export const fetchK8sNodes = async (source, cacheId = null) => {
  let core
  let derivedId = cacheId

  // 1. Determinar Cliente y ID para Cache
  if (source && typeof source.listNode === 'function') {
    // Es un cliente ya instanciado
    core = source
  } else if (source && (source.url_api || source.api_url)) {
    // Es un objeto endpoint (DB), instanciamos cliente
    core = getK8sClient(source)
    derivedId = derivedId || source.id
  } else {
    throw new Error('fetchK8sNodes: Fuente inválida (ni cliente ni endpoint)')
  }

  // 2. Definir Key de Cache (k8s:nodes:{id})
  // Si no tenemos ID, la key es null y 'cachedApiCall' no cacheará (safety fallback)
  const cacheKey = derivedId ? `k8s:${derivedId}:nodes:list` : null

  /* -----------------------------------
     🟢 LLAMADA API CON CACHÉ (10s)
  ----------------------------------- */
  let rawItems = await cachedApiCall(cacheKey, 10, async () => {
    try {
      const res = await core.listNode()
      // Solo cacheamos el array de items para ahorrar memoria, no todo el objeto response
      return res?.body?.items || res?.items || []
    } catch (err) {
      console.error('Error K8s API:', err?.response?.body || err)
      throw new Error('No se pudo comunicar con el API Kubernetes')
    }
  })

  if (!rawItems) {
    throw new Error('Respuesta inválida desde el API K8s')
  }

  // 3. Transformación de Datos (Mapping)
  return rawItems.map((node) => {
    const meta = node.metadata || {}
    const status = node.status || {}
    const info = status.nodeInfo || {}

    const provider = detectProvider(node)
    const systemUUID = info.systemUUID || null

    // identity_key: ALINEADO CON BD
    const identity_key = systemUUID
      ? `${provider}:${systemUUID}`  // ← "proxmox:2cfc085a-..."
      : `k8s:${meta.uid}`

    return {
      name: meta.name,
      uid: meta.uid,
      provider,
      identity_key,
      systemUUID,
      machineID: info.machineID || null,
      roles: extractRoles(node),
      estado: extractReady(status),
      addresses: extractIPs(status),
      capacity: status.capacity || {},
      allocatable: status.allocatable || {},
      raw: { metadata: meta, status },
    }
  })
}