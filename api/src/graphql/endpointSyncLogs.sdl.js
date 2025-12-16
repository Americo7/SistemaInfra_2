export const schema = gql`
  type EndpointSyncLog {
    id: Int!
    tipo_endpoint: TipoEndpoint!
    id_proxmox_endpoint: Int
    id_k8s_endpoint: Int
    estado_sync: EstadoSync!
    trigger: SyncTrigger!
    mensaje: String
    error_detalle: String
    snapshot_resultado: JSON
    total_clusters: Int
    total_servidores: Int
    total_maquinas: Int
    total_nodos: Int
    fecha_inicio: DateTime!
    fecha_fin: DateTime
    duracion_ms: Int
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    proxmox_endpoint: ProxmoxEndpoint
    k8s_endpoint: K8sEndpoint
  }

  enum TipoEndpoint {
    PROXMOX
    K8S
  }

  enum EstadoSync {
    INICIADO
    EXITOSO
    ERROR
    PARCIAL
  }

  enum SyncTrigger {
    MANUAL
    CRON
  }

  enum estado {
    ACTIVO
    INACTIVO
  }

  type Query {
    endpointSyncLogs: [EndpointSyncLog!]! @requireAuth
    endpointSyncLog(id: Int!): EndpointSyncLog @requireAuth
  }

  input CreateEndpointSyncLogInput {
    tipo_endpoint: TipoEndpoint!
    id_proxmox_endpoint: Int
    id_k8s_endpoint: Int
    estado_sync: EstadoSync!
    trigger: SyncTrigger!
    mensaje: String
    error_detalle: String
    snapshot_resultado: JSON
    total_clusters: Int
    total_servidores: Int
    total_maquinas: Int
    total_nodos: Int
    fecha_inicio: DateTime!
    fecha_fin: DateTime
    duracion_ms: Int
    estado: estado!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
  }

  input UpdateEndpointSyncLogInput {
    tipo_endpoint: TipoEndpoint
    id_proxmox_endpoint: Int
    id_k8s_endpoint: Int
    estado_sync: EstadoSync
    trigger: SyncTrigger
    mensaje: String
    error_detalle: String
    snapshot_resultado: JSON
    total_clusters: Int
    total_servidores: Int
    total_maquinas: Int
    total_nodos: Int
    fecha_inicio: DateTime
    fecha_fin: DateTime
    duracion_ms: Int
    estado: estado
    fecha_creacion: DateTime
    usuario_creacion: Int
  }

  type Mutation {
    createEndpointSyncLog(input: CreateEndpointSyncLogInput!): EndpointSyncLog!
      @requireAuth
    updateEndpointSyncLog(
      id: Int!
      input: UpdateEndpointSyncLogInput!
    ): EndpointSyncLog! @requireAuth
    deleteEndpointSyncLog(id: Int!): EndpointSyncLog! @requireAuth
  }
`
