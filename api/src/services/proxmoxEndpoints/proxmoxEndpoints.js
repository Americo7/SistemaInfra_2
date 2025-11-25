import { db } from 'src/lib/db'

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
      usuario_creacion: input.usuario_creacion,
    },
  })
}

/* -------------------------------------------
 * ACTUALIZAR
 * ------------------------------------------- */
export const updateProxmoxEndpoint = ({ id, input }) => {
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
      usuario_modificacion: input.usuario_modificacion,
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
}
