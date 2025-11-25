import { Link, routes } from '@redwoodjs/router'

import ClusterNodos from 'src/components/ClusterNodo/ClusterNodos'

export const QUERY = gql`
  query FindClusterNodos {
    clusterNodos {
      id
      clusterId
      nombre
      nodoTipo
      maquinaId
      servidorId
      rol
      estado
      k8s_uid
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      cluster {
        nombre
      }
      maquina {
        nombre
      }
      servidor {
        nombre
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No clusterNodos yet.{' '}
      <Link to={routes.newClusterNodo()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ clusterNodos }) => {
  return <ClusterNodos clusterNodos={clusterNodos} />
}