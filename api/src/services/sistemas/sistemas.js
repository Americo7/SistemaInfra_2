import { db } from 'src/lib/db'

export const sistemas = () => {
  return db.sistema.findMany()
}

export const sistema = ({ id }) => {
  return db.sistema.findUnique({
    where: { id },
  })
}

export const createSistema = ({ input }) => {
  const respaldoData = {
    tipo_respaldo: input.tipo_respaldo,
    detalle_respaldo: input.detalle_respaldo,
    fecha_solicitud: input.fecha_solicitud,
    responsable_admin: input.responsable_admin,
  }
  return db.sistema.create({
    data: {
      id_padre: input.id_padre,
      id_entidad: input.id_entidad,
      codigo: input.codigo,
      sigla: input.sigla,
      nombre: input.nombre,
      descripcion: input.descripcion,
      estado: input.estado,
      respaldo_creacion: respaldoData,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateSistema = ({ id, input }) => {
  const respaldoData = {
    tipo_respaldo: input.tipo_respaldo,
    detalle_respaldo: input.detalle_respaldo,
    fecha_solicitud: input.fecha_solicitud,
    responsable_admin: input.responsable_admin,
  }
  return db.sistema.update({
    data: {
      id_padre: input.id_padre,
      id_entidad: input.id_entidad,
      codigo: input.codigo,
      sigla: input.sigla,
      nombre: input.nombre,
      descripcion: input.descripcion,
      estado: input.estado,
      respaldo_creacion: respaldoData,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteSistema = ({ id }) => {
  return db.sistema.delete({
    where: { id },
  })
}

export const Sistema = {
  componentes: (_obj, { root }) => {
    return db.sistema.findUnique({ where: { id: root?.id } }).componentes()
  },
  entidades: (_obj, { root }) => {
    return db.sistema.findUnique({ where: { id: root?.id } }).entidades()
  },
  sistemas: (_obj, { root }) => {
    return db.sistema.findUnique({ where: { id: root?.id } }).sistemas()
  },
  other_sistemas: (_obj, { root }) => {
    return db.sistema.findUnique({ where: { id: root?.id } }).other_sistemas()
  },
  usuario_roles: (_obj, { root }) => {
    return db.sistema.findUnique({ where: { id: root?.id } }).usuario_roles()
  },
}
