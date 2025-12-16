import { db } from 'src/lib/db'
import { valkey } from 'src/lib/valkey'
import {
  fetchNodes,
  fetchVMs,
  fetchVMConfig,
  fetchVMOSInfo,
  fetchVMNetwork,
} from '../proxmox/fetch'
import { getProxmoxClient } from '../proxmox/client'
import { syncCluster } from './syncCluster'
import { syncServidor } from './syncServidor'
import { syncClusterNodo } from './syncClusterNodo'
import { syncMaquina } from './syncMaquina'
import { startSyncLog, finishSyncLog } from 'src/lib/syncLogger'

export const verifyProxmoxConnection = async (endpointId) => {
    const client = await getProxmoxClient(endpointId)
  
    try {
      const { data } = await client.get('/version')
  
      return {
        ok: true,
        mensaje: `Conectado: Proxmox v${data.data.version}`,
        totalNodos: 0,
        totalVMs: 0,
      }
    } catch (e) {
      throw new Error(`Fallo de conexión: ${e.message}`)
    }
}

// CORRECCIÓN: Agregamos 'usuarioIdExplicit' como tercer parámetro
export const syncProxmoxBasic = async (endpointId, trigger = 'MANUAL', usuarioIdExplicit) => {
  const lockKey = `px:sync:lock:${endpointId}`
  const acquired = await valkey.set(lockKey, 'LOCKED', 'EX', 60, 'NX')

  if (!acquired) {
    throw new Error(`Sincronización ya está en ejecución para endpoint ${endpointId}`)
  }

  const startTime = new Date()
  
  // CORRECCIÓN: Pasamos el ID explícito al logger
  const logId = await startSyncLog({
    tipo: 'PROXMOX',
    endpointId,
    trigger,
    usuarioIdExplicit // <--- AQUÍ SE ENVÍA EL USUARIO
  })

  try {
    const endpoint = await db.proxmoxEndpoint.findUnique({
      where: { id: endpointId },
    })

    if (!endpoint) throw new Error(`Endpoint Proxmox ${endpointId} no existe`)

    const cluster = await syncCluster(endpoint)
    const nodos = await fetchNodes(endpointId)

    let totalNodosDetectados = nodos.length
    let totalNodosInsertados = 0
    let totalNodosActualizados = 0

    let totalVMsDetectadas = 0
    let totalVMsInsertadas = 0
    let totalVMsActualizadas = 0

    for (const nodo of nodos) {
      // 1) Servidor físico
      const { servidor, inserted: insertedServidor } =
        await syncServidor(endpointId, nodo)

      if (insertedServidor) totalNodosInsertados++
      else totalNodosActualizados++

      // 2) Nodo del cluster
      await syncClusterNodo(endpointId, cluster.id, servidor, nodo)

      // 3) Listar VMs
      const listaVMs = await fetchVMs(endpointId, nodo.node)
      totalVMsDetectadas += listaVMs.length

      // 4) Procesar VMs
      for (const vm of listaVMs) {
        try {
          const raw = (vm.qmpstatus || vm.status || '').toLowerCase()
          const vmStatus = raw.includes('running') ? 'running' : raw

          let config = {}
          try { config = await fetchVMConfig(endpointId, nodo.node, vm.vmid) } catch {}

          let osinfo = null
          let net = null

          if (vmStatus === 'running') {
            try { osinfo = await fetchVMOSInfo(endpointId, nodo.node, vm.vmid) } catch {}
            try { net = await fetchVMNetwork(endpointId, nodo.node, vm.vmid) } catch {}
          }

          const { inserted: insertedVM } = await syncMaquina(
            endpointId,
            nodo,
            { vm: { ...vm, status: vmStatus }, config, osinfo, net },
            servidor
          )

          if (insertedVM) totalVMsInsertadas++
          else totalVMsActualizadas++
        } catch (err) {
          console.error(`Error crítico procesando VM ${vm.vmid}:`, err.message)
          continue
        }
      }
    }

    await db.proxmoxEndpoint.update({
      where: { id: endpointId },
      data: { fecha_ultima_sync: new Date() },
    })

    const result = {
      ok: true,
      totalNodosDetectados,
      totalNodosInsertados,
      totalNodosActualizados,
      totalVMsDetectadas,
      totalVMsInsertadas,
      totalVMsActualizadas,
    }

    // 4. FINALIZAR LOG
    await finishSyncLog({
      logId,
      success: true,
      startObj: startTime,
      metrics: {
        total_clusters: 1,
        total_servidores: totalNodosDetectados, 
        total_nodos: totalNodosDetectados, 
        total_maquinas: totalVMsDetectadas,
        snapshot: result
      }
    })

    return result

  } catch (error) {
    console.error('[Proxmox] Error Sync:', error)

    await finishSyncLog({
      logId,
      success: false,
      error: error,
      startObj: startTime
    })

    throw new Error(error.message) 
  } finally {
    await valkey.del(lockKey)
  }
}