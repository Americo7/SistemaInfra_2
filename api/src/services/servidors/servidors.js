import { db } from 'src/lib/db'

export const servidors = () => {
  return db.servidor.findMany()
}

export const servidor = ({ id }) => {
  return db.servidor.findUnique({
    where: { id },
  })
}

export const createServidor = ({ input }) => {
  return db.servidor.create({
    data: {
      id_hardware: input.id_hardware,
      serie_servidor: input.serie_servidor,
      cod_inventario_agetic: input.cod_inventario_agetic,
      chasis: input.chasis,
      cuchilla: input.cuchilla,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      estado_operativo: input.estado_operativo,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateServidor = ({ id, input }) => {
  return db.servidor.update({
    data: {
      id_hardware: input.id_hardware,
      serie_servidor: input.serie_servidor,
      cod_inventario_agetic: input.cod_inventario_agetic,
      chasis: input.chasis,
      cuchilla: input.cuchilla,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      estado_operativo: input.estado_operativo,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteServidor = ({ id }) => {
  return db.servidor.delete({
    where: { id },
  })
}

export const Servidor = {
  servidor_maquina: (_obj, { root }) => {
    return db.servidor
      .findUnique({ where: { id: root?.id } })
      .servidor_maquina()
  },
  hardware: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root?.id } }).hardware()
  },
}
