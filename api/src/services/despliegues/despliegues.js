import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const despliegues = () => {
  return db.despliegue.findMany({
    orderBy: { fecha_despliegue: 'desc' },
  })
}

export const despliegue = ({ id }) => {
  return db.despliegue.findUnique({
    where: { id },
  })
}

export const parametrosFormularioDespliegue = () => {
  return db.parametro.findMany({
    where: {
      grupo: {
        in: ['TIPO_RESPALDO', 'ESTADO_DESPLIEGUE']
      },
      estado: 'ACTIVO'
    },
    orderBy: [{ grupo: 'asc' }, { nombre: 'asc' }]
  })
}

export const createDespliegue = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.despliegue.create({
    data: {
      id_componente: input.id_componente,
      id_maquina: input.id_maquina,
      id_servidor: input.id_servidor,
      descripcion: input.descripcion,
      fecha_despliegue: input.fecha_despliegue,
      estado: input.estado,
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
      fecha_solicitud: input.fecha_solicitud,
      unidad_solicitante: input.unidad_solicitante,
      solicitante: input.solicitante,
      cod_tipo_respaldo: input.cod_tipo_respaldo,
      referencia_respaldo: input.referencia_respaldo,
      estado_despliegue: input.estado_despliegue,
    },
  })
}

export const updateDespliegue = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.despliegue.update({
    data: {
      id_componente: input.id_componente,
      id_maquina: input.id_maquina,
      id_servidor: input.id_servidor,
      estado: input.estado,
      descripcion: input.descripcion,
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),
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
    return db.despliegue.findUnique({ where: { id: root.id } }).componentes()
  },
  maquinas: (_obj, { root }) => {
    return db.despliegue.findUnique({ where: { id: root.id } }).maquinas()
  },
  servidores: (_obj, { root }) => {
    return db.despliegue.findUnique({ where: { id: root.id } }).servidores()
  },
  despliegue_bitacora: (_obj, { root }) => {
    return db.despliegue.findUnique({ where: { id: root.id } }).despliegue_bitacora()
  },

  creadoPor: (_obj, { root }) => {
    if (!root.usuario_creacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_creacion } })
  },

  modificadoPor: (_obj, { root }) => {
    if (!root.usuario_modificacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_modificacion } })
  },

  tipoRespaldoInfo: (_obj, { root }) => {
    if (!root.cod_tipo_respaldo) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.cod_tipo_respaldo,
        grupo: 'TIPO_RESPALDO'
      }
    })
  },

  estadoDespliegueInfo: (_obj, { root }) => {
    if (!root.estado_despliegue) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.estado_despliegue,
        grupo: 'ESTADO_DESPLIEGUE'
      }
    })
  },
}

/* ============================================================
   QUERY RESOLVERS (Permitir que GraphQL acceda a las queries)
============================================================ */
export const Query = {
  despliegues,
  despliegue,
  parametrosFormularioDespliegue,
}
