export const schema = gql`
  type Evento {
    id: Int!
    cod_tipo_evento: String!
    descripcion: String!
    fecha_evento: DateTime!
    responsables: [Int]!
    estado_evento: String!
    respaldo: JSON
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    eventos_bitacora: [EventosBitacora]!
    infra_afectada: [InfraAfectada]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    eventos: [Evento!]! @requireAuth
    evento(id: Int!): Evento @requireAuth
  }

  input CreateEventoInput {
    cod_tipo_evento: String!
    descripcion: String!
    fecha_evento: DateTime!
    responsables: [Int]!
    estado_evento: String!
    respaldo: JSON
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateEventoInput {
    cod_tipo_evento: String
    descripcion: String
    fecha_evento: DateTime
    responsables: [Int]!
    estado_evento: String
    respaldo: JSON
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createEvento(input: CreateEventoInput!): Evento! @requireAuth
    updateEvento(id: Int!, input: UpdateEventoInput!): Evento! @requireAuth
    deleteEvento(id: Int!): Evento! @requireAuth
  }
`
