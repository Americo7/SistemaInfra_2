import { db } from 'src/lib/db'

export const clusters = () => {
  return db.cluster.findMany()
}

export const cluster = ({ id }) => {
  return db.cluster.findUnique({
    where: { id },
  })
}

export const createCluster = ({ input }) => {
  return db.cluster.create({
    data: {
      nombre: input.nombre,
      cod_tipo_cluster: input.cod_tipo_cluster,
      descripcion: input.descripcion,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateCluster = ({ id, input }) => {
  return db.cluster.update({
    data: {
      nombre: input.nombre,
      cod_tipo_cluster: input.cod_tipo_cluster,
      descripcion: input.descripcion,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteCluster = ({ id }) => {
  return db.cluster.delete({
    where: { id },
  })
}

export const Cluster = {
  asignacion_servidor_maquina: (_obj, { root }) => {
    return db.cluster
      .findUnique({ where: { id: root?.id } })
      .asignacion_servidor_maquina()
  },
}
