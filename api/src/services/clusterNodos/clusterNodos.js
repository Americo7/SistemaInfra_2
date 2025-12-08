import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

/* ============================================================
   1. UTILIDADES INTERNAS (Identity Key)
============================================================ */
const normalizarNombre = (nombre) => {
  if (!nombre) return '' 
  return nombre.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

// Adaptado para recibir nombre del nodo y nombre del cluster
const generarIdentityKeyFinal = (nombreNodo, nombreCluster, id) => {
  const nodoSlug = normalizarNombre(nombreNodo)
  const clusterSlug = normalizarNombre(nombreCluster)
  
  if (id) {
    return `manual:cluster-nodo:${clusterSlug}:${nodoSlug}:${id}`
  }
  return `manual:cluster-nodo:${clusterSlug}:${nodoSlug}:manual`
}


/* ============================================================
   2. QUERIES (Lectura de Datos)
============================================================ */

// Para la Tabla (Lista)
export const clusterNodos = () => {
  return db.clusterNodo.findMany({
    orderBy: { nombre: 'asc' },
  })
}

// Para la Vista Detalle
export const clusterNodo = ({ id }) => {
  return db.clusterNodo.findUnique({
    where: { id },
  })
}

// Para obtener todos los parámetros necesarios del formulario de ClusterNodo
export const parametrosFormularioClusterNodo = () => {
  return db.parametro.findMany({
    where: {
      grupo: {
        // AGREGAMOS 'TIPO_CLUSTER' AQUÍ:
        in: ['NODO_ROL', 'TIPO_CLUSTER'] 
      },
      estado: 'ACTIVO'
    },
    orderBy: [{ grupo: 'asc' }, { nombre: 'asc' }]
  })
}

/* ============================================================
   3. MUTATIONS (Crear, Actualizar, Borrar)
============================================================ */

export const createClusterNodo = async ({ input }) => {
  // CORRECCIÓN: Se usa context.currentUser
  const currentUserId = context.currentUser?.id ?? 1 

  // Paso extra necesario en ClusterNodo: Obtener el nombre del Cluster para la key
  const cluster = await db.cluster.findUnique({
    where: { id: input.clusterId },
  })
  
  if (!cluster) {
    throw new Error(`Cluster con ID ${input.clusterId} no encontrado.`)
  }

  // Lógica 1: Generar key temporal
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

      // Manejo de nulos para relaciones opcionales
      maquinaId: input.maquinaId || null,
      servidorId: input.servidorId || null,

      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
      
      identity_key: keyToSave,
    },
  })

  // Lógica 2: Actualizar key con el ID real si es manual
  let nodoFinal = nodoCreado

  if (keyToSave === generarIdentityKeyFinal(nodoCreado.nombre, cluster.nombre, null)) {
    const identity_key_final = generarIdentityKeyFinal(nodoCreado.nombre, cluster.nombre, nodoCreado.id)

    nodoFinal = await db.clusterNodo.update({
      where: { id: nodoCreado.id },
      data: { identity_key: identity_key_final },
    })
  }

  return nodoFinal
}

export const updateClusterNodo = async ({ id, input }) => {
  // CORRECCIÓN: Se usa context.currentUser
  const currentUserId = context.currentUser?.id ?? 1 

  const nodoExistente = await db.clusterNodo.findUnique({ where: { id } })

  if (!nodoExistente) {
    throw new Error(`Nodo con ID ${id} no encontrado.`)
  }

  // --- BLOQUEO DE SEGURIDAD (Mantenido de tu lógica anterior) ---
  // Si no es manual, no permitimos editar.
  if (!nodoExistente.identity_key || !nodoExistente.identity_key.startsWith('manual:')) {
    throw new Error('ACCIÓN DENEGADA: Este nodo es gestionado por el sistema.')
  }

  // Lógica para recalcular identity_key si cambia el nombre o el cluster
  let nueva_identity_key = nodoExistente.identity_key
  const isManualKey = nodoExistente.identity_key.startsWith('manual:')
  
  // Detectar cambios
  const cambioNombre = input.nombre && normalizarNombre(input.nombre) !== normalizarNombre(nodoExistente.nombre)
  const cambioCluster = input.clusterId && input.clusterId !== nodoExistente.clusterId

  if (isManualKey && (cambioNombre || cambioCluster)) {
    // Necesitamos el nombre del cluster (nuevo o actual)
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
   4. RESOLVERS (El motor que conecta los datos)
============================================================ */
export const ClusterNodo = {
  // --- Relaciones de Prisma (Lazy Loading) ---
  cluster: (_obj, { root }) => db.clusterNodo.findUnique({ where: { id: root.id } }).cluster(),
  maquina: (_obj, { root }) => db.clusterNodo.findUnique({ where: { id: root.id } }).maquina(),
  servidor: (_obj, { root }) => db.clusterNodo.findUnique({ where: { id: root.id } }).servidor(),

  // --- Relaciones Calculadas: USUARIOS ---
  creadoPor: (_obj, { root }) => {
    if (!root.usuario_creacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_creacion } })
  },

  modificadoPor: (_obj, { root }) => {
    if (!root.usuario_modificacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_modificacion } })
  },

  // --- Relaciones Calculadas: PARAMETROS ---
  rolInfo: (_obj, { root }) => {
    if (!root.rol) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.rol,
        grupo: 'NODO_ROL'
      }
    })
  },
}

/* ============================================================
   5. QUERY RESOLVERS (Permitir que GraphQL acceda a las queries)
============================================================ */
export const Query = {
  clusterNodos,
  clusterNodo,
  parametrosFormularioClusterNodo,
}