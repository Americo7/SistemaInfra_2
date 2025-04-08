import { db } from 'src/lib/db'

export const eventos = () => {
  return db.evento.findMany()
}

export const evento = ({ id }) => {
  return db.evento.findUnique({
    where: { id },
  })
}

export const createEvento = ({ input }) => {
  const respaldoData = {
    servicios_afectados: input.servicios_afectados,
    comentarios: input.comentarios,
  }
  return db.evento.create({
    data: {
      cod_tipo_evento: input.cod_tipo_evento,
      descripcion: input.descripcion,
      fecha_evento: input.fecha_evento,
      responsables: input.responsables,
      estado_evento: input.estado_evento,
      respaldo: respaldoData,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateEvento = ({ id, input }) => {
  const respaldoData = {
    servicios_afectados: input.servicios_afectados,
    comentarios: input.comentarios,
  }
  return db.evento.update({
    data: {
      cod_tipo_evento: input.cod_tipo_evento,
      descripcion: input.descripcion,
      fecha_evento: input.fecha_evento,
      responsables: input.responsables,
      estado_evento: input.estado_evento,
      respaldo: respaldoData,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteEvento = ({ id }) => {
  return db.evento.delete({
    where: { id },
  })
}

export const Evento = {
  eventos_bitacora: (_obj, { root }) => {
    return db.evento.findUnique({ where: { id: root?.id } }).eventos_bitacora()
  },
  infra_afectada: (_obj, { root }) => {
    return db.evento.findUnique({ where: { id: root?.id } }).infra_afectada()
  },
}
