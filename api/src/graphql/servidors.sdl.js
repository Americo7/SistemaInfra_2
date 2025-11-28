export const schema = gql`
  type Servidor {
    id: Int!
    id_data_center: Int
    id_padre: Int
    nombre: String!
    cod_inventario_agetic: String
    cod_tipo_servidor: String
    serie: String
    marca: String
    modelo: String
    ram: Int
    almacenamiento: Int
    ip_primaria: String
    sistema_operativo: String
    estado_operativo: String!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    identity_key:  String!
    data_centers: DataCenter
    servidores_padre: Servidor
    servidores_hijos: [Servidor!]!
    maquinas: [Maquina!]!
    cluster_nodos: [ClusterNodo!]!
    despliegue: [Despliegue!]!
    infra_afectada: [InfraAfectada!]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  # ------------------------
  # Queries
  # ------------------------
  type Query {
    servidores: [Servidor!]! @requireAuth
    servidor(id: Int!): Servidor @requireAuth
    servidorCompleto(id: Int!): Servidor @requireAuth
  }

  # ------------------------
  # Inputs
  # ------------------------

  input CreateServidorInput {
    id_data_center: Int
    id_padre: Int
    nombre: String!
    cod_inventario_agetic: String
    cod_tipo_servidor: String
    serie: String
    marca: String
    modelo: String
    ram: Int
    almacenamiento: Int
    ip_primaria: String
    sistema_operativo: String
    estado_operativo: String!
    estado: estado!
    usuario_creacion: Int!
    identity_key: String
  }

  input UpdateServidorInput {
    id_data_center: Int
    id_padre: Int
    nombre: String
    cod_inventario_agetic: String
    cod_tipo_servidor: String
    serie: String
    marca: String
    modelo: String
    ram: Int
    almacenamiento: Int
    ip_primaria: String
    sistema_operativo: String
    estado_operativo: String
    estado: estado
    usuario_modificacion: Int
    identity_key: String
  }

  # ------------------------
  # Mutations
  # ------------------------

  type Mutation {
    createServidor(input: CreateServidorInput!): Servidor! @requireAuth
    updateServidor(id: Int!, input: UpdateServidorInput!): Servidor! @requireAuth
    deleteServidor(id: Int!): Servidor! @requireAuth
  }
`