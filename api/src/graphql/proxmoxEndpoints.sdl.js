export const schema = gql`
  type ProxmoxEndpoint {
    id: Int!
    nombre: String!
    dominio: String
    ip: String
    puerto: Int!
    ssl: Boolean!
    usuario: String!
    token_id: String!
    token_secret: String!
    descripcion: String
    fecha_ultima_sync: DateTime
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    clusters: [Cluster!]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    proxmoxEndpoints: [ProxmoxEndpoint!]! @requireAuth
    proxmoxEndpoint(id: Int!): ProxmoxEndpoint @requireAuth
  }

  input CreateProxmoxEndpointInput {
    nombre: String!
    dominio: String
    ip: String
    puerto: Int!
    ssl: Boolean!
    usuario: String!
    token_id: String!
    token_secret: String!
    descripcion: String
    estado: estado!
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateProxmoxEndpointInput {
    nombre: String
    dominio: String
    ip: String
    puerto: Int
    ssl: Boolean
    usuario: String
    token_id: String
    token_secret: String
    descripcion: String
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createProxmoxEndpoint(input: CreateProxmoxEndpointInput!): ProxmoxEndpoint!
      @requireAuth

    updateProxmoxEndpoint(
      id: Int!
      input: UpdateProxmoxEndpointInput!
    ): ProxmoxEndpoint! @requireAuth

    deleteProxmoxEndpoint(id: Int!): ProxmoxEndpoint! @requireAuth
  }
`
