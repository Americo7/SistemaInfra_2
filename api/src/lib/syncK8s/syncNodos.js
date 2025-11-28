import { db } from 'src/lib/db'
import { fetchK8sNodes } from 'src/lib/k8s/fetch' // Ahora sí usamos tu archivo

/* ============================
   Helpers de Parsing (CPU/RAM)
   ============================ */
const parseMemoryToMb = (memString) => {
  if (!memString) return 0
  try {
    const s = memString.toString().trim()
    if (s.endsWith('Ki')) return Math.ceil(parseInt(s.slice(0, -2)) / 1024)
    if (s.endsWith('Mi')) return Math.ceil(parseInt(s.slice(0, -2)))
    if (s.endsWith('Gi')) return Math.ceil(parseInt(s.slice(0, -2)) * 1024)
    return Math.ceil(parseInt(s) / 1024 / 1024)
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

/* ======================================
   Detector de hardware (Solo lógica física)
   ====================================== */
const analizarUUIDFisico = (uuidRaw) => {
  if (!uuidRaw) return null
  const uuid = uuidRaw.replace(/-/g, '').toLowerCase()
  if (uuid.startsWith('ec2') || uuid.startsWith('vmware') || uuid.includes('kvm')) return 'VIRTUAL'
  // Firmas Físicas
  if (uuid.startsWith('44454c4c') || uuid.startsWith('4c4c4544') || // DELL
      uuid.startsWith('4c454e4f') || uuid.startsWith('4f4e454c') || // LENOVO
      uuid.startsWith('485057') || uuid.startsWith('574850'))      // HP
      return 'FISICO'
  return null
}

/* ===========================================
   Reglas de decisión (Lógica de Negocio)
   =========================================== */
const decideTipoPorPrioridad = async ({ systemUUID, provider, identity_key }) => {
  // 1. Buscar Maquina Proxmox existente (por sufijo UUID)
  if (systemUUID) {
    const proxmoxMatch = await db.maquina.findFirst({ where: { identity_key: { endsWith: systemUUID } } })
    if (proxmoxMatch) return { tipo: 'VIRTUAL', fuente: 'maquina-proxmox', row: proxmoxMatch }
    
    const maquinaExact = await db.maquina.findFirst({ where: { uuid: systemUUID } })
    if (maquinaExact) return { tipo: 'VIRTUAL', fuente: 'maquina-uuid', row: maquinaExact }
  }

  // 2. Buscar Servidor Físico existente
  const servidor = await db.servidor.findFirst({ where: { identity_key } }) // Buscamos por la key completa
  if (servidor) return { tipo: 'FISICO', fuente: 'servidor-existente', row: servidor }

  // 3. Provider Hint (Viene de fetch.js)
  if (provider) {
    const p = provider.toLowerCase()
    if (p.includes('openstack') || p.includes('harvester') || p.includes('proxmox') || p.includes('vm')) return { tipo: 'VIRTUAL' }
    if (p.includes('baremetal')) return { tipo: 'FISICO' }
  }

  // 4. Detector por firma UUID
  const firma = analizarUUIDFisico(systemUUID)
  if (firma === 'FISICO') return { tipo: 'FISICO' }
  if (firma === 'VIRTUAL') return { tipo: 'VIRTUAL' }

  // 5. Default
  return { tipo: 'VIRTUAL' }
}

/* ===========================================
   SYNC NODOS (Lógica principal)
   - k8sApi: Cliente conectado (viene de syncMain)
   =========================================== */
export const syncNodos = async (k8sApi, clusterId) => {
  try {
    // 1. Usamos fetch.js pasándole el cliente directo
    const nodos = await fetchK8sNodes(k8sApi)

    const identityKeysEnK8s = []
    const resumen = { procesados: 0, creadasMaquinas: 0, creadosServidores: 0, virtuales: 0, fisicos: 0 }

    for (const node of nodos) {
      resumen.procesados++
      
      // Datos que vienen limpios desde fetch.js
      const { name, identity_key, systemUUID, provider, roles, estado, addresses, capacity } = node
      identityKeysEnK8s.push(identity_key)

      const internalIP = addresses?.internalIP
      const estadoBD = estado === 'Ready' ? 'OPERATIVO' : 'OFFLINE'

      // 2. Decisión de tipo
      const decision = await decideTipoPorPrioridad({ systemUUID, provider, identity_key })
      let tipoNodo = decision.tipo
      let maquinaId = null
      let servidorId = null

      // Mapear ID si ya existía
      if (decision.row) {
        if (decision.fuente.startsWith('maquina')) maquinaId = decision.row.id
        else if (decision.fuente.startsWith('servidor')) servidorId = decision.row.id
      }

      // 3. Creación si no existe
      if (!maquinaId && !servidorId) {
        if (tipoNodo === 'VIRTUAL') {
          const nueva = await db.maquina.create({
            data: {
              nombre: name,
              uuid: systemUUID || null,
              ip: internalIP,
              cpu: parseCpu(capacity.cpu),
              ram: parseMemoryToMb(capacity.memory),
              estado: 'ACTIVO',
              estado_operativo: estadoBD,
              identity_key, // Key consistente
              usuario_creacion: 1
            }
          })
          maquinaId = nueva.id
          resumen.creadasMaquinas++
        } else {
          const nuevoServ = await db.servidor.create({
            data: {
              nombre: name,
              ip_primaria: internalIP,
              estado: 'ACTIVO',
              estado_operativo: estadoBD,
              identity_key,
              usuario_creacion: 1
            }
          })
          servidorId = nuevoServ.id
          resumen.creadosServidores++
        }
      }

      if (tipoNodo === 'VIRTUAL') resumen.virtuales++
      else resumen.fisicos++

      // 4. Upsert en ClusterNodo
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
          usuario_creacion: 1
        },
        update: {
          nodoTipo: tipoNodo,
          maquinaId,
          servidorId,
          rol: roles.includes('control-plane') || roles.includes('master') ? 'MASTER' : 'WORKER',
          estado: 'ACTIVO',
          fecha_modificacion: new Date()
        }
      })
    }

    // 5. Limpieza
    await db.clusterNodo.updateMany({
      where: { clusterId, identity_key: { notIn: identityKeysEnK8s }, estado: 'ACTIVO' },
      data: { estado: 'INACTIVO', fecha_modificacion: new Date() }
    })

    // 6. Retorno formateado para syncMain
    return {
      procesados: resumen.procesados,
      desactivados: 0, 
      desglose: {
          creadasMaquinas: resumen.creadasMaquinas,
          creadosServidores: resumen.creadosServidores,
          virtuales: resumen.virtuales,
          fisicos: resumen.fisicos
      }
    }

  } catch (err) {
    console.error('[syncNodos] Error:', err)
    throw err
  }
}