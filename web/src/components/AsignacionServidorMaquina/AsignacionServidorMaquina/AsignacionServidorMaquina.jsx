import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters'

const DELETE_ASIGNACION_SERVIDOR_MAQUINA_MUTATION = gql`
  mutation DeleteAsignacionServidorMaquinaMutation($id: Int!) {
    deleteAsignacionServidorMaquina(id: $id) {
      id
    }
  }
`

const AsignacionServidorMaquina = ({ asignacionServidorMaquina }) => {
  const [deleteAsignacionServidorMaquina] = useMutation(
    DELETE_ASIGNACION_SERVIDOR_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('AsignacionServidorMaquina deleted')
        navigate(routes.asignacionServidorMaquinas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
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
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            AsignacionServidorMaquina {asignacionServidorMaquina.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{asignacionServidorMaquina.id}</td>
            </tr>
            <tr>
              <th>Id servidor</th>
              <td>{asignacionServidorMaquina.id_servidor}</td>
            </tr>
            <tr>
              <th>Id maquina</th>
              <td>{asignacionServidorMaquina.id_maquina}</td>
            </tr>
            <tr>
              <th>Id cluster</th>
              <td>{asignacionServidorMaquina.id_cluster}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(asignacionServidorMaquina.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(asignacionServidorMaquina.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{asignacionServidorMaquina.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(asignacionServidorMaquina.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{asignacionServidorMaquina.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editAsignacionServidorMaquina({
            id: asignacionServidorMaquina.id,
          })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(asignacionServidorMaquina.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default AsignacionServidorMaquina
