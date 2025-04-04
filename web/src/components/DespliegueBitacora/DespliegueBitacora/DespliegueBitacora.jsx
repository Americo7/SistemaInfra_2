import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { timeTag } from 'src/lib/formatters'

const DELETE_DESPLIEGUE_BITACORA_MUTATION = gql`
  mutation DeleteDespliegueBitacoraMutation($id: Int!) {
    deleteDespliegueBitacora(id: $id) {
      id
    }
  }
`

const DespliegueBitacora = ({ despliegueBitacora }) => {
  const [deleteDespliegueBitacora] = useMutation(
    DELETE_DESPLIEGUE_BITACORA_MUTATION,
    {
      onCompleted: () => {
        toast.success('DespliegueBitacora deleted')
        navigate(routes.despliegueBitacoras())
      },
      onError: (error) => {
        toast.error(error.message)
      },
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
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            DespliegueBitacora {despliegueBitacora.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{despliegueBitacora.id}</td>
            </tr>
            <tr>
              <th>Id despliegue</th>
              <td>{despliegueBitacora.id_despliegue}</td>
            </tr>
            <tr>
              <th>Estado anterior</th>
              <td>{despliegueBitacora.estado_anterior}</td>
            </tr>
            <tr>
              <th>Estado actual</th>
              <td>{despliegueBitacora.estado_actual}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(despliegueBitacora.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{despliegueBitacora.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(despliegueBitacora.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{despliegueBitacora.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editDespliegueBitacora({ id: despliegueBitacora.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(despliegueBitacora.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default DespliegueBitacora
