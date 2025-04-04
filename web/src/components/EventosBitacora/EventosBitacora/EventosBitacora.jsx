import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { timeTag } from 'src/lib/formatters'

const DELETE_EVENTOS_BITACORA_MUTATION = gql`
  mutation DeleteEventosBitacoraMutation($id: Int!) {
    deleteEventosBitacora(id: $id) {
      id
    }
  }
`

const EventosBitacora = ({ eventosBitacora }) => {
  const [deleteEventosBitacora] = useMutation(
    DELETE_EVENTOS_BITACORA_MUTATION,
    {
      onCompleted: () => {
        toast.success('EventosBitacora deleted')
        navigate(routes.eventosBitacoras())
      },
      onError: (error) => {
        toast.error(error.message)
      },
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
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            EventosBitacora {eventosBitacora.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{eventosBitacora.id}</td>
            </tr>
            <tr>
              <th>Id evento</th>
              <td>{eventosBitacora.id_evento}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(eventosBitacora.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{eventosBitacora.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(eventosBitacora.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{eventosBitacora.usuario_modificacion}</td>
            </tr>
            <tr>
              <th>Estado anterior</th>
              <td>{eventosBitacora.estado_anterior}</td>
            </tr>
            <tr>
              <th>Estado actual</th>
              <td>{eventosBitacora.estado_actual}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editEventosBitacora({ id: eventosBitacora.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(eventosBitacora.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default EventosBitacora
