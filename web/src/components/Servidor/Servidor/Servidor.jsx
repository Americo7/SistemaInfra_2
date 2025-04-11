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
            <tr><th>ID</th><td>{servidor.id}</td></tr>
            <tr><th>Código Inventario AGETIC</th><td>{servidor.cod_inventario_agetic}</td></tr>
            <tr><th>Nombre</th><td>{servidor.nombre}</td></tr>
            <tr><th>RAM (GB)</th><td>{servidor.ram}</td></tr>
            <tr><th>Almacenamiento (GB)</th><td>{servidor.almacenamiento}</td></tr>
            <tr><th>Estado Operativo</th><td>{servidor.estado_operativo}</td></tr>
            <tr><th>Estado</th><td>{formatEnum(servidor.estado)}</td></tr>
            <tr><th>Data Center</th><td>{servidor.data_centers?.nombre || servidor.id_data_center}</td></tr>
            <tr><th>Servidor Padre</th><td>{servidor.servidores?.serie || servidor.id_padre}</td></tr>
            <tr><th>Serie</th><td>{servidor.serie}</td></tr>
            <tr><th>Tipo de Servidor</th><td>{servidor.cod_tipo_servidor}</td></tr>
            <tr><th>Marca</th><td>{servidor.marca}</td></tr>
            <tr><th>Modelo</th><td>{servidor.modelo}</td></tr>

            {/* 🔽 Datos de auditoría al final */}
            <tr><th>Fecha de Creación</th><td>{timeTag(servidor.fecha_creacion)}</td></tr>
            <tr><th>Usuario de Creación</th><td>{servidor.usuario_creacion}</td></tr>
            <tr><th>Fecha de Modificación</th><td>{timeTag(servidor.fecha_modificacion)}</td></tr>
            <tr><th>Usuario de Modificación</th><td>{servidor.usuario_modificacion}</td></tr>
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
