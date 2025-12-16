import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, jsonDisplay, timeTag } from 'src/lib/formatters'

const DELETE_ENDPOINT_SYNC_LOG_MUTATION = gql`
  mutation DeleteEndpointSyncLogMutation($id: Int!) {
    deleteEndpointSyncLog(id: $id) {
      id
    }
  }
`

const EndpointSyncLog = ({ endpointSyncLog }) => {
  const [deleteEndpointSyncLog] = useMutation(
    DELETE_ENDPOINT_SYNC_LOG_MUTATION,
    {
      onCompleted: () => {
        toast.success('EndpointSyncLog deleted')
        navigate(routes.endpointSyncLogs())
      },
      onError: (error) => {
        toast.error(error.message)
      },
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
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            EndpointSyncLog {endpointSyncLog.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{endpointSyncLog.id}</td>
            </tr>
            <tr>
              <th>Tipo endpoint</th>
              <td>{formatEnum(endpointSyncLog.tipo_endpoint)}</td>
            </tr>
            <tr>
              <th>Id proxmox endpoint</th>
              <td>{endpointSyncLog.id_proxmox_endpoint}</td>
            </tr>
            <tr>
              <th>Id k8s endpoint</th>
              <td>{endpointSyncLog.id_k8s_endpoint}</td>
            </tr>
            <tr>
              <th>Estado sync</th>
              <td>{formatEnum(endpointSyncLog.estado_sync)}</td>
            </tr>
            <tr>
              <th>Trigger</th>
              <td>{formatEnum(endpointSyncLog.trigger)}</td>
            </tr>
            <tr>
              <th>Mensaje</th>
              <td>{endpointSyncLog.mensaje}</td>
            </tr>
            <tr>
              <th>Error detalle</th>
              <td>{endpointSyncLog.error_detalle}</td>
            </tr>
            <tr>
              <th>Snapshot resultado</th>
              <td>{jsonDisplay(endpointSyncLog.snapshot_resultado)}</td>
            </tr>
            <tr>
              <th>Total clusters</th>
              <td>{endpointSyncLog.total_clusters}</td>
            </tr>
            <tr>
              <th>Total servidores</th>
              <td>{endpointSyncLog.total_servidores}</td>
            </tr>
            <tr>
              <th>Total maquinas</th>
              <td>{endpointSyncLog.total_maquinas}</td>
            </tr>
            <tr>
              <th>Total nodos</th>
              <td>{endpointSyncLog.total_nodos}</td>
            </tr>
            <tr>
              <th>Fecha inicio</th>
              <td>{timeTag(endpointSyncLog.fecha_inicio)}</td>
            </tr>
            <tr>
              <th>Fecha fin</th>
              <td>{timeTag(endpointSyncLog.fecha_fin)}</td>
            </tr>
            <tr>
              <th>Duracion ms</th>
              <td>{endpointSyncLog.duracion_ms}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(endpointSyncLog.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(endpointSyncLog.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{endpointSyncLog.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(endpointSyncLog.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{endpointSyncLog.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editEndpointSyncLog({ id: endpointSyncLog.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(endpointSyncLog.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default EndpointSyncLog
