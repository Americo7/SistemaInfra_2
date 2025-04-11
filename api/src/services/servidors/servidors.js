import { db } from 'src/lib/db'

export const servidores = () => {
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
      cod_inventario_agetic: input.cod_inventario_agetic,
      nombre: input.nombre,

      ram: input.ram,
      almacenamiento: input.almacenamiento,
      estado_operativo: input.estado_operativo,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
      id_data_center: input.id_data_center,
      serie: input.serie,
      id_padre: input.id_padre || null,  // Puede ser null si no tiene padre
      cod_tipo_servidor: input.cod_tipo_servidor,
      marca: input.marca,
      modelo: input.modelo
    }
  })

}

export const updateServidor = ({ id, input }) => {
  return db.servidor.update({
    where: { id },
    data: {
      cod_inventario_agetic: input.cod_inventario_agetic,
      nombre: input.nombre,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      estado_operativo: input.estado_operativo,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
      id_data_center: input.id_data_center,
      serie: input.serie,
      id_padre: input.id_padre,
      cod_tipo_servidor: input.cod_tipo_servidor,
      marca: input.marca,
      modelo: input.modelo
    }
  })
}


export const deleteServidor = ({ id }) => {
  return db.servidor.delete({
    where: { id },
  })
}


export const Servidor = {
  asignacion_servidor_maquina: (_obj, { root }) => {
    return db.servidor
      .findUnique({ where: { id: root?.id } })
      .asignacion_servidor_maquina()
  },
  infra_afectada: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root?.id } }).infra_afectada()
  },
  data_center: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root?.id } }).data_centers()
  },
  padre: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root?.id } }).servidores()
  },
  hijos: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root?.id } }).other_servidores()
  }
}

