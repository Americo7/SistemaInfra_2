import { db } from 'src/lib/db'

/* LISTAR TODOS */
export const k8SEndpoints = () => {
  return db.k8sEndpoint.findMany({
    include: {
      clusters: true, // Incluimos los clusters asociados
    },
    orderBy: { id: 'asc' },
  })
}

/* DETALLE */
export const k8SEndpoint = ({ id }) => {
  return db.k8sEndpoint.findUnique({
    where: { id },
    include: {
      clusters: true,
    },
  })
}

/* CONSULTA USUARIOS (auxiliar) */
export const usuarios = () => {
  return db.usuario.findMany()
}

/* CREAR */
export const createK8sEndpoint = ({ input }) => {
  return db.k8sEndpoint.create({
    data: {
      nombre: input.nombre,
      url_api: input.url_api,
      token_bearer: input.token_bearer,
      descripcion: input.descripcion,
      fecha_ultima_sync: input.fecha_ultima_sync,
      estado: input.estado,
      usuario_creacion: input.usuario_creacion,
      fecha_creacion: new Date(),
    },
  })
}

/* ACTUALIZAR */
export const updateK8sEndpoint = ({ id, input }) => {
  return db.k8sEndpoint.update({
    where: { id },
    data: {
      nombre: input.nombre,
      url_api: input.url_api,
      token_bearer: input.token_bearer,
      descripcion: input.descripcion,
      fecha_ultima_sync: input.fecha_ultima_sync,
      estado: input.estado,
      usuario_modificacion: input.usuario_modificacion,
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
}