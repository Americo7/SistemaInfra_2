import { getK8sClient } from './client'

/* ============================================
   Helpers (Roles, IPs, Provider, Ready)
   Mantienen tu lógica original intacta
============================================ */
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
  if (annotations['proxmox.vm/uuid']) return 'proxmox-vm'
  return 'k8s' // Default
}

/* ============================================
   FETCH K8S NODES — Inteligente
   Acepta 'source' que puede ser Endpoint o Cliente K8s
============================================ */
export const fetchK8sNodes = async (source) => {
  let core

  // 1. DETECCIÓN: ¿Es un cliente ya conectado o un endpoint de BD?
  if (source && typeof source.listNode === 'function') {
    // Es el cliente k8sApi (Viene de syncMain)
    core = source
  } else if (source && (source.url_api || source.api_url)) {
    // Es un objeto de base de datos, conectamos nosotros
    core = getK8sClient(source)
  } else {
    throw new Error('fetchK8sNodes: Fuente inválida (ni cliente ni endpoint)')
  }

  let res
  try {
    // fetch sin await en la llamada al metodo si tu cliente es sincrono, 
    // pero listNode suele devolver promesa.
    res = await core.listNode()
  } catch (err) {
    console.error('Error K8s API:', err?.response?.body || err)
    throw new Error('No se pudo comunicar con el API Kubernetes')
  }

  const items = res?.body?.items || res?.items // Soporte para distintas versiones de cliente
  if (!items) {
    throw new Error('Respuesta inválida desde el API K8s')
  }

  // Mapeo usando tus helpers originales
  return items.map((node) => {
    const meta = node.metadata || {}
    const status = node.status || {}
    const info = status.nodeInfo || {}

    const provider = detectProvider(node)
    const systemUUID = info.systemUUID || null

    // Identidad: Prioridad al UUID del sistema
    const identity_key = systemUUID
      ? `uuid:${systemUUID}`
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
      raw: { metadata: meta, status }, // Guardamos raw por si acaso
    }
  })
}