import ProxmoxEndpoint from 'src/components/ProxmoxEndpoint/ProxmoxEndpoint'

export const QUERY = gql`
  query FindProxmoxEndpointById($id: Int!) {
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
      fecha_ultima_sync

      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion

      clusters {
        id
        nombre
      }
    }

    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const isEmpty = () => false

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ proxmoxEndpoint, usuarios }) => {
  return (
    <ProxmoxEndpoint
      proxmoxEndpoint={proxmoxEndpoint}
      usuarios={usuarios}
    />
  )
}
