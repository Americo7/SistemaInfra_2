import { Link, routes } from '@redwoodjs/router'

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
      usuario_creacion
      fecha_modificacion
      usuario_modificacion

      # Nuevos campos
      id_proxmox_endpoint
      id_k8s_endpoint

      # Relaciones (opcionales)
      proxmox_endpoint {
        id
        nombre
      }

      k8s_endpoint {
        id
        nombre
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No clusters yet. '}
      <Link to={routes.newCluster()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ clusters }) => {
  return <Clusters clusters={clusters} />
}
