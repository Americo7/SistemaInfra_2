export const schema = gql`
  type ClusterNodo {
    id: Int!
    clusterId: Int!
    nombre: String!
    nodoTipo: NodoTipo!
    maquinaId: Int
    servidorId: Int
    rol: String
    estado: estado!
    identity_key: String!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    cluster: Cluster!
    maquina: Maquina
    servidor: Servidor
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  enum NodoTipo {
    VIRTUAL
    FISICO
  }

  type Query {
    clusterNodos: [ClusterNodo!]! @requireAuth
    clusterNodo(id: Int!): ClusterNodo @requireAuth
  }

  input CreateClusterNodoInput {
    clusterId: Int!
    nombre: String!
    nodoTipo: NodoTipo!
    maquinaId: Int
    servidorId: Int
    rol: String
    estado: estado!
    identity_key: String!
    usuario_creacion: Int!
  }

  input UpdateClusterNodoInput {
    clusterId: Int
    nombre: String
    nodoTipo: NodoTipo
    maquinaId: Int
    servidorId: Int
    rol: String
    estado: estado
    identity_key: String
    usuario_modificacion: Int
  }

  type Mutation {
    createClusterNodo(input: CreateClusterNodoInput!): ClusterNodo! @requireAuth
    updateClusterNodo(id: Int!, input: UpdateClusterNodoInput!): ClusterNodo!
      @requireAuth
    deleteClusterNodo(id: Int!): ClusterNodo! @requireAuth
  }
`