import { db } from 'src/lib/db'

export const servidores = () => {
  return db.servidor.findMany({
    // Nota: Prisma hace carga perezosa (lazy) de relaciones en GraphQL.
    // No es estrictamente necesario incluir todo aquí a menos que quieras optimizar
    // consultas N+1 específicas. Lo dejo como lo tenías.
    include: {
      data_centers: true,
      cluster_nodos: true,
      maquinas: true,
      infra_afectada: true,
      despliegue: true, // <-- Agregado por consistencia
    },
  })
}

export const servidor = ({ id }) => {
  return db.servidor.findUnique({
    where: { id },
    include: {
      data_centers: true,
      maquinas: true,
      infra_afectada: true,
      cluster_nodos: true,
      despliegue: true, // <-- Agregado
    },
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
      id_padre: input.id_padre || null,
      cod_tipo_servidor: input.cod_tipo_servidor,
      marca: input.marca,
      modelo: input.modelo,
      ip_primaria: input.ip_primaria,
      sistema_operativo: input.sistema_operativo, // <-- NUEVO
    },
    // include: { data_centers: true }, // No es necesario incluir en el create si GraphQL lo resuelve abajo
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
      modelo: input.modelo,
      ip_primaria: input.ip_primaria,
      sistema_operativo: input.sistema_operativo, // <-- NUEVO
    },
    // include: { data_centers: true },
  })
}

export const deleteServidor = ({ id }) => {
  return db.servidor.delete({
    where: { id },
  })
}

// Query personalizada "Deep"
export const servidorCompleto = ({ id }) => {
  return db.servidor.findUnique({
    where: { id },
    include: {
      data_centers: true,
      infra_afectada: true,
      despliegue: true, // <-- Importante ver los despliegues
      maquinas: {
        include: {
          cluster_nodos: {
            include: {
              cluster: true,
            },
          },
        },
      },
      cluster_nodos: {
        include: {
          maquina: true,
          servidor: true,
          cluster: true,
        },
      },
      servidores_padre: true,
      servidores_hijos: true,
    },
  })
}

// Resolvers de Relaciones (Para que GraphQL navegue el grafo)
export const Servidor = {
  infra_afectada: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root.id } }).infra_afectada()
  },
  maquinas: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root.id } }).maquinas()
  },
  cluster_nodos: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root.id } }).cluster_nodos()
  },
  data_centers: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root.id } }).data_centers()
  },
  servidores_padre: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root.id } }).servidores_padre()
  },
  servidores_hijos: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root.id } }).servidores_hijos()
  },
  despliegue: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root.id } }).despliegue()
  },
}