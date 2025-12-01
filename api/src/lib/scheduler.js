import cron from 'node-cron'
import { db } from 'src/lib/db'

// Funciones reales usadas en la API manual
import { syncProxmoxBasic } from 'src/lib/syncProxmox/syncMain'
import { syncK8sBasic } from 'src/lib/syncK8s/syncMain'

const CRON_PROXMOX = process.env.CRON_PROXMOX
const CRON_K8S = process.env.CRON_K8S

let isRunningProxmox = false
let isRunningK8s = false

export const startScheduler = () => {

  /* ============================================================
     PROXMOX - cada 23 horas
  ============================================================ */
  cron.schedule(CRON_PROXMOX, async () => {
    if (isRunningProxmox) {
      console.warn('[Cron-Proxmox] Ya en ejecución, se omite.')
      return
    }

    isRunningProxmox = true
    console.log('[Cron-Proxmox] Iniciando sincronización automática...')

    try {
      // Consulta real
      const endpoints = await db.proxmoxEndpoint.findMany({
        where: { estado: 'ACTIVO' },
      })

      if (endpoints.length === 0) {
        console.warn('[Cron-Proxmox] No hay endpoints Proxmox activos.')
      }

      for (const ep of endpoints) {
        try {
          console.log(`[Cron-Proxmox] Sync de ${ep.nombre} (${ep.id})`)
          await syncProxmoxBasic(ep.id)
        } catch (err) {
          console.error(`[Cron-Proxmox] Error en ${ep.nombre}:`, err.message)
        }
      }

    } catch (err) {
      console.error('[Cron-Proxmox] Error global:', err)
    }

    isRunningProxmox = false
    console.log('[Cron-Proxmox] Finalizado.')
  })

  /* ============================================================
     K8S - cada 24 horas
  ============================================================ */
  cron.schedule(CRON_K8S, async () => {
    if (isRunningK8s) {
      console.warn('[Cron-K8s] Ya en ejecución, se omite.')
      return
    }

    isRunningK8s = true
    console.log('[Cron-K8s] Iniciando sincronización automática...')

    try {
      // Consulta real
      const endpoints = await db.k8sEndpoint.findMany({
        where: { estado: 'ACTIVO' },
      })

      if (endpoints.length === 0) {
        console.warn('[Cron-K8s] No hay endpoints K8s activos.')
      }

      for (const ep of endpoints) {
        try {
          console.log(`[Cron-K8s] Sync cluster ${ep.nombre} (${ep.id})`)
          await syncK8sBasic(ep.id)
        } catch (err) {
          console.error(`[Cron-K8s] Error en ${ep.nombre}:`, err.message)
        }
      }

    } catch (err) {
      console.error('[Cron-K8s] Error global:', err)
    }

    isRunningK8s = false
    console.log('[Cron-K8s] Finalizado.')
  })

  console.log('[Scheduler] Cronjobs iniciados correctamente.')
}
