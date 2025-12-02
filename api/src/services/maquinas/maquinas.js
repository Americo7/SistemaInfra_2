import { db } from 'src/lib/db'

/* ============================================================
   UTILIDADES PARA IDENTITY_KEY
============================================================ */
const normalizarNombre = (nombre) => {
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
  
  // Si tenemos el ID, generamos la clave final: manual:{nombre_slug}:{id}
  if (id) {
    return `manual:${slug}:${id}`
  }
  
  // Si no tenemos el ID (placeholder en la primera inserción), usamos: manual:{nombre_slug}:manual
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
   CORRECCIÓN: Se usa 'servidores: { connect: { id: ... } }' en lugar de 'id_servidor'.
   CORRECCIÓN: Se usa 'currentUser' para 'usuario_creacion'.
============================================================ */
export const createMaquina = async ({ input }, { currentUser }) => {
  // Asegura que el usuario logueado exista. (Asume que 'id' es el campo de auditoría)
  const currentUserId = currentUser?.id ?? 1 
  
  // 1. Crear la clave placeholder temporal (ej: manual:srv-web-01:manual)
  // Utilizamos el input.identity_key si viene (ej. de un proceso sincronizado)
  // Si viene vacío, generamos el placeholder manual.
  let keyToSave = input.identity_key?.trim() || ''
  if (!keyToSave) {
    keyToSave = generarIdentityKeyFinal(input.nombre, null)
  }

  // 2. Insertar en la DB para obtener el ID
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
      
      // Auditoría: Usar el usuario actual del contexto
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
      proxmox_vmid: input.proxmox_vmid || null,

      // Placeholder inicial
      identity_key: keyToSave,
    },
  })

  let maquinaFinal = maquinaCreada

  // 3. Si la clave inicial era el placeholder manual (o una cadena vacía), generamos la clave final y actualizamos
  if (keyToSave === generarIdentityKeyFinal(maquinaCreada.nombre, null)) {
    const identity_key_final = generarIdentityKeyFinal(maquinaCreada.nombre, maquinaCreada.id)

    // 4. Actualizar el registro con la clave final
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
   ACTUALIZAR MANUALMENTE
   CORRECCIÓN: Se usa 'servidores: { connect: { id: ... } }' en lugar de 'id_servidor'.
   CORRECCIÓN: Se usa 'currentUser' para 'usuario_modificacion'.
============================================================ */
export const updateMaquina = async ({ id, input }, { currentUser }) => {
  const currentUserId = currentUser?.id ?? 1 

  const maquinaExistente = await db.maquina.findUnique({ where: { id } })
  
  if (!maquinaExistente) {
    throw new Error(`Máquina con ID ${id} no encontrada.`)
  }
  
  let nueva_identity_key = maquinaExistente.identity_key

  // 1. Lógica de re-generación de identity_key (solo si no es clave externa)
  const isExternalSync = 
    maquinaExistente.identity_key.startsWith('proxmox:') || 
    maquinaExistente.identity_key.startsWith('sync:')

  // Si el nombre ha cambiado Y la clave no es de sincronización externa, la regeneramos.
  if (normalizarNombre(input.nombre) !== normalizarNombre(maquinaExistente.nombre) && !isExternalSync) {
    nueva_identity_key = generarIdentityKeyFinal(input.nombre, id)
  }

  // 2. Preparar datos de conexión al servidor (si id_servidor está presente)
  let servidoresUpdate = {}
  if (input.id_servidor) {
    // 🚨 CORRECCIÓN: Usar la sintaxis de conexión de Prisma
    servidoresUpdate = { servidores: { connect: { id: input.id_servidor } } }
  } else if (input.id_servidor === null) {
     // Permite desconectar si se pasa null explícitamente (si la relación lo permite)
     // Si la relación es obligatoria, esto fallará por otras validaciones.
     servidoresUpdate = { servidores: { disconnect: true } }
  }


  // 3. Actualizar el registro
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
      
      ...servidoresUpdate, // Aplicar la corrección de conexión

      // Auditoría: Usar el usuario actual del contexto
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),

      proxmox_vmid: input.proxmox_vmid || null,

      // Clave actualizada o mantenida
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
  // ... (código sin cambios)
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