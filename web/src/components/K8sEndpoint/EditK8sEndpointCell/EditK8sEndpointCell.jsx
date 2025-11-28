import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import K8sEndpointForm from 'src/components/K8sEndpoint/K8sEndpointForm'

export const QUERY = gql`
  query EditK8sEndpointById($id: Int!) {
    k8SEndpoint: k8SEndpoint(id: $id) {
      id
      nombre
      url_api
      token_bearer
      descripcion
      fecha_ultima_sync
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const UPDATE_K8S_ENDPOINT_MUTATION = gql`
  mutation UpdateK8sEndpointMutation(
    $id: Int!
    $input: UpdateK8sEndpointInput!
  ) {
    updateK8sEndpoint(id: $id, input: $input) {
      id
      nombre
      url_api
      token_bearer
      descripcion
      fecha_ultima_sync
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

export const Success = ({ k8SEndpoint }) => {
  const [updateK8sEndpoint, { loading, error }] = useMutation(
    UPDATE_K8S_ENDPOINT_MUTATION,
    {
      onCompleted: () => {
        toast.success('Endpoint K8s actualizado')
        navigate(routes.k8SEndpoints())
      },
      onError: (error) => toast.error(error.message),
    }
  )

  const onSave = (input, id) => {
    // Si necesitas asignar el usuario logueado, hazlo aquí o en el componente Form
    // input.usuario_modificacion = 1
    updateK8sEndpoint({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <K8sEndpointForm
          k8SEndpoint={k8SEndpoint}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}