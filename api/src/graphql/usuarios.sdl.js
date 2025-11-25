export const schema = gql`
  type Usuario {
    id: Int!
    id_ciudadano_digital: String
    nombre_usuario: String!
    contrasena: String
    nro_documento: String!
    nombres: String!
    primer_apellido: String!
    segundo_apellido: String!
    celular: String!
    email: String!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    usuario_roles: [UsuarioRol]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    usuarios: [Usuario!]! @requireAuth
    usuario(id: Int!): Usuario @requireAuth
  }

  input CreateUsuarioInput {
    id_ciudadano_digital: String
    nombre_usuario: String!
    contrasena: String
    nro_documento: String!
    nombres: String!
    primer_apellido: String!
    segundo_apellido: String!
    celular: String!
    email: String!
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateUsuarioInput {
    id_ciudadano_digital: String
    nombre_usuario: String
    contrasena: String
    nro_documento: String
    nombres: String
    primer_apellido: String
    segundo_apellido: String
    celular: String
    email: String
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createUsuario(input: CreateUsuarioInput!): Usuario! @requireAuth
    updateUsuario(id: Int!, input: UpdateUsuarioInput!): Usuario! @requireAuth
    deleteUsuario(id: Int!): Usuario! @requireAuth
  }
`
