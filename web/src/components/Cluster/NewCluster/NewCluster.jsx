import { navigate, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
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
        toast.success('Cluster creado exitosamente')
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
      <div className="rw-segment-main">
        {/* IMPORTANTE: No pasamos props de datos (endpoints/parámetros) 
           porque ClusterForm ya usa useQuery internamente para obtenerlos.
        */}
        <ClusterForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

// ESTA LÍNEA ES LA QUE TE FALTA Y CAUSA EL ERROR
export default NewCluster