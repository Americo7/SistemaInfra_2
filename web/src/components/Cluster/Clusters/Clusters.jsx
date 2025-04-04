import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Cluster/ClustersCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters'

const DELETE_CLUSTER_MUTATION = gql`
  mutation DeleteClusterMutation($id: Int!) {
    deleteCluster(id: $id) {
      id
    }
  }
`

const ClustersList = ({ clusters }) => {
  const [deleteCluster] = useMutation(DELETE_CLUSTER_MUTATION, {
    onCompleted: () => {
      toast.success('Cluster deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete cluster ' + id + '?')) {
      deleteCluster({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nombre</th>
            <th>Cod tipo cluster</th>
            <th>Descripcion</th>
            <th>Estado</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {clusters.map((cluster) => (
            <tr key={cluster.id}>
              <td>{truncate(cluster.id)}</td>
              <td>{truncate(cluster.nombre)}</td>
              <td>{truncate(cluster.cod_tipo_cluster)}</td>
              <td>{truncate(cluster.descripcion)}</td>
              <td>{formatEnum(cluster.estado)}</td>
              <td>{timeTag(cluster.fecha_creacion)}</td>
              <td>{truncate(cluster.usuario_creacion)}</td>
              <td>{timeTag(cluster.fecha_modificacion)}</td>
              <td>{truncate(cluster.usuario_modificacion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.cluster({ id: cluster.id })}
                    title={'Show cluster ' + cluster.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editCluster({ id: cluster.id })}
                    title={'Edit cluster ' + cluster.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete cluster ' + cluster.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(cluster.id)}
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

export default ClustersList
