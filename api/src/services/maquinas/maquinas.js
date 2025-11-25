import { db } from 'src/lib/db'

export const maquinas = () => {
  return db.maquina.findMany({
    include: {
      servidores: true,
      cluster_nodos: true,
    },
  })
}

export const maquina = ({ id }) => {
  return db.maquina.findUnique({
    where: { id },
    include: {
      servidores: true,
      cluster_nodos: true, // Incluir nodos también en el detalle simple
    },
  })
}

export const createMaquina = ({ input }) => {
  return db.maquina.create({
    data: {
      nombre: input.nombre,
      ip: input.ip,
      so: input.so,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      cpu: input.cpu,
      cod_plataforma: input.cod_plataforma,
      estado: input.estado,
      id_servidor: input.id_servidor,
      usuario_creacion: input.usuario_creacion,
      fecha_creacion: new Date(),
      uuid: input.uuid,
      proxmox_vmid: input.proxmox_vmid,
      mac_address: input.mac_address,
    },
  })
}

export const updateMaquina = ({ id, input }) => {
  return db.maquina.update({
    where: { id },
    data: {
      nombre: input.nombre,
      ip: input.ip,
      so: input.so,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      cpu: input.cpu,
      cod_plataforma: input.cod_plataforma,
      estado: input.estado,
      id_servidor: input.id_servidor,
      usuario_modificacion: input.usuario_modificacion,
      fecha_modificacion: new Date(),

      // ✔ CAMPOS DE SINCRONIZACIÓN
      uuid: input.uuid,
      proxmox_vmid: input.proxmox_vmid,
      mac_address: input.mac_address,
    },
  })
}

export const deleteMaquina = ({ id }) => {
  return db.maquina.delete({
    where: { id },
  })
}

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
      infra_afectada: true,
    },
  })
}

export const Maquina = {
  servidores: (_obj, { root }) => {
    return db.maquina.findUnique({ where: { id: root.id } }).servidores()
  },
  despliegue: (_obj, { root }) => {
    return db.maquina.findUnique({ where: { id: root.id } }).despliegue()
  },
  infra_afectada: (_obj, { root }) => {
    return db.maquina.findUnique({ where: { id: root.id } }).infra_afectada()
  },
  usuario_roles: (_obj, { root }) => {
    return db.maquina.findUnique({ where: { id: root.id } }).usuario_roles()
  },
  cluster_nodos: (_obj, { root }) => {
    return db.maquina.findUnique({ where: { id: root.id } }).cluster_nodos()
  },
}