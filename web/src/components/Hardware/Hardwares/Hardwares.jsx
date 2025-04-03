import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Hardware/HardwaresCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters'

const DELETE_HARDWARE_MUTATION = gql`
  mutation DeleteHardwareMutation($id: Int!) {
    deleteHardware(id: $id) {
      id
    }
  }
`

const HardwaresList = ({ hardwares }) => {
  const [deleteHardware] = useMutation(DELETE_HARDWARE_MUTATION, {
    onCompleted: () => {
      toast.success('Hardware deleted')
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
    if (confirm('Are you sure you want to delete hardware ' + id + '?')) {
      deleteHardware({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Id data center</th>
            <th>Serie</th>
            <th>Cod activo agetic</th>
            <th>Cod tipo hw</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Estado operativo</th>
            <th>Estado</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {hardwares.map((hardware) => (
            <tr key={hardware.id}>
              <td>{truncate(hardware.id)}</td>
              <td>{truncate(hardware.id_data_center)}</td>
              <td>{truncate(hardware.serie)}</td>
              <td>{truncate(hardware.cod_activo_agetic)}</td>
              <td>{truncate(hardware.cod_tipo_hw)}</td>
              <td>{truncate(hardware.marca)}</td>
              <td>{truncate(hardware.modelo)}</td>
              <td>{truncate(hardware.estado_operativo)}</td>
              <td>{formatEnum(hardware.estado)}</td>
              <td>{timeTag(hardware.fecha_creacion)}</td>
              <td>{truncate(hardware.usuario_creacion)}</td>
              <td>{timeTag(hardware.fecha_modificacion)}</td>
              <td>{truncate(hardware.usuario_modificacion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.hardware({ id: hardware.id })}
                    title={'Show hardware ' + hardware.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editHardware({ id: hardware.id })}
                    title={'Edit hardware ' + hardware.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete hardware ' + hardware.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(hardware.id)}
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

export default HardwaresList
