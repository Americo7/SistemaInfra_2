import { Link, routes } from '@redwoodjs/router'

import Maquinas from 'src/components/Maquina/Maquinas'

export const QUERY = gql`
  query FindMaquinas {
    maquinas {
      id
      codigo
      cod_tipo_maquina
      nombre
      ip
      so
      ram
      almacenamiento
      cpu
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
      {'No maquinas yet. '}
      <Link to={routes.newMaquina()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ maquinas }) => {
  return <Maquinas maquinas={maquinas} />
}
