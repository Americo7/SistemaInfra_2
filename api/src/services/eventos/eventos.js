import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const eventos = () => {
  return db.evento.findMany({
    orderBy: { fecha_evento: 'desc' },
  })
}

export const evento = ({ id }) => {
  return db.evento.findUnique({
    where: { id },
  })
}

export const parametrosFormularioEvento = () => {
  return db.parametro.findMany({
    where: {
      grupo: {
        in: ['TIPO_EVENTO', 'ESTADO_EVENTO', 'EVENTO']
      },
      estado: 'ACTIVO'
    },
    orderBy: [{ grupo: 'asc' }, { nombre: 'asc' }]
  })
}

export const createEvento = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  // 1. Validar que el tipo de evento exista
  const tipoEvento = await db.parametro.findUnique({
    where: { codigo: input.cod_tipo_evento }
  })
  if (!tipoEvento) {
    throw new Error('Tipo de evento no válido')
  }

  // 2. Buscar el último evento del mismo tipo
  const ultimoEvento = await db.evento.findFirst({
    where: {
      cod_tipo_evento: input.cod_tipo_evento,
      cod_evento: {
        startsWith: input.cod_tipo_evento,
        not: null
      }
    },
    orderBy: { cod_evento: 'desc' }
  })

  // 3. Generar el nuevo código
  let nuevoNumero = 1
  if (ultimoEvento?.cod_evento) {
    const partes = ultimoEvento.cod_evento.split('-')
    if (partes.length === 2) {
      const ultimoNumero = parseInt(partes[1], 10)
      if (!isNaN(ultimoNumero)) {
        nuevoNumero = ultimoNumero + 1
      }
    }
  }

  const nuevoCodigo = `${input.cod_tipo_evento}-${nuevoNumero.toString().padStart(3, '0')}`

  // 4. Verificar que el código no exista (usando findFirst)
  const codigoExistente = await db.evento.findFirst({
    where: { cod_evento: nuevoCodigo }
  })
  if (codigoExistente) {
    throw new Error(`El código ${nuevoCodigo} ya existe`)
  }

  // 5. Crear el evento
  return db.evento.create({
    data: {
      cod_evento: nuevoCodigo,
      cod_tipo_evento: input.cod_tipo_evento,
      descripcion: input.descripcion,
      fecha_evento: input.fecha_evento,
      responsables: input.responsables,
      estado_evento: input.estado_evento,
      cite: input.cite,
      solicitante: input.solicitante,
      estado: input.estado || 'ACTIVO',
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
    }
  })
}

export const updateEvento = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.evento.update({
    data: {
      cod_evento: input.cod_evento,
      cod_tipo_evento: input.cod_tipo_evento,
      descripcion: input.descripcion,
      fecha_evento: input.fecha_evento,
      responsables: input.responsables,
      estado_evento: input.estado_evento,
      cite: input.cite,
      solicitante: input.solicitante,
      estado: input.estado,
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),
    },
    where: { id },
  })
}

export const deleteEvento = ({ id }) => {
  return db.evento.delete({
    where: { id },
  })
}

export const Evento = {
  eventos_bitacora: (_obj, { root }) => {
    return db.evento.findUnique({ where: { id: root?.id } }).eventos_bitacora()
  },
  infra_afectada: (_obj, { root }) => {
    return db.evento.findUnique({ where: { id: root?.id } }).infra_afectada()
  },

  creadoPor: (_obj, { root }) => {
    if (!root.usuario_creacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_creacion } })
  },

  modificadoPor: (_obj, { root }) => {
    if (!root.usuario_modificacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_modificacion } })
  },

  tipoEventoInfo: (_obj, { root }) => {
    if (!root.cod_tipo_evento) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.cod_tipo_evento,
        grupo: 'TIPO_EVENTO'
      }
    })
  },

  estadoEventoInfo: (_obj, { root }) => {
    if (!root.estado_evento) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.estado_evento,
        grupo: 'ESTADO_EVENTO'
      }
    })
  },
  EventoInfo: (_obj, { root }) => {
    if (!root.evento) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.evento,
        grupo: 'EVENTO'
      }
    })
  },
}

/* ============================================================
   QUERY RESOLVERS (Permitir que GraphQL acceda a las queries)
============================================================ */
export const Query = {
  eventos,
  evento,
  parametrosFormularioEvento,
}
