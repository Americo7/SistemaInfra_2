// lib/proxmox/fetch.js
import { getProxmoxClient } from './client'
import { cacheFetch, cacheKey } from './cache'

/* ============================================================
   Concurrencia (p-limit minimalista)
============================================================ */
const pLimit = (max = 5) => {
  const queue = []
  let active = 0

  const next = () => {
    if (active >= max || queue.length === 0) return

    active++
    const { fn, resolve, reject } = queue.shift()

    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        active--
        next()
      })
  }

  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject })
      next()
    })
}

const limitNodeFetch = pLimit(5)  // para nodos
const limitVMFetch = pLimit(10)   // para VMs

/* ============================================================
   Helper para seleccionar IP de interfaz principal del nodo
============================================================ */
const pickIP = (interfaces = []) => {
  if (!Array.isArray(interfaces)) return null

  const prefer = ['vmbr0', 'eno1', 'eth0', 'enp0s3']

  let iface =
    interfaces.find(i => prefer.includes(i.iface) && i.address) ||
    interfaces.find(i => i.method === 'static' && i.address) ||
    interfaces.find(i => i.address)

  return iface?.address || null
}

/* ============================================================
   FETCH /cluster/resources (turbo)
============================================================ */
const fetchClusterResources = async (endpointId) => {
  const client = await getProxmoxClient(endpointId)

  return await cacheFetch(
    `px:${endpointId}:cluster:resources`,
    10, // TTL 10s
    async () => {
      const res = await client.get('/cluster/resources')
      if (!res.data?.data) throw new Error("Error /cluster/resources")
      return res.data.data
    }
  )
}

/* ============================================================
   FETCH NODES (OPTIMIZADO + REDIS + cluster/resources)
============================================================ */
export const fetchNodes = async (endpointId) => {
  const client = await getProxmoxClient(endpointId)

  // 1) Obtener recursos del cluster (1 sola llamada)
  const resources = await fetchClusterResources(endpointId)

  // Filtrar solo nodos
  const nodosBase = resources.filter(r => r.type === "node")

  // 2) Enriquecer nodos con network + status
  const nodosFull = await Promise.all(
    nodosBase.map((n) =>
      limitNodeFetch(async () => {
        const nodeName = n.node

        // NETWORK (cacheado)
        const net = await cacheFetch(
          cacheKey.nodeNetwork(endpointId, nodeName),
          10,
          async () => {
            const r = await client.get(`/nodes/${nodeName}/network`)
            return r.data?.data || []
          }
        )

        // STATUS (cacheado)
        const status = await cacheFetch(
          cacheKey.nodeStatus(endpointId, nodeName),
          5,
          async () => {
            const r = await client.get(`/nodes/${nodeName}/status`)
            return r.data?.data || {}
          }
        )

        return {
          node: nodeName,
          ip: pickIP(net),
          estado: status.status || n.status,
          mem_total: status.memory?.total ?? n.maxmem ?? null,
          disk_total: status.rootfs?.total ?? null,
        }
      })
    )
  )

  return nodosFull
}

/* ============================================================
   FETCH NODE STATUS (compatibilidad)
============================================================ */
export const fetchNodeStatus = async (endpointId, node) => {
  const client = await getProxmoxClient(endpointId)
  const res = await client.get(`/nodes/${node}/status`)
  return res.data?.data || {}
}

/* ============================================================
   FETCH VMs DE UN NODO (USANDO cluster/resources)
============================================================ */
export const fetchVMs = async (endpointId, node) => {
  const resources = await fetchClusterResources(endpointId)

  // Filtrar solo las VMs del nodo
  return resources.filter(
    (r) => r.type === "qemu" && r.node === node
  )
}

/* ============================================================
   FETCH VM CONFIG
============================================================ */
export const fetchVMConfig = async (endpointId, node, vmid) => {
  const client = await getProxmoxClient(endpointId)

  const res = await limitVMFetch(() =>
    client.get(`/nodes/${node}/qemu/${vmid}/config`)
  )

  const data = res.data?.data || {}

  // Normalizar smbios1 (puede venir como "uuid=xxxx")
  if (data.smbios1) {
    data.smbios1 = data.smbios1.trim()
  }

  return data

}

/* ============================================================
   QEMU AGENT OS INFO
============================================================ */
export const fetchVMOSInfo = async (endpointId, node, vmid) => {
  try {
    const client = await getProxmoxClient(endpointId)

    const res = await limitVMFetch(() =>
      client.get(`/nodes/${node}/qemu/${vmid}/agent/get-osinfo`)
    )

    return res.data?.data?.result || null
  } catch {
    return null
  }
}

/* ============================================================
   QEMU AGENT NETWORK
============================================================ */
export const fetchVMNetwork = async (endpointId, node, vmid) => {
  try {
    const client = await getProxmoxClient(endpointId)

    const res = await limitVMFetch(() =>
      client.get(
        `/nodes/${node}/qemu/${vmid}/agent/network-get-interfaces`
      )
    )

    return res.data?.data?.result || null
  } catch {
    return null
  }
}
