import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import EndpointSyncLogForm from 'src/components/EndpointSyncLog/EndpointSyncLogForm'

export const QUERY = gql`
  query EditEndpointSyncLogById($id: Int!) {
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

const UPDATE_ENDPOINT_SYNC_LOG_MUTATION = gql`
  mutation UpdateEndpointSyncLogMutation(
    $id: Int!
    $input: UpdateEndpointSyncLogInput!
  ) {
    updateEndpointSyncLog(id: $id, input: $input) {
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

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ endpointSyncLog }) => {
  const [updateEndpointSyncLog, { loading, error }] = useMutation(
    UPDATE_ENDPOINT_SYNC_LOG_MUTATION,
    {
      onCompleted: () => {
        toast.success('EndpointSyncLog updated')
        navigate(routes.endpointSyncLogs())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateEndpointSyncLog({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit EndpointSyncLog {endpointSyncLog?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <EndpointSyncLogForm
          endpointSyncLog={endpointSyncLog}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
