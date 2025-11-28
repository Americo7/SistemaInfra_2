// lib/syncProxmox/syncMaquina.js
import { db } from 'src/lib/db'

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

  if (['stopped', 'shutdown', 'offline'].includes(s)) return 'APAGADO'

  if (['paused', 'stopping'].includes(s)) return 'FUERA_SERVICIO'

  return 'FUERA_SERVICIO'
}

/* ============================================
   SMBIOS UUID (identidad global VM)
============================================ */
function obtenerSMBIOSUUID(config) {
  if (!config?.smbios1) return null
  const m = config.smbios1.match(/uuid=([0-9a-fA-F-]+)/i)
  return m ? m[1].toLowerCase() : null
}

/* ============================================
   Otros helpers (IP, SO, discos, etc.)
============================================ */
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

    out.push({
      Disco: parseInt(m[2]) + 1,
      Valor: size,
    })
  }
  return out
}

/* ============================================
   SYNC MAQUINA
============================================ */
export const syncMaquina = async (endpointId, nodo, vmExtendida, servidor) => {
  const { vm, config, osinfo, net } = vmExtendida

  const estadoOperativo = mapEstadoOperativo(vm.status)
  const smbiosUUID = obtenerSMBIOSUUID(config)
  const identityKey = smbiosUUID ? `proxmox:${smbiosUUID}` : null

  let existente = identityKey
    ? await db.maquina.findUnique({ where: { identity_key: identityKey } })
    : null

  // Fallback VMID + servidor
  if (!existente) {
    existente = await db.maquina.findFirst({
      where: {
        proxmox_vmid: vm.vmid,
        id_servidor: servidor.id,
      },
    })
  }

  const ip = obtenerIP(vm.status, net, config)
  const so = obtenerSO(vm.status, osinfo, config)
  const discos = obtenerDiscos(config)

  const baseData = {
    identity_key: identityKey,
    nombre: vm.name || `vm-${vm.vmid}`,
    proxmox_vmid: vm.vmid,
    uuid: smbiosUUID || existente?.uuid || null,
    ip: ip || existente?.ip || null,
    so: so || existente?.so || null,
    cod_plataforma: 'PX',
    estado_operativo: estadoOperativo,
    ram: existente?.ram ?? null,
    cpu: existente?.cpu ?? 1,
    almacenamiento: discos,
  }

  // Migración entre servidores
  if (existente && existente.id_servidor !== servidor.id) {
    return {
      maquina: await db.maquina.update({
        where: { id: existente.id },
        data: { ...baseData, id_servidor: servidor.id },
      }),
      inserted: false,
    }
  }

  // UPDATE
  if (existente) {
    return {
      maquina: await db.maquina.update({
        where: { id: existente.id },
        data: { ...baseData, id_servidor: servidor.id },
      }),
      inserted: false,
    }
  }

  // CREATE
  return {
    maquina: await db.maquina.create({
      data: {
        ...baseData,
        id_servidor: servidor.id,
        estado: 'ACTIVO',
        usuario_creacion: 1,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
      },
    }),
    inserted: true,
  }
}
