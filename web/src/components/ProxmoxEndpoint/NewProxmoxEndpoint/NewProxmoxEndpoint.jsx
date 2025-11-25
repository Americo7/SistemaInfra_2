import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import ProxmoxEndpointForm from 'src/components/ProxmoxEndpoint/ProxmoxEndpointForm'

const CREATE_PROXMOX_ENDPOINT_MUTATION = gql`
  mutation CreateProxmoxEndpointMutation($input: CreateProxmoxEndpointInput!) {
    createProxmoxEndpoint(input: $input) {
      id
    }
  }
`

const NewProxmoxEndpoint = () => {
  const [createProxmoxEndpoint, { loading, error }] = useMutation(
    CREATE_PROXMOX_ENDPOINT_MUTATION,
    {
      onCompleted: () => {
        toast.success('ProxmoxEndpoint created')
        navigate(routes.proxmoxEndpoints())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createProxmoxEndpoint({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <ProxmoxEndpointForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewProxmoxEndpoint
