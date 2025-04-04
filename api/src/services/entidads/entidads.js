import { db } from 'src/lib/db'

export const entidads = () => {
  return db.entidad.findMany()
}

export const entidad = ({ id }) => {
  return db.entidad.findUnique({
    where: { id },
  })
}

export const createEntidad = ({ input }) => {
  return db.entidad.create({
    data: {
      codigo: input.codigo,
      sigla: input.sigla,
      nombre: input.nombre,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: 1,
    },
  })
}

export const updateEntidad = ({ id, input }) => {
  return db.entidad.update({
    data: {
      codigo: input.codigo,
      sigla: input.sigla,
      nombre: input.nombre,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: 1,
    },
    where: { id },
  })
}

export const deleteEntidad = ({ id }) => {
  return db.entidad.delete({
    where: { id },
  })
}

export const Entidad = {
  sistemas: (_obj, { root }) => {
    return db.entidad.findUnique({ where: { id: root?.id } }).sistemas()
  },
}
