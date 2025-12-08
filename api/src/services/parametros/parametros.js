import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const parametros = ({ grupo }) => {
  let where = { estado: 'ACTIVO' }

  if (grupo && grupo.length > 0) {
    // Filtramos el campo 'grupo' usando 'in'
    where.grupo = { in: grupo }
  }

  return db.parametro.findMany({
    where,
    orderBy: { nombre: 'asc' },
  })
}

export const parametro = ({ id }) => {
  return db.parametro.findUnique({
    where: { id },
  })
}

export const createParametro = ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.parametro.create({
    data: {
      codigo: input.codigo,
      nombre: input.nombre,
      grupo: input.grupo,
      estado: input.estado,
      descripcion: input.descripcion,
      fecha_creacion: new Date(),
      usuario_creacion: currentUserId,
    },
  })
}

export const updateParametro = ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.parametro.update({
    data: {
      codigo: input.codigo,
      nombre: input.nombre,
      grupo: input.grupo,
      estado: input.estado,
      descripcion: input.descripcion,
      fecha_modificacion: new Date(),
      usuario_modificacion: currentUserId,
    },
    where: { id },
  })
}

export const deleteParametro = ({ id }) => {
  return db.parametro.delete({
    where: { id },
  })
}

export const parametroByCodigo = ({ codigo }) => {
  return db.parametro.findFirst({
    where: { codigo, estado: 'ACTIVO' },
  })
}

export const Parametro = {
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
  parametros,
  parametro,
  parametroByCodigo,
}