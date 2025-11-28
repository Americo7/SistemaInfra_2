import { db } from 'src/lib/db'

// --- CONSTANTES Y UTILIDADES ---
const GB = 1024 * 1024 * 1024
const MB = 1024 * 1024

// --- FUNCIONES DE PERSISTENCIA ---

/**
 * Asegura que exista un DataCenter por defecto para asignar servidores nuevos
 */
export const obtenerDataCenterDefault = async () => {
  let dc = await db.dataCenter.findFirst()
  if (!dc) {
    dc = await db.dataCenter.create({
      data: {
        nombre: 'DC Principal (Auto)',
        ubicacion: 'Local',
        estado: 'ACTIVO',
        usuario_creacion: 1, // Usuario sistema
      },
    })
  }
  return dc
}

/**
 * Registra o actualiza el Cluster en la BD
 */
export const procesarCluster = async (endpoint, nombreCluster) => {
  return await db.cluster.upsert({
    where: {
      nombre_id_proxmox_endpoint: {
        nombre: nombreCluster,
        id_proxmox_endpoint: endpoint.id,
      },
    },
    create: {
      nombre: nombreCluster,
      cod_tipo_cluster: 'PROXMOX',
      descripcion: `Cluster sincronizado desde ${endpoint.ip}`,
      estado: 'ACTIVO',
      id_proxmox_endpoint: endpoint.id,
      usuario_creacion: 1,
    },
    update: { fecha_modificacion: new Date() },
  })
}

/**
 * Procesa un Nodo físico de Proxmox y lo convierte en 'Servidor' y 'ClusterNodo'
 */
export const procesarNodo = async (nodoRaw, dcId, clusterId, ipEndpoint) => {
  // 1. Lógica de conversión de unidades
  const ramGB = Math.round((nodoRaw.maxmem || 0) / GB)
  const diskGB = Math.round((nodoRaw.maxdisk || 0) / GB)

  // 2. Buscar o Crear el Servidor (Hierro)
  // Usamos upsert "manual" porque no tenemos ID único global hardware confiable en la API simple
  let servidor = await db.servidor.findFirst({
    where: { nombre: nodoRaw.node, id_data_center: dcId },
  })

  const datosServidor = {
    ram: ramGB,
    almacenamiento: diskGB,
    estado_operativo: nodoRaw.status === 'online' ? 'OPERATIVO' : 'INACTIVO',
    sistema_operativo: 'Proxmox VE',
    ip_primaria: ipEndpoint, // Asumimos IP del endpoint si no hay más info
  }

  if (servidor) {
    servidor = await db.servidor.update({
      where: { id: servidor.id },
      data: { ...datosServidor, fecha_modificacion: new Date() },
    })
  } else {
    servidor = await db.servidor.create({
      data: {
        ...datosServidor,
        nombre: nodoRaw.node,
        id_data_center: dcId,
        // Defaults obligatorios de tu schema
        cod_inventario_agetic: 'PENDIENTE',
        cod_tipo_servidor: 'RACK',
        serie: 'S/N',
        marca: 'GENERICO',
        modelo: 'PROXMOX NODE',
        estado: 'ACTIVO',
        usuario_creacion: 1,
      },
    })
  }

  // 3. Vincularlo al Cluster (ClusterNodo)
  const k8sUid = `PVE-${clusterId}-${nodoRaw.node}`
  await db.clusterNodo.upsert({
    where: { k8s_uid: k8sUid },
    create: {
      clusterId: clusterId,
      nombre: nodoRaw.node,
      nodoTipo: 'FISICO',
      servidorId: servidor.id,
      rol: 'WORKER',
      estado: 'ACTIVO',
      k8s_uid: k8sUid,
      usuario_creacion: 1,
    },
    update: {
      servidorId: servidor.id,
      fecha_modificacion: new Date(),
    },
  })

  return servidor
}

/**
 * Procesa una lista de VMs y las inserta en la BD vinculadas al servidor
 */
export const procesarVMs = async (vmsRaw, servidorId, clusterId) => {
  const resultados = []
  
  for (const vm of vmsRaw) {
    const uniqueUuid = `PVE-${clusterId}-VM-${vm.vmid}`
    const ramMB = Math.round((vm.maxmem || 0) / MB)
    const diskTotalGB = Math.round((vm.maxdisk || 0) / GB)
    
    // Heurística simple para SO
    let so = 'Desconocido'
    if (vm.template) so = 'Template'
    else if (vm.status === 'running') so = 'Linux/Windows (Detectado)'

    const maquina = await db.maquina.upsert({
      where: { uuid: uniqueUuid },
      create: {
        nombre: vm.name || `VM-${vm.vmid}`,
        uuid: uniqueUuid,
        proxmox_vmid: vm.vmid,
        ram: ramMB,
        cpu: vm.maxcpu || 1,
        almacenamiento: { total_gb: diskTotalGB, type: 'virtual_disk' }, // Tu campo JSON
        so: so,
        cod_plataforma: 'x86_64',
        estado: 'ACTIVO',
        id_servidor: servidorId,
        usuario_creacion: 1,
      },
      update: {
        nombre: vm.name,
        ram: ramMB,
        cpu: vm.maxcpu,
        id_servidor: servidorId, // Importante si migró de nodo
        almacenamiento: { total_gb: diskTotalGB, type: 'virtual_disk' },
        fecha_modificacion: new Date(),
      },
    })
    resultados.push(maquina)
  }
  return resultados
}

export const actualizarTimestampEndpoint = async (endpointId) => {
  return await db.proxmoxEndpoint.update({
    where: { id: endpointId },
    data: { fecha_ultima_sync: new Date() },
  })
}