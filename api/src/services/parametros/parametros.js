import { db } from 'src/lib/db'

export const parametros = () => {
  return db.parametro.findMany()
}

export const parametro = ({ id }) => {
  return db.parametro.findUnique({
    where: { id },
  })
}

export const createParametro = ({ input }) => {
  return db.parametro.create({
    data: {
      codigo: input.codigo,
      nombre: input.nombre,
      grupo: input.grupo,
      estado: input.estado,
      descripcion: input.descripcion,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateParametro = ({ id, input }) => {
  return db.parametro.update({
    data: {
      codigo: input.codigo,
      nombre: input.nombre,
      grupo: input.grupo,
      estado: input.estado,
      descripcion: input.descripcion,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteParametro = ({ id }) => {
  return db.parametro.delete({
    where: { id },
  })
}

