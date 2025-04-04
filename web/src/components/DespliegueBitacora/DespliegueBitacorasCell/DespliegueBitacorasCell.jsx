import { Link, routes } from '@redwoodjs/router'

import DespliegueBitacoras from 'src/components/DespliegueBitacora/DespliegueBitacoras'

export const QUERY = gql`
  query FindDespliegueBitacoras {
    despliegueBitacoras {
      id
      id_despliegue
      estado_anterior
      estado_actual
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
      {'No despliegueBitacoras yet. '}
      <Link to={routes.newDespliegueBitacora()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ despliegueBitacoras }) => {
  return <DespliegueBitacoras despliegueBitacoras={despliegueBitacoras} />
}
