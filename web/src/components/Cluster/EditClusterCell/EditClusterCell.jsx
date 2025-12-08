import { navigate, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ClusterForm from 'src/components/Cluster/ClusterForm'

export const QUERY = gql`
  query EditClusterById($id: Int!) {
    # 1. Datos del Cluster
    cluster: cluster(id: $id) {
      id
      nombre
      descripcion
      cod_tipo_cluster
      identity_key
      estado
    }
  }
`

const UPDATE_CLUSTER_MUTATION = gql`
  mutation UpdateClusterMutation($id: Int!, $input: UpdateClusterInput!) {
    updateCluster(id: $id, input: $input) {
      id
      nombre
      identity_key
    }
  }
`

export const Loading = () => <div>Cargando formulario...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ cluster, parametros }) => {
  const [updateCluster, { loading, error }] = useMutation(
    UPDATE_CLUSTER_MUTATION,
    {
      onCompleted: () => {
        toast.success('Cluster actualizado correctamente')
        navigate(routes.clusters())
      },
      onError: (error) => toast.error(error.message),
    }
  )

  const onSave = (input, id) => {
    updateCluster({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        {/* Pasamos el cluster y los parámetros al formulario */}
        <ClusterForm
          cluster={cluster}
          parametros={parametros}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}