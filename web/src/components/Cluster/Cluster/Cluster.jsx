import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters'

const DELETE_CLUSTER_MUTATION = gql`
  mutation DeleteClusterMutation($id: Int!) {
    deleteCluster(id: $id) {
      id
    }
  }
`

const Cluster = ({ cluster }) => {
  const [deleteCluster] = useMutation(DELETE_CLUSTER_MUTATION, {
    onCompleted: () => {
      toast.success('Cluster deleted')
      navigate(routes.clusters())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete cluster ' + id + '?')) {
      deleteCluster({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Cluster {cluster.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{cluster.id}</td>
            </tr>
            <tr>
              <th>Nombre</th>
              <td>{cluster.nombre}</td>
            </tr>
            <tr>
              <th>Cod tipo cluster</th>
              <td>{cluster.cod_tipo_cluster}</td>
            </tr>
            <tr>
              <th>Descripcion</th>
              <td>{cluster.descripcion}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(cluster.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(cluster.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{cluster.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(cluster.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{cluster.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editCluster({ id: cluster.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(cluster.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Cluster
