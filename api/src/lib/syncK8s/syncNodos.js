import { db } from 'src/lib/db'
import { fetchK8sNodes } from 'src/lib/k8s/fetch'
import { context } from '@redwoodjs/graphql-server' // <--- NECESARIO

// Helper: Convertir RAM → GB
const parseMemoryToGb = (memString) => {
  if (!memString) return 0
  try {
    const s = memString.toString().trim()
    if (s.endsWith('Ki')) return Math.ceil(parseInt(s.slice(0, -2)) / 1024 / 1024)
    if (s.endsWith('Mi')) return Math.ceil(parseInt(s.slice(0, -2)) / 1024)
    if (s.endsWith('Gi')) return Math.ceil(parseInt(s.slice(0, -2)))
    return Math.ceil(parseInt(s) / 1024 / 1024 / 1024)
  } catch { return 0 }
}

// NUEVO: Helper almacenamiento → GB (ephemeral-storage)
const parseStorageToGb = (value) => {
  if (!value) return 0
  try {
    const s = value.toString().trim()
    if (s.endsWith('Ki')) return Math.ceil(parseInt(s.slice(0, -2)) / 1024 / 1024)
    if (s.endsWith('Mi')) return Math.ceil(parseInt(s.slice(0, -2)) / 1024)
    if (s.endsWith('Gi')) return Math.ceil(parseInt(s.slice(0, -2)))
    return Math.ceil(parseInt(s) / 1024 / 1024 / 1024)
  } catch { return 0 }
}

const parseCpu = (cpuString) => {
  if (!cpuString) return 1
  try {
    const s = cpuString.toString().trim()
    if (s.endsWith('m')) return Math.ceil(parseInt(s.slice(0, -1)) / 1000)
    return Math.ceil(parseInt(s))
  } catch { return 1 }
}

const analizarUUIDFisico = (uuidRaw) => {
  if (!uuidRaw) return null
  const uuid = uuidRaw.replace(/-/g, '').toLowerCase()
  if (uuid.startsWith('ec2') || uuid.startsWith('vmware') || uuid.includes('kvm')) return 'VIRTUAL'
  if (uuid.startsWith('44454c4c') || uuid.startsWith('4c4c4544') || 
      uuid.startsWith('4c454e4f') || uuid.startsWith('4f4e454c') ||
      uuid.startsWith('485057')  || uuid.startsWith('574850'))
      return 'FISICO'
  return null
}

const decideTipoPorPrioridad = async ({ systemUUID, provider, identity_key }) => {
  const maquinaExistente = await db.maquina.findFirst({ where: { identity_key } })
  if (maquinaExistente) return { tipo: 'VIRTUAL', fuente: 'maquina-existente', row: maquinaExistente }

  if (systemUUID) {
    const maquinaPorUUID = await db.maquina.findFirst({ 
      where: { identity_key: { contains: systemUUID } } 
    })
    if (maquinaPorUUID) return { tipo: 'VIRTUAL', fuente: 'maquina-uuid-fallback', row: maquinaPorUUID }
  }

  const servidorExistente = await db.servidor.findFirst({ where: { identity_key } })
  if (servidorExistente) return { tipo: 'FISICO', fuente: 'servidor-existente', row: servidorExistente }

  if (systemUUID) {
    const servidorPorUUID = await db.servidor.findFirst({ 
      where: { identity_key: { contains: systemUUID } } 
    })
    if (servidorPorUUID) return { tipo: 'FISICO', fuente: 'servidor-uuid-fallback', row: servidorPorUUID }
  }

  if (provider) {
    const p = provider.toLowerCase()
    if (p.includes('openstack') || p.includes('harvester') || p.includes('proxmox') || p.includes('vm') || p.includes('k3s')) 
      return { tipo: 'VIRTUAL' }
    if (p.includes('baremetal')) return { tipo: 'FISICO' }
  }

  const firma = analizarUUIDFisico(systemUUID)
  if (firma === 'FISICO') return { tipo: 'FISICO' }
  if (firma === 'VIRTUAL') return { tipo: 'VIRTUAL' }

  return { tipo: 'VIRTUAL' }
}

export const syncNodos = async (k8sApi, clusterId) => {
  const userId = context.currentUser?.id || 1

  try {
    const nodos = await fetchK8sNodes(k8sApi)
    const identityKeysEnK8s = []
    const resumen = { procesados: 0, creadasMaquinas: 0, creadosServidores: 0, virtuales: 0, fisicos: 0 }

    for (const node of nodos) {
      resumen.procesados++
      
      const { name, identity_key, systemUUID, provider, roles, estado, addresses, capacity } = node
      identityKeysEnK8s.push(identity_key)

      const internalIP = addresses?.internalIP
      const estadoBD = estado === 'Ready' ? 'OPERATIVO' : 'OFFLINE'

      const decision = await decideTipoPorPrioridad({ systemUUID, provider, identity_key })
      let tipoNodo = decision.tipo
      let maquinaId = null
      let servidorId = null

      if (decision.row) {
        if (decision.fuente.includes('maquina')) maquinaId = decision.row.id
        else if (decision.fuente.includes('servidor')) servidorId = decision.row.id
      }

      if (!maquinaId && !servidorId) {
        if (tipoNodo === 'VIRTUAL') {
          const nueva = await db.maquina.create({
            data: {
              nombre: name,
              ip: internalIP,
              cpu: parseCpu(capacity.cpu),
              ram: parseMemoryToGb(capacity.memory),
              almacenamiento: parseStorageToGb(capacity["ephemeral-storage"]),
              estado: 'ACTIVO',
              estado_operativo: estadoBD,
              identity_key,
              usuario_creacion: userId
            }
          })
          maquinaId = nueva.id
          resumen.creadasMaquinas++
        } else {
          const nuevoServ = await db.servidor.create({
            data: {
              nombre: name,
              ip_primaria: internalIP,
              ram: parseMemoryToGb(capacity.memory),
              almacenamiento: parseStorageToGb(capacity["ephemeral-storage"]),
              estado: 'ACTIVO',
              estado_operativo: estadoBD,
              identity_key,
              usuario_creacion: userId
            }
          })
          servidorId = nuevoServ.id
          resumen.creadosServidores++
        }
      }

      if (tipoNodo === 'VIRTUAL') resumen.virtuales++
      else resumen.fisicos++

      await db.clusterNodo.upsert({
        where: { identity_key },
        create: {
          identity_key,
          clusterId,
          nombre: name,
          nodoTipo: tipoNodo,
          maquinaId,
          servidorId,
          rol: roles.includes('control-plane') || roles.includes('master') ? 'MASTER' : 'WORKER',
          estado: 'ACTIVO',
          usuario_creacion: userId
        },
        update: {
          nodoTipo: tipoNodo,
          maquinaId,
          servidorId,
          rol: roles.includes('control-plane') || roles.includes('master') ? 'MASTER' : 'WORKER',
          estado: 'ACTIVO',
          fecha_modificacion: new Date(),
          usuario_modificacion: userId
        }
      })
    }

    await db.clusterNodo.updateMany({
      where: { clusterId, identity_key: { notIn: identityKeysEnK8s }, estado: 'ACTIVO' },
      data: { estado: 'INACTIVO', fecha_modificacion: new Date() }
    })

    return {
      procesados: resumen.procesados,
      desactivados: 0, 
      desglose: resumen
    }

  } catch (err) {
    console.error('[syncNodos] Error:', err)
    throw err
  }
}
