import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/DataCenter/DataCentersCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters'

const DELETE_DATA_CENTER_MUTATION = gql`
  mutation DeleteDataCenterMutation($id: Int!) {
    deleteDataCenter(id: $id) {
      id
    }
  }
`

const DataCentersList = ({ dataCenters }) => {
  const [deleteDataCenter] = useMutation(DELETE_DATA_CENTER_MUTATION, {
    onCompleted: () => {
      toast.success('DataCenter deleted')
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
    if (confirm('Are you sure you want to delete dataCenter ' + id + '?')) {
      deleteDataCenter({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nombre</th>
            <th>Ubicacion</th>
            <th>Estado</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {dataCenters.map((dataCenter) => (
            <tr key={dataCenter.id}>
              <td>{truncate(dataCenter.id)}</td>
              <td>{truncate(dataCenter.nombre)}</td>
              <td>{truncate(dataCenter.ubicacion)}</td>
              <td>{formatEnum(dataCenter.estado)}</td>
              <td>{timeTag(dataCenter.fecha_creacion)}</td>
              <td>{truncate(dataCenter.usuario_creacion)}</td>
              <td>{timeTag(dataCenter.fecha_modificacion)}</td>
              <td>{truncate(dataCenter.usuario_modificacion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.dataCenter({ id: dataCenter.id })}
                    title={'Show dataCenter ' + dataCenter.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editDataCenter({ id: dataCenter.id })}
                    title={'Edit dataCenter ' + dataCenter.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete dataCenter ' + dataCenter.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(dataCenter.id)}
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

export default DataCentersList
