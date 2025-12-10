import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
// Importación con ruta absoluta
import K8sEndpoints from 'src/components/K8sEndpoint/K8sEndpoints/K8sEndpoints'

export const QUERY = gql`
  query FindK8sEndpoints {
    k8SEndpoints {
      id
      nombre
      url_api
      token_bearer
      descripcion
      fecha_ultima_sync
      estado
      
      # --- RELACIONES ---
      clusters {
        id
        nombre
      }

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

export const Loading = () => <div>Cargando endpoints Kubernetes...</div>

export const isEmpty = () => false
export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ k8SEndpoints, usuarios }) => {
  return <K8sEndpoints k8SEndpoints={k8SEndpoints} usuarios={usuarios} />
}