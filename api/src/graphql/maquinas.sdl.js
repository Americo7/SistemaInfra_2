export const schema = gql`
  type Maquina {
    id: Int!
    nombre: String!
    uuid: String
    proxmox_vmid: Int
    mac_address: String
    ip: String
    so: String!
    cod_plataforma: String!
    ram: Int!
    cpu: Int!
    almacenamiento: JSON!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    id_servidor: Int
    servidores: Servidor
    despliegue: [Despliegue!]!
    infra_afectada: [InfraAfectada!]!
    cluster_nodos: [ClusterNodo!]!
    usuario_roles: [UsuarioRol!]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    maquinas: [Maquina!]! @requireAuth
    maquina(id: Int!): Maquina @requireAuth
    maquinaCompleta(id: Int!): Maquina @requireAuth
  }

  input CreateMaquinaInput {
    nombre: String!
    uuid: String
    proxmox_vmid: Int
    mac_address: String
    ip: String
    so: String!
    cod_plataforma: String!
    ram: Int!
    cpu: Int!
    almacenamiento: JSON!
    id_servidor: Int
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateMaquinaInput {
    nombre: String
    uuid: String
    proxmox_vmid: Int
    mac_address: String
    ip: String
    so: String
    cod_plataforma: String
    ram: Int
    cpu: Int
    almacenamiento: JSON
    id_servidor: Int
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