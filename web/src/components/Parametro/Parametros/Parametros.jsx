import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Parametro/ParametrosCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters'

const DELETE_PARAMETRO_MUTATION = gql`
  mutation DeleteParametroMutation($id: Int!) {
    deleteParametro(id: $id) {
      id
    }
  }
`

const ParametrosList = ({ parametros }) => {
  const [deleteParametro] = useMutation(DELETE_PARAMETRO_MUTATION, {
    onCompleted: () => {
      toast.success('Parametro deleted')
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
    if (confirm('Are you sure you want to delete parametro ' + id + '?')) {
      deleteParametro({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Codigo</th>
            <th>Nombre</th>
            <th>Grupo</th>
            <th>Estado</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>Descripcion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {parametros.map((parametro) => (
            <tr key={parametro.id}>
              <td>{truncate(parametro.id)}</td>
              <td>{truncate(parametro.codigo)}</td>
              <td>{truncate(parametro.nombre)}</td>
              <td>{truncate(parametro.grupo)}</td>
              <td>{formatEnum(parametro.estado)}</td>
              <td>{timeTag(parametro.fecha_creacion)}</td>
              <td>{truncate(parametro.usuario_creacion)}</td>
              <td>{timeTag(parametro.fecha_modificacion)}</td>
              <td>{truncate(parametro.usuario_modificacion)}</td>
              <td>{truncate(parametro.descripcion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.parametro({ id: parametro.id })}
                    title={'Show parametro ' + parametro.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editParametro({ id: parametro.id })}
                    title={'Edit parametro ' + parametro.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete parametro ' + parametro.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(parametro.id)}
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

export default ParametrosList
