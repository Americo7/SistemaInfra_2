import { Link, routes } from '@redwoodjs/router'

import EndpointSyncLogs from 'src/components/EndpointSyncLog/EndpointSyncLogs'

export const QUERY = gql`
  query FindEndpointSyncLogs {
    endpointSyncLogs {
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

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No endpointSyncLogs yet.{' '}
      <Link to={routes.newEndpointSyncLog()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ endpointSyncLogs }) => {
  return <EndpointSyncLogs endpointSyncLogs={endpointSyncLogs} />
}
