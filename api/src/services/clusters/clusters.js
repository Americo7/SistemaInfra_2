import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

/* ============================================================
   1. UTILIDADES INTERNAS (Identity Key)
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
   2. VALIDACIÓN
============================================================ */
const validarEndpointUnico = (input) => {
  if (input.id_proxmox_endpoint && input.id_k8s_endpoint) {
    throw new Error(
      'Un cluster solo puede tener un endpoint de Proxmox o uno de K8s, no ambos.'
    )
  }
}

/* ============================================================
   3. QUERIES (Lectura de Datos)
============================================================ */

// Para la Tabla (Lista)
export const clusters = () => {
  return db.cluster.findMany({
    orderBy: { nombre: 'asc' },
  })
}

// Para la Vista Detalle
export const cluster = ({ id }) => {
  return db.cluster.findUnique({
    where: { id },
  })
}

// Para obtener todos los parámetros necesarios del formulario de Cluster
export const parametrosFormularioCluster = () => {
  return db.parametro.findMany({
    where: {
      grupo: {
        in: ['TIPO_CLUSTER']
      },
      estado: 'ACTIVO'
    },
    orderBy: [{ grupo: 'asc' }, { nombre: 'asc' }]
  })
}

/* ============================================================
   4. MUTATIONS (Crear, Actualizar, Borrar)
============================================================ */
export const createCluster = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  validarEndpointUnico(input)

  // Lógica 1: Generar key temporal
  let keyToSave = input.identity_key?.trim() || ''
  if (!keyToSave) {
    keyToSave = generarIdentityKeyFinal(input.nombre, null)
  }

  const clusterCreado = await db.cluster.create({
    data: {
      nombre: input.nombre,
      cod_tipo_cluster: input.cod_tipo_cluster,
      descripcion: input.descripcion,
      estado: input.estado,

      id_proxmox_endpoint: input.id_proxmox_endpoint || null,
      id_k8s_endpoint: input.id_k8s_endpoint || null,

      identity_key: keyToSave,

      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
    },
  })

  // Lógica 2: Actualizar key con el ID real si es manual
  let clusterFinal = clusterCreado

  if (keyToSave === generarIdentityKeyFinal(clusterCreado.nombre, null)) {
    const identity_key_final = generarIdentityKeyFinal(clusterCreado.nombre, clusterCreado.id)

    clusterFinal = await db.cluster.update({
      where: { id: clusterCreado.id },
      data: { identity_key: identity_key_final },
    })
  }

  return clusterFinal
}

export const updateCluster = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  const clusterExistente = await db.cluster.findUnique({ where: { id } })

  if (!clusterExistente) {
    throw new Error(`Cluster con ID ${id} no encontrado.`)
  }

  validarEndpointUnico(input)

  // Lógica para recalcular identity_key si cambia el nombre
  // Solo si identity_key comienza con "manual:"
  let nueva_identity_key = clusterExistente.identity_key
  const isManualKey = clusterExistente.identity_key.startsWith('manual:')

  if (
    isManualKey &&
    input.nombre &&
    normalizarNombre(input.nombre) !== normalizarNombre(clusterExistente.nombre)
  ) {
    nueva_identity_key = generarIdentityKeyFinal(input.nombre, id)
  }

  return db.cluster.update({
    where: { id },
    data: {
      nombre: input.nombre,
      cod_tipo_cluster: input.cod_tipo_cluster,
      descripcion: input.descripcion,
      estado: input.estado,

      id_proxmox_endpoint:
        input.id_proxmox_endpoint !== undefined
          ? input.id_proxmox_endpoint
          : undefined,
      id_k8s_endpoint:
        input.id_k8s_endpoint !== undefined
          ? input.id_k8s_endpoint
          : undefined,

      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),

      identity_key: nueva_identity_key,
    },
  })
}

export const deleteCluster = ({ id }) => {
  return db.cluster.delete({ where: { id } })
}

/* ============================================================
   5. RESOLVERS (El motor que conecta los datos)
============================================================ */
export const Cluster = {
  // --- Relaciones de Prisma (Lazy Loading) ---
  proxmox_endpoint: (_obj, { root }) =>
    db.cluster.findUnique({ where: { id: root.id } }).proxmox_endpoint(),

  k8s_endpoint: (_obj, { root }) =>
    db.cluster.findUnique({ where: { id: root.id } }).k8s_endpoint(),

  cluster_nodos: (_obj, { root }) =>
    db.cluster.findUnique({ where: { id: root.id } }).cluster_nodos(),

  // --- Relaciones Calculadas: USUARIOS ---
  creadoPor: (_obj, { root }) => {
    if (!root.usuario_creacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_creacion } })
  },

  modificadoPor: (_obj, { root }) => {
    if (!root.usuario_modificacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_modificacion } })
  },

  // --- Relaciones Calculadas: PARÁMETROS ---
  tipoClusterInfo: (_obj, { root }) => {
    if (!root.cod_tipo_cluster) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.cod_tipo_cluster,
        grupo: 'TIPO_CLUSTER' // Ej: "PROXMOX", "KUBERNETES"
      }
    })
  },
}

/* ============================================================
   5. QUERY RESOLVERS (Permitir que GraphQL acceda a las queries)
============================================================ */
export const Query = {
  clusters,
  cluster,
  parametrosFormularioCluster,
}
