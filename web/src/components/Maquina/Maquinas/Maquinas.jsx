import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Maquina/MaquinasCell'
import { formatEnum, jsonTruncate, timeTag, truncate } from 'src/lib/formatters'

const DELETE_MAQUINA_MUTATION = gql`
  mutation DeleteMaquinaMutation($id: Int!) {
    deleteMaquina(id: $id) {
      id
    }
  }
`

const MaquinasList = ({ maquinas }) => {
  const [deleteMaquina] = useMutation(DELETE_MAQUINA_MUTATION, {
    onCompleted: () => {
      toast.success('Maquina deleted')
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
    if (confirm('Are you sure you want to delete maquina ' + id + '?')) {
      deleteMaquina({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Codigo</th>
            <th>Cod tipo maquina</th>
            <th>Nombre</th>
            <th>Ip</th>
            <th>So</th>
            <th>Ram</th>
            <th>Almacenamiento</th>
            <th>Cpu</th>
            <th>Estado</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {maquinas.map((maquina) => (
            <tr key={maquina.id}>
              <td>{truncate(maquina.id)}</td>
              <td>{truncate(maquina.codigo)}</td>
              <td>{truncate(maquina.cod_tipo_maquina)}</td>
              <td>{truncate(maquina.nombre)}</td>
              <td>{truncate(maquina.ip)}</td>
              <td>{truncate(maquina.so)}</td>
              <td>{truncate(maquina.ram)}</td>
              <td>{jsonTruncate(maquina.almacenamiento)}</td>
              <td>{truncate(maquina.cpu)}</td>
              <td>{formatEnum(maquina.estado)}</td>
              <td>{timeTag(maquina.fecha_creacion)}</td>
              <td>{truncate(maquina.usuario_creacion)}</td>
              <td>{timeTag(maquina.fecha_modificacion)}</td>
              <td>{truncate(maquina.usuario_modificacion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.maquina({ id: maquina.id })}
                    title={'Show maquina ' + maquina.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editMaquina({ id: maquina.id })}
                    title={'Edit maquina ' + maquina.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete maquina ' + maquina.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(maquina.id)}
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

export default MaquinasList
