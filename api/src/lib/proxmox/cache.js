// lib/proxmox/cache.js
import Redis from "ioredis"

// Conexión única a Redis (pool único)
export const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
})

// =============================================================
//  CACHE SIMPLE (TTL controlado)
// =============================================================
export const cacheGet = async (key) => {
  try {
    const raw = await redis.get(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null // fallback silencioso
  }
}

export const cacheSet = async (key, value, ttl = 10) => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl)
  } catch {
    // si redis falla → no romper sincronización
  }
}

export const cacheFetch = async (key, ttl, fetcher) => {
  const cached = await cacheGet(key)
  if (cached) return cached

  const fresh = await fetcher()
  await cacheSet(key, fresh, ttl)
  return fresh
}

// =============================================================
//  LOCK DISTRIBUIDO (para evitar doble sincronización)
// =============================================================
export const acquireLock = async (key, ttl = 30) => {
  try {
    const result = await redis.set(key, "1", "NX", "EX", ttl)
    return result === "OK"
  } catch {
    return false
  }
}

export const releaseLock = async (key) => {
  try {
    await redis.del(key)
  } catch {
    // ignorar errores
  }
}

// =============================================================
//  HELPERS
// =============================================================
export const cacheKey = {
  nodes: (endpointId) => `px:endpoint:${endpointId}:nodes`,
  nodeNetwork: (endpointId, node) => `px:${endpointId}:node:${node}:network`,
  nodeStatus: (endpointId, node) => `px:${endpointId}:node:${node}:status`,
  vms: (endpointId, node) => `px:${endpointId}:node:${node}:vms`,
  lockSync: (endpointId) => `px:sync:lock:${endpointId}`,
}
