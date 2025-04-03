import { db } from 'src/lib/db'

export const usuarioRols = () => {
  return db.usuarioRol.findMany()
}

export const usuarioRol = ({ id }) => {
  return db.usuarioRol.findUnique({
    where: { id },
  })
}

export const createUsuarioRol = ({ input }) => {
  return db.usuarioRol.create({
    data: {
      id_usuario: input.id_usuario,
      id_rol: input.id_rol,
      id_maquina: input.id_maquina,
      id_sistema: input.id_sistema,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario,
    },
  })
}

export const updateUsuarioRol = ({ id, input }) => {
  return db.usuarioRol.update({
    data: {
      id_usuario: input.id_usuario,
      id_rol: input.id_rol,
      id_maquina: input.id_maquina,
      id_sistema: input.id_sistema,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
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
}
