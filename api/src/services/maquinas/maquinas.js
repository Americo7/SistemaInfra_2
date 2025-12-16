import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server' // <--- 1. IMPORTACIÓN AGREGADA

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
   2. QUERIES (Lectura de Datos)
============================================================ */

// Para la Tabla (Lista)
export const maquinas = () => {
  return db.maquina.findMany() 
}

// Para la Vista Detalle
export const maquina = ({ id }) => {
  return db.maquina.findUnique({
    where: { id },
  })
}


// Para obtener todos los parámetros necesarios del formulario de Máquina
export const parametrosFormularioMaquina = () => {
  return db.parametro.findMany({
    where: {
      grupo: {
        in: ['PLATAFORMA', 'ESTADO_OPERATIVO']
      },
      estado: 'ACTIVO'
    },
    orderBy: [{ grupo: 'asc' }, { nombre: 'asc' }]
  })
}

/* ============================================================
   3. MUTATIONS (Crear, Actualizar, Borrar)
============================================================ */

// NOTA: Se eliminó el segundo argumento { currentUser } de la función
export const createMaquina = async ({ input }) => {
  // 2. CORRECCIÓN: Se usa context.currentUser
  const currentUserId = context.currentUser?.id ?? 1 
  
  // Lógica 1: Generar key temporal
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
    
      // Conexión opcional a servidor
      ...(input.id_servidor && { servidores: { connect: { id: input.id_servidor } } }),
      
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
      proxmox_vmid: input.proxmox_vmid || null,

      identity_key: keyToSave,
    },
  })

  // Lógica 2: Actualizar key con el ID real si es manual
  let maquinaFinal = maquinaCreada

  if (keyToSave === generarIdentityKeyFinal(maquinaCreada.nombre, null)) {
    const identity_key_final = generarIdentityKeyFinal(maquinaCreada.nombre, maquinaCreada.id)

    maquinaFinal = await db.maquina.update({
      where: { id: maquinaCreada.id },
      data: { identity_key: identity_key_final },
    })
  }

  return maquinaFinal
}

// NOTA: Se eliminó el segundo argumento { currentUser } de la función
export const updateMaquina = async ({ id, input }) => {
  // 3. CORRECCIÓN: Se usa context.currentUser
  const currentUserId = context.currentUser?.id ?? 1 

  const maquinaExistente = await db.maquina.findUnique({ where: { id } })
  
  if (!maquinaExistente) {
    throw new Error(`Máquina con ID ${id} no encontrada.`)
  }
  
  // Lógica para recalcular identity_key si cambia el nombre
  let nueva_identity_key = maquinaExistente.identity_key
  const isManualKey = maquinaExistente.identity_key.startsWith('manual:')

  if (
    isManualKey &&
    input.nombre && 
    normalizarNombre(input.nombre) !== normalizarNombre(maquinaExistente.nombre)
  ) {
    nueva_identity_key = generarIdentityKeyFinal(input.nombre, id)
  }

  // Lógica para conectar/desconectar servidor
  let servidoresUpdate = {}
  if (input.id_servidor) {
    servidoresUpdate = { servidores: { connect: { id: input.id_servidor } } }
  } else if (input.id_servidor === null) {
     servidoresUpdate = { servidores: { disconnect: true } }
  }

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
      
      ...servidoresUpdate, 

      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),

      proxmox_vmid: input.proxmox_vmid || null,
      identity_key: nueva_identity_key,
    },
  })
}

export const deleteMaquina = ({ id }) => {
  return db.maquina.delete({
    where: { id },
  })
}


/* ============================================================
   4. RESOLVERS (El motor que conecta los datos)
============================================================ */
export const Maquina = {
  // --- Relaciones de Prisma (Lazy Loading) ---
  servidores: (_obj, { root }) => db.maquina.findUnique({ where: { id: root.id } }).servidores(),
  despliegue: (_obj, { root }) => db.maquina.findUnique({ where: { id: root.id } }).despliegue(),
  infra_afectada: (_obj, { root }) => db.maquina.findUnique({ where: { id: root.id } }).infra_afectada(),
  usuario_roles: (_obj, { root }) => db.maquina.findUnique({ where: { id: root.id } }).usuario_roles(),
  cluster_nodos: (_obj, { root }) => db.maquina.findUnique({ where: { id: root.id } }).cluster_nodos(),

  almacenamientoTotal: (_obj, { root }) => {
    if (!root.almacenamiento) return 0

    let discos = root.almacenamiento

    // Por si viene como string JSON desde la BD
    if (typeof discos === 'string') {
      try {
        discos = JSON.parse(discos)
      } catch {
        return 0
      }
    }

    if (!Array.isArray(discos)) return 0

    return discos.reduce((total, disco) => {
      return total + (Number(disco?.Valor) || 0)
    }, 0)
  },
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
  plataformaInfo: (_obj, { root }) => {
    if (!root.cod_plataforma) return null
    return db.parametro.findFirst({
      where: { 
        codigo: root.cod_plataforma,
        grupo: 'PLATAFORMA'
      }
    })
  },

  estadoOperativoInfo: (_obj, { root }) => {
    if (!root.estado_operativo) return null
    return db.parametro.findFirst({
      where: { 
        codigo: root.estado_operativo,
        grupo: 'ESTADO_OPERATIVO'
      }
    })
  },
}

/* ============================================================
   5. QUERY RESOLVERS (Permitir que GraphQL acceda a las queries)
============================================================ */
export const Query = {
  maquinas,
  maquina,
  parametrosFormularioMaquina,
}