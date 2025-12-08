export const schema = gql`
  type Cluster {
    id: Int!
    nombre: String!
    cod_tipo_cluster: String!
    descripcion: String!
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    identity_key: String!
    id_proxmox_endpoint: Int
    id_k8s_endpoint: Int

    # Relaciones
    creadoPor: Usuario
    modificadoPor: Usuario
    tipoClusterInfo: Parametro
    proxmox_endpoint: ProxmoxEndpoint
    k8s_endpoint: K8sEndpoint
    cluster_nodos: [ClusterNodo!]!
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    clusters: [Cluster!]! @requireAuth
    cluster(id: Int!): Cluster @requireAuth

       # --- QUERIES PARA LOS DROPDOWNS DEL FORMULARIO ---
    parametrosFormularioCluster: [Parametro!]! @requireAuth
  }

  input CreateClusterInput {
    nombre: String!
    cod_tipo_cluster: String!
    descripcion: String!
    estado: estado!
    usuario_creacion: Int
    identity_key: String
    id_proxmox_endpoint: Int
    id_k8s_endpoint: Int
  }

  input UpdateClusterInput {
    nombre: String
    cod_tipo_cluster: String
    descripcion: String
    estado: estado
    usuario_modificacion: Int
    identity_key: String
    id_proxmox_endpoint: Int
    id_k8s_endpoint: Int
  }

  type Mutation {
    createCluster(input: CreateClusterInput!): Cluster! @requireAuth
    updateCluster(id: Int!, input: UpdateClusterInput!): Cluster! @requireAuth
    deleteCluster(id: Int!): Cluster! @requireAuth
  }
`
