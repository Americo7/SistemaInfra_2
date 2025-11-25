export const schema = gql`
  type K8sEndpoint {
    id: Int!
    nombre: String!
    url_api: String!
    token_bearer: String!
    descripcion: String
    fecha_ultima_sync: DateTime
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    clusters: [Cluster]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    k8SEndpoints: [K8sEndpoint!]! @requireAuth
    k8SEndpoint(id: Int!): K8sEndpoint @requireAuth
    # Esta query auxiliar sirve para llenar selectores de usuarios si fuera necesario
    usuarios: [Usuario!]! @requireAuth
  }

  input CreateK8sEndpointInput {
    nombre: String!
    url_api: String!
    token_bearer: String!
    descripcion: String
    fecha_ultima_sync: DateTime
    estado: estado!
    usuario_creacion: Int!
  }

  input UpdateK8sEndpointInput {
    nombre: String
    url_api: String
    token_bearer: String
    descripcion: String
    fecha_ultima_sync: DateTime
    estado: estado
    usuario_modificacion: Int
  }

  type Mutation {
    createK8sEndpoint(input: CreateK8sEndpointInput!): K8sEndpoint! @requireAuth
    updateK8sEndpoint(id: Int!, input: UpdateK8sEndpointInput!): K8sEndpoint! @requireAuth
    deleteK8sEndpoint(id: Int!): K8sEndpoint! @requireAuth
  }
`