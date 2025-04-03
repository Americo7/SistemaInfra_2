export const schema = gql`
  type Servidor {
    id: Int!
    id_hardware: Int!
    serie_servidor: String!
    cod_inventario_agetic: String!
    chasis: String
    cuchilla: String
    ram: Int!
    almacenamiento: Int!
    estado_operativo: String!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    servidor_maquina: [ServidorMaquina]!
    hardware: Hardware!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    servidors: [Servidor!]! @requireAuth
    servidor(id: Int!): Servidor @requireAuth
  }

  input CreateServidorInput {
    id_hardware: Int!
    serie_servidor: String!
    cod_inventario_agetic: String!
    chasis: String
    cuchilla: String
    ram: Int!
    almacenamiento: Int!
    estado_operativo: String!
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateServidorInput {
    id_hardware: Int
    serie_servidor: String
    cod_inventario_agetic: String
    chasis: String
    cuchilla: String
    ram: Int
    almacenamiento: Int
    estado_operativo: String
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createServidor(input: CreateServidorInput!): Servidor! @requireAuth
    updateServidor(id: Int!, input: UpdateServidorInput!): Servidor!
      @requireAuth
    deleteServidor(id: Int!): Servidor! @requireAuth
  }
`
