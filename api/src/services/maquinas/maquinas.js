import { db } from 'src/lib/db'

/* ============================================================
   GENERADOR UNIVERSAL DE IDENTITY_KEY (USO MANUAL)
============================================================ */
const generarIdentityKeyMaquina = (input) => {
  // Si viene uuid y vmid (caso manual pero similar a proxmox)
  if (input.uuid && input.proxmox_vmid) {
    return `manual:proxmox:${input.proxmox_vmid}:${input.uuid.toLowerCase()}`
  }

  // Caso K8s manual
  if (input.uuid && input.cod_plataforma === 'K8S') {
    return `manual:k8s:${input.uuid.toLowerCase()}`
  }

  // Caso 100% manual
  const slug = input.nombre.trim().toLowerCase().replace(/\s+/g, '-')
  return `manual:maquina:${slug}`
}

/* ============================================================
   LISTA
============================================================ */
export const maquinas = () => {
  return db.maquina.findMany({
    include: {
      servidores: true,
    },
  })
}

/* ============================================================
   DETALLE SIMPLE
============================================================ */
export const maquina = ({ id }) => {
  return db.maquina.findUnique({
    where: { id },
    include: {
      servidores: true,
      cluster_nodos: true,
    },
  })
}

/* ============================================================
   CREAR MANUALMENTE
============================================================ */
export const createMaquina = ({ input }) => {
  const identity_key = generarIdentityKeyMaquina(input)

  return db.maquina.create({
    data: {
      nombre: input.nombre,
      ip: input.ip,
      so: input.so,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      estado_operativo: input.estado_operativo,
      cpu: input.cpu,
      cod_plataforma: input.cod_plataforma,
      estado: input.estado,
      id_servidor: input.id_servidor,
      usuario_creacion: input.usuario_creacion,
      fecha_creacion: new Date(),

      // Sincronización manual opcional
      uuid: input.uuid || null,
      proxmox_vmid: input.proxmox_vmid || null,

      // Generado automáticamente
      identity_key,
    },
  })
}

/* ============================================================
   ACTUALIZAR MANUALMENTE
============================================================ */
export const updateMaquina = ({ id, input }) => {

  return db.maquina.update({
    where: { id },
    data: {
      nombre: input.nombre,
      ip: input.ip,
      so: input.so,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      estado_operativo: input.estado_operativo,
      cpu: input.cpu,
      cod_plataforma: input.cod_plataforma,
      estado: input.estado,
      id_servidor: input.id_servidor,
      usuario_modificacion: input.usuario_modificacion,
      fecha_modificacion: new Date(),

      uuid: input.uuid || null,
      proxmox_vmid: input.proxmox_vmid || null,
    },
  })
}

/* ============================================================
   ELIMINAR
============================================================ */
export const deleteMaquina = ({ id }) => {
  return db.maquina.delete({
    where: { id },
  })
}

/* ============================================================
   DETALLE COMPLETO
============================================================ */
export const maquinaCompleta = ({ id }) => {
  return db.maquina.findUnique({
    where: { id },
    include: {
      servidores: {
        include: {
          data_centers: true,
          cluster_nodos: {
            include: {
              cluster: true,
            },
          },
        },
      },

      cluster_nodos: {
        include: {
          cluster: true,
          servidor: {
            include: { data_centers: true },
          },
        },
      },

      usuario_roles: {
        include: {
          usuarios: true,
          roles: true,
        },
      },

      despliegue: {
        include: {
          componentes: {
            include: {
              sistemas: {
                include: {
                  componentes: true,
                },
              },
            },
          },
        },
      },

      infra_afectada: {
        include: {
          eventos: true,
        },
      },
    },
  })
}

/* ============================================================
   RESOLVERS (Lazy Loading)
============================================================ */
export const Maquina = {
  servidores: (_obj, { root }) =>
    db.maquina.findUnique({ where: { id: root.id } }).servidores(),

  despliegue: (_obj, { root }) =>
    db.maquina.findUnique({ where: { id: root.id } }).despliegue(),

  infra_afectada: (_obj, { root }) =>
    db.maquina.findUnique({ where: { id: root.id } }).infra_afectada(),

  usuario_roles: (_obj, { root }) =>
    db.maquina.findUnique({ where: { id: root.id } }).usuario_roles(),

  cluster_nodos: (_obj, { root }) =>
    db.maquina.findUnique({ where: { id: root.id } }).cluster_nodos(),
}
