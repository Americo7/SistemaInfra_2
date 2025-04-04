import { Link, routes } from '@redwoodjs/router'

import AsignacionServidorMaquinas from 'src/components/AsignacionServidorMaquina/AsignacionServidorMaquinas'

export const QUERY = gql`
  query FindAsignacionServidorMaquinas {
    asignacionServidorMaquinas {
      id
      id_servidor
      id_maquina
      id_cluster
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No asignacionServidorMaquinas yet. '}
      <Link to={routes.newAsignacionServidorMaquina()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ asignacionServidorMaquinas }) => {
  return (
    <AsignacionServidorMaquinas
      asignacionServidorMaquinas={asignacionServidorMaquinas}
    />
  )
}
