export const schema = gql`
  type Servidor {
    id: Int!
    cod_inventario_agetic: String! # Código de inventario AGETIC
    nombre: String!
    ram: Int # Cantidad de RAM en GB
    almacenamiento: Int # Almacenamiento en GB
    estado_operativo: String! # Estado operativo
    estado: estado! # Estado (ACTIVO/INACTIVO)
    fecha_creacion: DateTime! # Fecha de creación
    usuario_creacion: Int! # ID usuario creación
    fecha_modificacion: DateTime # Fecha modificación (opcional)
    usuario_modificacion: Int # ID usuario modificación (opcional)
    id_data_center: Int! # ID del data center
    serie: String! # Número de serie
    id_padre: Int # ID servidor padre (opcional para servidores hijos)
    cod_tipo_servidor: String! # Código tipo de servidor
    marca: String! # Marca del servidor
    modelo: String! # Modelo del servidor
    asignacion_servidor_maquina: [AsignacionServidorMaquina]! # Relación con máquinas
    infra_afectada: [InfraAfectada]! # Infraestructura afectada
    data_center: DataCenter! # Data Center asociado
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    servidores: [Servidor!]! @requireAuth # Obtener todos los servidores
    servidor(id: Int!): Servidor @requireAuth # Obtener un servidor por ID
  }

  input CreateServidorInput {
    cod_inventario_agetic: String!
    nombre: String!
    ram: Int
    almacenamiento: Int
    estado_operativo: String!
    estado: estado!
    id_data_center: Int!
    serie: String!
    id_padre: Int
    cod_tipo_servidor: String!
    marca: String!
    modelo: String!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateServidorInput {
    cod_inventario_agetic: String
    nombre: String
    ram: Int
    almacenamiento: Int
    estado_operativo: String
    estado: estado
    id_data_center: Int
    serie: String
    id_padre: Int
    cod_tipo_servidor: String
    marca: String
    modelo: String
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createServidor(input: CreateServidorInput!): Servidor! @requireAuth
    updateServidor(id: Int!, input: UpdateServidorInput!): Servidor!
      @requireAuth
    deleteServidor(id: Int!): Servidor! @requireAuth
  }
`
