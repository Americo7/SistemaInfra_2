export const schema = gql`
  type Servidor {
    id: Int!
    id_data_center: Int
    id_padre: Int
    nombre: String!
    cod_inventario_agetic: String
    cod_tipo_servidor: String
    serie: String
    marca: String
    modelo: String
    ram: Int
    almacenamiento: Int
    ip_primaria: String
    sistema_operativo: String
    
    # Estados
    estado_operativo: String!
    estado: estado!
    
    # Auditoría
    identity_key: String!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    
    # Relaciones
    data_centers: DataCenter
    servidores_padre: Servidor     # Es singular porque un servidor tiene 1 padre
    servidores_hijos: [Servidor!]! # Es plural porque un servidor puede tener N hijos
    maquinas: [Maquina!]!
    cluster_nodos: [ClusterNodo!]!
    despliegue: [Despliegue!]!
    infra_afectada: [InfraAfectada!]!

    # Relaciones Calculadas / Helpers
    creadoPor: Usuario
    modificadoPor: Usuario
    tipoServidorInfo: Parametro
    estadoOperativoInfo: Parametro
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    servidores: [Servidor!]! @requireAuth
    servidor(id: Int!): Servidor @requireAuth
    
    # Dropdowns
    parametrosFormularioServidor: [Parametro!]! @requireAuth
  }

  input CreateServidorInput {
    id_data_center: Int
    id_padre: Int
    nombre: String!
    cod_inventario_agetic: String
    cod_tipo_servidor: String
    serie: String
    marca: String
    modelo: String
    ram: Int
    almacenamiento: Int
    ip_primaria: String
    sistema_operativo: String
    estado_operativo: String!
    estado: estado!
    
    # Opcional en creación, el sistema lo genera si falta
    identity_key: String 
  }

  input UpdateServidorInput {
    id_data_center: Int
    id_padre: Int
    nombre: String
    cod_inventario_agetic: String
    cod_tipo_servidor: String
    serie: String
    marca: String
    modelo: String
    ram: Int
    almacenamiento: Int
    ip_primaria: String
    sistema_operativo: String
    estado_operativo: String
    estado: estado
    # identity_key ELIMINADO: La lógica de actualización no permite cambiar esto manualmente
  }

  type Mutation {
    createServidor(input: CreateServidorInput!): Servidor! @requireAuth
    updateServidor(id: Int!, input: UpdateServidorInput!): Servidor! @requireAuth
    deleteServidor(id: Int!): Servidor! @requireAuth
  }
`