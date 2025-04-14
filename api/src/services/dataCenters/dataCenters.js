import { db } from 'src/lib/db'

export const dataCenters = () => {
  return db.dataCenter.findMany()
}

export const dataCenter = ({ id }) => {
  return db.dataCenter.findUnique({
    where: { id },
    include: {
      servidores: true, // Incluye la relación de servidores
    },
  })
}

export const createDataCenter = ({ input }) => {
  return db.dataCenter.create({
    data: {
      nombre: input.nombre,
      ubicacion: input.ubicacion,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateDataCenter = ({ id, input }) => {
  return db.dataCenter.update({
    data: {
      nombre: input.nombre,
      ubicacion: input.ubicacion,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteDataCenter = ({ id }) => {
  return db.dataCenter.delete({
    where: { id },
  })
}

export const DataCenter = {
  hardware: (_obj, { root }) => {
    return db.dataCenter.findUnique({ where: { id: root?.id } }).hardware()
  },
  infra_afectada: (_obj, { root }) => {
    return db.dataCenter
      .findUnique({ where: { id: root?.id } })
      .infra_afectada()
  },
}
