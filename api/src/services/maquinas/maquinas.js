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
      cod_plataforma: input.cod_plataforma,
      nombre: input.nombre,
      ip: input.ip,
      so: input.so,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      cpu: input.cpu,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
      es_virtual: input.es_virtual === true || input.es_virtual === 'true'
    },
  })
}

export const updateMaquina = ({ id, input }) => {

  return db.maquina.update({
    data: {
      codigo: input.codigo,
      cod_plataforma: input.cod_plataforma,
      nombre: input.nombre,
      ip: input.ip,
      so: input.so,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      cpu: input.cpu,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
      es_virtual: input.es_virtual === true || input.es_virtual === 'true'
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
  asignacion_servidor_maquina: (_obj, { root }) => {
    return db.maquina
      .findUnique({ where: { id: root?.id } })
      .asignacion_servidor_maquina()
  },
  despliegue: (_obj, { root }) => {
    return db.maquina.findUnique({ where: { id: root?.id } }).despliegue()
  },
  infra_afectada: (_obj, { root }) => {
    return db.maquina.findUnique({ where: { id: root?.id } }).infra_afectada()
  },
  usuario_roles: (_obj, { root }) => {
    return db.maquina.findUnique({ where: { id: root?.id } }).usuario_roles()
  },
}
