import { db } from 'src/lib/db'

/* ============================================
   Identity Key seguro
============================================ */
const generarNodoIdentityKey = (input, cluster) => {
  const clusterName = cluster.nombre.trim().toLowerCase().replace(/\s+/g, '-')
  const nodoName = input.nombre.trim().toLowerCase().replace(/\s+/g, '-')

  if (cluster.id_proxmox_endpoint) {
    return `proxmox-node:${cluster.id_proxmox_endpoint}:${clusterName}:${nodoName}`
  }

  if (cluster.id_k8s_endpoint) {
    return `k8s-node:${cluster.id_k8s_endpoint}:${clusterName}:${nodoName}`
  }

  return `node:manual:${clusterName}:${nodoName}`
}

/* ============================================
   LISTA
============================================ */
export const clusterNodos = () => {
  return db.clusterNodo.findMany({
    include: {
      cluster: true,
      maquina: true,
      servidor: true,
    },
  })
}

/* ============================================
   DETALLE
============================================ */
export const clusterNodo = ({ id }) => {
  return db.clusterNodo.findUnique({
    where: { id },
    include: {
      cluster: true,
      maquina: true,
      servidor: {
        include: { maquinas: true },
      },
    },
  })
}

/* ============================================
   CREAR
============================================ */
export const createClusterNodo = async ({ input }) => {
  const cluster = await db.cluster.findUnique({
    where: { id: input.clusterId },
  })

  const identity_key = generarNodoIdentityKey(input, cluster)

  return db.clusterNodo.create({
    data: {
      clusterId: input.clusterId,
      nombre: input.nombre,
      nodoTipo: input.nodoTipo,
      maquinaId: input.maquinaId,
      servidorId: input.servidorId,
      rol: input.rol,
      estado: input.estado,
      identity_key,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

/* ============================================
   ACTUALIZAR
============================================ */
export const updateClusterNodo = async ({ id, input }) => {
  const cluster = await db.cluster.findUnique({
    where: { id: input.clusterId },
  })

  const identity_key = generarNodoIdentityKey(input, cluster)

  return db.clusterNodo.update({
    where: { id },
    data: {
      clusterId: input.clusterId,
      nombre: input.nombre,
      nodoTipo: input.nodoTipo,
      maquinaId: input.maquinaId,
      servidorId: input.servidorId,
      rol: input.rol,
      estado: input.estado,
      identity_key,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
  })
}

/* ============================================
   ELIMINAR
============================================ */
export const deleteClusterNodo = ({ id }) => {
  return db.clusterNodo.delete({
    where: { id },
  })
}

/* ============================================
   RELACIONADOR
============================================ */
export const ClusterNodo = {
  cluster: (_obj, { root }) =>
    db.clusterNodo.findUnique({ where: { id: root.id } }).cluster(),

  maquina: (_obj, { root }) =>
    db.clusterNodo.findUnique({ where: { id: root.id } }).maquina(),

  servidor: (_obj, { root }) =>
    db.clusterNodo.findUnique({ where: { id: root.id } }).servidor(),
}
