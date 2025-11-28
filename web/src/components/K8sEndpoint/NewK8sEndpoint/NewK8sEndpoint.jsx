import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import K8sEndpointForm from 'src/components/K8sEndpoint/K8sEndpointForm'

const CREATE_K8S_ENDPOINT_MUTATION = gql`
  mutation CreateK8sEndpointMutation($input: CreateK8sEndpointInput!) {
    createK8sEndpoint(input: $input) {
      id
    }
  }
`

const NewK8sEndpoint = () => {
  const [createK8sEndpoint, { loading, error }] = useMutation(
    CREATE_K8S_ENDPOINT_MUTATION,
    {
      onCompleted: () => {
        toast.success('Endpoint Kubernetes creado')
        navigate(routes.k8SEndpoints())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createK8sEndpoint({ variables: { input } })
  }

  return (
    <K8sEndpointForm
      onSave={onSave}
      loading={loading}
      error={error}
    />
  )
}

export default NewK8sEndpoint
