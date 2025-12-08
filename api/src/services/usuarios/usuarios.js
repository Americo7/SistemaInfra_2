import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const usuarios = () => {
  return db.usuario.findMany({
    orderBy: { nombres: 'asc' },
  })
}

export const usuario = ({ id }) => {
  return db.usuario.findUnique({
    where: { id },
  })
}

export const createUsuario = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.usuario.create({
    data: {
      id_ciudadano_digital: input.id_ciudadano_digital,
      nombre_usuario: input.nombre_usuario,
      contrasena: input.contrasena,
      nro_documento: input.nro_documento,
      nombres: input.nombres,
      primer_apellido: input.primer_apellido,
      segundo_apellido: input.segundo_apellido,
      celular: input.celular,
      email: input.email,
      estado: input.estado,
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
    },
  })
}

export const updateUsuario = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.usuario.update({
    data: {
      id_ciudadano_digital: input.id_ciudadano_digital,
      nombre_usuario: input.nombre_usuario,
      contrasena: input.contrasena,
      nro_documento: input.nro_documento,
      nombres: input.nombres,
      primer_apellido: input.primer_apellido,
      segundo_apellido: input.segundo_apellido,
      celular: input.celular,
      email: input.email,
      estado: input.estado,
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),
    },
    where: { id },
  })
}

export const deleteUsuario = ({ id }) => {
  return db.usuario.delete({
    where: { id },
  })
}

export const Usuario = {
  usuario_roles: (_obj, { root }) => {
    return db.usuario.findUnique({ where: { id: root?.id } }).usuario_roles()
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
  usuarios,
  usuario,
}
