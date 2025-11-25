import { db } from 'src/lib/db'

export const clusterNodos = () => {
  return db.clusterNodo.findMany({
    include: {
      cluster: true,
      maquina: true,
      servidor: true,
    },
  })
}

export const clusterNodo = ({ id }) => {
  return db.clusterNodo.findUnique({
    where: { id },
    include: {
      cluster: true,
      maquina: true,
      // Aquí está la clave: Nesting (anidamiento)
      servidor: {
        include: {
          maquinas: true, // Esto carga las VMs del servidor
        },
      },
    },
  })
}

export const createClusterNodo = ({ input }) => {
  return db.clusterNodo.create({
    data: {
      clusterId: input.clusterId,
      nombre: input.nombre,
      nodoTipo: input.nodoTipo,
      maquinaId: input.maquinaId,
      servidorId: input.servidorId,
      rol: input.rol,
      estado: input.estado,
      k8s_uid: input.k8s_uid,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
      // fecha_modificacion y usuario_modificacion son nulos al crear
    },
  })
}

export const updateClusterNodo = ({ id, input }) => {
  return db.clusterNodo.update({
    data: {
      clusterId: input.clusterId,
      nombre: input.nombre,
      nodoTipo: input.nodoTipo,
      maquinaId: input.maquinaId,
      servidorId: input.servidorId,
      rol: input.rol,
      estado: input.estado,
      k8s_uid: input.k8s_uid,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteClusterNodo = ({ id }) => {
  return db.clusterNodo.delete({
    where: { id },
  })
}

export const ClusterNodo = {
  cluster: (_obj, { root }) => {
    return db.clusterNodo.findUnique({ where: { id: root?.id } }).cluster()
  },
  maquina: (_obj, { root }) => {
    return db.clusterNodo.findUnique({ where: { id: root?.id } }).maquina()
  },
  servidor: (_obj, { root }) => {
    return db.clusterNodo.findUnique({ where: { id: root?.id } }).servidor()
  },
}