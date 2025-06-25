import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters'


const DataCenter = ({ dataCenter }) => {
  

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
       
      </nav>
    </>
  )
}

export default DataCenter
