import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters'

const DELETE_INFRA_AFECTADA_MUTATION = gql`
  mutation DeleteInfraAfectadaMutation($id: Int!) {
    deleteInfraAfectada(id: $id) {
      id
    }
  }
`

const InfraAfectada = ({ infraAfectada }) => {
  const [deleteInfraAfectada] = useMutation(DELETE_INFRA_AFECTADA_MUTATION, {
    onCompleted: () => {
      toast.success('InfraAfectada deleted')
      navigate(routes.infraAfectadas())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete infraAfectada ' + id + '?')) {
      deleteInfraAfectada({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            InfraAfectada {infraAfectada.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{infraAfectada.id}</td>
            </tr>
            <tr>
              <th>Id evento</th>
              <td>{infraAfectada.id_evento}</td>
            </tr>
            <tr>
              <th>Id data center</th>
              <td>{infraAfectada.id_data_center}</td>
            </tr>
            <tr>
              <th>Id hardware</th>
              <td>{infraAfectada.id_hardware}</td>
            </tr>
            <tr>
              <th>Id servidor</th>
              <td>{infraAfectada.id_servidor}</td>
            </tr>
            <tr>
              <th>Id maquina</th>
              <td>{infraAfectada.id_maquina}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(infraAfectada.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(infraAfectada.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{infraAfectada.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(infraAfectada.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{infraAfectada.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editInfraAfectada({ id: infraAfectada.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(infraAfectada.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default InfraAfectada
