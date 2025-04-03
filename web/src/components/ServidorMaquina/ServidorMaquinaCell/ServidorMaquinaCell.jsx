import ServidorMaquina from 'src/components/ServidorMaquina/ServidorMaquina'

export const QUERY = gql`
  query FindServidorMaquinaById($id: Int!) {
    servidorMaquina: servidorMaquina(id: $id) {
      id
      id_servidor
      id_maquina
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>ServidorMaquina not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ servidorMaquina }) => {
  return <ServidorMaquina servidorMaquina={servidorMaquina} />
}
