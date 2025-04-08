import { db } from 'src/lib/db'

export const infraAfectadas = () => {
  return db.infraAfectada.findMany()
}

export const infraAfectada = ({ id }) => {
  return db.infraAfectada.findUnique({
    where: { id },
  })
}

export const createInfraAfectada = ({ input }) => {
  return db.infraAfectada.create({
    data: {
      id_evento: input.id_evento,
      id_data_center: input.id_data_center,
      id_hardware: input.id_hardware,
      id_servidor: input.id_servidor,
      id_maquina: input.id_maquina,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateInfraAfectada = ({ id, input }) => {
  return db.infraAfectada.update({
    data: {
      id_evento: input.id_evento,
      id_data_center: input.id_data_center,
      id_hardware: input.id_hardware,
      id_servidor: input.id_servidor,
      id_maquina: input.id_maquina,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteInfraAfectada = ({ id }) => {
  return db.infraAfectada.delete({
    where: { id },
  })
}

export const InfraAfectada = {
  data_centers: (_obj, { root }) => {
    return db.infraAfectada
      .findUnique({ where: { id: root?.id } })
      .data_centers()
  },
  eventos: (_obj, { root }) => {
    return db.infraAfectada.findUnique({ where: { id: root?.id } }).eventos()
  },
  hardware: (_obj, { root }) => {
    return db.infraAfectada.findUnique({ where: { id: root?.id } }).hardware()
  },
  maquinas: (_obj, { root }) => {
    return db.infraAfectada.findUnique({ where: { id: root?.id } }).maquinas()
  },
  servidores: (_obj, { root }) => {
    return db.infraAfectada.findUnique({ where: { id: root?.id } }).servidores()
  },
}
