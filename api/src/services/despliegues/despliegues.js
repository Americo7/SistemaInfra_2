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
      fecha_despliegue: new Date(),
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: 1,
      fecha_solicitud: input.fecha_solicitud,
      unidad_solicitante: input.unidad_solicitante,
      solicitante: input.solicitante,
      cod_tipo_respaldo: input.cod_tipo_respaldo,
      referencia_respaldo: input.referencia_respaldo,
      estado_despliegue: input.estado_despliegue,
    },
  })
}

export const updateDespliegue = ({ id, input }) => {
  return db.despliegue.update({
    data: {
      id_componente: input.id_componente,
      id_maquina: input.id_maquina,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: 1,
      fecha_solicitud: input.fecha_solicitud,
      unidad_solicitante: input.unidad_solicitante,
      solicitante: input.solicitante,
      cod_tipo_respaldo: input.cod_tipo_respaldo,
      referencia_respaldo: input.referencia_respaldo,
      estado_despliegue: input.estado_despliegue,
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
  despliegue_bitacora: (_obj, { root }) => {
    return db.despliegue
      .findUnique({ where: { id: root?.id } })
      .despliegue_bitacora()
  },
}
