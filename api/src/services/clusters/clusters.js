import { db } from 'src/lib/db'

/* ============================================
   Validación: Solo Proxmox o solo K8s
============================================ */
const validarEndpointUnico = (input) => {
  if (input.id_proxmox_endpoint && input.id_k8s_endpoint) {
    throw new Error(
      'Un cluster solo puede tener un endpoint de Proxmox o uno de K8s, no ambos.'
    )
  }
}

/* ============================================
   LISTA SIMPLE
============================================ */
export const clusters = () => {
  return db.cluster.findMany({
    include: {
      proxmox_endpoint: true,
      k8s_endpoint: true,
    },
  })
}

/* ============================================
   DETALLE SIMPLE
============================================ */
export const cluster = ({ id }) => {
  return db.cluster.findUnique({
    where: { id },
    include: {
      proxmox_endpoint: true,
      k8s_endpoint: true,
    },
  })
}

/* ============================================
   DETALLE COMPLETO SEGÚN TIPO DE CLUSTER
============================================ */
export const clusterCompleto = async ({ id }) => {
  const cl = await db.cluster.findUnique({
    where: { id },
    include: {
      proxmox_endpoint: true,
      k8s_endpoint: true,
    },
  })

  if (!cl) return null

  /* ------------------------------
     CASO PROXMOX
     cluster -> clusterNodo -> servidor -> máquinas
  ------------------------------ */
  if (cl.id_proxmox_endpoint) {
    return await db.cluster.findUnique({
      where: { id },
      include: {
        proxmox_endpoint: true,
        cluster_nodos: {
          include: {
            servidor: {
              include: {
                maquinas: true,
              },
            },
            // máquina NO VA en nodos Proxmox
            maquina: false,
          },
        },
      },
    })
  }

  /* ------------------------------
     CASO K8s
     cluster -> clusterNodo -> máquina
  ------------------------------ */
  if (cl.id_k8s_endpoint) {
    return await db.cluster.findUnique({
      where: { id },
      include: {
        k8s_endpoint: true,
        cluster_nodos: {
          include: {
            maquina: true,
            // servidor NO VA en K8s
            servidor: false,
          },
        },
      },
    })
  }

  return cl
}

/* ============================================
   CREAR
============================================ */
export const createCluster = ({ input }) => {
  validarEndpointUnico(input)

  return db.cluster.create({
    data: {
      nombre: input.nombre,
      cod_tipo_cluster: input.cod_tipo_cluster,
      descripcion: input.descripcion,
      estado: input.estado,
      usuario_creacion: input.usuario_creacion,
      fecha_creacion: new Date(),

      id_proxmox_endpoint: input.id_proxmox_endpoint || null,
      id_k8s_endpoint: input.id_k8s_endpoint || null,
    },
  })
}

/* ============================================
   ACTUALIZAR
============================================ */
export const updateCluster = ({ id, input }) => {
  validarEndpointUnico(input)

  return db.cluster.update({
    where: { id },
    data: {
      nombre: input.nombre,
      cod_tipo_cluster: input.cod_tipo_cluster,
      descripcion: input.descripcion,
      estado: input.estado,

      usuario_modificacion: input.usuario_modificacion,
      fecha_modificacion: new Date(),

      id_proxmox_endpoint:
        input.id_proxmox_endpoint !== undefined
          ? input.id_proxmox_endpoint
          : undefined,

      id_k8s_endpoint:
        input.id_k8s_endpoint !== undefined
          ? input.id_k8s_endpoint
          : undefined,
    },
  })
}

/* ============================================
   ELIMINAR
============================================ */
export const deleteCluster = ({ id }) => {
  return db.cluster.delete({
    where: { id },
  })
}

/* ============================================
   RELACIONADOR
============================================ */
export const Cluster = {
  proxmox_endpoint: (_obj, { root }) =>
    db.cluster.findUnique({ where: { id: root.id } }).proxmox_endpoint(),

  k8s_endpoint: (_obj, { root }) =>
    db.cluster.findUnique({ where: { id: root.id } }).k8s_endpoint(),

  cluster_nodos: (_obj, { root }) =>
    db.cluster.findUnique({ where: { id: root.id } }).cluster_nodos(),
}
