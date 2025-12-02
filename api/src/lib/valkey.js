import Redis from 'ioredis'

const valkeyUrl = process.env.VALKEY_URL || process.env.REDIS_URL || 'redis://localhost:6379'

export const valkey = new Redis(valkeyUrl, {
  // Opciones recomendadas para entornos de producción/contenedores
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

console.log(`🔌 Conectado a Valkey en ${valkeyUrl}`)