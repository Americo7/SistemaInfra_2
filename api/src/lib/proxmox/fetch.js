// src/lib/proxmox/fetch.js
import { getProxmoxClient } from './client'
import { valkey } from 'src/lib/valkey' // 🟢 Usamos Valkey

/* ============================================================
   HELPER: Cache Wrapper con Valkey
   Simula el comportamiento del antiguo cacheFetch
============================================================ */
const cachedApiCall = async (key, ttlSeconds, fetchFn) => {
  try {
    const cached = await valkey.get(key)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (err) {
    console.warn(`[Valkey] Error leyendo cache ${key}:`, err.message)
  }

  // Si no está en cache, ejecutamos la función
  const data = await fetchFn()

  // Guardamos en background (sin await para no bloquear respuesta)
  if (data !== undefined) {
    valkey.set(key, JSON.stringify(data), 'EX', ttlSeconds).catch(() => {})
  }

  return data
}

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

  // Prioridad de interfaces de gestión comunes
  const prefer = ['vmbr0', 'eno1', 'eth0', 'enp0s3', 'bond0']

  let iface =
    interfaces.find(i => prefer.includes(i.iface) && i.address) ||
    interfaces.find(i => i.method === 'static' && i.address) ||
    interfaces.find(i => i.address && i.family === 'inet') // Preferir IPv4

  return iface?.address || null
}

/* ============================================================
   FETCH /cluster/resources (Vista Global Rápida)
============================================================ */
const fetchClusterResources = async (endpointId) => {
  const client = await getProxmoxClient(endpointId)

  return await cachedApiCall(
    `px:${endpointId}:cluster:resources`,
    10, // TTL 10s (Información muy volátil)
    async () => {
      const res = await client.get('/cluster/resources')
      if (!res.data?.data) throw new Error("Error /cluster/resources")
      return res.data.data
    }
  )
}

/* ============================================================
   FETCH NODES (ROBUSTO + Fallbacks)
============================================================ */
export const fetchNodes = async (endpointId) => {
  const client = await getProxmoxClient(endpointId)

  // 1) Obtener recursos del cluster (1 sola llamada rápida)
  const resources = await fetchClusterResources(endpointId)

  // Filtrar solo nodos
  const nodosBase = resources.filter(r => r.type === "node")

  // 2) Enriquecer nodos con network + status detallado
  const nodosFull = await Promise.all(
    nodosBase.map((n) =>
      limitNodeFetch(async () => {
        const nodeName = n.node

        try {
          // Intentamos obtener detalles profundos
          
          // NETWORK (cacheado 60s - Las IPs de nodos rara vez cambian)
          const netKey = `px:${endpointId}:node:${nodeName}:network`
          const net = await cachedApiCall(
            netKey,
            60, 
            async () => {
              const r = await client.get(`/nodes/${nodeName}/network`)
              return r.data?.data || []
            }
          )

          // STATUS (cacheado 10s - Estado operativo cambia rápido)
          const statusKey = `px:${endpointId}:node:${nodeName}:status`
          const status = await cachedApiCall(
            statusKey,
            10,
            async () => {
              const r = await client.get(`/nodes/${nodeName}/status`)
              return r.data?.data || {}
            }
          )

          return {
            node: nodeName,
            ip: pickIP(net),
            // Preferimos el status detallado, sino el del cluster
            estado: status.status || n.status, 
            mem_total: status.memory?.total ?? n.maxmem ?? null,
            disk_total: status.rootfs?.total ?? n.maxdisk ?? null,
          }

        } catch (error) {
          // CRÍTICO: Si el nodo está offline (ej: error de conexión),
          // no rompemos el Promise.all. Retornamos la info básica que ya teníamos.
          console.warn(`⚠️ Nodo ${nodeName} inalcanzable para detalles. Usando datos básicos.`)
          
          return {
            node: nodeName,
            ip: null, // No podemos saber la IP si no responde
            estado: 'offline', // Forzamos offline si falló la conexión
            mem_total: n.maxmem || null,
            disk_total: n.maxdisk || null,
          }
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
  try {
    const client = await getProxmoxClient(endpointId)
    const res = await client.get(`/nodes/${node}/status`)
    return res.data?.data || {}
  } catch (e) {
    console.error(`Error fetchNodeStatus ${node}:`, e.message)
    return {}
  }
}

/* ============================================================
   FETCH VMs DE UN NODO (USANDO cluster/resources)
============================================================ */
export const fetchVMs = async (endpointId, node) => {
  const resources = await fetchClusterResources(endpointId)

  return resources
    .filter((r) => (r.type === "qemu" || r.type === "lxc") && r.node === node)
    .map((vm) => ({
      vmid: vm.vmid,
      node: vm.node,
      name: vm.name || null,
      type: vm.type,
      status: vm.status,

      // CPU de cluster/resources (si Proxmox las devuelve)
      cpus: vm.cpus ? Number(vm.cpus) : null,
      maxcpu: vm.maxcpu ? Number(vm.maxcpu) : null,

      // RAM (bytes)
      maxmem: vm.maxmem || null,
    }))
}

/* ============================================================
   FETCH VM CONFIG – NORMALIZADO (SIEMPRE NÚMEROS)
============================================================ */
export const fetchVMConfig = async (endpointId, node, vmid) => {
  try {
    const client = await getProxmoxClient(endpointId)

    // Cacheamos la config porque rara vez cambia (TTL 300s / 5min)
    // Esto acelera mucho las sincronizaciones sucesivas
    const configKey = `px:${endpointId}:vm:${vmid}:config`
    
    return await cachedApiCall(configKey, 300, async () => {
      const res = await limitVMFetch(() =>
        client.get(`/nodes/${node}/qemu/${vmid}/config`)
      )
      const raw = res.data?.data || {}

      const n = (v) => (v !== undefined && v !== null ? Number(String(v)) : null)

      const normalized = {
        ...raw,
        smbios1: raw.smbios1 ? raw.smbios1.trim() : null,

        // Normalización de CPU
        cores: n(raw.cores),
        sockets: n(raw.sockets),
        cpus: n(raw.cpus),         // LXC
        cpulimit: n(raw.cpulimit), // LXC
        cpuunits: n(raw.cpuunits),

        // RAM (MB)
        memory: n(raw.memory),
      }
      return normalized
    })

  } catch (error) {
    console.warn(`Error config VM ${vmid}: ${error.message}`)
    return {}
  }
}

/* ============================================================
   QEMU AGENT OS INFO
============================================================ */
export const fetchVMOSInfo = async (endpointId, node, vmid) => {
  try {
    const client = await getProxmoxClient(endpointId)

    // Agregamos timeout corto porque si no hay agente, esto se cuelga a veces
    const res = await limitVMFetch(() =>
      client.get(`/nodes/${node}/qemu/${vmid}/agent/get-osinfo`, { timeout: 3000 })
    )

    return res.data?.data?.result || null
  } catch {
    // Es normal que falle si no tiene guest-agent instalado
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
        `/nodes/${node}/qemu/${vmid}/agent/network-get-interfaces`, 
        { timeout: 3000 }
      )
    )

    return res.data?.data?.result || null
  } catch {
    return null
  }
}