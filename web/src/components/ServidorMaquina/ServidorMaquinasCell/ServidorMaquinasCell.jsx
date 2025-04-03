import { Link, routes } from '@redwoodjs/router'

import ServidorMaquinas from 'src/components/ServidorMaquina/ServidorMaquinas'

export const QUERY = gql`
  query FindServidorMaquinas {
    servidorMaquinas {
      id
      id_servidor
      id_maquina
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
      {'No servidorMaquinas yet. '}
      <Link to={routes.newServidorMaquina()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ servidorMaquinas }) => {
  return <ServidorMaquinas servidorMaquinas={servidorMaquinas} />
}
