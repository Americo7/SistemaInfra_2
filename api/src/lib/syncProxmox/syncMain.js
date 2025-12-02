// src/lib/syncProxmox/syncMain.js
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

/* ============================================================
   1) VERIFICAR COMUNICACIÓN
============================================================ */
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

/* ============================================================
   2) SINCRONIZACIÓN COMPLETA
============================================================ */
export const syncProxmoxBasic = async (endpointId) => {
  /* -----------------------------------
     A) LOCK VALKEY (evita ejecuciones paralelas)
     TTL: 60 segundos (si el proceso muere, el lock expira solo)
  ----------------------------------- */
  const lockKey = `px:sync:lock:${endpointId}`
  
  // 'NX': Solo setear si No eXiste (Atomicidad)
  // 'EX': Expiración en segundos
  const acquired = await valkey.set(lockKey, 'LOCKED', 'EX', 60, 'NX')

  if (!acquired) {
    // Si retorna null, significa que la llave ya existe
    throw new Error(`Sincronización ya está en ejecución para endpoint ${endpointId}`)
  }

  try {
    /* -----------------------------------
       B) Validar endpoint existente
    ----------------------------------- */
    const endpoint = await db.proxmoxEndpoint.findUnique({
      where: { id: endpointId },
    })

    if (!endpoint) {
      throw new Error(`Endpoint Proxmox ${endpointId} no existe`)
    }

    /* -----------------------------------
       C) Crear/actualizar CLUSTER
    ----------------------------------- */
    const cluster = await syncCluster(endpoint)

    /* -----------------------------------
       D) Obtener nodos (físicos) del cluster
    ----------------------------------- */
    const nodos = await fetchNodes(endpointId)

    let totalNodosDetectados = nodos.length
    let totalNodosInsertados = 0
    let totalNodosActualizados = 0

    let totalVMsDetectadas = 0
    let totalVMsInsertadas = 0
    let totalVMsActualizadas = 0

    /* -----------------------------------
       E) Procesar NODOS uno por uno
    ----------------------------------- */
    for (const nodo of nodos) {
      // 1) Servidor físico
      const { servidor, inserted: insertedServidor } =
        await syncServidor(endpointId, nodo)

      if (insertedServidor) totalNodosInsertados++
      else totalNodosActualizados++

      // 2) Nodo del cluster (cluster_nodos)
      await syncClusterNodo(endpointId, cluster.id, servidor, nodo)

      // 3) Listar VMs sobre este nodo
      const listaVMs = await fetchVMs(endpointId, nodo.node)
      totalVMsDetectadas += listaVMs.length

      // 4) Procesar cada VM
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

    /* -----------------------------------
       F) actualizar fecha de sync
    ----------------------------------- */
    await db.proxmoxEndpoint.update({
      where: { id: endpointId },
      data: {
        fecha_ultima_sync: new Date(),
      },
    })

    /* -----------------------------------
       G) resumen final
    ----------------------------------- */
    return {
      ok: true,

      totalNodosDetectados,
      totalNodosInsertados,
      totalNodosActualizados,

      totalVMsDetectadas,
      totalVMsInsertadas,
      totalVMsActualizadas,
    }
  } finally {
    // 🟢 Liberar el Lock en Valkey siempre (finally)
    await valkey.del(lockKey)
  }
}