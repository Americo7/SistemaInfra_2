import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ProxmoxEndpointForm from 'src/components/ProxmoxEndpoint/ProxmoxEndpointForm'

export const QUERY = gql`
  query EditProxmoxEndpointById($id: Int!) {
    proxmoxEndpoint: proxmoxEndpoint(id: $id) {
      id
      nombre
      dominio
      ip
      puerto
      ssl
      usuario
      token_id
      token_secret
      descripcion
      estado
    }
  }
`

const UPDATE_PROXMOX_ENDPOINT_MUTATION = gql`
  mutation UpdateProxmoxEndpointMutation(
    $id: Int!
    $input: UpdateProxmoxEndpointInput!
  ) {
    updateProxmoxEndpoint(id: $id, input: $input) {
      id
      nombre
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ proxmoxEndpoint }) => {
  const [updateProxmoxEndpoint, { loading, error }] = useMutation(
    UPDATE_PROXMOX_ENDPOINT_MUTATION,
    {
      onCompleted: () => {
        toast.success('ProxmoxEndpoint actualizado')
        navigate(routes.proxmoxEndpoints())
      },
      onError: (error) => toast.error(error.message),
    }
  )

  const onSave = (input, id) => {
    input.usuario_modificacion = 1
    updateProxmoxEndpoint({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <ProxmoxEndpointForm
          proxmoxEndpoint={proxmoxEndpoint}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
