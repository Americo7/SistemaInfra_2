import { db } from 'src/lib/db'

export const hardwares = () => {
  return db.hardware.findMany()
}

export const hardware = ({ id }) => {
  return db.hardware.findUnique({
    where: { id },
  })
}

export const createHardware = ({ input }) => {
  return db.hardware.create({
    data: {
      id_data_center: input.id_data_center,
      serie: input.serie,
      cod_activo_agetic: input.cod_activo_agetic,
      cod_tipo_hw: input.cod_tipo_hw,
      marca: input.marca,
      modelo: input.modelo,
      estado_operativo: input.estado_operativo,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: 1,
    },
  })
}

export const updateHardware = ({ id, input }) => {
  return db.hardware.update({
    data: {
      id_data_center: input.id_data_center,
      serie: input.serie,
      cod_activo_agetic: input.cod_activo_agetic,
      cod_tipo_hw: input.cod_tipo_hw,
      marca: input.marca,
      modelo: input.modelo,
      estado_operativo: input.estado_operativo,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: 1,
    },
    where: { id },
  })
}

export const deleteHardware = ({ id }) => {
  return db.hardware.delete({
    where: { id },
  })
}

export const Hardware = {
  data_centers: (_obj, { root }) => {
    return db.hardware.findUnique({ where: { id: root?.id } }).data_centers()
  },
  infra_afectada: (_obj, { root }) => {
    return db.hardware.findUnique({ where: { id: root?.id } }).infra_afectada()
  },
  servidores: (_obj, { root }) => {
    return db.hardware.findUnique({ where: { id: root?.id } }).servidores()
  },
}
