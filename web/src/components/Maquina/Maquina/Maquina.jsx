import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { formatEnum, jsonDisplay, timeTag } from 'src/lib/formatters'

const DELETE_MAQUINA_MUTATION = gql`
  mutation DeleteMaquinaMutation($id: Int!) {
    deleteMaquina(id: $id) {
      id
    }
  }
`

const Maquina = ({ maquina }) => {
  const [deleteMaquina] = useMutation(DELETE_MAQUINA_MUTATION, {
    onCompleted: () => {
      toast.success('Maquina deleted')
      navigate(routes.maquinas())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete maquina ' + id + '?')) {
      deleteMaquina({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Maquina {maquina.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{maquina.id}</td>
            </tr>
            <tr>
              <th>Codigo</th>
              <td>{maquina.codigo}</td>
            </tr>
            <tr>
              <th>Cod tipo maquina</th>
              <td>{maquina.cod_tipo_maquina}</td>
            </tr>
            <tr>
              <th>Nombre</th>
              <td>{maquina.nombre}</td>
            </tr>
            <tr>
              <th>Ip</th>
              <td>{maquina.ip}</td>
            </tr>
            <tr>
              <th>So</th>
              <td>{maquina.so}</td>
            </tr>
            <tr>
              <th>Ram</th>
              <td>{maquina.ram}</td>
            </tr>
            <tr>
              <th>Almacenamiento</th>
              <td>{jsonDisplay(maquina.almacenamiento)}</td>
            </tr>
            <tr>
              <th>Cpu</th>
              <td>{maquina.cpu}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(maquina.estado)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{timeTag(maquina.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario creacion</th>
              <td>{maquina.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha modificacion</th>
              <td>{timeTag(maquina.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario modificacion</th>
              <td>{maquina.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editMaquina({ id: maquina.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(maquina.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Maquina
