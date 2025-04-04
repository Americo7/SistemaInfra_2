export const schema = gql`
  type Hardware {
    id: Int!
    id_data_center: Int!
    serie: String!
    cod_activo_agetic: String!
    cod_tipo_hw: String!
    marca: String!
    modelo: String!
    estado_operativo: String!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    data_centers: DataCenter!
    infra_afectada: [InfraAfectada]!
    servidores: [Servidor]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    hardwares: [Hardware!]! @requireAuth
    hardware(id: Int!): Hardware @requireAuth
  }

  input CreateHardwareInput {
    id_data_center: Int!
    serie: String!
    cod_activo_agetic: String!
    cod_tipo_hw: String!
    marca: String!
    modelo: String!
    estado_operativo: String!
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateHardwareInput {
    id_data_center: Int
    serie: String
    cod_activo_agetic: String
    cod_tipo_hw: String
    marca: String
    modelo: String
    estado_operativo: String
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createHardware(input: CreateHardwareInput!): Hardware! @requireAuth
    updateHardware(id: Int!, input: UpdateHardwareInput!): Hardware!
      @requireAuth
    deleteHardware(id: Int!): Hardware! @requireAuth
  }
`
