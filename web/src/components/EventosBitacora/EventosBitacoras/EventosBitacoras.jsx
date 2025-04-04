import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/EventosBitacora/EventosBitacorasCell'
import { timeTag, truncate } from 'src/lib/formatters'

const DELETE_EVENTOS_BITACORA_MUTATION = gql`
  mutation DeleteEventosBitacoraMutation($id: Int!) {
    deleteEventosBitacora(id: $id) {
      id
    }
  }
`

const EventosBitacorasList = ({ eventosBitacoras }) => {
  const [deleteEventosBitacora] = useMutation(
    DELETE_EVENTOS_BITACORA_MUTATION,
    {
      onCompleted: () => {
        toast.success('EventosBitacora deleted')
      },
      onError: (error) => {
        toast.error(error.message)
      },
      // This refetches the query on the list page. Read more about other ways to
      // update the cache over here:
      // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
      refetchQueries: [{ query: QUERY }],
      awaitRefetchQueries: true,
    }
  )

  const onDeleteClick = (id) => {
    if (
      confirm('Are you sure you want to delete eventosBitacora ' + id + '?')
    ) {
      deleteEventosBitacora({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Id evento</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>Estado anterior</th>
            <th>Estado actual</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {eventosBitacoras.map((eventosBitacora) => (
            <tr key={eventosBitacora.id}>
              <td>{truncate(eventosBitacora.id)}</td>
              <td>{truncate(eventosBitacora.id_evento)}</td>
              <td>{timeTag(eventosBitacora.fecha_creacion)}</td>
              <td>{truncate(eventosBitacora.usuario_creacion)}</td>
              <td>{timeTag(eventosBitacora.fecha_modificacion)}</td>
              <td>{truncate(eventosBitacora.usuario_modificacion)}</td>
              <td>{truncate(eventosBitacora.estado_anterior)}</td>
              <td>{truncate(eventosBitacora.estado_actual)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.eventosBitacora({ id: eventosBitacora.id })}
                    title={
                      'Show eventosBitacora ' + eventosBitacora.id + ' detail'
                    }
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editEventosBitacora({ id: eventosBitacora.id })}
                    title={'Edit eventosBitacora ' + eventosBitacora.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete eventosBitacora ' + eventosBitacora.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(eventosBitacora.id)}
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

export default EventosBitacorasList
