import { Link, routes } from '@redwoodjs/router'

import Sistemas from 'src/components/Sistema/Sistemas'

export const QUERY = gql`
  query FindSistemas {
    sistemas {
      id
      codigo
      sigla
      nombre
      descripcion
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

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No hay sistemas registrados'}
      <Link to={routes.newSistema()} className="rw-link">
        {'Create uno?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ sistemas }) => {
  return <Sistemas sistemas={sistemas} />
}
