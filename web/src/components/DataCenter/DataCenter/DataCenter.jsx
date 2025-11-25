import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters'

const DELETE_DATA_CENTER_MUTATION = gql`
  mutation DeleteDataCenterMutation($id: Int!) {
    deleteDataCenter(id: $id) {
      id
    }
  }
`

const DataCenter = ({ dataCenter }) => {
  const [deleteDataCenter] = useMutation(DELETE_DATA_CENTER_MUTATION, {
    onCompleted: () => {
      toast.success('DataCenter deleted')
      navigate(routes.dataCenters())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete dataCenter ' + id + '?')) {
      deleteDataCenter({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            DataCenter {dataCenter.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{dataCenter.id}</td>
            </tr>
            <tr>
              <th>Nombre</th>
              <td>{dataCenter.nombre}</td>
            </tr>
            <tr>
              <th>Ubicacion</th>
              <td>{dataCenter.ubicacion}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(dataCenter.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(dataCenter.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{dataCenter.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(dataCenter.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{dataCenter.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editDataCenter({ id: dataCenter.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(dataCenter.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default DataCenter
