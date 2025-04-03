import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Componente/ComponentesCell'
import { formatEnum, jsonTruncate, timeTag, truncate } from 'src/lib/formatters'

const DELETE_COMPONENTE_MUTATION = gql`
  mutation DeleteComponenteMutation($id: Int!) {
    deleteComponente(id: $id) {
      id
    }
  }
`

const ComponentesList = ({ componentes }) => {
  const [deleteComponente] = useMutation(DELETE_COMPONENTE_MUTATION, {
    onCompleted: () => {
      toast.success('Componente deleted')
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
    if (confirm('Are you sure you want to delete componente ' + id + '?')) {
      deleteComponente({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Id sistema</th>
            <th>Nombre</th>
            <th>Dominio</th>
            <th>Descripcion</th>
            <th>Cod entorno</th>
            <th>Cod categoria</th>
            <th>Gitlab repo</th>
            <th>Gitlab rama</th>
            <th>Tecnologia</th>
            <th>Estado</th>
            <th>Fecha creacion</th>
            <th>Usuario creacion</th>
            <th>Fecha modificacion</th>
            <th>Usuario modificacion</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {componentes.map((componente) => (
            <tr key={componente.id}>
              <td>{truncate(componente.id)}</td>
              <td>{truncate(componente.id_sistema)}</td>
              <td>{truncate(componente.nombre)}</td>
              <td>{truncate(componente.dominio)}</td>
              <td>{truncate(componente.descripcion)}</td>
              <td>{truncate(componente.cod_entorno)}</td>
              <td>{truncate(componente.cod_categoria)}</td>
              <td>{truncate(componente.gitlab_repo)}</td>
              <td>{truncate(componente.gitlab_rama)}</td>
              <td>{jsonTruncate(componente.tecnologia)}</td>
              <td>{formatEnum(componente.estado)}</td>
              <td>{timeTag(componente.fecha_creacion)}</td>
              <td>{truncate(componente.usuario_creacion)}</td>
              <td>{timeTag(componente.fecha_modificacion)}</td>
              <td>{truncate(componente.usuario_modificacion)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.componente({ id: componente.id })}
                    title={'Show componente ' + componente.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editComponente({ id: componente.id })}
                    title={'Edit componente ' + componente.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete componente ' + componente.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(componente.id)}
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

export default ComponentesList
