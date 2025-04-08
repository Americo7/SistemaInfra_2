import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters'

const DELETE_USUARIO_MUTATION = gql`
  mutation DeleteUsuarioMutation($id: Int!) {
    deleteUsuario(id: $id) {
      id
    }
  }
`

const Usuario = ({ usuario }) => {
  const [deleteUsuario] = useMutation(DELETE_USUARIO_MUTATION, {
    onCompleted: () => {
      toast.success('Usuario deleted')
      navigate(routes.usuarios())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete usuario ' + id + '?')) {
      deleteUsuario({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Usuario {usuario.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{usuario.id}</td>
            </tr>
            <tr>
              <th>Id ciudadano digital</th>
              <td>{usuario.id_ciudadano_digital}</td>
            </tr>
            <tr>
              <th>Nombre usuario</th>
              <td>{usuario.nombre_usuario}</td>
            </tr>
            <tr>
              <th>Contrasena</th>
              <td>{usuario.contrasena}</td>
            </tr>
            <tr>
              <th>Nro documento</th>
              <td>{usuario.nro_documento}</td>
            </tr>
            <tr>
              <th>Nombres</th>
              <td>{usuario.nombres}</td>
            </tr>
            <tr>
              <th>Primer apellido</th>
              <td>{usuario.primer_apellido}</td>
            </tr>
            <tr>
              <th>Segundo apellido</th>
              <td>{usuario.segundo_apellido}</td>
            </tr>
            <tr>
              <th>Celular</th>
              <td>{usuario.celular}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{usuario.email}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(usuario.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(usuario.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{usuario.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(usuario.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{usuario.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editUsuario({ id: usuario.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(usuario.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Usuario
