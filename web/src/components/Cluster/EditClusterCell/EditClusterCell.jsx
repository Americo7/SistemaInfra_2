import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ClusterForm from 'src/components/Cluster/ClusterForm'

export const QUERY = gql`
  query EditClusterById($id: Int!) {
    cluster: cluster(id: $id) {
      id
      nombre
      cod_tipo_cluster
      descripcion
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const UPDATE_CLUSTER_MUTATION = gql`
  mutation UpdateClusterMutation($id: Int!, $input: UpdateClusterInput!) {
    updateCluster(id: $id, input: $input) {
      id
      nombre
      cod_tipo_cluster
      descripcion
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

export const Success = ({ cluster }) => {
  const [updateCluster, { loading, error }] = useMutation(
    UPDATE_CLUSTER_MUTATION,
    {
      onCompleted: () => {
        toast.success('Cluster updated')
        navigate(routes.clusters())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateCluster({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Cluster {cluster?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <ClusterForm
          cluster={cluster}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
