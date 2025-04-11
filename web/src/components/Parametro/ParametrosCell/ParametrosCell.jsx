import { Link, routes } from '@redwoodjs/router'

import Parametros from 'src/components/Parametro/Parametros'

export const QUERY = gql`
  query FindParametros {
    parametros {
      id
      codigo
      nombre
      grupo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      descripcion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No parametros yet. '}
      <Link to={routes.newParametro()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ parametros }) => {
  return <Parametros parametros={parametros} />
}
