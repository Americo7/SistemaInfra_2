// src/lib/syncLogger.js
import { db } from 'src/lib/db'
// 1. Importamos 'context' para leer la sesión actual (si existe)
import { context } from '@redwoodjs/graphql-server'

/**
 * Crea el registro inicial.
 * Determina el usuario automáticamente según el trigger.
 */
export const startSyncLog = async ({ tipo, endpointId, trigger }) => {
  try {
    // === LÓGICA DE USUARIO CENTRALIZADA ===
    let usuarioId = 1 // Por defecto: 1 (System)

    // Solo si es MANUAL intentamos buscar al usuario real en el contexto
    if (trigger === 'MANUAL') {
      // context.currentUser se llena automáticamente si el frontend envió el token
      if (context.currentUser?.id) {
        usuarioId = context.currentUser.id
      } else {
        console.warn('Sync manual detectada, pero no se encontró usuario en sesión. Usando ID 1.')
      }
    } 
    // Si es CRON, ignoramos el contexto y dejamos el 1.

    const data = {
      tipo_endpoint: tipo, // 'PROXMOX' | 'K8S'
      estado_sync: 'INICIADO',
      trigger: trigger || 'MANUAL',
      fecha_inicio: new Date(),
      usuario_creacion: usuarioId, // <--- Aquí va el ID decidido
      estado: 'ACTIVO'
    }

    // Asignación dinámica del ID foráneo según el tipo
    if (tipo === 'PROXMOX') data.id_proxmox_endpoint = endpointId
    if (tipo === 'K8S') data.id_k8s_endpoint = endpointId

    const log = await db.endpointSyncLog.create({ data })
    return log.id
  } catch (error) {
    console.error('Error creando log de sync:', error)
    return null 
  }
}

/**
 * Actualiza el registro con el resultado final.
 */
export const finishSyncLog = async ({ logId, success, error, metrics = {}, startObj }) => {
  if (!logId) return

  const fechaFin = new Date()
  const duration = startObj ? (fechaFin - startObj).toFixed(0) : 0

  const updateData = {
    fecha_fin: fechaFin,
    duracion_ms: parseInt(duration),
    estado_sync: success ? 'EXITOSO' : 'ERROR',
    // Opcional: Si quisieras registrar quién lo terminó (usualmente el mismo que lo inició)
    // usuario_modificacion: context.currentUser?.id || 1 
  }

  if (success) {
    updateData.mensaje = 'Sincronización completada correctamente'
    updateData.total_clusters = metrics.total_clusters || 0
    updateData.total_servidores = metrics.total_servidores || 0
    updateData.total_maquinas = metrics.total_maquinas || 0
    updateData.total_nodos = metrics.total_nodos || 0
    updateData.snapshot_resultado = metrics.snapshot || {}
  } else {
    updateData.mensaje = 'Error durante la sincronización'
    updateData.error_detalle = error?.message || String(error)
  }

  try {
    await db.endpointSyncLog.update({
      where: { id: logId },
      data: updateData
    })
  } catch (err) {
    console.error('Error finalizando log de sync:', err)
  }
}