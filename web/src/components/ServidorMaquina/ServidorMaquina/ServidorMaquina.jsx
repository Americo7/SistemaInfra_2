import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters'

const DELETE_SERVIDOR_MAQUINA_MUTATION = gql`
  mutation DeleteServidorMaquinaMutation($id: Int!) {
    deleteServidorMaquina(id: $id) {
      id
    }
  }
`

const ServidorMaquina = ({ servidorMaquina }) => {
  const [deleteServidorMaquina] = useMutation(
    DELETE_SERVIDOR_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('ServidorMaquina deleted')
        navigate(routes.servidorMaquinas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onDeleteClick = (id) => {
    if (
      confirm('Are you sure you want to delete servidorMaquina ' + id + '?')
    ) {
      deleteServidorMaquina({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            ServidorMaquina {servidorMaquina.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{servidorMaquina.id}</td>
            </tr>
            <tr>
              <th>Id servidor</th>
              <td>{servidorMaquina.id_servidor}</td>
            </tr>
            <tr>
              <th>Id maquina</th>
              <td>{servidorMaquina.id_maquina}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(servidorMaquina.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(servidorMaquina.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{servidorMaquina.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(servidorMaquina.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{servidorMaquina.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editServidorMaquina({ id: servidorMaquina.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(servidorMaquina.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default ServidorMaquina
