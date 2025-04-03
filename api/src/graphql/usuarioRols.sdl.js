export const schema = gql`
  type UsuarioRol {
    id: Int!
    id_usuario: Int!
    id_rol: Int!
    id_maquina: Int
    id_sistema: Int
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    maquinas: Maquina
    roles: Role!
    sistemas: Sistema
    usuarios: Usuario!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    usuarioRols: [UsuarioRol!]! @requireAuth
    usuarioRol(id: Int!): UsuarioRol @requireAuth
  }

  input CreateUsuarioRolInput {
    id_usuario: Int!
    id_rol: Int!
    id_maquina: Int
    id_sistema: Int
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateUsuarioRolInput {
    id_usuario: Int
    id_rol: Int
    id_maquina: Int
    id_sistema: Int
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createUsuarioRol(input: CreateUsuarioRolInput!): UsuarioRol! @requireAuth
    updateUsuarioRol(id: Int!, input: UpdateUsuarioRolInput!): UsuarioRol!
      @requireAuth
    deleteUsuarioRol(id: Int!): UsuarioRol! @requireAuth
  }
`
