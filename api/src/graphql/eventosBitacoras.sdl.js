export const schema = gql`
  type EventosBitacora {
    id: Int!
    id_evento: Int!
    descripcion: String!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    estado_anterior: String!
    estado_actual: String!
    eventos: Evento!
  }

  type Query {
    eventosBitacoras: [EventosBitacora!]! @requireAuth
    eventosBitacora(id: Int!): EventosBitacora @requireAuth
  }

  input CreateEventosBitacoraInput {
    id_evento: Int!
    descripcion: String!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    estado_anterior: String!
    estado_actual: String!
  }

  input UpdateEventosBitacoraInput {
    id_evento: Int
    descripcion: String
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    estado_anterior: String
    estado_actual: String
  }

  type Mutation {
    createEventosBitacora(input: CreateEventosBitacoraInput!): EventosBitacora!
      @requireAuth
    updateEventosBitacora(
      id: Int!
      input: UpdateEventosBitacoraInput!
    ): EventosBitacora! @requireAuth
    deleteEventosBitacora(id: Int!): EventosBitacora! @requireAuth
  }
`
