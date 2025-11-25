import K8sEndpoint from 'src/components/K8sEndpoint/K8sEndpoint'

export const QUERY = gql`
  query FindK8sEndpointById($id: Int!) {
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
      # Traemos los clusters asociados para mostrarlos en el detalle
      clusters {
        id
        nombre
        cod_tipo_cluster
        estado
      }
    }
    # Traemos usuarios para mapear IDs a nombres
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Endpoint K8s no encontrado</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ k8SEndpoint, usuarios }) => {
  return (
    <K8sEndpoint
      k8SEndpoint={k8SEndpoint}
      usuarios={usuarios}
    />
  )
}