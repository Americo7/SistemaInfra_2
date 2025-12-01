// lib/syncProxmox/syncMaquina.js
import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server' // <--- ESTO ES PARA EL BACKEND

const MAPA_SO_PROXMOX = {
  l26: 'Linux Kernel 2.6 - 6.x',
  l24: 'Linux Kernel 2.4',
  win11: 'Windows 11 / Server 2022',
  win10: 'Windows 10 / Server 2016/2019',
  win8: 'Windows 8 / Server 2012',
  win7: 'Windows 7 / Server 2008 R2',
  wxp: 'Windows XP / Server 2003',
  solaris: 'Solaris',
  other: 'Otro',
}

/* ============================================
   MAPEO PROXMOX → PARAMETRICAS
============================================ */
function mapEstadoOperativo(s) {
  s = (s || '').toLowerCase()
  if (s === 'running') return 'OPERATIVO'
  if (['stopped', 'shutdown', 'offline', 'paused', 'stopping'].includes(s)) return 'FUERA_SERVICIO'
  return 'FUERA_SERVICIO'
}

/* ============================================
   HELPERS (SMBIOS, IP, SO, Discos)
============================================ */
function obtenerSMBIOSUUID(config) {
  if (!config?.smbios1) return null
  const m = config.smbios1.match(/uuid=([0-9a-fA-F-]+)/i)
  return m ? m[1].toLowerCase() : null
}

function obtenerIP(vmStatus, net, config) {
  if (vmStatus === 'running' && Array.isArray(net)) {
    for (const iface of net) {
      if (!iface['ip-addresses']) continue
      for (const ip of iface['ip-addresses']) {
        const v = ip['ip-address']
        if (v && v.includes('.') && v !== '127.0.0.1') return v
      }
    }
  }
  for (const k of Object.keys(config || {})) {
    if (k.startsWith('ipconfig')) {
      const m = config[k].match(/ip=([\d.]+)/)
      if (m) return m[1]
    }
  }
  return null
}

function obtenerSO(vmStatus, osinfo, config) {
  if (vmStatus === 'running' && osinfo) {
    if (osinfo['pretty-name']) return osinfo['pretty-name']
    const name = osinfo.name || ''
    const version = osinfo.version || osinfo['version-id'] || ''
    const txt = `${name} ${version}`.trim()
    if (txt) return txt
  }
  return MAPA_SO_PROXMOX[config?.ostype] || null
}

function obtenerDiscos(config) {
  const out = []
  for (const [k, v] of Object.entries(config || {})) {
    const m = k.match(/(scsi|sata|virtio)(\d+)/i)
    if (!m) continue
    let size = null
    const sm = v.match(/size=(\d+)([GMK])/i)
    if (sm) {
      size = parseInt(sm[1])
      const u = sm[2].toUpperCase()
      if (u === 'M') size = Math.round(size / 1024)
      if (u === 'K') size = Math.round(size / (1024 * 1024))
    }
    out.push({ Disco: parseInt(m[2]) + 1, Valor: size })
  }
  return out
}

/* ============================================
   SYNC MAQUINA
============================================ */
export const syncMaquina = async (endpointId, nodo, vmExtendida, servidor) => {

  const userId = context.currentUser?.id || 1 

  const { vm, config, osinfo, net } = vmExtendida

  const estadoOperativo = mapEstadoOperativo(vm.status)
  const smbiosUUID = obtenerSMBIOSUUID(config)
  const identityKey = smbiosUUID ? `proxmox:${smbiosUUID}` : null

  // Búsqueda de existente
  let existente = identityKey
    ? await db.maquina.findUnique({ where: { identity_key: identityKey } })
    : null

  if (!existente) {
    existente = await db.maquina.findFirst({
      where: { proxmox_vmid: vm.vmid, id_servidor: servidor.id },
    })
  }

  // Cálculos de Hardware (Corrección RAM/CPU)
  let ramGB = 1
  if (vm.maxmem) ramGB = Math.round(vm.maxmem / (1024 ** 3))
  else if (config && config.memory) ramGB = Math.round(config.memory / 1024)
  if (ramGB < 1) ramGB = 1

  /* ============================================
     CPU — VERSIÓN CORREGIDA Y COMPLETA
     Prioridad:
       1) vm.cpus (cluster/resources)
       2) cores * sockets (QEMU config)
       3) cores (si no hay sockets)
       4) fallback = 1
  ============================================ */
  const cpuCount =
    vm.cpus ||
    (config?.cores && config?.sockets
      ? Number(config.cores) * Number(config.sockets)
      : (config?.cores ? Number(config.cores) : 1))

  const ip = obtenerIP(vm.status, net, config)
  const so = obtenerSO(vm.status, osinfo, config)
  const discos = obtenerDiscos(config)

  const baseData = {
    identity_key: identityKey,
    nombre: vm.name || `vm-${vm.vmid}`,
    proxmox_vmid: vm.vmid,
    ip: ip || existente?.ip || null,
    so: so || existente?.so || null,
    cod_plataforma: 'PX',
    estado_operativo: estadoOperativo,
    ram: ramGB,
    cpu: cpuCount,
    almacenamiento: discos,
    fecha_modificacion: new Date(),
  }

  // CASO 1: Migración
  if (existente && existente.id_servidor !== servidor.id) {
    return {
      maquina: await db.maquina.update({
        where: { id: existente.id },
        data: { ...baseData, id_servidor: servidor.id },
      }),
      inserted: false,
    }
  }

  // CASO 2: Update
  if (existente) {
    return {
      maquina: await db.maquina.update({
        where: { id: existente.id },
        data: { ...baseData, id_servidor: servidor.id },
      }),
      inserted: false,
    }
  }

  // CASO 3: Create
  return {
    maquina: await db.maquina.create({
      data: {
        ...baseData,
        id_servidor: servidor.id,
        estado: 'ACTIVO',
        usuario_creacion: userId,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
      },
    }),
    inserted: true,
  }
}
