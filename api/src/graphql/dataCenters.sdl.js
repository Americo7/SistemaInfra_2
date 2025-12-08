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
    
    servidores: [Servidor]
    infra_afectada: [InfraAfectada]!
    
    creadoPor: Usuario
    modificadoPor: Usuario
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
  }

  input UpdateDataCenterInput {
    nombre: String
    ubicacion: String
    estado: estado
  }

  type Mutation {
    createDataCenter(input: CreateDataCenterInput!): DataCenter! @requireAuth
    updateDataCenter(id: Int!, input: UpdateDataCenterInput!): DataCenter! @requireAuth
    deleteDataCenter(id: Int!): DataCenter! @requireAuth
  }
`
