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
    k8s_uid: String
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
    k8s_uid: String
    usuario_creacion: Int!
    # fecha_creacion se elimina porque la DB tiene @default(now())
  }

  input UpdateClusterNodoInput {
    clusterId: Int
    nombre: String
    nodoTipo: NodoTipo
    maquinaId: Int
    servidorId: Int
    rol: String
    estado: estado
    k8s_uid: String
    usuario_modificacion: Int
    # fecha_modificacion se maneja en el servicio
  }

  type Mutation {
    createClusterNodo(input: CreateClusterNodoInput!): ClusterNodo! @requireAuth
    updateClusterNodo(id: Int!, input: UpdateClusterNodoInput!): ClusterNodo!
      @requireAuth
    deleteClusterNodo(id: Int!): ClusterNodo! @requireAuth
  }
`