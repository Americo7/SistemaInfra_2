import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

/* -------------------------------------------
 * LISTA DE ENDPOINTS
 * ------------------------------------------- */
export const proxmoxEndpoints = () => {
  return db.proxmoxEndpoint.findMany({
    include: {
      clusters: true,
    },
    orderBy: { id: 'asc' },
  })
}

/* -------------------------------------------
 * DETALLE POR ID
 * ------------------------------------------- */
export const proxmoxEndpoint = ({ id }) => {
  return db.proxmoxEndpoint.findUnique({
    where: { id },
    include: {
      clusters: true,
    },
  })
}

/* -------------------------------------------
 * CREAR
 * ------------------------------------------- */
export const createProxmoxEndpoint = ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.proxmoxEndpoint.create({
    data: {
      nombre: input.nombre,
      dominio: input.dominio,
      ip: input.ip,
      puerto: input.puerto,
      ssl: input.ssl,
      usuario: input.usuario,
      token_id: input.token_id,
      token_secret: input.token_secret,
      descripcion: input.descripcion,
      estado: input.estado,

      fecha_creacion: new Date(),
      usuario_creacion: currentUserId,
    },
  })
}

/* -------------------------------------------
 * ACTUALIZAR
 * ------------------------------------------- */
export const updateProxmoxEndpoint = ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.proxmoxEndpoint.update({
    data: {
      nombre: input.nombre,
      dominio: input.dominio,
      ip: input.ip,
      puerto: input.puerto,
      ssl: input.ssl,
      usuario: input.usuario,
      token_id: input.token_id,
      token_secret: input.token_secret,
      descripcion: input.descripcion,
      estado: input.estado,

      fecha_modificacion: new Date(),
      usuario_modificacion: currentUserId,
    },
    where: { id },
  })
}

/* -------------------------------------------
 * ELIMINAR
 * ------------------------------------------- */
export const deleteProxmoxEndpoint = ({ id }) => {
  return db.proxmoxEndpoint.delete({
    where: { id },
  })
}

/* -------------------------------------------
 * RESOLVERS DE CAMPOS RELACIONADOS
 * ------------------------------------------- */
export const ProxmoxEndpoint = {
  clusters: (_obj, { root }) => {
    return db.proxmoxEndpoint
      .findUnique({ where: { id: root.id } })
      .clusters()
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

export const Query = {
  proxmoxEndpoints,
  proxmoxEndpoint,
}
