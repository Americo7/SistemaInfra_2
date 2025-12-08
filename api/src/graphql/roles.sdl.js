export const schema = gql`
  type Role {
    id: Int!
    nombre: String!
    cod_tipo_rol: String!
    descripcion: String!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    usuario_roles: [UsuarioRol]!
    
    creadoPor: Usuario
    modificadoPor: Usuario
    tipoRolInfo: Parametro
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    roles: [Role!]! @requireAuth
    role(id: Int!): Role @requireAuth
    
    # --- QUERIES PARA LOS DROPDOWNS DEL FORMULARIO ---
    parametrosFormularioRole: [Parametro!]! @requireAuth
  }

  input CreateRoleInput {
    nombre: String!
    cod_tipo_rol: String!
    descripcion: String!
    estado: estado!
  }

  input UpdateRoleInput {
    nombre: String
    cod_tipo_rol: String
    descripcion: String
    estado: estado
  }

  type Mutation {
    createRole(input: CreateRoleInput!): Role! @requireAuth
    updateRole(id: Int!, input: UpdateRoleInput!): Role! @requireAuth
    deleteRole(id: Int!): Role! @requireAuth
  }
`
