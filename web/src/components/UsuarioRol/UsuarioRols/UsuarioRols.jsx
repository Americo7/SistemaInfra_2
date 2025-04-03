import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/UsuarioRol/UsuarioRolsCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters'

const DELETE_USUARIO_ROL_MUTATION = gql`
  mutation DeleteUsuarioRolMutation($id: Int!) {
    deleteUsuarioRol(id: $id) {
      id
    }
  }
`

const UsuarioRolsList = ({ usuarioRols }) => {
  const [deleteUsuarioRol] = useMutation(DELETE_USUARIO_ROL_MUTATION, {
    onCompleted: () => {
      toast.success('UsuarioRol deleted')
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
    if (confirm('Are you sure you want to delete usuarioRol ' + id + '?')) {
      deleteUsuarioRol({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Id usuario</th>
            <th>Id rol</th>
            <th>Id maquina</th>
            <th>Id sistema</th>
            <th>Estado</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {usuarioRols.map((usuarioRol) => (
            <tr key={usuarioRol.id}>
              <td>{truncate(usuarioRol.id)}</td>
              <td>{truncate(usuarioRol.id_usuario)}</td>
              <td>{truncate(usuarioRol.id_rol)}</td>
              <td>{truncate(usuarioRol.id_maquina)}</td>
              <td>{truncate(usuarioRol.id_sistema)}</td>
              <td>{formatEnum(usuarioRol.estado)}</td>
              <td>{timeTag(usuarioRol.fecha_creacion)}</td>
              <td>{truncate(usuarioRol.usuario_creacion)}</td>
              <td>{timeTag(usuarioRol.fecha_modificacion)}</td>
              <td>{truncate(usuarioRol.usuario_modificacion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.usuarioRol({ id: usuarioRol.id })}
                    title={'Show usuarioRol ' + usuarioRol.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editUsuarioRol({ id: usuarioRol.id })}
                    title={'Edit usuarioRol ' + usuarioRol.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete usuarioRol ' + usuarioRol.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(usuarioRol.id)}
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

export default UsuarioRolsList
