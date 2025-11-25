import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters'

const DELETE_PARAMETRO_MUTATION = gql`
  mutation DeleteParametroMutation($id: Int!) {
    deleteParametro(id: $id) {
      id
    }
  }
`

const Parametro = ({ parametro }) => {
  const [deleteParametro] = useMutation(DELETE_PARAMETRO_MUTATION, {
    onCompleted: () => {
      toast.success('Parametro deleted')
      navigate(routes.parametros())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete parametro ' + id + '?')) {
      deleteParametro({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Parametro {parametro.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{parametro.id}</td>
            </tr>
            <tr>
              <th>Codigo</th>
              <td>{parametro.codigo}</td>
            </tr>
            <tr>
              <th>Nombre</th>
              <td>{parametro.nombre}</td>
            </tr>
            <tr>
              <th>Grupo</th>
              <td>{parametro.grupo}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(parametro.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(parametro.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{parametro.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(parametro.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{parametro.usuario_modificacion}</td>
            </tr>
            <tr>
              <th>Descripcion</th>
              <td>{parametro.descripcion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editParametro({ id: parametro.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(parametro.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Parametro
