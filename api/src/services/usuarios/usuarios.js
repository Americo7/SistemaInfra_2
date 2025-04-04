import { db } from 'src/lib/db'

export const usuarios = () => {
  return db.usuario.findMany()
}

export const usuario = ({ id }) => {
  return db.usuario.findUnique({
    where: { id },
  })
}

export const createUsuario = ({ input }) => {
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
      fecha_creacion: new Date(),
      usuario_creacion: 1,
    },
  })
}

export const updateUsuario = ({ id, input }) => {
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
      fecha_modificacion: new Date(),
      usuario_modificacion: 1,
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
}
