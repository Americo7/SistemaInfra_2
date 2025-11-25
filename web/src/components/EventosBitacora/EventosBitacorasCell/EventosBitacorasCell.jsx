import { Link, routes } from '@redwoodjs/router'

import EventosBitacoras from 'src/components/EventosBitacora/EventosBitacoras'

export const QUERY = gql`
  query FindEventosBitacoras {
    eventosBitacoras {
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

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No eventosBitacoras yet. '}
      <Link to={routes.newEventosBitacora()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ eventosBitacoras }) => {
  return <EventosBitacoras eventosBitacoras={eventosBitacoras} />
}
