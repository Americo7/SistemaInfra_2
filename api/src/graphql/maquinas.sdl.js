export const schema = gql`
  type Maquina {
    id: Int!
    codigo: Int
    cod_tipo_maquina: String!
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
    despliegue: [Despliegue]!
    servidor_maquina: [ServidorMaquina]!
    usuario_roles: [UsuarioRol]!
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
    codigo: Int
    cod_tipo_maquina: String!
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
  }

  input UpdateMaquinaInput {
    codigo: Int
    cod_tipo_maquina: String
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
  }

  type Mutation {
    createMaquina(input: CreateMaquinaInput!): Maquina! @requireAuth
    updateMaquina(id: Int!, input: UpdateMaquinaInput!): Maquina! @requireAuth
    deleteMaquina(id: Int!): Maquina! @requireAuth
  }
`
