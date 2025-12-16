import EndpointSyncLog from 'src/components/EndpointSyncLog/EndpointSyncLog'

export const QUERY = gql`
  query FindEndpointSyncLogById($id: Int!) {
    endpointSyncLog: endpointSyncLog(id: $id) {
      id
      tipo_endpoint
      id_proxmox_endpoint
      id_k8s_endpoint
      estado_sync
      trigger
      mensaje
      error_detalle
      snapshot_resultado
      total_clusters
      total_servidores
      total_maquinas
      total_nodos
      fecha_inicio
      fecha_fin
      duracion_ms
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>EndpointSyncLog not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ endpointSyncLog }) => {
  return <EndpointSyncLog endpointSyncLog={endpointSyncLog} />
}
