export const schema = gql`
  type Maquina {
    id: Int!
    codigo: String
    cod_plataforma: String!
    nombre: String!
    ip: String!
    so: String!
    ram: Int!
    almacenamiento: JSON!
    cpu: Int!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    asignacion_servidor_maquina: [AsignacionServidorMaquina]!
    despliegue: [Despliegue]!
    infra_afectada: [InfraAfectada]!
    usuario_roles: [UsuarioRol]!
    es_virtual: Boolean!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    maquinas: [Maquina!]! @requireAuth
    maquina(id: Int!): Maquina @requireAuth
  }

  input CreateMaquinaInput {
    codigo: String
    cod_plataforma: String!
    nombre: String!
    ip: String!
    so: String!
    ram: Int!
    almacenamiento: JSON!
    cpu: Int!
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    es_virtual: Boolean!
  }

  input UpdateMaquinaInput {
    codigo: String
    cod_plataforma: String
    nombre: String
    ip: String
    so: String
    ram: Int
    almacenamiento: JSON
    cpu: Int
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    es_virtual: Boolean
  }

  type Mutation {
    createMaquina(input: CreateMaquinaInput!): Maquina! @requireAuth
    updateMaquina(id: Int!, input: UpdateMaquinaInput!): Maquina! @requireAuth
    deleteMaquina(id: Int!): Maquina! @requireAuth
  }
`
