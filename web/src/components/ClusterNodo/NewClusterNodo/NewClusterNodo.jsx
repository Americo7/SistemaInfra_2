import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import ClusterNodoForm from 'src/components/ClusterNodo/ClusterNodoForm'

const CREATE_CLUSTER_NODO_MUTATION = gql`
  mutation CreateClusterNodoMutation($input: CreateClusterNodoInput!) {
    createClusterNodo(input: $input) {
      id
    }
  }
`

const NewClusterNodo = () => {
  const [createClusterNodo, { loading, error }] = useMutation(
    CREATE_CLUSTER_NODO_MUTATION,
    {
      onCompleted: () => {
        toast.success('ClusterNodo created')
        navigate(routes.clusterNodos())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createClusterNodo({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <ClusterNodoForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewClusterNodo
