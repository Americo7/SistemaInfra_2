import { db } from 'src/lib/db'

/* ============================================================
   UTILIDADES PARA IDENTITY_KEY
============================================================ */
const normalizarNombre = (nombre) => {
  // Validación de seguridad por si acaso llega null/undefined aquí también
  if (!nombre) return '' 
  return nombre.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

/**
 * Genera la clave de identidad final o el placeholder con prefijo 'manual:'.
 * @param {string} nombre Nombre de la VM.
 * @param {number} id ID de la máquina en la DB (opcional, solo en Edición o después de crear).
 * @returns {string} Clave de identidad en formato manual:{slug}:{id|manual}.
 */
const generarIdentityKeyFinal = (nombre, id) => {
  const slug = normalizarNombre(nombre)
  
  if (id) {
    return `manual:${slug}:${id}`
  }
  
  return `manual:${slug}:manual`
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
export const createMaquina = async ({ input }, { currentUser }) => {
  const currentUserId = currentUser?.id ?? 1 
  
  let keyToSave = input.identity_key?.trim() || ''
  if (!keyToSave) {
    keyToSave = generarIdentityKeyFinal(input.nombre, null)
  }

  const maquinaCreada = await db.maquina.create({
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
    
      ...(input.id_servidor && { servidores: { connect: { id: input.id_servidor } } }),
      
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
      proxmox_vmid: input.proxmox_vmid || null,

      identity_key: keyToSave,
    },
  })

  let maquinaFinal = maquinaCreada

  if (keyToSave === generarIdentityKeyFinal(maquinaCreada.nombre, null)) {
    const identity_key_final = generarIdentityKeyFinal(maquinaCreada.nombre, maquinaCreada.id)

    maquinaFinal = await db.maquina.update({
      where: { id: maquinaCreada.id },
      data: { identity_key: identity_key_final },
      include: { 
        servidores: true,
        cluster_nodos: true,
      },
    })
  }

  return maquinaFinal
}

/* ============================================================
   ACTUALIZAR MANUALMENTE (CORREGIDO)
============================================================ */
export const updateMaquina = async ({ id, input }, { currentUser }) => {
  const currentUserId = currentUser?.id ?? 1 

  const maquinaExistente = await db.maquina.findUnique({ where: { id } })
  
  if (!maquinaExistente) {
    throw new Error(`Máquina con ID ${id} no encontrada.`)
  }
  
  let nueva_identity_key = maquinaExistente.identity_key

  // 1. Lógica de re-generación de identity_key
  const isExternalSync = 
    maquinaExistente.identity_key.startsWith('proxmox:') || 
    maquinaExistente.identity_key.startsWith('sync:')

  // ✅ CORRECCIÓN PRINCIPAL AQUÍ:
  // Verificamos "input.nombre &&" antes de intentar normalizarlo.
  // Si input.nombre es undefined (como en el Soft Delete), saltamos esta lógica.
  if (
    input.nombre && 
    normalizarNombre(input.nombre) !== normalizarNombre(maquinaExistente.nombre) && 
    !isExternalSync
  ) {
    nueva_identity_key = generarIdentityKeyFinal(input.nombre, id)
  }

  // 2. Preparar datos de conexión al servidor
  let servidoresUpdate = {}
  if (input.id_servidor) {
    servidoresUpdate = { servidores: { connect: { id: input.id_servidor } } }
  } else if (input.id_servidor === null) {
     servidoresUpdate = { servidores: { disconnect: true } }
  }

  // 3. Actualizar el registro
  return db.maquina.update({
    where: { id },
    data: {
      // Prisma ignora automáticamente los campos que vienen como undefined
      nombre: input.nombre, 
      ip: input.ip,
      so: input.so,
      ram: input.ram,
      almacenamiento: input.almacenamiento,
      estado_operativo: input.estado_operativo,
      cpu: input.cpu,
      cod_plataforma: input.cod_plataforma,
      estado: input.estado,
      
      ...servidoresUpdate, 

      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),

      proxmox_vmid: input.proxmox_vmid || null,

      identity_key: nueva_identity_key,
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
   RESOLVERS
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