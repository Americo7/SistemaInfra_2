import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ClusterNodoForm from 'src/components/ClusterNodo/ClusterNodoForm'

export const QUERY = gql`
  query EditClusterNodoById($id: Int!) {
    clusterNodo: clusterNodo(id: $id) {
      id
      clusterId
      nombre
      nodoTipo
      maquinaId
      servidorId
      rol
      estado
      k8s_uid
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const UPDATE_CLUSTER_NODO_MUTATION = gql`
  mutation UpdateClusterNodoMutation(
    $id: Int!
    $input: UpdateClusterNodoInput!
  ) {
    updateClusterNodo(id: $id, input: $input) {
      id
      clusterId
      nombre
      nodoTipo
      maquinaId
      servidorId
      rol
      estado
      k8s_uid
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

export const Success = ({ clusterNodo }) => {
  const [updateClusterNodo, { loading, error }] = useMutation(
    UPDATE_CLUSTER_NODO_MUTATION,
    {
      onCompleted: () => {
        toast.success('ClusterNodo updated')
        navigate(routes.clusterNodos())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateClusterNodo({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit ClusterNodo {clusterNodo?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <ClusterNodoForm
          clusterNodo={clusterNodo}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}