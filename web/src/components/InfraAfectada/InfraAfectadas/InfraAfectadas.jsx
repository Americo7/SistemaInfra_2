import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/InfraAfectada/InfraAfectadasCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters'

const DELETE_INFRA_AFECTADA_MUTATION = gql`
  mutation DeleteInfraAfectadaMutation($id: Int!) {
    deleteInfraAfectada(id: $id) {
      id
    }
  }
`

const InfraAfectadasList = ({ infraAfectadas }) => {
  const [deleteInfraAfectada] = useMutation(DELETE_INFRA_AFECTADA_MUTATION, {
    onCompleted: () => {
      toast.success('InfraAfectada deleted')
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
    if (confirm('Are you sure you want to delete infraAfectada ' + id + '?')) {
      deleteInfraAfectada({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Id evento</th>
            <th>Id data center</th>
            <th>Id hardware</th>
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
          {infraAfectadas.map((infraAfectada) => (
            <tr key={infraAfectada.id}>
              <td>{truncate(infraAfectada.id)}</td>
              <td>{truncate(infraAfectada.id_evento)}</td>
              <td>{truncate(infraAfectada.id_data_center)}</td>
              <td>{truncate(infraAfectada.id_hardware)}</td>
              <td>{truncate(infraAfectada.id_servidor)}</td>
              <td>{truncate(infraAfectada.id_maquina)}</td>
              <td>{formatEnum(infraAfectada.estado)}</td>
              <td>{timeTag(infraAfectada.fecha_creacion)}</td>
              <td>{truncate(infraAfectada.usuario_creacion)}</td>
              <td>{timeTag(infraAfectada.fecha_modificacion)}</td>
              <td>{truncate(infraAfectada.usuario_modificacion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.infraAfectada({ id: infraAfectada.id })}
                    title={'Show infraAfectada ' + infraAfectada.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editInfraAfectada({ id: infraAfectada.id })}
                    title={'Edit infraAfectada ' + infraAfectada.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete infraAfectada ' + infraAfectada.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(infraAfectada.id)}
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

export default InfraAfectadasList
