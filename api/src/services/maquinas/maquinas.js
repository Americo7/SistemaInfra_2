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
  const respaldoData = {
    tipo_respaldo: input.tipo_respaldo,
    detalle_respaldo: input.detalle_respaldo,
    fecha_solicitud: input.fecha_solicitud,
    responsable_admin: input.responsable_admin,
  }
  return db.maquina.create({
    data: {
      codigo: input.codigo,
      cod_tipo_maquina: input.cod_tipo_maquina,
      nombre: input.nombre,
      ip: input.ip,
      so: input.so,
      ram: input.ram,
      almacenamiento: respaldoData,
      cpu: input.cpu,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateMaquina = ({ id, input }) => {
  const respaldoData = {
    tipo_respaldo: input.tipo_respaldo,
    detalle_respaldo: input.detalle_respaldo,
    fecha_solicitud: input.fecha_solicitud,
    responsable_admin: input.responsable_admin,
  }
  return db.maquina.update({
    data: {
      codigo: input.codigo,
      cod_tipo_maquina: input.cod_tipo_maquina,
      nombre: input.nombre,
      ip: input.ip,
      so: input.so,
      ram: input.ram,
      almacenamiento: respaldoData,
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
