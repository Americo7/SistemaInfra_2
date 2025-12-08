export const schema = gql`
  type Componente {
    id: Int!
    id_sistema: Int!
    nombre: String!
    dominio: String!
    descripcion: String!
    cod_entorno: String!
    cod_categoria: String!
    gitlab_repo: String
    gitlab_rama: String
    tecnologia: JSON
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    
    sistemas: Sistema!
    despliegue: [Despliegue]!

    creadoPor: Usuario
    modificadoPor: Usuario
    entornoInfo: Parametro
    categoriaInfo: Parametro
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    componentes: [Componente!]! @requireAuth
    componente(id: Int!): Componente @requireAuth
    
    # --- QUERIES PARA LOS DROPDOWNS DEL FORMULARIO ---
    parametrosFormularioComponente: [Parametro!]! @requireAuth
  }

  input CreateComponenteInput {
    id_sistema: Int!
    nombre: String!
    dominio: String!
    descripcion: String!
    cod_entorno: String!
    cod_categoria: String!
    gitlab_repo: String
    gitlab_rama: String
    tecnologia: JSON
    estado: estado!
  }

  input UpdateComponenteInput {
    id_sistema: Int
    nombre: String
    dominio: String
    descripcion: String
    cod_entorno: String
    cod_categoria: String
    gitlab_repo: String
    gitlab_rama: String
    tecnologia: JSON
    estado: estado
  }

  type Mutation {
    createComponente(input: CreateComponenteInput!): Componente! @requireAuth
    updateComponente(id: Int!, input: UpdateComponenteInput!): Componente! @requireAuth
    deleteComponente(id: Int!): Componente! @requireAuth
  }
`
