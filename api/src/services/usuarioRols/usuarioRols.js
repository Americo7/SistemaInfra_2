import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const usuarioRols = () => {
  return db.usuarioRol.findMany({
    orderBy: { id: 'desc' },
  })
}

export const usuarioRol = ({ id }) => {
  return db.usuarioRol.findUnique({
    where: { id },
  })
}

export const createUsuarioRol = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.usuarioRol.create({
    data: {
      id_usuario: input.id_usuario,
      id_rol: input.id_rol,
      id_maquina: input.id_maquina,
      id_sistema: input.id_sistema,
      estado: input.estado,
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
    },
  })
}

export const updateUsuarioRol = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.usuarioRol.update({
    data: {
      id_usuario: input.id_usuario,
      id_rol: input.id_rol,
      id_maquina: input.id_maquina,
      id_sistema: input.id_sistema,
      estado: input.estado,
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),
    },
    where: { id },
  })
}

export const deleteUsuarioRol = ({ id }) => {
  return db.usuarioRol.delete({
    where: { id },
  })
}

export const UsuarioRol = {
  maquinas: (_obj, { root }) => {
    return db.usuarioRol.findUnique({ where: { id: root?.id } }).maquinas()
  },
  roles: (_obj, { root }) => {
    return db.usuarioRol.findUnique({ where: { id: root?.id } }).roles()
  },
  sistemas: (_obj, { root }) => {
    return db.usuarioRol.findUnique({ where: { id: root?.id } }).sistemas()
  },
  usuarios: (_obj, { root }) => {
    return db.usuarioRol.findUnique({ where: { id: root?.id } }).usuarios()
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
  usuarioRols,
  usuarioRol,
}
