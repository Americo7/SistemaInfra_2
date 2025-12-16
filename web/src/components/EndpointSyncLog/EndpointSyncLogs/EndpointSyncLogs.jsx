import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/EndpointSyncLog/EndpointSyncLogsCell'
import { formatEnum, jsonTruncate, timeTag, truncate } from 'src/lib/formatters'

const DELETE_ENDPOINT_SYNC_LOG_MUTATION = gql`
  mutation DeleteEndpointSyncLogMutation($id: Int!) {
    deleteEndpointSyncLog(id: $id) {
      id
    }
  }
`

const EndpointSyncLogsList = ({ endpointSyncLogs }) => {
  const [deleteEndpointSyncLog] = useMutation(
    DELETE_ENDPOINT_SYNC_LOG_MUTATION,
    {
      onCompleted: () => {
        toast.success('EndpointSyncLog deleted')
      },
      onError: (error) => {
        toast.error(error.message)
      },
      // This refetches the query on the list page. Read more about other ways to
      // update the cache over here:
      // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
      refetchQueries: [{ query: QUERY }],
      awaitRefetchQueries: true,
    }
  )

  const onDeleteClick = (id) => {
    if (
      confirm('Are you sure you want to delete endpointSyncLog ' + id + '?')
    ) {
      deleteEndpointSyncLog({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Tipo endpoint</th>
            <th>Id proxmox endpoint</th>
            <th>Id k8s endpoint</th>
            <th>Estado sync</th>
            <th>Trigger</th>
            <th>Mensaje</th>
            <th>Error detalle</th>
            <th>Snapshot resultado</th>
            <th>Total clusters</th>
            <th>Total servidores</th>
            <th>Total maquinas</th>
            <th>Total nodos</th>
            <th>Fecha inicio</th>
            <th>Fecha fin</th>
            <th>Duracion ms</th>
            <th>Estado</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {endpointSyncLogs.map((endpointSyncLog) => (
            <tr key={endpointSyncLog.id}>
              <td>{truncate(endpointSyncLog.id)}</td>
              <td>{formatEnum(endpointSyncLog.tipo_endpoint)}</td>
              <td>{truncate(endpointSyncLog.id_proxmox_endpoint)}</td>
              <td>{truncate(endpointSyncLog.id_k8s_endpoint)}</td>
              <td>{formatEnum(endpointSyncLog.estado_sync)}</td>
              <td>{formatEnum(endpointSyncLog.trigger)}</td>
              <td>{truncate(endpointSyncLog.mensaje)}</td>
              <td>{truncate(endpointSyncLog.error_detalle)}</td>
              <td>{jsonTruncate(endpointSyncLog.snapshot_resultado)}</td>
              <td>{truncate(endpointSyncLog.total_clusters)}</td>
              <td>{truncate(endpointSyncLog.total_servidores)}</td>
              <td>{truncate(endpointSyncLog.total_maquinas)}</td>
              <td>{truncate(endpointSyncLog.total_nodos)}</td>
              <td>{timeTag(endpointSyncLog.fecha_inicio)}</td>
              <td>{timeTag(endpointSyncLog.fecha_fin)}</td>
              <td>{truncate(endpointSyncLog.duracion_ms)}</td>
              <td>{formatEnum(endpointSyncLog.estado)}</td>
              <td>{timeTag(endpointSyncLog.fecha_creacion)}</td>
              <td>{truncate(endpointSyncLog.usuario_creacion)}</td>
              <td>{timeTag(endpointSyncLog.fecha_modificacion)}</td>
              <td>{truncate(endpointSyncLog.usuario_modificacion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.endpointSyncLog({ id: endpointSyncLog.id })}
                    title={
                      'Show endpointSyncLog ' + endpointSyncLog.id + ' detail'
                    }
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editEndpointSyncLog({ id: endpointSyncLog.id })}
                    title={'Edit endpointSyncLog ' + endpointSyncLog.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete endpointSyncLog ' + endpointSyncLog.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(endpointSyncLog.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EndpointSyncLogsList
