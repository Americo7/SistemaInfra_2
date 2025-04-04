import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/DespliegueBitacora/DespliegueBitacorasCell'
import { timeTag, truncate } from 'src/lib/formatters'

const DELETE_DESPLIEGUE_BITACORA_MUTATION = gql`
  mutation DeleteDespliegueBitacoraMutation($id: Int!) {
    deleteDespliegueBitacora(id: $id) {
      id
    }
  }
`

const DespliegueBitacorasList = ({ despliegueBitacoras }) => {
  const [deleteDespliegueBitacora] = useMutation(
    DELETE_DESPLIEGUE_BITACORA_MUTATION,
    {
      onCompleted: () => {
        toast.success('DespliegueBitacora deleted')
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
      confirm('Are you sure you want to delete despliegueBitacora ' + id + '?')
    ) {
      deleteDespliegueBitacora({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Id despliegue</th>
            <th>Estado anterior</th>
            <th>Estado actual</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {despliegueBitacoras.map((despliegueBitacora) => (
            <tr key={despliegueBitacora.id}>
              <td>{truncate(despliegueBitacora.id)}</td>
              <td>{truncate(despliegueBitacora.id_despliegue)}</td>
              <td>{truncate(despliegueBitacora.estado_anterior)}</td>
              <td>{truncate(despliegueBitacora.estado_actual)}</td>
              <td>{timeTag(despliegueBitacora.fecha_creacion)}</td>
              <td>{truncate(despliegueBitacora.usuario_creacion)}</td>
              <td>{timeTag(despliegueBitacora.fecha_modificacion)}</td>
              <td>{truncate(despliegueBitacora.usuario_modificacion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.despliegueBitacora({
                      id: despliegueBitacora.id,
                    })}
                    title={
                      'Show despliegueBitacora ' +
                      despliegueBitacora.id +
                      ' detail'
                    }
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editDespliegueBitacora({
                      id: despliegueBitacora.id,
                    })}
                    title={'Edit despliegueBitacora ' + despliegueBitacora.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete despliegueBitacora ' + despliegueBitacora.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(despliegueBitacora.id)}
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

export default DespliegueBitacorasList
