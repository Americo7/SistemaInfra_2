import { db } from 'src/lib/db'

export const asignacionServidorMaquinas = () => {
  return db.asignacionServidorMaquina.findMany()
}

export const asignacionServidorMaquina = ({ id }) => {
  return db.asignacionServidorMaquina.findUnique({
    where: { id },
  })
}

export const createAsignacionServidorMaquina = ({ input }) => {
  return db.asignacionServidorMaquina.create({
    data: {
      id_servidor: input.id_servidor,
      id_maquina: input.id_maquina,
      id_cluster: input.id_cluster,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateAsignacionServidorMaquina = ({ id, input }) => {
  return db.asignacionServidorMaquina.update({
    data: {
      id_servidor: input.id_servidor,
      id_maquina: input.id_maquina,
      id_cluster: input.id_cluster,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteAsignacionServidorMaquina = ({ id }) => {
  return db.asignacionServidorMaquina.delete({
    where: { id },
  })
}

export const AsignacionServidorMaquina = {
  clusters: (_obj, { root }) => {
    return db.asignacionServidorMaquina
      .findUnique({ where: { id: root?.id } })
      .clusters()
  },
  maquinas: (_obj, { root }) => {
    return db.asignacionServidorMaquina
      .findUnique({ where: { id: root?.id } })
      .maquinas()
  },
  servidores: (_obj, { root }) => {
    return db.asignacionServidorMaquina
      .findUnique({ where: { id: root?.id } })
      .servidores()
  },
}
