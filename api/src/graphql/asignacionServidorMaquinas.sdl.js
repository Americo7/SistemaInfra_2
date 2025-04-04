export const schema = gql`
  type AsignacionServidorMaquina {
    id: Int!
    id_servidor: Int!
    id_maquina: Int!
    id_cluster: Int
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    clusters: Cluster
    maquinas: Maquina!
    servidores: Servidor!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    asignacionServidorMaquinas: [AsignacionServidorMaquina!]! @requireAuth
    asignacionServidorMaquina(id: Int!): AsignacionServidorMaquina @requireAuth
  }

  input CreateAsignacionServidorMaquinaInput {
    id_servidor: Int!
    id_maquina: Int!
    id_cluster: Int
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateAsignacionServidorMaquinaInput {
    id_servidor: Int
    id_maquina: Int
    id_cluster: Int
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createAsignacionServidorMaquina(
      input: CreateAsignacionServidorMaquinaInput!
    ): AsignacionServidorMaquina! @requireAuth
    updateAsignacionServidorMaquina(
      id: Int!
      input: UpdateAsignacionServidorMaquinaInput!
    ): AsignacionServidorMaquina! @requireAuth
    deleteAsignacionServidorMaquina(id: Int!): AsignacionServidorMaquina!
      @requireAuth
  }
`
