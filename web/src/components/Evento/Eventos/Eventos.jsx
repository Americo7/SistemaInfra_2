import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Evento/EventosCell'
import { formatEnum, jsonTruncate, timeTag, truncate } from 'src/lib/formatters'

const DELETE_EVENTO_MUTATION = gql`
  mutation DeleteEventoMutation($id: Int!) {
    deleteEvento(id: $id) {
      id
    }
  }
`

const EventosList = ({ eventos }) => {
  const [deleteEvento] = useMutation(DELETE_EVENTO_MUTATION, {
    onCompleted: () => {
      toast.success('Evento deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete evento ' + id + '?')) {
      deleteEvento({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Cod tipo evento</th>
            <th>Descripcion</th>
            <th>Fecha evento</th>
            <th>Responsables</th>
            <th>Estado evento</th>
            <th>Respaldo</th>
            <th>Estado</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((evento) => (
            <tr key={evento.id}>
              <td>{truncate(evento.id)}</td>
              <td>{truncate(evento.cod_tipo_evento)}</td>
              <td>{truncate(evento.descripcion)}</td>
              <td>{timeTag(evento.fecha_evento)}</td>
              <td>{truncate(evento.responsables)}</td>
              <td>{truncate(evento.estado_evento)}</td>
              <td>{jsonTruncate(evento.respaldo)}</td>
              <td>{formatEnum(evento.estado)}</td>
              <td>{timeTag(evento.fecha_creacion)}</td>
              <td>{truncate(evento.usuario_creacion)}</td>
              <td>{timeTag(evento.fecha_modificacion)}</td>
              <td>{truncate(evento.usuario_modificacion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.evento({ id: evento.id })}
                    title={'Show evento ' + evento.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editEvento({ id: evento.id })}
                    title={'Edit evento ' + evento.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete evento ' + evento.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(evento.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EventosList
