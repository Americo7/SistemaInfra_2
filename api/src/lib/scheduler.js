import cron from 'node-cron'
import { db } from 'src/lib/db'

// Importamos las funciones principales
import { syncProxmoxBasic } from 'src/lib/syncProxmox/syncMain'
import { syncK8sBasic } from 'src/lib/syncK8s/syncMain'

const CRON_PROXMOX = process.env.CRON_PROXMOX || '0 0 */23 * * *'
const CRON_K8S = process.env.CRON_K8S || '0 0 */24 * * *'

export const startScheduler = () => {
  console.log('⏰ [Scheduler] Iniciando sistema de Cronjobs...')

  // --- CRON PROXMOX ---
  cron.schedule(CRON_PROXMOX, async () => {
    console.log('🤖 [Cron-Proxmox] Ejecutando rutina automática...')
    try {
      const endpoints = await db.proxmoxEndpoint.findMany({
        where: { estado: 'ACTIVO' },
        select: { id: true, nombre: true }
      })

      for (const ep of endpoints) {
        try {
          // CORRECCIÓN: Eliminamos el '1'. Solo pasamos ID y Trigger.
          await syncProxmoxBasic(ep.id, 'CRON')
          
          console.log(`   ✅ [Cron-Proxmox] ${ep.nombre}: Sincronizado.`)
        } catch (err) {
          if (err.message && err.message.includes('ya está en ejecución')) {
            console.warn(`   ⚠️ [Cron-Proxmox] ${ep.nombre}: Omitido (Lock activo).`)
          } else {
            console.error(`   ❌ [Cron-Proxmox] ${ep.nombre}: Error -> ${err.message}`)
          }
        }
      }
    } catch (err) {
      console.error('   💀 [Cron-Proxmox] Error crítico:', err)
    }
  })

  // --- CRON KUBERNETES ---
  cron.schedule(CRON_K8S, async () => {
    console.log('🤖 [Cron-K8s] Ejecutando rutina automática...')
    try {
      const endpoints = await db.k8sEndpoint.findMany({
        where: { estado: 'ACTIVO' },
        select: { id: true, nombre: true }
      })

      for (const ep of endpoints) {
        try {
          // CORRECCIÓN: Eliminamos el '1'. Solo pasamos ID y Trigger.
          await syncK8sBasic(ep.id, 'CRON')

          console.log(`   ✅ [Cron-K8s] ${ep.nombre}: Sincronizado.`)
        } catch (err) {
          if (err.message && err.message.includes('ya está en ejecución')) {
            console.warn(`   ⚠️ [Cron-K8s] ${ep.nombre}: Omitido (Lock activo).`)
          } else {
            console.error(`   ❌ [Cron-K8s] ${ep.nombre}: Error -> ${err.message}`)
          }
        }
      }
    } catch (err) {
      console.error('   💀 [Cron-K8s] Error crítico:', err)
    }
  })
}