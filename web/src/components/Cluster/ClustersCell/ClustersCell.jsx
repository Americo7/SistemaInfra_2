import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
import Clusters from 'src/components/Cluster/Clusters'

export const QUERY = gql`
  query FindClusters {
    clusters {
      id
      nombre
      cod_tipo_cluster
      descripcion
      estado
      fecha_creacion
      identity_key
      fecha_modificacion
      creadoPor {
        id
        nombres 
        primer_apellido
        segundo_apellido
      }
      modificadoPor {
        id
        nombres 
        primer_apellido
        segundo_apellido
      }
      tipoClusterInfo {
        codigo
        nombre 
      }
      
      proxmox_endpoint {
        nombre
      }
      k8s_endpoint {
        nombre
      }
    }
  }
`

export const Loading = () => <div>Cargando clusters...</div>

export const Empty = () => (
  <div className="rw-text-center">
    {'No existen clusters registrados. '}
    <Link to={routes.newCluster()} className="rw-link">
      {'Crear uno nuevo'}
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

// Ya no recibimos 'parametros', solo 'clusters'
export const Success = ({ clusters }) => {
  return <Clusters clusters={clusters} />
}