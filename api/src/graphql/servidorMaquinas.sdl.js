export const schema = gql`
  type ServidorMaquina {
    id: Int!
    id_servidor: Int!
    id_maquina: Int!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    maquinas: Maquina!
    servidores: Servidor!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    servidorMaquinas: [ServidorMaquina!]! @requireAuth
    servidorMaquina(id: Int!): ServidorMaquina @requireAuth
  }

  input CreateServidorMaquinaInput {
    id_servidor: Int!
    id_maquina: Int!
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateServidorMaquinaInput {
    id_servidor: Int
    id_maquina: Int
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createServidorMaquina(input: CreateServidorMaquinaInput!): ServidorMaquina!
      @requireAuth
    updateServidorMaquina(
      id: Int!
      input: UpdateServidorMaquinaInput!
    ): ServidorMaquina! @requireAuth
    deleteServidorMaquina(id: Int!): ServidorMaquina! @requireAuth
  }
`
