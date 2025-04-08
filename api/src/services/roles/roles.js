import { db } from 'src/lib/db'

export const roles = () => {
  return db.role.findMany()
}

export const role = ({ id }) => {
  return db.role.findUnique({
    where: { id },
  })
}

export const createRole = ({ input }) => {
  return db.role.create({
    data: {
      nombre: input.nombre,
      cod_tipo_rol: input.cod_tipo_rol,
      descripcion: input.descripcion,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateRole = ({ id, input }) => {
  return db.role.update({
    data: {
      nombre: input.nombre,
      cod_tipo_rol: input.cod_tipo_rol,
      descripcion: input.descripcion,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
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
}
