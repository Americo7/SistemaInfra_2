export const schema = gql`
  type Despliegue {
    id: Int!
    id_componente: Int!
    id_maquina: Int!
    descripcion: String!
    fecha_despliegue: DateTime!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    fecha_solicitud: DateTime!
    unidad_solicitante: String!
    solicitante: String!
    cod_tipo_respaldo: String!
    referencia_respaldo: String!
    estado_despliegue: String!
    componentes: Componente!
    maquinas: Maquina!
    despliegue_bitacora: [DespliegueBitacora]!
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
    descripcion: String!
    fecha_despliegue: DateTime
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    fecha_solicitud: DateTime!
    unidad_solicitante: String!
    solicitante: String!
    cod_tipo_respaldo: String!
    referencia_respaldo: String!
    estado_despliegue: String!
  }

  input UpdateDespliegueInput {
    id_componente: Int
    descripcion: String
    id_maquina: Int
    fecha_despliegue: DateTime
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    fecha_solicitud: DateTime
    unidad_solicitante: String
    solicitante: String
    cod_tipo_respaldo: String
    referencia_respaldo: String
    estado_despliegue: String
  }

  type Mutation {
    createDespliegue(input: CreateDespliegueInput!): Despliegue! @requireAuth
    updateDespliegue(id: Int!, input: UpdateDespliegueInput!): Despliegue!
      @requireAuth
    deleteDespliegue(id: Int!): Despliegue! @requireAuth
  }
`
