import { db } from 'src/lib/db'

export const eventos = () => {
  return db.evento.findMany()
}

export const evento = ({ id }) => {
  return db.evento.findUnique({
    where: { id },
  })
}

export const createEvento = async ({ input }) => {
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
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion || context.currentUser?.id || 1,
    }
  })
}
export const updateEvento = ({ id, input }) => {

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
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
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
}
