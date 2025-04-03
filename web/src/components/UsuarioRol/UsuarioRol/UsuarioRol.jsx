import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters'

const DELETE_USUARIO_ROL_MUTATION = gql`
  mutation DeleteUsuarioRolMutation($id: Int!) {
    deleteUsuarioRol(id: $id) {
      id
    }
  }
`

const UsuarioRol = ({ usuarioRol }) => {
  const [deleteUsuarioRol] = useMutation(DELETE_USUARIO_ROL_MUTATION, {
    onCompleted: () => {
      toast.success('UsuarioRol deleted')
      navigate(routes.usuarioRols())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete usuarioRol ' + id + '?')) {
      deleteUsuarioRol({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            UsuarioRol {usuarioRol.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{usuarioRol.id}</td>
            </tr>
            <tr>
              <th>Id usuario</th>
              <td>{usuarioRol.id_usuario}</td>
            </tr>
            <tr>
              <th>Id rol</th>
              <td>{usuarioRol.id_rol}</td>
            </tr>
            <tr>
              <th>Id maquina</th>
              <td>{usuarioRol.id_maquina}</td>
            </tr>
            <tr>
              <th>Id sistema</th>
              <td>{usuarioRol.id_sistema}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(usuarioRol.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(usuarioRol.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{usuarioRol.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(usuarioRol.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{usuarioRol.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editUsuarioRol({ id: usuarioRol.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(usuarioRol.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default UsuarioRol
