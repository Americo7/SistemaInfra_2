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
    data: input,
  })
}

export const updateParametro = ({ id, input }) => {
  return db.parametro.update({
    data: input,
    where: { id },
  })
}

export const deleteParametro = ({ id }) => {
  return db.parametro.delete({
    where: { id },
  })
}
