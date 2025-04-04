import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, jsonDisplay, timeTag } from 'src/lib/formatters'

const DELETE_EVENTO_MUTATION = gql`
  mutation DeleteEventoMutation($id: Int!) {
    deleteEvento(id: $id) {
      id
    }
  }
`

const Evento = ({ evento }) => {
  const [deleteEvento] = useMutation(DELETE_EVENTO_MUTATION, {
    onCompleted: () => {
      toast.success('Evento deleted')
      navigate(routes.eventos())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete evento ' + id + '?')) {
      deleteEvento({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Evento {evento.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{evento.id}</td>
            </tr>
            <tr>
              <th>Cod tipo evento</th>
              <td>{evento.cod_tipo_evento}</td>
            </tr>
            <tr>
              <th>Descripcion</th>
              <td>{evento.descripcion}</td>
            </tr>
            <tr>
              <th>Fecha evento</th>
              <td>{timeTag(evento.fecha_evento)}</td>
            </tr>
            <tr>
              <th>Responsables</th>
              <td>{evento.responsables}</td>
            </tr>
            <tr>
              <th>Estado evento</th>
              <td>{evento.estado_evento}</td>
            </tr>
            <tr>
              <th>Respaldo</th>
              <td>{jsonDisplay(evento.respaldo)}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(evento.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(evento.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{evento.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(evento.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{evento.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editEvento({ id: evento.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(evento.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Evento
