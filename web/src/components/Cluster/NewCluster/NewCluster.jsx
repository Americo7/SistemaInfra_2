import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import ClusterForm from 'src/components/Cluster/ClusterForm'

const CREATE_CLUSTER_MUTATION = gql`
  mutation CreateClusterMutation($input: CreateClusterInput!) {
    createCluster(input: $input) {
      id
    }
  }
`

const NewCluster = () => {
  const [createCluster, { loading, error }] = useMutation(
    CREATE_CLUSTER_MUTATION,
    {
      onCompleted: () => {
        toast.success('Cluster created')
        navigate(routes.clusters())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createCluster({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Cluster</h2>
      </header>
      <div className="rw-segment-main">
        <ClusterForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewCluster
