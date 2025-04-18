export const schema = gql`
  type Entidad {
    id: Int!
    codigo: String!
    sigla: String!
    nombre: String!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    sistemas: [Sistema]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    entidads: [Entidad!]! @requireAuth
    entidad(id: Int!): Entidad @requireAuth
  }

  input CreateEntidadInput {
    codigo: String!
    sigla: String!
    nombre: String!
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateEntidadInput {
    codigo: String
    sigla: String
    nombre: String
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createEntidad(input: CreateEntidadInput!): Entidad! @requireAuth
    updateEntidad(id: Int!, input: UpdateEntidadInput!): Entidad! @requireAuth
    deleteEntidad(id: Int!): Entidad! @requireAuth
  }
`
