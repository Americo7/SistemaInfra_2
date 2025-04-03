export const schema = gql`
  type Despliegue {
    id: Int!
    id_componente: Int!
    id_maquina: Int!
    cod_tipo_despliegue: String!
    es_cluster: Boolean!
    nombre_cluster: String
    fecha_despliegue: DateTime!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    componentes: Componente!
    maquinas: Maquina!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    despliegues: [Despliegue!]! @requireAuth
    despliegue(id: Int!): Despliegue @requireAuth
  }

  input CreateDespliegueInput {
    id_componente: Int!
    id_maquina: Int!
    cod_tipo_despliegue: String!
    es_cluster: Boolean!
    nombre_cluster: String
    fecha_despliegue: DateTime!
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateDespliegueInput {
    id_componente: Int
    id_maquina: Int
    cod_tipo_despliegue: String
    es_cluster: Boolean
    nombre_cluster: String
    fecha_despliegue: DateTime
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createDespliegue(input: CreateDespliegueInput!): Despliegue! @requireAuth
    updateDespliegue(id: Int!, input: UpdateDespliegueInput!): Despliegue!
      @requireAuth
    deleteDespliegue(id: Int!): Despliegue! @requireAuth
  }
`
