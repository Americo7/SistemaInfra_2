import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/ServidorMaquina/ServidorMaquinasCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters'

const DELETE_SERVIDOR_MAQUINA_MUTATION = gql`
  mutation DeleteServidorMaquinaMutation($id: Int!) {
    deleteServidorMaquina(id: $id) {
      id
    }
  }
`

const ServidorMaquinasList = ({ servidorMaquinas }) => {
  const [deleteServidorMaquina] = useMutation(
    DELETE_SERVIDOR_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('ServidorMaquina deleted')
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
      confirm('Are you sure you want to delete servidorMaquina ' + id + '?')
    ) {
      deleteServidorMaquina({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Id servidor</th>
            <th>Id maquina</th>
            <th>Estado</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {servidorMaquinas.map((servidorMaquina) => (
            <tr key={servidorMaquina.id}>
              <td>{truncate(servidorMaquina.id)}</td>
              <td>{truncate(servidorMaquina.id_servidor)}</td>
              <td>{truncate(servidorMaquina.id_maquina)}</td>
              <td>{formatEnum(servidorMaquina.estado)}</td>
              <td>{timeTag(servidorMaquina.fecha_creacion)}</td>
              <td>{truncate(servidorMaquina.usuario_creacion)}</td>
              <td>{timeTag(servidorMaquina.fecha_modificacion)}</td>
              <td>{truncate(servidorMaquina.usuario_modificacion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.servidorMaquina({ id: servidorMaquina.id })}
                    title={
                      'Show servidorMaquina ' + servidorMaquina.id + ' detail'
                    }
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editServidorMaquina({ id: servidorMaquina.id })}
                    title={'Edit servidorMaquina ' + servidorMaquina.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete servidorMaquina ' + servidorMaquina.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(servidorMaquina.id)}
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

export default ServidorMaquinasList
