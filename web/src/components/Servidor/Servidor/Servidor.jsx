import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters'

const DELETE_SERVIDOR_MUTATION = gql`
  mutation DeleteServidorMutation($id: Int!) {
    deleteServidor(id: $id) {
      id
    }
  }
`

const Servidor = ({ servidor }) => {
  const [deleteServidor] = useMutation(DELETE_SERVIDOR_MUTATION, {
    onCompleted: () => {
      toast.success('Servidor deleted')
      navigate(routes.servidors())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete servidor ' + id + '?')) {
      deleteServidor({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Servidor {servidor.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{servidor.id}</td>
            </tr>
            <tr>
              <th>Id hardware</th>
              <td>{servidor.id_hardware}</td>
            </tr>
            <tr>
              <th>Serie servidor</th>
              <td>{servidor.serie_servidor}</td>
            </tr>
            <tr>
              <th>Cod inventario agetic</th>
              <td>{servidor.cod_inventario_agetic}</td>
            </tr>
            <tr>
              <th>Chasis</th>
              <td>{servidor.chasis}</td>
            </tr>
            <tr>
              <th>Cuchilla</th>
              <td>{servidor.cuchilla}</td>
            </tr>
            <tr>
              <th>Ram</th>
              <td>{servidor.ram}</td>
            </tr>
            <tr>
              <th>Almacenamiento</th>
              <td>{servidor.almacenamiento}</td>
            </tr>
            <tr>
              <th>Estado operativo</th>
              <td>{servidor.estado_operativo}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(servidor.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(servidor.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{servidor.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(servidor.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{servidor.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editServidor({ id: servidor.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(servidor.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Servidor
