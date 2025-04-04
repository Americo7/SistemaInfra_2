export const schema = gql`
  type DataCenter {
    id: Int!
    nombre: String!
    ubicacion: String!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    hardware: [Hardware]!
    infra_afectada: [InfraAfectada]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    dataCenters: [DataCenter!]! @requireAuth
    dataCenter(id: Int!): DataCenter @requireAuth
  }

  input CreateDataCenterInput {
    nombre: String!
    ubicacion: String!
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateDataCenterInput {
    nombre: String
    ubicacion: String
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createDataCenter(input: CreateDataCenterInput!): DataCenter! @requireAuth
    updateDataCenter(id: Int!, input: UpdateDataCenterInput!): DataCenter!
      @requireAuth
    deleteDataCenter(id: Int!): DataCenter! @requireAuth
  }
`
