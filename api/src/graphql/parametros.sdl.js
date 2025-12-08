export const schema = gql`
  type Parametro {
    id: Int!
    codigo: String!
    nombre: String!
    grupo: String!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    descripcion: String

    creadoPor: Usuario
    modificadoPor: Usuario
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    parametros(grupo: [String]): [Parametro!]! @requireAuth
    parametro(id: Int!): Parametro @requireAuth
    parametroByCodigo(codigo: String!): Parametro @requireAuth
  }

  input CreateParametroInput {
    codigo: String!
    nombre: String!
    grupo: String!
    estado: estado!
    descripcion: String
  }

  input UpdateParametroInput {
    codigo: String
    nombre: String
    grupo: String
    estado: estado
    descripcion: String
  }

  type Mutation {
    createParametro(input: CreateParametroInput!): Parametro! @requireAuth
    updateParametro(id: Int!, input: UpdateParametroInput!): Parametro! @requireAuth
    deleteParametro(id: Int!): Parametro! @requireAuth
  }
`