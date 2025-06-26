import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { timeTag } from 'src/lib/formatters'


const DespliegueBitacora = ({ despliegueBitacora }) => {

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
