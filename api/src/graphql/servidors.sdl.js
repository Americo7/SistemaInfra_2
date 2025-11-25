export const schema = gql`
  type Servidor {
    id: Int!
    cod_inventario_agetic: String!
    nombre: String!
    ram: Int
    almacenamiento: Int
    estado_operativo: String!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    id_data_center: Int!
    serie: String!
    id_padre: Int
    cod_tipo_servidor: String!
    marca: String!
    modelo: String!
    ip_primaria: String
    sistema_operativo: String

    # --- Relaciones ---
    infra_afectada: [InfraAfectada!]!
    maquinas: [Maquina!]!
    cluster_nodos: [ClusterNodo!]!
    despliegue: [Despliegue!]!
    data_centers: DataCenter!
    servidores_padre: Servidor
    servidores_hijos: [Servidor!]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    servidores: [Servidor!]! @requireAuth
    servidor(id: Int!): Servidor @requireAuth
    servidorCompleto(id: Int!): Servidor @requireAuth
  }

  input CreateServidorInput {
    cod_inventario_agetic: String!
    nombre: String!
    ram: Int
    almacenamiento: Int
    estado_operativo: String!
    estado: estado!
    id_data_center: Int!
    serie: String!
    id_padre: Int
    cod_tipo_servidor: String!
    marca: String!
    modelo: String!
    ip_primaria: String
    sistema_operativo: String
    usuario_creacion: Int!
  }

  input UpdateServidorInput {
    cod_inventario_agetic: String
    nombre: String
    ram: Int
    almacenamiento: Int
    estado_operativo: String
    estado: estado
    id_data_center: Int
    serie: String
    id_padre: Int
    cod_tipo_servidor: String
    marca: String
    modelo: String
    ip_primaria: String
    sistema_operativo: String
    usuario_modificacion: Int
  }

  type Mutation {
    createServidor(input: CreateServidorInput!): Servidor! @requireAuth
    updateServidor(id: Int!, input: UpdateServidorInput!): Servidor! @requireAuth
    deleteServidor(id: Int!): Servidor! @requireAuth
  }
`