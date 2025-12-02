import cron from 'node-cron'
import { db } from 'src/lib/db'

// Importamos las funciones que YA tienen protección de Valkey (Locks) interna
import { syncProxmoxBasic } from 'src/lib/syncProxmox/syncMain'
import { syncK8sBasic } from 'src/lib/syncK8s/syncMain'

const CRON_PROXMOX = process.env.CRON_PROXMOX || '0 0 */23 * * *' // Default fallback
const CRON_K8S = process.env.CRON_K8S || '0 0 */24 * * *'

export const startScheduler = () => {
  console.log('⏰ [Scheduler] Iniciando sistema de Cronjobs...')
  console.log(`   └─ Proxmox: ${CRON_PROXMOX}`)
  console.log(`   └─ K8s:     ${CRON_K8S}`)

  /* ============================================================
     1. CRON PROXMOX
     Gracias a Valkey Lock en syncProxmoxBasic, si el usuario
     le dio click manual justo ahora, este cron simplemente
     saltará ("Skipped") sin romper nada.
  ============================================================ */
  cron.schedule(CRON_PROXMOX, async () => {
    console.log('🤖 [Cron-Proxmox] Ejecutando rutina automática...')
    
    try {
      const endpoints = await db.proxmoxEndpoint.findMany({
        where: { estado: 'ACTIVO' },
        select: { id: true, nombre: true } // Solo traemos lo necesario
      })

      if (endpoints.length === 0) {
        console.warn('   [Cron-Proxmox] No hay endpoints activos.')
        return
      }

      // Ejecutamos en SERIE para no saturar la red local del servidor
      // (aunque Valkey permitiría paralelo, es mejor ser amable con la CPU del cron)
      for (const ep of endpoints) {
        try {
          await syncProxmoxBasic(ep.id)
          console.log(`   ✅ [Cron-Proxmox] ${ep.nombre}: Sincronizado.`)
        } catch (err) {
          // Si el error es por bloqueo, es un aviso "bueno"
          if (err.message && err.message.includes('ya está en ejecución')) {
            console.warn(`   ⚠️ [Cron-Proxmox] ${ep.nombre}: Omitido (Ya en curso manual/auto).`)
          } else {
            console.error(`   ❌ [Cron-Proxmox] ${ep.nombre}: Error -> ${err.message}`)
          }
        }
      }

    } catch (err) {
      console.error('   💀 [Cron-Proxmox] Error crítico buscando endpoints:', err)
    }
  })

  /* ============================================================
     2. CRON KUBERNETES
     Misma lógica: El bloqueo distribuido gestiona la concurrencia.
  ============================================================ */
  cron.schedule(CRON_K8S, async () => {
    console.log('🤖 [Cron-K8s] Ejecutando rutina automática...')

    try {
      const endpoints = await db.k8sEndpoint.findMany({
        where: { estado: 'ACTIVO' },
        select: { id: true, nombre: true }
      })

      if (endpoints.length === 0) {
        console.warn('   [Cron-K8s] No hay endpoints activos.')
        return
      }

      for (const ep of endpoints) {
        try {
          await syncK8sBasic(ep.id)
          console.log(`   ✅ [Cron-K8s] ${ep.nombre}: Sincronizado.`)
        } catch (err) {
          if (err.message && err.message.includes('ya está en ejecución')) {
            console.warn(`   ⚠️ [Cron-K8s] ${ep.nombre}: Omitido (Ya en curso manual/auto).`)
          } else {
            console.error(`   ❌ [Cron-K8s] ${ep.nombre}: Error -> ${err.message}`)
          }
        }
      }

    } catch (err) {
      console.error('   💀 [Cron-K8s] Error crítico buscando endpoints:', err)
    }
  })
}