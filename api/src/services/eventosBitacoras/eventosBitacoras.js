import { db } from 'src/lib/db'

export const eventosBitacoras = () => {
  return db.eventosBitacora.findMany()
}

export const eventosBitacora = ({ id }) => {
  return db.eventosBitacora.findUnique({
    where: { id },
  })
}

export const createEventosBitacora = ({ input }) => {
  return db.eventosBitacora.create({
    data: {
      id_evento: input.id_evento,
      fecha_creacion: new Date(),
      usuario_creacion: 1,
      estado_anterior: input.estado_anterior,
      estado_actual: input.estado_actual,
    },
  })
}

export const updateEventosBitacora = ({ id, input }) => {
  return db.eventosBitacora.update({
    data: {
      id_evento: input.id_evento,
      fecha_modificacion: new Date(),
      usuario_modificacion: 1,
      estado_anterior: input.estado_anterior,
      estado_actual: input.estado_actual,
    },
    where: { id },
  })
}

export const deleteEventosBitacora = ({ id }) => {
  return db.eventosBitacora.delete({
    where: { id },
  })
}

export const EventosBitacora = {
  eventos: (_obj, { root }) => {
    return db.eventosBitacora.findUnique({ where: { id: root?.id } }).eventos()
  },
}
