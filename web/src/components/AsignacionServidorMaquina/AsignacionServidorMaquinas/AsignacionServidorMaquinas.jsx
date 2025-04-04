import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/AsignacionServidorMaquina/AsignacionServidorMaquinasCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters'

const DELETE_ASIGNACION_SERVIDOR_MAQUINA_MUTATION = gql`
  mutation DeleteAsignacionServidorMaquinaMutation($id: Int!) {
    deleteAsignacionServidorMaquina(id: $id) {
      id
    }
  }
`

const AsignacionServidorMaquinasList = ({ asignacionServidorMaquinas }) => {
  const [deleteAsignacionServidorMaquina] = useMutation(
    DELETE_ASIGNACION_SERVIDOR_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('AsignacionServidorMaquina deleted')
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
      confirm(
        'Are you sure you want to delete asignacionServidorMaquina ' + id + '?'
      )
    ) {
      deleteAsignacionServidorMaquina({ variables: { id } })
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
            <th>Id cluster</th>
            <th>Estado</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {asignacionServidorMaquinas.map((asignacionServidorMaquina) => (
            <tr key={asignacionServidorMaquina.id}>
              <td>{truncate(asignacionServidorMaquina.id)}</td>
              <td>{truncate(asignacionServidorMaquina.id_servidor)}</td>
              <td>{truncate(asignacionServidorMaquina.id_maquina)}</td>
              <td>{truncate(asignacionServidorMaquina.id_cluster)}</td>
              <td>{formatEnum(asignacionServidorMaquina.estado)}</td>
              <td>{timeTag(asignacionServidorMaquina.fecha_creacion)}</td>
              <td>{truncate(asignacionServidorMaquina.usuario_creacion)}</td>
              <td>{timeTag(asignacionServidorMaquina.fecha_modificacion)}</td>
              <td>
                {truncate(asignacionServidorMaquina.usuario_modificacion)}
              </td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.asignacionServidorMaquina({
                      id: asignacionServidorMaquina.id,
                    })}
                    title={
                      'Show asignacionServidorMaquina ' +
                      asignacionServidorMaquina.id +
                      ' detail'
                    }
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editAsignacionServidorMaquina({
                      id: asignacionServidorMaquina.id,
                    })}
                    title={
                      'Edit asignacionServidorMaquina ' +
                      asignacionServidorMaquina.id
                    }
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={
                      'Delete asignacionServidorMaquina ' +
                      asignacionServidorMaquina.id
                    }
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(asignacionServidorMaquina.id)}
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

export default AsignacionServidorMaquinasList
