import { db } from 'src/lib/db'

export const servidorMaquinas = () => {
  return db.servidorMaquina.findMany()
}

export const servidorMaquina = ({ id }) => {
  return db.servidorMaquina.findUnique({
    where: { id },
  })
}

export const createServidorMaquina = ({ input }) => {
  return db.servidorMaquina.create({
    data: {
      id_servidor: input.id_servidor,
      id_maquina: input.maquina,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateServidorMaquina = ({ id, input }) => {
  return db.servidorMaquina.update({
    data: {
      id_servidor: input.id_servidor,
      id_maquina: input.maquina,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteServidorMaquina = ({ id }) => {
  return db.servidorMaquina.delete({
    where: { id },
  })
}

export const ServidorMaquina = {
  maquinas: (_obj, { root }) => {
    return db.servidorMaquina.findUnique({ where: { id: root?.id } }).maquinas()
  },
  servidores: (_obj, { root }) => {
    return db.servidorMaquina
      .findUnique({ where: { id: root?.id } })
      .servidores()
  },
}
