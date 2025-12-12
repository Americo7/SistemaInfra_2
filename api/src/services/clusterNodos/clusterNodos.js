import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

/* ============================================================
   1. UTILIDADES INTERNAS (Identity Key)
============================================================ */
const normalizarNombre = (nombre) => {
  if (!nombre) return ''
  return nombre.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

const generarIdentityKeyFinal = (nombreNodo, nombreCluster, id) => {
  const nodoSlug = normalizarNombre(nombreNodo)
  const clusterSlug = normalizarNombre(nombreCluster)

  if (id) {
    return `manual:cluster-nodo:${clusterSlug}:${nodoSlug}:${id}`
  }
  return `manual:cluster-nodo:${clusterSlug}:${nodoSlug}:manual`
}

/* ============================================================
   2. QUERIES
============================================================ */
export const clusterNodos = () => {
  return db.clusterNodo.findMany({
    orderBy: { nombre: 'asc' },
  })
}

export const clusterNodo = ({ id }) => {
  return db.clusterNodo.findUnique({
    where: { id },
  })
}

export const parametrosFormularioClusterNodo = () => {
  return db.parametro.findMany({
    where: {
      grupo: { in: ['NODO_ROL'] },
      estado: 'ACTIVO',
    },
    orderBy: [{ grupo: 'asc' }, { nombre: 'asc' }],
  })
}

/* ============================================================
   3. MUTATIONS
============================================================ */
export const createClusterNodo = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  const cluster = await db.cluster.findUnique({
    where: { id: input.clusterId },
  })

  if (!cluster) {
    throw new Error(`Cluster con ID ${input.clusterId} no encontrado.`)
  }

  let keyToSave = input.identity_key?.trim() || ''
  if (!keyToSave) {
    keyToSave = generarIdentityKeyFinal(input.nombre, cluster.nombre, null)
  }

  const nodoCreado = await db.clusterNodo.create({
    data: {
      clusterId: input.clusterId,
      nombre: input.nombre,
      nodoTipo: input.nodoTipo,
      rol: input.rol,
      estado: input.estado || 'ACTIVO',

      maquinaId: input.maquinaId || null,
      servidorId: input.servidorId || null,

      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),

      identity_key: keyToSave,
    },
  })

  // Actualizar identity_key con el ID real
  if (keyToSave === generarIdentityKeyFinal(nodoCreado.nombre, cluster.nombre, null)) {
    const identity_key_final = generarIdentityKeyFinal(
      nodoCreado.nombre,
      cluster.nombre,
      nodoCreado.id
    )

    return db.clusterNodo.update({
      where: { id: nodoCreado.id },
      data: { identity_key: identity_key_final },
    })
  }

  return nodoCreado
}

export const updateClusterNodo = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  const nodoExistente = await db.clusterNodo.findUnique({ where: { id } })

  if (!nodoExistente) {
    throw new Error(`Nodo con ID ${id} no encontrado.`)
  }

  let nueva_identity_key = nodoExistente.identity_key

  const cambioNombre =
    input.nombre &&
    normalizarNombre(input.nombre) !== normalizarNombre(nodoExistente.nombre)

  const cambioCluster =
    input.clusterId && input.clusterId !== nodoExistente.clusterId

  const isManualKey = nodoExistente.identity_key?.startsWith('manual:')

  if (isManualKey && (cambioNombre || cambioCluster)) {
    const clusterIdTarget = input.clusterId || nodoExistente.clusterId
    const cluster = await db.cluster.findUnique({ where: { id: clusterIdTarget } })

    if (cluster) {
      const nombreTarget = input.nombre || nodoExistente.nombre
      nueva_identity_key = generarIdentityKeyFinal(nombreTarget, cluster.nombre, id)
    }
  }

  return db.clusterNodo.update({
    where: { id },
    data: {
      clusterId: input.clusterId,
      nombre: input.nombre,
      nodoTipo: input.nodoTipo,
      rol: input.rol,
      estado: input.estado,

      maquinaId: input.maquinaId || null,
      servidorId: input.servidorId || null,

      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),

      identity_key: nueva_identity_key,
    },
  })
}

export const deleteClusterNodo = ({ id }) => {
  return db.clusterNodo.delete({
    where: { id },
  })
}

/* ============================================================
   4. RESOLVERS
============================================================ */
export const ClusterNodo = {
  cluster: (_obj, { root }) =>
    db.clusterNodo.findUnique({ where: { id: root.id } }).cluster(),

  maquina: (_obj, { root }) =>
    db.clusterNodo.findUnique({ where: { id: root.id } }).maquina(),

  servidor: (_obj, { root }) =>
    db.clusterNodo.findUnique({ where: { id: root.id } }).servidor(),

  creadoPor: (_obj, { root }) => {
    if (!root.usuario_creacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_creacion } })
  },

  modificadoPor: (_obj, { root }) => {
    if (!root.usuario_modificacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_modificacion } })
  },

  rolInfo: (_obj, { root }) => {
    if (!root.rol) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.rol,
        grupo: 'NODO_ROL',
      },
    })
  },
}

/* ============================================================
   5. QUERY RESOLVERS
============================================================ */
export const Query = {
  clusterNodos,
  clusterNodo,
  parametrosFormularioClusterNodo,
}
