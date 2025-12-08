import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const infraAfectadas = () => {
  return db.infraAfectada.findMany({
    orderBy: { id: 'desc' },
  })
}

export const infraAfectada = ({ id }) => {
  return db.infraAfectada.findUnique({
    where: { id },
  })
}

export const createInfraAfectada = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.infraAfectada.create({
    data: {
      id_evento: input.id_evento,
      id_data_center: input.id_data_center,
      id_servidor: input.id_servidor,
      id_maquina: input.id_maquina,
      estado: input.estado,
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
    },
  })
}

export const updateInfraAfectada = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.infraAfectada.update({
    data: {
      id_evento: input.id_evento,
      id_data_center: input.id_data_center,
      id_servidor: input.id_servidor,
      id_maquina: input.id_maquina,
      estado: input.estado,
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),
    },
    where: { id },
  })
}

export const deleteInfraAfectada = ({ id }) => {
  return db.infraAfectada.delete({
    where: { id },
  })
}

export const InfraAfectada = {
  data_centers: (_obj, { root }) => {
    return db.infraAfectada
      .findUnique({ where: { id: root?.id } })
      .data_centers()
  },
  eventos: (_obj, { root }) => {
    return db.infraAfectada.findUnique({ where: { id: root?.id } }).eventos()
  },
  maquinas: (_obj, { root }) => {
    return db.infraAfectada.findUnique({ where: { id: root?.id } }).maquinas()
  },
  servidores: (_obj, { root }) => {
    return db.infraAfectada.findUnique({ where: { id: root?.id } }).servidores()
  },

  creadoPor: (_obj, { root }) => {
    if (!root.usuario_creacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_creacion } })
  },

  modificadoPor: (_obj, { root }) => {
    if (!root.usuario_modificacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_modificacion } })
  },
}

/* ============================================================
   QUERY RESOLVERS (Permitir que GraphQL acceda a las queries)
============================================================ */
export const Query = {
  infraAfectadas,
  infraAfectada,
}
