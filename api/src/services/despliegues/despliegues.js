import { db } from 'src/lib/db'

export const despliegues = () => {
  return db.despliegue.findMany()
}

export const despliegue = ({ id }) => {
  return db.despliegue.findUnique({
    where: { id },
  })
}

export const createDespliegue = ({ input }) => {
  return db.despliegue.create({
    data: {
      id_componente: input.id_componente,
      id_maquina: input.id_maquina,
      cod_tipo_despliegue: input.cod_tipo_despliegue,
      es_cluster: input.es_cluster,
      nombre_cluster: input.nombre_cluster,
      fecha_despliegue: new Date(),
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateDespliegue = ({ id, input }) => {
  return db.despliegue.update({
    data: {
      id_componente: input.id_componente,
      id_maquina: input.id_maquina,
      cod_tipo_despliegue: input.cod_tipo_despliegue,
      es_cluster: input.es_cluster,
      nombre_cluster: input.nombre_cluster,
      fecha_despliegue: new Date(),
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteDespliegue = ({ id }) => {
  return db.despliegue.delete({
    where: { id },
  })
}

export const Despliegue = {
  componentes: (_obj, { root }) => {
    return db.despliegue.findUnique({ where: { id: root?.id } }).componentes()
  },
  maquinas: (_obj, { root }) => {
    return db.despliegue.findUnique({ where: { id: root?.id } }).maquinas()
  },
}
