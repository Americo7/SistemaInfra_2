import Cluster from 'src/components/Cluster/Cluster'

export const QUERY = gql`
  query FindClusterById($id: Int!) {
    cluster: cluster(id: $id) {
      id
      nombre
      cod_tipo_cluster
      descripcion
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Cluster not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ cluster }) => {
  return <Cluster cluster={cluster} />
}
