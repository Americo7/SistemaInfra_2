import { Link, routes } from '@redwoodjs/router'

import Entidads from 'src/components/Entidad/Entidads'

export const QUERY = gql`
  query FindEntidads {
    entidads {
      id
      codigo
      sigla
      nombre
      estado
      creadoPor {
        id
        nombres
        primer_apellido
      }
      modificadoPor {
        id
        nombres
        primer_apellido
      }
    }
  }
`
export const Loading = () => <div>Cargando entidades...</div>

export const Empty = () => (
  <div className="rw-text-center">
    No existen entidades registradas.{' '}
    <Link to={routes.newEntidad()} className="rw-link">
      Crear una nueva
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ entidads }) => {
  return <Entidads entidads={entidads} />
}