import Evento from 'src/components/Evento/Evento'

export const QUERY = gql`
  query FindEventoById($id: Int!) {
    evento: evento(id: $id) {
      id
      cod_tipo_evento
      descripcion
      fecha_evento
      responsables
      estado_evento
      respaldo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Evento not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ evento }) => {
  return <Evento evento={evento} />
}
