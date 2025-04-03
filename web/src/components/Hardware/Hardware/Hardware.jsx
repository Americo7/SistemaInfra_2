import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters'

const DELETE_HARDWARE_MUTATION = gql`
  mutation DeleteHardwareMutation($id: Int!) {
    deleteHardware(id: $id) {
      id
    }
  }
`

const Hardware = ({ hardware }) => {
  const [deleteHardware] = useMutation(DELETE_HARDWARE_MUTATION, {
    onCompleted: () => {
      toast.success('Hardware deleted')
      navigate(routes.hardwares())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete hardware ' + id + '?')) {
      deleteHardware({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Hardware {hardware.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{hardware.id}</td>
            </tr>
            <tr>
              <th>Id data center</th>
              <td>{hardware.id_data_center}</td>
            </tr>
            <tr>
              <th>Serie</th>
              <td>{hardware.serie}</td>
            </tr>
            <tr>
              <th>Cod activo agetic</th>
              <td>{hardware.cod_activo_agetic}</td>
            </tr>
            <tr>
              <th>Cod tipo hw</th>
              <td>{hardware.cod_tipo_hw}</td>
            </tr>
            <tr>
              <th>Marca</th>
              <td>{hardware.marca}</td>
            </tr>
            <tr>
              <th>Modelo</th>
              <td>{hardware.modelo}</td>
            </tr>
            <tr>
              <th>Estado operativo</th>
              <td>{hardware.estado_operativo}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(hardware.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(hardware.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{hardware.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(hardware.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{hardware.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editHardware({ id: hardware.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(hardware.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Hardware
