import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const dataCenters = () => {
  return db.dataCenter.findMany({
    orderBy: { nombre: 'asc' },
  })
}

export const dataCenter = ({ id }) => {
  return db.dataCenter.findUnique({
    where: { id },
  })
}

export const createDataCenter = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.dataCenter.create({
    data: {
      nombre: input.nombre,
      ubicacion: input.ubicacion,
      estado: input.estado,
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
    },
  })
}

export const updateDataCenter = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.dataCenter.update({
    where: { id },
    data: {
      nombre: input.nombre,
      ubicacion: input.ubicacion,
      estado: input.estado,
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),
    },
  })
}

export const deleteDataCenter = ({ id }) => {
  return db.dataCenter.delete({
    where: { id },
  })
}

export const DataCenter = {
  servidores: (_obj, { root }) => {
    return db.dataCenter.findUnique({ where: { id: root?.id } }).servidores()
  },
  infra_afectada: (_obj, { root }) => {
    return db.dataCenter
      .findUnique({ where: { id: root?.id } })
      .infra_afectada()
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
  dataCenters,
  dataCenter,
}
