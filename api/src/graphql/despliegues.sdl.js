export const schema = gql`
  type Despliegue {
    id: Int!
    id_componente: Int!
    id_maquina: Int
    id_servidor: Int
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
    
    # --- NUEVOS CAMPOS ---
    version_aplicacion: String
    git_commit: String
    tipo_despliegue: String

    # --- RELACIONES PRISMA ---
    componentes: Componente!
    maquinas: Maquina
    servidores: Servidor

    # --- RESOLVERS PERSONALIZADOS (Helpers) ---
    creadoPor: Usuario
    modificadoPor: Usuario
    tipoRespaldoInfo: Parametro
    estadoDespliegueInfo: Parametro
    unidadInfo: Parametro
    # Nuevo resolver para obtener el nombre (Deploy/Rollback) desde Parametros
    tipoDespliegueInfo: Parametro 
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  enum SortOrder {
    asc
    desc
  }

  input DespliegueOrderByInput {
    fecha_despliegue: SortOrder
  }

  type Query {
    despliegues(limit: Int, orderBy: DespliegueOrderByInput): [Despliegue!]! @requireAuth
    despliegue(id: Int!): Despliegue @requireAuth
    
    # --- QUERIES PARA LOS DROPDOWNS DEL FORMULARIO ---
    parametrosFormularioDespliegue: [Parametro!]! @requireAuth
  }

  input CreateDespliegueInput {
    id_componente: Int!
    id_maquina: Int
    id_servidor: Int
    descripcion: String!
    fecha_despliegue: DateTime!
    estado: estado!
    fecha_solicitud: DateTime!
    unidad_solicitante: String!
    solicitante: String!
    cod_tipo_respaldo: String!
    referencia_respaldo: String!
    estado_despliegue: String!
    # Nuevos campos en Create
    version_aplicacion: String
    git_commit: String
    tipo_despliegue: String
  }

  input UpdateDespliegueInput {
    id_componente: Int
    id_maquina: Int
    id_servidor: Int
    descripcion: String
    fecha_despliegue: DateTime
    estado: estado
    fecha_solicitud: DateTime
    unidad_solicitante: String
    solicitante: String
    cod_tipo_respaldo: String
    referencia_respaldo: String
    estado_despliegue: String
    # Nuevos campos en Update
    version_aplicacion: String
    git_commit: String
    tipo_despliegue: String
  }

  type Mutation {
    createDespliegue(input: CreateDespliegueInput!): Despliegue! @requireAuth
    updateDespliegue(id: Int!, input: UpdateDespliegueInput!): Despliegue! @requireAuth
    deleteDespliegue(id: Int!): Despliegue! @requireAuth
  }
`