import { db } from 'src/lib/db'

export const parametros = ({ grupo }) => {
  let where = { estado: 'ACTIVO' }

  if (grupo && grupo.length > 0) {
    // Filtramos el campo 'grupo' usando 'in'
    where.grupo = { in: grupo }
  }

  return db.parametro.findMany({
    where,
    orderBy: { nombre: 'asc' },
  })
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

export const parametroByCodigo = ({ codigo }) => {
  return db.parametro.findFirst({
    where: { codigo, estado: 'ACTIVO' },
  })
}