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
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    # ✔ CORRECCIÓN: Permite el argumento 'grupo' como array de Strings (nullable)
    parametros(grupo: [String]): [Parametro!]! @requireAuth

    parametro(id: Int!): Parametro @requireAuth
    parametroByCodigo(codigo: String!): Parametro @requireAuth

    # ❌ ELIMINADA: La consulta parametroByGrupo ya no es necesaria aquí
  }

  input CreateParametroInput {
    codigo: String!
    nombre: String!
    grupo: String!
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    descripcion: String
  }

  input UpdateParametroInput {
    codigo: String
    nombre: String
    grupo: String
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    descripcion: String
  }

  type Mutation {
    createParametro(input: CreateParametroInput!): Parametro! @requireAuth
    updateParametro(id: Int!, input: UpdateParametroInput!): Parametro! @requireAuth
    deleteParametro(id: Int!): Parametro! @requireAuth
  }
`