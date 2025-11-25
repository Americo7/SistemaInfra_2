import { Link, routes } from '@redwoodjs/router'
import ProxmoxEndpoints from 'src/components/ProxmoxEndpoint/ProxmoxEndpoints'

export const QUERY = gql`
  query FindProxmoxEndpoints {
    proxmoxEndpoints {
      id
      nombre
      dominio
      ip
      puerto
      ssl
      usuario
      descripcion
      estado
      fecha_ultima_sync
      clusters {
        id
        nombre
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => (
  <div className="rw-text-center">
    No existen ProxmoxEndpoints.{' '}
    <Link to={routes.newProxmoxEndpoint()} className="rw-link">
      Crear uno
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ proxmoxEndpoints }) => {
  return <ProxmoxEndpoints proxmoxEndpoints={proxmoxEndpoints} />
}
