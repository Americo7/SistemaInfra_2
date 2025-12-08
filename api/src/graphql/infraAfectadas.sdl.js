export const schema = gql`
  type InfraAfectada {
    id: Int!
    id_evento: Int!
    id_data_center: Int
    id_servidor: Int
    id_maquina: Int
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    
    data_centers: DataCenter
    eventos: Evento!
    maquinas: Maquina
    servidores: Servidor
    
    creadoPor: Usuario
    modificadoPor: Usuario
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    infraAfectadas: [InfraAfectada!]! @requireAuth
    infraAfectada(id: Int!): InfraAfectada @requireAuth
  }

  input CreateInfraAfectadaInput {
    id_evento: Int!
    id_data_center: Int
    id_servidor: Int
    id_maquina: Int
    estado: estado!
  }

  input UpdateInfraAfectadaInput {
    id_evento: Int
    id_data_center: Int
    id_servidor: Int
    id_maquina: Int
    estado: estado
  }

  type Mutation {
    createInfraAfectada(input: CreateInfraAfectadaInput!): InfraAfectada! @requireAuth
    updateInfraAfectada(id: Int!, input: UpdateInfraAfectadaInput!): InfraAfectada! @requireAuth
    deleteInfraAfectada(id: Int!): InfraAfectada! @requireAuth
  }
`
