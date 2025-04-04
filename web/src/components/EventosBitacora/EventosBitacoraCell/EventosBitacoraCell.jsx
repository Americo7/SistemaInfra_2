import EventosBitacora from 'src/components/EventosBitacora/EventosBitacora'

export const QUERY = gql`
  query FindEventosBitacoraById($id: Int!) {
    eventosBitacora: eventosBitacora(id: $id) {
      id
      id_evento
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      estado_anterior
      estado_actual
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>EventosBitacora not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ eventosBitacora }) => {
  return <EventosBitacora eventosBitacora={eventosBitacora} />
}
