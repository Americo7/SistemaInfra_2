import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const roles = () => {
  return db.role.findMany({
    orderBy: { nombre: 'asc' },
  })
}

export const role = ({ id }) => {
  return db.role.findUnique({
    where: { id },
  })
}

export const parametrosFormularioRole = () => {
  return db.parametro.findMany({
    where: {
      grupo: {
        in: ['TIPO_ROL']
      },
      estado: 'ACTIVO'
    },
    orderBy: [{ grupo: 'asc' }, { nombre: 'asc' }]
  })
}

export const createRole = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.role.create({
    data: {
      nombre: input.nombre,
      cod_tipo_rol: input.cod_tipo_rol,
      descripcion: input.descripcion,
      estado: input.estado,
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
    },
  })
}

export const updateRole = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.role.update({
    data: {
      nombre: input.nombre,
      cod_tipo_rol: input.cod_tipo_rol,
      descripcion: input.descripcion,
      estado: input.estado,
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),
    },
    where: { id },
  })
}

export const deleteRole = ({ id }) => {
  return db.role.delete({
    where: { id },
  })
}

export const Role = {
  usuario_roles: (_obj, { root }) => {
    return db.role.findUnique({ where: { id: root?.id } }).usuario_roles()
  },

  creadoPor: (_obj, { root }) => {
    if (!root.usuario_creacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_creacion } })
  },

  modificadoPor: (_obj, { root }) => {
    if (!root.usuario_modificacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_modificacion } })
  },

  tipoRolInfo: (_obj, { root }) => {
    if (!root.cod_tipo_rol) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.cod_tipo_rol,
        grupo: 'TIPO_ROL'
      }
    })
  },
}

export const Query = {
  roles,
  role,
  parametrosFormularioRole,
}
