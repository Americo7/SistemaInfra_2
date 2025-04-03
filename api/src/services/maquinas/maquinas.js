import { db } from 'src/lib/db'

export const maquinas = () => {
  return db.maquina.findMany()
}

export const maquina = ({ id }) => {
  return db.maquina.findUnique({
    where: { id },
  })
}

export const createMaquina = ({ input }) => {
  return db.maquina.create({
    data: {
      codigo: input.codigo,
      cod_tipo_maquina: input.cod_tipo_maquina,
      nombre: input.nombre,
      ip: input.ip,
      so: input.so,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      cpu: input.cpu,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateMaquina = ({ id, input }) => {
  return db.maquina.update({
    data: {
      codigo: input.codigo,
      cod_tipo_maquina: input.cod_tipo_maquina,
      nombre: input.nombre,
      ip: input.ip,
      so: input.so,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      cpu: input.cpu,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteMaquina = ({ id }) => {
  return db.maquina.delete({
    where: { id },
  })
}

export const Maquina = {
  despliegue: (_obj, { root }) => {
    return db.maquina.findUnique({ where: { id: root?.id } }).despliegue()
  },
  servidor_maquina: (_obj, { root }) => {
    return db.maquina.findUnique({ where: { id: root?.id } }).servidor_maquina()
  },
  usuario_roles: (_obj, { root }) => {
    return db.maquina.findUnique({ where: { id: root?.id } }).usuario_roles()
  },
}
