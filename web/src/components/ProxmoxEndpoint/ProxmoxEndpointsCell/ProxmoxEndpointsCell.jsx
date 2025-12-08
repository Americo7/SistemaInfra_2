import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
// Importación con ruta absoluta
import ProxmoxEndpoints from 'src/components/ProxmoxEndpoint/ProxmoxEndpoints/ProxmoxEndpoints'

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
      
      # --- AUDITORÍA ---
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }

    # --- LOOKUPS ---
    # Traemos usuarios para mapear auditoría
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

export const Loading = () => <div>Cargando endpoints Proxmox...</div>

export const Empty = () => (
  <div className="rw-text-center">
    No existen endpoints registrados.{' '}
    <Link to={routes.newProxmoxEndpoint()} className="rw-link">
      Crear uno nuevo
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ proxmoxEndpoints, usuarios }) => {
  return <ProxmoxEndpoints proxmoxEndpoints={proxmoxEndpoints} usuarios={usuarios} />
}