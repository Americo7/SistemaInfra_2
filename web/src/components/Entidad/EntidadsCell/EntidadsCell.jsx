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
      fecha_creacion
      fecha_modificacion

      creadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }
      modificadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }
    }
  }
`
export const Loading = () => <div>Cargando entidades...</div>

export const isEmpty = () => false

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ entidads }) => {
  return <Entidads entidads={entidads} />
}