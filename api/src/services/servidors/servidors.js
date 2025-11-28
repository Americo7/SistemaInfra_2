import { db } from 'src/lib/db'

/* ============================================================
   GENERADOR UNIVERSAL DE IDENTITY_KEY PARA SERVIDORES (MANUAL)
============================================================ */
const generarIdentityKeyServidor = (input) => {
  // Caso general manual
  const slug = input.nombre.trim().toLowerCase().replace(/\s+/g, '-')
  return `manual:servidor:${slug}`
}

/* ============================================================
   LISTA (Optimizada para carga masiva)
============================================================ */
export const servidores = () => {
  return db.servidor.findMany({
    orderBy: { nombre: 'asc' },
    include: {
      data_centers: true,
      servidores_padre: true,
    },
  }) ?? []
}

/* ============================================================
   DETALLE (Liviano, lazy loading)
============================================================ */
export const servidor = ({ id }) => {
  return db.servidor.findUnique({
    where: { id },
  })
}

/* ============================================================
   CREAR SERVIDOR MANUAL
============================================================ */
export const createServidor = ({ input }) => {
  const identity_key = generarIdentityKeyServidor(input)

  return db.servidor.create({
    data: {
      cod_inventario_agetic: input.cod_inventario_agetic,
      nombre: input.nombre,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      estado_operativo: input.estado_operativo,
      estado: input.estado,

      id_data_center: input.id_data_center,
      serie: input.serie,
      id_padre: input.id_padre || null,
      cod_tipo_servidor: input.cod_tipo_servidor,
      marca: input.marca,
      modelo: input.modelo,
      ip_primaria: input.ip_primaria,
      sistema_operativo: input.sistema_operativo,

      // identity_key siempre generado internamente
      identity_key,

      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

/* ============================================================
   ACTUALIZAR SERVIDOR MANUAL
============================================================ */
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

      id_data_center: input.id_data_center,
      serie: input.serie,
      id_padre: input.id_padre || null,
      cod_tipo_servidor: input.cod_tipo_servidor,
      marca: input.marca,
      modelo: input.modelo,
      ip_primaria: input.ip_primaria,
      sistema_operativo: input.sistema_operativo,

      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
  })
}

/* ============================================================
   ELIMINAR
============================================================ */
export const deleteServidor = ({ id }) => {
  return db.servidor.delete({
    where: { id },
  })
}

/* ============================================================
   RESOLVERS (Lazy Loading Inteligente)
============================================================ */
export const Servidor = {
  // Data center (cache rápido si viene desde lista)
  data_centers: (_obj, { root }) => {
    if (root.data_centers) return root.data_centers
    return db.servidor.findUnique({ where: { id: root.id } }).data_centers()
  },

  // VMs del servidor
  maquinas: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root.id } }).maquinas()
  },

  // Cluster-nodos asociados
  cluster_nodos: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root.id } }).cluster_nodos({
      include: { cluster: true },
    })
  },

  despliegue: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root.id } }).despliegue({
      include: { componentes: true },
    })
  },

  infra_afectada: (_obj, { root }) => {
    return db.servidor.findUnique({ where: { id: root.id } }).infra_afectada({
      include: { eventos: true },
    })
  },

  servidores_padre: (_obj, { root }) =>
    db.servidor.findUnique({ where: { id: root.id } }).servidores_padre(),

  servidores_hijos: (_obj, { root }) =>
    db.servidor.findUnique({ where: { id: root.id } }).servidores_hijos(),
}
