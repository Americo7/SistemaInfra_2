import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

/* LISTAR TODOS */
export const k8SEndpoints = () => {
  return db.k8sEndpoint.findMany({
    orderBy: { id: 'asc' },
  })
}

/* DETALLE */
export const k8SEndpoint = ({ id }) => {
  return db.k8sEndpoint.findUnique({
    where: { id },
  })
}

/* CREAR */
export const createK8sEndpoint = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.k8sEndpoint.create({
    data: {
      nombre: input.nombre,
      url_api: input.url_api,
      token_bearer: input.token_bearer,
      descripcion: input.descripcion,
      fecha_ultima_sync: input.fecha_ultima_sync,
      estado: input.estado,
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
    },
  })
}

/* ACTUALIZAR */
export const updateK8sEndpoint = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.k8sEndpoint.update({
    where: { id },
    data: {
      nombre: input.nombre,
      url_api: input.url_api,
      token_bearer: input.token_bearer,
      descripcion: input.descripcion,
      fecha_ultima_sync: input.fecha_ultima_sync,
      estado: input.estado,
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),
    },
  })
}

/* ELIMINAR */
export const deleteK8sEndpoint = ({ id }) => {
  return db.k8sEndpoint.delete({
    where: { id },
  })
}

/* RESOLVERS DE RELACIONES */
export const K8sEndpoint = {
  clusters: (_obj, { root }) => {
    return db.k8sEndpoint.findUnique({ where: { id: root?.id } }).clusters()
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
  k8SEndpoints,
  k8SEndpoint
}