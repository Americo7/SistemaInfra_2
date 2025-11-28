const cache = {}
const TTL = 20_000

export const getK8sCache = (id) => {
  const c = cache[id]
  if (!c) return null
  if (Date.now() - c.ts > TTL) { delete cache[id]; return null }
  return c
}

export const setK8sCache = (id, data) => {
  cache[id] = { ...data, ts: Date.now() }
}
