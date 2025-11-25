import { db } from 'src/lib/db'

export const despliegueBitacoras = () => {
  return db.despliegueBitacora.findMany()
}

export const despliegueBitacora = ({ id }) => {
  return db.despliegueBitacora.findUnique({
    where: { id },
  })
}

export const createDespliegueBitacora = ({ input }) => {
  return db.despliegueBitacora.create({
    data: {
      id_despliegue: input.id_despliegue,
      estado_anterior: input.estado_anterior,
      estado_actual: input.estado_actual,
      descripcion:input.descripcion,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateDespliegueBitacora = ({ id, input }) => {
  return db.despliegueBitacora.update({
    data: {
      id_despliegue: input.id_despliegue,
      estado_anterior: input.estado_anterior,
      estado_actual: input.estado_actual,
      descripcion:input.descripcion,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteDespliegueBitacora = ({ id }) => {
  return db.despliegueBitacora.delete({
    where: { id },
  })
}

export const DespliegueBitacora = {
  despliegue: (_obj, { root }) => {
    return db.despliegueBitacora
      .findUnique({ where: { id: root?.id } })
      .despliegue()
  },
}
