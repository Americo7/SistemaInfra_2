import AsignacionServidorMaquina from 'src/components/AsignacionServidorMaquina/AsignacionServidorMaquina'

export const QUERY = gql`
  query FindAsignacionServidorMaquinaById($id: Int!) {
    asignacionServidorMaquina: asignacionServidorMaquina(id: $id) {
      id
      id_servidor
      id_maquina
      id_cluster
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>AsignacionServidorMaquina not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ asignacionServidorMaquina }) => {
  return (
    <AsignacionServidorMaquina
      asignacionServidorMaquina={asignacionServidorMaquina}
    />
  )
}
