import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const entidads = () => {
  return db.entidad.findMany({
    orderBy: { nombre: 'asc' },
  })
}

export const entidad = ({ id }) => {
  return db.entidad.findUnique({
    where: { id },
  })
}

export const createEntidad = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.entidad.create({
    data: {
      codigo: input.codigo,
      sigla: input.sigla,
      nombre: input.nombre,
      estado: input.estado,
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
    },
  })
}

export const updateEntidad = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.entidad.update({
    data: {
      codigo: input.codigo,
      sigla: input.sigla,
      nombre: input.nombre,
      estado: input.estado,
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),
    },
    where: { id },
  })
}

export const deleteEntidad = ({ id }) => {
  return db.entidad.delete({
    where: { id },
  })
}

export const Entidad = {
  sistemas: (_obj, { root }) => {
    return db.entidad.findUnique({ where: { id: root?.id } }).sistemas()
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
  entidads,
  entidad,
}
