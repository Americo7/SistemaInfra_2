import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

/* ============================================================
   1. UTILIDADES (Identity Key)
============================================================ */
const normalizarNombre = (nombre) => {
  if (!nombre) return ''
  return nombre.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

const generarIdentityKeyFinal = (nombre, id) => {
  const slug = normalizarNombre(nombre)
  if (id) {
    return `manual:${slug}:${id}`
  }
  return `manual:${slug}:manual`
}

/* ============================================================
   2. QUERIES
============================================================ */

export const servidores = () => {
  return db.servidor.findMany({
    orderBy: { nombre: 'asc' },
  })
}

export const servidor = ({ id }) => {
  return db.servidor.findUnique({
    where: { id },
  })
}

// Obtener parámetros para los selectores (Tipo y Estado Operativo)
export const parametrosFormularioServidor = () => {
  return db.parametro.findMany({
    where: {
      grupo: { in: ['TIPO_SERVIDOR', 'ESTADO_OPERATIVO'] },
      estado: 'ACTIVO'
    },
    orderBy: [{ grupo: 'asc' }, { nombre: 'asc' }]
  })
}

/* ============================================================
   3. MUTATIONS
============================================================ */

export const createServidor = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  // 1. Generar Key temporal si no viene en el input
  let keyToSave = input.identity_key?.trim() || ''
  if (!keyToSave) {
    keyToSave = generarIdentityKeyFinal(input.nombre, null)
  }

  const servidorCreado = await db.servidor.create({
    data: {
      nombre: input.nombre,
      cod_inventario_agetic: input.cod_inventario_agetic,
      cod_tipo_servidor: input.cod_tipo_servidor,
      serie: input.serie,
      marca: input.marca,
      modelo: input.modelo,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      ip_primaria: input.ip_primaria,
      sistema_operativo: input.sistema_operativo,
      estado_operativo: input.estado_operativo,
      estado: input.estado,

      // Relaciones opcionales (Null si no vienen)
      id_data_center: input.id_data_center || null,
      id_padre: input.id_padre || null,

      identity_key: keyToSave,
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
    },
  })

  // 2. Si se usó una key temporal manual, actualizarla con el ID real
  let servidorFinal = servidorCreado

  if (keyToSave === generarIdentityKeyFinal(servidorCreado.nombre, null)) {
    const identity_key_final = generarIdentityKeyFinal(servidorCreado.nombre, servidorCreado.id)

    servidorFinal = await db.servidor.update({
      where: { id: servidorCreado.id },
      data: { identity_key: identity_key_final },
    })
  }

  return servidorFinal
}

export const updateServidor = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  const servidorExistente = await db.servidor.findUnique({ where: { id } })
  if (!servidorExistente) {
    throw new Error(`Servidor con ID ${id} no encontrado.`)
  }

  // Recalcular identity_key SOLO si es manual y el nombre cambió
  let nueva_identity_key = servidorExistente.identity_key
  const isManualKey = servidorExistente.identity_key.startsWith('manual:')
  const nombreCambio = input.nombre && normalizarNombre(input.nombre) !== normalizarNombre(servidorExistente.nombre)

  if (isManualKey && nombreCambio) {
    nueva_identity_key = generarIdentityKeyFinal(input.nombre, id)
  }

  return db.servidor.update({
    where: { id },
    data: {
      nombre: input.nombre,
      cod_inventario_agetic: input.cod_inventario_agetic,
      cod_tipo_servidor: input.cod_tipo_servidor,
      serie: input.serie,
      marca: input.marca,
      modelo: input.modelo,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      ip_primaria: input.ip_primaria,
      sistema_operativo: input.sistema_operativo,
      estado_operativo: input.estado_operativo,
      estado: input.estado,

      id_data_center: input.id_data_center || null,
      id_padre: input.id_padre || null,

      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),

      identity_key: nueva_identity_key,
    },
  })
}

export const deleteServidor = ({ id }) => {
  return db.servidor.delete({
    where: { id },
  })
}

/* ============================================================
   4. RESOLVERS
============================================================ */
export const Servidor = {
  // Relaciones Prisma
  data_centers: (_obj, { root }) => db.servidor.findUnique({ where: { id: root.id } }).data_centers(),
  maquinas: (_obj, { root }) => db.servidor.findUnique({ where: { id: root.id } }).maquinas(),
  cluster_nodos: (_obj, { root }) => db.servidor.findUnique({ where: { id: root.id } }).cluster_nodos(),
  despliegue: (_obj, { root }) => db.servidor.findUnique({ where: { id: root.id } }).despliegue(),
  infra_afectada: (_obj, { root }) => db.servidor.findUnique({ where: { id: root.id } }).infra_afectada(),
  servidores_padre: (_obj, { root }) => db.servidor.findUnique({ where: { id: root.id } }).servidores_padre(),
  servidores_hijos: (_obj, { root }) => db.servidor.findUnique({ where: { id: root.id } }).servidores_hijos(),

  // Relaciones Calculadas: Usuarios
  creadoPor: (_obj, { root }) => {
    if (!root.usuario_creacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_creacion } })
  },
  modificadoPor: (_obj, { root }) => {
    if (!root.usuario_modificacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_modificacion } })
  },

  // Relaciones Calculadas: Parámetros
  tipoServidorInfo: (_obj, { root }) => {
    if (!root.cod_tipo_servidor) return null
    return db.parametro.findFirst({
      where: { codigo: root.cod_tipo_servidor, grupo: 'TIPO_SERVIDOR' }
    })
  },
  estadoOperativoInfo: (_obj, { root }) => {
    if (!root.estado_operativo) return null
    return db.parametro.findFirst({
      where: { codigo: root.estado_operativo, grupo: 'ESTADO_OPERATIVO' }
    })
  },
}