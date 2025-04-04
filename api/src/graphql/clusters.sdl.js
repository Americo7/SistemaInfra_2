export const schema = gql`
  type Cluster {
    id: Int!
    nombre: String!
    cod_tipo_cluster: String!
    descripcion: String!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    asignacion_servidor_maquina: [AsignacionServidorMaquina]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    clusters: [Cluster!]! @requireAuth
    cluster(id: Int!): Cluster @requireAuth
  }

  input CreateClusterInput {
    nombre: String!
    cod_tipo_cluster: String!
    descripcion: String!
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateClusterInput {
    nombre: String
    cod_tipo_cluster: String
    descripcion: String
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createCluster(input: CreateClusterInput!): Cluster! @requireAuth
    updateCluster(id: Int!, input: UpdateClusterInput!): Cluster! @requireAuth
    deleteCluster(id: Int!): Cluster! @requireAuth
  }
`
